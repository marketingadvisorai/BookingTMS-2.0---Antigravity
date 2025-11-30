-- Migration: Add RPC function for incrementing promo code usage
-- Date: 2025-11-30
-- Description: Adds an RPC function to safely increment promo code usage count

-- ============================================================================
-- RPC FUNCTION: increment_promo_usage
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_promo_usage(
  p_promo_code TEXT,
  p_organization_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE promotions
  SET 
    current_uses = COALESCE(current_uses, 0) + 1,
    updated_at = NOW()
  WHERE 
    code = UPPER(p_promo_code)
    AND organization_id = p_organization_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_promo_usage(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_promo_usage(TEXT, UUID) TO service_role;

-- ============================================================================
-- RPC FUNCTION: decrement_gift_card_balance
-- ============================================================================
CREATE OR REPLACE FUNCTION decrement_gift_card_balance(
  p_gift_card_id UUID,
  p_amount NUMERIC,
  p_booking_id UUID DEFAULT NULL
)
RETURNS TABLE (
  new_balance NUMERIC,
  success BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance NUMERIC;
  v_new_balance NUMERIC;
BEGIN
  -- Get current balance with row lock
  SELECT current_balance INTO v_current_balance
  FROM gift_cards
  WHERE id = p_gift_card_id
  FOR UPDATE;
  
  -- Check if gift card exists and has sufficient balance
  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT 0::NUMERIC, FALSE;
    RETURN;
  END IF;
  
  IF v_current_balance < p_amount THEN
    RETURN QUERY SELECT v_current_balance, FALSE;
    RETURN;
  END IF;
  
  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;
  
  -- Update gift card
  UPDATE gift_cards
  SET 
    current_balance = v_new_balance,
    redeemed_at = CASE WHEN v_new_balance = 0 THEN NOW() ELSE redeemed_at END,
    updated_at = NOW()
  WHERE id = p_gift_card_id;
  
  -- Record transaction
  INSERT INTO gift_card_transactions (
    gift_card_id,
    booking_id,
    amount,
    balance_after,
    transaction_type,
    created_at
  ) VALUES (
    p_gift_card_id,
    p_booking_id,
    -p_amount,
    v_new_balance,
    'redemption',
    NOW()
  );
  
  RETURN QUERY SELECT v_new_balance, TRUE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION decrement_gift_card_balance(UUID, NUMERIC, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION decrement_gift_card_balance(UUID, NUMERIC, UUID) TO service_role;

-- ============================================================================
-- ADD COMMENT
-- ============================================================================
COMMENT ON FUNCTION increment_promo_usage IS 'Safely increments the usage count for a promo code';
COMMENT ON FUNCTION decrement_gift_card_balance IS 'Safely deducts amount from gift card and records transaction';
