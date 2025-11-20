-- Migration: Add schedule column to games table
-- Date: 2025-11-16
-- Description: Add JSONB schedule column to store operating hours, custom dates, and blocked dates

-- Add schedule column if not exists
ALTER TABLE games 
ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT '{}'::jsonb;

-- Add GIN index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_games_schedule ON games USING gin (schedule);

-- Add comment explaining the schedule structure
COMMENT ON COLUMN games.schedule IS 'Game schedule configuration including operating days, hours, custom dates, and blocked dates. Structure: {operatingDays, startTime, endTime, slotInterval, advanceBooking, customHoursEnabled, customHours, customDates, blockedDates}';

-- Create validation function for schedule data
CREATE OR REPLACE FUNCTION validate_game_schedule(schedule_data JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  start_time TEXT;
  end_time TEXT;
BEGIN
  -- Check if schedule_data is null
  IF schedule_data IS NULL THEN
    RETURN TRUE; -- Allow null schedules
  END IF;
  
  -- Validate operating days exists and is array
  IF NOT (schedule_data ? 'operatingDays') THEN
    RAISE EXCEPTION 'schedule.operatingDays is required';
  END IF;
  
  IF jsonb_typeof(schedule_data->'operatingDays') != 'array' THEN
    RAISE EXCEPTION 'schedule.operatingDays must be an array';
  END IF;
  
  -- Validate time format (HH:MM)
  start_time := schedule_data->>'startTime';
  end_time := schedule_data->>'endTime';
  
  IF start_time IS NOT NULL AND NOT (start_time ~ '^([01]?[0-9]|2[0-3]):[0-5][0-9]$') THEN
    RAISE EXCEPTION 'Invalid startTime format. Expected HH:MM, got: %', start_time;
  END IF;
  
  IF end_time IS NOT NULL AND NOT (end_time ~ '^([01]?[0-9]|2[0-3]):[0-5][0-9]$') THEN
    RAISE EXCEPTION 'Invalid endTime format. Expected HH:MM, got: %', end_time;
  END IF;
  
  -- Validate slot interval
  IF (schedule_data->>'slotInterval')::INTEGER < 1 THEN
    RAISE EXCEPTION 'slotInterval must be at least 1 minute';
  END IF;
  
  -- Validate advance booking
  IF (schedule_data->>'advanceBooking')::INTEGER < 1 OR (schedule_data->>'advanceBooking')::INTEGER > 365 THEN
    RAISE EXCEPTION 'advanceBooking must be between 1 and 365 days';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add check constraint to validate schedule on insert/update
ALTER TABLE games
ADD CONSTRAINT check_valid_schedule
CHECK (validate_game_schedule(schedule));

-- Migrate existing game data to schedule column (if any old format exists)
DO $$
DECLARE
  game_record RECORD;
BEGIN
  FOR game_record IN 
    SELECT id, schedule 
    FROM games 
    WHERE schedule IS NULL OR schedule = '{}'::jsonb
  LOOP
    -- Initialize with default schedule
    UPDATE games
    SET schedule = jsonb_build_object(
      'operatingDays', '["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]'::jsonb,
      'startTime', '10:00',
      'endTime', '22:00',
      'slotInterval', 60,
      'advanceBooking', 30,
      'customHoursEnabled', false,
      'customHours', '{}'::jsonb,
      'customDates', '[]'::jsonb,
      'blockedDates', '[]'::jsonb
    )
    WHERE id = game_record.id;
  END LOOP;
  
  RAISE NOTICE 'Migrated % games to new schedule format', 
    (SELECT COUNT(*) FROM games WHERE schedule IS NOT NULL);
END $$;

-- Create helper function to get available time slots
CREATE OR REPLACE FUNCTION get_game_availability(
  p_game_id UUID,
  p_date DATE
)
RETURNS TABLE (
  time_slot TIME,
  available BOOLEAN,
  reason TEXT
) AS $$
DECLARE
  game_schedule JSONB;
  day_name TEXT;
  is_operating BOOLEAN;
BEGIN
  -- Get game schedule
  SELECT schedule INTO game_schedule
  FROM games
  WHERE id = p_game_id;
  
  IF game_schedule IS NULL THEN
    RAISE EXCEPTION 'Game schedule not found for game_id: %', p_game_id;
  END IF;
  
  -- Get day of week
  day_name := TO_CHAR(p_date, 'Day');
  day_name := TRIM(day_name);
  
  -- Check if day is in operating days
  is_operating := game_schedule->'operatingDays' @> to_jsonb(day_name);
  
  IF NOT is_operating THEN
    RETURN; -- No slots for non-operating days
  END IF;
  
  -- TODO: Generate time slots based on startTime, endTime, and slotInterval
  -- This is a placeholder - actual slot generation should be done in application code
  -- for better performance and flexibility
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_game_schedule(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_game_availability(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_game_availability(UUID, DATE) TO anon;
