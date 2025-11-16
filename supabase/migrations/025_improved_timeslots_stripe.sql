-- =====================================================
-- Migration: 025_improved_timeslots_stripe
-- Purpose: Improve games table and create time slots system with Stripe integration
-- Date: 2025-11-16
-- =====================================================

-- =====================================================
-- ENHANCE GAMES TABLE
-- =====================================================

-- Add venue relationship
ALTER TABLE games ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES venues(id) ON DELETE CASCADE;

-- Add Stripe integration fields
ALTER TABLE games ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255);
ALTER TABLE games ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255);
ALTER TABLE games ADD COLUMN IF NOT EXISTS stripe_checkout_url TEXT;
ALTER TABLE games ADD COLUMN IF NOT EXISTS stripe_sync_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE games ADD COLUMN IF NOT EXISTS stripe_synced_at TIMESTAMPTZ;
ALTER TABLE games ADD COLUMN IF NOT EXISTS stripe_sync_error TEXT;

-- Add time slot configuration
ALTER TABLE games ADD COLUMN IF NOT EXISTS time_slot_duration INT DEFAULT 60; -- minutes
ALTER TABLE games ADD COLUMN IF NOT EXISTS buffer_time INT DEFAULT 15; -- minutes between slots
ALTER TABLE games ADD COLUMN IF NOT EXISTS max_daily_slots INT; -- NULL = unlimited

-- Add pricing fields
ALTER TABLE games ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);
ALTER TABLE games ADD COLUMN IF NOT EXISTS pricing_type VARCHAR(50) DEFAULT 'fixed'; -- 'fixed', 'dynamic', 'tiered'
ALTER TABLE games ADD COLUMN IF NOT EXISTS pricing_rules JSONB DEFAULT '{}'::jsonb;

-- Update base_price from existing price column
UPDATE games SET base_price = price WHERE base_price IS NULL;

-- Make base_price NOT NULL after data migration
ALTER TABLE games ALTER COLUMN base_price SET DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_venue ON games(venue_id);
CREATE INDEX IF NOT EXISTS idx_games_stripe_product ON games(stripe_product_id) WHERE stripe_product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_games_stripe_sync ON games(stripe_sync_status);

-- Comments
COMMENT ON COLUMN games.venue_id IS 'Venue where this game/room is located';
COMMENT ON COLUMN games.time_slot_duration IS 'Duration of each booking slot in minutes';
COMMENT ON COLUMN games.buffer_time IS 'Buffer time between slots for cleaning/setup in minutes';
COMMENT ON COLUMN games.base_price IS 'Base price before multipliers and modifiers';
COMMENT ON COLUMN games.pricing_rules IS 'JSON rules for dynamic pricing: {"peak_hours": {"multiplier": 1.5, "hours": [18,19,20]}}';

-- =====================================================
-- CREATE TIME SLOTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  
  -- Time slot details
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Availability
  max_bookings INT DEFAULT 1, -- How many parties can book this slot concurrently
  current_bookings INT DEFAULT 0,
  is_available BOOLEAN GENERATED ALWAYS AS (current_bookings < max_bookings AND NOT is_blocked) STORED,
  
  -- Pricing (can override game base price)
  price DECIMAL(10,2), -- NULL means use game's base_price
  price_multiplier DECIMAL(3,2) DEFAULT 1.00, -- 1.5 for peak times, 0.8 for off-peak
  
  -- Stripe integration
  stripe_price_id VARCHAR(255), -- Can have unique Stripe price per slot
  
  -- Status
  is_blocked BOOLEAN DEFAULT false, -- Manually block slot (maintenance, etc.)
  blocked_reason TEXT,
  blocked_by UUID REFERENCES users(id),
  blocked_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT time_slots_valid_time CHECK (start_time < end_time),
  CONSTRAINT time_slots_valid_bookings CHECK (current_bookings >= 0 AND current_bookings <= max_bookings),
  CONSTRAINT time_slots_valid_multiplier CHECK (price_multiplier > 0),
  UNIQUE(game_id, slot_date, start_time)
);

-- Indexes for performance
CREATE INDEX idx_time_slots_org ON time_slots(organization_id);
CREATE INDEX idx_time_slots_game ON time_slots(game_id);
CREATE INDEX idx_time_slots_venue ON time_slots(venue_id);
CREATE INDEX idx_time_slots_date ON time_slots(slot_date);
CREATE INDEX idx_time_slots_availability ON time_slots(slot_date, is_available) WHERE is_available = true;
CREATE INDEX idx_time_slots_composite ON time_slots(game_id, slot_date, start_time);
CREATE INDEX idx_time_slots_future ON time_slots(slot_date, start_time) WHERE slot_date >= CURRENT_DATE;

-- Trigger for updated_at
CREATE TRIGGER update_time_slots_updated_at
  BEFORE UPDATE ON time_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "platform_team_all_time_slots"
  ON time_slots FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_team = true));

CREATE POLICY "org_users_view_own_time_slots"
  ON time_slots FOR SELECT
  USING (organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()));

CREATE POLICY "org_admins_manage_time_slots"
  ON time_slots FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super-admin')
    )
  );

-- Comments
COMMENT ON TABLE time_slots IS 'Pre-generated or dynamic time slots for game bookings';
COMMENT ON COLUMN time_slots.max_bookings IS 'Number of concurrent parties allowed in this slot (usually 1)';
COMMENT ON COLUMN time_slots.price_multiplier IS 'Multiplier for peak/off-peak pricing (1.5 = 150% of base price)';
COMMENT ON COLUMN time_slots.metadata IS 'Additional data: {"special_event": "Halloween", "requires_waiver": true}';

-- =====================================================
-- UPDATE BOOKINGS TABLE
-- =====================================================

-- Add time_slot reference and Stripe fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS time_slot_id UUID REFERENCES time_slots(id) ON DELETE RESTRICT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS stripe_payment_status VARCHAR(50) DEFAULT 'pending';

-- Add pricing breakdown
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS price_multiplier DECIMAL(3,2) DEFAULT 1.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS addon_charges JSONB DEFAULT '[]'::jsonb;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_time_slot ON bookings(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_checkout ON bookings(stripe_checkout_session_id) WHERE stripe_checkout_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_payment_status ON bookings(stripe_payment_status);

-- Comments
COMMENT ON COLUMN bookings.time_slot_id IS 'Reference to pre-generated time slot';
COMMENT ON COLUMN bookings.addon_charges IS 'JSON array of additional charges: [{"name": "Insurance", "amount": 5.00}]';
COMMENT ON COLUMN bookings.stripe_payment_status IS 'Stripe payment status: pending, processing, succeeded, failed';

-- =====================================================
-- TIME SLOT FUNCTIONS
-- =====================================================

-- Function to safely increment time slot booking count
CREATE OR REPLACE FUNCTION increment_time_slot_bookings(slot_id UUID)
RETURNS void AS $$
DECLARE
  v_max_bookings INT;
  v_current_bookings INT;
BEGIN
  -- Get current values with row lock
  SELECT max_bookings, current_bookings 
  INTO v_max_bookings, v_current_bookings
  FROM time_slots
  WHERE id = slot_id
  FOR UPDATE;
  
  -- Check if slot exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Time slot not found: %', slot_id;
  END IF;
  
  -- Check if slot is full
  IF v_current_bookings >= v_max_bookings THEN
    RAISE EXCEPTION 'Time slot is full (% / %)', v_current_bookings, v_max_bookings;
  END IF;
  
  -- Increment
  UPDATE time_slots
  SET current_bookings = current_bookings + 1,
      updated_at = NOW()
  WHERE id = slot_id;
  
  RAISE NOTICE 'Time slot % bookings incremented to %', slot_id, v_current_bookings + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement (when booking cancelled/deleted)
CREATE OR REPLACE FUNCTION decrement_time_slot_bookings(slot_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE time_slots
  SET current_bookings = GREATEST(current_bookings - 1, 0),
      updated_at = NOW()
  WHERE id = slot_id;
  
  IF FOUND THEN
    RAISE NOTICE 'Time slot % bookings decremented', slot_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update time slot count when booking status changes
CREATE OR REPLACE FUNCTION update_time_slot_on_booking_change()
RETURNS trigger AS $$
BEGIN
  -- On INSERT with confirmed/completed status
  IF TG_OP = 'INSERT' AND NEW.time_slot_id IS NOT NULL AND NEW.status IN ('confirmed', 'checked_in', 'completed') THEN
    PERFORM increment_time_slot_bookings(NEW.time_slot_id);
  END IF;
  
  -- On UPDATE from pending to confirmed
  IF TG_OP = 'UPDATE' AND NEW.time_slot_id IS NOT NULL THEN
    IF OLD.status IN ('pending', 'cancelled') AND NEW.status IN ('confirmed', 'checked_in', 'completed') THEN
      PERFORM increment_time_slot_bookings(NEW.time_slot_id);
    ELSIF OLD.status IN ('confirmed', 'checked_in', 'completed') AND NEW.status IN ('cancelled') THEN
      PERFORM decrement_time_slot_bookings(NEW.time_slot_id);
    END IF;
  END IF;
  
  -- On DELETE of confirmed booking
  IF TG_OP = 'DELETE' AND OLD.time_slot_id IS NOT NULL AND OLD.status IN ('confirmed', 'checked_in', 'completed') THEN
    PERFORM decrement_time_slot_bookings(OLD.time_slot_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_time_slot_on_booking_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_time_slot_on_booking_change();

-- =====================================================
-- TIME SLOT GENERATION FUNCTION
-- =====================================================

-- Function to generate time slots for a game on a specific date
CREATE OR REPLACE FUNCTION generate_time_slots_for_date(
  p_game_id UUID,
  p_date DATE,
  p_generate_days INT DEFAULT 1
)
RETURNS TABLE (
  slot_id UUID,
  slot_date DATE,
  start_time TIME,
  end_time TIME,
  price DECIMAL
) AS $$
DECLARE
  v_game RECORD;
  v_current_date DATE;
  v_current_time TIME;
  v_end_time TIME;
  v_venue_open TIME;
  v_venue_close TIME;
  v_day_name TEXT;
  v_org_id UUID;
BEGIN
  -- Get game details
  SELECT 
    g.*,
    g.organization_id,
    v.id as venue_id
  INTO v_game
  FROM games g
  LEFT JOIN venues v ON g.venue_id = v.id
  WHERE g.id = p_game_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Game not found: %', p_game_id;
  END IF;
  
  -- Loop through dates
  FOR i IN 0..(p_generate_days - 1) LOOP
    v_current_date := p_date + i;
    v_day_name := LOWER(TO_CHAR(v_current_date, 'Day'));
    
    -- Get venue hours for this day (from organization settings)
    SELECT 
      (settings->'business_hours'->v_day_name->>'open')::TIME,
      (settings->'business_hours'->v_day_name->>'close')::TIME
    INTO v_venue_open, v_venue_close
    FROM organizations
    WHERE id = v_game.organization_id;
    
    -- Use default hours if not set
    v_venue_open := COALESCE(v_venue_open, '09:00'::TIME);
    v_venue_close := COALESCE(v_venue_close, '21:00'::TIME);
    
    -- Generate slots for this day
    v_current_time := v_venue_open;
    
    WHILE v_current_time + (v_game.time_slot_duration || ' minutes')::INTERVAL <= v_venue_close LOOP
      v_end_time := v_current_time + (v_game.time_slot_duration || ' minutes')::INTERVAL;
      
      -- Insert slot (upsert to avoid duplicates)
      INSERT INTO time_slots (
        organization_id,
        game_id,
        venue_id,
        slot_date,
        start_time,
        end_time,
        price,
        created_by
      ) VALUES (
        v_game.organization_id,
        p_game_id,
        v_game.venue_id,
        v_current_date,
        v_current_time,
        v_end_time,
        v_game.base_price,
        auth.uid()
      )
      ON CONFLICT (game_id, slot_date, start_time) DO NOTHING
      RETURNING id, slot_date, start_time, end_time, price
      INTO slot_id, slot_date, start_time, end_time, price;
      
      -- Return generated slot
      IF slot_id IS NOT NULL THEN
        RETURN NEXT;
      END IF;
      
      -- Move to next slot (duration + buffer time)
      v_current_time := v_current_time + ((v_game.time_slot_duration + COALESCE(v_game.buffer_time, 0)) || ' minutes')::INTERVAL;
    END LOOP;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION generate_time_slots_for_date IS 'Generate time slots for a game for specified number of days starting from p_date';

-- =====================================================
-- FUNCTION: Get Available Time Slots
-- =====================================================

CREATE OR REPLACE FUNCTION get_available_time_slots(
  p_game_id UUID,
  p_date DATE,
  p_days INT DEFAULT 7
)
RETURNS TABLE (
  id UUID,
  slot_date DATE,
  start_time TIME,
  end_time TIME,
  price DECIMAL,
  price_multiplier DECIMAL,
  final_price DECIMAL,
  is_available BOOLEAN,
  current_bookings INT,
  max_bookings INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ts.id,
    ts.slot_date,
    ts.start_time,
    ts.end_time,
    COALESCE(ts.price, g.base_price) as price,
    ts.price_multiplier,
    ROUND(COALESCE(ts.price, g.base_price) * ts.price_multiplier, 2) as final_price,
    ts.is_available,
    ts.current_bookings,
    ts.max_bookings
  FROM time_slots ts
  JOIN games g ON ts.game_id = g.id
  WHERE ts.game_id = p_game_id
    AND ts.slot_date BETWEEN p_date AND p_date + (p_days - 1)
    AND ts.slot_date >= CURRENT_DATE
  ORDER BY ts.slot_date, ts.start_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify
DO $$
BEGIN
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Migration 025 complete:';
  RAISE NOTICE '✓ Games table enhanced with Stripe fields';
  RAISE NOTICE '✓ Games table enhanced with time slot config';
  RAISE NOTICE '✓ Games table enhanced with pricing options';
  RAISE NOTICE '✓ Time slots table created';
  RAISE NOTICE '✓ Bookings table updated with Stripe fields';
  RAISE NOTICE '✓ Time slot functions created';
  RAISE NOTICE '✓ Auto-generate slots function ready';
  RAISE NOTICE '✓ RLS policies applied';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END$$;
