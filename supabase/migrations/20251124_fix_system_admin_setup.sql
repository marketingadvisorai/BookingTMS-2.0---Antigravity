-- =====================================================
-- FIX SYSTEM ADMIN SETUP
-- Description: Consolidates necessary tables and data for System Admin flow
--              to resolve "Database Not Configured" error.
-- =====================================================

-- 1. Ensure Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure Plans Table Exists
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  max_venues INT,
  max_staff INT,
  max_bookings_per_month INT,
  features JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Seed Plans (Idempotent)
INSERT INTO plans (name, slug, description, price_monthly, max_venues, max_staff, max_bookings_per_month, features)
VALUES
('Basic', 'basic', 'Perfect for small venues getting started', 99.00, 2, 3, 200, '{"booking_widgets": true, "custom_styling": "basic"}'::jsonb),
('Growth', 'growth', 'For growing businesses with multiple locations', 299.00, 5, 10, 1000, '{"booking_widgets": true, "custom_styling": "advanced", "email_campaigns": true}'::jsonb),
('Pro', 'pro', 'Enterprise features for large operations', 599.00, NULL, NULL, NULL, '{"booking_widgets": true, "custom_styling": "advanced", "api_access": true}'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- 4. Ensure Organizations Table Exists
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255), -- Made nullable for flexibility during creation
    owner_name VARCHAR(255),
    owner_email VARCHAR(255),
    plan_id UUID REFERENCES plans(id),
    status VARCHAR(50) DEFAULT 'pending',
    stripe_customer_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    stripe_charges_enabled BOOLEAN DEFAULT FALSE,
    stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
    application_fee_percentage NUMERIC DEFAULT 0.75
);

-- 5. Ensure Venues Table Exists
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(255) DEFAULT 'active',
    is_default BOOLEAN DEFAULT FALSE,
    timezone VARCHAR(255) DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Ensure Users Table Exists (Public Profile)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    full_name VARCHAR(255),
    role VARCHAR(50),
    organization_id UUID REFERENCES organizations(id),
    phone VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Ensure Organization Members Table Exists
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 8. Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS Policies (Simplified for System Admin Access)

-- Plans: Everyone can read, System Admin can write
DROP POLICY IF EXISTS "Everyone can read plans" ON plans;
CREATE POLICY "Everyone can read plans" ON plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "System Admin can manage plans" ON plans;
CREATE POLICY "System Admin can manage plans" ON plans FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'system_admin' OR
  (auth.jwt() ->> 'role') = 'service_role'
);

-- Organizations: System Admin can do everything
DROP POLICY IF EXISTS "System Admin manage organizations" ON organizations;
CREATE POLICY "System Admin manage organizations" ON organizations FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'system_admin' OR
  (auth.jwt() ->> 'role') = 'service_role'
);

-- Venues: System Admin can do everything
DROP POLICY IF EXISTS "System Admin manage venues" ON venues;
CREATE POLICY "System Admin manage venues" ON venues FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'system_admin' OR
  (auth.jwt() ->> 'role') = 'service_role'
);

-- Users: System Admin can do everything
DROP POLICY IF EXISTS "System Admin manage users" ON users;
CREATE POLICY "System Admin manage users" ON users FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'system_admin' OR
  (auth.jwt() ->> 'role') = 'service_role'
);

-- Org Members: System Admin can do everything
DROP POLICY IF EXISTS "System Admin manage org members" ON organization_members;
CREATE POLICY "System Admin manage org members" ON organization_members FOR ALL USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'system_admin' OR
  (auth.jwt() ->> 'role') = 'service_role'
);

-- 10. Create RPC: get_organization_metrics (Required by Dashboard)
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
    (SELECT COUNT(*) FROM venues WHERE venues.organization_id = org_id)::BIGINT AS total_venues,
    (SELECT COUNT(*) FROM venues WHERE venues.organization_id = org_id AND status = 'active')::BIGINT AS active_venues,
    0::BIGINT AS total_games, -- Placeholder if games table missing
    0::BIGINT AS active_games,
    0::BIGINT AS total_bookings,
    0::NUMERIC AS total_revenue,
    (SELECT COALESCE(p.price_monthly, 0) FROM organizations o LEFT JOIN plans p ON o.plan_id = p.id WHERE o.id = org_id)::NUMERIC AS mrr,
    ARRAY[]::UUID[] AS venue_ids,
    ARRAY[]::UUID[] AS game_ids,
    ARRAY[]::TEXT[] AS venue_names,
    ARRAY[]::TEXT[] AS game_names;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
