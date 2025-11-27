-- Migration: Fix ALL dashboard RPC functions with correct column names
-- Date: 2025-11-27
-- Description: Drop and recreate all dashboard functions with proper column references

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_dashboard_stats();
DROP FUNCTION IF EXISTS get_todays_bookings_by_hour();
DROP FUNCTION IF EXISTS get_recent_booking_activity(integer);
DROP FUNCTION IF EXISTS get_upcoming_bookings(integer);
DROP FUNCTION IF EXISTS get_weekly_bookings_trend();

-- 1. Create get_dashboard_stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE(
    total_bookings bigint,
    confirmed_bookings bigint,
    total_revenue numeric,
    average_order_value numeric,
    avg_group_size numeric,
    total_customers bigint,
    active_customers bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::bigint as total_bookings,
        COUNT(*) FILTER (WHERE b.status = 'confirmed')::bigint as confirmed_bookings,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'confirmed'), 0)::numeric as total_revenue,
        COALESCE(AVG(b.total_amount) FILTER (WHERE b.status = 'confirmed'), 0)::numeric as average_order_value,
        COALESCE(AVG(b.party_size), 0)::numeric as avg_group_size,
        (SELECT COUNT(*)::bigint FROM customers) as total_customers,
        (SELECT COUNT(*)::bigint FROM customers WHERE created_at >= NOW() - INTERVAL '30 days') as active_customers
    FROM bookings b;
END;
$$;

-- 2. Create get_todays_bookings_by_hour
CREATE OR REPLACE FUNCTION get_todays_bookings_by_hour()
RETURNS TABLE(
    hour_slot text,
    bookings_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(generate_series, 'HH24:00') as hour_slot,
        COALESCE(
            (SELECT COUNT(*) FROM bookings 
             WHERE booking_date = CURRENT_DATE 
             AND EXTRACT(HOUR FROM start_time::time) = EXTRACT(HOUR FROM generate_series)),
            0
        )::bigint as bookings_count
    FROM generate_series(
        CURRENT_DATE + INTERVAL '8 hours',
        CURRENT_DATE + INTERVAL '22 hours',
        INTERVAL '1 hour'
    );
END;
$$;

-- 3. Create get_recent_booking_activity  
CREATE OR REPLACE FUNCTION get_recent_booking_activity(limit_count integer DEFAULT 10)
RETURNS TABLE(
    booking_id uuid,
    customer_name text,
    activity_name text,
    venue_name text,
    booking_date date,
    booking_time text,
    status text,
    total_amount numeric,
    created_at timestamptz,
    is_future_booking boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as booking_id,
        COALESCE(c.first_name || ' ' || c.last_name, 'Guest')::text as customer_name,
        COALESCE(a.name, 'Unknown Activity')::text as activity_name,
        COALESCE(v.name, 'Unknown Venue')::text as venue_name,
        b.booking_date,
        COALESCE(b.start_time, '00:00')::text as booking_time,
        b.status::text,
        COALESCE(b.total_amount, 0)::numeric,
        b.created_at,
        (b.booking_date >= CURRENT_DATE)::boolean as is_future_booking
    FROM bookings b
    LEFT JOIN customers c ON b.customer_id = c.id
    LEFT JOIN activities a ON b.activity_id = a.id
    LEFT JOIN venues v ON b.venue_id = v.id
    ORDER BY b.created_at DESC
    LIMIT limit_count;
END;
$$;

-- 4. Create get_upcoming_bookings
CREATE OR REPLACE FUNCTION get_upcoming_bookings(limit_count integer DEFAULT 5)
RETURNS TABLE(
    booking_id uuid,
    booking_number text,
    customer_name text,
    customer_email text,
    activity_name text,
    venue_name text,
    booking_date date,
    start_time text,
    party_size integer,
    total_amount numeric,
    status text,
    created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id as booking_id,
        COALESCE(b.booking_number, b.id::text) as booking_number,
        COALESCE(c.first_name || ' ' || c.last_name, 'Guest')::text as customer_name,
        COALESCE(c.email, '')::text as customer_email,
        COALESCE(a.name, 'Unknown Activity')::text as activity_name,
        COALESCE(v.name, 'Unknown Venue')::text as venue_name,
        b.booking_date,
        COALESCE(b.start_time, '00:00')::text as start_time,
        COALESCE(b.party_size, 1)::integer as party_size,
        COALESCE(b.total_amount, 0)::numeric as total_amount,
        b.status::text,
        b.created_at
    FROM bookings b
    LEFT JOIN customers c ON b.customer_id = c.id
    LEFT JOIN activities a ON b.activity_id = a.id
    LEFT JOIN venues v ON b.venue_id = v.id
    WHERE b.booking_date >= CURRENT_DATE
    AND b.status IN ('confirmed', 'pending')
    ORDER BY b.booking_date ASC, b.start_time ASC
    LIMIT limit_count;
END;
$$;

-- 5. Create get_weekly_bookings_trend
CREATE OR REPLACE FUNCTION get_weekly_bookings_trend()
RETURNS TABLE(
    week_start date,
    week_label text,
    bookings_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        date_trunc('week', d)::date as week_start,
        TO_CHAR(date_trunc('week', d), 'Mon DD') as week_label,
        COALESCE(
            (SELECT COUNT(*) FROM bookings 
             WHERE booking_date >= date_trunc('week', d)::date 
             AND booking_date < (date_trunc('week', d) + INTERVAL '7 days')::date),
            0
        )::bigint as bookings_count
    FROM generate_series(
        CURRENT_DATE - INTERVAL '4 weeks',
        CURRENT_DATE,
        INTERVAL '1 week'
    ) as d
    ORDER BY week_start;
END;
$$;
