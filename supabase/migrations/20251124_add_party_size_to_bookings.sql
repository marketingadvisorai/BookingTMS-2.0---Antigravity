-- Add party_size column to bookings table if it doesn't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS party_size INTEGER;

-- Backfill party_size from players
UPDATE bookings SET party_size = players WHERE party_size IS NULL;

-- Make it not null if players was not null (optional, but good practice if we want to enforce it)
-- ALTER TABLE bookings ALTER COLUMN party_size SET NOT NULL;
