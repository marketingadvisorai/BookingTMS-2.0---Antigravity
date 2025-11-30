-- Migration: Fix Organizations RLS Policies
-- Date: 2025-11-30
-- Description: Consolidate and fix organizations RLS policies for proper system admin access
-- Issue: "Cannot coerce the result to a single JSON object" and "User not allowed" errors

-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "organizations_org_access" ON organizations;
DROP POLICY IF EXISTS "organizations_anon_read" ON organizations;
DROP POLICY IF EXISTS "organizations_select" ON organizations;
DROP POLICY IF EXISTS "organizations_modify" ON organizations;
DROP POLICY IF EXISTS "platform_team_all_organizations" ON organizations;
DROP POLICY IF EXISTS "System Admin manage organizations" ON organizations;
DROP POLICY IF EXISTS "Public read: Org name for widgets" ON organizations;
DROP POLICY IF EXISTS "Org users read own organization" ON organizations;

-- Ensure RLS is enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policy 1: System Admin full access (check multiple places for role)
CREATE POLICY "organizations_system_admin_all" ON organizations
  FOR ALL
  TO authenticated
  USING (
    -- Check user_metadata role
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('system-admin', 'system_admin', 'super-admin', 'super_admin')
    OR
    -- Check app_metadata role
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('system-admin', 'system_admin', 'super-admin', 'super_admin')
    OR
    -- Check users table role
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('system-admin', 'system_admin', 'super-admin', 'super_admin')
    )
    OR
    -- Service role bypass
    (auth.jwt() ->> 'role') = 'service_role'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('system-admin', 'system_admin', 'super-admin', 'super_admin')
    OR
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('system-admin', 'system_admin', 'super-admin', 'super_admin')
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('system-admin', 'system_admin', 'super-admin', 'super_admin')
    )
    OR
    (auth.jwt() ->> 'role') = 'service_role'
  );

-- Policy 2: Org members can read their own organization
CREATE POLICY "organizations_members_select" ON organizations
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    OR
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy 3: Anonymous users can read active organizations (for widgets and checkout)
CREATE POLICY "organizations_anon_select" ON organizations
  FOR SELECT
  TO anon
  USING (
    status = 'active' 
    OR is_active = true
  );

-- Add comment for documentation
COMMENT ON POLICY "organizations_system_admin_all" ON organizations IS 
  'System admins and super admins have full CRUD access to all organizations';
COMMENT ON POLICY "organizations_members_select" ON organizations IS 
  'Organization members can read their own organization';
COMMENT ON POLICY "organizations_anon_select" ON organizations IS 
  'Anonymous users can read active organizations for widgets and checkout';
