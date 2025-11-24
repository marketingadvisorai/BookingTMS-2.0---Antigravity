-- =====================================================
-- Migration: 029_fix_booking_trigger
-- Purpose: Update triggers to use session_id for reservation logic
-- Date: 2025-11-24
-- =====================================================

-- Update Trigger Function to check session_id as well
CREATE OR REPLACE FUNCTION update_time_slot_on_booking_change()
RETURNS trigger AS $$
DECLARE
  v_session_id UUID;
  v_old_session_id UUID;
BEGIN
  -- Resolve session_id (prefer session_id, fallback to time_slot_id if it exists)
  -- We assume one of them is populated.
  v_session_id := COALESCE(NEW.session_id, NEW.time_slot_id);
  
  IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN
    v_old_session_id := COALESCE(OLD.session_id, OLD.time_slot_id);
  END IF;

  -- On INSERT
  IF TG_OP = 'INSERT' AND v_session_id IS NOT NULL AND NEW.status IN ('confirmed', 'checked_in', 'completed', 'pending_payment') THEN
    PERFORM increment_time_slot_bookings(v_session_id);
  END IF;
  
  -- On UPDATE
  IF TG_OP = 'UPDATE' AND v_session_id IS NOT NULL THEN
    -- Case 1: Booking becomes active
    IF OLD.status IN ('cancelled', 'expired') AND NEW.status IN ('confirmed', 'checked_in', 'completed', 'pending_payment') THEN
      PERFORM increment_time_slot_bookings(v_session_id);
      
    -- Case 2: Booking becomes inactive
    ELSIF OLD.status IN ('confirmed', 'checked_in', 'completed', 'pending_payment') AND NEW.status IN ('cancelled', 'expired') THEN
      PERFORM decrement_time_slot_bookings(v_session_id);
    END IF;
  END IF;
  
  -- On DELETE
  IF TG_OP = 'DELETE' AND v_old_session_id IS NOT NULL AND OLD.status IN ('confirmed', 'checked_in', 'completed', 'pending_payment') THEN
    PERFORM decrement_time_slot_bookings(v_old_session_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify
DO $$
BEGIN
  RAISE NOTICE 'Migration 029 complete: Trigger updated to use session_id.';
END$$;
