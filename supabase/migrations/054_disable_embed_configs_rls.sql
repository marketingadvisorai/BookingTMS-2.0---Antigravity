-- =====================================================
-- Migration: 054_disable_embed_configs_rls.sql
-- Description: Completely disable RLS on embed_configs
-- Created: 2025-11-27
-- 
-- Decision: After multiple RLS issues with the users table
-- causing infinite recursion, we're disabling RLS completely
-- on embed_configs. Application-level access control will be
-- implemented instead.
-- =====================================================

-- Drop ALL policies
DROP POLICY IF EXISTS "embed_configs_select" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_insert" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_update" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_delete" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_public_read" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_org_access" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_read_update_delete" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_authenticated_access" ON embed_configs;
DROP POLICY IF EXISTS "embed_configs_anon_read" ON embed_configs;

-- DISABLE RLS completely
ALTER TABLE embed_configs DISABLE ROW LEVEL SECURITY;

-- Grant access to roles
GRANT ALL ON embed_configs TO authenticated;
GRANT SELECT ON embed_configs TO anon;
