-- =====================================================
-- GAME-BASED AUDIENCE SEGMENTATION
-- =====================================================
-- This migration adds functions to segment customers by games they've played
-- Each game becomes a dynamic audience segment

-- Function to get all game-based segments with customer counts
CREATE OR REPLACE FUNCTION get_game_segments(org_id UUID)
RETURNS TABLE (
  game_id UUID,
  game_name TEXT,
  game_image_url TEXT,
  customer_count BIGINT,
  total_bookings BIGINT,
  total_revenue NUMERIC,
  avg_booking_value NUMERIC,
  last_booking_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id AS game_id,
    g.name AS game_name,
    g.image_url AS game_image_url,
    COUNT(DISTINCT b.customer_id) AS customer_count,
    COUNT(b.id) AS total_bookings,
    COALESCE(SUM(b.total_amount), 0) AS total_revenue,
    COALESCE(AVG(b.total_amount), 0) AS avg_booking_value,
    MAX(b.created_at) AS last_booking_date
  FROM games g
  LEFT JOIN bookings b ON b.game_id = g.id AND b.status != 'cancelled'
  WHERE g.organization_id = org_id
    AND g.is_active = true
  GROUP BY g.id, g.name, g.image_url
  ORDER BY customer_count DESC, total_bookings DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get customers for a specific game (audience list)
CREATE OR REPLACE FUNCTION get_game_audience(p_game_id UUID)
RETURNS TABLE (
  customer_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  total_bookings BIGINT,
  total_spent NUMERIC,
  last_booking_date TIMESTAMP WITH TIME ZONE,
  first_booking_date TIMESTAMP WITH TIME ZONE,
  avg_booking_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    COUNT(b.id) AS total_bookings,
    COALESCE(SUM(b.total_amount), 0) AS total_spent,
    MAX(b.created_at) AS last_booking_date,
    MIN(b.created_at) AS first_booking_date,
    COALESCE(AVG(b.total_amount), 0) AS avg_booking_value
  FROM customers c
  INNER JOIN bookings b ON b.customer_id = c.id
  WHERE b.game_id = p_game_id
    AND b.status != 'cancelled'
  GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone
  ORDER BY total_bookings DESC, total_spent DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get venue-based segments with customer counts
CREATE OR REPLACE FUNCTION get_venue_segments(org_id UUID)
RETURNS TABLE (
  venue_id UUID,
  venue_name TEXT,
  customer_count BIGINT,
  total_bookings BIGINT,
  total_revenue NUMERIC,
  avg_booking_value NUMERIC,
  last_booking_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id AS venue_id,
    v.name AS venue_name,
    COUNT(DISTINCT b.customer_id) AS customer_count,
    COUNT(b.id) AS total_bookings,
    COALESCE(SUM(b.total_amount), 0) AS total_revenue,
    COALESCE(AVG(b.total_amount), 0) AS avg_booking_value,
    MAX(b.created_at) AS last_booking_date
  FROM venues v
  LEFT JOIN bookings b ON b.venue_id = v.id AND b.status != 'cancelled'
  WHERE v.organization_id = org_id
    AND v.is_active = true
  GROUP BY v.id, v.name
  ORDER BY customer_count DESC, total_bookings DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get customers for a specific venue (audience list)
CREATE OR REPLACE FUNCTION get_venue_audience(p_venue_id UUID)
RETURNS TABLE (
  customer_id UUID,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  total_bookings BIGINT,
  total_spent NUMERIC,
  last_booking_date TIMESTAMP WITH TIME ZONE,
  first_booking_date TIMESTAMP WITH TIME ZONE,
  avg_booking_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id AS customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.email AS customer_email,
    c.phone AS customer_phone,
    COUNT(b.id) AS total_bookings,
    COALESCE(SUM(b.total_amount), 0) AS total_spent,
    MAX(b.created_at) AS last_booking_date,
    MIN(b.created_at) AS first_booking_date,
    COALESCE(AVG(b.total_amount), 0) AS avg_booking_value
  FROM customers c
  INNER JOIN bookings b ON b.customer_id = c.id
  WHERE b.venue_id = p_venue_id
    AND b.status != 'cancelled'
  GROUP BY c.id, c.first_name, c.last_name, c.email, c.phone
  ORDER BY total_bookings DESC, total_spent DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_game_segments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_game_audience(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_venue_segments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_venue_audience(UUID) TO authenticated;

-- Add comments
COMMENT ON FUNCTION get_game_segments(UUID) IS 'Get all games as audience segments with customer counts and revenue metrics';
COMMENT ON FUNCTION get_game_audience(UUID) IS 'Get list of customers who have played a specific game';
COMMENT ON FUNCTION get_venue_segments(UUID) IS 'Get all venues as audience segments with customer counts and revenue metrics';
COMMENT ON FUNCTION get_venue_audience(UUID) IS 'Get list of customers who have visited a specific venue';
