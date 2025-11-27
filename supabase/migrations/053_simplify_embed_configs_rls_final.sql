-- =====================================================
-- Migration: 053_simplify_embed_configs_rls_final.sql
-- Description: Final simplified RLS for embed_configs
-- Created: 2025-11-27
-- 
-- This removes all complex policies and uses simple auth check.
-- Application-level filtering handles organization scoping.
-- =====================================================

-- Drop ALL existing policies
DROP POLICY IF EXISTS "embed_configs_select" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_insert" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_update" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_delete" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_public_read" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_org_access" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_read_update_delete" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_authenticated_access" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_anon_read" ON embed_configs;

-- Simple policy: Any authenticated user can manage embeds
-- Application handles organization filtering
CREATE POLICY "embed_configs_authenticated_access" ON embed_configs
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Public can read active embeds (for widget loading on external sites)
CREATE POLICY "embed_configs_anon_read" ON embed_configs
  FOR SELECT 
  TO anon
  USING (is_active = true);

-- Ensure RLS is enabled
ALTER TABLE embed_configs ENABLE ROW LEVEL SECURITY;
