-- ============================================================================
-- Migration 085: Platform Fee System
-- ============================================================================
-- Implements the platform management fee system with two modes:
-- 1. Organization absorbs fees (customer pays face value)
-- 2. Pass fees to customer (customer pays ticket + fees)
--
-- Fee Structure:
-- - Platform Management Fee: 1.29% per ticket sale
-- - Stripe Processing Fee: 2.9% + $0.30 (standard)
-- ============================================================================

-- Add fee payment mode and fee configuration columns to organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS fee_payment_mode VARCHAR(20) DEFAULT 'pass_to_customer'
    CHECK (fee_payment_mode IN ('absorb', 'pass_to_customer')),
ADD COLUMN IF NOT EXISTS platform_fee_percent NUMERIC(5,3) DEFAULT 1.29,
ADD COLUMN IF NOT EXISTS stripe_fee_percent NUMERIC(5,2) DEFAULT 2.9,
ADD COLUMN IF NOT EXISTS stripe_fee_fixed NUMERIC(10,2) DEFAULT 0.30,
ADD COLUMN IF NOT EXISTS show_fee_breakdown BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS fee_label VARCHAR(100) DEFAULT 'Service Fee';

-- Add comment explaining fee modes
COMMENT ON COLUMN organizations.fee_payment_mode IS 
'Fee payment mode: "absorb" = org pays all fees, "pass_to_customer" = customer pays fees on top';

COMMENT ON COLUMN organizations.platform_fee_percent IS 
'Platform management fee percentage (default 1.29%)';

COMMENT ON COLUMN organizations.stripe_fee_percent IS 
'Stripe processing fee percentage (default 2.9%)';

COMMENT ON COLUMN organizations.stripe_fee_fixed IS 
'Stripe fixed fee per transaction (default $0.30)';

COMMENT ON COLUMN organizations.show_fee_breakdown IS 
'Whether to show itemized fee breakdown to customers during checkout';

COMMENT ON COLUMN organizations.fee_label IS 
'Customer-facing label for the service fee (e.g., "Service Fee", "Booking Fee")';

-- Add fee tracking columns to bookings
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stripe_fee NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_fees NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fee_payment_mode VARCHAR(20),
ADD COLUMN IF NOT EXISTS customer_paid_fees BOOLEAN DEFAULT false;

COMMENT ON COLUMN bookings.subtotal IS 'Original ticket price before fees';
COMMENT ON COLUMN bookings.platform_fee IS 'Platform management fee amount (1.29%)';
COMMENT ON COLUMN bookings.stripe_fee IS 'Stripe processing fee amount';
COMMENT ON COLUMN bookings.total_fees IS 'Total fees charged (platform + stripe)';
COMMENT ON COLUMN bookings.fee_payment_mode IS 'Fee mode at time of booking';
COMMENT ON COLUMN bookings.customer_paid_fees IS 'Whether customer paid the fees';

-- Create function to calculate fees
CREATE OR REPLACE FUNCTION calculate_booking_fees(
    p_subtotal NUMERIC,
    p_fee_payment_mode VARCHAR DEFAULT 'pass_to_customer',
    p_platform_fee_percent NUMERIC DEFAULT 1.29,
    p_stripe_fee_percent NUMERIC DEFAULT 2.9,
    p_stripe_fee_fixed NUMERIC DEFAULT 0.30
)
RETURNS TABLE(
    subtotal NUMERIC,
    platform_fee NUMERIC,
    stripe_fee NUMERIC,
    total_fees NUMERIC,
    customer_total NUMERIC,
    org_receives NUMERIC
) AS $$
DECLARE
    v_platform_fee NUMERIC;
    v_stripe_fee NUMERIC;
    v_total_fees NUMERIC;
    v_customer_total NUMERIC;
    v_org_receives NUMERIC;
BEGIN
    -- Calculate platform fee (1.29% of subtotal)
    v_platform_fee := ROUND(p_subtotal * (p_platform_fee_percent / 100), 2);
    
    IF p_fee_payment_mode = 'pass_to_customer' THEN
        -- Customer pays fees on top
        -- Need to calculate Stripe fee on total (including fees)
        -- Formula: total = subtotal + platform_fee + stripe_fee
        -- stripe_fee = (total * stripe_percent/100) + fixed_fee
        -- total = subtotal + platform_fee + (total * stripe_percent/100) + fixed_fee
        -- total * (1 - stripe_percent/100) = subtotal + platform_fee + fixed_fee
        -- total = (subtotal + platform_fee + fixed_fee) / (1 - stripe_percent/100)
        
        v_customer_total := ROUND(
            (p_subtotal + v_platform_fee + p_stripe_fee_fixed) / 
            (1 - p_stripe_fee_percent / 100), 
            2
        );
        v_stripe_fee := ROUND(v_customer_total - p_subtotal - v_platform_fee, 2);
        v_total_fees := v_platform_fee + v_stripe_fee;
        v_org_receives := p_subtotal;
    ELSE
        -- Organization absorbs fees
        -- Customer pays face value, org absorbs platform + stripe fees
        v_customer_total := p_subtotal;
        v_stripe_fee := ROUND((p_subtotal * (p_stripe_fee_percent / 100)) + p_stripe_fee_fixed, 2);
        v_total_fees := v_platform_fee + v_stripe_fee;
        v_org_receives := p_subtotal - v_total_fees;
    END IF;
    
    RETURN QUERY SELECT 
        p_subtotal AS subtotal,
        v_platform_fee AS platform_fee,
        v_stripe_fee AS stripe_fee,
        v_total_fees AS total_fees,
        v_customer_total AS customer_total,
        v_org_receives AS org_receives;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to get organization fee settings
CREATE OR REPLACE FUNCTION get_org_fee_settings(p_organization_id UUID)
RETURNS TABLE(
    fee_payment_mode VARCHAR,
    platform_fee_percent NUMERIC,
    stripe_fee_percent NUMERIC,
    stripe_fee_fixed NUMERIC,
    show_fee_breakdown BOOLEAN,
    fee_label VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(o.fee_payment_mode, 'pass_to_customer')::VARCHAR,
        COALESCE(o.platform_fee_percent, 1.29)::NUMERIC,
        COALESCE(o.stripe_fee_percent, 2.9)::NUMERIC,
        COALESCE(o.stripe_fee_fixed, 0.30)::NUMERIC,
        COALESCE(o.show_fee_breakdown, true)::BOOLEAN,
        COALESCE(o.fee_label, 'Service Fee')::VARCHAR
    FROM organizations o
    WHERE o.id = p_organization_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create index for fee queries
CREATE INDEX IF NOT EXISTS idx_bookings_fee_payment_mode ON bookings(fee_payment_mode);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_paid_fees ON bookings(customer_paid_fees);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_booking_fees TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_org_fee_settings TO authenticated, anon;

-- ============================================================================
-- Stripe Compliance Notice
-- ============================================================================
-- Per Stripe's guidelines on surcharging and convenience fees:
-- https://stripe.com/docs/connect/statement-descriptors#fee-transparency
--
-- When passing fees to customers, you MUST:
-- 1. Clearly disclose fees BEFORE the customer enters payment info
-- 2. Show itemized breakdown (subtotal, service fee, total)
-- 3. The fee must be clearly labeled and not exceed actual costs
-- 4. Some card networks (Visa, Mastercard) have specific rules
--
-- The UI implementation includes:
-- - Fee breakdown in checkout summary
-- - Clear labeling of "Service Fee" or custom label
-- - Pre-checkout disclosure before payment
-- ============================================================================
