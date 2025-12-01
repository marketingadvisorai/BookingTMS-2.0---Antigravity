-- =====================================================
-- Migration: 072_fix_rls_helper_functions.sql
-- Description: Create safe RLS helper functions to prevent recursion
-- Date: 2025-12-01
-- Priority: P0 - Critical
-- 
-- Problem: Current RLS policies can cause infinite recursion when
-- querying the users table because they reference the users table
-- in their USING clause.
-- 
-- Solution: Create SECURITY DEFINER helper functions that bypass
-- RLS to safely look up user organization and permissions.
-- =====================================================

-- =====================================================
-- PART 1: DROP EXISTING PROBLEMATIC FUNCTIONS
-- =====================================================

-- Drop old functions that might conflict
DROP FUNCTION IF EXISTS get_my_organization_id() CASCADE;
DROP FUNCTION IF EXISTS get_my_organization_id_raw() CASCADE;
DROP FUNCTION IF EXISTS is_platform_admin() CASCADE;
DROP FUNCTION IF EXISTS can_access_organization(UUID) CASCADE;

-- =====================================================
-- PART 2: CREATE SAFE HELPER FUNCTIONS
-- =====================================================

-- Function: Get current user's organization ID (safe, no recursion)
CREATE OR REPLACE FUNCTION get_my_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT organization_id 
  FROM users 
  WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION get_my_organization_id() IS 
  'Safely returns the current user''s organization_id without RLS recursion. Returns NULL for system admins.';

-- Function: Check if current user is a platform admin
CREATE OR REPLACE FUNCTION is_platform_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role = 'system-admin' OR is_platform_team = true
     FROM users 
     WHERE id = auth.uid()),
    false
  );
$$;

COMMENT ON FUNCTION is_platform_admin() IS 
  'Returns true if current user is a system-admin or platform team member. Safe for use in RLS policies.';

-- Function: Check if current user can access a specific organization
CREATE OR REPLACE FUNCTION can_access_organization(p_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (
      is_platform_team = true 
      OR role = 'system-admin'
      OR organization_id = p_org_id
    )
  );
$$;

COMMENT ON FUNCTION can_access_organization(UUID) IS 
  'Returns true if current user can access the specified organization. Platform admins can access all orgs.';

-- Function: Get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role 
  FROM users 
  WHERE id = auth.uid();
$$;

COMMENT ON FUNCTION get_my_role() IS 
  'Returns the current user''s role. Safe for use in RLS policies.';

-- Function: Check if current user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT 
      CASE 
        WHEN role = 'system-admin' THEN true
        WHEN role = 'super-admin' THEN true
        WHEN role = 'org-admin' THEN p_permission NOT LIKE 'system.%'
        WHEN role = 'admin' THEN p_permission NOT LIKE 'system.%' AND p_permission NOT LIKE 'users.%'
        WHEN role = 'manager' THEN p_permission IN ('bookings.view', 'bookings.create', 'games.view', 'customers.view')
        WHEN role = 'staff' THEN p_permission IN ('bookings.view', 'games.view', 'customers.view')
        ELSE false
      END
     FROM users 
     WHERE id = auth.uid()),
    false
  );
$$;

COMMENT ON FUNCTION has_permission(TEXT) IS 
  'Checks if current user has a specific permission based on their role.';

-- =====================================================
-- PART 3: UPDATE USERS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Platform admins can read all users" ON users;
DROP POLICY IF EXISTS "Org members can view same org users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Platform admins can update all users" ON users;
DROP POLICY IF EXISTS "Platform admins can insert users" ON users;
DROP POLICY IF EXISTS "Platform admins can delete users" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;

-- Policy 1: Users can read their own profile (no org check needed)
CREATE POLICY "users_read_own_profile" ON users
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy 2: Platform admins can read all users
CREATE POLICY "platform_admins_read_all_users" ON users
  FOR SELECT 
  USING (is_platform_admin());

-- Policy 3: Org members can read other members in same organization
CREATE POLICY "org_members_read_same_org" ON users
  FOR SELECT 
  USING (
    organization_id IS NOT NULL 
    AND organization_id = get_my_organization_id()
  );

-- Policy 4: Users can update their own profile
CREATE POLICY "users_update_own_profile" ON users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 5: Platform admins can update any user
CREATE POLICY "platform_admins_update_all_users" ON users
  FOR UPDATE 
  USING (is_platform_admin())
  WITH CHECK (is_platform_admin());

-- Policy 6: Platform admins can insert users
CREATE POLICY "platform_admins_insert_users" ON users
  FOR INSERT 
  WITH CHECK (is_platform_admin() OR auth.uid() = id);

-- Policy 7: Platform admins can delete users
CREATE POLICY "platform_admins_delete_users" ON users
  FOR DELETE 
  USING (is_platform_admin());

-- Policy 8: Service role has full access
CREATE POLICY "service_role_full_access_users" ON users
  FOR ALL 
  USING (auth.role() = 'service_role');

-- =====================================================
-- PART 4: UPDATE ORGANIZATIONS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "platform_team_all_organizations" ON organizations;
DROP POLICY IF EXISTS "org_users_view_own_org" ON organizations;
DROP POLICY IF EXISTS "org_admins_update_own_org" ON organizations;

-- Policy 1: Platform admins can manage all organizations
CREATE POLICY "platform_admins_all_orgs" ON organizations
  FOR ALL 
  USING (is_platform_admin());

-- Policy 2: Org users can view their own organization
CREATE POLICY "org_users_view_own_org" ON organizations
  FOR SELECT 
  USING (id = get_my_organization_id());

-- Policy 3: Org admins can update their own organization
CREATE POLICY "org_admins_update_own_org" ON organizations
  FOR UPDATE 
  USING (
    id = get_my_organization_id() 
    AND get_my_role() IN ('super-admin', 'org-admin', 'admin')
  );

-- Policy 4: Service role has full access
CREATE POLICY "service_role_full_access_orgs" ON organizations
  FOR ALL 
  USING (auth.role() = 'service_role');

-- =====================================================
-- PART 5: UPDATE VENUES TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public Read: Venues for booking widgets" ON venues;
DROP POLICY IF EXISTS "Tenant Isolation: Venues" ON venues;

-- Policy 1: Public can read active venues (for widgets)
CREATE POLICY "public_read_active_venues" ON venues
  FOR SELECT 
  TO anon
  USING (status = 'active');

-- Policy 2: Authenticated users can read their org's venues
CREATE POLICY "org_users_read_venues" ON venues
  FOR SELECT 
  TO authenticated
  USING (
    organization_id = get_my_organization_id()
    OR is_platform_admin()
  );

-- Policy 3: Org admins can manage their venues
CREATE POLICY "org_admins_manage_venues" ON venues
  FOR ALL 
  TO authenticated
  USING (
    (organization_id = get_my_organization_id() AND get_my_role() IN ('super-admin', 'org-admin', 'admin'))
    OR is_platform_admin()
  );

-- Policy 4: Service role has full access
CREATE POLICY "service_role_full_access_venues" ON venues
  FOR ALL 
  USING (auth.role() = 'service_role');

-- =====================================================
-- PART 6: UPDATE ACTIVITIES TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view active activities" ON activities;
DROP POLICY IF EXISTS "Org users can manage activities" ON activities;

-- Policy 1: Public can read active activities (for widgets)
CREATE POLICY "public_read_active_activities" ON activities
  FOR SELECT 
  TO anon
  USING (is_active = true);

-- Policy 2: Authenticated users can read their org's activities
CREATE POLICY "org_users_read_activities" ON activities
  FOR SELECT 
  TO authenticated
  USING (
    organization_id = get_my_organization_id()
    OR is_platform_admin()
  );

-- Policy 3: Org admins can manage their activities
CREATE POLICY "org_admins_manage_activities" ON activities
  FOR ALL 
  TO authenticated
  USING (
    (organization_id = get_my_organization_id() AND get_my_role() IN ('super-admin', 'org-admin', 'admin', 'manager'))
    OR is_platform_admin()
  );

-- Policy 4: Service role has full access
CREATE POLICY "service_role_full_access_activities" ON activities
  FOR ALL 
  USING (auth.role() = 'service_role');

-- =====================================================
-- PART 7: UPDATE BOOKINGS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "org_users_view_bookings" ON bookings;
DROP POLICY IF EXISTS "org_users_manage_bookings" ON bookings;

-- Policy 1: Public can read their own bookings (for customer portal)
CREATE POLICY "customers_read_own_bookings" ON bookings
  FOR SELECT 
  TO anon
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

-- Policy 2: Authenticated users can read their org's bookings
CREATE POLICY "org_users_read_bookings" ON bookings
  FOR SELECT 
  TO authenticated
  USING (
    organization_id = get_my_organization_id()
    OR is_platform_admin()
  );

-- Policy 3: Org users can manage their bookings
CREATE POLICY "org_users_manage_bookings" ON bookings
  FOR ALL 
  TO authenticated
  USING (
    (organization_id = get_my_organization_id() AND get_my_role() IN ('super-admin', 'org-admin', 'admin', 'manager'))
    OR is_platform_admin()
  );

-- Policy 4: Service role has full access
CREATE POLICY "service_role_full_access_bookings" ON bookings
  FOR ALL 
  USING (auth.role() = 'service_role');

-- =====================================================
-- PART 8: UPDATE CUSTOMERS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "org_users_view_customers" ON customers;
DROP POLICY IF EXISTS "org_users_manage_customers" ON customers;

-- Policy 1: Authenticated users can read their org's customers
CREATE POLICY "org_users_read_customers" ON customers
  FOR SELECT 
  TO authenticated
  USING (
    organization_id = get_my_organization_id()
    OR is_platform_admin()
  );

-- Policy 2: Org users can manage their customers
CREATE POLICY "org_users_manage_customers" ON customers
  FOR ALL 
  TO authenticated
  USING (
    (organization_id = get_my_organization_id() AND get_my_role() IN ('super-admin', 'org-admin', 'admin', 'manager'))
    OR is_platform_admin()
  );

-- Policy 3: Service role has full access
CREATE POLICY "service_role_full_access_customers" ON customers
  FOR ALL 
  USING (auth.role() = 'service_role');

-- =====================================================
-- PART 9: UPDATE ACTIVITY_SESSIONS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view available sessions" ON activity_sessions;
DROP POLICY IF EXISTS "org_users_manage_sessions" ON activity_sessions;

-- Policy 1: Public can read available sessions (for widgets)
CREATE POLICY "public_read_available_sessions" ON activity_sessions
  FOR SELECT 
  TO anon
  USING (is_closed = false);

-- Policy 2: Authenticated users can read their org's sessions
CREATE POLICY "org_users_read_sessions" ON activity_sessions
  FOR SELECT 
  TO authenticated
  USING (
    organization_id = get_my_organization_id()
    OR is_platform_admin()
  );

-- Policy 3: Org admins can manage their sessions
CREATE POLICY "org_admins_manage_sessions" ON activity_sessions
  FOR ALL 
  TO authenticated
  USING (
    (organization_id = get_my_organization_id() AND get_my_role() IN ('super-admin', 'org-admin', 'admin'))
    OR is_platform_admin()
  );

-- Policy 4: Service role has full access
CREATE POLICY "service_role_full_access_sessions" ON activity_sessions
  FOR ALL 
  USING (auth.role() = 'service_role');

-- =====================================================
-- PART 10: GRANT PERMISSIONS ON HELPER FUNCTIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_my_organization_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_platform_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION can_access_organization(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION has_permission(TEXT) TO authenticated, anon;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 072_fix_rls_helper_functions completed successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'Helper functions created:';
  RAISE NOTICE '  - get_my_organization_id() - Returns current user''s org ID';
  RAISE NOTICE '  - is_platform_admin() - Checks if user is platform admin';
  RAISE NOTICE '  - can_access_organization(UUID) - Checks org access permission';
  RAISE NOTICE '  - get_my_role() - Returns current user''s role';
  RAISE NOTICE '  - has_permission(TEXT) - Checks specific permission';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS policies updated for:';
  RAISE NOTICE '  - users (8 policies)';
  RAISE NOTICE '  - organizations (4 policies)';
  RAISE NOTICE '  - venues (4 policies)';
  RAISE NOTICE '  - activities (4 policies)';
  RAISE NOTICE '  - bookings (4 policies)';
  RAISE NOTICE '  - customers (3 policies)';
  RAISE NOTICE '  - activity_sessions (4 policies)';
  RAISE NOTICE '';
  RAISE NOTICE 'All policies now use SECURITY DEFINER helper functions to prevent recursion.';
END $$;
