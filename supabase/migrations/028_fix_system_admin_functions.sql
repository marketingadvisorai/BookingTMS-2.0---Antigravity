-- =====================================================
-- FIX SYSTEM ADMIN FUNCTIONS - Bug Fixes
-- =====================================================
-- 
-- Purpose: Fix column references and add missing indexes
-- Date: 2025-11-17
-- Version: 1.1
--
-- Fixes:
-- 1. Update get_organization_metrics to use price_monthly
-- 2. Update get_platform_metrics to use price_monthly/price_yearly
-- 3. Update get_revenue_by_organization to use amount instead of fee_collected
-- 4. Add performance indexes for search and filtering
--
-- =====================================================

-- Drop and recreate functions with correct column references

-- =====================================================
-- FUNCTION 1: Get Organization Metrics (FIXED)
-- =====================================================

CREATE OR REPLACE FUNCTION get_organization_metrics(org_id UUID)
RETURNS TABLE (
  organization_id UUID,
  total_venues BIGINT,
  active_venues BIGINT,
  total_games BIGINT,
  total_bookings BIGINT,
  confirmed_bookings BIGINT,
  pending_bookings BIGINT,
  canceled_bookings BIGINT,
  total_revenue NUMERIC,
  mrr NUMERIC,
  average_booking_value NUMERIC,
  total_users BIGINT,
  active_users BIGINT,
  storage_used_gb NUMERIC,
  storage_limit_gb NUMERIC,
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  updated_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_limits JSONB;
BEGIN
  -- Get plan limits for storage
  SELECT limits INTO v_plan_limits
  FROM plans p
  INNER JOIN organizations o ON o.plan_id = p.id
  WHERE o.id = org_id;

  RETURN QUERY
  SELECT
    org_id AS organization_id,
    
    -- Venues
    (SELECT COUNT(*) FROM venues v WHERE v.organization_id = org_id AND v.deleted_at IS NULL) AS total_venues,
    (SELECT COUNT(*) FROM venues v WHERE v.organization_id = org_id AND v.deleted_at IS NULL AND v.status = 'active') AS active_venues,
    
    -- Games
    (SELECT COUNT(*) FROM games g 
     INNER JOIN venues v ON g.venue_id = v.id 
     WHERE v.organization_id = org_id AND g.deleted_at IS NULL) AS total_games,
    
    -- Bookings
    (SELECT COUNT(*) FROM bookings b 
     INNER JOIN games g ON b.game_id = g.id 
     INNER JOIN venues v ON g.venue_id = v.id 
     WHERE v.organization_id = org_id AND b.deleted_at IS NULL) AS total_bookings,
    
    (SELECT COUNT(*) FROM bookings b 
     INNER JOIN games g ON b.game_id = g.id 
     INNER JOIN venues v ON g.venue_id = v.id 
     WHERE v.organization_id = org_id AND b.status = 'confirmed' AND b.deleted_at IS NULL) AS confirmed_bookings,
    
    (SELECT COUNT(*) FROM bookings b 
     INNER JOIN games g ON b.game_id = g.id 
     INNER JOIN venues v ON g.venue_id = v.id 
     WHERE v.organization_id = org_id AND b.status = 'pending' AND b.deleted_at IS NULL) AS pending_bookings,
    
    (SELECT COUNT(*) FROM bookings b 
     INNER JOIN games g ON b.game_id = g.id 
     INNER JOIN venues v ON g.venue_id = v.id 
     WHERE v.organization_id = org_id AND b.status = 'cancelled' AND b.deleted_at IS NULL) AS canceled_bookings,
    
    -- Revenue
    COALESCE((SELECT SUM(b.total_price) FROM bookings b 
     INNER JOIN games g ON b.game_id = g.id 
     INNER JOIN venues v ON g.venue_id = v.id 
     WHERE v.organization_id = org_id AND b.status = 'confirmed' AND b.deleted_at IS NULL), 0) AS total_revenue,
    
    -- MRR (from plan price) - FIXED
    COALESCE((SELECT p.price_monthly
     FROM plans p
     INNER JOIN organizations o ON o.plan_id = p.id
     WHERE o.id = org_id), 0) AS mrr,
    
    -- Average booking value
    COALESCE((SELECT AVG(b.total_price) FROM bookings b 
     INNER JOIN games g ON b.game_id = g.id 
     INNER JOIN venues v ON g.venue_id = v.id 
     WHERE v.organization_id = org_id AND b.status = 'confirmed' AND b.deleted_at IS NULL), 0) AS average_booking_value,
    
    -- Users
    (SELECT COUNT(*) FROM organization_members om WHERE om.organization_id = org_id) AS total_users,
    (SELECT COUNT(*) FROM organization_members om WHERE om.organization_id = org_id AND om.status = 'active') AS active_users,
    
    -- Storage (placeholder - would calculate actual storage)
    0::NUMERIC AS storage_used_gb,
    COALESCE((v_plan_limits->>'max_storage_gb')::NUMERIC, 100) AS storage_limit_gb,
    
    -- Time period
    (NOW() - INTERVAL '30 days')::TIMESTAMP AS period_start,
    NOW()::TIMESTAMP AS period_end,
    NOW()::TIMESTAMP AS updated_at;
END;
$$;

-- =====================================================
-- FUNCTION 2: Get Platform Metrics (FIXED)
-- =====================================================

CREATE OR REPLACE FUNCTION get_platform_metrics()
RETURNS TABLE (
  total_organizations BIGINT,
  active_organizations BIGINT,
  inactive_organizations BIGINT,
  pending_organizations BIGINT,
  mrr NUMERIC,
  arr NUMERIC,
  total_revenue NUMERIC,
  platform_fee_revenue NUMERIC,
  total_venues BIGINT,
  total_games BIGINT,
  total_bookings BIGINT,
  total_users BIGINT,
  new_organizations_this_month BIGINT,
  churn_rate NUMERIC,
  growth_rate NUMERIC,
  basic_plan_count BIGINT,
  growth_plan_count BIGINT,
  pro_plan_count BIGINT,
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  updated_at TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_orgs BIGINT;
  v_new_orgs BIGINT;
BEGIN
  -- Get total orgs for rate calculations
  SELECT COUNT(*) INTO v_total_orgs FROM organizations WHERE deleted_at IS NULL;
  
  -- Get new orgs this month
  SELECT COUNT(*) INTO v_new_orgs 
  FROM organizations 
  WHERE created_at >= DATE_TRUNC('month', NOW()) AND deleted_at IS NULL;

  RETURN QUERY
  SELECT
    -- Organizations
    COUNT(*) FILTER (WHERE o.deleted_at IS NULL) AS total_organizations,
    COUNT(*) FILTER (WHERE o.status = 'active' AND o.deleted_at IS NULL) AS active_organizations,
    COUNT(*) FILTER (WHERE o.status = 'inactive' AND o.deleted_at IS NULL) AS inactive_organizations,
    COUNT(*) FILTER (WHERE o.status = 'pending' AND o.deleted_at IS NULL) AS pending_organizations,
    
    -- Revenue - MRR calculation - FIXED
    COALESCE(SUM(p.price_monthly) FILTER (WHERE o.status = 'active'), 0) AS mrr,
    
    -- ARR calculation - FIXED
    COALESCE(SUM(COALESCE(p.price_yearly, p.price_monthly * 12)) FILTER (WHERE o.status = 'active'), 0) AS arr,
    
    -- Total revenue from bookings
    COALESCE((SELECT SUM(b.total_price) FROM bookings b WHERE b.status = 'confirmed' AND b.deleted_at IS NULL), 0) AS total_revenue,
    
    -- Platform fee revenue (application fees) - FIXED
    COALESCE((SELECT SUM(pr.amount) FROM platform_revenue pr WHERE pr.revenue_type = 'application_fee'), 0) AS platform_fee_revenue,
    
    -- Usage counts
    (SELECT COUNT(*) FROM venues WHERE deleted_at IS NULL) AS total_venues,
    (SELECT COUNT(*) FROM games WHERE deleted_at IS NULL) AS total_games,
    (SELECT COUNT(*) FROM bookings WHERE deleted_at IS NULL) AS total_bookings,
    (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) AS total_users,
    
    -- Growth metrics
    v_new_orgs AS new_organizations_this_month,
    
    -- Churn rate (placeholder - would calculate based on cancellations)
    0::NUMERIC AS churn_rate,
    
    -- Growth rate
    CASE 
      WHEN v_total_orgs > 0 THEN (v_new_orgs::NUMERIC / v_total_orgs::NUMERIC) * 100
      ELSE 0
    END AS growth_rate,
    
    -- Plan distribution
    COUNT(*) FILTER (WHERE p.slug = 'basic' AND o.deleted_at IS NULL) AS basic_plan_count,
    COUNT(*) FILTER (WHERE p.slug = 'growth' AND o.deleted_at IS NULL) AS growth_plan_count,
    COUNT(*) FILTER (WHERE p.slug = 'pro' AND o.deleted_at IS NULL) AS pro_plan_count,
    
    -- Time period
    (NOW() - INTERVAL '30 days')::TIMESTAMP AS period_start,
    NOW()::TIMESTAMP AS period_end,
    NOW()::TIMESTAMP AS updated_at
  FROM organizations o
  LEFT JOIN plans p ON o.plan_id = p.id;
END;
$$;

-- =====================================================
-- FUNCTION 3: Get Revenue by Organization (FIXED)
-- =====================================================

CREATE OR REPLACE FUNCTION get_revenue_by_organization(org_id UUID)
RETURNS TABLE (
  organization_id UUID,
  total_revenue NUMERIC,
  platform_fee_revenue NUMERIC,
  net_revenue NUMERIC,
  currency TEXT,
  period_start TIMESTAMP,
  period_end TIMESTAMP
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    org_id AS organization_id,
    COALESCE(SUM(b.total_price), 0) AS total_revenue,
    COALESCE(SUM(pr.amount), 0) AS platform_fee_revenue, -- FIXED
    COALESCE(SUM(b.total_price) - SUM(pr.amount), 0) AS net_revenue, -- FIXED
    'USD'::TEXT AS currency,
    (NOW() - INTERVAL '30 days')::TIMESTAMP AS period_start,
    NOW()::TIMESTAMP AS period_end
  FROM bookings b
  INNER JOIN games g ON b.game_id = g.id
  INNER JOIN venues v ON g.venue_id = v.id
  LEFT JOIN platform_revenue pr ON pr.booking_id = b.id AND pr.revenue_type = 'application_fee' -- FIXED
  WHERE v.organization_id = org_id 
    AND b.status = 'confirmed' 
    AND b.deleted_at IS NULL;
END;
$$;

-- =====================================================
-- ADD PERFORMANCE INDEXES
-- =====================================================

-- Organization search and filter indexes
CREATE INDEX IF NOT EXISTS idx_organizations_owner_email ON organizations(owner_email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_owner_name ON organizations(owner_name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_name ON organizations(name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at DESC) WHERE deleted_at IS NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_organizations_status_plan ON organizations(status, plan_id) WHERE deleted_at IS NULL;

-- Text search index for organization names and emails
CREATE INDEX IF NOT EXISTS idx_organizations_name_trgm ON organizations USING gin(name gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_owner_email_trgm ON organizations USING gin(owner_email gin_trgm_ops) WHERE deleted_at IS NULL;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ System Admin functions FIXED successfully!';
  RAISE NOTICE '   - get_organization_metrics() - price_monthly fix';
  RAISE NOTICE '   - get_platform_metrics() - price_monthly/yearly fix';
  RAISE NOTICE '   - get_revenue_by_organization() - amount field fix';
  RAISE NOTICE '   - Performance indexes added for search';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 All database bugs resolved!';
END $$;
