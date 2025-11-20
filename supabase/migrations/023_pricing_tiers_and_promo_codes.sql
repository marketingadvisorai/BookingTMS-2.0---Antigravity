-- =====================================================
-- PRICING TIERS AND PROMO CODES SYSTEM
-- Version: 0.2.3
-- Description: Multiple pricing options and promo code system
-- Date: 2025-01-13
-- =====================================================

-- =====================================================
-- 1. PRICING TIERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  
  -- Tier details
  tier_type VARCHAR(50) NOT NULL, -- 'adult', 'child', 'veteran', 'senior', 'student', 'custom'
  tier_name VARCHAR(100) NOT NULL,
  tier_description TEXT,
  
  -- Pricing
  price NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Stripe integration
  stripe_price_id VARCHAR(255),
  price_lookup_key VARCHAR(255),
  
  -- Eligibility
  min_age INTEGER,
  max_age INTEGER,
  requires_verification BOOLEAN DEFAULT false,
  verification_type VARCHAR(50), -- 'id', 'military_id', 'student_id', etc.
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false, -- One default tier per game
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_game_tier_type UNIQUE(game_id, tier_type),
  CONSTRAINT valid_tier_type CHECK (tier_type IN ('adult', 'child', 'veteran', 'senior', 'student', 'group', 'custom'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_org ON pricing_tiers(organization_id);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_game ON pricing_tiers(game_id);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_type ON pricing_tiers(tier_type);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_active ON pricing_tiers(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_lookup_key ON pricing_tiers(price_lookup_key);

-- =====================================================
-- 2. PROMO CODES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Code details
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Discount
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount', 'free_game'
  discount_value NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Stripe integration
  stripe_coupon_id VARCHAR(255),
  stripe_promotion_code_id VARCHAR(255),
  
  -- Applicability
  applies_to VARCHAR(20) DEFAULT 'all', -- 'all', 'specific_games', 'specific_venues'
  game_ids UUID[] DEFAULT '{}',
  venue_ids UUID[] DEFAULT '{}',
  tier_types VARCHAR(50)[] DEFAULT '{}', -- Which pricing tiers can use this
  
  -- Usage limits
  max_uses INTEGER, -- NULL = unlimited
  uses_count INTEGER DEFAULT 0,
  max_uses_per_customer INTEGER DEFAULT 1,
  min_purchase_amount NUMERIC(10,2),
  
  -- Validity period
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_archived BOOLEAN DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  CONSTRAINT valid_discount_type CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_game')),
  CONSTRAINT valid_applies_to CHECK (applies_to IN ('all', 'specific_games', 'specific_venues'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promo_codes_org ON promo_codes(organization_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(UPPER(code));
CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_promo_codes_valid ON promo_codes(valid_from, valid_until);

-- =====================================================
-- 3. PROMO CODE USAGE TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Usage details
  discount_applied NUMERIC(10,2) NOT NULL,
  original_amount NUMERIC(10,2) NOT NULL,
  final_amount NUMERIC(10,2) NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_promo_usage_code ON promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_usage_customer ON promo_code_usage(customer_id);
CREATE INDEX IF NOT EXISTS idx_promo_usage_booking ON promo_code_usage(booking_id);
CREATE INDEX IF NOT EXISTS idx_promo_usage_org ON promo_code_usage(organization_id);

-- =====================================================
-- 4. UPDATE BOOKINGS TABLE FOR PRICING TIERS
-- =====================================================

DO $$
BEGIN
  -- Add pricing tier reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'pricing_tier_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN pricing_tier_id UUID REFERENCES pricing_tiers(id) ON DELETE SET NULL;
    CREATE INDEX idx_bookings_pricing_tier ON bookings(pricing_tier_id);
  END IF;
  
  -- Add promo code reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'promo_code_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL;
    CREATE INDEX idx_bookings_promo_code ON bookings(promo_code_id);
  END IF;
  
  -- Add pricing breakdown JSONB
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'pricing_breakdown'
  ) THEN
    ALTER TABLE bookings ADD COLUMN pricing_breakdown JSONB DEFAULT '{}'::JSONB;
  END IF;
END $$;

-- =====================================================
-- 5. FUNCTIONS
-- =====================================================

-- Create default pricing tiers for a game
CREATE OR REPLACE FUNCTION create_default_pricing_tiers(
  p_game_id UUID,
  p_organization_id UUID,
  p_adult_price NUMERIC,
  p_child_price NUMERIC DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_adult_lookup_key TEXT;
  v_child_lookup_key TEXT;
BEGIN
  -- Generate lookup keys
  SELECT price_lookup_key INTO v_adult_lookup_key
  FROM games WHERE id = p_game_id;
  
  v_child_lookup_key := REPLACE(v_adult_lookup_key, '_default', '_child');
  
  -- Create adult tier
  INSERT INTO pricing_tiers (
    organization_id, game_id, tier_type, tier_name, tier_description,
    price, price_lookup_key, is_default, is_active, display_order
  ) VALUES (
    p_organization_id, p_game_id, 'adult', 'Adult', 'Standard adult pricing',
    p_adult_price, v_adult_lookup_key, true, true, 1
  ) ON CONFLICT (game_id, tier_type) DO UPDATE
    SET price = p_adult_price, price_lookup_key = v_adult_lookup_key;
  
  v_count := v_count + 1;
  
  -- Create child tier if provided
  IF p_child_price IS NOT NULL AND p_child_price > 0 THEN
    INSERT INTO pricing_tiers (
      organization_id, game_id, tier_type, tier_name, tier_description,
      price, price_lookup_key, max_age, is_active, display_order
    ) VALUES (
      p_organization_id, p_game_id, 'child', 'Child', 'Child pricing (under 12)',
      p_child_price, v_child_lookup_key, 12, true, 2
    ) ON CONFLICT (game_id, tier_type) DO UPDATE
      SET price = p_child_price, price_lookup_key = v_child_lookup_key;
    
    v_count := v_count + 1;
  END IF;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Validate and apply promo code
CREATE OR REPLACE FUNCTION validate_promo_code(
  p_code TEXT,
  p_organization_id UUID,
  p_customer_id UUID DEFAULT NULL,
  p_game_id UUID DEFAULT NULL,
  p_venue_id UUID DEFAULT NULL,
  p_total_amount NUMERIC DEFAULT NULL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  promo_code_id UUID,
  discount_type VARCHAR,
  discount_value NUMERIC,
  discount_amount NUMERIC,
  message TEXT
) AS $$
DECLARE
  v_promo promo_codes%ROWTYPE;
  v_customer_usage_count INTEGER;
  v_discount_amount NUMERIC := 0;
BEGIN
  -- Find promo code
  SELECT * INTO v_promo
  FROM promo_codes
  WHERE UPPER(code) = UPPER(p_code)
    AND organization_id = p_organization_id
    AND is_active = true
    AND is_archived = false
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW());
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, NULL::NUMERIC, 
      'Invalid or expired promo code'::TEXT;
    RETURN;
  END IF;
  
  -- Check max uses
  IF v_promo.max_uses IS NOT NULL AND v_promo.uses_count >= v_promo.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, NULL::NUMERIC,
      'Promo code usage limit reached'::TEXT;
    RETURN;
  END IF;
  
  -- Check customer usage
  IF p_customer_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_customer_usage_count
    FROM promo_code_usage
    WHERE promo_code_id = v_promo.id AND customer_id = p_customer_id;
    
    IF v_promo.max_uses_per_customer IS NOT NULL 
       AND v_customer_usage_count >= v_promo.max_uses_per_customer THEN
      RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, NULL::NUMERIC,
        'You have already used this promo code'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Check minimum purchase
  IF v_promo.min_purchase_amount IS NOT NULL 
     AND p_total_amount IS NOT NULL 
     AND p_total_amount < v_promo.min_purchase_amount THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, NULL::NUMERIC,
      format('Minimum purchase amount is $%s', v_promo.min_purchase_amount)::TEXT;
    RETURN;
  END IF;
  
  -- Check game/venue applicability
  IF v_promo.applies_to = 'specific_games' AND p_game_id IS NOT NULL THEN
    IF NOT (p_game_id = ANY(v_promo.game_ids)) THEN
      RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, NULL::NUMERIC,
        'Promo code not valid for this game'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  IF v_promo.applies_to = 'specific_venues' AND p_venue_id IS NOT NULL THEN
    IF NOT (p_venue_id = ANY(v_promo.venue_ids)) THEN
      RETURN QUERY SELECT false, NULL::UUID, NULL::VARCHAR, NULL::NUMERIC, NULL::NUMERIC,
        'Promo code not valid for this venue'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Calculate discount
  IF p_total_amount IS NOT NULL THEN
    IF v_promo.discount_type = 'percentage' THEN
      v_discount_amount := ROUND((p_total_amount * v_promo.discount_value / 100), 2);
    ELSIF v_promo.discount_type = 'fixed_amount' THEN
      v_discount_amount := LEAST(v_promo.discount_value, p_total_amount);
    ELSIF v_promo.discount_type = 'free_game' THEN
      v_discount_amount := p_total_amount;
    END IF;
  END IF;
  
  -- Valid promo code
  RETURN QUERY SELECT true, v_promo.id, v_promo.discount_type, v_promo.discount_value,
    v_discount_amount, 'Promo code applied successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Record promo code usage
CREATE OR REPLACE FUNCTION record_promo_code_usage(
  p_promo_code_id UUID,
  p_organization_id UUID,
  p_customer_id UUID,
  p_booking_id UUID,
  p_discount_applied NUMERIC,
  p_original_amount NUMERIC,
  p_final_amount NUMERIC
)
RETURNS UUID AS $$
DECLARE
  v_usage_id UUID;
BEGIN
  -- Insert usage record
  INSERT INTO promo_code_usage (
    promo_code_id, organization_id, customer_id, booking_id,
    discount_applied, original_amount, final_amount
  ) VALUES (
    p_promo_code_id, p_organization_id, p_customer_id, p_booking_id,
    p_discount_applied, p_original_amount, p_final_amount
  )
  RETURNING id INTO v_usage_id;
  
  -- Increment usage count
  UPDATE promo_codes
  SET uses_count = uses_count + 1
  WHERE id = p_promo_code_id;
  
  RETURN v_usage_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Auto-populate pricing tier lookup keys
CREATE OR REPLACE FUNCTION auto_generate_tier_lookup_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price_lookup_key IS NULL THEN
    SELECT price_lookup_key || '_' || NEW.tier_type
    INTO NEW.price_lookup_key
    FROM games WHERE id = NEW.game_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_tier_lookup_key ON pricing_tiers;
CREATE TRIGGER trigger_auto_generate_tier_lookup_key
  BEFORE INSERT ON pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_tier_lookup_key();

-- Update timestamp triggers
DROP TRIGGER IF EXISTS update_pricing_tiers_updated_at ON pricing_tiers;
CREATE TRIGGER update_pricing_tiers_updated_at
  BEFORE UPDATE ON pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_promo_codes_updated_at ON promo_codes;
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. RLS POLICIES
-- =====================================================

ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- Pricing Tiers RLS
CREATE POLICY "Users can view pricing tiers in their organization"
  ON pricing_tiers FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage pricing tiers in their organization"
  ON pricing_tiers FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Public can view active pricing tiers for widgets
CREATE POLICY "Public can view active pricing tiers"
  ON pricing_tiers FOR SELECT
  TO anon
  USING (is_active = true);

-- Promo Codes RLS
CREATE POLICY "Users can view promo codes in their organization"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can manage promo codes in their organization"
  ON promo_codes FOR ALL
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- Public can validate promo codes (read-only via function)
CREATE POLICY "Public can validate promo codes"
  ON promo_codes FOR SELECT
  TO anon
  USING (is_active = true AND NOT is_archived);

-- Promo Code Usage RLS
CREATE POLICY "Users can view promo usage in their organization"
  ON promo_code_usage FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION create_default_pricing_tiers(UUID, UUID, NUMERIC, NUMERIC) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION validate_promo_code(TEXT, UUID, UUID, UUID, UUID, NUMERIC) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION record_promo_code_usage(UUID, UUID, UUID, UUID, NUMERIC, NUMERIC, NUMERIC) TO authenticated, service_role;

-- =====================================================
-- 9. COMMENTS
-- =====================================================

COMMENT ON TABLE pricing_tiers IS 'Multiple pricing options per game (adult, child, veteran, etc.)';
COMMENT ON TABLE promo_codes IS 'Promotional discount codes for bookings';
COMMENT ON TABLE promo_code_usage IS 'Tracks promo code usage per customer';
COMMENT ON FUNCTION create_default_pricing_tiers IS 'Creates adult and optional child pricing tiers';
COMMENT ON FUNCTION validate_promo_code IS 'Validates promo code and calculates discount';
COMMENT ON FUNCTION record_promo_code_usage IS 'Records promo code usage and increments counter';
