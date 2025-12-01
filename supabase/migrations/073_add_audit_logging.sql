-- ============================================================================
-- Migration: 073_add_audit_logging.sql
-- Description: Add comprehensive audit logging for compliance and security
-- Date: 2025-12-02
-- Phase: 3 (Security)
-- ============================================================================

-- ============================================================================
-- AUDIT LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who performed the action
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT,
  
  -- Where it happened
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- What happened
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
  resource_type VARCHAR(100) NOT NULL, -- bookings, activities, users, etc.
  resource_id UUID,
  resource_name TEXT, -- Human-readable name for display
  
  -- Details
  old_values JSONB,
  new_values JSONB,
  changes JSONB, -- Computed diff between old and new
  
  -- Context
  ip_address INET,
  user_agent TEXT,
  request_id TEXT, -- For correlation with logs
  
  -- Metadata
  severity VARCHAR(20) DEFAULT 'info', -- info, warning, error, critical
  category VARCHAR(50) DEFAULT 'general', -- auth, booking, payment, admin, system
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add table comment
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system actions';

-- ============================================================================
-- INDEXES FOR EFFICIENT QUERYING
-- ============================================================================

-- Primary query pattern: org + date range
CREATE INDEX IF NOT EXISTS idx_audit_org_date 
  ON audit_logs(organization_id, created_at DESC);

-- User activity
CREATE INDEX IF NOT EXISTS idx_audit_user 
  ON audit_logs(user_id, created_at DESC);

-- Resource lookups
CREATE INDEX IF NOT EXISTS idx_audit_resource 
  ON audit_logs(resource_type, resource_id);

-- Category and severity filtering
CREATE INDEX IF NOT EXISTS idx_audit_category_severity 
  ON audit_logs(category, severity, created_at DESC);

-- Action filtering
CREATE INDEX IF NOT EXISTS idx_audit_action 
  ON audit_logs(action, created_at DESC);

-- ============================================================================
-- HELPER FUNCTION: CREATE AUDIT LOG ENTRY
-- ============================================================================

CREATE OR REPLACE FUNCTION create_audit_log(
  p_action VARCHAR(50),
  p_resource_type VARCHAR(100),
  p_resource_id UUID DEFAULT NULL,
  p_resource_name TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_category VARCHAR(50) DEFAULT 'general',
  p_severity VARCHAR(20) DEFAULT 'info',
  p_organization_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_user_role TEXT;
  v_org_id UUID;
  v_audit_id UUID;
  v_changes JSONB;
BEGIN
  -- Get current user info
  v_user_id := auth.uid();
  
  IF v_user_id IS NOT NULL THEN
    SELECT email, role INTO v_user_email, v_user_role
    FROM public.users
    WHERE id = v_user_id;
  END IF;
  
  -- Determine organization
  v_org_id := COALESCE(p_organization_id, get_my_organization_id());
  
  -- Compute changes if both old and new values exist
  IF p_old_values IS NOT NULL AND p_new_values IS NOT NULL THEN
    SELECT jsonb_object_agg(key, jsonb_build_object('from', p_old_values->key, 'to', value))
    INTO v_changes
    FROM jsonb_each(p_new_values)
    WHERE p_old_values->key IS DISTINCT FROM value;
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_logs (
    user_id, user_email, user_role,
    organization_id,
    action, resource_type, resource_id, resource_name,
    old_values, new_values, changes,
    severity, category
  ) VALUES (
    v_user_id, v_user_email, v_user_role,
    v_org_id,
    p_action, p_resource_type, p_resource_id, p_resource_name,
    p_old_values, p_new_values, v_changes,
    p_severity, p_category
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTOMATIC AUDIT TRIGGERS
-- ============================================================================

-- Generic trigger function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values JSONB;
  v_new_values JSONB;
  v_resource_name TEXT;
BEGIN
  -- Set old/new values based on operation
  IF TG_OP = 'DELETE' THEN
    v_old_values := to_jsonb(OLD);
    v_new_values := NULL;
    v_resource_name := COALESCE(OLD.name, OLD.booking_number, OLD.email, OLD.id::text);
  ELSIF TG_OP = 'INSERT' THEN
    v_old_values := NULL;
    v_new_values := to_jsonb(NEW);
    v_resource_name := COALESCE(NEW.name, NEW.booking_number, NEW.email, NEW.id::text);
  ELSE -- UPDATE
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
    v_resource_name := COALESCE(NEW.name, NEW.booking_number, NEW.email, NEW.id::text);
  END IF;
  
  -- Insert audit log (skip sensitive fields)
  INSERT INTO audit_logs (
    user_id, user_email,
    organization_id,
    action, resource_type, resource_id, resource_name,
    old_values, new_values,
    category
  ) VALUES (
    auth.uid(),
    (SELECT email FROM public.users WHERE id = auth.uid()),
    COALESCE(NEW.organization_id, OLD.organization_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    v_resource_name,
    v_old_values - 'password' - 'password_hash' - 'api_key' - 'secret',
    v_new_values - 'password' - 'password_hash' - 'api_key' - 'secret',
    'general'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ENABLE AUDIT TRIGGERS ON KEY TABLES
-- ============================================================================

-- Bookings (critical for business)
DROP TRIGGER IF EXISTS audit_bookings ON bookings;
CREATE TRIGGER audit_bookings
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Activities
DROP TRIGGER IF EXISTS audit_activities ON activities;
CREATE TRIGGER audit_activities
  AFTER INSERT OR UPDATE OR DELETE ON activities
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Venues
DROP TRIGGER IF EXISTS audit_venues ON venues;
CREATE TRIGGER audit_venues
  AFTER INSERT OR UPDATE OR DELETE ON venues
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Organizations (admin actions)
DROP TRIGGER IF EXISTS audit_organizations ON organizations;
CREATE TRIGGER audit_organizations
  AFTER INSERT OR UPDATE OR DELETE ON organizations
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Users (security critical)
DROP TRIGGER IF EXISTS audit_users ON users;
CREATE TRIGGER audit_users
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- RLS POLICIES FOR AUDIT LOGS
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Platform admins can see all
CREATE POLICY "Platform admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (is_platform_admin());

-- Org admins can see their org's logs
CREATE POLICY "Org admins can view their org audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (organization_id = get_my_organization_id());

-- No one can modify audit logs (immutable)
CREATE POLICY "Audit logs are immutable"
  ON audit_logs FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Audit logs cannot be deleted by users"
  ON audit_logs FOR DELETE
  TO authenticated
  USING (false);

-- System can insert
CREATE POLICY "System can create audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- RETENTION POLICY FUNCTION
-- ============================================================================

-- Function to clean up old audit logs (called by cron)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(
  p_retention_days INTEGER DEFAULT 90
) RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE created_at < NOW() - (p_retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Log the cleanup action
  INSERT INTO audit_logs (action, resource_type, new_values, category, severity)
  VALUES (
    'CLEANUP',
    'audit_logs',
    jsonb_build_object('deleted_count', v_deleted_count, 'retention_days', p_retention_days),
    'system',
    'info'
  );
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (runs daily at 3 AM)
SELECT cron.schedule(
  'cleanup-audit-logs',
  '0 3 * * *',
  'SELECT cleanup_old_audit_logs(90)'
);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT ON audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION create_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs TO service_role;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Created:
--   - audit_logs table with comprehensive fields
--   - create_audit_log() helper function
--   - audit_trigger_func() for automatic logging
--   - Triggers on bookings, activities, venues, organizations, users
--   - RLS policies for proper access control
--   - cleanup_old_audit_logs() for retention policy
--   - Daily cron job for cleanup
-- ============================================================================
