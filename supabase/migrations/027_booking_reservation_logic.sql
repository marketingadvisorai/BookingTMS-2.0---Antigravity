-- =====================================================
-- Migration: 027_booking_reservation_logic
-- Purpose: Update triggers to reserve slots for pending bookings and add cleanup logic
-- Date: 2025-11-21
-- =====================================================

-- 1. Update Trigger Function to count 'pending_payment' as a booked slot
-- This ensures that when a user is on the checkout screen, the slot is held for them.

CREATE OR REPLACE FUNCTION update_time_slot_on_booking_change()
RETURNS trigger AS $$
BEGIN
  -- On INSERT with pending_payment or confirmed status
  -- We now include 'pending_payment' to reserve the slot immediately
  IF TG_OP = 'INSERT' AND NEW.time_slot_id IS NOT NULL AND NEW.status IN ('confirmed', 'checked_in', 'completed', 'pending_payment') THEN
    PERFORM increment_time_slot_bookings(NEW.time_slot_id);
  END IF;
  
  -- On UPDATE
  IF TG_OP = 'UPDATE' AND NEW.time_slot_id IS NOT NULL THEN
    -- If status changes FROM a non-booking status TO a booking status
    -- Note: 'pending_payment' is now a booking status, so moving from pending -> confirmed shouldn't double count
    
    -- Case 1: Booking becomes active (e.g. from cancelled -> pending/confirmed)
    IF OLD.status IN ('cancelled', 'expired') AND NEW.status IN ('confirmed', 'checked_in', 'completed', 'pending_payment') THEN
      PERFORM increment_time_slot_bookings(NEW.time_slot_id);
      
    -- Case 2: Booking becomes inactive (e.g. from pending/confirmed -> cancelled/expired)
    ELSIF OLD.status IN ('confirmed', 'checked_in', 'completed', 'pending_payment') AND NEW.status IN ('cancelled', 'expired') THEN
      PERFORM decrement_time_slot_bookings(NEW.time_slot_id);
    END IF;
    
    -- Note: Transitioning from 'pending_payment' to 'confirmed' requires NO change in count, 
    -- as the slot was already reserved.
  END IF;
  
  -- On DELETE of active booking
  IF TG_OP = 'DELETE' AND OLD.time_slot_id IS NOT NULL AND OLD.status IN ('confirmed', 'checked_in', 'completed', 'pending_payment') THEN
    PERFORM decrement_time_slot_bookings(OLD.time_slot_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create Cleanup Function for Expired Bookings
-- This function should be called periodically (e.g., via pg_cron or Edge Function)
-- It cancels bookings that have been 'pending_payment' for more than 30 minutes.

CREATE OR REPLACE FUNCTION cleanup_expired_bookings()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  -- Find and update expired bookings
  WITH expired AS (
    UPDATE bookings
    SET status = 'expired',
        updated_at = NOW()
    WHERE status = 'pending_payment'
      AND created_at < NOW() - INTERVAL '30 minutes'
    RETURNING id
  )
  SELECT count(*) INTO v_count FROM expired;
  
  IF v_count > 0 THEN
    RAISE NOTICE 'Cleaned up % expired bookings', v_count;
  END IF;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- 3. Add 'expired' to valid status check if constraint exists (optional, depending on schema)
-- If there's a check constraint on status, we might need to update it. 
-- Assuming text column for now based on previous migrations.

-- 4. Grant execute permission to authenticated users (if needed for RPC)
GRANT EXECUTE ON FUNCTION cleanup_expired_bookings TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_bookings TO service_role;

-- Verify
DO $$
BEGIN
  RAISE NOTICE 'Migration 027 complete: Reservation logic updated.';
END$$;
