-- =====================================================
-- Migration: Add Embed Key Validation
-- Purpose: Prevent invalid embed_key formats from being inserted
--          Ensures only 'emb_xxxxxxxxxxxx' format is allowed
-- =====================================================

-- Add CHECK constraint to ensure embed_key has correct format
ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_embed_key_format_check;
ALTER TABLE venues ADD CONSTRAINT venues_embed_key_format_check 
  CHECK (embed_key ~ '^emb_[a-z0-9]{12}$');

-- Add CHECK constraint to ensure slug has correct format (lowercase, alphanumeric, hyphens only)
ALTER TABLE venues DROP CONSTRAINT IF EXISTS venues_slug_format_check;
ALTER TABLE venues ADD CONSTRAINT venues_slug_format_check 
  CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- Add NOT NULL constraints (after backfilling in previous migration)
ALTER TABLE venues ALTER COLUMN embed_key SET NOT NULL;
ALTER TABLE venues ALTER COLUMN slug SET NOT NULL;

-- Function to validate and sanitize venue data before insert/update
CREATE OR REPLACE FUNCTION validate_venue_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure embed_key is never manually set to wrong format
  IF NEW.embed_key IS NOT NULL AND NEW.embed_key != '' THEN
    IF NEW.embed_key !~ '^emb_[a-z0-9]{12}$' THEN
      RAISE EXCEPTION 'Invalid embed_key format. Must be emb_xxxxxxxxxxxx (12 lowercase alphanumeric chars). Got: %', NEW.embed_key;
    END IF;
  END IF;
  
  -- Ensure slug is lowercase and properly formatted
  IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    IF NEW.slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$' THEN
      RAISE EXCEPTION 'Invalid slug format. Must be lowercase alphanumeric with hyphens. Got: %', NEW.slug;
    END IF;
  END IF;
  
  -- Ensure primary_color is valid hex color
  IF NEW.primary_color IS NOT NULL AND NEW.primary_color != '' THEN
    IF NEW.primary_color !~ '^#[0-9a-fA-F]{6}$' THEN
      RAISE EXCEPTION 'Invalid primary_color format. Must be hex color like #2563eb. Got: %', NEW.primary_color;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create validation trigger (runs AFTER auto-generation trigger)
DROP TRIGGER IF EXISTS validate_venue_data_trigger ON venues;
CREATE TRIGGER validate_venue_data_trigger
  BEFORE INSERT OR UPDATE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION validate_venue_data();

-- Add helpful comments
COMMENT ON CONSTRAINT venues_embed_key_format_check ON venues IS 
  'Ensures embed_key follows format: emb_xxxxxxxxxxxx (12 lowercase alphanumeric characters)';

COMMENT ON CONSTRAINT venues_slug_format_check ON venues IS 
  'Ensures slug is lowercase alphanumeric with hyphens only';

COMMENT ON FUNCTION validate_venue_data() IS 
  'Validates venue data format before insert/update to prevent invalid embed_keys and slugs';

-- Log success
DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Embed Key Validation Added Successfully';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Constraints added:';
  RAISE NOTICE '  - embed_key format: emb_[a-z0-9]{12}';
  RAISE NOTICE '  - slug format: lowercase-with-hyphens';
  RAISE NOTICE '  - primary_color format: #RRGGBB';
  RAISE NOTICE '  - embed_key and slug are now NOT NULL';
  RAISE NOTICE '==============================================';
END $$;
