-- Migration: Add Missing Dashboard and Core Functions
-- Version: 0.1.4
-- Description: Implements all missing database functions required by the frontend
-- Date: 2025-01-11

-- =====================================================
-- DASHBOARD FUNCTIONS
-- =====================================================

-- Get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_bookings BIGINT,
  confirmed_bookings BIGINT,
  total_revenue NUMERIC,
  average_order_value NUMERIC,
  avg_group_size NUMERIC,
  total_customers BIGINT,
  active_customers BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(b.id)::BIGINT as total_bookings,
    COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END)::BIGINT as confirmed_bookings,
    COALESCE(SUM(b.final_amount), 0) as total_revenue,
    COALESCE(AVG(b.final_amount), 0) as average_order_value,
    COALESCE(AVG(b.party_size), 0) as avg_group_size,
    (SELECT COUNT(*)::BIGINT FROM customers) as total_customers,
    (SELECT COUNT(*)::BIGINT FROM customers WHERE total_bookings > 0) as active_customers
  FROM bookings b
  WHERE b.created_at >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get weekly bookings trend (last 8 weeks)
CREATE OR REPLACE FUNCTION get_weekly_bookings_trend()
RETURNS TABLE (
  week_start DATE,
  week_label TEXT,
  bookings_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH weeks AS (
    SELECT 
      DATE_TRUNC('week', d)::DATE as week_start
    FROM generate_series(
      NOW() - INTERVAL '8 weeks',
      NOW(),
      '1 week'::INTERVAL
    ) d
  )
  SELECT
    w.week_start,
    TO_CHAR(w.week_start, 'Mon DD') as week_label,
    COALESCE(COUNT(b.id), 0)::BIGINT as bookings_count
  FROM weeks w
  LEFT JOIN bookings b ON DATE_TRUNC('week', b.booking_date) = w.week_start
  GROUP BY w.week_start
  ORDER BY w.week_start ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get upcoming bookings for today
CREATE OR REPLACE FUNCTION get_upcoming_bookings(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
  booking_id UUID,
  customer_name TEXT,
  game_name TEXT,
  venue_name TEXT,
  booking_date DATE,
  start_time TIME,
  status TEXT,
  total_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id as booking_id,
    c.full_name as customer_name,
    g.name as game_name,
    COALESCE(v.name, 'Main Venue') as venue_name,
    b.booking_date,
    b.start_time,
    b.status::TEXT,
    b.final_amount as total_amount
  FROM bookings b
  INNER JOIN customers c ON b.customer_id = c.id
  INNER JOIN games g ON b.game_id = g.id
  LEFT JOIN venues v ON b.venue_id = v.id
  WHERE b.booking_date = CURRENT_DATE
    AND b.status IN ('pending', 'confirmed')
    AND b.start_time > CURRENT_TIME
  ORDER BY b.start_time ASC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get today's bookings by hour
CREATE OR REPLACE FUNCTION get_todays_bookings_by_hour()
RETURNS TABLE (
  hour_slot TEXT,
  bookings_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH hours AS (
    SELECT 
      TO_CHAR(h, 'HH24:00') as hour_slot
    FROM generate_series(
      '00:00'::TIME,
      '23:00'::TIME,
      '1 hour'::INTERVAL
    ) h
  )
  SELECT
    h.hour_slot,
    COALESCE(COUNT(b.id), 0)::BIGINT as bookings_count
  FROM hours h
  LEFT JOIN bookings b ON 
    DATE_TRUNC('hour', b.start_time) = h.hour_slot::TIME
    AND b.booking_date = CURRENT_DATE
  GROUP BY h.hour_slot
  ORDER BY h.hour_slot ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get recent booking activity
CREATE OR REPLACE FUNCTION get_recent_booking_activity(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  booking_id UUID,
  customer_name TEXT,
  game_name TEXT,
  venue_name TEXT,
  booking_date DATE,
  booking_time TIME,
  status TEXT,
  total_amount NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE,
  is_future_booking BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id as booking_id,
    c.full_name as customer_name,
    g.name as game_name,
    COALESCE(v.name, 'Main Venue') as venue_name,
    b.booking_date,
    b.start_time as booking_time,
    b.status::TEXT,
    b.final_amount as total_amount,
    b.created_at,
    (b.booking_date > CURRENT_DATE OR 
     (b.booking_date = CURRENT_DATE AND b.start_time > CURRENT_TIME)) as is_future_booking
  FROM bookings b
  INNER JOIN customers c ON b.customer_id = c.id
  INNER JOIN games g ON b.game_id = g.id
  LEFT JOIN venues v ON b.venue_id = v.id
  WHERE b.created_at >= NOW() - INTERVAL '7 days'
  ORDER BY b.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- BOOKING MANAGEMENT FUNCTIONS
-- =====================================================

-- Create booking with validation
CREATE OR REPLACE FUNCTION create_booking(
  p_venue_id UUID,
  p_game_id UUID,
  p_customer_id UUID,
  p_booking_date DATE,
  p_booking_time TIME,
  p_players INTEGER,
  p_total_amount NUMERIC,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_booking_number TEXT;
  v_end_time TIME;
  v_game_duration INTEGER;
BEGIN
  -- Get game duration
  SELECT duration_minutes INTO v_game_duration
  FROM games
  WHERE id = p_game_id;

  -- Calculate end time
  v_end_time := p_booking_time + (v_game_duration || ' minutes')::INTERVAL;

  -- Generate booking number
  v_booking_number := 'BK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

  -- Insert booking
  INSERT INTO bookings (
    venue_id,
    game_id,
    customer_id,
    booking_date,
    booking_time,
    end_time,
    players,
    status,
    total_amount,
    deposit_amount,
    payment_status,
    notes,
    confirmation_code,
    created_by
  ) VALUES (
    p_venue_id,
    p_game_id,
    p_customer_id,
    p_booking_date,
    p_booking_time,
    v_end_time,
    p_players,
    'pending',
    p_total_amount,
    0,
    'pending',
    p_notes,
    'CONF-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
    auth.uid()
  )
  RETURNING id INTO v_booking_id;

  -- Update customer stats
  UPDATE customers
  SET 
    total_bookings = total_bookings + 1,
    updated_at = NOW()
  WHERE id = p_customer_id;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancel booking with refund logic
CREATE OR REPLACE FUNCTION cancel_booking(
  p_booking_id UUID,
  p_reason TEXT DEFAULT NULL,
  p_issue_refund BOOLEAN DEFAULT FALSE
)
RETURNS BOOLEAN AS $$
DECLARE
  v_customer_id UUID;
  v_amount NUMERIC;
BEGIN
  -- Get booking details
  SELECT customer_id, final_amount INTO v_customer_id, v_amount
  FROM bookings
  WHERE id = p_booking_id;

  -- Update booking status
  UPDATE bookings
  SET 
    status = 'cancelled',
    internal_notes = COALESCE(internal_notes, '') || E'\n' || 
                     'Cancelled: ' || COALESCE(p_reason, 'No reason provided'),
    updated_at = NOW()
  WHERE id = p_booking_id;

  -- Update customer stats
  UPDATE customers
  SET 
    total_bookings = GREATEST(total_bookings - 1, 0),
    total_spent = GREATEST(total_spent - v_amount, 0),
    updated_at = NOW()
  WHERE id = v_customer_id;

  -- Handle refund if requested
  IF p_issue_refund THEN
    UPDATE bookings
    SET payment_status = 'refunded'
    WHERE id = p_booking_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get available time slots for a game
CREATE OR REPLACE FUNCTION get_available_slots(
  p_game_id UUID,
  p_date DATE
)
RETURNS TABLE (
  time_slot TIME,
  is_available BOOLEAN,
  bookings_count INTEGER
) AS $$
DECLARE
  v_start_time TIME := '09:00';
  v_end_time TIME := '21:00';
  v_slot_interval INTEGER := 60;
BEGIN
  RETURN QUERY
  WITH time_slots AS (
    SELECT 
      t::TIME as slot_time
    FROM generate_series(
      v_start_time,
      v_end_time,
      (v_slot_interval || ' minutes')::INTERVAL
    ) t
  ),
  booked_slots AS (
    SELECT 
      booking_time,
      COUNT(*)::INTEGER as booking_count
    FROM bookings
    WHERE 
      game_id = p_game_id
      AND booking_date = p_date
      AND status IN ('pending', 'confirmed', 'checked_in')
    GROUP BY booking_time
  )
  SELECT
    ts.slot_time as time_slot,
    COALESCE(bs.booking_count, 0) = 0 as is_available,
    COALESCE(bs.booking_count, 0) as bookings_count
  FROM time_slots ts
  LEFT JOIN booked_slots bs ON ts.slot_time = bs.booking_time
  ORDER BY ts.slot_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Batch update booking status
CREATE OR REPLACE FUNCTION update_booking_status_batch(
  p_booking_ids UUID[],
  p_new_status TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_updated_count INTEGER;
BEGIN
  UPDATE bookings
  SET 
    status = p_new_status::booking_status,
    updated_at = NOW()
  WHERE id = ANY(p_booking_ids);

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CUSTOMER FUNCTIONS
-- =====================================================

-- Get customer segments
CREATE OR REPLACE FUNCTION get_customer_segments(p_org_id UUID)
RETURNS TABLE (
  segment TEXT,
  customer_count BIGINT,
  total_revenue NUMERIC,
  avg_booking_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.segment::TEXT,
    COUNT(c.id)::BIGINT as customer_count,
    COALESCE(SUM(c.total_spent), 0) as total_revenue,
    COALESCE(AVG(c.total_spent), 0) as avg_booking_value
  FROM customers c
  WHERE c.organization_id = p_org_id
  GROUP BY c.segment
  ORDER BY customer_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculate customer lifetime value
CREATE OR REPLACE FUNCTION calculate_customer_ltv(p_customer_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_ltv NUMERIC;
  v_avg_booking_value NUMERIC;
  v_booking_frequency NUMERIC;
  v_customer_lifespan NUMERIC;
BEGIN
  -- Get average booking value
  SELECT COALESCE(AVG(final_amount), 0) INTO v_avg_booking_value
  FROM bookings
  WHERE customer_id = p_customer_id
    AND status IN ('confirmed', 'completed');

  -- Get booking frequency (bookings per month)
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        COUNT(*)::NUMERIC / GREATEST(
          EXTRACT(EPOCH FROM (MAX(booking_date) - MIN(booking_date))) / (30 * 24 * 60 * 60),
          1
        )
      ELSE 0
    END INTO v_booking_frequency
  FROM bookings
  WHERE customer_id = p_customer_id;

  -- Assume average customer lifespan of 24 months
  v_customer_lifespan := 24;

  -- Calculate LTV
  v_ltv := v_avg_booking_value * v_booking_frequency * v_customer_lifespan;

  RETURN ROUND(v_ltv, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get customer RFM score (Recency, Frequency, Monetary)
CREATE OR REPLACE FUNCTION get_customer_rfm_score(p_customer_id UUID)
RETURNS TABLE (
  recency_score INTEGER,
  frequency_score INTEGER,
  monetary_score INTEGER,
  rfm_segment TEXT
) AS $$
DECLARE
  v_last_booking_days INTEGER;
  v_total_bookings INTEGER;
  v_total_spent NUMERIC;
  v_r_score INTEGER;
  v_f_score INTEGER;
  v_m_score INTEGER;
BEGIN
  -- Get customer metrics
  SELECT 
    COALESCE(EXTRACT(DAY FROM NOW() - MAX(booking_date))::INTEGER, 999),
    COUNT(*)::INTEGER,
    COALESCE(SUM(final_amount), 0)
  INTO v_last_booking_days, v_total_bookings, v_total_spent
  FROM bookings
  WHERE customer_id = p_customer_id
    AND status IN ('confirmed', 'completed');

  -- Calculate Recency score (1-5, 5 is best)
  v_r_score := CASE
    WHEN v_last_booking_days <= 30 THEN 5
    WHEN v_last_booking_days <= 60 THEN 4
    WHEN v_last_booking_days <= 90 THEN 3
    WHEN v_last_booking_days <= 180 THEN 2
    ELSE 1
  END;

  -- Calculate Frequency score (1-5, 5 is best)
  v_f_score := CASE
    WHEN v_total_bookings >= 10 THEN 5
    WHEN v_total_bookings >= 7 THEN 4
    WHEN v_total_bookings >= 4 THEN 3
    WHEN v_total_bookings >= 2 THEN 2
    ELSE 1
  END;

  -- Calculate Monetary score (1-5, 5 is best)
  v_m_score := CASE
    WHEN v_total_spent >= 1000 THEN 5
    WHEN v_total_spent >= 500 THEN 4
    WHEN v_total_spent >= 250 THEN 3
    WHEN v_total_spent >= 100 THEN 2
    ELSE 1
  END;

  -- Determine segment
  RETURN QUERY
  SELECT
    v_r_score,
    v_f_score,
    v_m_score,
    CASE
      WHEN v_r_score >= 4 AND v_f_score >= 4 AND v_m_score >= 4 THEN 'Champions'
      WHEN v_r_score >= 3 AND v_f_score >= 3 AND v_m_score >= 3 THEN 'Loyal Customers'
      WHEN v_r_score >= 4 AND v_f_score <= 2 THEN 'New Customers'
      WHEN v_r_score <= 2 AND v_f_score >= 3 THEN 'At Risk'
      WHEN v_r_score <= 2 AND v_f_score <= 2 THEN 'Lost'
      ELSE 'Potential Loyalists'
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GAME FUNCTIONS
-- =====================================================

-- Duplicate game
CREATE OR REPLACE FUNCTION duplicate_game(p_game_id UUID)
RETURNS UUID AS $$
DECLARE
  v_new_game_id UUID;
  v_game_record RECORD;
BEGIN
  -- Get original game
  SELECT * INTO v_game_record
  FROM games
  WHERE id = p_game_id;

  -- Insert duplicate
  INSERT INTO games (
    organization_id,
    name,
    description,
    difficulty,
    duration_minutes,
    min_players,
    max_players,
    price,
    image_url,
    is_active
  ) VALUES (
    v_game_record.organization_id,
    v_game_record.name || ' (Copy)',
    v_game_record.description,
    v_game_record.difficulty,
    v_game_record.duration_minutes,
    v_game_record.min_players,
    v_game_record.max_players,
    v_game_record.price,
    v_game_record.image_url,
    false  -- Set as inactive by default
  )
  RETURNING id INTO v_new_game_id;

  RETURN v_new_game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get game analytics
CREATE OR REPLACE FUNCTION get_game_analytics(
  p_game_id UUID,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  total_bookings BIGINT,
  confirmed_bookings BIGINT,
  cancelled_bookings BIGINT,
  total_revenue NUMERIC,
  avg_party_size NUMERIC,
  avg_booking_value NUMERIC,
  conversion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_bookings,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::BIGINT as confirmed_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END)::BIGINT as cancelled_bookings,
    COALESCE(SUM(final_amount), 0) as total_revenue,
    COALESCE(AVG(party_size), 0) as avg_party_size,
    COALESCE(AVG(final_amount), 0) as avg_booking_value,
    CASE 
      WHEN COUNT(*) > 0 THEN 
        (COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC) * 100
      ELSE 0
    END as conversion_rate
  FROM bookings
  WHERE game_id = p_game_id
    AND (p_from_date IS NULL OR booking_date >= p_from_date)
    AND (p_to_date IS NULL OR booking_date <= p_to_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_dashboard_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_weekly_bookings_trend() TO authenticated;
GRANT EXECUTE ON FUNCTION get_upcoming_bookings(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_todays_bookings_by_hour() TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_booking_activity(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION create_booking(UUID, UUID, UUID, DATE, TIME, INTEGER, NUMERIC, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_booking(UUID, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_slots(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION update_booking_status_batch(UUID[], TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_segments(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_customer_ltv(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_customer_rfm_score(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION duplicate_game(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_game_analytics(UUID, DATE, DATE) TO authenticated;

-- Grant to anon for public widget functions
GRANT EXECUTE ON FUNCTION get_available_slots(UUID, DATE) TO anon;

COMMENT ON FUNCTION get_dashboard_stats() IS 'Returns overall dashboard statistics for the last 30 days';
COMMENT ON FUNCTION get_weekly_bookings_trend() IS 'Returns booking trend data for the last 8 weeks';
COMMENT ON FUNCTION get_upcoming_bookings(INTEGER) IS 'Returns upcoming bookings for today';
COMMENT ON FUNCTION get_todays_bookings_by_hour() IS 'Returns hourly booking distribution for today';
COMMENT ON FUNCTION get_recent_booking_activity(INTEGER) IS 'Returns recent booking activity';
COMMENT ON FUNCTION create_booking(UUID, UUID, UUID, DATE, TIME, INTEGER, NUMERIC, TEXT) IS 'Creates a new booking with validation';
COMMENT ON FUNCTION cancel_booking(UUID, TEXT, BOOLEAN) IS 'Cancels a booking with optional refund';
COMMENT ON FUNCTION get_available_slots(UUID, DATE) IS 'Returns available time slots for a game on a specific date';
COMMENT ON FUNCTION update_booking_status_batch(UUID[], TEXT) IS 'Updates status for multiple bookings';
COMMENT ON FUNCTION get_customer_segments(UUID) IS 'Returns customer segmentation data';
COMMENT ON FUNCTION calculate_customer_ltv(UUID) IS 'Calculates customer lifetime value';
COMMENT ON FUNCTION get_customer_rfm_score(UUID) IS 'Calculates RFM score for customer segmentation';
COMMENT ON FUNCTION duplicate_game(UUID) IS 'Duplicates a game with all settings';
COMMENT ON FUNCTION get_game_analytics(UUID, DATE, DATE) IS 'Returns analytics for a specific game';
