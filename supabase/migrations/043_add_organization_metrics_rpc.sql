-- Migration: Add get_organization_metrics RPC
-- Date: 2025-11-27
-- Description: Adds RPC function to fetch organization metrics

CREATE OR REPLACE FUNCTION get_organization_metrics(org_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  current_month_start timestamp;
  last_month_start timestamp;
  total_bookings integer;
  active_bookings integer;
  total_revenue numeric;
  revenue_trend jsonb;
BEGIN
  current_month_start := date_trunc('month', now());
  last_month_start := date_trunc('month', now() - interval '1 month');

  -- Get total bookings count
  SELECT count(*) INTO total_bookings
  FROM bookings
  WHERE organization_id = org_id;

  -- Get active bookings count (upcoming)
  SELECT count(*) INTO active_bookings
  FROM bookings
  WHERE organization_id = org_id
  AND status IN ('confirmed', 'pending')
  AND booking_date >= current_date;

  -- Get total revenue (sum of completed booking payments)
  SELECT COALESCE(sum(total_amount), 0) INTO total_revenue
  FROM bookings
  WHERE organization_id = org_id
  AND status = 'confirmed';

  -- Get revenue trend (last 6 months)
  WITH monthly_revenue AS (
    SELECT 
      to_char(booking_date, 'YYYY-MM') as month,
      COALESCE(sum(total_amount), 0) as revenue
    FROM bookings
    WHERE organization_id = org_id
    AND booking_date >= date_trunc('month', now() - interval '6 months')
    AND status = 'confirmed'
    GROUP BY 1
    ORDER BY 1
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', month,
      'value', revenue
    )
  ) INTO revenue_trend
  FROM monthly_revenue;

  -- Build result
  result := jsonb_build_object(
    'total_bookings', total_bookings,
    'active_bookings', active_bookings,
    'total_revenue', total_revenue,
    'revenue_trend', COALESCE(revenue_trend, '[]'::jsonb),
    'total_customers', (
      SELECT count(DISTINCT customer_email) 
      FROM bookings 
      WHERE organization_id = org_id
    ),
    'total_venues', (
      SELECT count(*) 
      FROM venues 
      WHERE organization_id = org_id AND status = 'active'
    ),
    'total_activities', (
      SELECT count(*) 
      FROM activities 
      WHERE organization_id = org_id AND status = 'active'
    )
  );

  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_organization_metrics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_organization_metrics(UUID) TO service_role;
