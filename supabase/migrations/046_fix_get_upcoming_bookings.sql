-- Migration: Fix get_upcoming_bookings customer name
-- Date: 2025-11-27
-- Description: Fix c.name column error - use first_name + last_name instead

CREATE OR REPLACE FUNCTION get_upcoming_bookings(limit_count integer DEFAULT 5)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT COALESCE(jsonb_agg(booking_data), '[]'::jsonb)
    INTO result
    FROM (
        SELECT jsonb_build_object(
            'id', b.id,
            'booking_id', b.id,
            'booking_number', b.booking_number,
            'activity_name', COALESCE(a.name, 'Unknown Activity'),
            'customer_name', COALESCE(c.first_name || ' ' || c.last_name, b.customer_name, 'Guest'),
            'customer_email', COALESCE(c.email, b.customer_email),
            'venue_name', COALESCE(v.name, 'Unknown Venue'),
            'booking_date', b.booking_date,
            'start_time', b.start_time,
            'party_size', b.party_size,
            'total_amount', b.total_amount,
            'status', b.status,
            'created_at', b.created_at
        ) as booking_data
        FROM bookings b
        LEFT JOIN activities a ON b.activity_id = a.id
        LEFT JOIN customers c ON b.customer_id = c.id
        LEFT JOIN venues v ON b.venue_id = v.id
        WHERE b.booking_date >= CURRENT_DATE
        AND b.status IN ('confirmed', 'pending')
        ORDER BY b.booking_date ASC, b.start_time ASC
        LIMIT limit_count
    ) sub;
    
    RETURN result;
END;
$$;
