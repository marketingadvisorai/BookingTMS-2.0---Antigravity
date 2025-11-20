-- =====================================================
-- MULTI-TENANT CALENDAR ARCHITECTURE MIGRATION
-- Version: 0.2.0
-- Description: Implements comprehensive multi-tenant, multi-venue architecture
--              with calendar support and proper data isolation
-- Date: 2025-01-13
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CALENDAR TABLES
-- =====================================================

-- Venue Calendars: Master calendar for each venue
CREATE TABLE IF NOT EXISTS venue_calendars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Calendar settings
  timezone VARCHAR(50) DEFAULT 'America/New_York',
  default_slot_duration INTEGER DEFAULT 60, -- minutes
  booking_buffer_minutes INTEGER DEFAULT 15,
  advance_booking_days INTEGER DEFAULT 30,
  cancellation_hours INTEGER DEFAULT 24,
  
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
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false, -- One default calendar per venue
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  
  UNIQUE(venue_id, slug),
  CONSTRAINT fk_venue_calendar_creator FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Game Calendars: Specific schedules for each game
CREATE TABLE IF NOT EXISTS game_calendars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  venue_calendar_id UUID REFERENCES venue_calendars(id) ON DELETE SET NULL,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  
  -- Game-specific calendar settings
  slot_duration INTEGER, -- Override venue default if needed
  max_bookings_per_slot INTEGER DEFAULT 1,
  buffer_before_minutes INTEGER DEFAULT 0,
  buffer_after_minutes INTEGER DEFAULT 0,
  
  -- Availability (inherits from venue_calendar if null)
  custom_hours JSONB, -- Override operating hours for this game
  blocked_dates JSONB DEFAULT '[]'::JSONB, -- Array of blocked date objects
  
  -- Pricing calendar (time-based pricing)
  pricing_rules JSONB DEFAULT '[]'::JSONB, -- Dynamic pricing by time/date
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  
  UNIQUE(game_id, slug),
  CONSTRAINT fk_game_calendar_creator FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

-- =====================================================
-- 2. UPDATE EXISTING TABLES WITH CALENDAR REFERENCES
-- =====================================================

-- Add calendar fields to bookings table
DO $$
BEGIN
  -- Add venue_calendar_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'venue_calendar_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN venue_calendar_id UUID REFERENCES venue_calendars(id) ON DELETE SET NULL;
    CREATE INDEX idx_bookings_venue_calendar ON bookings(venue_calendar_id);
  END IF;
  
  -- Add game_calendar_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'game_calendar_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN game_calendar_id UUID REFERENCES game_calendars(id) ON DELETE SET NULL;
    CREATE INDEX idx_bookings_game_calendar ON bookings(game_calendar_id);
  END IF;
  
  -- Add organization_name for quick reference (denormalized for reporting)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'organization_name'
  ) THEN
    ALTER TABLE bookings ADD COLUMN organization_name VARCHAR(255);
  END IF;
  
  -- Add venue_name for quick reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'venue_name'
  ) THEN
    ALTER TABLE bookings ADD COLUMN venue_name VARCHAR(255);
  END IF;
  
  -- Add game_name for quick reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'game_name'
  ) THEN
    ALTER TABLE bookings ADD COLUMN game_name VARCHAR(255);
  END IF;
END $$;

-- Add metadata fields to games table
DO $$
BEGIN
  -- Add calendar_id reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'calendar_id'
  ) THEN
    ALTER TABLE games ADD COLUMN calendar_id UUID REFERENCES game_calendars(id) ON DELETE SET NULL;
    CREATE INDEX idx_games_calendar ON games(calendar_id);
  END IF;
  
  -- Add venue_name for quick reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'venue_name'
  ) THEN
    ALTER TABLE games ADD COLUMN venue_name VARCHAR(255);
  END IF;
  
  -- Add organization_name for quick reference
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'organization_name'
  ) THEN
    ALTER TABLE games ADD COLUMN organization_name VARCHAR(255);
  END IF;
END $$;

-- Add company/organization name alias to organizations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE organizations ADD COLUMN company_name VARCHAR(255);
    -- Set company_name to name if not already set
    UPDATE organizations SET company_name = name WHERE company_name IS NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizations' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE organizations ADD COLUMN display_name VARCHAR(255);
    UPDATE organizations SET display_name = name WHERE display_name IS NULL;
  END IF;
END $$;

-- Add denormalized fields to venues table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venues' AND column_name = 'organization_name'
  ) THEN
    ALTER TABLE venues ADD COLUMN organization_name VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'venues' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE venues ADD COLUMN company_name VARCHAR(255);
  END IF;
END $$;

-- =====================================================
-- 3. INDEXES FOR MULTI-TENANT QUERIES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_venue_calendars_org ON venue_calendars(organization_id);
CREATE INDEX IF NOT EXISTS idx_venue_calendars_venue ON venue_calendars(venue_id);
CREATE INDEX IF NOT EXISTS idx_venue_calendars_active ON venue_calendars(is_active);
CREATE INDEX IF NOT EXISTS idx_venue_calendars_default ON venue_calendars(venue_id, is_default);

CREATE INDEX IF NOT EXISTS idx_game_calendars_org ON game_calendars(organization_id);
CREATE INDEX IF NOT EXISTS idx_game_calendars_venue ON game_calendars(venue_id);
CREATE INDEX IF NOT EXISTS idx_game_calendars_game ON game_calendars(game_id);
CREATE INDEX IF NOT EXISTS idx_game_calendars_venue_calendar ON game_calendars(venue_calendar_id);
CREATE INDEX IF NOT EXISTS idx_game_calendars_active ON game_calendars(is_active);

-- Composite indexes for common multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_bookings_org_venue_date ON bookings(organization_id, venue_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_org_game_date ON bookings(organization_id, game_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_games_org_venue ON games(organization_id, venue_id);
CREATE INDEX IF NOT EXISTS idx_customers_org_email ON customers(organization_id, email);

-- =====================================================
-- 4. TRIGGERS FOR AUTO-POPULATING DENORMALIZED FIELDS
-- =====================================================

-- Function to auto-populate organization/venue/game names in bookings
CREATE OR REPLACE FUNCTION populate_booking_names()
RETURNS TRIGGER AS $$
BEGIN
  -- Get organization name
  IF NEW.organization_id IS NOT NULL AND NEW.organization_name IS NULL THEN
    SELECT COALESCE(display_name, name) INTO NEW.organization_name
    FROM organizations
    WHERE id = NEW.organization_id;
  END IF;
  
  -- Get venue name
  IF NEW.venue_id IS NOT NULL AND NEW.venue_name IS NULL THEN
    SELECT name INTO NEW.venue_name
    FROM venues
    WHERE id = NEW.venue_id;
  END IF;
  
  -- Get game name
  IF NEW.game_id IS NOT NULL AND NEW.game_name IS NULL THEN
    SELECT name INTO NEW.game_name
    FROM games
    WHERE id = NEW.game_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_populate_booking_names ON bookings;
CREATE TRIGGER trigger_populate_booking_names
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION populate_booking_names();

-- Function to auto-populate names in games
CREATE OR REPLACE FUNCTION populate_game_names()
RETURNS TRIGGER AS $$
BEGIN
  -- Get organization name
  IF NEW.organization_id IS NOT NULL AND NEW.organization_name IS NULL THEN
    SELECT COALESCE(display_name, name) INTO NEW.organization_name
    FROM organizations
    WHERE id = NEW.organization_id;
  END IF;
  
  -- Get venue name
  IF NEW.venue_id IS NOT NULL AND NEW.venue_name IS NULL THEN
    SELECT name INTO NEW.venue_name
    FROM venues
    WHERE id = NEW.venue_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_populate_game_names ON games;
CREATE TRIGGER trigger_populate_game_names
  BEFORE INSERT OR UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION populate_game_names();

-- Function to auto-populate names in venues
CREATE OR REPLACE FUNCTION populate_venue_names()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NOT NULL THEN
    SELECT 
      COALESCE(display_name, name),
      COALESCE(company_name, name)
    INTO 
      NEW.organization_name,
      NEW.company_name
    FROM organizations
    WHERE id = NEW.organization_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_populate_venue_names ON venues;
CREATE TRIGGER trigger_populate_venue_names
  BEFORE INSERT OR UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION populate_venue_names();

-- Trigger for updated_at on calendar tables
DROP TRIGGER IF EXISTS update_venue_calendars_updated_at ON venue_calendars;
CREATE TRIGGER update_venue_calendars_updated_at
  BEFORE UPDATE ON venue_calendars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_calendars_updated_at ON game_calendars;
CREATE TRIGGER update_game_calendars_updated_at
  BEFORE UPDATE ON game_calendars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE venue_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_calendars ENABLE ROW LEVEL SECURITY;

-- Venue Calendars RLS
CREATE POLICY "Users can view venue calendars in their organization"
  ON venue_calendars FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage venue calendars in their organization"
  ON venue_calendars FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Game Calendars RLS
CREATE POLICY "Users can view game calendars in their organization"
  ON game_calendars FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage game calendars in their organization"
  ON game_calendars FOR ALL
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Public access for active calendars (for widgets)
CREATE POLICY "Public can view published venue calendars"
  ON venue_calendars FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "Public can view active game calendars"
  ON game_calendars FOR SELECT
  TO anon
  USING (is_active = true);

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Create default venue calendar when venue is created
CREATE OR REPLACE FUNCTION create_default_venue_calendar(p_venue_id UUID)
RETURNS UUID AS $$
DECLARE
  v_calendar_id UUID;
  v_org_id UUID;
  v_venue_name TEXT;
BEGIN
  -- Get venue details
  SELECT organization_id, name INTO v_org_id, v_venue_name
  FROM venues WHERE id = p_venue_id;
  
  -- Create default calendar
  INSERT INTO venue_calendars (
    organization_id,
    venue_id,
    name,
    slug,
    is_default,
    is_active
  ) VALUES (
    v_org_id,
    p_venue_id,
    v_venue_name || ' - Main Calendar',
    'main',
    true,
    true
  )
  RETURNING id INTO v_calendar_id;
  
  RETURN v_calendar_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create game calendar
CREATE OR REPLACE FUNCTION create_game_calendar(
  p_game_id UUID,
  p_venue_calendar_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_calendar_id UUID;
  v_org_id UUID;
  v_venue_id UUID;
  v_game_name TEXT;
BEGIN
  -- Get game details
  SELECT organization_id, venue_id, name INTO v_org_id, v_venue_id, v_game_name
  FROM games WHERE id = p_game_id;
  
  -- If no venue_calendar_id provided, get the default one
  IF p_venue_calendar_id IS NULL THEN
    SELECT id INTO p_venue_calendar_id
    FROM venue_calendars
    WHERE venue_id = v_venue_id AND is_default = true
    LIMIT 1;
  END IF;
  
  -- Create game calendar
  INSERT INTO game_calendars (
    organization_id,
    venue_id,
    venue_calendar_id,
    game_id,
    name,
    slug,
    is_active
  ) VALUES (
    v_org_id,
    v_venue_id,
    p_venue_calendar_id,
    p_game_id,
    v_game_name || ' Schedule',
    LOWER(REGEXP_REPLACE(v_game_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-schedule',
    true
  )
  RETURNING id INTO v_calendar_id;
  
  -- Update game with calendar reference
  UPDATE games SET calendar_id = v_calendar_id WHERE id = p_game_id;
  
  RETURN v_calendar_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get available time slots for a game calendar
CREATE OR REPLACE FUNCTION get_game_calendar_slots(
  p_game_calendar_id UUID,
  p_date DATE
)
RETURNS TABLE (
  slot_time TIME,
  slot_end_time TIME,
  is_available BOOLEAN,
  bookings_count INTEGER,
  max_bookings INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH calendar_info AS (
    SELECT 
      gc.id,
      gc.game_id,
      gc.slot_duration,
      gc.max_bookings_per_slot,
      COALESCE(gc.custom_hours, vc.operating_hours) as hours
    FROM game_calendars gc
    LEFT JOIN venue_calendars vc ON gc.venue_calendar_id = vc.id
    WHERE gc.id = p_game_calendar_id
  ),
  existing_bookings AS (
    SELECT 
      b.booking_time as start_time,
      COUNT(*) as booking_count
    FROM bookings b
    WHERE b.game_calendar_id = p_game_calendar_id
      AND b.booking_date = p_date
      AND b.status NOT IN ('cancelled')
    GROUP BY b.booking_time
  )
  SELECT
    generate_series::TIME as slot_time,
    (generate_series + (ci.slot_duration || ' minutes')::INTERVAL)::TIME as slot_end_time,
    COALESCE(eb.booking_count, 0) < ci.max_bookings_per_slot as is_available,
    COALESCE(eb.booking_count, 0)::INTEGER as bookings_count,
    ci.max_bookings_per_slot as max_bookings
  FROM calendar_info ci
  CROSS JOIN generate_series(
    '09:00'::TIME,
    '21:00'::TIME,
    (ci.slot_duration || ' minutes')::INTERVAL
  )
  LEFT JOIN existing_bookings eb ON eb.start_time = generate_series::TIME;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update booking with calendar metadata
CREATE OR REPLACE FUNCTION update_booking_calendar_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign calendar IDs if not provided
  IF NEW.game_id IS NOT NULL AND NEW.game_calendar_id IS NULL THEN
    SELECT calendar_id INTO NEW.game_calendar_id
    FROM games
    WHERE id = NEW.game_id;
  END IF;
  
  IF NEW.venue_id IS NOT NULL AND NEW.venue_calendar_id IS NULL THEN
    SELECT id INTO NEW.venue_calendar_id
    FROM venue_calendars
    WHERE venue_id = NEW.venue_id AND is_default = true
    LIMIT 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_booking_calendar_metadata ON bookings;
CREATE TRIGGER trigger_update_booking_calendar_metadata
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_calendar_metadata();

-- =====================================================
-- 7. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION create_default_venue_calendar(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_game_calendar(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_game_calendar_slots(UUID, DATE) TO anon, authenticated;

-- =====================================================
-- 8. COMMENTS
-- =====================================================

COMMENT ON TABLE venue_calendars IS 'Master calendars for venues - manages overall availability and operating hours';
COMMENT ON TABLE game_calendars IS 'Game-specific calendars - manages scheduling and availability for individual games';
COMMENT ON COLUMN bookings.venue_calendar_id IS 'Reference to the venue calendar used for this booking';
COMMENT ON COLUMN bookings.game_calendar_id IS 'Reference to the game calendar used for this booking';
COMMENT ON COLUMN bookings.organization_name IS 'Denormalized organization name for quick reporting';
COMMENT ON COLUMN bookings.venue_name IS 'Denormalized venue name for quick reporting';
COMMENT ON COLUMN bookings.game_name IS 'Denormalized game name for quick reporting';
COMMENT ON FUNCTION create_default_venue_calendar(UUID) IS 'Creates a default calendar when a new venue is created';
COMMENT ON FUNCTION create_game_calendar(UUID, UUID) IS 'Creates a calendar for a game, linked to a venue calendar';
COMMENT ON FUNCTION get_game_calendar_slots(UUID, DATE) IS 'Returns available time slots for a game calendar on a specific date';

