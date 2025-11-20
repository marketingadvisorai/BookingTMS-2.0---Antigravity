-- Stripe Connect Accounts Table
-- Stores connected account information and metadata

CREATE TABLE IF NOT EXISTS public.stripe_connected_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Link to owner (account in your system)
  owner_id UUID NOT NULL REFERENCES public.owners(id) ON DELETE CASCADE,
  
  -- Stripe Account Information
  stripe_account_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_account_type VARCHAR(50) NOT NULL CHECK (stripe_account_type IN ('express', 'custom', 'standard')),
  
  -- Account Details
  account_email VARCHAR(255),
  account_country VARCHAR(2),
  business_type VARCHAR(50),
  charges_enabled BOOLEAN DEFAULT FALSE,
  payouts_enabled BOOLEAN DEFAULT FALSE,
  details_submitted BOOLEAN DEFAULT FALSE,
  
  -- Verification Status
  verification_status VARCHAR(50) DEFAULT 'pending',
  verification_fields_needed TEXT[], -- Array of fields needed for verification
  
  -- Fee Configuration (platform fees on top of Stripe)
  platform_fee_percent DECIMAL(5, 2) DEFAULT 0.00,
  platform_fee_fixed_cents INTEGER DEFAULT 0,
  
  -- Payout Configuration
  payout_interval VARCHAR(50) DEFAULT 'daily',
  payout_delay_days INTEGER DEFAULT 2,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'restricted', 'inactive')),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  onboarded_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes
  CONSTRAINT unique_owner_stripe_account UNIQUE(owner_id, stripe_account_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_stripe_connected_accounts_owner ON public.stripe_connected_accounts(owner_id);
CREATE INDEX idx_stripe_connected_accounts_stripe_id ON public.stripe_connected_accounts(stripe_account_id);
CREATE INDEX idx_stripe_connected_accounts_status ON public.stripe_connected_accounts(status);
CREATE INDEX idx_stripe_connected_accounts_created ON public.stripe_connected_accounts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.stripe_connected_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin policy: Full access for service role
CREATE POLICY "Service role has full access to stripe connected accounts"
  ON public.stripe_connected_accounts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Owner policy: Owners can view their own connected accounts
CREATE POLICY "Owners can view their own connected accounts"
  ON public.stripe_connected_accounts
  FOR SELECT
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM public.owners WHERE user_id = auth.uid()
    )
  );

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_stripe_connected_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_stripe_connected_accounts_updated_at
  BEFORE UPDATE ON public.stripe_connected_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_connected_accounts_updated_at();

-- ============================================================
-- Stripe Account Balances Table (Cache)
-- Stores cached balance data for performance
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stripe_account_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Link to connected account
  stripe_account_id VARCHAR(255) NOT NULL REFERENCES public.stripe_connected_accounts(stripe_account_id) ON DELETE CASCADE,
  
  -- Balance Information (in cents)
  available_balance_cents INTEGER DEFAULT 0,
  pending_balance_cents INTEGER DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'usd',
  
  -- Payout Information
  pending_payouts_count INTEGER DEFAULT 0,
  last_payout_date TIMESTAMP WITH TIME ZONE,
  last_payout_amount_cents INTEGER,
  
  -- Dispute Information
  active_disputes_count INTEGER DEFAULT 0,
  
  -- Sync Information
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Ensure one balance record per account
  CONSTRAINT unique_stripe_account_balance UNIQUE(stripe_account_id)
);

-- Create indexes
CREATE INDEX idx_stripe_account_balances_account ON public.stripe_account_balances(stripe_account_id);
CREATE INDEX idx_stripe_account_balances_synced ON public.stripe_account_balances(last_synced_at DESC);

-- Enable RLS
ALTER TABLE public.stripe_account_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access to stripe account balances"
  ON public.stripe_account_balances
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Owners can view their account balances"
  ON public.stripe_account_balances
  FOR SELECT
  TO authenticated
  USING (
    stripe_account_id IN (
      SELECT sca.stripe_account_id 
      FROM public.stripe_connected_accounts sca
      JOIN public.owners o ON sca.owner_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

-- Update trigger
CREATE TRIGGER set_stripe_account_balances_updated_at
  BEFORE UPDATE ON public.stripe_account_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_stripe_connected_accounts_updated_at();

-- ============================================================
-- Stripe Transactions Log Table
-- Stores recent transaction history for quick access
-- ============================================================

CREATE TABLE IF NOT EXISTS public.stripe_transactions_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Link to connected account
  stripe_account_id VARCHAR(255) NOT NULL REFERENCES public.stripe_connected_accounts(stripe_account_id) ON DELETE CASCADE,
  
  -- Transaction Details
  stripe_transaction_id VARCHAR(255) UNIQUE NOT NULL,
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('charge', 'payout', 'refund', 'dispute', 'transfer', 'fee')),
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50),
  description TEXT,
  
  -- Related IDs
  customer_id VARCHAR(255),
  payment_intent_id VARCHAR(255),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Indexes
  CONSTRAINT idx_stripe_transactions_account_date UNIQUE(stripe_account_id, stripe_transaction_id)
);

-- Create indexes for fast queries
CREATE INDEX idx_stripe_transactions_account ON public.stripe_transactions_log(stripe_account_id);
CREATE INDEX idx_stripe_transactions_type ON public.stripe_transactions_log(transaction_type);
CREATE INDEX idx_stripe_transactions_date ON public.stripe_transactions_log(transaction_date DESC);
CREATE INDEX idx_stripe_transactions_status ON public.stripe_transactions_log(status);

-- Enable RLS
ALTER TABLE public.stripe_transactions_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role has full access to stripe transactions"
  ON public.stripe_transactions_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Owners can view their transactions"
  ON public.stripe_transactions_log
  FOR SELECT
  TO authenticated
  USING (
    stripe_account_id IN (
      SELECT sca.stripe_account_id 
      FROM public.stripe_connected_accounts sca
      JOIN public.owners o ON sca.owner_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

-- ============================================================
-- Views for easier querying
-- ============================================================

-- View: Connected accounts with latest balance
CREATE OR REPLACE VIEW public.stripe_accounts_with_balances AS
SELECT 
  sca.*,
  sab.available_balance_cents,
  sab.pending_balance_cents,
  sab.currency,
  sab.pending_payouts_count,
  sab.last_payout_date,
  sab.active_disputes_count,
  sab.last_synced_at,
  o.account_name as owner_name,
  o.account_email as owner_email
FROM public.stripe_connected_accounts sca
LEFT JOIN public.stripe_account_balances sab ON sca.stripe_account_id = sab.stripe_account_id
LEFT JOIN public.owners o ON sca.owner_id = o.id;

-- Grant access to view
GRANT SELECT ON public.stripe_accounts_with_balances TO authenticated, service_role;

-- ============================================================
-- Functions for common operations
-- ============================================================

-- Function: Update or create balance record
CREATE OR REPLACE FUNCTION public.upsert_stripe_account_balance(
  p_stripe_account_id VARCHAR(255),
  p_available_cents INTEGER,
  p_pending_cents INTEGER,
  p_currency VARCHAR(3),
  p_pending_payouts INTEGER DEFAULT 0,
  p_active_disputes INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_balance_id UUID;
BEGIN
  INSERT INTO public.stripe_account_balances (
    stripe_account_id,
    available_balance_cents,
    pending_balance_cents,
    currency,
    pending_payouts_count,
    active_disputes_count,
    last_synced_at
  )
  VALUES (
    p_stripe_account_id,
    p_available_cents,
    p_pending_cents,
    p_currency,
    p_pending_payouts,
    p_active_disputes,
    TIMEZONE('utc', NOW())
  )
  ON CONFLICT (stripe_account_id)
  DO UPDATE SET
    available_balance_cents = EXCLUDED.available_balance_cents,
    pending_balance_cents = EXCLUDED.pending_balance_cents,
    currency = EXCLUDED.currency,
    pending_payouts_count = EXCLUDED.pending_payouts_count,
    active_disputes_count = EXCLUDED.active_disputes_count,
    last_synced_at = EXCLUDED.last_synced_at,
    updated_at = TIMEZONE('utc', NOW())
  RETURNING id INTO v_balance_id;
  
  RETURN v_balance_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.upsert_stripe_account_balance TO service_role;

COMMENT ON TABLE public.stripe_connected_accounts IS 'Stores Stripe Connect account information for platform connected accounts';
COMMENT ON TABLE public.stripe_account_balances IS 'Cached balance data for connected accounts to reduce API calls';
COMMENT ON TABLE public.stripe_transactions_log IS 'Transaction history log for connected accounts';
