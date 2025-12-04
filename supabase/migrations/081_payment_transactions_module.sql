-- =====================================================
-- Migration: 081_payment_transactions_module
-- Purpose: Payment transaction tracking and reconciliation
-- Date: 2025-12-04
-- =====================================================

-- =====================================================
-- PAYMENT TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  -- Transaction identifiers
  transaction_ref VARCHAR(100) NOT NULL UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  
  -- Transaction type
  type VARCHAR(50) NOT NULL CHECK (type IN ('payment', 'refund', 'partial_refund', 'chargeback', 'fee')),
  
  -- Amount details
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  fee_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2),
  
  -- Refund tracking
  refund_amount DECIMAL(10,2) DEFAULT 0,
  refund_reason VARCHAR(100),
  refund_notes TEXT,
  refunded_at TIMESTAMPTZ,
  refunded_by UUID REFERENCES users(id),
  
  -- Payment method
  payment_method VARCHAR(50), -- card, bank_transfer, cash, etc.
  card_brand VARCHAR(50),
  card_last4 VARCHAR(4),
  card_exp_month INT,
  card_exp_year INT,
  
  -- Status tracking
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled',
    'refunded', 'partially_refunded', 'disputed', 'chargeback'
  )),
  
  -- Customer info (denormalized for history)
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  
  -- Invoice
  invoice_number VARCHAR(100),
  invoice_url TEXT,
  receipt_url TEXT,
  
  -- Reconciliation
  reconciled BOOLEAN DEFAULT FALSE,
  reconciled_at TIMESTAMPTZ,
  reconciled_by UUID REFERENCES users(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_trans_org ON payment_transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_trans_booking ON payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_trans_customer ON payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_trans_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_trans_type ON payment_transactions(type);
CREATE INDEX IF NOT EXISTS idx_payment_trans_date ON payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_trans_reconciled ON payment_transactions(reconciled) WHERE reconciled = FALSE;
CREATE INDEX IF NOT EXISTS idx_payment_trans_stripe ON payment_transactions(stripe_payment_intent_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Calculate net amount
CREATE OR REPLACE FUNCTION calculate_net_amount()
RETURNS TRIGGER AS $$
BEGIN
  NEW.net_amount := NEW.amount - COALESCE(NEW.fee_amount, 0) - COALESCE(NEW.refund_amount, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_payment_net_amount
  BEFORE INSERT OR UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION calculate_net_amount();

CREATE TRIGGER update_payment_trans_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Platform admins see all
CREATE POLICY "Platform admins manage all payment transactions"
  ON payment_transactions FOR ALL
  USING (is_platform_admin());

-- Org admins see their org
CREATE POLICY "Org admins manage own payment transactions"
  ON payment_transactions FOR ALL
  USING (organization_id = get_my_organization_id_safe());

-- Org members can view
CREATE POLICY "Org members view payment transactions"
  ON payment_transactions FOR SELECT
  USING (organization_id = get_my_organization_id_safe());

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get payment stats
CREATE OR REPLACE FUNCTION get_payment_stats(
  p_organization_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_revenue DECIMAL,
  total_refunds DECIMAL,
  net_revenue DECIMAL,
  transaction_count BIGINT,
  avg_transaction_value DECIMAL,
  success_rate DECIMAL,
  pending_count BIGINT,
  failed_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN pt.type = 'payment' AND pt.status = 'completed' THEN pt.amount ELSE 0 END), 0)::DECIMAL as total_revenue,
    COALESCE(SUM(CASE WHEN pt.type IN ('refund', 'partial_refund') THEN pt.amount ELSE 0 END), 0)::DECIMAL as total_refunds,
    COALESCE(SUM(CASE WHEN pt.status = 'completed' THEN pt.net_amount ELSE 0 END), 0)::DECIMAL as net_revenue,
    COUNT(*)::BIGINT as transaction_count,
    COALESCE(AVG(CASE WHEN pt.type = 'payment' THEN pt.amount END), 0)::DECIMAL as avg_transaction_value,
    CASE WHEN COUNT(*) > 0 THEN 
      (COUNT(*) FILTER (WHERE pt.status = 'completed')::DECIMAL / COUNT(*)::DECIMAL * 100)
    ELSE 0 END::DECIMAL as success_rate,
    COUNT(*) FILTER (WHERE pt.status = 'pending')::BIGINT as pending_count,
    COUNT(*) FILTER (WHERE pt.status = 'failed')::BIGINT as failed_count
  FROM payment_transactions pt
  WHERE pt.organization_id = p_organization_id
    AND pt.created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get reconciliation summary
CREATE OR REPLACE FUNCTION get_reconciliation_summary(p_organization_id UUID)
RETURNS TABLE (
  reconciled_count BIGINT,
  reconciled_amount DECIMAL,
  unreconciled_count BIGINT,
  unreconciled_amount DECIMAL,
  last_reconciled_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE pt.reconciled = TRUE)::BIGINT as reconciled_count,
    COALESCE(SUM(CASE WHEN pt.reconciled = TRUE THEN pt.amount ELSE 0 END), 0)::DECIMAL as reconciled_amount,
    COUNT(*) FILTER (WHERE pt.reconciled = FALSE AND pt.status = 'completed')::BIGINT as unreconciled_count,
    COALESCE(SUM(CASE WHEN pt.reconciled = FALSE AND pt.status = 'completed' THEN pt.amount ELSE 0 END), 0)::DECIMAL as unreconciled_amount,
    MAX(pt.reconciled_at) as last_reconciled_date
  FROM payment_transactions pt
  WHERE pt.organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generate transaction ref
CREATE OR REPLACE FUNCTION generate_transaction_ref()
RETURNS VARCHAR AS $$
DECLARE
  v_ref VARCHAR;
BEGIN
  v_ref := 'TXN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8));
  RETURN v_ref;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_payment_stats(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated;
GRANT EXECUTE ON FUNCTION get_reconciliation_summary(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_transaction_ref() TO authenticated;

-- =====================================================
-- REAL-TIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE payment_transactions;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 081 complete:';
  RAISE NOTICE '- payment_transactions table created';
  RAISE NOTICE '- RLS policies configured';
  RAISE NOTICE '- Helper functions created';
  RAISE NOTICE '- Real-time enabled';
END$$;
