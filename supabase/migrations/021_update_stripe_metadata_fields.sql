-- =====================================================
-- STRIPE METADATA FIELDS MIGRATION
-- Version: 0.2.1
-- Description: Add comprehensive metadata fields to support multi-tenant Stripe integration
-- Date: 2025-01-13
-- =====================================================

-- =====================================================
-- 1. UPDATE PAYMENTS TABLE WITH METADATA
-- =====================================================

DO $$
BEGIN
  -- Add organization_id to payments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'organization_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
    CREATE INDEX idx_payments_organization ON payments(organization_id);
  END IF;
  
  -- Add venue_id to payments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'venue_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN venue_id UUID REFERENCES venues(id) ON DELETE SET NULL;
    CREATE INDEX idx_payments_venue ON payments(venue_id);
  END IF;
  
  -- Add game_id to payments for direct reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'game_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN game_id UUID REFERENCES games(id) ON DELETE SET NULL;
    CREATE INDEX idx_payments_game ON payments(game_id);
  END IF;
END $$;

-- =====================================================
-- 2. UPDATE GAMES TABLE WITH STRIPE METADATA
-- =====================================================

DO $$
BEGIN
  -- Add stripe_metadata for storing additional Stripe info
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'stripe_metadata'
  ) THEN
    ALTER TABLE games ADD COLUMN stripe_metadata JSONB DEFAULT '{}'::JSONB;
  END IF;
END $$;

-- =====================================================
-- 3. UPDATE CUSTOMERS TABLE WITH METADATA
-- =====================================================

DO $$
BEGIN
  -- Add venue_id for venue-specific customer tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'preferred_venue_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN preferred_venue_id UUID REFERENCES venues(id) ON DELETE SET NULL;
  END IF;
  
  -- Add first/last name fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE customers ADD COLUMN first_name VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE customers ADD COLUMN last_name VARCHAR(255);
  END IF;
  
  -- Populate first_name and last_name from full_name if available
  UPDATE customers 
  SET 
    first_name = SPLIT_PART(full_name, ' ', 1),
    last_name = CASE 
      WHEN ARRAY_LENGTH(STRING_TO_ARRAY(full_name, ' '), 1) > 1 
      THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
      ELSE ''
    END
  WHERE first_name IS NULL AND full_name IS NOT NULL;
  
  -- Add customer metadata
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'customer_metadata'
  ) THEN
    ALTER TABLE customers ADD COLUMN customer_metadata JSONB DEFAULT '{}'::JSONB;
  END IF;
END $$;

-- =====================================================
-- 4. TRIGGER TO AUTO-POPULATE PAYMENT METADATA
-- =====================================================

CREATE OR REPLACE FUNCTION populate_payment_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Get organization_id from booking
  IF NEW.booking_id IS NOT NULL AND NEW.organization_id IS NULL THEN
    SELECT 
      b.organization_id,
      b.venue_id,
      b.game_id
    INTO 
      NEW.organization_id,
      NEW.venue_id,
      NEW.game_id
    FROM bookings b
    WHERE b.id = NEW.booking_id;
  END IF;
  
  -- Ensure metadata includes multi-tenant info
  IF NEW.metadata IS NULL THEN
    NEW.metadata := '{}'::JSONB;
  END IF;
  
  -- Add organization, venue, game info to metadata
  NEW.metadata := NEW.metadata || jsonb_build_object(
    'organization_id', NEW.organization_id,
    'venue_id', NEW.venue_id,
    'game_id', NEW.game_id,
    'timestamp', NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_populate_payment_metadata ON payments;
CREATE TRIGGER trigger_populate_payment_metadata
  BEFORE INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION populate_payment_metadata();

-- =====================================================
-- 5. UPDATE BOOKINGS METADATA STRUCTURE
-- =====================================================

-- Add metadata column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'booking_metadata'
  ) THEN
    ALTER TABLE bookings ADD COLUMN booking_metadata JSONB DEFAULT '{}'::JSONB;
  END IF;
  
  -- Add confirmation_code if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'confirmation_code'
  ) THEN
    ALTER TABLE bookings ADD COLUMN confirmation_code VARCHAR(50) UNIQUE;
  END IF;
END $$;

-- Function to generate and populate confirmation code
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate format: CONF-XXXXXXXX (8 uppercase alphanumeric)
    v_code := 'CONF-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
    
    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM bookings WHERE confirmation_code = v_code) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate confirmation code for bookings
CREATE OR REPLACE FUNCTION auto_generate_confirmation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.confirmation_code IS NULL OR NEW.confirmation_code = '' THEN
    NEW.confirmation_code := generate_confirmation_code();
  END IF;
  
  -- Ensure booking_metadata includes all context
  IF NEW.booking_metadata IS NULL THEN
    NEW.booking_metadata := '{}'::JSONB;
  END IF;
  
  NEW.booking_metadata := NEW.booking_metadata || jsonb_build_object(
    'organization_id', NEW.organization_id,
    'organization_name', NEW.organization_name,
    'venue_id', NEW.venue_id,
    'venue_name', NEW.venue_name,
    'game_id', NEW.game_id,
    'game_name', NEW.game_name,
    'venue_calendar_id', NEW.venue_calendar_id,
    'game_calendar_id', NEW.game_calendar_id,
    'booking_source', COALESCE(NEW.source, 'admin')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_confirmation_code ON bookings;
CREATE TRIGGER trigger_auto_generate_confirmation_code
  BEFORE INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_confirmation_code();

-- =====================================================
-- 6. CREATE STRIPE SYNC LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS stripe_sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type VARCHAR(50) NOT NULL, -- 'product', 'price', 'customer', 'payment'
  entity_id UUID NOT NULL, -- Local database ID
  stripe_id VARCHAR(255), -- Stripe object ID
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'sync'
  status VARCHAR(50) NOT NULL, -- 'pending', 'success', 'failed'
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stripe_sync_log_org ON stripe_sync_log(organization_id);
CREATE INDEX idx_stripe_sync_log_entity ON stripe_sync_log(entity_type, entity_id);
CREATE INDEX idx_stripe_sync_log_stripe_id ON stripe_sync_log(stripe_id);
CREATE INDEX idx_stripe_sync_log_status ON stripe_sync_log(status);
CREATE INDEX idx_stripe_sync_log_created ON stripe_sync_log(created_at DESC);

-- RLS for stripe_sync_log
ALTER TABLE stripe_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view stripe sync logs in their organization"
  ON stripe_sync_log FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage stripe sync logs"
  ON stripe_sync_log FOR ALL
  TO service_role
  USING (true);

-- =====================================================
-- 7. HELPER FUNCTIONS FOR STRIPE METADATA
-- =====================================================

-- Function to get complete booking context for Stripe
CREATE OR REPLACE FUNCTION get_booking_stripe_metadata(p_booking_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_metadata JSONB;
BEGIN
  SELECT jsonb_build_object(
    'booking_id', b.id,
    'booking_number', b.booking_number,
    'confirmation_code', b.confirmation_code,
    'organization_id', b.organization_id,
    'organization_name', b.organization_name,
    'venue_id', b.venue_id,
    'venue_name', b.venue_name,
    'game_id', b.game_id,
    'game_name', b.game_name,
    'calendar_id', b.game_calendar_id,
    'booking_date', b.booking_date,
    'booking_time', b.booking_time,
    'players', b.players,
    'customer_email', c.email,
    'customer_name', c.full_name,
    'source', b.source
  )
  INTO v_metadata
  FROM bookings b
  LEFT JOIN customers c ON b.customer_id = c.id
  WHERE b.id = p_booking_id;
  
  RETURN v_metadata;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get game Stripe metadata
CREATE OR REPLACE FUNCTION get_game_stripe_metadata(p_game_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_metadata JSONB;
BEGIN
  SELECT jsonb_build_object(
    'game_id', g.id,
    'game_name', g.name,
    'organization_id', g.organization_id,
    'organization_name', g.organization_name,
    'venue_id', g.venue_id,
    'venue_name', g.venue_name,
    'calendar_id', g.calendar_id,
    'difficulty', g.difficulty,
    'duration_minutes', g.duration_minutes,
    'min_players', g.min_players,
    'max_players', g.max_players
  )
  INTO v_metadata
  FROM games g
  WHERE g.id = p_game_id;
  
  RETURN v_metadata;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log Stripe sync
CREATE OR REPLACE FUNCTION log_stripe_sync(
  p_organization_id UUID,
  p_entity_type VARCHAR(50),
  p_entity_id UUID,
  p_stripe_id VARCHAR(255),
  p_action VARCHAR(50),
  p_status VARCHAR(50),
  p_error_message TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO stripe_sync_log (
    organization_id,
    entity_type,
    entity_id,
    stripe_id,
    action,
    status,
    error_message,
    metadata,
    synced_at
  ) VALUES (
    p_organization_id,
    p_entity_type,
    p_entity_id,
    p_stripe_id,
    p_action,
    p_status,
    p_error_message,
    p_metadata,
    CASE WHEN p_status = 'success' THEN NOW() ELSE NULL END
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_booking_stripe_metadata(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_game_stripe_metadata(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION log_stripe_sync(UUID, VARCHAR, UUID, VARCHAR, VARCHAR, VARCHAR, TEXT, JSONB) TO authenticated, service_role;

-- =====================================================
-- 9. COMMENTS
-- =====================================================

COMMENT ON TABLE stripe_sync_log IS 'Audit log for all Stripe synchronization operations';
COMMENT ON FUNCTION get_booking_stripe_metadata(UUID) IS 'Returns complete metadata for a booking to send to Stripe';
COMMENT ON FUNCTION get_game_stripe_metadata(UUID) IS 'Returns complete metadata for a game to send to Stripe';
COMMENT ON FUNCTION log_stripe_sync IS 'Logs a Stripe synchronization operation for audit purposes';
COMMENT ON COLUMN payments.organization_id IS 'Organization that owns this payment';
COMMENT ON COLUMN payments.venue_id IS 'Venue where the booking/payment was made';
COMMENT ON COLUMN payments.game_id IS 'Game associated with this payment';
COMMENT ON COLUMN customers.first_name IS 'Customer first name (split from full_name)';
COMMENT ON COLUMN customers.last_name IS 'Customer last name (split from full_name)';
COMMENT ON COLUMN customers.preferred_venue_id IS 'Customer preferred venue for marketing segmentation';

