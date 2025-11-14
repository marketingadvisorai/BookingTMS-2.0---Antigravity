-- =====================================================
-- STRIPE LOOKUP KEYS MIGRATION
-- Version: 0.2.2
-- Description: Add lookup key support for dynamic pricing updates
-- Date: 2025-01-13
-- =====================================================

-- =====================================================
-- 1. ADD LOOKUP KEY FIELDS
-- =====================================================

DO $$
BEGIN
  -- Add price_lookup_key to games table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'price_lookup_key'
  ) THEN
    ALTER TABLE games ADD COLUMN price_lookup_key VARCHAR(255) UNIQUE;
    CREATE INDEX idx_games_price_lookup_key ON games(price_lookup_key);
  END IF;
  
  -- Add active_price_id to track current active price
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'active_price_id'
  ) THEN
    ALTER TABLE games ADD COLUMN active_price_id VARCHAR(255);
  END IF;
  
  -- Add price_history JSONB to track all price changes
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'price_history'
  ) THEN
    ALTER TABLE games ADD COLUMN price_history JSONB DEFAULT '[]'::JSONB;
  END IF;
END $$;

-- =====================================================
-- 2. FUNCTION TO GENERATE LOOKUP KEY
-- =====================================================

CREATE OR REPLACE FUNCTION generate_price_lookup_key(
  p_organization_id UUID,
  p_venue_id UUID,
  p_game_id UUID
)
RETURNS TEXT AS $$
DECLARE
  v_org_slug TEXT;
  v_venue_slug TEXT;
  v_game_slug TEXT;
  v_lookup_key TEXT;
BEGIN
  -- Get organization slug
  SELECT slug INTO v_org_slug
  FROM organizations
  WHERE id = p_organization_id;
  
  -- Get venue slug
  SELECT slug INTO v_venue_slug
  FROM venues
  WHERE id = p_venue_id;
  
  -- Get game slug (or generate from ID)
  SELECT 
    COALESCE(
      slug, 
      LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
    )
  INTO v_game_slug
  FROM games
  WHERE id = p_game_id;
  
  -- Generate lookup key format: org_venue_game_default
  v_lookup_key := LOWER(
    COALESCE(v_org_slug, p_organization_id::TEXT) || '_' ||
    COALESCE(v_venue_slug, p_venue_id::TEXT) || '_' ||
    COALESCE(v_game_slug, p_game_id::TEXT) || '_default'
  );
  
  -- Clean up the lookup key (remove special characters, limit length)
  v_lookup_key := REGEXP_REPLACE(v_lookup_key, '[^a-z0-9_-]', '', 'g');
  v_lookup_key := SUBSTRING(v_lookup_key FROM 1 FOR 250);
  
  RETURN v_lookup_key;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. TRIGGER TO AUTO-GENERATE LOOKUP KEY
-- =====================================================

CREATE OR REPLACE FUNCTION auto_generate_price_lookup_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.price_lookup_key IS NULL AND NEW.organization_id IS NOT NULL AND NEW.venue_id IS NOT NULL THEN
    NEW.price_lookup_key := generate_price_lookup_key(
      NEW.organization_id,
      NEW.venue_id,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_price_lookup_key ON games;
CREATE TRIGGER trigger_auto_generate_price_lookup_key
  BEFORE INSERT ON games
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_price_lookup_key();

-- =====================================================
-- 4. FUNCTION TO LOG PRICE CHANGES
-- =====================================================

CREATE OR REPLACE FUNCTION log_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    NEW.price_history := COALESCE(NEW.price_history, '[]'::JSONB) || 
      jsonb_build_object(
        'old_price', OLD.price,
        'new_price', NEW.price,
        'old_price_id', OLD.stripe_price_id,
        'new_price_id', NEW.stripe_price_id,
        'changed_at', NOW(),
        'changed_by', current_user,
        'lookup_key', NEW.price_lookup_key
      );
    
    IF NEW.stripe_price_id IS NOT NULL THEN
      NEW.active_price_id := NEW.stripe_price_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_price_change ON games;
CREATE TRIGGER trigger_log_price_change
  BEFORE UPDATE OF price, stripe_price_id ON games
  FOR EACH ROW
  EXECUTE FUNCTION log_price_change();

-- =====================================================
-- 5. BACKFILL LOOKUP KEYS FOR EXISTING GAMES
-- =====================================================

UPDATE games g
SET price_lookup_key = generate_price_lookup_key(
  g.organization_id,
  g.venue_id,
  g.id
)
WHERE g.price_lookup_key IS NULL
  AND g.organization_id IS NOT NULL
  AND g.venue_id IS NOT NULL;

UPDATE games
SET active_price_id = stripe_price_id
WHERE active_price_id IS NULL
  AND stripe_price_id IS NOT NULL;

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION get_price_by_lookup_key(p_lookup_key TEXT)
RETURNS TABLE (
  game_id UUID,
  game_name TEXT,
  price NUMERIC,
  stripe_product_id VARCHAR,
  stripe_price_id VARCHAR,
  price_lookup_key VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.price,
    g.stripe_product_id,
    g.stripe_price_id,
    g.price_lookup_key
  FROM games g
  WHERE g.price_lookup_key = p_lookup_key
    AND g.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_game_price_history(p_game_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_history JSONB;
BEGIN
  SELECT price_history INTO v_history
  FROM games
  WHERE id = p_game_id;
  
  RETURN COALESCE(v_history, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_game_price_with_lookup(
  p_game_id UUID,
  p_new_price NUMERIC,
  p_new_stripe_price_id VARCHAR
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE games
  SET 
    price = p_new_price,
    stripe_price_id = p_new_stripe_price_id,
    active_price_id = p_new_stripe_price_id,
    updated_at = NOW()
  WHERE id = p_game_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION generate_price_lookup_key(UUID, UUID, UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_price_by_lookup_key(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_game_price_history(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION update_game_price_with_lookup(UUID, NUMERIC, VARCHAR) TO authenticated, service_role;

-- =====================================================
-- 8. COMMENTS
-- =====================================================

COMMENT ON COLUMN games.price_lookup_key IS 'Stripe price lookup key for dynamic pricing updates';
COMMENT ON COLUMN games.active_price_id IS 'Currently active Stripe price ID';
COMMENT ON COLUMN games.price_history IS 'JSONB array of all price changes';
