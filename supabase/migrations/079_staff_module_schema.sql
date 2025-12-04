-- =====================================================
-- Migration: 079_staff_module_schema
-- Purpose: Enhanced staff management with proper RLS and views
-- Date: 2025-12-04
-- =====================================================

-- =====================================================
-- STAFF PROFILES TABLE (extends users for org-specific data)
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Employment info
  employee_id VARCHAR(50),
  department VARCHAR(100),
  job_title VARCHAR(100),
  hire_date DATE,
  
  -- Contact
  phone VARCHAR(50),
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  
  -- Schedule & availability
  work_schedule JSONB DEFAULT '{"monday": true, "tuesday": true, "wednesday": true, "thursday": true, "friday": true, "saturday": false, "sunday": false}'::jsonb,
  hourly_rate DECIMAL(10, 2),
  
  -- Skills & certifications
  skills TEXT[],
  certifications JSONB DEFAULT '[]'::jsonb,
  
  -- Activity assignments
  assigned_activities UUID[] DEFAULT '{}',
  assigned_venues UUID[] DEFAULT '{}',
  
  -- Performance
  notes TEXT,
  performance_rating DECIMAL(3, 2),
  
  -- Metadata
  avatar_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, organization_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_profiles_user ON staff_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_org ON staff_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_department ON staff_profiles(department);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_skills ON staff_profiles USING GIN(skills);

-- =====================================================
-- STAFF TIME TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  break_minutes INT DEFAULT 0,
  
  -- Optional activity/booking assignment
  activity_id UUID REFERENCES activities(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'void')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_time_entries_staff ON staff_time_entries(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_org ON staff_time_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON staff_time_entries(clock_in);

-- =====================================================
-- STAFF ACTIVITY LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_profile_id UUID NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  action_type VARCHAR(50) NOT NULL,
  action_description TEXT,
  entity_type VARCHAR(50),
  entity_id UUID,
  
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_activity_staff ON staff_activity_log(staff_profile_id);
CREATE INDEX IF NOT EXISTS idx_staff_activity_org ON staff_activity_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_activity_date ON staff_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_activity_type ON staff_activity_log(action_type);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_staff_profiles_updated_at
  BEFORE UPDATE ON staff_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_time_entries_updated_at
  BEFORE UPDATE ON staff_time_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_activity_log ENABLE ROW LEVEL SECURITY;

-- Staff Profiles: Platform admins see all
CREATE POLICY "Platform admins manage all staff profiles"
  ON staff_profiles FOR ALL
  USING (is_platform_admin());

-- Staff Profiles: Org members see their org
CREATE POLICY "Org members view own org staff"
  ON staff_profiles FOR SELECT
  USING (organization_id = get_my_organization_id_safe());

-- Staff Profiles: Org admins can manage
CREATE POLICY "Org admins manage staff profiles"
  ON staff_profiles FOR ALL
  USING (
    organization_id = get_my_organization_id_safe()
    AND EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('super-admin', 'org-admin', 'admin')
    )
  );

-- Staff Profiles: Users can view their own
CREATE POLICY "Users view own staff profile"
  ON staff_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Time Entries: Platform admins see all
CREATE POLICY "Platform admins manage all time entries"
  ON staff_time_entries FOR ALL
  USING (is_platform_admin());

-- Time Entries: Org admins can manage
CREATE POLICY "Org admins manage time entries"
  ON staff_time_entries FOR ALL
  USING (organization_id = get_my_organization_id_safe());

-- Time Entries: Staff can manage their own
CREATE POLICY "Staff manage own time entries"
  ON staff_time_entries FOR ALL
  USING (
    staff_profile_id IN (
      SELECT id FROM staff_profiles WHERE user_id = auth.uid()
    )
  );

-- Activity Log: Platform admins see all
CREATE POLICY "Platform admins view all activity logs"
  ON staff_activity_log FOR SELECT
  USING (is_platform_admin());

-- Activity Log: Org admins can view
CREATE POLICY "Org admins view activity logs"
  ON staff_activity_log FOR SELECT
  USING (organization_id = get_my_organization_id_safe());

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get staff stats for an organization
CREATE OR REPLACE FUNCTION get_staff_stats(p_organization_id UUID)
RETURNS TABLE (
  total_staff BIGINT,
  active_staff BIGINT,
  by_role JSONB,
  by_department JSONB,
  avg_hours_this_month NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM staff_profiles sp 
     JOIN users u ON u.id = sp.user_id 
     WHERE sp.organization_id = p_organization_id)::BIGINT as total_staff,
    
    (SELECT COUNT(*) FROM staff_profiles sp 
     JOIN users u ON u.id = sp.user_id 
     WHERE sp.organization_id = p_organization_id AND u.is_active = true)::BIGINT as active_staff,
    
    (SELECT COALESCE(jsonb_object_agg(role, cnt), '{}'::jsonb) 
     FROM (
       SELECT u.role, COUNT(*)::INT as cnt 
       FROM staff_profiles sp 
       JOIN users u ON u.id = sp.user_id 
       WHERE sp.organization_id = p_organization_id 
       GROUP BY u.role
     ) r) as by_role,
    
    (SELECT COALESCE(jsonb_object_agg(COALESCE(department, 'Unassigned'), cnt), '{}'::jsonb)
     FROM (
       SELECT sp.department, COUNT(*)::INT as cnt 
       FROM staff_profiles sp 
       WHERE sp.organization_id = p_organization_id 
       GROUP BY sp.department
     ) d) as by_department,
    
    (SELECT COALESCE(AVG(
      EXTRACT(EPOCH FROM (COALESCE(clock_out, NOW()) - clock_in)) / 3600
    ), 0)::NUMERIC(10,2)
     FROM staff_time_entries
     WHERE organization_id = p_organization_id
     AND clock_in >= date_trunc('month', CURRENT_DATE)
    ) as avg_hours_this_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get staff members with full details
CREATE OR REPLACE FUNCTION get_staff_members(p_organization_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email VARCHAR,
  full_name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  department VARCHAR,
  job_title VARCHAR,
  phone VARCHAR,
  hire_date DATE,
  avatar_url TEXT,
  assigned_activities UUID[],
  assigned_venues UUID[],
  skills TEXT[],
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.id,
    u.id as user_id,
    u.email,
    u.full_name,
    u.role::VARCHAR,
    u.is_active,
    sp.department,
    sp.job_title,
    sp.phone,
    sp.hire_date,
    COALESCE(sp.avatar_url, u.avatar_url) as avatar_url,
    sp.assigned_activities,
    sp.assigned_venues,
    sp.skills,
    sp.created_at
  FROM staff_profiles sp
  JOIN users u ON u.id = sp.user_id
  WHERE sp.organization_id = p_organization_id
  ORDER BY u.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_staff_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_staff_members(UUID) TO authenticated;

-- =====================================================
-- ENABLE REAL-TIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE staff_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE staff_time_entries;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 079 complete:';
  RAISE NOTICE '- staff_profiles table created';
  RAISE NOTICE '- staff_time_entries table created';
  RAISE NOTICE '- staff_activity_log table created';
  RAISE NOTICE '- RLS policies configured';
  RAISE NOTICE '- Helper functions created';
  RAISE NOTICE '- Real-time enabled';
END$$;
