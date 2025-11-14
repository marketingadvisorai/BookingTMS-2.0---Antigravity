-- Migration: Comprehensive Row-Level Security Policies
-- Version: 0.1.6
-- Description: Implements complete RLS policies for all tables with organization isolation
-- Date: 2025-01-11

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Get current user's organization ID
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION auth.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'super-admin'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user has specific role
CREATE OR REPLACE FUNCTION auth.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND (role = required_role OR role = 'super-admin')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user belongs to organization
CREATE OR REPLACE FUNCTION auth.belongs_to_organization(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND organization_id = org_id
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- =====================================================
-- ORGANIZATIONS POLICIES
-- =====================================================

-- Super admins can see all organizations
CREATE POLICY "Super admins can view all organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (auth.is_super_admin());

-- Users can view their own organization
CREATE POLICY "Users can view their organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Super admins can create organizations
CREATE POLICY "Super admins can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.is_super_admin());

-- Super admins and org admins can update their organization
CREATE POLICY "Admins can update their organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    auth.is_super_admin() OR
    (id IN (SELECT organization_id FROM users WHERE id = auth.uid() AND role IN ('admin', 'super-admin')))
  );

-- =====================================================
-- USERS POLICIES
-- =====================================================

-- Users can view users in their organization
CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  TO authenticated
  USING (
    auth.is_super_admin() OR
    organization_id = auth.user_organization_id()
  );

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admins can create users in their organization
CREATE POLICY "Admins can create users in their organization"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.is_super_admin() OR
    (auth.has_role('admin') AND organization_id = auth.user_organization_id())
  );

-- Admins can update users in their organization
CREATE POLICY "Admins can update users in their organization"
  ON users FOR UPDATE
  TO authenticated
  USING (
    auth.is_super_admin() OR
    (auth.has_role('admin') AND organization_id = auth.user_organization_id()) OR
    id = auth.uid()  -- Users can update their own profile
  );

-- Super admins can delete users
CREATE POLICY "Super admins can delete users"
  ON users FOR DELETE
  TO authenticated
  USING (auth.is_super_admin());

-- =====================================================
-- GAMES POLICIES
-- =====================================================

-- Users can view games in their organization
CREATE POLICY "Users can view games in their organization"
  ON games FOR SELECT
  TO authenticated
  USING (
    auth.is_super_admin() OR
    organization_id = auth.user_organization_id()
  );

-- Staff and above can create games
CREATE POLICY "Staff can create games in their organization"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.is_super_admin() OR
    organization_id = auth.user_organization_id()
  );

-- Staff and above can update games
CREATE POLICY "Staff can update games in their organization"
  ON games FOR UPDATE
  TO authenticated
  USING (
    auth.is_super_admin() OR
    organization_id = auth.user_organization_id()
  );

-- Admins can delete games
CREATE POLICY "Admins can delete games in their organization"
  ON games FOR DELETE
  TO authenticated
  USING (
    auth.is_super_admin() OR
    (auth.has_role('admin') AND organization_id = auth.user_organization_id())
  );

-- =====================================================
-- CUSTOMERS POLICIES
-- =====================================================

-- Users can view customers in their organization
CREATE POLICY "Users can view customers in their organization"
  ON customers FOR SELECT
  TO authenticated
  USING (
    auth.is_super_admin() OR
    organization_id = auth.user_organization_id()
  );

-- Staff can create customers
CREATE POLICY "Staff can create customers in their organization"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.is_super_admin() OR
    organization_id = auth.user_organization_id()
  );

-- Staff can update customers
CREATE POLICY "Staff can update customers in their organization"
  ON customers FOR UPDATE
  TO authenticated
  USING (
    auth.is_super_admin() OR
    organization_id = auth.user_organization_id()
  );

-- Admins can delete customers
CREATE POLICY "Admins can delete customers"
  ON customers FOR DELETE
  TO authenticated
  USING (
    auth.is_super_admin() OR
    (auth.has_role('admin') AND organization_id = auth.user_organization_id())
  );

-- =====================================================
-- BOOKINGS POLICIES
-- =====================================================

-- Users can view bookings in their organization
CREATE POLICY "Users can view bookings in their organization"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    auth.is_super_admin() OR
    organization_id = auth.user_organization_id()
  );

-- Staff can create bookings
CREATE POLICY "Staff can create bookings in their organization"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.is_super_admin() OR
    organization_id = auth.user_organization_id()
  );

-- Staff can update bookings
CREATE POLICY "Staff can update bookings in their organization"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    auth.is_super_admin() OR
    organization_id = auth.user_organization_id()
  );

-- Admins can delete bookings
CREATE POLICY "Admins can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (
    auth.is_super_admin() OR
    (auth.has_role('admin') AND organization_id = auth.user_organization_id())
  );

-- =====================================================
-- PAYMENTS POLICIES
-- =====================================================

-- Users can view payments for bookings in their organization
CREATE POLICY "Users can view payments in their organization"
  ON payments FOR SELECT
  TO authenticated
  USING (
    auth.is_super_admin() OR
    booking_id IN (
      SELECT id FROM bookings WHERE organization_id = auth.user_organization_id()
    )
  );

-- System can create payments (via service role)
CREATE POLICY "System can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.is_super_admin() OR
    booking_id IN (
      SELECT id FROM bookings WHERE organization_id = auth.user_organization_id()
    )
  );

-- Admins can update payments
CREATE POLICY "Admins can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (
    auth.is_super_admin() OR
    (auth.has_role('admin') AND booking_id IN (
      SELECT id FROM bookings WHERE organization_id = auth.user_organization_id()
    ))
  );

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    auth.is_super_admin()
  );

-- System can create notifications for users
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.is_super_admin() OR
    organization_id = auth.user_organization_id()
  );

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- NOTIFICATION SETTINGS POLICIES
-- =====================================================

-- Users can view their own notification settings
CREATE POLICY "Users can view their own notification settings"
  ON notification_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own notification settings
CREATE POLICY "Users can insert their own notification settings"
  ON notification_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own notification settings
CREATE POLICY "Users can update their own notification settings"
  ON notification_settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- AUDIT LOGGING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- RLS for audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super admins and admins can view audit logs
CREATE POLICY "Admins can view audit logs in their organization"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    auth.is_super_admin() OR
    (auth.has_role('admin') AND organization_id = auth.user_organization_id())
  );

-- =====================================================
-- AUDIT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID;
BEGIN
  -- Get user ID
  v_user_id := auth.uid();
  
  -- Get organization ID from the record
  IF TG_OP = 'DELETE' THEN
    v_org_id := OLD.organization_id;
  ELSE
    v_org_id := NEW.organization_id;
  END IF;
  
  -- Insert audit log
  INSERT INTO audit_logs (
    organization_id,
    user_id,
    action,
    table_name,
    record_id,
    old_data,
    new_data
  ) VALUES (
    v_org_id,
    v_user_id,
    TG_OP,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    CASE 
      WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)
      ELSE NULL
    END,
    CASE 
      WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)
      ELSE NULL
    END
  );
  
  RETURN CASE 
    WHEN TG_OP = 'DELETE' THEN OLD
    ELSE NEW
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- APPLY AUDIT TRIGGERS TO CRITICAL TABLES
-- =====================================================

-- Bookings audit
DROP TRIGGER IF EXISTS audit_bookings_trigger ON bookings;
CREATE TRIGGER audit_bookings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Payments audit
DROP TRIGGER IF EXISTS audit_payments_trigger ON payments;
CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Users audit
DROP TRIGGER IF EXISTS audit_users_trigger ON users;
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Customers audit
DROP TRIGGER IF EXISTS audit_customers_trigger ON customers;
CREATE TRIGGER audit_customers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON customers
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- =====================================================
-- SECURITY FUNCTIONS
-- =====================================================

-- Function to get audit logs
CREATE OR REPLACE FUNCTION get_audit_logs(
  p_table_name TEXT DEFAULT NULL,
  p_from_date TIMESTAMP DEFAULT NULL,
  p_to_date TIMESTAMP DEFAULT NULL,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  action TEXT,
  table_name TEXT,
  record_id UUID,
  user_email TEXT,
  user_name TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Check if user is admin
  IF NOT (auth.is_super_admin() OR auth.has_role('admin')) THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN QUERY
  SELECT
    al.id,
    al.action,
    al.table_name,
    al.record_id,
    u.email as user_email,
    u.full_name as user_name,
    al.old_data,
    al.new_data,
    al.created_at
  FROM audit_logs al
  LEFT JOIN users u ON al.user_id = u.id
  WHERE 
    (p_table_name IS NULL OR al.table_name = p_table_name)
    AND (p_from_date IS NULL OR al.created_at >= p_from_date)
    AND (p_to_date IS NULL OR al.created_at <= p_to_date)
    AND (
      auth.is_super_admin() OR
      al.organization_id = auth.user_organization_id()
    )
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION auth.user_organization_id() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION auth.has_role(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION auth.belongs_to_organization(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_audit_logs(TEXT, TIMESTAMP, TIMESTAMP, INTEGER) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE audit_logs IS 'Audit trail for all critical operations';
COMMENT ON FUNCTION auth.user_organization_id() IS 'Returns the organization ID of the current user';
COMMENT ON FUNCTION auth.is_super_admin() IS 'Checks if current user is a super admin';
COMMENT ON FUNCTION auth.has_role(TEXT) IS 'Checks if current user has a specific role';
COMMENT ON FUNCTION auth.belongs_to_organization(UUID) IS 'Checks if current user belongs to an organization';
COMMENT ON FUNCTION get_audit_logs(TEXT, TIMESTAMP, TIMESTAMP, INTEGER) IS 'Retrieves audit logs with filters (admin only)';
COMMENT ON FUNCTION audit_trigger_function() IS 'Trigger function to log all changes to critical tables';
