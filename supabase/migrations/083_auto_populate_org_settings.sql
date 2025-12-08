-- =====================================================
-- Migration: 083_auto_populate_org_settings
-- Purpose: Auto-populate organization_settings from organizations table
-- Date: 2025-12-08
-- =====================================================

-- =====================================================
-- ENHANCED GET OR CREATE FUNCTION
-- Pulls initial data from organizations table
-- =====================================================

CREATE OR REPLACE FUNCTION get_or_create_org_settings(p_organization_id UUID)
RETURNS organization_settings AS $$
DECLARE
  v_settings organization_settings;
  v_org RECORD;
BEGIN
  -- Try to get existing settings
  SELECT * INTO v_settings FROM organization_settings WHERE organization_id = p_organization_id;
  
  -- If no settings exist, create with data from organization
  IF v_settings IS NULL THEN
    -- Get organization data
    SELECT 
      name,
      owner_email,
      phone,
      address,
      city,
      state,
      zip,
      country,
      website
    INTO v_org
    FROM organizations
    WHERE id = p_organization_id;
    
    -- Create settings with organization data
    INSERT INTO organization_settings (
      organization_id,
      business_name,
      business_email,
      business_phone,
      business_address,
      timezone,
      currency
    )
    VALUES (
      p_organization_id,
      COALESCE(v_org.name, ''),
      COALESCE(v_org.owner_email, ''),
      COALESCE(v_org.phone, ''),
      CONCAT_WS(', ', 
        NULLIF(v_org.address, ''), 
        NULLIF(v_org.city, ''),
        NULLIF(v_org.state, ''),
        NULLIF(v_org.zip, ''),
        NULLIF(v_org.country, '')
      ),
      'America/New_York',
      'USD'
    )
    RETURNING * INTO v_settings;
  END IF;
  
  RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Auto-create settings on organization insert
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_create_org_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO organization_settings (
    organization_id,
    business_name,
    business_email,
    business_phone,
    business_address
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.name, ''),
    COALESCE(NEW.owner_email, ''),
    COALESCE(NEW.phone, ''),
    CONCAT_WS(', ', 
      NULLIF(NEW.address, ''), 
      NULLIF(NEW.city, ''),
      NULLIF(NEW.state, ''),
      NULLIF(NEW.zip, ''),
      NULLIF(NEW.country, '')
    )
  )
  ON CONFLICT (organization_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop if exists)
DROP TRIGGER IF EXISTS auto_create_org_settings ON organizations;
CREATE TRIGGER auto_create_org_settings
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_create_org_settings();

-- =====================================================
-- TRIGGER: Sync org updates to settings
-- =====================================================

CREATE OR REPLACE FUNCTION trigger_sync_org_to_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Only sync if settings exist and key fields changed
  IF NEW.name IS DISTINCT FROM OLD.name OR
     NEW.owner_email IS DISTINCT FROM OLD.owner_email OR
     NEW.phone IS DISTINCT FROM OLD.phone OR
     NEW.address IS DISTINCT FROM OLD.address THEN
    
    UPDATE organization_settings
    SET
      business_name = COALESCE(NEW.name, business_name),
      business_email = COALESCE(NEW.owner_email, business_email),
      business_phone = COALESCE(NEW.phone, business_phone),
      business_address = CONCAT_WS(', ', 
        NULLIF(NEW.address, ''), 
        NULLIF(NEW.city, ''),
        NULLIF(NEW.state, ''),
        NULLIF(NEW.zip, ''),
        NULLIF(NEW.country, '')
      ),
      updated_at = NOW()
    WHERE organization_id = NEW.id
    AND (
      business_name = '' OR business_name IS NULL OR
      business_name = OLD.name
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop if exists)
DROP TRIGGER IF EXISTS sync_org_to_settings ON organizations;
CREATE TRIGGER sync_org_to_settings
  AFTER UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_sync_org_to_settings();

-- =====================================================
-- BACKFILL: Create settings for existing organizations
-- =====================================================

INSERT INTO organization_settings (
  organization_id,
  business_name,
  business_email,
  business_phone,
  business_address
)
SELECT 
  o.id,
  COALESCE(o.name, ''),
  COALESCE(o.owner_email, ''),
  COALESCE(o.phone, ''),
  CONCAT_WS(', ', 
    NULLIF(o.address, ''), 
    NULLIF(o.city, ''),
    NULLIF(o.state, ''),
    NULLIF(o.zip, ''),
    NULLIF(o.country, '')
  )
FROM organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM organization_settings os WHERE os.organization_id = o.id
)
ON CONFLICT (organization_id) DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_or_create_org_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_create_org_settings() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_sync_org_to_settings() TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 083 complete:';
  RAISE NOTICE '- Enhanced get_or_create_org_settings to pull from org data';
  RAISE NOTICE '- Created trigger to auto-create settings on org insert';
  RAISE NOTICE '- Created trigger to sync org updates to settings';
  RAISE NOTICE '- Backfilled settings for existing organizations';
END$$;
