-- Migration: Staff Management, Waivers, and Reporting Functions
-- Version: 0.1.7
-- Description: Implements staff management, digital waivers, and reporting system
-- Date: 2025-01-11

-- =====================================================
-- WAIVERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS waivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_parent_signature BOOLEAN NOT NULL DEFAULT false,
  min_age INTEGER DEFAULT 18,
  settings JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waiver submissions
CREATE TABLE IF NOT EXISTS waiver_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  waiver_id UUID NOT NULL REFERENCES waivers(id) ON DELETE RESTRICT,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Participant info
  participant_name VARCHAR(255) NOT NULL,
  participant_email VARCHAR(255),
  participant_phone VARCHAR(20),
  participant_dob DATE,
  participant_age INTEGER,
  
  -- Guardian info (if minor)
  guardian_name VARCHAR(255),
  guardian_email VARCHAR(255),
  guardian_phone VARCHAR(20),
  guardian_signature TEXT,
  guardian_signed_at TIMESTAMP WITH TIME ZONE,
  
  -- Signature
  signature TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  signed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- PDF storage
  pdf_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_waivers_organization ON waivers(organization_id);
CREATE INDEX IF NOT EXISTS idx_waivers_is_active ON waivers(is_active);
CREATE INDEX IF NOT EXISTS idx_waiver_submissions_waiver ON waiver_submissions(waiver_id);
CREATE INDEX IF NOT EXISTS idx_waiver_submissions_booking ON waiver_submissions(booking_id);
CREATE INDEX IF NOT EXISTS idx_waiver_submissions_customer ON waiver_submissions(customer_id);
CREATE INDEX IF NOT EXISTS idx_waiver_submissions_signed_at ON waiver_submissions(signed_at);

-- =====================================================
-- STAFF SCHEDULES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  
  -- Schedule details
  schedule_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  role VARCHAR(100),
  notes TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled',
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_out_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, schedule_date, start_time)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_schedules_organization ON staff_schedules(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_user ON staff_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_venue ON staff_schedules(venue_id);
CREATE INDEX IF NOT EXISTS idx_staff_schedules_date ON staff_schedules(schedule_date);

-- =====================================================
-- STAFF ACTIVITY LOG
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Activity details
  activity_type VARCHAR(100) NOT NULL,
  description TEXT,
  entity_type VARCHAR(100),
  entity_id UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_activity_organization ON staff_activity_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_staff_activity_user ON staff_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_activity_type ON staff_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_staff_activity_created_at ON staff_activity_log(created_at);

-- =====================================================
-- REPORTS CACHE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS reports_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  report_type VARCHAR(100) NOT NULL,
  report_name VARCHAR(255) NOT NULL,
  parameters JSONB DEFAULT '{}'::JSONB,
  data JSONB NOT NULL,
  generated_by UUID REFERENCES users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, report_type, parameters)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reports_cache_organization ON reports_cache(organization_id);
CREATE INDEX IF NOT EXISTS idx_reports_cache_type ON reports_cache(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_cache_expires_at ON reports_cache(expires_at);

-- =====================================================
-- WAIVER FUNCTIONS
-- =====================================================

-- Create waiver
CREATE OR REPLACE FUNCTION create_waiver(
  p_organization_id UUID,
  p_name TEXT,
  p_title TEXT,
  p_content TEXT,
  p_min_age INTEGER DEFAULT 18
)
RETURNS UUID AS $$
DECLARE
  v_waiver_id UUID;
BEGIN
  INSERT INTO waivers (
    organization_id,
    name,
    title,
    content,
    min_age,
    is_active
  ) VALUES (
    p_organization_id,
    p_name,
    p_title,
    p_content,
    p_min_age,
    true
  )
  RETURNING id INTO v_waiver_id;
  
  RETURN v_waiver_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Submit waiver
CREATE OR REPLACE FUNCTION submit_waiver(
  p_waiver_id UUID,
  p_booking_id UUID,
  p_participant_name TEXT,
  p_participant_email TEXT,
  p_participant_dob DATE,
  p_signature TEXT,
  p_guardian_name TEXT DEFAULT NULL,
  p_guardian_signature TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_submission_id UUID;
  v_participant_age INTEGER;
  v_customer_id UUID;
BEGIN
  -- Calculate age
  v_participant_age := EXTRACT(YEAR FROM AGE(p_participant_dob));
  
  -- Get customer ID from booking
  SELECT customer_id INTO v_customer_id
  FROM bookings
  WHERE id = p_booking_id;
  
  -- Insert submission
  INSERT INTO waiver_submissions (
    waiver_id,
    booking_id,
    customer_id,
    participant_name,
    participant_email,
    participant_dob,
    participant_age,
    guardian_name,
    guardian_signature,
    signature,
    signed_at
  ) VALUES (
    p_waiver_id,
    p_booking_id,
    v_customer_id,
    p_participant_name,
    p_participant_email,
    p_participant_dob,
    v_participant_age,
    p_guardian_name,
    p_guardian_signature,
    p_signature,
    NOW()
  )
  RETURNING id INTO v_submission_id;
  
  RETURN v_submission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get waiver submissions
CREATE OR REPLACE FUNCTION get_waiver_submissions(
  p_waiver_id UUID DEFAULT NULL,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  waiver_name TEXT,
  participant_name TEXT,
  participant_email TEXT,
  participant_age INTEGER,
  booking_id UUID,
  signed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ws.id,
    w.name as waiver_name,
    ws.participant_name,
    ws.participant_email,
    ws.participant_age,
    ws.booking_id,
    ws.signed_at
  FROM waiver_submissions ws
  INNER JOIN waivers w ON ws.waiver_id = w.id
  WHERE 
    (p_waiver_id IS NULL OR ws.waiver_id = p_waiver_id)
    AND (p_from_date IS NULL OR ws.signed_at::DATE >= p_from_date)
    AND (p_to_date IS NULL OR ws.signed_at::DATE <= p_to_date)
  ORDER BY ws.signed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STAFF MANAGEMENT FUNCTIONS
-- =====================================================

-- Create staff schedule
CREATE OR REPLACE FUNCTION create_staff_schedule(
  p_user_id UUID,
  p_venue_id UUID,
  p_schedule_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_role TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_schedule_id UUID;
  v_org_id UUID;
BEGIN
  -- Get organization ID
  SELECT organization_id INTO v_org_id
  FROM users
  WHERE id = p_user_id;
  
  INSERT INTO staff_schedules (
    organization_id,
    user_id,
    venue_id,
    schedule_date,
    start_time,
    end_time,
    role,
    status
  ) VALUES (
    v_org_id,
    p_user_id,
    p_venue_id,
    p_schedule_date,
    p_start_time,
    p_end_time,
    p_role,
    'scheduled'
  )
  RETURNING id INTO v_schedule_id;
  
  RETURN v_schedule_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get staff schedule
CREATE OR REPLACE FUNCTION get_staff_schedule(
  p_user_id UUID DEFAULT NULL,
  p_venue_id UUID DEFAULT NULL,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_name TEXT,
  user_email TEXT,
  venue_name TEXT,
  schedule_date DATE,
  start_time TIME,
  end_time TIME,
  role TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.id,
    u.full_name as user_name,
    u.email as user_email,
    v.name as venue_name,
    ss.schedule_date,
    ss.start_time,
    ss.end_time,
    ss.role,
    ss.status
  FROM staff_schedules ss
  INNER JOIN users u ON ss.user_id = u.id
  LEFT JOIN venues v ON ss.venue_id = v.id
  WHERE 
    (p_user_id IS NULL OR ss.user_id = p_user_id)
    AND (p_venue_id IS NULL OR ss.venue_id = p_venue_id)
    AND (p_from_date IS NULL OR ss.schedule_date >= p_from_date)
    AND (p_to_date IS NULL OR ss.schedule_date <= p_to_date)
  ORDER BY ss.schedule_date, ss.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log staff activity
CREATE OR REPLACE FUNCTION log_staff_activity(
  p_activity_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_activity_id UUID;
  v_org_id UUID;
BEGIN
  -- Get organization ID
  SELECT organization_id INTO v_org_id
  FROM users
  WHERE id = auth.uid();
  
  INSERT INTO staff_activity_log (
    organization_id,
    user_id,
    activity_type,
    description,
    entity_type,
    entity_id
  ) VALUES (
    v_org_id,
    auth.uid(),
    p_activity_type,
    p_description,
    p_entity_type,
    p_entity_id
  )
  RETURNING id INTO v_activity_id;
  
  RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get staff performance
CREATE OR REPLACE FUNCTION get_staff_performance(
  p_user_id UUID,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_shifts INTEGER,
  total_hours NUMERIC,
  bookings_handled BIGINT,
  revenue_generated NUMERIC,
  avg_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH shift_stats AS (
    SELECT
      COUNT(*)::INTEGER as shift_count,
      SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600)::NUMERIC as hours_worked
    FROM staff_schedules
    WHERE user_id = p_user_id
      AND status = 'completed'
      AND (p_from_date IS NULL OR schedule_date >= p_from_date)
      AND (p_to_date IS NULL OR schedule_date <= p_to_date)
  ),
  booking_stats AS (
    SELECT
      COUNT(*)::BIGINT as booking_count,
      COALESCE(SUM(final_amount), 0) as total_revenue
    FROM bookings
    WHERE created_by = p_user_id
      AND (p_from_date IS NULL OR booking_date >= p_from_date)
      AND (p_to_date IS NULL OR booking_date <= p_to_date)
  )
  SELECT
    COALESCE(ss.shift_count, 0),
    COALESCE(ss.hours_worked, 0),
    COALESCE(bs.booking_count, 0),
    COALESCE(bs.total_revenue, 0),
    4.5::NUMERIC as avg_rating  -- Placeholder for future rating system
  FROM shift_stats ss
  CROSS JOIN booking_stats bs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REPORTING FUNCTIONS
-- =====================================================

-- Generate revenue report
CREATE OR REPLACE FUNCTION generate_revenue_report(
  p_from_date DATE,
  p_to_date DATE,
  p_venue_id UUID DEFAULT NULL
)
RETURNS TABLE (
  period DATE,
  total_bookings BIGINT,
  total_revenue NUMERIC,
  avg_booking_value NUMERIC,
  payment_method_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_stats AS (
    SELECT
      b.booking_date as period,
      COUNT(*)::BIGINT as booking_count,
      SUM(b.final_amount) as revenue,
      AVG(b.final_amount) as avg_value
    FROM bookings b
    WHERE b.booking_date BETWEEN p_from_date AND p_to_date
      AND (p_venue_id IS NULL OR b.venue_id = p_venue_id)
      AND b.status IN ('confirmed', 'completed')
    GROUP BY b.booking_date
  )
  SELECT
    ds.period,
    ds.booking_count,
    ds.revenue,
    ds.avg_value,
    '{}'::JSONB as payment_method_breakdown  -- Placeholder
  FROM daily_stats ds
  ORDER BY ds.period;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate booking report
CREATE OR REPLACE FUNCTION generate_booking_report(
  p_from_date DATE,
  p_to_date DATE,
  p_venue_id UUID DEFAULT NULL
)
RETURNS TABLE (
  status TEXT,
  count BIGINT,
  percentage NUMERIC,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH status_stats AS (
    SELECT
      b.status::TEXT,
      COUNT(*)::BIGINT as booking_count,
      SUM(b.final_amount) as revenue
    FROM bookings b
    WHERE b.booking_date BETWEEN p_from_date AND p_to_date
      AND (p_venue_id IS NULL OR b.venue_id = p_venue_id)
    GROUP BY b.status
  ),
  total_count AS (
    SELECT SUM(booking_count) as total FROM status_stats
  )
  SELECT
    ss.status,
    ss.booking_count,
    ROUND((ss.booking_count::NUMERIC / tc.total::NUMERIC) * 100, 2) as percentage,
    ss.revenue
  FROM status_stats ss
  CROSS JOIN total_count tc
  ORDER BY ss.booking_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate customer report
CREATE OR REPLACE FUNCTION generate_customer_report(
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  segment TEXT,
  customer_count BIGINT,
  total_bookings BIGINT,
  total_revenue NUMERIC,
  avg_ltv NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.segment::TEXT,
    COUNT(DISTINCT c.id)::BIGINT as customer_count,
    SUM(c.total_bookings)::BIGINT as total_bookings,
    SUM(c.total_spent) as total_revenue,
    AVG(c.total_spent) as avg_ltv
  FROM customers c
  WHERE 
    (p_from_date IS NULL OR c.created_at::DATE >= p_from_date)
    AND (p_to_date IS NULL OR c.created_at::DATE <= p_to_date)
  GROUP BY c.segment
  ORDER BY customer_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cache report
CREATE OR REPLACE FUNCTION cache_report(
  p_report_type TEXT,
  p_report_name TEXT,
  p_parameters JSONB,
  p_data JSONB,
  p_ttl_hours INTEGER DEFAULT 24
)
RETURNS UUID AS $$
DECLARE
  v_report_id UUID;
  v_org_id UUID;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM users
  WHERE id = auth.uid();
  
  INSERT INTO reports_cache (
    organization_id,
    report_type,
    report_name,
    parameters,
    data,
    generated_by,
    expires_at
  ) VALUES (
    v_org_id,
    p_report_type,
    p_report_name,
    p_parameters,
    p_data,
    auth.uid(),
    NOW() + (p_ttl_hours || ' hours')::INTERVAL
  )
  ON CONFLICT (organization_id, report_type, parameters)
  DO UPDATE SET
    data = p_data,
    generated_by = auth.uid(),
    expires_at = NOW() + (p_ttl_hours || ' hours')::INTERVAL,
    created_at = NOW()
  RETURNING id INTO v_report_id;
  
  RETURN v_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE waiver_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports_cache ENABLE ROW LEVEL SECURITY;

-- Waivers policies
CREATE POLICY "Users can view waivers in their organization"
  ON waivers FOR SELECT TO authenticated
  USING (organization_id = auth.user_organization_id());

CREATE POLICY "Admins can manage waivers"
  ON waivers FOR ALL TO authenticated
  USING (auth.has_role('admin') AND organization_id = auth.user_organization_id());

-- Waiver submissions policies
CREATE POLICY "Users can view waiver submissions in their organization"
  ON waiver_submissions FOR SELECT TO authenticated
  USING (waiver_id IN (SELECT id FROM waivers WHERE organization_id = auth.user_organization_id()));

-- Staff schedules policies
CREATE POLICY "Users can view their own schedule"
  ON staff_schedules FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR organization_id = auth.user_organization_id());

CREATE POLICY "Managers can manage schedules"
  ON staff_schedules FOR ALL TO authenticated
  USING (auth.has_role('manager') AND organization_id = auth.user_organization_id());

-- Staff activity policies
CREATE POLICY "Users can view activity in their organization"
  ON staff_activity_log FOR SELECT TO authenticated
  USING (organization_id = auth.user_organization_id());

-- Reports cache policies
CREATE POLICY "Users can view cached reports in their organization"
  ON reports_cache FOR SELECT TO authenticated
  USING (organization_id = auth.user_organization_id());

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION create_waiver(UUID, TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION submit_waiver(UUID, UUID, TEXT, TEXT, DATE, TEXT, TEXT, TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_waiver_submissions(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION create_staff_schedule(UUID, UUID, DATE, TIME, TIME, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_staff_schedule(UUID, UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION log_staff_activity(TEXT, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_staff_performance(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_revenue_report(DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_booking_report(DATE, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_customer_report(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION cache_report(TEXT, TEXT, JSONB, JSONB, INTEGER) TO authenticated;

COMMENT ON TABLE waivers IS 'Digital waiver templates';
COMMENT ON TABLE waiver_submissions IS 'Signed waiver submissions';
COMMENT ON TABLE staff_schedules IS 'Staff scheduling and time tracking';
COMMENT ON TABLE staff_activity_log IS 'Staff activity and action logging';
COMMENT ON TABLE reports_cache IS 'Cached report data for performance';
