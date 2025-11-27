-- Migration: Ensure Default Plans Exist
-- Date: 2025-11-27
-- Description: Creates default subscription plans and adds owner_user_id

-- Add owner_user_id column to organizations if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'owner_user_id') THEN
    ALTER TABLE organizations ADD COLUMN owner_user_id UUID REFERENCES auth.users(id);
  END IF;
END$$;

-- Update display_order for plans (actual column name)
UPDATE plans SET display_order = 1 WHERE slug = 'basic';
UPDATE plans SET display_order = 2 WHERE slug = 'growth';
UPDATE plans SET display_order = 3 WHERE slug = 'pro' OR slug = 'enterprise';

-- Add RLS policy for plans if not exists
DROP POLICY IF EXISTS "Plans are publicly readable" ON plans;
CREATE POLICY "Plans are publicly readable" ON plans FOR SELECT USING (is_active = true);

-- Enable RLS on plans
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Grant select to authenticated users
GRANT SELECT ON plans TO authenticated;
GRANT SELECT ON plans TO anon;

COMMENT ON TABLE plans IS 'Subscription plans for organizations - v1.0.0-beta';
