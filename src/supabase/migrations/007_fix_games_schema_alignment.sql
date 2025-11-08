-- Migration 007: Fix games table schema alignment
-- Aligns database schema with TypeScript interfaces

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add status column (replaces is_active)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'status'
  ) THEN
    ALTER TABLE games ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance'));
    -- Migrate data from is_active to status
    UPDATE games SET status = CASE WHEN is_active THEN 'active' ELSE 'inactive' END;
  END IF;

  -- Add duration column (replaces duration_minutes)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'duration'
  ) THEN
    ALTER TABLE games ADD COLUMN duration INTEGER;
    -- Migrate data from duration_minutes to duration
    UPDATE games SET duration = duration_minutes WHERE duration_minutes IS NOT NULL;
  END IF;

  -- Add settings JSONB column for additional configuration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'settings'
  ) THEN
    ALTER TABLE games ADD COLUMN settings JSONB DEFAULT '{}';
    -- Migrate additional_info to settings if it exists
    UPDATE games SET settings = additional_info WHERE additional_info IS NOT NULL;
  END IF;

  -- Add created_by column for tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'games' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE games ADD COLUMN created_by UUID;
  END IF;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_created_by ON games(created_by);

-- Update the get_venue_games RPC function to use correct column names
CREATE OR REPLACE FUNCTION get_venue_games(p_venue_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  slug VARCHAR,
  description TEXT,
  tagline VARCHAR,
  difficulty VARCHAR,
  duration INTEGER,
  min_players INTEGER,
  max_players INTEGER,
  price DECIMAL,
  child_price DECIMAL,
  min_age INTEGER,
  success_rate INTEGER,
  image_url TEXT,
  status VARCHAR,
  settings JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.slug,
    g.description,
    g.tagline,
    g.difficulty::VARCHAR,
    COALESCE(g.duration, g.duration_minutes) as duration,
    g.min_players,
    g.max_players,
    g.price,
    g.child_price,
    g.min_age,
    g.success_rate,
    g.image_url,
    COALESCE(g.status, CASE WHEN g.is_active THEN 'active' ELSE 'inactive' END) as status,
    COALESCE(g.settings, g.additional_info, '{}'::JSONB) as settings
  FROM games g
  WHERE g.venue_id = p_venue_id 
    AND (g.status = 'active' OR (g.status IS NULL AND g.is_active = true))
  ORDER BY g.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_venue_games(UUID) TO anon, authenticated;

-- Add comment
COMMENT ON FUNCTION get_venue_games(UUID) IS 'Fetches active games for a venue with aligned schema';
