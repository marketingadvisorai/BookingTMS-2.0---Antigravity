-- =====================================================
-- Migration: 051_fix_embed_configs_rls_recursion.sql
-- Description: Fix RLS policies for embed_configs table
-- Created: 2025-11-27
-- Updated: 2025-11-27 - Handle mock system admin users
-- 
-- Problems Fixed:
-- 1. Infinite recursion when querying users table from embed_configs policy
-- 2. Mock system admin users (ID: 00000000-...) not in users table
-- 
-- Solution: Use SECURITY DEFINER functions + handle users not in users table
-- =====================================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "embed_configs_org_access" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_public_read" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_read_update_delete" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_select" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_insert" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_update" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_delete" ON embed_configs;

-- Create a security definer function to get user's org (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT organization_id FROM users WHERE id = auth.uid();
$$;

-- Create a security definer function to check if user is system/super admin
CREATE OR REPLACE FUNCTION is_system_or_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('system-admin', 'super-admin')
  );
$$;

-- Policy 1: Authenticated users can SELECT embeds 
CREATE POLICY "embed_configs_select" ON embed_configs
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      organization_id = get_user_organization_id()
      OR is_system_or_super_admin()
      -- Allow users not in users table (mock system admin)
      OR NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
    )
  );

-- Policy 2: Authenticated users can INSERT embeds
CREATE POLICY "embed_configs_insert" ON embed_configs
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Policy 3: Authenticated users can UPDATE their org's embeds
CREATE POLICY "embed_configs_update" ON embed_configs
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND (
      organization_id = get_user_organization_id()
      OR is_system_or_super_admin()
      OR NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
    )
  );

-- Policy 4: Authenticated users can DELETE their org's embeds
CREATE POLICY "embed_configs_delete" ON embed_configs
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND (
      organization_id = get_user_organization_id()
      OR is_system_or_super_admin()
      OR NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
    )
  );

-- Policy 5: Public read for active widgets (for embed scripts)
CREATE POLICY "embed_configs_public_read" ON embed_configs
  FOR SELECT 
  TO anon
  USING (is_active = true);

-- Also fix embed_analytics if it has similar issues
DROP POLICY IF EXISTS "embed_analytics_org_read" ON embed_analytics;
DROP POLICY IF EXISTS "embed_analytics_public_insert" ON embed_analytics;

CREATE POLICY "embed_analytics_org_read" ON embed_analytics
  FOR SELECT USING (
    embed_config_id IN (
      SELECT id FROM embed_configs 
      WHERE organization_id = get_user_organization_id()
    )
    OR is_system_or_super_admin()
    OR NOT EXISTS (SELECT 1 FROM users WHERE id = auth.uid())
  );

-- Allow public insert for analytics (tracking from external sites)
CREATE POLICY "embed_analytics_public_insert" ON embed_analytics
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON FUNCTION get_user_organization_id() IS 
  'Security definer function to get current user organization ID without RLS';
COMMENT ON FUNCTION is_system_or_super_admin() IS 
  'Security definer function to check if user is system-admin or super-admin';
