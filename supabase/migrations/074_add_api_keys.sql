-- ============================================================================
-- Migration: 074_add_api_keys.sql
-- Purpose: Add API key management with scoping support for enterprise security
-- Date: 2025-12-02
-- ============================================================================

-- Create API key scope enum
DO $$ BEGIN
  CREATE TYPE api_key_scope AS ENUM (
    'read:bookings',
    'write:bookings',
    'read:customers',
    'write:customers',
    'read:activities',
    'write:activities',
    'read:venues',
    'write:venues',
    'read:analytics',
    'write:settings',
    'admin:full'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Key identification
  name VARCHAR(255) NOT NULL,
  description TEXT,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,  -- First 8 chars for identification (e.g., "bk_live_")
  
  -- Scoping and permissions
  scopes TEXT[] NOT NULL DEFAULT '{}',
  environment VARCHAR(20) NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'test', 'development')),
  
  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 1000,
  rate_limit_per_hour INTEGER DEFAULT 10000,
  
  -- Restrictions
  allowed_ips INET[],              -- NULL = all IPs allowed
  allowed_origins TEXT[],          -- NULL = all origins allowed
  allowed_endpoints TEXT[],        -- NULL = all endpoints allowed
  
  -- Lifecycle
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  last_used_ip INET,
  usage_count BIGINT DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES users(id),
  revoke_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API key usage logs
CREATE TABLE IF NOT EXISTS api_key_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  
  -- Request details
  endpoint VARCHAR(500) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  
  -- Client info
  ip_address INET,
  user_agent TEXT,
  origin TEXT,
  
  -- Request metadata
  request_body_size INTEGER,
  response_body_size INTEGER,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for api_keys
CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_environment ON api_keys(organization_id, environment);
-- Partial index for non-revoked keys (without NOW() which isn't immutable)
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(organization_id, expires_at) 
  WHERE revoked_at IS NULL;

-- Indexes for usage logs
CREATE INDEX IF NOT EXISTS idx_api_key_usage_key ON api_key_usage_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_time ON api_key_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_key_usage_key_time ON api_key_usage_logs(api_key_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys
DROP POLICY IF EXISTS "org_members_view_api_keys" ON api_keys;
CREATE POLICY "org_members_view_api_keys" ON api_keys
  FOR SELECT USING (
    organization_id = get_my_organization_id()
    OR is_platform_admin()
  );

DROP POLICY IF EXISTS "org_admins_manage_api_keys" ON api_keys;
CREATE POLICY "org_admins_manage_api_keys" ON api_keys
  FOR ALL USING (
    organization_id = get_my_organization_id()
    OR is_platform_admin()
  );

-- RLS Policies for usage logs
DROP POLICY IF EXISTS "org_members_view_usage_logs" ON api_key_usage_logs;
CREATE POLICY "org_members_view_usage_logs" ON api_key_usage_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM api_keys 
      WHERE api_keys.id = api_key_usage_logs.api_key_id
      AND (api_keys.organization_id = get_my_organization_id() OR is_platform_admin())
    )
  );

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key(
  p_organization_id UUID,
  p_name VARCHAR(255),
  p_scopes TEXT[],
  p_environment VARCHAR(20) DEFAULT 'production',
  p_description TEXT DEFAULT NULL,
  p_rate_limit_per_minute INTEGER DEFAULT 1000,
  p_expires_in_days INTEGER DEFAULT NULL
) RETURNS TABLE(api_key TEXT, key_id UUID, key_prefix VARCHAR(20)) AS $$
DECLARE
  v_raw_key TEXT;
  v_key_prefix VARCHAR(20);
  v_key_hash VARCHAR(255);
  v_key_id UUID;
  v_prefix VARCHAR(10);
BEGIN
  -- Generate prefix based on environment
  v_prefix := CASE p_environment
    WHEN 'production' THEN 'bk_live_'
    WHEN 'test' THEN 'bk_test_'
    ELSE 'bk_dev_'
  END;
  
  -- Generate random key (32 chars)
  v_raw_key := v_prefix || encode(gen_random_bytes(24), 'base64');
  v_raw_key := REPLACE(REPLACE(v_raw_key, '+', ''), '/', '');
  v_raw_key := SUBSTRING(v_raw_key, 1, 40);
  
  -- Create prefix for identification (first 12 chars)
  v_key_prefix := SUBSTRING(v_raw_key, 1, 12);
  
  -- Hash the key for storage (using SHA-256)
  v_key_hash := encode(digest(v_raw_key, 'sha256'), 'hex');
  
  -- Insert the key
  INSERT INTO api_keys (
    organization_id,
    name,
    description,
    key_hash,
    key_prefix,
    scopes,
    environment,
    rate_limit_per_minute,
    expires_at,
    created_by
  ) VALUES (
    p_organization_id,
    p_name,
    p_description,
    v_key_hash,
    v_key_prefix,
    p_scopes,
    p_environment,
    p_rate_limit_per_minute,
    CASE WHEN p_expires_in_days IS NOT NULL 
         THEN NOW() + (p_expires_in_days || ' days')::INTERVAL 
         ELSE NULL END,
    auth.uid()
  ) RETURNING id INTO v_key_id;
  
  RETURN QUERY SELECT v_raw_key, v_key_id, v_key_prefix;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate API key
CREATE OR REPLACE FUNCTION validate_api_key(
  p_api_key TEXT,
  p_required_scope TEXT DEFAULT NULL,
  p_endpoint TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL
) RETURNS TABLE(
  valid BOOLEAN,
  organization_id UUID,
  key_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_key_hash VARCHAR(255);
  v_key_record RECORD;
BEGIN
  -- Hash the provided key
  v_key_hash := encode(digest(p_api_key, 'sha256'), 'hex');
  
  -- Look up the key
  SELECT * INTO v_key_record
  FROM api_keys
  WHERE key_hash = v_key_hash;
  
  -- Key not found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::UUID, 'Invalid API key'::TEXT;
    RETURN;
  END IF;
  
  -- Key revoked
  IF v_key_record.revoked_at IS NOT NULL THEN
    RETURN QUERY SELECT false, v_key_record.organization_id, v_key_record.id, 'API key has been revoked'::TEXT;
    RETURN;
  END IF;
  
  -- Key expired
  IF v_key_record.expires_at IS NOT NULL AND v_key_record.expires_at < NOW() THEN
    RETURN QUERY SELECT false, v_key_record.organization_id, v_key_record.id, 'API key has expired'::TEXT;
    RETURN;
  END IF;
  
  -- Check IP restriction
  IF v_key_record.allowed_ips IS NOT NULL AND p_ip_address IS NOT NULL THEN
    IF NOT (p_ip_address = ANY(v_key_record.allowed_ips)) THEN
      RETURN QUERY SELECT false, v_key_record.organization_id, v_key_record.id, 'IP address not allowed'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Check scope requirement
  IF p_required_scope IS NOT NULL THEN
    IF NOT (p_required_scope = ANY(v_key_record.scopes) OR 'admin:full' = ANY(v_key_record.scopes)) THEN
      RETURN QUERY SELECT false, v_key_record.organization_id, v_key_record.id, 'Insufficient permissions'::TEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Update last used
  UPDATE api_keys
  SET 
    last_used_at = NOW(),
    last_used_ip = p_ip_address,
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE id = v_key_record.id;
  
  -- Return valid
  RETURN QUERY SELECT true, v_key_record.organization_id, v_key_record.id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke API key
CREATE OR REPLACE FUNCTION revoke_api_key(
  p_key_id UUID,
  p_reason TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE api_keys
  SET 
    revoked_at = NOW(),
    revoked_by = auth.uid(),
    revoke_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_key_id
    AND revoked_at IS NULL
    AND (organization_id = get_my_organization_id() OR is_platform_admin());
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log API key usage
CREATE OR REPLACE FUNCTION log_api_key_usage(
  p_api_key_id UUID,
  p_endpoint VARCHAR(500),
  p_method VARCHAR(10),
  p_status_code INTEGER,
  p_response_time_ms INTEGER,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_origin TEXT DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO api_key_usage_logs (
    api_key_id,
    endpoint,
    method,
    status_code,
    response_time_ms,
    ip_address,
    user_agent,
    origin,
    error_message
  ) VALUES (
    p_api_key_id,
    p_endpoint,
    p_method,
    p_status_code,
    p_response_time_ms,
    p_ip_address,
    p_user_agent,
    p_origin,
    p_error_message
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get API key statistics
CREATE OR REPLACE FUNCTION get_api_key_stats(
  p_key_id UUID,
  p_days INTEGER DEFAULT 7
) RETURNS TABLE(
  total_requests BIGINT,
  successful_requests BIGINT,
  failed_requests BIGINT,
  avg_response_time_ms NUMERIC,
  requests_by_endpoint JSONB,
  requests_by_day JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 400) as success,
      COUNT(*) FILTER (WHERE status_code >= 400) as failed,
      AVG(response_time_ms) as avg_time
    FROM api_key_usage_logs
    WHERE api_key_id = p_key_id
      AND created_at > NOW() - (p_days || ' days')::INTERVAL
  ),
  by_endpoint AS (
    SELECT jsonb_object_agg(endpoint, cnt) as data
    FROM (
      SELECT endpoint, COUNT(*) as cnt
      FROM api_key_usage_logs
      WHERE api_key_id = p_key_id
        AND created_at > NOW() - (p_days || ' days')::INTERVAL
      GROUP BY endpoint
      ORDER BY cnt DESC
      LIMIT 10
    ) t
  ),
  by_day AS (
    SELECT jsonb_object_agg(day::TEXT, cnt) as data
    FROM (
      SELECT DATE(created_at) as day, COUNT(*) as cnt
      FROM api_key_usage_logs
      WHERE api_key_id = p_key_id
        AND created_at > NOW() - (p_days || ' days')::INTERVAL
      GROUP BY DATE(created_at)
      ORDER BY day
    ) t
  )
  SELECT 
    s.total,
    s.success,
    s.failed,
    ROUND(s.avg_time, 2),
    COALESCE(e.data, '{}'::jsonb),
    COALESCE(d.data, '{}'::jsonb)
  FROM stats s, by_endpoint e, by_day d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for api_keys (for dashboard updates)
ALTER PUBLICATION supabase_realtime ADD TABLE api_keys;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS api_keys_updated_at ON api_keys;
CREATE TRIGGER api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_api_keys_updated_at();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON api_keys TO authenticated;
GRANT SELECT ON api_key_usage_logs TO authenticated;
GRANT EXECUTE ON FUNCTION generate_api_key TO authenticated;
GRANT EXECUTE ON FUNCTION validate_api_key TO authenticated, anon;
GRANT EXECUTE ON FUNCTION revoke_api_key TO authenticated;
GRANT EXECUTE ON FUNCTION log_api_key_usage TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_api_key_stats TO authenticated;

-- ============================================================================
-- Success message
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 074_add_api_keys.sql completed successfully';
  RAISE NOTICE '  - Created api_keys table with scoping support';
  RAISE NOTICE '  - Created api_key_usage_logs table';
  RAISE NOTICE '  - Created generate_api_key function';
  RAISE NOTICE '  - Created validate_api_key function';
  RAISE NOTICE '  - Created revoke_api_key function';
  RAISE NOTICE '  - Created get_api_key_stats function';
  RAISE NOTICE '  - Enabled RLS policies';
END $$;
