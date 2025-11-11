-- Migration: Dashboard Enhancement Functions
-- Version: 0.1.8
-- Description: Additional functions for enhanced dashboard analytics
-- Date: 2025-01-11

-- =====================================================
-- PAYMENT STATUS BREAKDOWN
-- =====================================================

CREATE OR REPLACE FUNCTION get_payment_status_breakdown(
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  status TEXT,
  count BIGINT,
  total_amount NUMERIC,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH status_totals AS (
    SELECT
      b.payment_status::TEXT as status,
      COUNT(*)::BIGINT as booking_count,
      COALESCE(SUM(b.final_amount), 0) as amount
    FROM bookings b
    WHERE (p_from_date IS NULL OR b.booking_date >= p_from_date)
      AND (p_to_date IS NULL OR b.booking_date <= p_to_date)
    GROUP BY b.payment_status
  ),
  grand_total AS (
    SELECT SUM(amount) as total FROM status_totals
  )
  SELECT
    st.status,
    st.booking_count,
    st.amount,
    CASE 
      WHEN gt.total > 0 THEN ROUND((st.amount / gt.total) * 100, 2)
      ELSE 0
    END as percentage
  FROM status_totals st
  CROSS JOIN grand_total gt
  ORDER BY st.amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TOP PERFORMING GAMES
-- =====================================================

CREATE OR REPLACE FUNCTION get_top_games(
  p_limit INTEGER DEFAULT 5,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  game_id UUID,
  game_name TEXT,
  booking_count BIGINT,
  total_revenue NUMERIC,
  avg_rating NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    g.id as game_id,
    g.name as game_name,
    COUNT(b.id)::BIGINT as booking_count,
    COALESCE(SUM(b.final_amount), 0) as total_revenue,
    4.5::NUMERIC as avg_rating  -- Placeholder for future rating system
  FROM games g
  LEFT JOIN bookings b ON g.id = b.game_id
    AND (p_from_date IS NULL OR b.booking_date >= p_from_date)
    AND (p_to_date IS NULL OR b.booking_date <= p_to_date)
    AND b.status IN ('confirmed', 'completed')
  WHERE g.is_active = true
  GROUP BY g.id, g.name
  ORDER BY total_revenue DESC, booking_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TOP PERFORMING VENUES
-- =====================================================

CREATE OR REPLACE FUNCTION get_top_venues(
  p_limit INTEGER DEFAULT 5,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  venue_id UUID,
  venue_name TEXT,
  booking_count BIGINT,
  total_revenue NUMERIC,
  occupancy_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id as venue_id,
    v.name as venue_name,
    COUNT(b.id)::BIGINT as booking_count,
    COALESCE(SUM(b.final_amount), 0) as total_revenue,
    75.5::NUMERIC as occupancy_rate  -- Placeholder for future calculation
  FROM venues v
  LEFT JOIN bookings b ON v.id = b.venue_id
    AND (p_from_date IS NULL OR b.booking_date >= p_from_date)
    AND (p_to_date IS NULL OR b.booking_date <= p_to_date)
    AND b.status IN ('confirmed', 'completed')
  WHERE v.is_active = true
  GROUP BY v.id, v.name
  ORDER BY total_revenue DESC, booking_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CUSTOMER SEGMENT DISTRIBUTION
-- =====================================================

CREATE OR REPLACE FUNCTION get_customer_segment_distribution()
RETURNS TABLE (
  segment TEXT,
  customer_count BIGINT,
  percentage NUMERIC,
  avg_ltv NUMERIC,
  total_bookings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH segment_stats AS (
    SELECT
      c.segment::TEXT,
      COUNT(*)::BIGINT as count,
      AVG(c.total_spent) as avg_lifetime_value,
      SUM(c.total_bookings)::BIGINT as bookings
    FROM customers c
    GROUP BY c.segment
  ),
  total_customers AS (
    SELECT SUM(count) as total FROM segment_stats
  )
  SELECT
    ss.segment,
    ss.count,
    CASE 
      WHEN tc.total > 0 THEN ROUND((ss.count::NUMERIC / tc.total::NUMERIC) * 100, 2)
      ELSE 0
    END as percentage,
    COALESCE(ss.avg_lifetime_value, 0) as avg_ltv,
    ss.bookings
  FROM segment_stats ss
  CROSS JOIN total_customers tc
  ORDER BY ss.count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DASHBOARD ALERTS
-- =====================================================

CREATE OR REPLACE FUNCTION get_dashboard_alerts()
RETURNS TABLE (
  alert_type TEXT,
  alert_message TEXT,
  alert_count INTEGER,
  priority TEXT,
  action_url TEXT
) AS $$
DECLARE
  v_pending_confirmations INTEGER;
  v_pending_payments INTEGER;
  v_upcoming_reminders INTEGER;
  v_low_inventory INTEGER;
BEGIN
  -- Count pending confirmations
  SELECT COUNT(*)::INTEGER INTO v_pending_confirmations
  FROM bookings
  WHERE status = 'pending'
    AND booking_date >= CURRENT_DATE;
  
  -- Count pending payments
  SELECT COUNT(*)::INTEGER INTO v_pending_payments
  FROM bookings
  WHERE payment_status = 'pending'
    AND booking_date >= CURRENT_DATE;
  
  -- Count upcoming reminders (bookings tomorrow)
  SELECT COUNT(*)::INTEGER INTO v_upcoming_reminders
  FROM bookings
  WHERE status = 'confirmed'
    AND booking_date = CURRENT_DATE + INTERVAL '1 day';
  
  -- Placeholder for low inventory
  v_low_inventory := 0;
  
  -- Return alerts
  RETURN QUERY
  SELECT
    'pending_confirmations'::TEXT,
    v_pending_confirmations || ' bookings need confirmation'::TEXT,
    v_pending_confirmations,
    CASE WHEN v_pending_confirmations > 5 THEN 'high' ELSE 'medium' END::TEXT,
    '/bookings?status=pending'::TEXT
  WHERE v_pending_confirmations > 0
  
  UNION ALL
  
  SELECT
    'pending_payments'::TEXT,
    v_pending_payments || ' payments pending review'::TEXT,
    v_pending_payments,
    CASE WHEN v_pending_payments > 10 THEN 'high' ELSE 'medium' END::TEXT,
    '/bookings?payment_status=pending'::TEXT
  WHERE v_pending_payments > 0
  
  UNION ALL
  
  SELECT
    'upcoming_reminders'::TEXT,
    v_upcoming_reminders || ' reminders to send tomorrow'::TEXT,
    v_upcoming_reminders,
    'low'::TEXT,
    '/bookings?date=tomorrow'::TEXT
  WHERE v_upcoming_reminders > 0
  
  ORDER BY 
    CASE priority
      WHEN 'high' THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low' THEN 3
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ENHANCED DASHBOARD STATS (with more metrics)
-- =====================================================

CREATE OR REPLACE FUNCTION get_enhanced_dashboard_stats(
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_bookings BIGINT,
  confirmed_bookings BIGINT,
  cancelled_bookings BIGINT,
  completed_bookings BIGINT,
  total_revenue NUMERIC,
  average_order_value NUMERIC,
  avg_group_size NUMERIC,
  total_customers BIGINT,
  active_customers BIGINT,
  new_customers BIGINT,
  cancellation_rate NUMERIC,
  confirmation_rate NUMERIC,
  occupancy_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH booking_stats AS (
    SELECT
      COUNT(*)::BIGINT as total,
      COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::BIGINT as confirmed,
      COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::BIGINT as cancelled,
      COUNT(CASE WHEN status = 'completed' THEN 1 END)::BIGINT as completed,
      COALESCE(SUM(final_amount), 0) as revenue,
      COALESCE(AVG(final_amount), 0) as avg_value,
      COALESCE(AVG(players), 0) as avg_size
    FROM bookings
    WHERE (p_from_date IS NULL OR booking_date >= p_from_date)
      AND (p_to_date IS NULL OR booking_date <= p_to_date)
  ),
  customer_stats AS (
    SELECT
      COUNT(*)::BIGINT as total,
      COUNT(CASE WHEN total_bookings > 0 THEN 1 END)::BIGINT as active,
      COUNT(CASE WHEN segment = 'new' THEN 1 END)::BIGINT as new_count
    FROM customers
  )
  SELECT
    bs.total,
    bs.confirmed,
    bs.cancelled,
    bs.completed,
    bs.revenue,
    bs.avg_value,
    bs.avg_size,
    cs.total,
    cs.active,
    cs.new_count,
    CASE WHEN bs.total > 0 THEN ROUND((bs.cancelled::NUMERIC / bs.total::NUMERIC) * 100, 2) ELSE 0 END,
    CASE WHEN bs.total > 0 THEN ROUND((bs.confirmed::NUMERIC / bs.total::NUMERIC) * 100, 2) ELSE 0 END,
    65.5::NUMERIC  -- Placeholder for occupancy calculation
  FROM booking_stats bs
  CROSS JOIN customer_stats cs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- REVENUE TREND (for sparklines)
-- =====================================================

CREATE OR REPLACE FUNCTION get_revenue_trend(
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  date DATE,
  revenue NUMERIC,
  booking_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.booking_date::DATE as date,
    COALESCE(SUM(b.final_amount), 0) as revenue,
    COUNT(*)::BIGINT as booking_count
  FROM bookings b
  WHERE b.booking_date >= CURRENT_DATE - p_days
    AND b.status IN ('confirmed', 'completed')
  GROUP BY b.booking_date
  ORDER BY b.booking_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_payment_status_breakdown(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_games(INTEGER, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_venues(INTEGER, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_segment_distribution() TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_alerts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_enhanced_dashboard_stats(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_revenue_trend(INTEGER) TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION get_payment_status_breakdown(DATE, DATE) IS 'Returns payment status distribution with percentages';
COMMENT ON FUNCTION get_top_games(INTEGER, DATE, DATE) IS 'Returns top performing games by revenue';
COMMENT ON FUNCTION get_top_venues(INTEGER, DATE, DATE) IS 'Returns top performing venues by revenue';
COMMENT ON FUNCTION get_customer_segment_distribution() IS 'Returns customer distribution by segment';
COMMENT ON FUNCTION get_dashboard_alerts() IS 'Returns actionable alerts for dashboard';
COMMENT ON FUNCTION get_enhanced_dashboard_stats(DATE, DATE) IS 'Returns comprehensive dashboard statistics';
COMMENT ON FUNCTION get_revenue_trend(INTEGER) IS 'Returns daily revenue trend for sparklines';
