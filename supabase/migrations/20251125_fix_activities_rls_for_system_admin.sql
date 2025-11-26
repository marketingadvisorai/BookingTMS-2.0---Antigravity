-- =====================================================
-- FIX ACTIVITIES RLS FOR SYSTEM ADMIN
-- Date: 2025-11-25
-- Description: Updates activities table RLS to allow system admins full access
--              while maintaining tenant isolation for org users
-- =====================================================

-- 1. Drop existing overly restrictive policies on activities
DROP POLICY IF EXISTS "Tenant Isolation: Activities" ON activities;

-- 2. Create comprehensive RLS policies for activities

-- Policy for System Admin: Full access to all activities
CREATE POLICY "System Admin full access to activities" ON activities
FOR ALL
USING (
  -- Check for system-admin role in JWT metadata
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('system_admin', 'system-admin') OR
  (auth.jwt() ->> 'role') = 'service_role'
);

-- Policy for Org Users: Access only their organization's activities
CREATE POLICY "Org users access own activities" ON activities
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- 3. Do the same for activity_sessions
DROP POLICY IF EXISTS "Tenant Isolation: Sessions" ON activity_sessions;

CREATE POLICY "System Admin full access to sessions" ON activity_sessions
FOR ALL
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('system_admin', 'system-admin') OR
  (auth.jwt() ->> 'role') = 'service_role'
);

CREATE POLICY "Org users access own sessions" ON activity_sessions
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- 4. Do the same for activity_pricing
DROP POLICY IF EXISTS "Tenant Isolation: Pricing" ON activity_pricing;

CREATE POLICY "System Admin full access to pricing" ON activity_pricing
FOR ALL
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('system_admin', 'system-admin') OR
  (auth.jwt() ->> 'role') = 'service_role'
);

CREATE POLICY "Org users access own pricing" ON activity_pricing
FOR ALL
USING (
  activity_id IN (
    SELECT id FROM activities WHERE organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  )
);

-- 5. Update venues policy to also allow org members
DROP POLICY IF EXISTS "System Admin manage venues" ON venues;

CREATE POLICY "System Admin full access to venues" ON venues
FOR ALL
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') IN ('system_admin', 'system-admin') OR
  (auth.jwt() ->> 'role') = 'service_role'
);

CREATE POLICY "Org users access own venues" ON venues
FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- 6. Update organizations policy to allow org members to read their own org
CREATE POLICY "Org users read own organization" ON organizations
FOR SELECT
USING (
  id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  )
);

-- 7. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON activities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON activity_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON activity_pricing TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON venues TO authenticated;

-- Comment
COMMENT ON POLICY "System Admin full access to activities" ON activities IS 
  'Allows system admins to manage activities across all organizations';
COMMENT ON POLICY "Org users access own activities" ON activities IS 
  'Allows organization members to manage their own activities';
