-- ============================================================================
-- Migration: 076_add_sms_logs.sql
-- Description: Add SMS logs table for tracking Twilio messages
-- Date: 2025-12-02
-- ============================================================================

-- SMS logs table
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'notification',
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  twilio_sid VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'undelivered')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sms_logs_booking ON sms_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_organization ON sms_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created ON sms_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_logs_phone ON sms_logs(phone_number);

-- RLS Policies
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- Platform admins can see all logs
CREATE POLICY "Platform admins can view all SMS logs"
  ON sms_logs FOR SELECT
  USING (is_platform_admin());

-- Org admins can see their org's logs
CREATE POLICY "Org admins can view org SMS logs"
  ON sms_logs FOR SELECT
  USING (organization_id = get_my_organization_id_safe());

-- Service role has full access
CREATE POLICY "Service role full access to SMS logs"
  ON sms_logs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Function to get SMS stats
CREATE OR REPLACE FUNCTION get_sms_stats(
  p_organization_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_sent BIGINT,
  total_delivered BIGINT,
  total_failed BIGINT,
  by_type JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'sent' OR status = 'delivered'),
    COUNT(*) FILTER (WHERE status = 'delivered'),
    COUNT(*) FILTER (WHERE status = 'failed' OR status = 'undelivered'),
    jsonb_object_agg(
      COALESCE(type, 'unknown'),
      cnt
    ) as by_type
  FROM (
    SELECT type, COUNT(*) as cnt
    FROM sms_logs
    WHERE (p_organization_id IS NULL OR organization_id = p_organization_id)
      AND created_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY type
  ) sub;
END;
$$;

COMMENT ON TABLE sms_logs IS 'Stores SMS message logs for tracking and analytics';
COMMENT ON FUNCTION get_sms_stats IS 'Returns SMS delivery statistics';
