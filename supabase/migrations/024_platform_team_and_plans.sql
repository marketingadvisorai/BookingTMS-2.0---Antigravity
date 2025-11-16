-- =====================================================
-- Migration: 024_platform_team_and_plans
-- Purpose: Add platform team support and subscription plans
-- Date: 2025-11-16
-- =====================================================

-- Add system-admin to user_role enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'system-admin') THEN
    ALTER TYPE user_role ADD VALUE 'system-admin';
  END IF;
END$$;

-- =====================================================
-- PLATFORM TEAM TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS platform_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL CHECK (role IN ('system-admin', 'super-admin')),
  department VARCHAR(100),
  permissions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_team_user ON platform_team(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_team_role ON platform_team(role);
CREATE INDEX IF NOT EXISTS idx_platform_team_active ON platform_team(is_active);

-- Trigger for updated_at
CREATE TRIGGER update_platform_team_updated_at
  BEFORE UPDATE ON platform_team
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE platform_team ENABLE ROW LEVEL SECURITY;

-- Only service role can manage platform team
CREATE POLICY "service_role_platform_team"
  ON platform_team FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE platform_team IS 'Platform team members (system admins and super admins)';

-- =====================================================
-- ADD is_platform_team FLAG TO USERS
-- =====================================================

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_platform_team BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_users_is_platform_team ON users(is_platform_team);

-- Add constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_platform_team_role;
ALTER TABLE users ADD CONSTRAINT check_platform_team_role
  CHECK (
    (is_platform_team = true AND role IN ('system-admin', 'super-admin'))
    OR
    (is_platform_team = false AND role IN ('super-admin', 'admin', 'manager', 'staff'))
  );

ALTER TABLE users DROP CONSTRAINT IF EXISTS check_org_users_have_org;
ALTER TABLE users ADD CONSTRAINT check_org_users_have_org
  CHECK (
    (is_platform_team = true)
    OR
    (is_platform_team = false AND organization_id IS NOT NULL)
  );

COMMENT ON COLUMN users.is_platform_team IS 'True if user is part of platform team (system owner), false if org user';

-- =====================================================
-- PLANS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Pricing
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),
  
  -- Limits (NULL = unlimited)
  max_venues INT,
  max_staff INT,
  max_bookings_per_month INT,
  max_widgets INT,
  
  -- Features (JSONB for flexibility)
  features JSONB DEFAULT '{
    "booking_widgets": true,
    "custom_styling": "none",
    "email_campaigns": false,
    "sms_campaigns": false,
    "automation": false,
    "custom_branding": false,
    "ai_agents": false,
    "advanced_analytics": false,
    "custom_reporting": false,
    "api_access": false,
    "webhooks": false,
    "sso": false,
    "white_label": false
  }'::jsonb,
  
  -- Display
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plans_slug ON plans(slug);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans(is_active);
CREATE INDEX IF NOT EXISTS idx_plans_features ON plans USING GIN(features);

-- Trigger
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default plans
INSERT INTO plans (name, slug, description, price_monthly, max_venues, max_staff, max_bookings_per_month, features) VALUES
('Basic', 'basic', 'Perfect for small venues getting started', 99.00, 2, 3, 200, '{
  "booking_widgets": true,
  "custom_styling": "basic",
  "email_campaigns": false,
  "sms_campaigns": false,
  "automation": false,
  "custom_branding": false,
  "ai_agents": false,
  "advanced_analytics": false,
  "custom_reporting": false,
  "api_access": false,
  "webhooks": false,
  "sso": false,
  "white_label": false
}'::jsonb),
('Growth', 'growth', 'For growing businesses with multiple locations', 299.00, 5, 10, 1000, '{
  "booking_widgets": true,
  "custom_styling": "advanced",
  "email_campaigns": true,
  "sms_campaigns": true,
  "automation": true,
  "custom_branding": true,
  "ai_agents": false,
  "advanced_analytics": false,
  "custom_reporting": false,
  "api_access": false,
  "webhooks": false,
  "sso": false,
  "white_label": false
}'::jsonb),
('Pro', 'pro', 'Enterprise features for large operations', 599.00, NULL, NULL, NULL, '{
  "booking_widgets": true,
  "custom_styling": "advanced",
  "email_campaigns": true,
  "sms_campaigns": true,
  "automation": true,
  "custom_branding": true,
  "ai_agents": true,
  "advanced_analytics": true,
  "custom_reporting": true,
  "api_access": true,
  "webhooks": true,
  "sso": true,
  "white_label": false
}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE plans IS 'Subscription plans (Basic, Growth, Pro)';

-- =====================================================
-- UPDATE ORGANIZATIONS TABLE
-- =====================================================

-- Add plan and usage tracking
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active';

-- Usage tracking
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS current_venues_count INT DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS current_staff_count INT DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS current_bookings_this_month INT DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS last_usage_reset_at DATE DEFAULT CURRENT_DATE;

-- Branding
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#4f46e5';

-- Suspension
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_plan ON organizations(plan_id);
CREATE INDEX IF NOT EXISTS idx_org_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_org_status ON organizations(subscription_status);

-- Set default plan for existing orgs
UPDATE organizations 
SET plan_id = (SELECT id FROM plans WHERE slug = 'basic' LIMIT 1)
WHERE plan_id IS NULL;

COMMENT ON COLUMN organizations.plan_id IS 'Current subscription plan';
COMMENT ON COLUMN organizations.owner_id IS 'Primary admin user (organization owner)';
COMMENT ON COLUMN organizations.current_venues_count IS 'Real-time count for limit enforcement';

-- =====================================================
-- USAGE TRACKING TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Counts
  venues_count INT DEFAULT 0,
  staff_count INT DEFAULT 0,
  bookings_count INT DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  
  -- Status
  has_exceeded_limits BOOLEAN DEFAULT false,
  exceeded_limits_details JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_org_usage_org ON organization_usage(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_usage_period ON organization_usage(period_start, period_end);

CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  old_plan_id UUID REFERENCES plans(id),
  new_plan_id UUID REFERENCES plans(id),
  change_type VARCHAR(50) NOT NULL,
  
  stripe_event_id VARCHAR(255),
  amount_paid DECIMAL(10,2),
  effective_date DATE NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sub_history_org ON subscription_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_sub_history_date ON subscription_history(effective_date DESC);

-- Enable RLS
ALTER TABLE organization_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Platform team can see all
CREATE POLICY "platform_team_all_usage"
  ON organization_usage FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_team = true));

CREATE POLICY "platform_team_all_sub_history"
  ON subscription_history FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_team = true));

-- Org admins can see their own
CREATE POLICY "org_users_own_usage"
  ON organization_usage FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "org_users_own_sub_history"
  ON subscription_history FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- =====================================================
-- UPDATE RLS POLICIES
-- =====================================================

-- Drop old organization policies
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Super admins can update organizations" ON organizations;

-- New policies with platform team support

-- Platform team can manage all organizations
CREATE POLICY "platform_team_all_organizations"
  ON organizations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_platform_team = true
    )
  );

-- Org users can view their organization
CREATE POLICY "org_users_view_own_org"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND is_platform_team = false
    )
  );

-- Only org admins can update their organization
CREATE POLICY "org_admins_update_own_org"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND is_platform_team = false
    )
  );

-- =====================================================
-- FUNCTIONS FOR USAGE TRACKING
-- =====================================================

-- Function to update venue count
CREATE OR REPLACE FUNCTION update_org_venues_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE organizations
    SET current_venues_count = current_venues_count + 1
    WHERE id = NEW.organization_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE organizations
    SET current_venues_count = GREATEST(current_venues_count - 1, 0)
    WHERE id = OLD.organization_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on venues table
CREATE TRIGGER update_org_venues_count_trigger
  AFTER INSERT OR DELETE ON venues
  FOR EACH ROW EXECUTE FUNCTION update_org_venues_count();

-- Function to update staff count
CREATE OR REPLACE FUNCTION update_org_staff_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_platform_team = false THEN
    UPDATE organizations
    SET current_staff_count = current_staff_count + 1
    WHERE id = NEW.organization_id;
  ELSIF TG_OP = 'DELETE' AND OLD.is_platform_team = false THEN
    UPDATE organizations
    SET current_staff_count = GREATEST(current_staff_count - 1, 0)
    WHERE id = OLD.organization_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on users table
CREATE TRIGGER update_org_staff_count_trigger
  AFTER INSERT OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION update_org_staff_count();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify
DO $$
BEGIN
  RAISE NOTICE 'Migration 024 complete:';
  RAISE NOTICE '- Platform team table created';
  RAISE NOTICE '- is_platform_team flag added to users';
  RAISE NOTICE '- Plans table created with 3 tiers';
  RAISE NOTICE '- Organizations updated with plan support';
  RAISE NOTICE '- Usage tracking tables created';
  RAISE NOTICE '- RLS policies updated';
  RAISE NOTICE '- Usage tracking functions created';
END$$;
