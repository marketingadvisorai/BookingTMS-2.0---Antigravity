-- =====================================================
-- Migration: 026_stripe_connect_architecture
-- Purpose: Implement Stripe Connect with Stripe-Owned Pricing Model
-- Date: 2025-11-16
-- Author: Senior Database Team
-- =====================================================

-- =====================================================
-- PART 1: UPDATE ORGANIZATIONS TABLE
-- =====================================================

-- Remove old fields (org-owned keys approach)
ALTER TABLE organizations DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE organizations DROP COLUMN IF EXISTS stripe_publishable_key;
ALTER TABLE organizations DROP COLUMN IF EXISTS stripe_secret_key_vault_id;
ALTER TABLE organizations DROP COLUMN IF EXISTS stripe_webhook_secret;

-- Add Stripe Connect fields
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255) UNIQUE;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_account_type VARCHAR(50) DEFAULT 'standard';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_details_submitted BOOLEAN DEFAULT false;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_requirements_currently_due TEXT[] DEFAULT '{}';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_requirements_eventually_due TEXT[] DEFAULT '{}';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_onboarding_status VARCHAR(50) DEFAULT 'not_started';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_account_created_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_account_updated_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_business_name VARCHAR(255);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_business_url TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_support_email VARCHAR(255);

-- Revenue tracking fields
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS application_fee_percentage DECIMAL(5,2) DEFAULT 0.75;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS application_fee_fixed DECIMAL(10,2) DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_mrr DECIMAL(10,2);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS total_volume_processed DECIMAL(12,2) DEFAULT 0;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS total_application_fees_earned DECIMAL(10,2) DEFAULT 0;

-- Onboarding tracking
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_onboarding_link_expires_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_first_payment_at TIMESTAMPTZ;

-- Compliance and risk
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_risk_level VARCHAR(50);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_verification_status VARCHAR(50);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS stripe_disabled_reason TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_stripe_account ON organizations(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_org_stripe_charges_enabled ON organizations(stripe_charges_enabled) WHERE stripe_charges_enabled = true;
CREATE INDEX IF NOT EXISTS idx_org_stripe_onboarding_status ON organizations(stripe_onboarding_status);
CREATE INDEX IF NOT EXISTS idx_org_application_fee ON organizations(application_fee_percentage);
CREATE INDEX IF NOT EXISTS idx_org_total_volume ON organizations(total_volume_processed);

-- Check constraints
ALTER TABLE organizations ADD CONSTRAINT IF NOT EXISTS chk_application_fee_percentage 
  CHECK (application_fee_percentage >= 0 AND application_fee_percentage <= 100);
ALTER TABLE organizations ADD CONSTRAINT IF NOT EXISTS chk_onboarding_status 
  CHECK (stripe_onboarding_status IN ('not_started', 'pending', 'complete', 'restricted', 'disabled'));

-- Comments
COMMENT ON COLUMN organizations.stripe_account_id IS 'Stripe Connect account ID (acct_xxx) - organization merchant account';
COMMENT ON COLUMN organizations.stripe_charges_enabled IS 'Can accept payments (from account.charges_enabled)';
COMMENT ON COLUMN organizations.stripe_payouts_enabled IS 'Can receive payouts (from account.payouts_enabled)';
COMMENT ON COLUMN organizations.stripe_details_submitted IS 'Completed onboarding (from account.details_submitted)';
COMMENT ON COLUMN organizations.application_fee_percentage IS 'Platform application fee as percentage (0.75 = 0.75% per transaction)';
COMMENT ON COLUMN organizations.total_volume_processed IS 'Total payment volume processed to date (for analytics)';
COMMENT ON COLUMN organizations.total_application_fees_earned IS 'Total application fees earned by platform from this org';
COMMENT ON COLUMN organizations.stripe_onboarding_status IS 'Current status of Stripe onboarding process';

-- =====================================================
-- PART 2: FIX CUSTOMERS TABLE UNIQUE CONSTRAINT
-- =====================================================

-- Remove global unique constraint (CRITICAL BUG FIX)
ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_stripe_customer_id_key;

-- Add compound unique constraint per organization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'customers_org_stripe_customer_unique'
  ) THEN
    ALTER TABLE customers ADD CONSTRAINT customers_org_stripe_customer_unique 
      UNIQUE(organization_id, stripe_customer_id);
  END IF;
END $$;

-- Add Connect-specific fields
ALTER TABLE customers ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_via VARCHAR(50) DEFAULT 'api';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer ON customers(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_org_stripe ON customers(organization_id, stripe_customer_id);

-- Comments
COMMENT ON COLUMN customers.stripe_customer_id IS 'Stripe customer ID on the connected account (cus_xxx)';
COMMENT ON COLUMN customers.stripe_account_id IS 'Which Stripe connected account this customer belongs to';
COMMENT ON CONSTRAINT customers_org_stripe_customer_unique ON customers IS 'Ensures customer IDs are unique per organization connected account';

-- =====================================================
-- PART 3: UPDATE PAYMENTS TABLE
-- =====================================================

-- Add missing organization_id (CRITICAL FIX)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'organization_id'
  ) THEN
    -- Add column as nullable first
    ALTER TABLE payments ADD COLUMN organization_id UUID;
    
    -- Populate from bookings if exists
    UPDATE payments p
    SET organization_id = b.organization_id
    FROM bookings b
    WHERE p.booking_id = b.id AND p.organization_id IS NULL;
    
    -- Make NOT NULL and add FK
    ALTER TABLE payments ALTER COLUMN organization_id SET NOT NULL;
    ALTER TABLE payments ADD CONSTRAINT fk_payments_organization 
      FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add Stripe Connect fields
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS application_fee_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS application_fee_stripe_id VARCHAR(255);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS platform_earning DECIMAL(10,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_referral_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS net_to_merchant DECIMAL(10,2);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_org ON payments(organization_id);
CREATE INDEX IF NOT EXISTS idx_payments_org_status ON payments(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_account ON payments(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_app_fee ON payments(application_fee_amount) WHERE application_fee_amount > 0;

-- Comments
COMMENT ON COLUMN payments.organization_id IS 'Organization that received this payment (REQUIRED for RLS and queries)';
COMMENT ON COLUMN payments.stripe_account_id IS 'Stripe connected account that processed this payment (acct_xxx)';
COMMENT ON COLUMN payments.application_fee_amount IS 'Application fee charged to merchant (platform revenue)';
COMMENT ON COLUMN payments.application_fee_stripe_id IS 'Stripe application fee ID (fee_xxx)';
COMMENT ON COLUMN payments.platform_earning IS 'Total platform earning (app fee + estimated referral fee)';
COMMENT ON COLUMN payments.stripe_referral_fee IS 'Estimated Stripe referral fee paid to platform';
COMMENT ON COLUMN payments.net_to_merchant IS 'Net amount merchant receives after all fees';

-- =====================================================
-- PART 4: CREATE PLATFORM REVENUE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS platform_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Revenue breakdown
  revenue_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Stripe references
  stripe_account_id VARCHAR(255),
  stripe_payment_intent_id VARCHAR(255),
  stripe_application_fee_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT chk_revenue_type CHECK (revenue_type IN ('application_fee', 'referral_fee', 'subscription', 'usage_fee', 'addon_fee')),
  CONSTRAINT chk_amount_positive CHECK (amount >= 0)
);

-- Indexes
CREATE INDEX idx_platform_revenue_org ON platform_revenue(organization_id);
CREATE INDEX idx_platform_revenue_type ON platform_revenue(revenue_type);
CREATE INDEX idx_platform_revenue_earned_at ON platform_revenue(earned_at);
CREATE INDEX idx_platform_revenue_payment ON platform_revenue(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX idx_platform_revenue_amount ON platform_revenue(amount);

-- RLS Policies
ALTER TABLE platform_revenue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_team_all_revenue" ON platform_revenue;
CREATE POLICY "platform_team_all_revenue"
  ON platform_revenue FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_team = true));

-- Trigger for updated_at
CREATE TRIGGER update_platform_revenue_updated_at
  BEFORE UPDATE ON platform_revenue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE platform_revenue IS 'Tracks all platform revenue: application fees, referral fees, subscriptions';
COMMENT ON COLUMN platform_revenue.revenue_type IS 'Type of revenue: application_fee (per transaction), referral_fee (from Stripe), subscription (monthly), usage_fee, addon_fee';
COMMENT ON COLUMN platform_revenue.amount IS 'Revenue amount in dollars';
COMMENT ON COLUMN platform_revenue.stripe_application_fee_id IS 'Stripe Application Fee ID (fee_xxx) if type is application_fee';

-- =====================================================
-- PART 5: UPDATE STRIPE WEBHOOK EVENTS TABLE
-- =====================================================

-- Add organization tracking
ALTER TABLE stripe_webhook_events ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE stripe_webhook_events ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);
ALTER TABLE stripe_webhook_events ADD COLUMN IF NOT EXISTS event_source VARCHAR(50) DEFAULT 'platform';
ALTER TABLE stripe_webhook_events ADD COLUMN IF NOT EXISTS processing_error TEXT;
ALTER TABLE stripe_webhook_events ADD COLUMN IF NOT EXISTS retry_count INT DEFAULT 0;
ALTER TABLE stripe_webhook_events ADD COLUMN IF NOT EXISTS processing_duration_ms INT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_webhook_org_event ON stripe_webhook_events(organization_id, event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_type ON stripe_webhook_events(type);
CREATE INDEX IF NOT EXISTS idx_webhook_processed ON stripe_webhook_events(processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_webhook_created_at ON stripe_webhook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_retry ON stripe_webhook_events(retry_count) WHERE retry_count > 0;

-- Comments
COMMENT ON COLUMN stripe_webhook_events.organization_id IS 'Organization associated with this webhook event (if from connected account)';
COMMENT ON COLUMN stripe_webhook_events.stripe_account_id IS 'Stripe connected account ID (acct_xxx) if event is from connected account';
COMMENT ON COLUMN stripe_webhook_events.event_source IS 'Source: platform (our account) or connected_account';

-- =====================================================
-- PART 6: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to calculate application fee
CREATE OR REPLACE FUNCTION calculate_application_fee(
  p_organization_id UUID,
  p_amount DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
  v_fee_percentage DECIMAL;
  v_fee_fixed DECIMAL;
  v_total_fee DECIMAL;
BEGIN
  -- Get org's fee settings
  SELECT application_fee_percentage, application_fee_fixed
  INTO v_fee_percentage, v_fee_fixed
  FROM organizations
  WHERE id = p_organization_id;
  
  -- Calculate fee
  v_total_fee := (p_amount * v_fee_percentage / 100) + COALESCE(v_fee_fixed, 0);
  
  RETURN ROUND(v_total_fee, 2);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calculate_application_fee IS 'Calculate application fee for a transaction based on org settings';

-- Function to update org payment stats
CREATE OR REPLACE FUNCTION update_organization_payment_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- Update organization stats
    UPDATE organizations
    SET 
      total_volume_processed = COALESCE(total_volume_processed, 0) + NEW.amount,
      total_application_fees_earned = COALESCE(total_application_fees_earned, 0) + COALESCE(NEW.application_fee_amount, 0),
      stripe_first_payment_at = COALESCE(stripe_first_payment_at, NOW())
    WHERE id = NEW.organization_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_org_stats_on_payment ON payments;
CREATE TRIGGER update_org_stats_on_payment
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_payment_stats();

COMMENT ON FUNCTION update_organization_payment_stats IS 'Updates organization payment statistics when payment status changes to paid';

-- Function to track platform revenue automatically
CREATE OR REPLACE FUNCTION track_platform_revenue()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') AND NEW.application_fee_amount > 0 THEN
    -- Track application fee revenue
    INSERT INTO platform_revenue (
      organization_id,
      payment_id,
      booking_id,
      revenue_type,
      amount,
      currency,
      stripe_account_id,
      stripe_payment_intent_id,
      stripe_application_fee_id,
      description,
      earned_at
    ) VALUES (
      NEW.organization_id,
      NEW.id,
      NEW.booking_id,
      'application_fee',
      NEW.application_fee_amount,
      NEW.currency,
      NEW.stripe_account_id,
      NEW.stripe_payment_intent_id,
      NEW.application_fee_stripe_id,
      'Application fee from booking payment',
      NOW()
    );
    
    -- Track estimated referral fee (if applicable)
    IF NEW.stripe_referral_fee > 0 THEN
      INSERT INTO platform_revenue (
        organization_id,
        payment_id,
        revenue_type,
        amount,
        currency,
        stripe_account_id,
        stripe_payment_intent_id,
        description,
        earned_at
      ) VALUES (
        NEW.organization_id,
        NEW.id,
        'referral_fee',
        NEW.stripe_referral_fee,
        NEW.currency,
        NEW.stripe_account_id,
        NEW.stripe_payment_intent_id,
        'Estimated Stripe referral fee',
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS track_revenue_on_payment ON payments;
CREATE TRIGGER track_revenue_on_payment
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION track_platform_revenue();

COMMENT ON FUNCTION track_platform_revenue IS 'Automatically tracks platform revenue when payment is completed';

-- =====================================================
-- PART 7: UPDATE RLS POLICIES
-- =====================================================

-- Update payments RLS to use organization_id
DROP POLICY IF EXISTS "org_users_view_payments" ON payments;
CREATE POLICY "org_users_view_payments"
  ON payments FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "platform_team_all_payments" ON payments;
CREATE POLICY "platform_team_all_payments"
  ON payments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_team = true)
  );

-- =====================================================
-- PART 8: CREATE ANALYTICS VIEWS
-- =====================================================

-- View: Organization revenue summary
CREATE OR REPLACE VIEW organization_revenue_summary AS
SELECT 
  o.id as organization_id,
  o.name as organization_name,
  o.stripe_account_id,
  o.stripe_charges_enabled,
  o.stripe_onboarding_status,
  o.application_fee_percentage,
  o.total_volume_processed,
  o.total_application_fees_earned,
  COUNT(DISTINCT p.id) as total_payments,
  COUNT(DISTINCT b.id) as total_bookings,
  SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) as total_revenue,
  SUM(CASE WHEN p.status = 'paid' THEN p.application_fee_amount ELSE 0 END) as total_app_fees,
  AVG(CASE WHEN p.status = 'paid' THEN p.amount ELSE NULL END) as average_transaction,
  MAX(p.created_at) as last_payment_at
FROM organizations o
LEFT JOIN payments p ON p.organization_id = o.id
LEFT JOIN bookings b ON b.organization_id = o.id
GROUP BY o.id, o.name, o.stripe_account_id, o.stripe_charges_enabled, 
         o.stripe_onboarding_status, o.application_fee_percentage,
         o.total_volume_processed, o.total_application_fees_earned;

COMMENT ON VIEW organization_revenue_summary IS 'Summary of revenue and payment statistics per organization';

-- View: Platform revenue summary
CREATE OR REPLACE VIEW platform_revenue_summary AS
SELECT 
  DATE_TRUNC('month', earned_at) as month,
  revenue_type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  AVG(amount) as average_amount,
  MIN(amount) as min_amount,
  MAX(amount) as max_amount
FROM platform_revenue
GROUP BY DATE_TRUNC('month', earned_at), revenue_type
ORDER BY month DESC, revenue_type;

COMMENT ON VIEW platform_revenue_summary IS 'Monthly summary of platform revenue by type';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Migration 026_stripe_connect_architecture completed successfully';
  RAISE NOTICE 'Stripe Connect with Stripe-Owned Pricing Model is now configured';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Deploy Edge Functions for Stripe Connect';
  RAISE NOTICE '2. Configure STRIPE_SECRET_KEY environment variable';
  RAISE NOTICE '3. Configure STRIPE_WEBHOOK_SECRET environment variable';
  RAISE NOTICE '4. Test onboarding flow';
  RAISE NOTICE '5. Test payment processing with application fees';
END $$;
