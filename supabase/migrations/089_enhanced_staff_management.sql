-- =====================================================
-- Migration: 089_enhanced_staff_management
-- Purpose: Enhanced staff scheduling and activity assignments
-- Date: 2025-12-10
-- =====================================================

-- =====================================================
-- 1. ADD NEW COLUMNS TO staff_profiles
-- =====================================================

-- Add permission columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff_profiles' AND column_name = 'permissions') THEN
    ALTER TABLE staff_profiles ADD COLUMN permissions JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff_profiles' AND column_name = 'can_create_staff') THEN
    ALTER TABLE staff_profiles ADD COLUMN can_create_staff BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff_profiles' AND column_name = 'max_role_can_assign') THEN
    ALTER TABLE staff_profiles ADD COLUMN max_role_can_assign VARCHAR(50) DEFAULT 'staff';
  END IF;
END$$;

-- =====================================================
-- 2. STAFF ASSIGNMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Assignment type
  assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN ('activity', 'venue', 'schedule')),
  
  -- Foreign keys (nullable based on type)
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  
  -- Schedule pattern for recurring assignments
  schedule_pattern JSONB DEFAULT '{
    "days": [1, 2, 3, 4, 5],
    "startTime": "09:00",
    "endTime": "17:00",
    "timezone": "America/New_York"
  }'::jsonb,
  
  -- Date range
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- Priority and flags
  is_primary BOOLEAN DEFAULT false,
  priority INT DEFAULT 0,
  
  -- Audit
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_assignments_staff ON staff_assignments(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_org ON staff_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_activity ON staff_assignments(activity_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_venue ON staff_assignments(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_type ON staff_assignments(assignment_type);
CREATE INDEX IF NOT EXISTS idx_staff_assignments_dates ON staff_assignments(start_date, end_date);

-- =====================================================
-- 3. STAFF SHIFTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES staff_assignments(id) ON DELETE SET NULL,
  
  -- Shift details
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INT DEFAULT 0,
  
  -- Status
  status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
  )),
  
  -- Swap handling
  swap_requested BOOLEAN DEFAULT false,
  swap_requested_with UUID REFERENCES staff_profiles(id),
  swap_approved_by UUID REFERENCES users(id),
  swap_approved_at TIMESTAMPTZ,
  
  -- Activity/booking context
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  booking_ids UUID[] DEFAULT '{}',
  
  -- Notes
  notes TEXT,
  
  -- Audit
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_shifts_staff ON staff_shifts(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_org ON staff_shifts(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_date ON staff_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_status ON staff_shifts(status);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_assignment ON staff_shifts(assignment_id);

-- =====================================================
-- 4. STAFF AVAILABILITY TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Day and time
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Availability status
  is_available BOOLEAN DEFAULT true,
  preference VARCHAR(30) DEFAULT 'available' CHECK (preference IN (
    'preferred', 'available', 'if_needed', 'unavailable'
  )),
  
  -- Effective dates (for recurring patterns)
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate entries for same staff/day/time
  UNIQUE(staff_profile_id, day_of_week, start_time, end_time, effective_from)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_availability_staff ON staff_availability(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_availability_org ON staff_availability(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_availability_day ON staff_availability(day_of_week);

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

CREATE TRIGGER update_staff_assignments_updated_at
  BEFORE UPDATE ON staff_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_shifts_updated_at
  BEFORE UPDATE ON staff_shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_availability_updated_at
  BEFORE UPDATE ON staff_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

ALTER TABLE staff_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;

-- Staff Assignments: Platform admins see all
CREATE POLICY "Platform admins manage all assignments"
  ON staff_assignments FOR ALL
  USING (is_platform_admin());

-- Staff Assignments: Org members can view
CREATE POLICY "Org members view assignments"
  ON staff_assignments FOR SELECT
  USING (organization_id = get_my_organization_id_safe());

-- Staff Assignments: Org admins can manage
CREATE POLICY "Org admins manage assignments"
  ON staff_assignments FOR ALL
  USING (
    organization_id = get_my_organization_id_safe()
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super-admin', 'org-admin', 'admin')
    )
  );

-- Staff Shifts: Platform admins see all
CREATE POLICY "Platform admins manage all shifts"
  ON staff_shifts FOR ALL
  USING (is_platform_admin());

-- Staff Shifts: Org members can view
CREATE POLICY "Org members view shifts"
  ON staff_shifts FOR SELECT
  USING (organization_id = get_my_organization_id_safe());

-- Staff Shifts: Own shifts - full access
CREATE POLICY "Staff manage own shifts"
  ON staff_shifts FOR ALL
  USING (
    staff_profile_id IN (
      SELECT id FROM staff_profiles WHERE user_id = auth.uid()
    )
  );

-- Staff Shifts: Org admins can manage
CREATE POLICY "Org admins manage shifts"
  ON staff_shifts FOR ALL
  USING (
    organization_id = get_my_organization_id_safe()
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super-admin', 'org-admin', 'admin', 'manager')
    )
  );

-- Staff Availability: Platform admins see all
CREATE POLICY "Platform admins manage all availability"
  ON staff_availability FOR ALL
  USING (is_platform_admin());

-- Staff Availability: Own availability
CREATE POLICY "Staff manage own availability"
  ON staff_availability FOR ALL
  USING (
    staff_profile_id IN (
      SELECT id FROM staff_profiles WHERE user_id = auth.uid()
    )
  );

-- Staff Availability: Org members can view
CREATE POLICY "Org members view availability"
  ON staff_availability FOR SELECT
  USING (organization_id = get_my_organization_id_safe());

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Get staff assignments with details
CREATE OR REPLACE FUNCTION get_staff_assignments(
  p_staff_profile_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_assignment_type VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  staff_profile_id UUID,
  organization_id UUID,
  assignment_type VARCHAR,
  activity_id UUID,
  activity_name VARCHAR,
  venue_id UUID,
  venue_name VARCHAR,
  schedule_pattern JSONB,
  start_date DATE,
  end_date DATE,
  is_primary BOOLEAN,
  priority INT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sa.id,
    sa.staff_profile_id,
    sa.organization_id,
    sa.assignment_type::VARCHAR,
    sa.activity_id,
    a.name::VARCHAR as activity_name,
    sa.venue_id,
    v.name::VARCHAR as venue_name,
    sa.schedule_pattern,
    sa.start_date,
    sa.end_date,
    sa.is_primary,
    sa.priority,
    sa.created_at
  FROM staff_assignments sa
  LEFT JOIN activities a ON a.id = sa.activity_id
  LEFT JOIN venues v ON v.id = sa.venue_id
  WHERE
    (p_staff_profile_id IS NULL OR sa.staff_profile_id = p_staff_profile_id)
    AND (p_organization_id IS NULL OR sa.organization_id = p_organization_id)
    AND (p_assignment_type IS NULL OR sa.assignment_type = p_assignment_type)
  ORDER BY sa.is_primary DESC, sa.priority DESC, sa.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get staff shifts for a date range
CREATE OR REPLACE FUNCTION get_staff_shifts(
  p_organization_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_staff_profile_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  staff_profile_id UUID,
  staff_name VARCHAR,
  shift_date DATE,
  start_time TIME,
  end_time TIME,
  break_minutes INT,
  status VARCHAR,
  activity_id UUID,
  activity_name VARCHAR,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.id,
    ss.staff_profile_id,
    u.full_name::VARCHAR as staff_name,
    ss.shift_date,
    ss.start_time,
    ss.end_time,
    ss.break_minutes,
    ss.status::VARCHAR,
    ss.activity_id,
    a.name::VARCHAR as activity_name,
    ss.notes
  FROM staff_shifts ss
  JOIN staff_profiles sp ON sp.id = ss.staff_profile_id
  JOIN users u ON u.id = sp.user_id
  LEFT JOIN activities a ON a.id = ss.activity_id
  WHERE
    ss.organization_id = p_organization_id
    AND ss.shift_date BETWEEN p_start_date AND p_end_date
    AND (p_staff_profile_id IS NULL OR ss.staff_profile_id = p_staff_profile_id)
  ORDER BY ss.shift_date, ss.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get available staff for a specific time
CREATE OR REPLACE FUNCTION get_available_staff(
  p_organization_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_activity_id UUID DEFAULT NULL
)
RETURNS TABLE (
  staff_profile_id UUID,
  user_id UUID,
  full_name VARCHAR,
  role VARCHAR,
  is_available BOOLEAN,
  preference VARCHAR,
  has_conflict BOOLEAN
) AS $$
DECLARE
  v_day_of_week INT := EXTRACT(DOW FROM p_date)::INT;
BEGIN
  RETURN QUERY
  SELECT
    sp.id as staff_profile_id,
    u.id as user_id,
    u.full_name,
    u.role::VARCHAR,
    COALESCE(sa.is_available, true) as is_available,
    COALESCE(sa.preference, 'available')::VARCHAR as preference,
    EXISTS (
      SELECT 1 FROM staff_shifts ss
      WHERE ss.staff_profile_id = sp.id
      AND ss.shift_date = p_date
      AND ss.status NOT IN ('cancelled')
      AND (ss.start_time, ss.end_time) OVERLAPS (p_start_time, p_end_time)
    ) as has_conflict
  FROM staff_profiles sp
  JOIN users u ON u.id = sp.user_id
  LEFT JOIN staff_availability sa ON sa.staff_profile_id = sp.id
    AND sa.day_of_week = v_day_of_week
    AND sa.start_time <= p_start_time
    AND sa.end_time >= p_end_time
    AND (sa.effective_until IS NULL OR sa.effective_until >= p_date)
  WHERE
    sp.organization_id = p_organization_id
    AND u.is_active = true
    AND (
      p_activity_id IS NULL 
      OR p_activity_id = ANY(sp.assigned_activities)
      OR array_length(sp.assigned_activities, 1) IS NULL
    )
  ORDER BY 
    COALESCE(sa.preference, 'available') = 'preferred' DESC,
    u.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check staff permission to create
CREATE OR REPLACE FUNCTION can_create_staff(
  p_user_id UUID,
  p_target_role VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_role VARCHAR;
  v_role_hierarchy JSONB := '{
    "system-admin": 0,
    "super-admin": 1,
    "org-admin": 2,
    "admin": 3,
    "manager": 4,
    "staff": 5
  }'::jsonb;
BEGIN
  SELECT role INTO v_user_role FROM users WHERE id = p_user_id;
  
  IF v_user_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- System admins can create any role
  IF v_user_role = 'system-admin' THEN
    RETURN true;
  END IF;
  
  -- Check role hierarchy
  RETURN (v_role_hierarchy->>v_user_role)::int < (v_role_hierarchy->>p_target_role)::int;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_staff_assignments(UUID, UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_staff_shifts(UUID, DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_staff(UUID, DATE, TIME, TIME, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_staff(UUID, VARCHAR) TO authenticated;

-- =====================================================
-- 8. ENABLE REAL-TIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE staff_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE staff_shifts;
ALTER PUBLICATION supabase_realtime ADD TABLE staff_availability;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 089 complete:';
  RAISE NOTICE '- staff_profiles enhanced with permissions columns';
  RAISE NOTICE '- staff_assignments table created';
  RAISE NOTICE '- staff_shifts table created';
  RAISE NOTICE '- staff_availability table created';
  RAISE NOTICE '- RLS policies configured';
  RAISE NOTICE '- Helper functions created';
  RAISE NOTICE '- Real-time enabled';
END$$;
