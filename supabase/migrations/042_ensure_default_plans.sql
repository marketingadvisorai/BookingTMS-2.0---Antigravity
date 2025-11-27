-- Migration: Ensure Default Plans Exist
-- Date: 2025-11-27
-- Description: Creates default subscription plans if they don't exist

-- Insert default plans (idempotent - won't duplicate if already exist)
INSERT INTO plans (name, slug, description, price_monthly, max_venues, max_staff, max_bookings_per_month, features, is_active, is_visible, sort_order)
SELECT 'Basic', 'basic', 'Perfect for small venues getting started', 99.00, 2, 3, 200, 
       '{"booking_widgets": true, "custom_styling": "basic", "email_support": true}'::jsonb, 
       true, true, 1
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE slug = 'basic');

INSERT INTO plans (name, slug, description, price_monthly, max_venues, max_staff, max_bookings_per_month, features, is_active, is_visible, sort_order)
SELECT 'Growth', 'growth', 'For growing businesses with multiple locations', 299.00, 5, 10, 1000, 
       '{"booking_widgets": true, "custom_styling": "advanced", "email_campaigns": true, "analytics": true}'::jsonb, 
       true, true, 2
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE slug = 'growth');

INSERT INTO plans (name, slug, description, price_monthly, max_venues, max_staff, max_bookings_per_month, features, is_active, is_visible, sort_order)
SELECT 'Enterprise', 'enterprise', 'Custom solutions for large organizations', 599.00, 25, 50, 10000, 
       '{"booking_widgets": true, "custom_styling": "full", "email_campaigns": true, "analytics": true, "api_access": true, "dedicated_support": true}'::jsonb, 
       true, true, 3
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE slug = 'enterprise');

-- Add missing columns if they don't exist
DO $$
BEGIN
  -- Add sort_order column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'sort_order') THEN
    ALTER TABLE plans ADD COLUMN sort_order INTEGER DEFAULT 999;
  END IF;

  -- Add is_visible column if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plans' AND column_name = 'is_visible') THEN
    ALTER TABLE plans ADD COLUMN is_visible BOOLEAN DEFAULT true;
  END IF;
  
  -- Add owner_user_id to organizations if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'owner_user_id') THEN
    ALTER TABLE organizations ADD COLUMN owner_user_id UUID REFERENCES auth.users(id);
  END IF;
END$$;

-- Update existing plans with sort_order if null
UPDATE plans SET sort_order = 1 WHERE slug = 'basic' AND (sort_order IS NULL OR sort_order = 999);
UPDATE plans SET sort_order = 2 WHERE slug = 'growth' AND (sort_order IS NULL OR sort_order = 999);
UPDATE plans SET sort_order = 3 WHERE slug = 'enterprise' AND (sort_order IS NULL OR sort_order = 999);

-- Ensure all plans are active and visible
UPDATE plans SET is_active = true, is_visible = true WHERE slug IN ('basic', 'growth', 'enterprise');

-- Grant select on plans to anon (needed for public access during signup)
GRANT SELECT ON plans TO anon;
GRANT SELECT ON plans TO authenticated;

-- Add RLS policy for plans (public read)
DROP POLICY IF EXISTS "Plans are publicly readable" ON plans;
CREATE POLICY "Plans are publicly readable" ON plans
  FOR SELECT USING (is_active = true AND is_visible = true);

-- Enable RLS on plans if not already
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE plans IS 'Subscription plans for organizations - v1.0.0-beta';
