-- =====================================================
-- Migration: 052_fix_users_table_rls_recursion.sql
-- Description: Fix infinite recursion in users table RLS
-- Created: 2025-11-27
-- 
-- Problem: "Org members can view other members" policy on users table
-- queried the users table itself, causing infinite recursion when
-- any function tried to query users (like get_user_organization_id).
-- 
-- Solution: Use plpgsql SECURITY DEFINER functions with SET search_path
-- to safely query users table without triggering RLS.
-- =====================================================

-- Helper function that safely queries users without triggering RLS
CREATE OR REPLACE FUNCTION get_my_organization_id_raw()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id 
  FROM public.users 
  WHERE id = auth.uid();
  RETURN org_id;
END;
$$;

-- Drop the problematic self-referencing policy
DROP POLICY IF EXISTS "Org members can view other members" ON users;

-- Recreate with the security definer function (no self-reference)
CREATE POLICY "Org members can view other members" ON users
  FOR SELECT USING (
    auth.uid() = id
    OR organization_id = get_my_organization_id_raw()
    OR auth.role() = 'service_role'
  );

-- Update helper functions to use plpgsql with SET search_path
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id 
  FROM public.users 
  WHERE id = auth.uid();
  RETURN org_id;
END;
$$;

CREATE OR REPLACE FUNCTION is_system_or_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role 
  FROM public.users 
  WHERE id = auth.uid();
  RETURN user_role IN ('system-admin', 'super-admin');
END;
$$;

-- Comments
COMMENT ON FUNCTION get_my_organization_id_raw() IS 
  'Safe function to get user org ID without triggering users table RLS';
