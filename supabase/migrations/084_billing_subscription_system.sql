-- =====================================================
-- Migration: 084_billing_subscription_system
-- Purpose: Complete billing, subscription, and credit system
-- Date: 2025-12-08
-- =====================================================

-- =====================================================
-- SUBSCRIPTION PLANS TABLE
-- Defines available subscription tiers
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  stripe_product_id TEXT,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  monthly_price DECIMAL(10, 2) DEFAULT 0,
  yearly_price DECIMAL(10, 2) DEFAULT 0,
  
  -- Plan limits (JSONB for flexibility)
  features JSONB DEFAULT '[]'::jsonb,
  limits JSONB DEFAULT '{}'::jsonb,
  
  -- Credits
  monthly_credits INTEGER DEFAULT 0,
  free_bookings_per_month INTEGER DEFAULT 0,
  free_ai_conversations_per_month INTEGER DEFAULT 0,
  transaction_fee_percent DECIMAL(4, 2) DEFAULT 0,
  
  -- Display
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTIONS TABLE
-- Organization subscriptions linked to Stripe
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  
  -- Stripe IDs
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'trialing' CHECK (status IN (
    'trialing', 'active', 'past_due', 'canceled', 
    'unpaid', 'incomplete', 'incomplete_expired', 'paused'
  )),
  
  -- Period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  
  -- Billing
  billing_cycle TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id)
);

-- =====================================================
-- CREDIT BALANCES TABLE
-- Current credit balance per organization
-- =====================================================

CREATE TABLE IF NOT EXISTS credit_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Balance tracking
  balance INTEGER DEFAULT 0,
  plan_credits INTEGER DEFAULT 0,      -- Monthly allocation from plan
  purchased_credits INTEGER DEFAULT 0,  -- Bought credit packages
  
  -- Reset tracking
  last_reset_date DATE DEFAULT CURRENT_DATE,
  next_reset_date DATE,
  
  -- Usage this period
  bookings_used INTEGER DEFAULT 0,
  ai_conversations_used INTEGER DEFAULT 0,
  waivers_used INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id)
);

-- =====================================================
-- CREDIT TRANSACTIONS TABLE
-- Audit log of all credit movements
-- =====================================================

CREATE TYPE credit_transaction_type AS ENUM (
  'plan_allocation',      -- Monthly credits from subscription
  'purchase',             -- Bought credit package
  'booking',              -- Used for extra booking
  'waiver',               -- Used for waiver
  'ai_conversation',      -- Used for AI chat
  'refund',               -- Refunded credits
  'adjustment',           -- Manual adjustment
  'expiry'                -- Credits expired
);

CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Transaction details
  amount INTEGER NOT NULL, -- Positive for credit, negative for debit
  type credit_transaction_type NOT NULL,
  description TEXT,
  
  -- References
  booking_id UUID REFERENCES bookings(id),
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Balance snapshot
  balance_before INTEGER,
  balance_after INTEGER,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CREDIT PACKAGES TABLE
-- Available credit packages for purchase
-- =====================================================

CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVOICES TABLE
-- Synced from Stripe
-- =====================================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Stripe IDs
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Invoice details
  invoice_number TEXT,
  status TEXT CHECK (status IN ('draft', 'open', 'paid', 'uncollectible', 'void')),
  
  -- Amounts (in cents)
  amount_due INTEGER DEFAULT 0,
  amount_paid INTEGER DEFAULT 0,
  amount_remaining INTEGER DEFAULT 0,
  subtotal INTEGER DEFAULT 0,
  tax INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  
  -- Currency
  currency TEXT DEFAULT 'usd',
  
  -- Period
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  
  -- URLs
  hosted_invoice_url TEXT,
  invoice_pdf TEXT,
  
  -- Dates
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PAYMENT METHODS TABLE
-- Saved payment methods per organization
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Stripe ID
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  
  -- Card details (safe to store)
  type TEXT DEFAULT 'card',
  brand TEXT,
  last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  
  -- Flags
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INSERT DEFAULT SUBSCRIPTION PLANS
-- =====================================================

INSERT INTO subscription_plans (
  name, slug, stripe_product_id, stripe_price_id_monthly, stripe_price_id_yearly,
  monthly_price, yearly_price, 
  monthly_credits, free_bookings_per_month, free_ai_conversations_per_month,
  transaction_fee_percent, description, is_popular, display_order, features, limits
) VALUES
(
  'Free', 'free', 'prod_TZFhcJ51ZBCqn5', NULL, NULL,
  0, 0,
  0, -1, 0, -- -1 means unlimited
  3.9, 'Perfect for getting started with booking management',
  false, 1,
  '["Unlimited bookings management", "3.9% transaction fee", "3 active games/rooms", "3 staff members", "Basic booking widget", "Standard waivers", "Email support", "Basic reports"]'::jsonb,
  '{"games": 3, "staff": 3, "widgets": 1, "api_access": false}'::jsonb
),
(
  'Starter', 'starter', 'prod_TZFh2Ef5vF308i', 'price_1Sc7CVFajiBPZ08x83pCUGwV', 'price_1Sc7CWFajiBPZ08xfmDqFJy4',
  49, 470,
  100, 30, 30,
  0, 'Perfect for small escape room businesses getting started',
  false, 2,
  '["Up to 30 free bookings/month", "Up to 30 free AI conversations/month", "100 credits/month included", "5 active games/rooms", "5 staff members", "Basic booking widgets (3 templates)", "Standard waivers", "2 credits per extra booking", "Email support", "Basic reports"]'::jsonb,
  '{"games": 5, "staff": 5, "widgets": 3, "api_access": false}'::jsonb
),
(
  'Professional', 'professional', 'prod_TZFhTtqzY0xrjy', 'price_1Sc7CWFajiBPZ08xzjay7l8B', 'price_1Sc7CXFajiBPZ08x0wJh0wwQ',
  99, 950,
  200, 60, 60,
  0, 'Advanced features for growing escape room businesses',
  true, 3,
  '["Up to 60 free bookings/month", "Up to 60 free AI conversations/month", "200 credits/month included", "15 active games/rooms", "25 staff members", "All booking widgets (8 templates)", "Custom waiver templates", "Advanced AI agents", "Priority support", "Advanced analytics"]'::jsonb,
  '{"games": 15, "staff": 25, "widgets": 8, "api_access": false}'::jsonb
),
(
  'Enterprise', 'enterprise', 'prod_TZFhHhLXXUBeJx', NULL, NULL,
  0, 0,
  0, -1, -1, -- -1 means unlimited
  0, 'Complete solution for established escape room chains',
  false, 4,
  '["Unlimited bookings", "Unlimited AI conversations", "Custom credit allocation", "Unlimited games/rooms", "Unlimited staff members", "All widgets with customization", "Custom waiver templates + legal review", "All AI agents", "Dedicated account manager", "24/7 phone support", "API access", "White-label options"]'::jsonb,
  '{"games": -1, "staff": -1, "widgets": -1, "api_access": true}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  monthly_price = EXCLUDED.monthly_price,
  yearly_price = EXCLUDED.yearly_price,
  monthly_credits = EXCLUDED.monthly_credits,
  features = EXCLUDED.features,
  limits = EXCLUDED.limits,
  updated_at = NOW();

-- =====================================================
-- INSERT DEFAULT CREDIT PACKAGES
-- =====================================================

INSERT INTO credit_packages (name, credits, price, stripe_product_id, stripe_price_id, is_active, display_order) VALUES
('Small', 100, 9.99, 'prod_TZFi5yBNYoIjrr', 'price_1Sc7CkFajiBPZ08xXo6nANOw', true, 1),
('Medium', 250, 19.99, 'prod_TZFi1GEaZ6vOQ8', 'price_1Sc7ClFajiBPZ08xGJuucb5O', true, 2),
('Large', 500, 34.99, 'prod_TZFidQiJ4jE6JA', 'price_1Sc7CmFajiBPZ08xRJ3bnHVh', true, 3),
('XLarge', 1000, 59.99, 'prod_TZFilzXL8BY0iW', 'price_1Sc7CnFajiBPZ08xorPw7h4x', true, 4)
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
  p_organization_id UUID,
  p_amount INTEGER,
  p_type credit_transaction_type,
  p_description TEXT DEFAULT NULL,
  p_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance
  SELECT balance INTO v_balance
  FROM credit_balances
  WHERE organization_id = p_organization_id
  FOR UPDATE;
  
  IF v_balance IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check sufficient balance
  IF v_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_balance - p_amount;
  
  -- Update balance
  UPDATE credit_balances
  SET balance = v_new_balance,
      updated_at = NOW()
  WHERE organization_id = p_organization_id;
  
  -- Log transaction
  INSERT INTO credit_transactions (
    organization_id, amount, type, description,
    booking_id, balance_before, balance_after
  ) VALUES (
    p_organization_id, -p_amount, p_type, p_description,
    p_booking_id, v_balance, v_new_balance
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits
CREATE OR REPLACE FUNCTION add_credits(
  p_organization_id UUID,
  p_amount INTEGER,
  p_type credit_transaction_type,
  p_description TEXT DEFAULT NULL,
  p_stripe_payment_intent_id TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance or create if not exists
  INSERT INTO credit_balances (organization_id, balance)
  VALUES (p_organization_id, 0)
  ON CONFLICT (organization_id) DO NOTHING;
  
  SELECT balance INTO v_balance
  FROM credit_balances
  WHERE organization_id = p_organization_id
  FOR UPDATE;
  
  -- Calculate new balance
  v_new_balance := COALESCE(v_balance, 0) + p_amount;
  
  -- Update balance
  UPDATE credit_balances
  SET balance = v_new_balance,
      purchased_credits = purchased_credits + CASE WHEN p_type = 'purchase' THEN p_amount ELSE 0 END,
      plan_credits = plan_credits + CASE WHEN p_type = 'plan_allocation' THEN p_amount ELSE 0 END,
      updated_at = NOW()
  WHERE organization_id = p_organization_id;
  
  -- Log transaction
  INSERT INTO credit_transactions (
    organization_id, amount, type, description,
    stripe_payment_intent_id, balance_before, balance_after
  ) VALUES (
    p_organization_id, p_amount, p_type, p_description,
    p_stripe_payment_intent_id, v_balance, v_new_balance
  );
  
  RETURN v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get credit balance
CREATE OR REPLACE FUNCTION get_credit_balance(p_organization_id UUID)
RETURNS TABLE (
  balance INTEGER,
  plan_credits INTEGER,
  purchased_credits INTEGER,
  bookings_used INTEGER,
  ai_conversations_used INTEGER,
  waivers_used INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cb.balance,
    cb.plan_credits,
    cb.purchased_credits,
    cb.bookings_used,
    cb.ai_conversations_used,
    cb.waivers_used
  FROM credit_balances cb
  WHERE cb.organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-create credit balance for new organizations
CREATE OR REPLACE FUNCTION trigger_create_credit_balance()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO credit_balances (organization_id, balance)
  VALUES (NEW.id, 0)
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_create_credit_balance ON organizations;
CREATE TRIGGER auto_create_credit_balance
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_credit_balance();

-- Auto-create subscription record for new organizations (free plan)
CREATE OR REPLACE FUNCTION trigger_create_subscription()
RETURNS TRIGGER AS $$
DECLARE
  v_free_plan_id UUID;
BEGIN
  SELECT id INTO v_free_plan_id FROM subscription_plans WHERE slug = 'free' LIMIT 1;
  
  INSERT INTO subscriptions (organization_id, plan_id, status)
  VALUES (NEW.id, v_free_plan_id, 'active')
  ON CONFLICT (organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_create_subscription ON organizations;
CREATE TRIGGER auto_create_subscription
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_subscription();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Subscription plans: Everyone can read
CREATE POLICY "Anyone can view subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Credit packages: Everyone can read
CREATE POLICY "Anyone can view credit packages"
  ON credit_packages FOR SELECT
  USING (is_active = true);

-- Subscriptions: Own org only
CREATE POLICY "Users can view own org subscription"
  ON subscriptions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system-admin'
  ));

-- Credit balances: Own org only
CREATE POLICY "Users can view own org credit balance"
  ON credit_balances FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system-admin'
  ));

-- Credit transactions: Own org only
CREATE POLICY "Users can view own org credit transactions"
  ON credit_transactions FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system-admin'
  ));

-- Invoices: Own org only
CREATE POLICY "Users can view own org invoices"
  ON invoices FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system-admin'
  ));

-- Payment methods: Own org only
CREATE POLICY "Users can view own org payment methods"
  ON payment_methods FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'system-admin'
  ));

CREATE POLICY "Users can manage own org payment methods"
  ON payment_methods FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('super-admin', 'org-admin')
  ));

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_credit_balances_org_id ON credit_balances(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_org_id ON credit_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_org_id ON payment_methods(organization_id);

-- =====================================================
-- BACKFILL EXISTING ORGANIZATIONS
-- =====================================================

-- Create credit balances for existing orgs
INSERT INTO credit_balances (organization_id, balance)
SELECT id, 0 FROM organizations
WHERE NOT EXISTS (
  SELECT 1 FROM credit_balances cb WHERE cb.organization_id = organizations.id
)
ON CONFLICT (organization_id) DO NOTHING;

-- Create subscriptions for existing orgs (free plan)
INSERT INTO subscriptions (organization_id, plan_id, status)
SELECT o.id, sp.id, 'active'
FROM organizations o
CROSS JOIN subscription_plans sp
WHERE sp.slug = 'free'
AND NOT EXISTS (
  SELECT 1 FROM subscriptions s WHERE s.organization_id = o.id
)
ON CONFLICT (organization_id) DO NOTHING;

-- =====================================================
-- GRANTS
-- =====================================================

GRANT SELECT ON subscription_plans TO authenticated;
GRANT SELECT ON credit_packages TO authenticated;
GRANT SELECT ON subscriptions TO authenticated;
GRANT SELECT ON credit_balances TO authenticated;
GRANT SELECT ON credit_transactions TO authenticated;
GRANT SELECT ON invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON payment_methods TO authenticated;

GRANT EXECUTE ON FUNCTION deduct_credits(UUID, INTEGER, credit_transaction_type, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION add_credits(UUID, INTEGER, credit_transaction_type, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_credit_balance(UUID) TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 084 complete:';
  RAISE NOTICE '- Created subscription_plans table with default plans';
  RAISE NOTICE '- Created subscriptions table with Stripe integration';
  RAISE NOTICE '- Created credit_balances table';
  RAISE NOTICE '- Created credit_transactions table for audit';
  RAISE NOTICE '- Created credit_packages table';
  RAISE NOTICE '- Created invoices table';
  RAISE NOTICE '- Created payment_methods table';
  RAISE NOTICE '- Created credit management functions';
  RAISE NOTICE '- Created triggers for auto-setup';
  RAISE NOTICE '- Applied RLS policies';
  RAISE NOTICE '- Backfilled existing organizations';
END$$;
