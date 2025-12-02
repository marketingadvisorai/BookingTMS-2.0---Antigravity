-- =====================================================
-- Migration: 075_add_embed_pro_advanced_columns.sql
-- Description: Add missing columns for Embed Pro advanced features
-- Created: 2025-12-02
-- =====================================================

-- Add venue_layout JSONB column for venue embed configurations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'embed_configs' AND column_name = 'venue_layout'
  ) THEN
    ALTER TABLE embed_configs ADD COLUMN venue_layout JSONB DEFAULT '{
      "displayMode": "grid",
      "gridColumns": 2,
      "cardStyle": "default",
      "showActivityImage": true,
      "showActivityPrice": true,
      "showActivityDuration": true,
      "showActivityCapacity": true,
      "enableSearch": false,
      "compactOnMobile": true
    }'::jsonb;
    COMMENT ON COLUMN embed_configs.venue_layout IS 'Layout configuration for venue embeds (grid/list/carousel)';
  END IF;
END $$;

-- Add display_options JSONB column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'embed_configs' AND column_name = 'display_options'
  ) THEN
    ALTER TABLE embed_configs ADD COLUMN display_options JSONB DEFAULT '{
      "showCapacityWarning": true,
      "capacityWarningThreshold": 3,
      "showWaitlist": false,
      "showPromoField": true,
      "showSocialProof": false,
      "showActivityImages": true,
      "compactMode": false,
      "autoSelectTime": false,
      "showPoweredBy": true
    }'::jsonb;
    COMMENT ON COLUMN embed_configs.display_options IS 'Display options for widget behavior';
  END IF;
END $$;

-- Add custom_css column for advanced styling
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'embed_configs' AND column_name = 'custom_css'
  ) THEN
    ALTER TABLE embed_configs ADD COLUMN custom_css TEXT;
    COMMENT ON COLUMN embed_configs.custom_css IS 'Custom CSS for advanced widget styling';
  END IF;
END $$;

-- Add custom_logo_url column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'embed_configs' AND column_name = 'custom_logo_url'
  ) THEN
    ALTER TABLE embed_configs ADD COLUMN custom_logo_url TEXT;
    COMMENT ON COLUMN embed_configs.custom_logo_url IS 'Custom logo URL for white-labeling';
  END IF;
END $$;

-- Add custom_header column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'embed_configs' AND column_name = 'custom_header'
  ) THEN
    ALTER TABLE embed_configs ADD COLUMN custom_header TEXT;
    COMMENT ON COLUMN embed_configs.custom_header IS 'Custom header HTML/text';
  END IF;
END $$;

-- Add custom_footer column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'embed_configs' AND column_name = 'custom_footer'
  ) THEN
    ALTER TABLE embed_configs ADD COLUMN custom_footer TEXT;
    COMMENT ON COLUMN embed_configs.custom_footer IS 'Custom footer HTML/text';
  END IF;
END $$;

-- Add terms_conditions column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'embed_configs' AND column_name = 'terms_conditions'
  ) THEN
    ALTER TABLE embed_configs ADD COLUMN terms_conditions TEXT;
    COMMENT ON COLUMN embed_configs.terms_conditions IS 'Terms and conditions text';
  END IF;
END $$;

-- Add terms_required column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'embed_configs' AND column_name = 'terms_required'
  ) THEN
    ALTER TABLE embed_configs ADD COLUMN terms_required BOOLEAN DEFAULT false;
    COMMENT ON COLUMN embed_configs.terms_required IS 'Whether user must accept terms';
  END IF;
END $$;

-- Add social_links JSONB column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'embed_configs' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE embed_configs ADD COLUMN social_links JSONB DEFAULT '{}'::jsonb;
    COMMENT ON COLUMN embed_configs.social_links IS 'Social media links configuration';
  END IF;
END $$;

-- Add custom_fields JSONB array column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'embed_configs' AND column_name = 'custom_fields'
  ) THEN
    ALTER TABLE embed_configs ADD COLUMN custom_fields JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN embed_configs.custom_fields IS 'Custom form fields configuration';
  END IF;
END $$;

-- Add scheduling_config JSONB column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'embed_configs' AND column_name = 'scheduling_config'
  ) THEN
    ALTER TABLE embed_configs ADD COLUMN scheduling_config JSONB DEFAULT '{}'::jsonb;
    COMMENT ON COLUMN embed_configs.scheduling_config IS 'Scheduling rules configuration';
  END IF;
END $$;

-- Add allowed_domains TEXT array column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'embed_configs' AND column_name = 'allowed_domains'
  ) THEN
    ALTER TABLE embed_configs ADD COLUMN allowed_domains TEXT[] DEFAULT '{}';
    COMMENT ON COLUMN embed_configs.allowed_domains IS 'Whitelisted domains for embedding';
  END IF;
END $$;

-- Add conversion_tracking JSONB column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'embed_configs' AND column_name = 'conversion_tracking'
  ) THEN
    ALTER TABLE embed_configs ADD COLUMN conversion_tracking JSONB DEFAULT '{}'::jsonb;
    COMMENT ON COLUMN embed_configs.conversion_tracking IS 'Conversion tracking configuration (GA, FB Pixel, etc.)';
  END IF;
END $$;

-- Create index on venue_layout for faster venue embed queries
CREATE INDEX IF NOT EXISTS idx_embed_configs_venue_layout 
  ON embed_configs USING gin(venue_layout) 
  WHERE target_type = 'venue';

-- Log migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 075: Added Embed Pro advanced columns successfully';
END $$;
