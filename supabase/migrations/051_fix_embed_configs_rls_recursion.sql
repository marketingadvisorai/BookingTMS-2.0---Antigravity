-- =====================================================
-- Migration: 051_fix_embed_configs_rls_recursion.sql
-- Description: Fix infinite recursion in embed_configs RLS
-- Created: 2025-11-27
-- 
-- Problem: The embed_configs RLS policies referenced the users
-- table which has its own RLS policies, causing infinite recursion.
-- 
-- Solution: Use SECURITY DEFINER functions to bypass RLS when
-- checking user organization and role.
-- =====================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "embed_configs_org_access" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_public_read" ON embed_configs;

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

-- New policy: Organization members can manage their embeds
CREATE POLICY "embed_configs_org_access" ON embed_configs
  FOR ALL USING (
    organization_id = get_user_organization_id()
    OR is_system_or_super_admin()
  );

-- New policy: Public read for active widgets (for embed scripts)
CREATE POLICY "embed_configs_public_read" ON embed_configs
  FOR SELECT 
  TO anon
  USING (is_active = true);

-- Also fix embed_analytics if it has similar issues
DROP POLICY IF EXISTS "embed_analytics_org_read" ON embed_analytics;

CREATE POLICY "embed_analytics_org_read" ON embed_analytics
  FOR SELECT USING (
    embed_config_id IN (
      SELECT id FROM embed_configs 
      WHERE organization_id = get_user_organization_id()
    )
    OR is_system_or_super_admin()
  );

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON FUNCTION get_user_organization_id() IS 
  'Security definer function to get current user organization ID without RLS';
COMMENT ON FUNCTION is_system_or_super_admin() IS 
  'Security definer function to check if user is system-admin or super-admin';
