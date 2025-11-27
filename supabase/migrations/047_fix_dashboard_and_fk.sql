-- Migration: Fix dashboard RPC and add organizations FK
-- Date: 2025-11-27
-- Description: Fix get_upcoming_bookings and add organizations_plan_id_fkey

-- Fix get_upcoming_bookings - bookings table doesn't have customer_name/customer_email columns
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
            'customer_name', COALESCE(c.first_name || ' ' || c.last_name, 'Guest'),
            'customer_email', COALESCE(c.email, ''),
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

-- Fix get_platform_metrics
CREATE OR REPLACE FUNCTION get_platform_metrics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    total_bookings integer;
    total_revenue numeric;
    total_customers integer;
    total_organizations integer;
    active_organizations integer;
BEGIN
    SELECT COUNT(*) INTO total_bookings FROM bookings;
    SELECT COALESCE(SUM(total_amount), 0) INTO total_revenue FROM bookings WHERE status = 'confirmed';
    SELECT COUNT(*) INTO total_customers FROM customers;
    SELECT COUNT(*) INTO total_organizations FROM organizations;
    SELECT COUNT(*) INTO active_organizations FROM organizations WHERE status = 'active';
    
    result := jsonb_build_object(
        'total_bookings', total_bookings,
        'total_revenue', total_revenue,
        'total_customers', total_customers,
        'total_organizations', total_organizations,
        'active_organizations', active_organizations,
        'conversion_rate', 0,
        'avg_booking_value', CASE WHEN total_bookings > 0 THEN total_revenue / total_bookings ELSE 0 END
    );
    
    RETURN result;
END;
$$;

-- Change plan_id from varchar to uuid (if not already done)
-- ALTER TABLE organizations 
-- ALTER COLUMN plan_id TYPE uuid USING plan_id::uuid;

-- Add FK constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'organizations_plan_id_fkey'
    ) THEN
        ALTER TABLE organizations
        ADD CONSTRAINT organizations_plan_id_fkey 
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL;
    END IF;
END$$;
