# Apply Schedule Migration - Manual Instructions

**IMPORTANT:** Run this migration in your Supabase SQL Editor NOW

## How to Apply:

1. **Go to Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard/project/pmpktygjzywlhuujnlca
   - Click "SQL Editor" in the left sidebar

2. **Create New Query:**
   - Click "New query" button
   - Copy the SQL below
   - Paste into the editor
   - Click "Run" (or press Ctrl/Cmd + Enter)

3. **Verify Success:**
   - You should see: "Success. No rows returned"
   - And a notice: "Migrated X games to new schedule format"

---

## SQL Migration Code:

```sql
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

-- Migrate existing game data to schedule column (if any old format exists)
DO $$
DECLARE
  game_record RECORD;
  migration_count INTEGER := 0;
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
    
    migration_count := migration_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Migrated % games to new schedule format', migration_count;
END $$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION validate_game_schedule(JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_game_schedule(JSONB) TO anon;
```

---

## After Running Migration:

Run this query to verify the migration worked:

```sql
-- Check that schedule column exists and has data
SELECT 
  id,
  name,
  schedule->'operatingDays' as operating_days,
  schedule->'startTime' as start_time,
  schedule->'endTime' as end_time,
  schedule->'slotInterval' as slot_interval,
  schedule->'advanceBooking' as advance_booking
FROM games
LIMIT 5;
```

**Expected Result:** You should see schedule data for all your games.

---

## Troubleshooting:

### Error: "column already exists"
This is fine! It means the column was already added. Continue with the rest of the migration.

### Error: "permission denied"
Make sure you're using the project owner account in the Supabase dashboard.

### Success Message
Look for: "Migrated X games to new schedule format" in the output.

---

**AFTER APPLYING:** Return to the chat and confirm "Migration applied successfully!"
