-- =====================================================
-- Migration: 090_staff_creation_fix
-- Purpose: Fix staff creation with proper profile creation
-- Date: 2025-12-10
-- =====================================================

-- =====================================================
-- 1. CREATE/REPLACE FUNCTION: create_staff_member
-- This function creates auth user, users record, org member, and staff_profile
-- Called from Edge Function after auth user creation
-- =====================================================

CREATE OR REPLACE FUNCTION create_staff_member_profile(
  p_user_id UUID,
  p_email VARCHAR,
  p_full_name VARCHAR,
  p_role VARCHAR,
  p_organization_id UUID,
  p_department VARCHAR DEFAULT NULL,
  p_job_title VARCHAR DEFAULT NULL,
  p_phone VARCHAR DEFAULT NULL,
  p_hire_date DATE DEFAULT NULL,
  p_skills TEXT[] DEFAULT '{}'
)
RETURNS TABLE (
  user_id UUID,
  staff_profile_id UUID,
  organization_id UUID
) AS $$
DECLARE
  v_staff_profile_id UUID;
BEGIN
  -- 1. Upsert users table record
  INSERT INTO users (id, email, full_name, role, organization_id, is_active, is_platform_team, created_at, updated_at)
  VALUES (p_user_id, p_email, p_full_name, p_role, p_organization_id, true, false, NOW(), NOW())
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    organization_id = EXCLUDED.organization_id,
    updated_at = NOW();

  -- 2. Add to organization_members (only for org-level roles)
  IF p_role NOT IN ('system-admin') THEN
    INSERT INTO organization_members (organization_id, user_id, role, status, created_at)
    VALUES (p_organization_id, p_user_id, p_role, 'active', NOW())
    ON CONFLICT (organization_id, user_id) DO UPDATE SET
      role = EXCLUDED.role,
      status = 'active';
  END IF;

  -- 3. Create staff_profiles record
  INSERT INTO staff_profiles (
    user_id, organization_id, department, job_title, phone, hire_date, skills, created_at, updated_at
  )
  VALUES (
    p_user_id, p_organization_id, p_department, p_job_title, p_phone, p_hire_date, p_skills, NOW(), NOW()
  )
  ON CONFLICT (user_id, organization_id) DO UPDATE SET
    department = COALESCE(EXCLUDED.department, staff_profiles.department),
    job_title = COALESCE(EXCLUDED.job_title, staff_profiles.job_title),
    phone = COALESCE(EXCLUDED.phone, staff_profiles.phone),
    hire_date = COALESCE(EXCLUDED.hire_date, staff_profiles.hire_date),
    skills = COALESCE(EXCLUDED.skills, staff_profiles.skills),
    updated_at = NOW()
  RETURNING id INTO v_staff_profile_id;

  RETURN QUERY SELECT p_user_id, v_staff_profile_id, p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. UPDATE STAFF PASSWORD FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_staff_password(
  p_user_id UUID,
  p_requesting_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_requester_role VARCHAR;
  v_requester_org UUID;
  v_target_org UUID;
BEGIN
  -- Get requester info
  SELECT role, organization_id INTO v_requester_role, v_requester_org
  FROM users WHERE id = p_requesting_user_id;

  -- Get target user org
  SELECT organization_id INTO v_target_org
  FROM users WHERE id = p_user_id;

  -- System admin can update anyone
  IF v_requester_role = 'system-admin' THEN
    RETURN true;
  END IF;

  -- Org admins can update users in their org
  IF v_requester_role IN ('super-admin', 'org-admin', 'admin') 
     AND v_requester_org = v_target_org THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. GET STAFF WITH ORG INFO
-- =====================================================

CREATE OR REPLACE FUNCTION get_staff_members_v2(
  p_organization_id UUID
)
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
    sp.organization_id,
    o.name::VARCHAR as organization_name,
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
  LEFT JOIN organizations o ON o.id = sp.organization_id
  WHERE sp.organization_id = p_organization_id
  ORDER BY u.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION create_staff_member_profile(UUID, VARCHAR, VARCHAR, VARCHAR, UUID, VARCHAR, VARCHAR, VARCHAR, DATE, TEXT[]) TO service_role;
GRANT EXECUTE ON FUNCTION update_staff_password(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_staff_members_v2(UUID) TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 090 complete:';
  RAISE NOTICE '- create_staff_member_profile function created';
  RAISE NOTICE '- update_staff_password function created';
  RAISE NOTICE '- get_staff_members_v2 function created';
END$$;
