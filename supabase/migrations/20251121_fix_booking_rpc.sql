-- Migration: Fix create_booking_transaction RPC
-- Date: 2025-11-21
-- Description: Update RPC to handle customer_id, party_size, and populate date/time fields from session.

-- Drop the old function signature first to avoid parameter name conflicts
DROP FUNCTION IF EXISTS create_booking_transaction(uuid, uuid, uuid, integer);

CREATE OR REPLACE FUNCTION create_booking_transaction(
    p_session_id UUID,
    p_customer_id UUID,
    p_organization_id UUID,
    p_party_size INTEGER
)
RETURNS UUID AS $$
DECLARE
    v_booking_id UUID;
    v_capacity_remaining INTEGER;
    v_price DECIMAL(10, 2);
    v_activity_id UUID;
    v_start_time TIMESTAMPTZ;
    v_end_time TIMESTAMPTZ;
    v_booking_number TEXT;
BEGIN
    -- Lock the session row
    SELECT 
        capacity_remaining, 
        price_at_generation,
        activity_id,
        start_time,
        end_time
    INTO 
        v_capacity_remaining, 
        v_price,
        v_activity_id,
        v_start_time,
        v_end_time
    FROM activity_sessions
    WHERE id = p_session_id
    FOR UPDATE;

    -- Check capacity
    IF v_capacity_remaining < p_party_size THEN
        RAISE EXCEPTION 'Insufficient capacity';
    END IF;

    -- Decrement capacity
    UPDATE activity_sessions
    SET capacity_remaining = capacity_remaining - p_party_size
    WHERE id = p_session_id;

    -- Generate Booking Number (Simple timestamp based for now, or use sequence if exists)
    v_booking_number := 'BK-' || floor(extract(epoch from now()));

    -- Insert booking
    -- Note: We populate both new and legacy columns to ensure compatibility
    INSERT INTO bookings (
        session_id,
        activity_id, -- formerly game_id
        customer_id,
        organization_id,
        party_size,
        status,
        total_price,
        -- Legacy/Existing columns
        booking_number,
        booking_date,
        start_time,
        end_time,
        total_amount,
        final_amount,
        payment_status,
        created_by
    )
    VALUES (
        p_session_id,
        v_activity_id,
        p_customer_id,
        p_organization_id,
        p_party_size,
        'confirmed',
        COALESCE(v_price, 0) * p_party_size,
        -- Legacy/Existing values
        v_booking_number,
        v_start_time::DATE, -- Cast to date
        to_char(v_start_time, 'HH24:MI'), -- Cast to HH:MM text
        to_char(v_end_time, 'HH24:MI'), -- Cast to HH:MM text
        COALESCE(v_price, 0) * p_party_size, -- total_amount
        COALESCE(v_price, 0) * p_party_size, -- final_amount
        'pending',
        'system'
    )
    RETURNING id INTO v_booking_id;

    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;
