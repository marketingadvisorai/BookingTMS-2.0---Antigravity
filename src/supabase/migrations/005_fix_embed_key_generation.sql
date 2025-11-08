-- =====================================================
-- Migration: Fix Embed Key and Slug Generation
-- Purpose: Ensure embed_key and slug are always generated
--          and updated properly for venues
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS venue_embed_key_trigger ON venues;

-- Improved function to generate embed key
CREATE OR REPLACE FUNCTION generate_embed_key()
RETURNS TEXT AS $$
DECLARE
  new_key TEXT;
  key_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random embed key
    new_key := 'emb_' || lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 12));
    
    -- Check if key already exists
    SELECT EXISTS(SELECT 1 FROM venues WHERE embed_key = new_key) INTO key_exists;
    
    -- Exit loop if key is unique
    EXIT WHEN NOT key_exists;
  END LOOP;
  
  RETURN new_key;
END;
$$ LANGUAGE plpgsql;

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
  slug_exists BOOLEAN;
BEGIN
  -- Generate base slug from name
  base_slug := lower(regexp_replace(trim(name), '[^a-z0-9]+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '^-|-$', '', 'g');
  
  -- If slug is empty, use 'venue'
  IF base_slug = '' OR base_slug IS NULL THEN
    base_slug := 'venue';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and add counter if needed
  LOOP
    SELECT EXISTS(SELECT 1 FROM venues WHERE slug = final_slug) INTO slug_exists;
    
    EXIT WHEN NOT slug_exists;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Enhanced function to auto-generate venue embed_key and slug
CREATE OR REPLACE FUNCTION auto_generate_venue_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate embed_key if not provided or empty
  IF NEW.embed_key IS NULL OR NEW.embed_key = '' THEN
    NEW.embed_key := generate_embed_key();
  END IF;
  
  -- Generate slug if not provided or empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  
  -- Regenerate slug if name changed (only on UPDATE)
  IF TG_OP = 'UPDATE' AND OLD.name != NEW.name AND (NEW.slug = OLD.slug OR NEW.slug IS NULL) THEN
    NEW.slug := generate_slug(NEW.name);
  END IF;
  
  -- Set default primary_color if not provided
  IF NEW.primary_color IS NULL OR NEW.primary_color = '' THEN
    NEW.primary_color := '#2563eb';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT and UPDATE
CREATE TRIGGER venue_auto_generate_fields_trigger
  BEFORE INSERT OR UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_venue_fields();

-- Update existing venues that don't have embed_key or slug
DO $$
DECLARE
  venue_record RECORD;
  new_embed_key TEXT;
  new_slug TEXT;
BEGIN
  FOR venue_record IN 
    SELECT id, name, embed_key, slug 
    FROM venues 
    WHERE embed_key IS NULL OR embed_key = '' OR slug IS NULL OR slug = ''
  LOOP
    -- Generate embed_key if missing
    IF venue_record.embed_key IS NULL OR venue_record.embed_key = '' THEN
      new_embed_key := generate_embed_key();
    ELSE
      new_embed_key := venue_record.embed_key;
    END IF;
    
    -- Generate slug if missing
    IF venue_record.slug IS NULL OR venue_record.slug = '' THEN
      new_slug := generate_slug(venue_record.name);
    ELSE
      new_slug := venue_record.slug;
    END IF;
    
    -- Update the venue
    UPDATE venues 
    SET 
      embed_key = new_embed_key,
      slug = new_slug,
      primary_color = COALESCE(primary_color, '#2563eb')
    WHERE id = venue_record.id;
    
    RAISE NOTICE 'Updated venue: % (embed_key: %, slug: %)', venue_record.name, new_embed_key, new_slug;
  END LOOP;
END $$;

-- Add index on embed_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_venues_embed_key ON venues(embed_key);
CREATE INDEX IF NOT EXISTS idx_venues_slug ON venues(slug);

-- Add unique constraint to prevent duplicate embed_keys
ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_embed_key_unique;
ALTER TABLE venues ADD CONSTRAINT venues_embed_key_unique UNIQUE (embed_key);

-- Add unique constraint to prevent duplicate slugs
ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_slug_unique;
ALTER TABLE venues ADD CONSTRAINT venues_slug_unique UNIQUE (slug);

-- Verify the changes
DO $$
DECLARE
  venue_count INTEGER;
  missing_embed_key_count INTEGER;
  missing_slug_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO venue_count FROM venues;
  SELECT COUNT(*) INTO missing_embed_key_count FROM venues WHERE embed_key IS NULL OR embed_key = '';
  SELECT COUNT(*) INTO missing_slug_count FROM venues WHERE slug IS NULL OR slug = '';
  
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Embed Key Generation Fix Applied Successfully';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Total venues: %', venue_count;
  RAISE NOTICE 'Venues missing embed_key: %', missing_embed_key_count;
  RAISE NOTICE 'Venues missing slug: %', missing_slug_count;
  RAISE NOTICE '==============================================';
END $$;
