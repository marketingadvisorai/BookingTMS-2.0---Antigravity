-- ============================================================================
-- Migration: 086_error_monitoring_system.sql
-- Description: Enterprise error monitoring and system health tracking
-- Created: December 10, 2025
-- ============================================================================

-- ============================================================================
-- PART 1: ENUM TYPES
-- ============================================================================

-- Error type categories
CREATE TYPE error_type_enum AS ENUM (
  'javascript',   -- Browser JS errors
  'network',      -- Failed HTTP requests
  'api',          -- Edge Function errors
  'database',     -- Supabase/Postgres errors
  'stripe',       -- Payment processing errors
  'webhook',      -- Webhook delivery failures
  'embed',        -- Widget loading errors
  'auth',         -- Authentication failures
  'validation',   -- Data validation errors
  'runtime',      -- TypeErrors, ReferenceErrors
  'crash',        -- App crashes, blank screens
  'unknown'       -- Uncategorized errors
);

-- Severity levels
CREATE TYPE severity_enum AS ENUM (
  'debug',    -- Development only
  'info',     -- Informational
  'warning',  -- Degraded, workaround exists
  'error',    -- Feature broken
  'critical'  -- System down, data loss
);

-- Error status tracking
CREATE TYPE error_status_enum AS ENUM (
  'new',           -- Just captured
  'investigating', -- Being looked at
  'identified',    -- Root cause found
  'fixing',        -- Fix in progress
  'resolved',      -- Fixed
  'ignored',       -- Won't fix
  'recurring'      -- Keeps happening
);

-- Health check types
CREATE TYPE health_check_type_enum AS ENUM (
  'api',        -- API endpoints
  'webhook',    -- Webhook deliveries
  'database',   -- Database connections
  'stripe',     -- Stripe connectivity
  'embed',      -- Widget loading
  'email',      -- Email service
  'sms',        -- SMS service
  'external'    -- Third-party services
);

-- Health status
CREATE TYPE health_status_enum AS ENUM (
  'healthy',   -- All good
  'degraded',  -- Partially working
  'unhealthy', -- Not working
  'unknown'    -- Can't determine
);

-- User report types
CREATE TYPE report_type_enum AS ENUM (
  'bug',             -- Bug report
  'feature_request', -- Feature request
  'performance',     -- Performance issue
  'ui_issue',        -- UI/UX problem
  'data_issue',      -- Data inconsistency
  'other'            -- Other
);

-- Reporter types
CREATE TYPE reporter_type_enum AS ENUM (
  'system_admin', -- Platform admin
  'org_owner',    -- Organization owner
  'staff',        -- Organization staff
  'customer'      -- End customer
);

-- Priority levels
CREATE TYPE priority_enum AS ENUM (
  'low',      -- Nice to have
  'medium',   -- Should fix
  'high',     -- Important
  'critical'  -- Must fix immediately
);

-- Report status
CREATE TYPE report_status_enum AS ENUM (
  'open',         -- New report
  'in_progress',  -- Being worked on
  'pending_info', -- Waiting for more info
  'resolved',     -- Fixed
  'closed',       -- Closed without fix
  'duplicate'     -- Duplicate report
);

-- Alert types
CREATE TYPE alert_type_enum AS ENUM (
  'error_spike',     -- Sudden increase in errors
  'critical_error',  -- Critical error occurred
  'health_degraded', -- Service health degraded
  'uptime_incident', -- Uptime incident
  'new_user_report'  -- New user report
);

-- Alert channels
CREATE TYPE alert_channel_enum AS ENUM (
  'email',   -- Email notification
  'slack',   -- Slack webhook
  'webhook', -- Custom webhook
  'in_app'   -- In-app notification
);

-- Uptime status
CREATE TYPE uptime_status_enum AS ENUM (
  'operational',    -- All systems go
  'degraded',       -- Reduced capacity
  'partial_outage', -- Some services down
  'major_outage',   -- Major services down
  'maintenance'     -- Planned maintenance
);

-- ============================================================================
-- PART 2: MAIN TABLES
-- ============================================================================

-- System errors table
CREATE TABLE IF NOT EXISTS system_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_hash VARCHAR(64) NOT NULL,
  error_type error_type_enum NOT NULL,
  severity severity_enum NOT NULL DEFAULT 'error',
  message TEXT NOT NULL,
  stack_trace TEXT,
  component VARCHAR(255),
  file_path VARCHAR(500),
  line_number INTEGER,
  column_number INTEGER,
  
  -- Context
  url VARCHAR(2000),
  user_agent TEXT,
  browser VARCHAR(100),
  os VARCHAR(100),
  device_type VARCHAR(50),
  
  -- Multi-tenant
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  request_id VARCHAR(100),
  session_id VARCHAR(100),
  
  -- Status
  status error_status_enum DEFAULT 'new',
  occurrence_count INTEGER DEFAULT 1,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- AI Analysis
  ai_analysis JSONB,
  ai_suggestion TEXT,
  ai_analyzed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health checks table
CREATE TABLE IF NOT EXISTS health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_type health_check_type_enum NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  endpoint VARCHAR(500),
  
  -- Status
  status health_status_enum NOT NULL,
  response_time_ms INTEGER,
  status_code INTEGER,
  error_message TEXT,
  
  -- Details
  details JSONB DEFAULT '{}',
  
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- User error reports table
CREATE TABLE IF NOT EXISTS user_error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type report_type_enum NOT NULL,
  priority priority_enum DEFAULT 'medium',
  
  -- Reporter
  reporter_type reporter_type_enum NOT NULL,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_email VARCHAR(255),
  reporter_name VARCHAR(255),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Report content
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  
  -- Context
  url VARCHAR(2000),
  browser_info JSONB,
  screenshot_urls TEXT[],
  
  -- Linked error
  linked_error_id UUID REFERENCES system_errors(id) ON DELETE SET NULL,
  
  -- Status
  status report_status_enum DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Error alerts configuration
CREATE TABLE IF NOT EXISTS error_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  alert_type alert_type_enum NOT NULL,
  channel alert_channel_enum NOT NULL,
  
  -- Trigger conditions
  trigger_conditions JSONB NOT NULL,
  
  -- Notification details
  recipients TEXT[],
  webhook_url VARCHAR(2000),
  slack_channel VARCHAR(100),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert history
CREATE TABLE IF NOT EXISTS alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID REFERENCES error_alerts(id) ON DELETE CASCADE,
  
  -- Trigger info
  triggered_by_error_id UUID REFERENCES system_errors(id) ON DELETE SET NULL,
  triggered_by_health_check_id UUID REFERENCES health_checks(id) ON DELETE SET NULL,
  triggered_by_report_id UUID REFERENCES user_error_reports(id) ON DELETE SET NULL,
  
  -- Status
  delivery_status VARCHAR(50) NOT NULL,
  delivery_response TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System uptime tracking
CREATE TABLE IF NOT EXISTS system_uptime (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100) NOT NULL,
  status uptime_status_enum NOT NULL,
  
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  incident_id VARCHAR(100),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Error metrics aggregation (for dashboards)
CREATE TABLE IF NOT EXISTS error_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  granularity VARCHAR(20) NOT NULL, -- 'hour', 'day', 'week'
  
  -- Counts
  total_errors INTEGER DEFAULT 0,
  critical_errors INTEGER DEFAULT 0,
  unique_errors INTEGER DEFAULT 0,
  resolved_errors INTEGER DEFAULT 0,
  
  -- By type
  errors_by_type JSONB DEFAULT '{}',
  errors_by_severity JSONB DEFAULT '{}',
  
  -- Performance
  avg_resolution_time_hours NUMERIC,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PART 3: INDEXES
-- ============================================================================

-- System errors indexes
CREATE INDEX idx_errors_hash ON system_errors(error_hash);
CREATE INDEX idx_errors_type ON system_errors(error_type);
CREATE INDEX idx_errors_severity ON system_errors(severity);
CREATE INDEX idx_errors_status ON system_errors(status);
CREATE INDEX idx_errors_org ON system_errors(organization_id);
CREATE INDEX idx_errors_created ON system_errors(created_at DESC);
CREATE INDEX idx_errors_last_seen ON system_errors(last_seen_at DESC);
CREATE INDEX idx_errors_component ON system_errors(component);

-- Health checks indexes
CREATE INDEX idx_health_service ON health_checks(service_name, checked_at DESC);
CREATE INDEX idx_health_status ON health_checks(status);
CREATE INDEX idx_health_type ON health_checks(check_type);

-- User reports indexes
CREATE INDEX idx_reports_status ON user_error_reports(status);
CREATE INDEX idx_reports_org ON user_error_reports(organization_id);
CREATE INDEX idx_reports_reporter ON user_error_reports(reporter_type);
CREATE INDEX idx_reports_created ON user_error_reports(created_at DESC);

-- Uptime indexes
CREATE INDEX idx_uptime_service ON system_uptime(service_name, started_at DESC);
CREATE INDEX idx_uptime_status ON system_uptime(status);

-- Metrics indexes
CREATE INDEX idx_metrics_period ON error_metrics(period_start, period_end);

-- ============================================================================
-- PART 4: RLS POLICIES
-- ============================================================================

ALTER TABLE system_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_error_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_uptime ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_metrics ENABLE ROW LEVEL SECURITY;

-- System errors policies
CREATE POLICY "Platform admins can view all errors" ON system_errors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'system-admin'
    )
  );

CREATE POLICY "Org admins can view their org errors" ON system_errors
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Allow error insertion" ON system_errors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Platform admins can update errors" ON system_errors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'system-admin'
    )
  );

-- Health checks policies (read-only for authenticated users)
CREATE POLICY "Authenticated can view health" ON health_checks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service can insert health" ON health_checks
  FOR INSERT WITH CHECK (true);

-- User reports policies
CREATE POLICY "Anyone can submit reports" ON user_error_reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Platform admins can view all reports" ON user_error_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'system-admin'
    )
  );

CREATE POLICY "Users can view own reports" ON user_error_reports
  FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Platform admins can update reports" ON user_error_reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'system-admin'
    )
  );

-- Alert policies (system admin only)
CREATE POLICY "Platform admins manage alerts" ON error_alerts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'system-admin'
    )
  );

CREATE POLICY "Platform admins view alert history" ON alert_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'system-admin'
    )
  );

-- Uptime policies
CREATE POLICY "Authenticated can view uptime" ON system_uptime
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Service can manage uptime" ON system_uptime
  FOR ALL USING (true);

-- Metrics policies
CREATE POLICY "Platform admins view metrics" ON error_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'system-admin'
    )
  );

-- ============================================================================
-- PART 5: FUNCTIONS
-- ============================================================================

-- Function to upsert error (deduplicate by hash)
CREATE OR REPLACE FUNCTION upsert_system_error(
  p_error_hash VARCHAR(64),
  p_error_type error_type_enum,
  p_severity severity_enum,
  p_message TEXT,
  p_stack_trace TEXT DEFAULT NULL,
  p_component VARCHAR(255) DEFAULT NULL,
  p_file_path VARCHAR(500) DEFAULT NULL,
  p_line_number INTEGER DEFAULT NULL,
  p_url VARCHAR(2000) DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_organization_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_error_id UUID;
BEGIN
  -- Try to find existing error by hash
  SELECT id INTO v_error_id
  FROM system_errors
  WHERE error_hash = p_error_hash
  AND status NOT IN ('resolved', 'ignored')
  LIMIT 1;
  
  IF v_error_id IS NOT NULL THEN
    -- Update existing error
    UPDATE system_errors
    SET 
      occurrence_count = occurrence_count + 1,
      last_seen_at = NOW(),
      updated_at = NOW(),
      -- Update status if it was resolved
      status = CASE 
        WHEN status = 'resolved' THEN 'recurring'::error_status_enum
        ELSE status
      END
    WHERE id = v_error_id;
  ELSE
    -- Insert new error
    INSERT INTO system_errors (
      error_hash, error_type, severity, message, stack_trace,
      component, file_path, line_number, url,
      user_id, organization_id, metadata
    ) VALUES (
      p_error_hash, p_error_type, p_severity, p_message, p_stack_trace,
      p_component, p_file_path, p_line_number, p_url,
      p_user_id, p_organization_id, p_metadata
    )
    RETURNING id INTO v_error_id;
  END IF;
  
  RETURN v_error_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get error statistics
CREATE OR REPLACE FUNCTION get_error_stats(
  p_time_range INTERVAL DEFAULT '24 hours',
  p_organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
  total_errors BIGINT,
  critical_errors BIGINT,
  new_errors BIGINT,
  resolved_errors BIGINT,
  error_rate_per_hour NUMERIC,
  top_error_types JSONB,
  recent_errors JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE severity = 'critical') AS critical,
      COUNT(*) FILTER (WHERE status = 'new') AS new,
      COUNT(*) FILTER (WHERE status = 'resolved') AS resolved
    FROM system_errors
    WHERE created_at >= NOW() - p_time_range
    AND (p_organization_id IS NULL OR organization_id = p_organization_id)
  ),
  by_type AS (
    SELECT 
      jsonb_object_agg(error_type, cnt) AS types
    FROM (
      SELECT error_type::TEXT, COUNT(*) AS cnt
      FROM system_errors
      WHERE created_at >= NOW() - p_time_range
      AND (p_organization_id IS NULL OR organization_id = p_organization_id)
      GROUP BY error_type
      ORDER BY cnt DESC
      LIMIT 5
    ) t
  ),
  recent AS (
    SELECT 
      jsonb_agg(
        jsonb_build_object(
          'id', id,
          'type', error_type,
          'message', LEFT(message, 100),
          'severity', severity,
          'created_at', created_at
        )
      ) AS errors
    FROM (
      SELECT id, error_type, message, severity, created_at
      FROM system_errors
      WHERE created_at >= NOW() - p_time_range
      AND (p_organization_id IS NULL OR organization_id = p_organization_id)
      ORDER BY created_at DESC
      LIMIT 10
    ) r
  )
  SELECT 
    s.total,
    s.critical,
    s.new,
    s.resolved,
    ROUND(s.total::NUMERIC / EXTRACT(EPOCH FROM p_time_range) * 3600, 2),
    bt.types,
    r.errors
  FROM stats s, by_type bt, recent r;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get health summary
CREATE OR REPLACE FUNCTION get_health_summary()
RETURNS TABLE (
  service_name VARCHAR(100),
  current_status health_status_enum,
  last_check_time TIMESTAMPTZ,
  response_time_ms INTEGER,
  uptime_24h NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH latest_checks AS (
    SELECT DISTINCT ON (hc.service_name)
      hc.service_name,
      hc.status,
      hc.checked_at,
      hc.response_time_ms
    FROM health_checks hc
    ORDER BY hc.service_name, hc.checked_at DESC
  ),
  uptime_calc AS (
    SELECT 
      hc.service_name,
      ROUND(
        COUNT(*) FILTER (WHERE hc.status = 'healthy')::NUMERIC / 
        NULLIF(COUNT(*)::NUMERIC, 0) * 100,
        2
      ) AS uptime
    FROM health_checks hc
    WHERE hc.checked_at >= NOW() - INTERVAL '24 hours'
    GROUP BY hc.service_name
  )
  SELECT 
    lc.service_name,
    lc.status,
    lc.checked_at,
    lc.response_time_ms,
    COALESCE(uc.uptime, 0)
  FROM latest_checks lc
  LEFT JOIN uptime_calc uc ON lc.service_name = uc.service_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate service uptime
CREATE OR REPLACE FUNCTION calculate_uptime(
  p_service_name VARCHAR(100),
  p_days INTEGER DEFAULT 30
)
RETURNS NUMERIC AS $$
DECLARE
  v_total_checks BIGINT;
  v_healthy_checks BIGINT;
BEGIN
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'healthy')
  INTO v_total_checks, v_healthy_checks
  FROM health_checks
  WHERE service_name = p_service_name
  AND checked_at >= NOW() - (p_days || ' days')::INTERVAL;
  
  IF v_total_checks = 0 THEN
    RETURN 100.00;
  END IF;
  
  RETURN ROUND(v_healthy_checks::NUMERIC / v_total_checks * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user report stats
CREATE OR REPLACE FUNCTION get_report_stats()
RETURNS TABLE (
  total_reports BIGINT,
  open_reports BIGINT,
  in_progress BIGINT,
  resolved_today BIGINT,
  by_type JSONB,
  by_priority JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'open') AS open,
      COUNT(*) FILTER (WHERE status = 'in_progress') AS in_progress,
      COUNT(*) FILTER (WHERE status = 'resolved' AND resolved_at >= CURRENT_DATE) AS resolved
    FROM user_error_reports
  ),
  by_type AS (
    SELECT jsonb_object_agg(report_type::TEXT, cnt) AS types
    FROM (
      SELECT report_type, COUNT(*) AS cnt
      FROM user_error_reports
      GROUP BY report_type
    ) t
  ),
  by_priority AS (
    SELECT jsonb_object_agg(priority::TEXT, cnt) AS priorities
    FROM (
      SELECT priority, COUNT(*) AS cnt
      FROM user_error_reports
      WHERE status IN ('open', 'in_progress')
      GROUP BY priority
    ) p
  )
  SELECT s.total, s.open, s.in_progress, s.resolved, bt.types, bp.priorities
  FROM stats s, by_type bt, by_priority bp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- PART 6: TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_error_monitoring_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_errors_timestamp
  BEFORE UPDATE ON system_errors
  FOR EACH ROW
  EXECUTE FUNCTION update_error_monitoring_timestamp();

CREATE TRIGGER update_user_reports_timestamp
  BEFORE UPDATE ON user_error_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_error_monitoring_timestamp();

CREATE TRIGGER update_alerts_timestamp
  BEFORE UPDATE ON error_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_error_monitoring_timestamp();

-- ============================================================================
-- PART 7: REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE system_errors;
ALTER PUBLICATION supabase_realtime ADD TABLE health_checks;
ALTER PUBLICATION supabase_realtime ADD TABLE user_error_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE system_uptime;

-- ============================================================================
-- PART 8: COMMENTS
-- ============================================================================

COMMENT ON TABLE system_errors IS 'Stores all captured system errors with deduplication';
COMMENT ON TABLE health_checks IS 'Periodic health check results for system monitoring';
COMMENT ON TABLE user_error_reports IS 'User-submitted bug reports and feedback';
COMMENT ON TABLE error_alerts IS 'Alert configuration for error notifications';
COMMENT ON TABLE system_uptime IS 'Service uptime tracking and incident history';
COMMENT ON TABLE error_metrics IS 'Aggregated error metrics for dashboards';

COMMENT ON FUNCTION upsert_system_error IS 'Inserts or updates error with deduplication by hash';
COMMENT ON FUNCTION get_error_stats IS 'Returns error statistics for dashboard';
COMMENT ON FUNCTION get_health_summary IS 'Returns current health status of all services';
COMMENT ON FUNCTION calculate_uptime IS 'Calculates service uptime percentage';
