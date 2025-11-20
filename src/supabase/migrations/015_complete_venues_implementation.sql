-- Migration: Complete Venues Implementation
-- Version: 0.1.5
-- Description: Implements complete venues table and related functions
-- Date: 2025-01-11

-- =====================================================
-- VENUES TABLE (if not exists)
-- =====================================================

CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  country VARCHAR(50) DEFAULT 'USA',
  postal_code VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  website TEXT,
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  
  -- Embed system
  embed_key VARCHAR(32) UNIQUE NOT NULL,
  
  -- Branding
  primary_color VARCHAR(7) DEFAULT '#4f46e5',
  logo_url TEXT,
  cover_image_url TEXT,
  
  -- Operating hours (JSONB for flexibility)
  operating_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "21:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "21:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "21:00", "closed": false},
    "thursday": {"open": "09:00", "close": "21:00", "closed": false},
    "friday": {"open": "09:00", "close": "21:00", "closed": false},
    "saturday": {"open": "10:00", "close": "22:00", "closed": false},
    "sunday": {"open": "10:00", "close": "20:00", "closed": false}
  }'::JSONB,
  
  -- Capacity and settings
  max_concurrent_bookings INTEGER DEFAULT 10,
  booking_buffer_minutes INTEGER DEFAULT 15,
  advance_booking_days INTEGER DEFAULT 30,
  cancellation_hours INTEGER DEFAULT 24,
  
  -- Widget settings
  settings JSONB DEFAULT '{}'::JSONB,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_published BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, slug)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_venues_organization ON venues(organization_id);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);
CREATE INDEX IF NOT EXISTS idx_venues_embed_key ON venues(embed_key);
CREATE INDEX IF NOT EXISTS idx_venues_is_active ON venues(is_active);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);

-- =====================================================
-- GAME-VENUE LINKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS game_venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  venue_specific_price NUMERIC(10,2),
  venue_specific_settings JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(game_id, venue_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_game_venues_game ON game_venues(game_id);
CREATE INDEX IF NOT EXISTS idx_game_venues_venue ON game_venues(venue_id);
CREATE INDEX IF NOT EXISTS idx_game_venues_active ON game_venues(is_active);

-- =====================================================
-- ADD VENUE_ID TO BOOKINGS (if not exists)
-- =====================================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'venue_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN venue_id UUID REFERENCES venues(id);
    CREATE INDEX idx_bookings_venue ON bookings(venue_id);
  END IF;
END $$;

-- =====================================================
-- VENUE FUNCTIONS
-- =====================================================

-- Generate unique embed key
CREATE OR REPLACE FUNCTION generate_venue_embed_key()
RETURNS TEXT AS $$
DECLARE
  v_key TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 32 character random key
    v_key := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 32));
    
    -- Check if exists
    SELECT EXISTS(SELECT 1 FROM venues WHERE embed_key = v_key) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_key;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate embed key on insert
CREATE OR REPLACE FUNCTION auto_generate_venue_embed_key()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.embed_key IS NULL OR NEW.embed_key = '' THEN
    NEW.embed_key := generate_venue_embed_key();
  END IF;
  
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := LOWER(REGEXP_REPLACE(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_venue_embed_key ON venues;
CREATE TRIGGER trigger_auto_generate_venue_embed_key
  BEFORE INSERT ON venues
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_venue_embed_key();

-- Create venue
CREATE OR REPLACE FUNCTION create_venue(
  p_organization_id UUID,
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_address TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT 'America/New_York'
)
RETURNS UUID AS $$
DECLARE
  v_venue_id UUID;
BEGIN
  INSERT INTO venues (
    organization_id,
    name,
    description,
    address,
    city,
    state,
    timezone,
    is_active,
    is_published
  ) VALUES (
    p_organization_id,
    p_name,
    p_description,
    p_address,
    p_city,
    p_state,
    p_timezone,
    true,
    false
  )
  RETURNING id INTO v_venue_id;
  
  RETURN v_venue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get venue by embed key (public access for widgets)
CREATE OR REPLACE FUNCTION get_venue_by_embed_key(p_embed_key TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  embed_key TEXT,
  primary_color TEXT,
  base_url TEXT,
  timezone TEXT,
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
    v.website as base_url,
    v.timezone,
    v.settings
  FROM venues v
  WHERE v.embed_key = p_embed_key
    AND v.is_active = true
    AND v.is_published = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get venue games (public access for widgets)
CREATE OR REPLACE FUNCTION get_venue_games(p_venue_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  tagline TEXT,
  difficulty TEXT,
  duration INTEGER,
  min_players INTEGER,
  max_players INTEGER,
  price NUMERIC,
  child_price NUMERIC,
  min_age INTEGER,
  success_rate NUMERIC,
  image_url TEXT,
  settings JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id,
    g.name,
    LOWER(REGEXP_REPLACE(g.name, '[^a-zA-Z0-9]+', '-', 'g')) as slug,
    g.description,
    COALESCE(g.description, '') as tagline,
    g.difficulty::TEXT,
    g.duration_minutes as duration,
    g.min_players,
    g.max_players,
    COALESCE(gv.venue_specific_price, g.price) as price,
    g.price * 0.8 as child_price,
    8 as min_age,
    50.0 as success_rate,
    g.image_url,
    COALESCE(gv.venue_specific_settings, '{}'::JSONB) as settings
  FROM games g
  INNER JOIN game_venues gv ON g.id = gv.game_id
  WHERE gv.venue_id = p_venue_id
    AND g.is_active = true
    AND gv.is_active = true
  ORDER BY gv.display_order, g.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Link games to venue
CREATE OR REPLACE FUNCTION link_games_to_venue(
  p_venue_id UUID,
  p_game_ids UUID[]
)
RETURNS INTEGER AS $$
DECLARE
  v_game_id UUID;
  v_count INTEGER := 0;
BEGIN
  -- Remove existing links not in new list
  DELETE FROM game_venues
  WHERE venue_id = p_venue_id
    AND game_id != ALL(p_game_ids);
  
  -- Add new links
  FOREACH v_game_id IN ARRAY p_game_ids
  LOOP
    INSERT INTO game_venues (game_id, venue_id, is_active)
    VALUES (v_game_id, p_venue_id, true)
    ON CONFLICT (game_id, venue_id) 
    DO UPDATE SET 
      is_active = true,
      updated_at = NOW();
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get venue analytics
CREATE OR REPLACE FUNCTION get_venue_analytics(
  p_venue_id UUID,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_bookings BIGINT,
  confirmed_bookings BIGINT,
  total_revenue NUMERIC,
  avg_booking_value NUMERIC,
  unique_customers BIGINT,
  top_game_id UUID,
  top_game_name TEXT,
  top_game_bookings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH venue_bookings AS (
    SELECT 
      b.*,
      g.name as game_name
    FROM bookings b
    INNER JOIN games g ON b.game_id = g.id
    WHERE b.venue_id = p_venue_id
      AND (p_from_date IS NULL OR b.booking_date >= p_from_date)
      AND (p_to_date IS NULL OR b.booking_date <= p_to_date)
  ),
  game_stats AS (
    SELECT 
      game_id,
      game_name,
      COUNT(*) as booking_count
    FROM venue_bookings
    GROUP BY game_id, game_name
    ORDER BY booking_count DESC
    LIMIT 1
  )
  SELECT
    COUNT(vb.id)::BIGINT as total_bookings,
    COUNT(CASE WHEN vb.status = 'confirmed' THEN 1 END)::BIGINT as confirmed_bookings,
    COALESCE(SUM(vb.final_amount), 0) as total_revenue,
    COALESCE(AVG(vb.final_amount), 0) as avg_booking_value,
    COUNT(DISTINCT vb.customer_id)::BIGINT as unique_customers,
    gs.game_id as top_game_id,
    gs.game_name as top_game_name,
    gs.booking_count::BIGINT as top_game_bookings
  FROM venue_bookings vb
  CROSS JOIN game_stats gs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get venue schedule (operating hours)
CREATE OR REPLACE FUNCTION get_venue_schedule(p_venue_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_schedule JSONB;
BEGIN
  SELECT operating_hours INTO v_schedule
  FROM venues
  WHERE id = p_venue_id;
  
  RETURN COALESCE(v_schedule, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update venue schedule
CREATE OR REPLACE FUNCTION update_venue_schedule(
  p_venue_id UUID,
  p_schedule JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE venues
  SET 
    operating_hours = p_schedule,
    updated_at = NOW()
  WHERE id = p_venue_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if venue is open at specific time
CREATE OR REPLACE FUNCTION is_venue_open(
  p_venue_id UUID,
  p_date DATE,
  p_time TIME
)
RETURNS BOOLEAN AS $$
DECLARE
  v_day_name TEXT;
  v_schedule JSONB;
  v_day_schedule JSONB;
  v_open_time TIME;
  v_close_time TIME;
  v_is_closed BOOLEAN;
BEGIN
  -- Get day of week
  v_day_name := LOWER(TO_CHAR(p_date, 'Day'));
  v_day_name := TRIM(v_day_name);
  
  -- Get venue schedule
  SELECT operating_hours INTO v_schedule
  FROM venues
  WHERE id = p_venue_id;
  
  -- Get day schedule
  v_day_schedule := v_schedule->v_day_name;
  
  IF v_day_schedule IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if closed
  v_is_closed := (v_day_schedule->>'closed')::BOOLEAN;
  
  IF v_is_closed THEN
    RETURN false;
  END IF;
  
  -- Get open/close times
  v_open_time := (v_day_schedule->>'open')::TIME;
  v_close_time := (v_day_schedule->>'close')::TIME;
  
  -- Check if time is within operating hours
  RETURN p_time >= v_open_time AND p_time <= v_close_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- UPDATE EXISTING FUNCTIONS TO SUPPORT VENUES
-- =====================================================

-- Update create_widget_booking to include venue
CREATE OR REPLACE FUNCTION create_widget_booking(
  p_venue_id UUID,
  p_game_id UUID,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_booking_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_party_size INTEGER,
  p_ticket_types JSONB,
  p_total_amount NUMERIC,
  p_final_amount NUMERIC,
  p_promo_code TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE (
  booking_id UUID,
  confirmation_code TEXT,
  message TEXT
) AS $$
DECLARE
  v_customer_id UUID;
  v_booking_id UUID;
  v_confirmation_code TEXT;
  v_org_id UUID;
BEGIN
  -- Get organization ID from venue
  SELECT organization_id INTO v_org_id
  FROM venues
  WHERE id = p_venue_id;
  
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Venue not found';
  END IF;
  
  -- Find or create customer
  SELECT id INTO v_customer_id
  FROM customers
  WHERE organization_id = v_org_id
    AND email = p_customer_email;
  
  IF v_customer_id IS NULL THEN
    INSERT INTO customers (
      organization_id,
      email,
      full_name,
      phone,
      segment
    ) VALUES (
      v_org_id,
      p_customer_email,
      p_customer_name,
      p_customer_phone,
      'new'
    )
    RETURNING id INTO v_customer_id;
  END IF;
  
  -- Generate confirmation code
  v_confirmation_code := 'CONF-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
  
  -- Create booking
  INSERT INTO bookings (
    organization_id,
    venue_id,
    game_id,
    customer_id,
    booking_date,
    booking_time,
    end_time,
    players,
    status,
    total_amount,
    deposit_amount,
    payment_status,
    notes,
    confirmation_code,
    metadata,
    created_by
  ) VALUES (
    v_org_id,
    p_venue_id,
    p_game_id,
    v_customer_id,
    p_booking_date,
    p_start_time,
    p_end_time,
    p_party_size,
    'pending',
    p_final_amount,
    0,
    'pending',
    p_notes,
    v_confirmation_code,
    jsonb_build_object(
      'ticket_types', p_ticket_types,
      'promo_code', p_promo_code,
      'source', 'widget'
    ),
    v_customer_id  -- Widget bookings created by customer
  )
  RETURNING id INTO v_booking_id;
  
  -- Update customer stats
  UPDATE customers
  SET 
    total_bookings = total_bookings + 1,
    updated_at = NOW()
  WHERE id = v_customer_id;
  
  RETURN QUERY
  SELECT
    v_booking_id,
    v_confirmation_code,
    'Booking created successfully'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_venues ENABLE ROW LEVEL SECURITY;

-- Venues policies
CREATE POLICY "Users can view venues in their organization"
  ON venues FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert venues in their organization"
  ON venues FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update venues in their organization"
  ON venues FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Public access for published venues (for widgets)
CREATE POLICY "Anyone can view published venues"
  ON venues FOR SELECT
  TO anon
  USING (is_active = true AND is_published = true);

-- Game-venue linking policies
CREATE POLICY "Users can manage game-venue links in their organization"
  ON game_venues FOR ALL
  TO authenticated
  USING (
    venue_id IN (
      SELECT id FROM venues WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION create_venue(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_venue_by_embed_key(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_venue_games(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION link_games_to_venue(UUID, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_venue_analytics(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_venue_schedule(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_venue_schedule(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION is_venue_open(UUID, DATE, TIME) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_widget_booking(UUID, UUID, TEXT, TEXT, TEXT, DATE, TIME, TIME, INTEGER, JSONB, NUMERIC, NUMERIC, TEXT, TEXT) TO anon, authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE venues IS 'Physical venue locations for escape rooms';
COMMENT ON TABLE game_venues IS 'Many-to-many relationship between games and venues';
COMMENT ON FUNCTION create_venue(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) IS 'Creates a new venue with auto-generated embed key';
COMMENT ON FUNCTION get_venue_by_embed_key(TEXT) IS 'Gets venue configuration by embed key for public widgets';
COMMENT ON FUNCTION get_venue_games(UUID) IS 'Gets all active games for a venue';
COMMENT ON FUNCTION link_games_to_venue(UUID, UUID[]) IS 'Links multiple games to a venue';
COMMENT ON FUNCTION get_venue_analytics(UUID, DATE, DATE) IS 'Returns analytics for a specific venue';
COMMENT ON FUNCTION get_venue_schedule(UUID) IS 'Returns operating hours for a venue';
COMMENT ON FUNCTION update_venue_schedule(UUID, JSONB) IS 'Updates operating hours for a venue';
COMMENT ON FUNCTION is_venue_open(UUID, DATE, TIME) IS 'Checks if venue is open at specific date/time';
COMMENT ON FUNCTION create_widget_booking(UUID, UUID, TEXT, TEXT, TEXT, DATE, TIME, TIME, INTEGER, JSONB, NUMERIC, NUMERIC, TEXT, TEXT) IS 'Creates a booking from public widget';
