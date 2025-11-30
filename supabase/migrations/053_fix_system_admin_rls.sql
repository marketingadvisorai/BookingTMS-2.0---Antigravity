-- =====================================================
-- Migration: 053_fix_system_admin_rls.sql
-- Description: Fix RLS policies to allow system-admin profile loading
-- Created: 2025-11-30
-- 
-- Problem: System admin users have NULL organization_id, but the RLS
-- policy on users table requires org_id match, causing profile load to fail.
-- 
-- Solution: 
-- 1. Create helper function to check if user is system/platform admin
-- 2. Update RLS policies to allow self-lookup without org check
-- 3. Allow system admins to read ALL user profiles
-- =====================================================

-- Step 1: Create helper function to check for platform team
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  is_platform BOOLEAN;
BEGIN
  SELECT role, is_platform_team INTO user_role, is_platform
  FROM public.users 
  WHERE id = auth.uid();
  
  -- Platform admin if role is system-admin OR is_platform_team = true
  RETURN user_role = 'system-admin' OR COALESCE(is_platform, false);
END;
$$;

COMMENT ON FUNCTION is_platform_admin() IS 
  'Returns true if current user is a platform administrator (system-admin or platform team member)';

-- Step 2: Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Org members can view other members" ON public.users;
DROP POLICY IF EXISTS "System admins can read all users" ON public.users;

-- Step 3: Create new comprehensive RLS policies

-- Policy 1: Every user can read their OWN profile (no org check needed)
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy 2: System admins (platform level) can read ALL users
CREATE POLICY "Platform admins can read all users" ON public.users
  FOR SELECT 
  USING (is_platform_admin());

-- Policy 3: Org members can read other members in SAME organization
-- Only applies to users WITH an organization_id
CREATE POLICY "Org members can view same org users" ON public.users
  FOR SELECT 
  USING (
    organization_id IS NOT NULL 
    AND organization_id = get_my_organization_id_raw()
  );

-- Step 4: Update policies for INSERT, UPDATE, DELETE

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Platform admins can update any user
DROP POLICY IF EXISTS "Platform admins can update all users" ON public.users;
CREATE POLICY "Platform admins can update all users" ON public.users
  FOR UPDATE 
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- Platform admins can insert users
DROP POLICY IF EXISTS "Platform admins can insert users" ON public.users;
CREATE POLICY "Platform admins can insert users" ON public.users
  FOR INSERT 
  WITH CHECK (is_platform_admin() OR auth.uid() = id);

-- Platform admins can delete users
DROP POLICY IF EXISTS "Platform admins can delete users" ON public.users;
CREATE POLICY "Platform admins can delete users" ON public.users
  FOR DELETE 
  USING (is_platform_admin());

-- Step 5: Ensure service role bypass exists
DROP POLICY IF EXISTS "Service Role full access" ON public.users;
DROP POLICY IF EXISTS "Service role bypass" ON public.users;
CREATE POLICY "Service role full access" ON public.users
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Step 6: Verify system admin exists in public.users
-- If the auth user exists but public profile doesn't, create it
DO $$
DECLARE
  sys_admin_id UUID;
  sys_admin_email TEXT := 'systemadmin@bookingtms.com';
BEGIN
  -- Get the auth user ID
  SELECT id INTO sys_admin_id 
  FROM auth.users 
  WHERE email = sys_admin_email;
  
  IF sys_admin_id IS NOT NULL THEN
    -- Ensure public.users entry exists
    INSERT INTO public.users (id, email, full_name, role, is_active, is_platform_team)
    VALUES (
      sys_admin_id, 
      sys_admin_email, 
      'System Administrator', 
      'system-admin', 
      true, 
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'system-admin',
      is_active = true,
      is_platform_team = true,
      updated_at = NOW();
      
    RAISE NOTICE 'System admin user verified/created: %', sys_admin_id;
  ELSE
    RAISE NOTICE 'System admin auth user not found - run seed migration first';
  END IF;
END $$;

-- Step 7: Add helpful comments
COMMENT ON POLICY "Users can read own profile" ON public.users IS 
  'Allows any authenticated user to read their own profile without org restriction';

COMMENT ON POLICY "Platform admins can read all users" ON public.users IS 
  'Allows system-admin and platform team to read all user profiles across all orgs';

COMMENT ON POLICY "Org members can view same org users" ON public.users IS 
  'Allows org members to view other users within the same organization';
