-- Migration: Create Payment Tables for Stripe Integration
-- Created: 2025-11-09

-- Add Stripe customer ID to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_customers_stripe_id ON customers(stripe_customer_id);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id),
  
  -- Stripe IDs
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  payment_method_type VARCHAR(50),
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  
  CONSTRAINT valid_payment_status CHECK (status IN (
    'pending', 'processing', 'succeeded', 
    'failed', 'canceled', 'refunded', 'partially_refunded'
  ))
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id),
  
  -- Stripe IDs
  stripe_refund_id VARCHAR(255) UNIQUE,
  stripe_payment_intent_id VARCHAR(255),
  
  -- Refund Details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  reason VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  processed_by UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_refund_status CHECK (status IN (
    'pending', 'succeeded', 'failed', 'canceled'
  )),
  CONSTRAINT valid_refund_reason CHECK (reason IN (
    'duplicate', 'fraudulent', 'requested_by_customer', 'other'
  ))
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_booking ON refunds(booking_id);
CREATE INDEX IF NOT EXISTS idx_refunds_stripe_id ON refunds(stripe_refund_id);

-- Add payment fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Add Stripe IDs to games table
ALTER TABLE games
ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_games_stripe_product ON games(stripe_product_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_refunds_updated_at ON refunds;
CREATE TRIGGER update_refunds_updated_at 
    BEFORE UPDATE ON refunds 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM customers WHERE id = customer_id
  ));

CREATE POLICY "Service role can manage all payments"
  ON payments FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for refunds
CREATE POLICY "Users can view their own refunds"
  ON refunds FOR SELECT
  USING (auth.uid() IN (
    SELECT user_id FROM customers 
    WHERE id IN (SELECT customer_id FROM payments WHERE id = payment_id)
  ));

CREATE POLICY "Service role can manage all refunds"
  ON refunds FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Comments
COMMENT ON TABLE payments IS 'Stores all payment transactions processed through Stripe';
COMMENT ON TABLE refunds IS 'Stores all refund transactions';
COMMENT ON COLUMN customers.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN bookings.payment_status IS 'Payment status: pending, paid, failed, refunded';
