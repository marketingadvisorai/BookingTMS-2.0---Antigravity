-- =====================================================
-- Migration: 080_organization_settings_module
-- Purpose: Organization settings and notification preferences
-- Date: 2025-12-04
-- =====================================================

-- =====================================================
-- ORGANIZATION SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  
  -- Business Info
  business_name VARCHAR(255),
  business_email VARCHAR(255),
  business_phone VARCHAR(50),
  business_address TEXT,
  timezone VARCHAR(100) DEFAULT 'America/New_York',
  currency VARCHAR(10) DEFAULT 'USD',
  date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
  time_format VARCHAR(10) DEFAULT '12h',
  
  -- Branding
  logo_url TEXT,
  favicon_url TEXT,
  primary_color VARCHAR(20) DEFAULT '#4f46e5',
  accent_color VARCHAR(20) DEFAULT '#6366f1',
  
  -- Booking Settings
  advance_booking_days INT DEFAULT 30,
  min_booking_notice_hours INT DEFAULT 2,
  allow_same_day_booking BOOLEAN DEFAULT TRUE,
  require_deposit BOOLEAN DEFAULT FALSE,
  deposit_percentage DECIMAL(5,2) DEFAULT 0,
  cancellation_policy TEXT,
  cancellation_hours INT DEFAULT 24,
  
  -- Email/Notification Settings
  email_from_name VARCHAR(255),
  email_reply_to VARCHAR(255),
  email_signature TEXT,
  
  -- Integration Settings
  google_analytics_id VARCHAR(50),
  facebook_pixel_id VARCHAR(50),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_settings_org ON organization_settings(organization_id);

-- =====================================================
-- NOTIFICATION PREFERENCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Email Notifications
  email_new_bookings BOOLEAN DEFAULT TRUE,
  email_booking_changes BOOLEAN DEFAULT TRUE,
  email_cancellations BOOLEAN DEFAULT TRUE,
  email_daily_reports BOOLEAN DEFAULT FALSE,
  email_weekly_reports BOOLEAN DEFAULT TRUE,
  email_payment_received BOOLEAN DEFAULT TRUE,
  email_refund_processed BOOLEAN DEFAULT TRUE,
  email_low_availability BOOLEAN DEFAULT FALSE,
  
  -- SMS Notifications
  sms_enabled BOOLEAN DEFAULT FALSE,
  sms_phone VARCHAR(50),
  sms_booking_reminders BOOLEAN DEFAULT FALSE,
  sms_urgent_alerts BOOLEAN DEFAULT FALSE,
  
  -- Push Notifications
  push_enabled BOOLEAN DEFAULT FALSE,
  push_new_bookings BOOLEAN DEFAULT TRUE,
  push_urgent_alerts BOOLEAN DEFAULT TRUE,
  
  -- Notification Schedule
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_notif_prefs_org ON notification_preferences(organization_id);
CREATE INDEX IF NOT EXISTS idx_notif_prefs_user ON notification_preferences(user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_org_settings_updated_at
  BEFORE UPDATE ON organization_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notif_prefs_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Org Settings: Platform admins see all
CREATE POLICY "Platform admins manage all org settings"
  ON organization_settings FOR ALL
  USING (is_platform_admin());

-- Org Settings: Org admins can manage their own
CREATE POLICY "Org admins manage own org settings"
  ON organization_settings FOR ALL
  USING (organization_id = get_my_organization_id_safe());

-- Org Settings: Org members can view
CREATE POLICY "Org members view own org settings"
  ON organization_settings FOR SELECT
  USING (organization_id = get_my_organization_id_safe());

-- Notification Preferences: Platform admins see all
CREATE POLICY "Platform admins manage all notif prefs"
  ON notification_preferences FOR ALL
  USING (is_platform_admin());

-- Notification Preferences: Users manage their own
CREATE POLICY "Users manage own notif prefs"
  ON notification_preferences FOR ALL
  USING (user_id = auth.uid() OR (user_id IS NULL AND organization_id = get_my_organization_id_safe()));

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get or create org settings
CREATE OR REPLACE FUNCTION get_or_create_org_settings(p_organization_id UUID)
RETURNS organization_settings AS $$
DECLARE
  v_settings organization_settings;
BEGIN
  SELECT * INTO v_settings FROM organization_settings WHERE organization_id = p_organization_id;
  
  IF v_settings IS NULL THEN
    INSERT INTO organization_settings (organization_id)
    VALUES (p_organization_id)
    RETURNING * INTO v_settings;
  END IF;
  
  RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get or create user notification preferences
CREATE OR REPLACE FUNCTION get_or_create_notif_prefs(p_organization_id UUID, p_user_id UUID DEFAULT NULL)
RETURNS notification_preferences AS $$
DECLARE
  v_prefs notification_preferences;
BEGIN
  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_prefs FROM notification_preferences 
    WHERE organization_id = p_organization_id AND user_id = p_user_id;
  ELSE
    SELECT * INTO v_prefs FROM notification_preferences 
    WHERE organization_id = p_organization_id AND user_id IS NULL;
  END IF;
  
  IF v_prefs IS NULL THEN
    INSERT INTO notification_preferences (organization_id, user_id)
    VALUES (p_organization_id, p_user_id)
    RETURNING * INTO v_prefs;
  END IF;
  
  RETURN v_prefs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_or_create_org_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_notif_prefs(UUID, UUID) TO authenticated;

-- =====================================================
-- REAL-TIME
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE organization_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE notification_preferences;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 080 complete:';
  RAISE NOTICE '- organization_settings table created';
  RAISE NOTICE '- notification_preferences table created';
  RAISE NOTICE '- RLS policies configured';
  RAISE NOTICE '- Helper functions created';
  RAISE NOTICE '- Real-time enabled';
END$$;
