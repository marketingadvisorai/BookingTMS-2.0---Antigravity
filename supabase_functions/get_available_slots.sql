/**
 * Supabase Function: get_available_slots
 * 
 * Returns available time slots for a game on a specific date.
 * Used by the booking widget to show real-time availability.
 * 
 * Parameters:
 * - p_game_id: UUID of the game
 * - p_date: Date to check availability (YYYY-MM-DD)
 * - p_organization_id: UUID of the organization
 * 
 * Returns:
 * - time_slot: Start time (HH:MM)
 * - end_time: End time (HH:MM)
 * - available_spots: Number of spots available
 * - total_capacity: Maximum capacity
 * - is_available: Boolean if slot is bookable
 * - price: Price for this time slot
 * 
 * Usage:
 * SELECT * FROM get_available_slots(
 *   'game-uuid-here',
 *   '2025-11-20',
 *   'org-uuid-here'
 * );
 */

CREATE OR REPLACE FUNCTION get_available_slots(
  p_game_id UUID,
  p_date DATE,
  p_organization_id UUID
)
RETURNS TABLE (
  time_slot TIME,
  end_time TIME,
  available_spots INT,
  total_capacity INT,
  is_available BOOLEAN,
  price DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH 
  -- Get game details
  game_info AS (
    SELECT
      duration_minutes,
      max_players,
      price
    FROM games
    WHERE id = p_game_id
      AND organization_id = p_organization_id
      AND is_active = TRUE
  ),
  
  -- Generate time slots for the day (10 AM to 10 PM, hourly)
  time_slots AS (
    SELECT
      t.slot_time::TIME AS start_time,
      (t.slot_time + (SELECT duration_minutes FROM game_info LIMIT 1) * INTERVAL '1 minute')::TIME AS end_time
    FROM generate_series(
      '10:00'::TIME,
      '22:00'::TIME,
      '1 hour'::INTERVAL
    ) AS t(slot_time)
  ),
  
  -- Count bookings for each time slot
  bookings_per_slot AS (
    SELECT
      b.booking_time::TIME AS slot,
      SUM(b.players) AS total_players_booked
    FROM bookings b
    WHERE b.game_id = p_game_id
      AND b.booking_date = p_date
      AND b.status NOT IN ('cancelled', 'no-show')
    GROUP BY b.booking_time::TIME
  )
  
  -- Calculate availability for each slot
  SELECT
    ts.start_time AS time_slot,
    ts.end_time,
    (COALESCE((SELECT max_players FROM game_info LIMIT 1), 0) - COALESCE(bps.total_players_booked, 0))::INT AS available_spots,
    (SELECT max_players FROM game_info LIMIT 1)::INT AS total_capacity,
    (COALESCE(bps.total_players_booked, 0) < COALESCE((SELECT max_players FROM game_info LIMIT 1), 0)) AS is_available,
    (SELECT price FROM game_info LIMIT 1) AS price
  FROM time_slots ts
  LEFT JOIN bookings_per_slot bps ON ts.start_time = bps.slot
  WHERE (SELECT max_players FROM game_info LIMIT 1) IS NOT NULL
  ORDER BY ts.start_time;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_available_slots(UUID, DATE, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_slots(UUID, DATE, UUID) TO anon;

-- Add comment
COMMENT ON FUNCTION get_available_slots IS 'Returns available time slots for a game on a specific date';
