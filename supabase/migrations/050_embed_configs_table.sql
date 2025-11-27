-- =====================================================
-- Migration: 050_embed_configs_table.sql
-- Description: Embed Pro 1.1 - Standalone embed management
-- Created: 2025-11-27
-- =====================================================

-- Drop existing tables if they exist (for clean slate)
DROP TABLE IF EXISTS embed_analytics CASCADE;
DROP TABLE IF EXISTS embed_configs CASCADE;

-- =====================================================
-- EMBED CONFIGS TABLE
-- =====================================================
CREATE TABLE embed_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Embed Type
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'booking-widget',
    'calendar-widget',
    'button-widget',
    'inline-widget',
    'popup-widget'
  )),
  
  -- Target (what to embed)
  target_type VARCHAR(50) NOT NULL CHECK (target_type IN (
    'activity',
    'venue',
    'multi-activity'
  )),
  target_id UUID,
  target_ids UUID[] DEFAULT '{}',
  
  -- Embed Key (unique identifier)
  embed_key VARCHAR(100) UNIQUE NOT NULL,
  
  -- Configuration (JSONB)
  config JSONB NOT NULL DEFAULT '{
    "showPricing": true,
    "showCalendar": true,
    "showTimeSlots": true,
    "showDescription": true,
    "allowMultipleBookings": false,
    "redirectAfterBooking": null,
    "language": "en",
    "timezone": "UTC",
    "buttonText": "Book Now",
    "successMessage": "Booking confirmed!"
  }'::jsonb,
  
  -- Styling (JSONB)
  style JSONB NOT NULL DEFAULT '{
    "primaryColor": "#2563eb",
    "secondaryColor": "#1e40af",
    "backgroundColor": "#ffffff",
    "textColor": "#1f2937",
    "borderRadius": "8px",
    "fontFamily": "Inter, system-ui, sans-serif",
    "buttonStyle": "filled",
    "theme": "light",
    "shadow": "md",
    "padding": "16px"
  }'::jsonb,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  analytics_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Usage Stats (denormalized for performance)
  view_count INTEGER NOT NULL DEFAULT 0,
  booking_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for embed_configs
CREATE INDEX idx_embed_configs_org ON embed_configs(organization_id);
CREATE INDEX idx_embed_configs_key ON embed_configs(embed_key);
CREATE INDEX idx_embed_configs_target ON embed_configs(target_type, target_id);
CREATE INDEX idx_embed_configs_active ON embed_configs(is_active) WHERE is_active = true;

-- =====================================================
-- EMBED ANALYTICS TABLE
-- =====================================================
CREATE TABLE embed_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  embed_config_id UUID NOT NULL REFERENCES embed_configs(id) ON DELETE CASCADE,
  
  -- Event Type
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'view',
    'interaction',
    'date_selected',
    'time_selected',
    'checkout_started',
    'booking_completed',
    'error'
  )),
  
  -- Event Data
  metadata JSONB DEFAULT '{}',
  
  -- Tracking
  session_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  country_code VARCHAR(2),
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for embed_analytics
CREATE INDEX idx_embed_analytics_config ON embed_analytics(embed_config_id);
CREATE INDEX idx_embed_analytics_event ON embed_analytics(event_type);
CREATE INDEX idx_embed_analytics_date ON embed_analytics(created_at);
CREATE INDEX idx_embed_analytics_session ON embed_analytics(session_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_embed_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_embed_configs_updated_at
  BEFORE UPDATE ON embed_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_embed_configs_updated_at();

-- Update view_count on analytics insert
CREATE OR REPLACE FUNCTION update_embed_view_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'view' THEN
    UPDATE embed_configs 
    SET view_count = view_count + 1,
        last_used_at = now()
    WHERE id = NEW.embed_config_id;
  ELSIF NEW.event_type = 'booking_completed' THEN
    UPDATE embed_configs 
    SET booking_count = booking_count + 1,
        last_used_at = now()
    WHERE id = NEW.embed_config_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_embed_stats
  AFTER INSERT ON embed_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_embed_view_count();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE embed_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE embed_analytics ENABLE ROW LEVEL SECURITY;

-- Embed configs: Organization members can manage (using users table)
CREATE POLICY "embed_configs_org_access" ON embed_configs
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('system-admin', 'super-admin')
    )
  );

-- Embed configs: Public read for active widgets (for embed script)
CREATE POLICY "embed_configs_public_read" ON embed_configs
  FOR SELECT USING (is_active = true);

-- Analytics: Public insert (for tracking from external sites)
CREATE POLICY "embed_analytics_public_insert" ON embed_analytics
  FOR INSERT WITH CHECK (true);

-- Analytics: Read for organization members
CREATE POLICY "embed_analytics_org_read" ON embed_analytics
  FOR SELECT USING (
    embed_config_id IN (
      SELECT id FROM embed_configs ec
      WHERE ec.organization_id IN (
        SELECT organization_id FROM users 
        WHERE id = auth.uid()
      )
    )
    OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('system-admin', 'super-admin')
    )
  );

-- =====================================================
-- REAL-TIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE embed_configs;

-- =====================================================
-- HELPER FUNCTION: Generate unique embed key
-- =====================================================

CREATE OR REPLACE FUNCTION generate_embed_key()
RETURNS VARCHAR(100) AS $$
DECLARE
  new_key VARCHAR(100);
  key_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate key: emb_ + random alphanumeric (24 chars)
    new_key := 'emb_' || encode(gen_random_bytes(12), 'hex');
    
    -- Check if key exists
    SELECT EXISTS(
      SELECT 1 FROM embed_configs WHERE embed_key = new_key
    ) INTO key_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT key_exists;
  END LOOP;
  
  RETURN new_key;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE embed_configs IS 'Embed Pro 1.1 - Widget embed configurations';
COMMENT ON TABLE embed_analytics IS 'Embed Pro 1.1 - Widget usage analytics';
COMMENT ON COLUMN embed_configs.type IS 'Widget type: booking-widget, calendar-widget, button-widget, inline-widget, popup-widget';
COMMENT ON COLUMN embed_configs.target_type IS 'What to embed: activity, venue, multi-activity';
COMMENT ON COLUMN embed_configs.embed_key IS 'Unique key used in embed scripts';
COMMENT ON COLUMN embed_configs.config IS 'Widget configuration options';
COMMENT ON COLUMN embed_configs.style IS 'Widget styling options';
