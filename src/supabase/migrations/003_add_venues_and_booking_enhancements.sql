-- Migration: Add Venues and Enhance Booking System
-- Version: 003
-- Description: Add venues table, update games to be venue-specific, enhance booking fields

-- =====================================================
-- VENUES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  embed_key VARCHAR(100) UNIQUE,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  website_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#2563eb',
  base_url TEXT,
  timezone VARCHAR(100) DEFAULT 'UTC',
  currency VARCHAR(3) DEFAULT 'USD',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

-- Indexes for venues
CREATE INDEX IF NOT EXISTS idx_venues_organization ON venues(organization_id);
CREATE INDEX IF NOT EXISTS idx_venues_embed_key ON venues(embed_key);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);
CREATE INDEX IF NOT EXISTS idx_venues_is_active ON venues(is_active);

-- =====================================================
-- UPDATE GAMES TABLE TO BE VENUE-SPECIFIC
-- =====================================================

-- Add venue_id column to games if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'venue_id'
  ) THEN
    ALTER TABLE games ADD COLUMN venue_id UUID REFERENCES venues(id) ON DELETE CASCADE;
    CREATE INDEX idx_games_venue ON games(venue_id);
  END IF;
END $$;

-- Add additional game fields for enhanced widget support
DO $$
BEGIN
  -- Slug for URL-friendly game identifiers
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'slug'
  ) THEN
    ALTER TABLE games ADD COLUMN slug VARCHAR(150);
    CREATE INDEX idx_games_slug ON games(slug);
  END IF;

  -- Tagline for marketing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'tagline'
  ) THEN
    ALTER TABLE games ADD COLUMN tagline VARCHAR(255);
  END IF;

  -- Enhanced player pricing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'child_price'
  ) THEN
    ALTER TABLE games ADD COLUMN child_price DECIMAL(10,2);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'min_age'
  ) THEN
    ALTER TABLE games ADD COLUMN min_age INTEGER;
  END IF;

  -- Success rate and additional details
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'success_rate'
  ) THEN
    ALTER TABLE games ADD COLUMN success_rate INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'additional_info'
  ) THEN
    ALTER TABLE games ADD COLUMN additional_info JSONB DEFAULT '{}';
  END IF;
END $$;

-- =====================================================
-- ENHANCE BOOKINGS TABLE
-- =====================================================

-- Add venue_id to bookings for direct venue relationship
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'venue_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN venue_id UUID REFERENCES venues(id) ON DELETE RESTRICT;
    CREATE INDEX idx_bookings_venue ON bookings(venue_id);
  END IF;

  -- Add source tracking (admin vs widget)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'source'
  ) THEN
    ALTER TABLE bookings ADD COLUMN source VARCHAR(50) DEFAULT 'admin';
  END IF;

  -- Add ticket types for flexible pricing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'ticket_types'
  ) THEN
    ALTER TABLE bookings ADD COLUMN ticket_types JSONB DEFAULT '[]';
  END IF;

  -- Add promo code support
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'promo_code'
  ) THEN
    ALTER TABLE bookings ADD COLUMN promo_code VARCHAR(50);
  END IF;

  -- Make created_by nullable for widget bookings
  ALTER TABLE bookings ALTER COLUMN created_by DROP NOT NULL;
END $$;

-- =====================================================
-- TRIGGERS FOR VENUES
-- =====================================================

-- Update trigger for venues
CREATE TRIGGER update_venues_updated_at 
  BEFORE UPDATE ON venues 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate embed key for venues
CREATE OR REPLACE FUNCTION generate_embed_key()
RETURNS TEXT AS $$
DECLARE
  new_key TEXT;
  max_attempts INTEGER := 100;
  attempt INTEGER := 0;
BEGIN
  LOOP
    new_key := 'emb_' || substring(md5(random()::text || clock_timestamp()::text) from 1 for 12);
    
    IF NOT EXISTS (SELECT 1 FROM venues WHERE embed_key = new_key) THEN
      RETURN new_key;
    END IF;
    
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Could not generate unique embed key after % attempts', max_attempts;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate embed key on venue insert if not provided
CREATE OR REPLACE FUNCTION auto_generate_venue_embed_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.embed_key IS NULL OR NEW.embed_key = '' THEN
    NEW.embed_key := generate_embed_key();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER venue_embed_key_trigger
  BEFORE INSERT ON venues
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_venue_embed_key();

-- =====================================================
-- ROW LEVEL SECURITY FOR VENUES
-- =====================================================

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

-- Users can view venues in their organization
CREATE POLICY "Users can view venues in their organization"
  ON venues FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Admins can manage venues
CREATE POLICY "Admins can manage venues"
  ON venues FOR ALL
  USING (organization_id IN (
    SELECT organization_id FROM users 
    WHERE id = auth.uid() AND role IN ('super-admin', 'admin')
  ));

-- Public can read venues by embed_key (for widgets)
CREATE POLICY "Public can read venues by embed_key"
  ON venues FOR SELECT
  USING (embed_key IS NOT NULL AND is_active = true);

-- =====================================================
-- STORED PROCEDURES / FUNCTIONS
-- =====================================================

-- Function to get venue configuration by embed key (for public widgets)
CREATE OR REPLACE FUNCTION get_venue_by_embed_key(p_embed_key TEXT)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  embed_key VARCHAR,
  primary_color VARCHAR,
  base_url TEXT,
  timezone VARCHAR,
  currency VARCHAR,
  settings JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.name,
    v.slug,
    v.embed_key,
    v.primary_color,
    v.base_url,
    v.timezone,
    v.currency,
    v.settings
  FROM venues v
  WHERE v.embed_key = p_embed_key AND v.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get games for a venue (for public widgets)
CREATE OR REPLACE FUNCTION get_venue_games(p_venue_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  description TEXT,
  tagline VARCHAR,
  difficulty difficulty_level,
  duration_minutes INTEGER,
  min_players INTEGER,
  max_players INTEGER,
  price DECIMAL,
  child_price DECIMAL,
  min_age INTEGER,
  success_rate INTEGER,
  image_url TEXT,
  additional_info JSONB,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.slug,
    g.description,
    g.tagline,
    g.difficulty,
    g.duration_minutes,
    g.min_players,
    g.max_players,
    g.price,
    g.child_price,
    g.min_age,
    g.success_rate,
    g.image_url,
    g.additional_info,
    g.is_active
  FROM games g
  WHERE g.venue_id = p_venue_id AND g.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced function to create booking from widget (public access)
CREATE OR REPLACE FUNCTION create_widget_booking(
  p_venue_id UUID,
  p_game_id UUID,
  p_customer_name VARCHAR,
  p_customer_email VARCHAR,
  p_customer_phone VARCHAR,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_party_size INTEGER,
  p_ticket_types JSONB,
  p_total_amount DECIMAL,
  p_final_amount DECIMAL,
  p_promo_code VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  booking_id UUID,
  booking_number VARCHAR,
  message TEXT
) AS $$
DECLARE
  v_organization_id UUID;
  v_customer_id UUID;
  v_booking_id UUID;
  v_booking_number VARCHAR;
  v_is_available BOOLEAN;
BEGIN
  -- Get organization ID from venue
  SELECT organization_id INTO v_organization_id
  FROM venues WHERE id = p_venue_id;

  IF v_organization_id IS NULL THEN
    RAISE EXCEPTION 'Venue not found';
  END IF;

  -- Check game availability
  SELECT check_game_availability(
    p_game_id,
    p_booking_date,
    p_start_time,
    p_end_time,
    NULL
  ) INTO v_is_available;

  IF NOT v_is_available THEN
    RAISE EXCEPTION 'Selected time slot is not available';
  END IF;

  -- Find or create customer
  SELECT id INTO v_customer_id
  FROM customers
  WHERE organization_id = v_organization_id 
    AND email = p_customer_email;

  IF v_customer_id IS NULL THEN
    INSERT INTO customers (
      organization_id,
      email,
      full_name,
      phone,
      segment
    ) VALUES (
      v_organization_id,
      p_customer_email,
      p_customer_name,
      p_customer_phone,
      'new'
    )
    RETURNING id INTO v_customer_id;
  END IF;

  -- Generate booking number
  v_booking_number := generate_booking_number();

  -- Create booking
  INSERT INTO bookings (
    organization_id,
    venue_id,
    booking_number,
    customer_id,
    game_id,
    booking_date,
    start_time,
    end_time,
    party_size,
    status,
    total_amount,
    discount_amount,
    final_amount,
    payment_status,
    ticket_types,
    promo_code,
    notes,
    source
  ) VALUES (
    v_organization_id,
    p_venue_id,
    v_booking_number,
    v_customer_id,
    p_game_id,
    p_booking_date,
    p_start_time,
    p_end_time,
    p_party_size,
    'pending',
    p_total_amount,
    p_total_amount - p_final_amount,
    p_final_amount,
    'pending',
    p_ticket_types,
    p_promo_code,
    p_notes,
    'widget'
  )
  RETURNING id INTO v_booking_id;

  RETURN QUERY SELECT 
    v_booking_id,
    v_booking_number,
    'Booking created successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions for public functions
GRANT EXECUTE ON FUNCTION get_venue_by_embed_key(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_venue_games(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_widget_booking(UUID, UUID, VARCHAR, VARCHAR, VARCHAR, DATE, TIME, TIME, INTEGER, JSONB, DECIMAL, DECIMAL, VARCHAR, TEXT) TO anon, authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE venues IS 'Physical venues/locations where games are hosted';
COMMENT ON FUNCTION get_venue_by_embed_key(TEXT) IS 'Public function to fetch venue config by embed key for widgets';
COMMENT ON FUNCTION get_venue_games(UUID) IS 'Public function to fetch active games for a venue';
COMMENT ON FUNCTION create_widget_booking IS 'Public function to create bookings from public widgets';
