-- Migration: Add get_bookings_with_details RPC function
-- Version: 008
-- Description: Create RPC function to fetch bookings with joined venue, game, and customer details

-- Drop function if exists
DROP FUNCTION IF EXISTS get_bookings_with_details(UUID, VARCHAR, DATE, DATE);

-- Create the RPC function
CREATE OR REPLACE FUNCTION get_bookings_with_details(
  p_venue_id UUID DEFAULT NULL,
  p_status VARCHAR DEFAULT NULL,
  p_from_date DATE DEFAULT NULL,
  p_to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  venue_id UUID,
  game_id UUID,
  customer_id UUID,
  booking_date DATE,
  booking_time VARCHAR,
  end_time VARCHAR,
  players INTEGER,
  status VARCHAR,
  total_amount DECIMAL,
  deposit_amount DECIMAL,
  payment_status VARCHAR,
  payment_method VARCHAR,
  transaction_id VARCHAR,
  notes TEXT,
  customer_notes TEXT,
  internal_notes TEXT,
  confirmation_code VARCHAR,
  metadata JSONB,
  created_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  venue_name VARCHAR,
  venue_city VARCHAR,
  game_name VARCHAR,
  game_difficulty VARCHAR,
  customer_name VARCHAR,
  customer_email VARCHAR,
  customer_phone VARCHAR
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.venue_id,
    b.game_id,
    b.customer_id,
    b.booking_date,
    b.start_time::VARCHAR as booking_time,
    b.end_time::VARCHAR,
    b.party_size as players,
    b.status::VARCHAR,
    b.total_amount,
    COALESCE(b.deposit_amount, 0) as deposit_amount,
    b.payment_status::VARCHAR,
    b.payment_method::VARCHAR,
    b.transaction_id::VARCHAR,
    b.notes,
    b.customer_notes,
    b.internal_notes,
    b.booking_number as confirmation_code,
    COALESCE(b.metadata, '{}'::JSONB) as metadata,
    b.created_by,
    b.created_at,
    b.updated_at,
    v.name::VARCHAR as venue_name,
    v.city::VARCHAR as venue_city,
    g.name::VARCHAR as game_name,
    g.difficulty::VARCHAR as game_difficulty,
    c.full_name::VARCHAR as customer_name,
    c.email::VARCHAR as customer_email,
    c.phone::VARCHAR as customer_phone
  FROM bookings b
  LEFT JOIN venues v ON b.venue_id = v.id
  LEFT JOIN games g ON b.game_id = g.id
  LEFT JOIN customers c ON b.customer_id = c.id
  WHERE 
    (p_venue_id IS NULL OR b.venue_id = p_venue_id)
    AND (p_status IS NULL OR b.status::VARCHAR = p_status)
    AND (p_from_date IS NULL OR b.booking_date >= p_from_date)
    AND (p_to_date IS NULL OR b.booking_date <= p_to_date)
  ORDER BY b.booking_date DESC, b.start_time DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_bookings_with_details(UUID, VARCHAR, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_bookings_with_details(UUID, VARCHAR, DATE, DATE) TO anon;
