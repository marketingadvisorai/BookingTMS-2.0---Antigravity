-- =====================================================
-- Migration: 091_staff_all_orgs_function
-- Purpose: Add function for system admins to view ALL staff
-- Date: 2025-12-10
-- Updated: 2025-12-10 - Added all required fields for UI mapper
-- Updated: 2025-12-10 - Added notes (bio) field for staff profiles
-- =====================================================

-- =====================================================
-- 1. GET ALL STAFF MEMBERS (System Admin Only)
-- Returns staff from ALL organizations with all required fields
-- =====================================================

DROP FUNCTION IF EXISTS get_all_staff_members();

CREATE OR REPLACE FUNCTION get_all_staff_members()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  email VARCHAR,
  full_name VARCHAR,
  role VARCHAR,
  is_active BOOLEAN,
  organization_id UUID,
  organization_name VARCHAR,
  department VARCHAR,
  job_title VARCHAR,
  phone VARCHAR,
  hire_date DATE,
  employee_id VARCHAR,
  emergency_contact_name VARCHAR,
  emergency_contact_phone VARCHAR,
  avatar_url TEXT,
  notes TEXT,
  assigned_activities UUID[],
  assigned_venues UUID[],
  skills TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
DECLARE
  v_caller_role VARCHAR;
BEGIN
  -- Get caller's role
  SELECT u.role INTO v_caller_role
  FROM users u
  WHERE u.id = auth.uid();

  -- Only system-admin can call this function
  IF v_caller_role != 'system-admin' THEN
    RAISE EXCEPTION 'Access denied: Only system admins can view all staff';
  END IF;

  RETURN QUERY
  SELECT
    sp.id,
    u.id as user_id,
    u.email,
    u.full_name,
    u.role::VARCHAR,
    u.is_active,
    sp.organization_id,
    o.name::VARCHAR as organization_name,
    sp.department,
    sp.job_title,
    sp.phone,
    sp.hire_date,
    sp.employee_id,
    sp.emergency_contact_name,
    sp.emergency_contact_phone,
    COALESCE(sp.avatar_url, u.avatar_url) as avatar_url,
    sp.notes,
    sp.assigned_activities,
    sp.assigned_venues,
    sp.skills,
    sp.created_at,
    COALESCE(sp.updated_at, sp.created_at) as updated_at
  FROM staff_profiles sp
  JOIN users u ON u.id = sp.user_id
  LEFT JOIN organizations o ON o.id = sp.organization_id
  ORDER BY o.name, u.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. GET ALL STAFF STATS (System Admin Only)
-- Returns aggregated stats across ALL organizations
-- =====================================================

CREATE OR REPLACE FUNCTION get_all_staff_stats()
RETURNS TABLE (
  total_staff BIGINT,
  active_staff BIGINT,
  by_role JSONB,
  by_department JSONB,
  by_organization JSONB,
  avg_hours_this_month NUMERIC
) AS $$
DECLARE
  v_caller_role VARCHAR;
BEGIN
  -- Get caller's role
  SELECT u.role INTO v_caller_role
  FROM users u
  WHERE u.id = auth.uid();

  -- Only system-admin can call this function
  IF v_caller_role != 'system-admin' THEN
    RAISE EXCEPTION 'Access denied: Only system admins can view all staff stats';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(DISTINCT sp.user_id)::BIGINT as total_staff,
    COUNT(DISTINCT sp.user_id) FILTER (WHERE u.is_active = true)::BIGINT as active_staff,
    COALESCE(
      jsonb_object_agg(
        COALESCE(u.role, 'unknown'),
        role_counts.cnt
      ) FILTER (WHERE role_counts.cnt IS NOT NULL),
      '{}'::jsonb
    ) as by_role,
    COALESCE(
      jsonb_object_agg(
        COALESCE(sp.department, 'Unassigned'),
        dept_counts.cnt
      ) FILTER (WHERE dept_counts.cnt IS NOT NULL),
      '{}'::jsonb
    ) as by_department,
    COALESCE(
      jsonb_object_agg(
        COALESCE(o.name, 'Unknown'),
        org_counts.cnt
      ) FILTER (WHERE org_counts.cnt IS NOT NULL),
      '{}'::jsonb
    ) as by_organization,
    0::NUMERIC as avg_hours_this_month
  FROM staff_profiles sp
  JOIN users u ON u.id = sp.user_id
  LEFT JOIN organizations o ON o.id = sp.organization_id
  LEFT JOIN LATERAL (
    SELECT u2.role, COUNT(*)::BIGINT as cnt
    FROM staff_profiles sp2
    JOIN users u2 ON u2.id = sp2.user_id
    GROUP BY u2.role
  ) role_counts ON role_counts.role = u.role
  LEFT JOIN LATERAL (
    SELECT sp3.department, COUNT(*)::BIGINT as cnt
    FROM staff_profiles sp3
    GROUP BY sp3.department
  ) dept_counts ON dept_counts.department = sp.department
  LEFT JOIN LATERAL (
    SELECT sp4.organization_id, COUNT(*)::BIGINT as cnt
    FROM staff_profiles sp4
    GROUP BY sp4.organization_id
  ) org_counts ON org_counts.organization_id = sp.organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_all_staff_members() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_staff_stats() TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 091 complete:';
  RAISE NOTICE '- get_all_staff_members function created (system-admin only)';
  RAISE NOTICE '- get_all_staff_stats function created (system-admin only)';
END$$;
