-- ============================================================================
-- Migration: Owner Authentication & Dashboard Features
-- Description: Full multi-tenant system with owner accounts and plan-based features
-- Date: 2024-11-17
-- ============================================================================

-- ============================================================================
-- 1. UPDATE FEATURE FLAGS TABLE SCHEMA
-- ============================================================================

-- Add category column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'feature_flags' AND column_name = 'category') THEN
    ALTER TABLE feature_flags ADD COLUMN category VARCHAR(50);
  END IF;
END $$;

-- ============================================================================
-- 2. UPDATE FEATURE FLAGS WITH REAL DASHBOARD FEATURES
-- ============================================================================

-- Clear existing generic feature flags
TRUNCATE TABLE feature_flags CASCADE;

-- Insert real dashboard features
INSERT INTO feature_flags (key, name, description, category, enabled) VALUES
  -- AI Features
  ('ai_agents', 'AI Agents', 'AI-powered booking assistant and recommendations', 'ai', true),
  ('calling_agent', 'AI Calling Agent', 'AI phone booking agent for automated calls', 'ai', true),
  ('booking_agent', 'AI Booking Agent', 'AI chat assistant for customer bookings', 'ai', true),
  
  -- Marketing Features
  ('marketing_tools', 'Marketing Tools', 'Email campaigns, SMS, and social media marketing', 'marketing', true),
  ('campaigns', 'Marketing Campaigns', 'Create and manage marketing campaigns', 'marketing', true),
  
  -- Payment Features
  ('payment_customer_end', 'Customer Payment Processing', 'Charge customers at booking time', 'payments', true),
  ('payment_owner_end', 'Owner Payment Processing', 'Collect payments to owner Stripe account', 'payments', true),
  
  -- Venue & Booking Features
  ('multi_venues', 'Multi Venues', 'Manage multiple venue locations', 'venues', true),
  ('calendar_management', 'Calendar Management', 'Availability scheduling and calendar sync', 'bookings', true),
  ('booking_widgets', 'Booking Widgets', 'Embeddable booking forms for websites', 'bookings', true),
  
  -- Customer & Team Features
  ('customer_management', 'Customer Management', 'CRM features and customer database', 'customers', true),
  ('team_management', 'Team Management', 'Staff accounts and permission management', 'team', true),
  
  -- Business Features
  ('analytics_reports', 'Analytics & Reports', 'Booking stats, revenue reports, and insights', 'analytics', true),
  ('pricing_discounts', 'Pricing & Discounts', 'Dynamic pricing, coupons, and promotions', 'pricing', true),
  ('waivers', 'Digital Waivers', 'Digital waiver signing and management', 'legal', true),
  ('email_templates', 'Email Templates', 'Automated email notifications and templates', 'communications', true);

-- ============================================================================
-- 3. CREATE PLAN_FEATURES JUNCTION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS plan_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL, -- References feature_flags.key
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(plan_id, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_features_feature_key ON plan_features(feature_key);

-- ============================================================================
-- 4. UPDATE PLANS TABLE WITH VENUE LIMITS
-- ============================================================================

-- Add venue limits if columns don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plans' AND column_name = 'max_venues') THEN
    ALTER TABLE plans ADD COLUMN max_venues INTEGER DEFAULT 1;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plans' AND column_name = 'max_games_per_venue') THEN
    ALTER TABLE plans ADD COLUMN max_games_per_venue INTEGER DEFAULT 10;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'plans' AND column_name = 'max_staff') THEN
    ALTER TABLE plans ADD COLUMN max_staff INTEGER DEFAULT 5;
  END IF;
END $$;

-- ============================================================================
-- 5. CREATE ORGANIZATION_MEMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_role ON organization_members(role);

-- Enable RLS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view members of their organization
CREATE POLICY "organization_members_select" ON organization_members
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members WHERE organization_id = organization_members.organization_id
    )
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'system_admin'
  );

-- RLS Policy: Only owners and system admins can modify
CREATE POLICY "organization_members_modify" ON organization_members
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM organization_members 
      WHERE organization_id = organization_members.organization_id 
      AND role = 'owner'
    )
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'system_admin'
  );

-- ============================================================================
-- 6. UPDATE VENUES TABLE
-- ============================================================================

-- Add staff and location count columns
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'venues' AND column_name = 'staff_count') THEN
    ALTER TABLE venues ADD COLUMN staff_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'venues' AND column_name = 'location_count') THEN
    ALTER TABLE venues ADD COLUMN location_count INTEGER DEFAULT 1;
  END IF;
END $$;

-- ============================================================================
-- 7. CREATE FUNCTION: AUTO-CREATE DEFAULT VENUE AFTER ORG CREATION
-- ============================================================================

CREATE OR REPLACE FUNCTION create_default_venue_for_organization()
RETURNS TRIGGER AS $$
DECLARE
  venue_id UUID;
BEGIN
  -- Create default venue
  INSERT INTO venues (
    organization_id,
    name,
    description,
    address,
    status,
    staff_count,
    location_count,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.name || ' - Main Location',
    'Default venue created automatically',
    COALESCE(NEW.address, 'Not specified'),
    'active',
    0, -- 0 staff as requested
    1, -- 1 location as requested
    NOW(),
    NOW()
  ) RETURNING id INTO venue_id;
  
  -- Create venue calendar
  INSERT INTO venue_calendars (
    venue_id,
    organization_id,
    created_at,
    updated_at
  ) VALUES (
    venue_id,
    NEW.id,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_create_default_venue ON organizations;
CREATE TRIGGER trigger_create_default_venue
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION create_default_venue_for_organization();

-- ============================================================================
-- 8. CREATE RPC: GET USER'S ORGANIZATION
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_organization(user_uuid UUID)
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  role TEXT,
  plan_id UUID,
  plan_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id as organization_id,
    o.name as organization_name,
    om.role,
    o.plan_id,
    p.name as plan_name
  FROM organization_members om
  JOIN organizations o ON o.id = om.organization_id
  LEFT JOIN plans p ON p.id = o.plan_id
  WHERE om.user_id = user_uuid
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. CREATE RPC: GET USER'S ENABLED FEATURES
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_features(user_uuid UUID)
RETURNS TABLE (
  feature_key TEXT,
  feature_name TEXT,
  feature_description TEXT,
  feature_category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    ff.key as feature_key,
    ff.name as feature_name,
    ff.description as feature_description,
    ff.category as feature_category
  FROM organization_members om
  JOIN organizations o ON o.id = om.organization_id
  JOIN plan_features pf ON pf.plan_id = o.plan_id
  JOIN feature_flags ff ON ff.key = pf.feature_key
  WHERE om.user_id = user_uuid
    AND pf.enabled = true
    AND ff.enabled = true
  ORDER BY ff.category, ff.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. CREATE RPC: CHECK VENUE LIMIT
-- ============================================================================

CREATE OR REPLACE FUNCTION check_venue_limit(org_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  current_venue_count INTEGER;
  max_allowed INTEGER;
  can_create BOOLEAN;
BEGIN
  -- Get current venue count
  SELECT COUNT(*) INTO current_venue_count
  FROM venues
  WHERE organization_id = org_uuid
    AND status != 'deleted';
  
  -- Get max allowed venues from plan
  SELECT p.max_venues INTO max_allowed
  FROM organizations o
  JOIN plans p ON p.id = o.plan_id
  WHERE o.id = org_uuid;
  
  -- Check if can create more
  can_create := (max_allowed IS NULL OR current_venue_count < max_allowed);
  
  RETURN jsonb_build_object(
    'current_count', current_venue_count,
    'max_allowed', COALESCE(max_allowed, 999),
    'can_create', can_create,
    'remaining', CASE 
      WHEN max_allowed IS NULL THEN 999
      ELSE max_allowed - current_venue_count
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 11. CREATE RPC: CHECK FEATURE ACCESS
-- ============================================================================

CREATE OR REPLACE FUNCTION check_feature_access(
  user_uuid UUID,
  feature_key_param TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM organization_members om
    JOIN organizations o ON o.id = om.organization_id
    JOIN plan_features pf ON pf.plan_id = o.plan_id
    WHERE om.user_id = user_uuid
      AND pf.feature_key = feature_key_param
      AND pf.enabled = true
  ) INTO has_access;
  
  RETURN COALESCE(has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 12. SEED PLAN FEATURES (DEFAULT MAPPINGS)
-- ============================================================================

-- NOTE: Assumes plans exist with names: Free, Basic, Growth, Pro
-- Update plan limits first
UPDATE plans SET 
  max_venues = CASE 
    WHEN LOWER(name) LIKE '%free%' THEN 1
    WHEN LOWER(name) LIKE '%basic%' THEN 2
    WHEN LOWER(name) LIKE '%growth%' THEN 5
    WHEN LOWER(name) LIKE '%pro%' THEN NULL -- unlimited
    ELSE 1
  END,
  max_games_per_venue = CASE 
    WHEN LOWER(name) LIKE '%free%' THEN 5
    WHEN LOWER(name) LIKE '%basic%' THEN 10
    WHEN LOWER(name) LIKE '%growth%' THEN 25
    WHEN LOWER(name) LIKE '%pro%' THEN NULL -- unlimited
    ELSE 5
  END,
  max_staff = CASE 
    WHEN LOWER(name) LIKE '%free%' THEN 2
    WHEN LOWER(name) LIKE '%basic%' THEN 5
    WHEN LOWER(name) LIKE '%growth%' THEN 15
    WHEN LOWER(name) LIKE '%pro%' THEN NULL -- unlimited
    ELSE 2
  END
WHERE EXISTS (SELECT 1 FROM plans); -- Only if plans exist

-- Seed plan_features for each plan (if plans exist)
DO $$
DECLARE
  free_plan_id UUID;
  basic_plan_id UUID;
  growth_plan_id UUID;
  pro_plan_id UUID;
BEGIN
  -- Get plan IDs
  SELECT id INTO free_plan_id FROM plans WHERE LOWER(name) LIKE '%free%' LIMIT 1;
  SELECT id INTO basic_plan_id FROM plans WHERE LOWER(name) LIKE '%basic%' LIMIT 1;
  SELECT id INTO growth_plan_id FROM plans WHERE LOWER(name) LIKE '%growth%' LIMIT 1;
  SELECT id INTO pro_plan_id FROM plans WHERE LOWER(name) LIKE '%pro%' LIMIT 1;
  
  -- Free Plan Features (Basic features only)
  IF free_plan_id IS NOT NULL THEN
    INSERT INTO plan_features (plan_id, feature_key, enabled) VALUES
      (free_plan_id, 'calendar_management', true),
      (free_plan_id, 'booking_widgets', true),
      (free_plan_id, 'customer_management', true),
      (free_plan_id, 'email_templates', true)
    ON CONFLICT (plan_id, feature_key) DO NOTHING;
  END IF;
  
  -- Basic Plan Features
  IF basic_plan_id IS NOT NULL THEN
    INSERT INTO plan_features (plan_id, feature_key, enabled) VALUES
      (basic_plan_id, 'calendar_management', true),
      (basic_plan_id, 'booking_widgets', true),
      (basic_plan_id, 'customer_management', true),
      (basic_plan_id, 'email_templates', true),
      (basic_plan_id, 'payment_customer_end', true),
      (basic_plan_id, 'waivers', true),
      (basic_plan_id, 'analytics_reports', true)
    ON CONFLICT (plan_id, feature_key) DO NOTHING;
  END IF;
  
  -- Growth Plan Features
  IF growth_plan_id IS NOT NULL THEN
    INSERT INTO plan_features (plan_id, feature_key, enabled) VALUES
      (growth_plan_id, 'calendar_management', true),
      (growth_plan_id, 'booking_widgets', true),
      (growth_plan_id, 'customer_management', true),
      (growth_plan_id, 'email_templates', true),
      (growth_plan_id, 'payment_customer_end', true),
      (growth_plan_id, 'payment_owner_end', true),
      (growth_plan_id, 'waivers', true),
      (growth_plan_id, 'analytics_reports', true),
      (growth_plan_id, 'marketing_tools', true),
      (growth_plan_id, 'campaigns', true),
      (growth_plan_id, 'multi_venues', true),
      (growth_plan_id, 'team_management', true),
      (growth_plan_id, 'pricing_discounts', true)
    ON CONFLICT (plan_id, feature_key) DO NOTHING;
  END IF;
  
  -- Pro Plan Features (All features)
  IF pro_plan_id IS NOT NULL THEN
    INSERT INTO plan_features (plan_id, feature_key, enabled)
    SELECT pro_plan_id, key, true
    FROM feature_flags
    ON CONFLICT (plan_id, feature_key) DO NOTHING;
  END IF;
END $$;

-- ============================================================================
-- 13. UPDATE RLS POLICIES FOR ORGANIZATIONS
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "organizations_select" ON organizations;
DROP POLICY IF EXISTS "organizations_modify" ON organizations;

-- New policies: Users can view organizations they're members of
CREATE POLICY "organizations_select" ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
    OR
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'system_admin'
  );

-- Only system admins can modify organizations
CREATE POLICY "organizations_modify" ON organizations
  FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'system_admin');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary
COMMENT ON TABLE plan_features IS 'Maps which features are available for each plan';
COMMENT ON TABLE organization_members IS 'Junction table linking users to organizations with roles';
COMMENT ON FUNCTION create_default_venue_for_organization() IS 'Auto-creates default venue (1 location, 0 staff) when organization is created';
COMMENT ON FUNCTION get_user_organization(UUID) IS 'Returns user organization and role information';
COMMENT ON FUNCTION get_user_features(UUID) IS 'Returns all features enabled for user based on their plan';
COMMENT ON FUNCTION check_venue_limit(UUID) IS 'Checks if organization can create more venues based on plan limits';
COMMENT ON FUNCTION check_feature_access(UUID, TEXT) IS 'Checks if user has access to a specific feature';
