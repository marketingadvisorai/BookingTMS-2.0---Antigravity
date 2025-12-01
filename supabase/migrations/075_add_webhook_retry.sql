-- ============================================================================
-- Migration: 075_add_webhook_retry.sql
-- Description: Add webhook retry mechanism for failed webhook deliveries
-- Date: 2025-12-02
-- ============================================================================

-- Failed webhook events table
CREATE TABLE IF NOT EXISTS webhook_failed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  event_id VARCHAR(255),
  payload JSONB NOT NULL,
  error_message TEXT,
  error_code VARCHAR(50),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 5,
  next_retry_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'retrying', 'succeeded', 'failed', 'exhausted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_attempted_at TIMESTAMPTZ,
  succeeded_at TIMESTAMPTZ,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_webhook_failed_events_status 
  ON webhook_failed_events(status) WHERE status IN ('pending', 'retrying');

CREATE INDEX IF NOT EXISTS idx_webhook_failed_events_next_retry 
  ON webhook_failed_events(next_retry_at) WHERE status IN ('pending', 'retrying');

CREATE INDEX IF NOT EXISTS idx_webhook_failed_events_org 
  ON webhook_failed_events(organization_id);

CREATE INDEX IF NOT EXISTS idx_webhook_failed_events_event_type 
  ON webhook_failed_events(event_type);

-- Function to calculate next retry time with exponential backoff
CREATE OR REPLACE FUNCTION calculate_next_retry_time(retry_count INTEGER)
RETURNS TIMESTAMPTZ
LANGUAGE plpgsql
AS $$
DECLARE
  delay_seconds INTEGER;
BEGIN
  -- Exponential backoff: 1min, 5min, 15min, 1hr, 4hr
  CASE retry_count
    WHEN 0 THEN delay_seconds := 60;        -- 1 minute
    WHEN 1 THEN delay_seconds := 300;       -- 5 minutes
    WHEN 2 THEN delay_seconds := 900;       -- 15 minutes
    WHEN 3 THEN delay_seconds := 3600;      -- 1 hour
    WHEN 4 THEN delay_seconds := 14400;     -- 4 hours
    ELSE delay_seconds := 86400;            -- 24 hours
  END CASE;
  
  RETURN NOW() + (delay_seconds || ' seconds')::INTERVAL;
END;
$$;

-- Function to log a failed webhook event
CREATE OR REPLACE FUNCTION log_failed_webhook(
  p_event_type VARCHAR(100),
  p_event_id VARCHAR(255),
  p_payload JSONB,
  p_error_message TEXT,
  p_error_code VARCHAR(50) DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO webhook_failed_events (
    event_type,
    event_id,
    payload,
    error_message,
    error_code,
    organization_id,
    next_retry_at
  ) VALUES (
    p_event_type,
    p_event_id,
    p_payload,
    p_error_message,
    p_error_code,
    p_organization_id,
    calculate_next_retry_time(0)
  )
  RETURNING id INTO v_event_id;
  
  RETURN v_event_id;
END;
$$;

-- Function to get events ready for retry
CREATE OR REPLACE FUNCTION get_webhook_events_for_retry(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  event_type VARCHAR(100),
  event_id VARCHAR(255),
  payload JSONB,
  retry_count INTEGER,
  organization_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  UPDATE webhook_failed_events wfe
  SET 
    status = 'retrying',
    last_attempted_at = NOW(),
    updated_at = NOW()
  WHERE wfe.id IN (
    SELECT w.id 
    FROM webhook_failed_events w
    WHERE w.status IN ('pending', 'retrying')
      AND w.next_retry_at <= NOW()
      AND w.retry_count < w.max_retries
    ORDER BY w.next_retry_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  RETURNING 
    wfe.id,
    wfe.event_type,
    wfe.event_id,
    wfe.payload,
    wfe.retry_count,
    wfe.organization_id;
END;
$$;

-- Function to mark webhook retry as succeeded
CREATE OR REPLACE FUNCTION mark_webhook_succeeded(p_event_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE webhook_failed_events
  SET 
    status = 'succeeded',
    succeeded_at = NOW(),
    updated_at = NOW()
  WHERE id = p_event_id;
  
  RETURN FOUND;
END;
$$;

-- Function to mark webhook retry as failed
CREATE OR REPLACE FUNCTION mark_webhook_retry_failed(
  p_event_id UUID,
  p_error_message TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_retry_count INTEGER;
  v_max_retries INTEGER;
  v_new_status VARCHAR(20);
BEGIN
  SELECT retry_count, max_retries 
  INTO v_retry_count, v_max_retries
  FROM webhook_failed_events 
  WHERE id = p_event_id;
  
  v_retry_count := v_retry_count + 1;
  
  IF v_retry_count >= v_max_retries THEN
    v_new_status := 'exhausted';
  ELSE
    v_new_status := 'pending';
  END IF;
  
  UPDATE webhook_failed_events
  SET 
    status = v_new_status,
    retry_count = v_retry_count,
    error_message = p_error_message,
    next_retry_at = CASE 
      WHEN v_new_status = 'pending' THEN calculate_next_retry_time(v_retry_count)
      ELSE NULL
    END,
    updated_at = NOW()
  WHERE id = p_event_id;
  
  RETURN FOUND;
END;
$$;

-- Function to get webhook retry statistics
CREATE OR REPLACE FUNCTION get_webhook_retry_stats(p_organization_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_pending BIGINT,
  total_retrying BIGINT,
  total_succeeded BIGINT,
  total_failed BIGINT,
  total_exhausted BIGINT,
  avg_retries NUMERIC,
  oldest_pending TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'pending'),
    COUNT(*) FILTER (WHERE status = 'retrying'),
    COUNT(*) FILTER (WHERE status = 'succeeded'),
    COUNT(*) FILTER (WHERE status = 'failed'),
    COUNT(*) FILTER (WHERE status = 'exhausted'),
    AVG(retry_count)::NUMERIC,
    MIN(created_at) FILTER (WHERE status IN ('pending', 'retrying'))
  FROM webhook_failed_events
  WHERE (p_organization_id IS NULL OR organization_id = p_organization_id);
END;
$$;

-- Cleanup function for old webhook events (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_events()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM webhook_failed_events
    WHERE created_at < NOW() - INTERVAL '30 days'
      AND status IN ('succeeded', 'exhausted', 'failed')
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$;

-- RLS Policies
ALTER TABLE webhook_failed_events ENABLE ROW LEVEL SECURITY;

-- Platform admins can see all events
CREATE POLICY "Platform admins can view all webhook events"
  ON webhook_failed_events FOR SELECT
  USING (is_platform_admin());

-- Org admins can see their org's events
CREATE POLICY "Org admins can view org webhook events"
  ON webhook_failed_events FOR SELECT
  USING (
    organization_id IS NOT NULL 
    AND organization_id = get_my_organization_id_safe()
  );

-- Service role has full access for retry processing
CREATE POLICY "Service role full access"
  ON webhook_failed_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Schedule cleanup (requires pg_cron)
-- SELECT cron.schedule('cleanup-webhook-events', '0 3 * * *', 'SELECT cleanup_old_webhook_events()');

COMMENT ON TABLE webhook_failed_events IS 'Stores failed webhook events for retry processing';
COMMENT ON FUNCTION log_failed_webhook IS 'Logs a failed webhook event for later retry';
COMMENT ON FUNCTION get_webhook_events_for_retry IS 'Gets events ready to be retried with row locking';
COMMENT ON FUNCTION mark_webhook_succeeded IS 'Marks a webhook retry as successful';
COMMENT ON FUNCTION mark_webhook_retry_failed IS 'Marks a retry as failed and schedules next attempt';
