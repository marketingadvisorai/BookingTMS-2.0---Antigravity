-- =====================================================
-- CUSTOMER METRICS FUNCTION
-- =====================================================
-- Returns key customer metrics for dashboard cards
-- Compares current period (last 30 days) with previous period (31-60 days ago)

CREATE OR REPLACE FUNCTION get_customer_metrics(org_id UUID)
RETURNS TABLE (
  total_customers BIGINT,
  total_customers_previous BIGINT,
  active_customers BIGINT,
  active_customers_previous BIGINT,
  avg_lifetime_value NUMERIC,
  avg_lifetime_value_previous NUMERIC,
  new_customers_current BIGINT,
  total_customers_for_growth BIGINT
) AS $$
DECLARE
  current_date_start TIMESTAMP WITH TIME ZONE := NOW() - INTERVAL '30 days';
  previous_date_start TIMESTAMP WITH TIME ZONE := NOW() - INTERVAL '60 days';
  previous_date_end TIMESTAMP WITH TIME ZONE := NOW() - INTERVAL '30 days';
BEGIN
  RETURN QUERY
  SELECT 
    -- Total Customers (all time)
    (SELECT COUNT(*) FROM customers WHERE organization_id = org_id)::BIGINT AS total_customers,
    
    -- Total Customers 30 days ago
    (SELECT COUNT(*) FROM customers 
     WHERE organization_id = org_id 
     AND created_at < current_date_start)::BIGINT AS total_customers_previous,
    
    -- Active Customers (with bookings in last 30 days)
    (SELECT COUNT(DISTINCT customer_id) FROM bookings b
     INNER JOIN customers c ON c.id = b.customer_id
     WHERE c.organization_id = org_id
     AND b.created_at >= current_date_start
     AND b.status != 'cancelled')::BIGINT AS active_customers,
    
    -- Active Customers (with bookings 31-60 days ago)
    (SELECT COUNT(DISTINCT customer_id) FROM bookings b
     INNER JOIN customers c ON c.id = b.customer_id
     WHERE c.organization_id = org_id
     AND b.created_at >= previous_date_start
     AND b.created_at < previous_date_end
     AND b.status != 'cancelled')::BIGINT AS active_customers_previous,
    
    -- Average Lifetime Value (current)
    (SELECT COALESCE(AVG(total_spent), 0) FROM customers 
     WHERE organization_id = org_id)::NUMERIC AS avg_lifetime_value,
    
    -- Average Lifetime Value (30 days ago) - calculate from bookings up to that point
    (SELECT COALESCE(AVG(total_amount), 0) FROM (
       SELECT customer_id, SUM(total_amount) as total_amount
       FROM bookings b
       INNER JOIN customers c ON c.id = b.customer_id
       WHERE c.organization_id = org_id
       AND b.created_at < current_date_start
       AND b.status != 'cancelled'
       GROUP BY customer_id
     ) AS customer_totals)::NUMERIC AS avg_lifetime_value_previous,
    
    -- New Customers (created in last 30 days)
    (SELECT COUNT(*) FROM customers 
     WHERE organization_id = org_id 
     AND created_at >= current_date_start)::BIGINT AS new_customers_current,
    
    -- Total Customers 30 days ago (for growth rate calculation)
    (SELECT COUNT(*) FROM customers 
     WHERE organization_id = org_id 
     AND created_at < current_date_start)::BIGINT AS total_customers_for_growth;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_customer_metrics(UUID) TO authenticated;

-- Add comment
COMMENT ON FUNCTION get_customer_metrics(UUID) IS 'Returns customer metrics for dashboard: total customers, active customers, avg lifetime value, and growth rate with comparison to previous period';
