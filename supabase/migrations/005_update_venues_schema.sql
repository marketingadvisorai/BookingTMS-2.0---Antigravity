-- Migration: 005_update_venues_schema
-- Description: Adds images and operating_hours to venues table to support "Pro" features.

-- 1. Add 'images' column (Array of text URLs)
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- 2. Add 'operating_hours' column (JSONB for flexible scheduling)
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS operating_hours jsonb DEFAULT '{
  "monday": {"open": "09:00", "close": "17:00", "closed": false},
  "tuesday": {"open": "09:00", "close": "17:00", "closed": false},
  "wednesday": {"open": "09:00", "close": "17:00", "closed": false},
  "thursday": {"open": "09:00", "close": "17:00", "closed": false},
  "friday": {"open": "09:00", "close": "17:00", "closed": false},
  "saturday": {"open": "10:00", "close": "20:00", "closed": false},
  "sunday": {"open": "10:00", "close": "20:00", "closed": false}
}'::jsonb;

-- 3. Add 'description' column if missing
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS description text;

-- 4. Add 'amenities' column (Array of text)
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}';

-- 5. Create Storage Bucket for Venue Images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-images', 'venue-images', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Storage Policy: Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'venue-images' );

-- 7. Storage Policy: Allow authenticated uploads (Organization Members)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'venue-images' 
  AND auth.role() = 'authenticated'
);
