-- =====================================================
-- MIGRATION COMPATIBILITY CHECK
-- =====================================================
-- 
-- Purpose: Verify database state before applying migration 028
-- Date: 2025-11-17
--
-- This script checks:
-- 1. Required tables exist
-- 2. Required columns exist
-- 3. No conflicting functions
-- 4. Safe to apply migration 028
--
-- =====================================================

\echo '🔍 CHECKING MIGRATION 028 COMPATIBILITY...'
\echo ''

-- =====================================================
-- CHECK 1: Required Tables
-- =====================================================

\echo '✓ Checking required tables...'

DO $$
DECLARE
  v_missing_tables TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check organizations table
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') THEN
    v_missing_tables := array_append(v_missing_tables, 'organizations');
  END IF;
  
  -- Check plans table
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plans') THEN
    v_missing_tables := array_append(v_missing_tables, 'plans');
  END IF;
  
  -- Check platform_revenue table
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_revenue') THEN
    v_missing_tables := array_append(v_missing_tables, 'platform_revenue');
  END IF;
  
  -- Check venues table
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'venues') THEN
    v_missing_tables := array_append(v_missing_tables, 'venues');
  END IF;
  
  -- Check games table
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'games') THEN
    v_missing_tables := array_append(v_missing_tables, 'games');
  END IF;
  
  -- Check bookings table
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    v_missing_tables := array_append(v_missing_tables, 'bookings');
  END IF;
  
  -- Check organization_members table
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_members') THEN
    v_missing_tables := array_append(v_missing_tables, 'organization_members');
  END IF;
  
  IF array_length(v_missing_tables, 1) > 0 THEN
    RAISE EXCEPTION '❌ MISSING TABLES: %', array_to_string(v_missing_tables, ', ');
  ELSE
    RAISE NOTICE '  ✅ All required tables exist';
  END IF;
END $$;

-- =====================================================
-- CHECK 2: Required Columns in Plans Table
-- =====================================================

\echo '✓ Checking plans table columns...'

DO $$
DECLARE
  v_missing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check price_monthly
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' AND column_name = 'price_monthly'
  ) THEN
    v_missing_columns := array_append(v_missing_columns, 'price_monthly');
  END IF;
  
  -- Check price_yearly
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' AND column_name = 'price_yearly'
  ) THEN
    v_missing_columns := array_append(v_missing_columns, 'price_yearly');
  END IF;
  
  -- Check slug
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' AND column_name = 'slug'
  ) THEN
    v_missing_columns := array_append(v_missing_columns, 'slug');
  END IF;
  
  IF array_length(v_missing_columns, 1) > 0 THEN
    RAISE EXCEPTION '❌ MISSING COLUMNS IN plans: %', array_to_string(v_missing_columns, ', ');
  ELSE
    RAISE NOTICE '  ✅ Plans table has correct schema (price_monthly, price_yearly)';
  END IF;
END $$;

-- =====================================================
-- CHECK 3: Required Columns in Platform Revenue
-- =====================================================

\echo '✓ Checking platform_revenue table columns...'

DO $$
DECLARE
  v_missing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check amount column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'platform_revenue' AND column_name = 'amount'
  ) THEN
    v_missing_columns := array_append(v_missing_columns, 'amount');
  END IF;
  
  -- Check revenue_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'platform_revenue' AND column_name = 'revenue_type'
  ) THEN
    v_missing_columns := array_append(v_missing_columns, 'revenue_type');
  END IF;
  
  IF array_length(v_missing_columns, 1) > 0 THEN
    RAISE EXCEPTION '❌ MISSING COLUMNS IN platform_revenue: %', array_to_string(v_missing_columns, ', ');
  ELSE
    RAISE NOTICE '  ✅ Platform_revenue table has correct schema (amount, revenue_type)';
  END IF;
END $$;

-- =====================================================
-- CHECK 4: Required Columns in Organizations
-- =====================================================

\echo '✓ Checking organizations table columns...'

DO $$
DECLARE
  v_missing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Check plan_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'plan_id'
  ) THEN
    v_missing_columns := array_append(v_missing_columns, 'plan_id');
  END IF;
  
  -- Check owner_email
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'owner_email'
  ) THEN
    v_missing_columns := array_append(v_missing_columns, 'owner_email');
  END IF;
  
  -- Check owner_name
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'owner_name'
  ) THEN
    v_missing_columns := array_append(v_missing_columns, 'owner_name');
  END IF;
  
  -- Check status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'status'
  ) THEN
    v_missing_columns := array_append(v_missing_columns, 'status');
  END IF;
  
  IF array_length(v_missing_columns, 1) > 0 THEN
    RAISE EXCEPTION '❌ MISSING COLUMNS IN organizations: %', array_to_string(v_missing_columns, ', ');
  ELSE
    RAISE NOTICE '  ✅ Organizations table has required columns';
  END IF;
END $$;

-- =====================================================
-- CHECK 5: Existing Functions (will be replaced)
-- =====================================================

\echo '✓ Checking existing functions...'

DO $$
DECLARE
  v_function_count INT;
BEGIN
  SELECT COUNT(*) INTO v_function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'get_organization_metrics',
      'get_platform_metrics',
      'get_revenue_by_organization',
      'get_organization_usage_summary'
    );
  
  IF v_function_count > 0 THEN
    RAISE NOTICE '  ⚠️  Found % existing functions (will be replaced)', v_function_count;
  ELSE
    RAISE NOTICE '  ℹ️  No existing functions found (first-time install)';
  END IF;
END $$;

-- =====================================================
-- CHECK 6: Existing Indexes (will be created if not exist)
-- =====================================================

\echo '✓ Checking existing indexes...'

DO $$
DECLARE
  v_index_count INT;
BEGIN
  SELECT COUNT(*) INTO v_index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename = 'organizations'
    AND indexname LIKE 'idx_organizations_%';
  
  IF v_index_count > 0 THEN
    RAISE NOTICE '  ℹ️  Found % existing organization indexes', v_index_count;
  ELSE
    RAISE NOTICE '  ℹ️  No organization indexes found (will be created)';
  END IF;
END $$;

-- =====================================================
-- CHECK 7: Extension Requirements
-- =====================================================

\echo '✓ Checking required extensions...'

DO $$
BEGIN
  -- Check pg_trgm extension (for text search)
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    RAISE NOTICE '  ⚠️  pg_trgm extension not installed (trigram indexes will be skipped)';
    RAISE NOTICE '     To enable: CREATE EXTENSION IF NOT EXISTS pg_trgm;';
  ELSE
    RAISE NOTICE '  ✅ pg_trgm extension available for text search';
  END IF;
END $$;

-- =====================================================
-- SUMMARY
-- =====================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '✅ COMPATIBILITY CHECK COMPLETE'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo ''
\echo 'Migration 028 is SAFE to apply if all checks passed.'
\echo ''
\echo 'What will happen:'
\echo '  • 4 RPC functions will be created/replaced'
\echo '  • 7+ performance indexes will be added'
\echo '  • No data will be modified'
\echo '  • No tables will be altered'
\echo '  • Existing architecture preserved'
\echo ''
\echo 'To apply migration:'
\echo '  supabase db push'
\echo ''
\echo 'Or manually:'
\echo '  psql $DATABASE_URL < supabase/migrations/028_fix_system_admin_functions.sql'
\echo ''
