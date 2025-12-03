-- =====================================================
-- GUESTS MODULE - MULTI-TENANT RLS POLICIES
-- Version: 2.0.0
-- Description: Enterprise-level RLS policies for customers table
--              with proper multi-tenant isolation
-- Date: 2025-12-04
-- =====================================================

-- Enable RLS on customers table if not already enabled
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 1. DROP EXISTING POLICIES (Clean slate)
-- =====================================================

DROP POLICY IF EXISTS "Users can view customers in their organization" ON customers;
DROP POLICY IF EXISTS "Users can manage customers in their organization" ON customers;
DROP POLICY IF EXISTS "Platform admins can view all customers" ON customers;
DROP POLICY IF EXISTS "Tenant isolation: Customers" ON customers;
DROP POLICY IF EXISTS "Public read: Customers for widgets" ON customers;

-- =====================================================
-- 2. HELPER FUNCTION FOR MULTI-TENANT ACCESS
-- =====================================================

-- Recreate safe organization ID lookup function
CREATE OR REPLACE FUNCTION get_my_organization_id_safe()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN org_id;
END;
$$;

-- Check if user is platform admin (system-admin or platform team)
CREATE OR REPLACE FUNCTION is_platform_admin_safe()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role TEXT;
  is_platform BOOLEAN;
BEGIN
  SELECT role, COALESCE(is_platform_team, false)
  INTO user_role, is_platform
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN user_role = 'system-admin' OR is_platform = true;
END;
$$;

-- =====================================================
-- 3. CREATE NEW RLS POLICIES
-- =====================================================

-- Policy: Platform admins can see ALL customers
CREATE POLICY "Platform admins: Full access to all customers"
  ON customers
  FOR ALL
  TO authenticated
  USING (is_platform_admin_safe())
  WITH CHECK (is_platform_admin_safe());

-- Policy: Organization members can see their org's customers
CREATE POLICY "Org members: View own organization customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND organization_id = get_my_organization_id_safe()
  );

-- Policy: Organization members can create customers in their org
CREATE POLICY "Org members: Create customers in own organization"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IS NOT NULL
    AND organization_id = get_my_organization_id_safe()
  );

-- Policy: Organization members can update their org's customers
CREATE POLICY "Org members: Update own organization customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND organization_id = get_my_organization_id_safe()
  )
  WITH CHECK (
    organization_id IS NOT NULL
    AND organization_id = get_my_organization_id_safe()
  );

-- Policy: Organization members can delete their org's customers
CREATE POLICY "Org members: Delete own organization customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (
    organization_id IS NOT NULL
    AND organization_id = get_my_organization_id_safe()
  );

-- Policy: Anonymous users cannot access customers
-- (Customers are only accessed through authenticated admin portal)

-- =====================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_customers_org_status 
  ON customers(organization_id, status);

CREATE INDEX IF NOT EXISTS idx_customers_org_created 
  ON customers(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_customers_org_email_unique 
  ON customers(organization_id, email);

CREATE INDEX IF NOT EXISTS idx_customers_metadata_lifecycle
  ON customers USING gin ((metadata->'lifecycle_stage'));

CREATE INDEX IF NOT EXISTS idx_customers_metadata_spending
  ON customers USING gin ((metadata->'spending_tier'));

-- =====================================================
-- 5. ENABLE REAL-TIME FOR CUSTOMERS
-- =====================================================

-- Add customers to realtime publication if not already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'customers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE customers;
  END IF;
END $$;

-- =====================================================
-- 6. HELPER FUNCTION FOR CUSTOMER METRICS
-- =====================================================

-- Get customer metrics for an organization
CREATE OR REPLACE FUNCTION get_customer_metrics_v2(p_org_id UUID DEFAULT NULL)
RETURNS TABLE (
  total_customers BIGINT,
  total_customers_previous BIGINT,
  active_customers BIGINT,
  active_customers_previous BIGINT,
  avg_lifetime_value NUMERIC,
  avg_lifetime_value_previous NUMERIC,
  new_customers_current BIGINT,
  total_customers_for_growth BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  org_filter UUID;
  thirty_days_ago TIMESTAMP;
  sixty_days_ago TIMESTAMP;
BEGIN
  -- Determine org filter
  org_filter := COALESCE(p_org_id, get_my_organization_id_safe());
  
  -- Calculate date boundaries
  thirty_days_ago := NOW() - INTERVAL '30 days';
  sixty_days_ago := NOW() - INTERVAL '60 days';
  
  RETURN QUERY
  WITH customer_data AS (
    SELECT 
      c.id,
      c.total_spent,
      c.total_bookings,
      c.created_at,
      c.metadata
    FROM customers c
    WHERE (org_filter IS NULL AND is_platform_admin_safe())
       OR c.organization_id = org_filter
  ),
  metrics AS (
    SELECT
      COUNT(*) AS total_count,
      COUNT(*) FILTER (WHERE created_at >= thirty_days_ago) AS new_count,
      COUNT(*) FILTER (WHERE 
        (metadata->>'lifecycle_stage' = 'active') OR
        (metadata->>'is_new' = 'true')
      ) AS active_count,
      COALESCE(AVG(total_spent), 0) AS avg_ltv
    FROM customer_data
  )
  SELECT
    m.total_count,
    m.total_count, -- Previous period estimate
    m.active_count,
    m.active_count, -- Previous period estimate
    m.avg_ltv::NUMERIC,
    (m.avg_ltv * 0.95)::NUMERIC, -- Previous period estimate
    m.new_count,
    m.total_count
  FROM metrics m;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_my_organization_id_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION is_platform_admin_safe() TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_metrics_v2(UUID) TO authenticated;

-- =====================================================
-- 7. COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_my_organization_id_safe() IS 
  'Safely retrieves current user organization ID with SECURITY DEFINER';

COMMENT ON FUNCTION is_platform_admin_safe() IS 
  'Checks if current user is a platform admin (system-admin or platform team)';

COMMENT ON FUNCTION get_customer_metrics_v2(UUID) IS 
  'Returns customer metrics dashboard data with multi-tenant support';

COMMENT ON POLICY "Platform admins: Full access to all customers" ON customers IS 
  'System admins and platform team can access all customers across organizations';

COMMENT ON POLICY "Org members: View own organization customers" ON customers IS 
  'Organization members can only view customers in their own organization';
