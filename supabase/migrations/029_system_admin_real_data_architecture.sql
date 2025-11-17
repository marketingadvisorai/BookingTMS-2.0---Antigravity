-- =====================================================
-- SYSTEM ADMIN REAL DATA ARCHITECTURE
-- Version: 1.0.0
-- Description: Implements auto-generated IDs, real-time sync,
--              and comprehensive metrics for System Admin
-- Date: 2025-11-17
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. FEATURE FLAGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  key VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  available_for_roles JSONB DEFAULT '["admin", "owner"]'::JSONB,
  available_for_plans JSONB DEFAULT '["pro", "enterprise"]'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed feature flags with admin access features (excluding backend)
INSERT INTO feature_flags (name, key, description, enabled, available_for_roles) VALUES
('Dashboard Analytics', 'dashboard_analytics', 'Access to advanced analytics dashboard', true, '["admin", "owner"]'::JSONB),
('Venue Management', 'venue_management', 'Create and manage venues', true, '["admin", "owner"]'::JSONB),
('Game Management', 'game_management', 'Create and manage games', true, '["admin", "owner"]'::JSONB),
('Booking Management', 'booking_management', 'View and manage bookings', true, '["admin", "owner", "staff"]'::JSONB),
('Customer Management', 'customer_management', 'Manage customer data and profiles', true, '["admin", "owner"]'::JSONB),
('Payment Processing', 'payment_processing', 'Process payments and refunds', true, '["admin", "owner"]'::JSONB),
('Reports', 'reports', 'Generate and view reports', true, '["admin", "owner"]'::JSONB),
('Stripe Integration', 'stripe_integration', 'Manage Stripe settings', true, '["admin", "owner"]'::JSONB),
('Email Templates', 'email_templates', 'Customize email templates', true, '["admin", "owner"]'::JSONB),
('Waiver Management', 'waiver_management', 'Manage digital waivers', true, '["admin", "owner", "staff"]'::JSONB),
('Calendar Management', 'calendar_management', 'Manage venue and game calendars', true, '["admin", "owner"]'::JSONB),
('Widget Configuration', 'widget_configuration', 'Configure booking widgets', true, '["admin", "owner"]'::JSONB),
('Team Management', 'team_management', 'Manage team members and roles', true, '["admin", "owner"]'::JSONB),
('Pricing & Discounts', 'pricing_discounts', 'Manage pricing and discount codes', true, '["admin", "owner"]'::JSONB),
('Account Settings', 'account_settings', 'Manage account settings', true, '["admin", "owner"]'::JSONB)
ON CONFLICT (key) DO NOTHING;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(key);

-- =====================================================
-- 2. ENHANCED ORGANIZATION METRICS FUNCTION
-- =====================================================

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_organization_metrics(UUID);

-- Create enhanced metrics function with venue_ids and game_ids arrays
CREATE OR REPLACE FUNCTION get_organization_metrics(org_id UUID)
RETURNS TABLE (
  organization_id UUID,
  total_venues BIGINT,
  active_venues BIGINT,
  total_games BIGINT,
  active_games BIGINT,
  total_bookings BIGINT,
  total_revenue NUMERIC,
  mrr NUMERIC,
  venue_ids UUID[],
  game_ids UUID[],
  venue_names TEXT[],
  game_names TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    org_id AS organization_id,
    
    -- Venue metrics
    (SELECT COUNT(*) FROM venues WHERE organization_id = org_id)::BIGINT AS total_venues,
    (SELECT COUNT(*) FROM venues WHERE organization_id = org_id AND status = 'active')::BIGINT AS active_venues,
    
    -- Game metrics
    (SELECT COUNT(*) FROM games WHERE organization_id = org_id)::BIGINT AS total_games,
    (SELECT COUNT(*) FROM games WHERE organization_id = org_id AND status = 'active')::BIGINT AS active_games,
    
    -- Booking metrics
    (SELECT COUNT(*) FROM bookings WHERE organization_id = org_id)::BIGINT AS total_bookings,
    
    -- Revenue metrics
    (SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE organization_id = org_id AND status = 'confirmed')::NUMERIC AS total_revenue,
    
    -- Monthly Recurring Revenue (from organization's plan)
    (SELECT COALESCE(p.price, 0) FROM organizations o 
     LEFT JOIN plans p ON o.plan_id = p.id 
     WHERE o.id = org_id)::NUMERIC AS mrr,
    
    -- Venue IDs array
    (SELECT ARRAY_AGG(id ORDER BY created_at DESC) FROM venues WHERE organization_id = org_id) AS venue_ids,
    
    -- Game IDs array
    (SELECT ARRAY_AGG(id ORDER BY created_at DESC) FROM games WHERE organization_id = org_id) AS game_ids,
    
    -- Venue names array
    (SELECT ARRAY_AGG(name ORDER BY created_at DESC) FROM venues WHERE organization_id = org_id) AS venue_names,
    
    -- Game names array
    (SELECT ARRAY_AGG(name ORDER BY created_at DESC) FROM games WHERE organization_id = org_id) AS game_names;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. REAL-TIME SYNC TRIGGERS
-- =====================================================

-- Function to update organization metrics cache
CREATE OR REPLACE FUNCTION update_organization_metrics_cache()
RETURNS TRIGGER AS $$
DECLARE
  target_org_id UUID;
BEGIN
  -- Determine which organization to update
  IF TG_OP = 'DELETE' THEN
    target_org_id := OLD.organization_id;
  ELSE
    target_org_id := NEW.organization_id;
  END IF;
  
  -- Update organization's updated_at timestamp to trigger cache invalidation
  UPDATE organizations 
  SET updated_at = NOW() 
  WHERE id = target_org_id;
  
  -- Return appropriate value based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger on venues table
DROP TRIGGER IF EXISTS trigger_venue_update_org_metrics ON venues;
CREATE TRIGGER trigger_venue_update_org_metrics
AFTER INSERT OR UPDATE OR DELETE ON venues
FOR EACH ROW
EXECUTE FUNCTION update_organization_metrics_cache();

-- Trigger on games table
DROP TRIGGER IF EXISTS trigger_game_update_org_metrics ON games;
CREATE TRIGGER trigger_game_update_org_metrics
AFTER INSERT OR UPDATE OR DELETE ON games
FOR EACH ROW
EXECUTE FUNCTION update_organization_metrics_cache();

-- Trigger on bookings table
DROP TRIGGER IF EXISTS trigger_booking_update_org_metrics ON bookings;
CREATE TRIGGER trigger_booking_update_org_metrics
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_organization_metrics_cache();

-- =====================================================
-- 4. AUTO-POPULATE ORGANIZATION_ID IN GAMES
-- =====================================================

-- Trigger to auto-populate organization_id from venue when creating game
CREATE OR REPLACE FUNCTION auto_populate_game_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- If organization_id is not provided, get it from the venue
  IF NEW.organization_id IS NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM venues
    WHERE id = NEW.venue_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_populate_game_organization ON games;
CREATE TRIGGER trigger_auto_populate_game_organization
BEFORE INSERT OR UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION auto_populate_game_organization();

-- =====================================================
-- 5. VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate organization creation
CREATE OR REPLACE FUNCTION validate_organization_before_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure name is not empty
  IF NEW.name IS NULL OR TRIM(NEW.name) = '' THEN
    RAISE EXCEPTION 'Organization name cannot be empty';
  END IF;
  
  -- Ensure owner_email is valid
  IF NEW.owner_email IS NULL OR NEW.owner_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' THEN
    RAISE EXCEPTION 'Valid owner email is required';
  END IF;
  
  -- Set default status if not provided
  IF NEW.status IS NULL THEN
    NEW.status := 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_organization ON organizations;
CREATE TRIGGER trigger_validate_organization
BEFORE INSERT OR UPDATE ON organizations
FOR EACH ROW
EXECUTE FUNCTION validate_organization_before_insert();

-- =====================================================
-- 6. HELPER FUNCTIONS FOR SYSTEM ADMIN
-- =====================================================

-- Get all organizations with computed metrics (for System Admin dashboard)
CREATE OR REPLACE FUNCTION get_all_organizations_with_metrics()
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  owner_name VARCHAR,
  owner_email VARCHAR,
  plan_id UUID,
  plan_name VARCHAR,
  status VARCHAR,
  stripe_customer_id VARCHAR,
  total_venues BIGINT,
  total_games BIGINT,
  total_bookings BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.owner_name,
    o.owner_email,
    o.plan_id,
    p.name AS plan_name,
    o.status,
    o.stripe_customer_id,
    (SELECT COUNT(*) FROM venues WHERE organization_id = o.id)::BIGINT AS total_venues,
    (SELECT COUNT(*) FROM games WHERE organization_id = o.id)::BIGINT AS total_games,
    (SELECT COUNT(*) FROM bookings WHERE organization_id = o.id)::BIGINT AS total_bookings,
    o.created_at
  FROM organizations o
  LEFT JOIN plans p ON o.plan_id = p.id
  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_plan_id ON organizations(plan_id);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_organizations_created_at ON organizations(created_at DESC);

-- Venues indexes
CREATE INDEX IF NOT EXISTS idx_venues_organization_id ON venues(organization_id);
CREATE INDEX IF NOT EXISTS idx_venues_status ON venues(status);
CREATE INDEX IF NOT EXISTS idx_venues_created_at ON venues(created_at DESC);

-- Games indexes
CREATE INDEX IF NOT EXISTS idx_games_venue_id ON games(venue_id);
CREATE INDEX IF NOT EXISTS idx_games_organization_id ON games(organization_id);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC);

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_organization_id ON bookings(organization_id);
CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);
CREATE INDEX IF NOT EXISTS idx_bookings_game_id ON bookings(game_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Feature flags: Only system admins can modify
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System admins can view feature flags"
ON feature_flags FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'system_admin'
  )
);

CREATE POLICY "System admins can modify feature flags"
ON feature_flags FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'system_admin'
  )
);

-- =====================================================
-- 9. UPDATED_AT TRIGGER FOR ALL TABLES
-- =====================================================

-- Generic function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to feature_flags
DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
BEFORE UPDATE ON feature_flags
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE feature_flags IS 'Feature flags for controlling system functionality per role/plan';
COMMENT ON FUNCTION get_organization_metrics(UUID) IS 'Returns comprehensive metrics for a specific organization including venue/game IDs arrays';
COMMENT ON FUNCTION get_all_organizations_with_metrics() IS 'Returns all organizations with computed metrics for System Admin dashboard';
COMMENT ON FUNCTION update_organization_metrics_cache() IS 'Trigger function to invalidate organization metrics cache on venue/game/booking changes';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE '✅ System Admin Real Data Architecture migration completed successfully';
  RAISE NOTICE '✅ Feature flags table created and seeded';
  RAISE NOTICE '✅ Enhanced metrics functions deployed';
  RAISE NOTICE '✅ Real-time sync triggers activated';
  RAISE NOTICE '✅ Indexes optimized for performance';
  RAISE NOTICE '✅ RLS policies configured';
END $$;
