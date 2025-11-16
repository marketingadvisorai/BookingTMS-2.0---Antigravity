-- =====================================================
-- SYSTEM ADMIN DASHBOARD - DATABASE FUNCTIONS
-- =====================================================
-- 
-- Purpose: Create database functions for System Admin Dashboard
-- Author: Database Architect
-- Date: 2025-11-16
-- Version: 1.0
--
-- Functions:
-- 1. get_organization_metrics(org_id UUID)
-- 2. get_platform_metrics()
-- 3. get_revenue_by_organization(org_id UUID)
-- 4. get_organization_usage_summary(org_id UUID)
--
-- =====================================================

-- =====================================================
-- FUNCTION 1: Get Organization Metrics
-- =====================================================
-- Returns comprehensive metrics for a single organization
-- Including venues, games, bookings, revenue, users, storage

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
    
    -- MRR (from plan price)
    COALESCE((SELECT 
      CASE 
        WHEN p.billing_period = 'annual' THEN p.price / 12
        ELSE p.price
      END
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

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_organization_metrics(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_organization_metrics(UUID) IS 
'Returns comprehensive metrics for a single organization including venues, games, bookings, revenue, and users';

-- =====================================================
-- FUNCTION 2: Get Platform Metrics
-- =====================================================
-- Returns platform-wide metrics for admin dashboard

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
    
    -- Revenue - MRR calculation
    COALESCE(SUM(
      CASE 
        WHEN p.billing_period = 'annual' THEN p.price / 12
        ELSE p.price
      END
    ) FILTER (WHERE o.status = 'active'), 0) AS mrr,
    
    -- ARR calculation
    COALESCE(SUM(
      CASE 
        WHEN p.billing_period = 'annual' THEN p.price
        ELSE p.price * 12
      END
    ) FILTER (WHERE o.status = 'active'), 0) AS arr,
    
    -- Total revenue from bookings
    COALESCE((SELECT SUM(b.total_price) FROM bookings b WHERE b.status = 'confirmed' AND b.deleted_at IS NULL), 0) AS total_revenue,
    
    -- Platform fee revenue (0.75% of bookings)
    COALESCE((SELECT SUM(pr.fee_collected) FROM platform_revenue pr), 0) AS platform_fee_revenue,
    
    -- Usage counts
    (SELECT COUNT(*) FROM venues WHERE deleted_at IS NULL) AS total_venues,
    (SELECT COUNT(*) FROM games WHERE deleted_at IS NULL) AS total_games,
    (SELECT COUNT(*) FROM bookings WHERE deleted_at IS NULL) AS total_bookings,
    (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) AS total_users,
    
    -- Growth metrics
    v_new_orgs AS new_organizations_this_month,
    
    -- Churn rate (simplified)
    CASE 
      WHEN v_total_orgs > 0 THEN 
        (COUNT(*) FILTER (WHERE o.status = 'inactive' AND o.deleted_at IS NULL)::NUMERIC / v_total_orgs) * 100
      ELSE 0
    END AS churn_rate,
    
    -- Growth rate
    CASE 
      WHEN v_total_orgs > 0 THEN 
        (v_new_orgs::NUMERIC / v_total_orgs) * 100
      ELSE 0
    END AS growth_rate,
    
    -- Plan counts
    COUNT(*) FILTER (WHERE p.name ILIKE '%basic%' AND o.status = 'active') AS basic_plan_count,
    COUNT(*) FILTER (WHERE p.name ILIKE '%growth%' AND o.status = 'active') AS growth_plan_count,
    COUNT(*) FILTER (WHERE p.name ILIKE '%pro%' AND o.status = 'active') AS pro_plan_count,
    
    -- Time period
    (NOW() - INTERVAL '30 days')::TIMESTAMP AS period_start,
    NOW()::TIMESTAMP AS period_end,
    NOW()::TIMESTAMP AS updated_at
    
  FROM organizations o
  LEFT JOIN plans p ON o.plan_id = p.id;
END;
$$;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION get_platform_metrics() TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_platform_metrics() IS 
'Returns platform-wide metrics including organizations, revenue, usage, and growth statistics';

-- =====================================================
-- FUNCTION 3: Get Revenue by Organization
-- =====================================================
-- Returns revenue breakdown for a specific organization

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
    COALESCE(SUM(pr.fee_collected), 0) AS platform_fee_revenue,
    COALESCE(SUM(b.total_price) - SUM(pr.fee_collected), 0) AS net_revenue,
    'USD'::TEXT AS currency,
    (NOW() - INTERVAL '30 days')::TIMESTAMP AS period_start,
    NOW()::TIMESTAMP AS period_end
  FROM bookings b
  INNER JOIN games g ON b.game_id = g.id
  INNER JOIN venues v ON g.venue_id = v.id
  LEFT JOIN platform_revenue pr ON pr.booking_id = b.id
  WHERE v.organization_id = org_id 
    AND b.status = 'confirmed' 
    AND b.deleted_at IS NULL;
END;
$$;

-- Grant access
GRANT EXECUTE ON FUNCTION get_revenue_by_organization(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_revenue_by_organization(UUID) IS 
'Returns revenue breakdown for a specific organization';

-- =====================================================
-- FUNCTION 4: Get Organization Usage Summary
-- =====================================================
-- Returns usage summary for billing and limits

CREATE OR REPLACE FUNCTION get_organization_usage_summary(org_id UUID)
RETURNS TABLE (
  organization_id UUID,
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  venues_count BIGINT,
  games_count BIGINT,
  bookings_count BIGINT,
  users_count BIGINT,
  storage_used_gb NUMERIC,
  max_venues BIGINT,
  max_games BIGINT,
  max_bookings_per_month BIGINT,
  max_users BIGINT,
  max_storage_gb BIGINT,
  venues_percentage NUMERIC,
  games_percentage NUMERIC,
  bookings_percentage NUMERIC,
  users_percentage NUMERIC,
  storage_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_limits JSONB;
  v_max_venues BIGINT;
  v_max_games BIGINT;
  v_max_bookings BIGINT;
  v_max_users BIGINT;
  v_max_storage BIGINT;
BEGIN
  -- Get plan limits
  SELECT limits INTO v_plan_limits
  FROM plans p
  INNER JOIN organizations o ON o.plan_id = p.id
  WHERE o.id = org_id;
  
  -- Extract limits (-1 means unlimited)
  v_max_venues := COALESCE((v_plan_limits->>'max_venues')::BIGINT, -1);
  v_max_games := COALESCE((v_plan_limits->>'max_games')::BIGINT, -1);
  v_max_bookings := COALESCE((v_plan_limits->>'max_bookings_per_month')::BIGINT, -1);
  v_max_users := COALESCE((v_plan_limits->>'max_users')::BIGINT, -1);
  v_max_storage := COALESCE((v_plan_limits->>'max_storage_gb')::BIGINT, 100);

  RETURN QUERY
  WITH usage_counts AS (
    SELECT
      (SELECT COUNT(*) FROM venues v WHERE v.organization_id = org_id AND v.deleted_at IS NULL) AS venues,
      (SELECT COUNT(*) FROM games g 
       INNER JOIN venues v ON g.venue_id = v.id 
       WHERE v.organization_id = org_id AND g.deleted_at IS NULL) AS games,
      (SELECT COUNT(*) FROM bookings b 
       INNER JOIN games g ON b.game_id = g.id 
       INNER JOIN venues v ON g.venue_id = v.id 
       WHERE v.organization_id = org_id 
         AND b.created_at >= DATE_TRUNC('month', NOW())
         AND b.deleted_at IS NULL) AS bookings,
      (SELECT COUNT(*) FROM organization_members om WHERE om.organization_id = org_id) AS users,
      0::NUMERIC AS storage -- Placeholder
  )
  SELECT
    org_id AS organization_id,
    DATE_TRUNC('month', NOW())::TIMESTAMP AS period_start,
    NOW()::TIMESTAMP AS period_end,
    uc.venues AS venues_count,
    uc.games AS games_count,
    uc.bookings AS bookings_count,
    uc.users AS users_count,
    uc.storage AS storage_used_gb,
    v_max_venues AS max_venues,
    v_max_games AS max_games,
    v_max_bookings AS max_bookings_per_month,
    v_max_users AS max_users,
    v_max_storage AS max_storage_gb,
    -- Percentages (-1 means unlimited, return 0%)
    CASE WHEN v_max_venues = -1 THEN 0 ELSE (uc.venues::NUMERIC / NULLIF(v_max_venues, 0)) * 100 END AS venues_percentage,
    CASE WHEN v_max_games = -1 THEN 0 ELSE (uc.games::NUMERIC / NULLIF(v_max_games, 0)) * 100 END AS games_percentage,
    CASE WHEN v_max_bookings = -1 THEN 0 ELSE (uc.bookings::NUMERIC / NULLIF(v_max_bookings, 0)) * 100 END AS bookings_percentage,
    CASE WHEN v_max_users = -1 THEN 0 ELSE (uc.users::NUMERIC / NULLIF(v_max_users, 0)) * 100 END AS users_percentage,
    (uc.storage / NULLIF(v_max_storage, 0)) * 100 AS storage_percentage
  FROM usage_counts uc;
END;
$$;

-- Grant access
GRANT EXECUTE ON FUNCTION get_organization_usage_summary(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_organization_usage_summary(UUID) IS 
'Returns usage summary for an organization including current usage vs plan limits';

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for organization lookups
CREATE INDEX IF NOT EXISTS idx_organizations_plan_id ON organizations(plan_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status) WHERE deleted_at IS NULL;

-- Index for venue organization lookups
CREATE INDEX IF NOT EXISTS idx_venues_organization_id ON venues(organization_id) WHERE deleted_at IS NULL;

-- Index for games venue lookups
CREATE INDEX IF NOT EXISTS idx_games_venue_id ON games(venue_id) WHERE deleted_at IS NULL;

-- Index for bookings status and dates
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_created_month ON bookings(DATE_TRUNC('month', created_at)) WHERE deleted_at IS NULL;

-- Index for platform revenue
CREATE INDEX IF NOT EXISTS idx_platform_revenue_created ON platform_revenue(created_at);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_booking ON platform_revenue(booking_id);

-- Index for organization members
CREATE INDEX IF NOT EXISTS idx_org_members_organization ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_status ON organization_members(status);

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ System Admin Dashboard functions created successfully!';
  RAISE NOTICE '   - get_organization_metrics()';
  RAISE NOTICE '   - get_platform_metrics()';
  RAISE NOTICE '   - get_revenue_by_organization()';
  RAISE NOTICE '   - get_organization_usage_summary()';
  RAISE NOTICE '   - Performance indexes created';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Database architecture optimized for System Admin!';
END $$;
