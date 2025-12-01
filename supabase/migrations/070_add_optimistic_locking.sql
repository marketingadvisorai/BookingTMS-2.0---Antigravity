-- =====================================================
-- Migration: 070_add_optimistic_locking.sql
-- Description: Add optimistic locking to prevent double bookings
-- Date: 2025-12-01
-- Priority: P0 - Critical
-- 
-- Problem: Race conditions allow two concurrent booking requests
-- to both succeed, causing overbooking.
-- 
-- Solution: Add version column and atomic reservation function
-- that checks version before decrementing capacity.
-- =====================================================

-- =====================================================
-- PART 1: ADD VERSION COLUMN TO ACTIVITY_SESSIONS
-- =====================================================

-- Add version column for optimistic locking
ALTER TABLE activity_sessions 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Add index for version lookups (used in concurrent scenarios)
CREATE INDEX IF NOT EXISTS idx_sessions_version 
ON activity_sessions(id, version);

COMMENT ON COLUMN activity_sessions.version IS 
  'Optimistic locking version - incremented on each capacity change to prevent race conditions';

-- =====================================================
-- PART 2: CREATE ATOMIC RESERVATION FUNCTION
-- =====================================================

-- Function to safely reserve session capacity with version check
-- Returns: success (boolean), new_version (integer), remaining (integer)
CREATE OR REPLACE FUNCTION reserve_session_capacity(
  p_session_id UUID,
  p_spots INTEGER,
  p_expected_version INTEGER
) RETURNS TABLE(
  success BOOLEAN, 
  new_version INTEGER, 
  remaining INTEGER,
  error_code TEXT
) AS $$
DECLARE
  v_current_capacity INTEGER;
  v_current_version INTEGER;
  v_is_closed BOOLEAN;
BEGIN
  -- Lock the row and get current state
  SELECT capacity_remaining, version, is_closed 
  INTO v_current_capacity, v_current_version, v_is_closed
  FROM activity_sessions
  WHERE id = p_session_id
  FOR UPDATE;
  
  -- Session not found
  IF v_current_version IS NULL THEN
    RETURN QUERY SELECT false, 0, 0, 'SESSION_NOT_FOUND'::TEXT;
    RETURN;
  END IF;
  
  -- Session is closed
  IF v_is_closed THEN
    RETURN QUERY SELECT false, v_current_version, v_current_capacity, 'SESSION_CLOSED'::TEXT;
    RETURN;
  END IF;
  
  -- Version mismatch = concurrent modification detected
  IF v_current_version != p_expected_version THEN
    RETURN QUERY SELECT false, v_current_version, v_current_capacity, 'VERSION_MISMATCH'::TEXT;
    RETURN;
  END IF;
  
  -- Insufficient capacity
  IF v_current_capacity < p_spots THEN
    RETURN QUERY SELECT false, v_current_version, v_current_capacity, 'INSUFFICIENT_CAPACITY'::TEXT;
    RETURN;
  END IF;
  
  -- All checks passed - update with new version
  UPDATE activity_sessions
  SET 
    capacity_remaining = capacity_remaining - p_spots,
    version = version + 1,
    updated_at = NOW()
  WHERE id = p_session_id;
  
  RETURN QUERY SELECT true, v_current_version + 1, v_current_capacity - p_spots, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION reserve_session_capacity(UUID, INTEGER, INTEGER) IS 
  'Atomically reserve capacity with optimistic locking. Returns success status, new version, remaining capacity, and error code if failed.';

-- =====================================================
-- PART 3: CREATE RELEASE CAPACITY FUNCTION
-- =====================================================

-- Function to release reserved capacity (for cancellations or expired reservations)
CREATE OR REPLACE FUNCTION release_session_capacity(
  p_session_id UUID,
  p_spots INTEGER
) RETURNS TABLE(
  success BOOLEAN, 
  new_version INTEGER, 
  remaining INTEGER
) AS $$
DECLARE
  v_current_capacity INTEGER;
  v_total_capacity INTEGER;
  v_current_version INTEGER;
BEGIN
  -- Lock the row
  SELECT capacity_remaining, capacity_total, version 
  INTO v_current_capacity, v_total_capacity, v_current_version
  FROM activity_sessions
  WHERE id = p_session_id
  FOR UPDATE;
  
  -- Session not found
  IF v_current_version IS NULL THEN
    RETURN QUERY SELECT false, 0, 0;
    RETURN;
  END IF;
  
  -- Calculate new capacity (don't exceed total)
  UPDATE activity_sessions
  SET 
    capacity_remaining = LEAST(capacity_remaining + p_spots, capacity_total),
    version = version + 1,
    updated_at = NOW()
  WHERE id = p_session_id;
  
  RETURN QUERY SELECT true, v_current_version + 1, LEAST(v_current_capacity + p_spots, v_total_capacity);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION release_session_capacity(UUID, INTEGER) IS 
  'Release previously reserved capacity back to the pool. Used for cancellations and expired reservations.';

-- =====================================================
-- PART 4: CREATE SLOT RESERVATIONS TABLE
-- =====================================================

-- Temporary reservations during checkout process
CREATE TABLE IF NOT EXISTS slot_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES activity_sessions(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_email VARCHAR(255),
  spots_reserved INTEGER NOT NULL,
  checkout_session_id VARCHAR(255),
  session_version_at_reserve INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  CONSTRAINT positive_spots CHECK (spots_reserved > 0),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'converted', 'expired', 'cancelled'))
);

-- Indexes for slot_reservations
CREATE INDEX IF NOT EXISTS idx_reservations_session 
ON slot_reservations(session_id);

CREATE INDEX IF NOT EXISTS idx_reservations_expires 
ON slot_reservations(expires_at) WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_reservations_checkout 
ON slot_reservations(checkout_session_id) WHERE checkout_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reservations_org 
ON slot_reservations(organization_id);

-- Enable RLS
ALTER TABLE slot_reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for slot_reservations
CREATE POLICY "Service role full access to reservations" 
ON slot_reservations FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Org users can view their reservations" 
ON slot_reservations FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_platform_team = true)
);

COMMENT ON TABLE slot_reservations IS 
  'Temporary slot reservations during checkout. Expires after 10 minutes if not converted to booking.';

-- =====================================================
-- PART 5: CREATE RESERVATION MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to create a reservation with capacity check
CREATE OR REPLACE FUNCTION create_slot_reservation(
  p_session_id UUID,
  p_organization_id UUID,
  p_spots INTEGER,
  p_customer_email VARCHAR(255) DEFAULT NULL,
  p_checkout_session_id VARCHAR(255) DEFAULT NULL,
  p_ttl_minutes INTEGER DEFAULT 10
) RETURNS TABLE(
  reservation_id UUID,
  success BOOLEAN,
  error_code TEXT,
  session_version INTEGER
) AS $$
DECLARE
  v_reservation_id UUID;
  v_current_version INTEGER;
  v_reserve_result RECORD;
BEGIN
  -- Get current session version
  SELECT version INTO v_current_version
  FROM activity_sessions
  WHERE id = p_session_id;
  
  IF v_current_version IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, false, 'SESSION_NOT_FOUND'::TEXT, 0;
    RETURN;
  END IF;
  
  -- Try to reserve capacity
  SELECT * INTO v_reserve_result
  FROM reserve_session_capacity(p_session_id, p_spots, v_current_version);
  
  IF NOT v_reserve_result.success THEN
    RETURN QUERY SELECT NULL::UUID, false, v_reserve_result.error_code, v_current_version;
    RETURN;
  END IF;
  
  -- Create reservation record
  INSERT INTO slot_reservations (
    session_id,
    organization_id,
    customer_email,
    spots_reserved,
    checkout_session_id,
    session_version_at_reserve,
    expires_at
  ) VALUES (
    p_session_id,
    p_organization_id,
    p_customer_email,
    p_spots,
    p_checkout_session_id,
    v_reserve_result.new_version,
    NOW() + (p_ttl_minutes || ' minutes')::INTERVAL
  )
  RETURNING id INTO v_reservation_id;
  
  RETURN QUERY SELECT v_reservation_id, true, NULL::TEXT, v_reserve_result.new_version;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION create_slot_reservation IS 
  'Create a temporary slot reservation with automatic capacity decrement. Returns reservation_id on success.';

-- Function to convert reservation to booking
CREATE OR REPLACE FUNCTION convert_reservation_to_booking(
  p_reservation_id UUID,
  p_booking_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_reservation RECORD;
BEGIN
  -- Get and lock reservation
  SELECT * INTO v_reservation
  FROM slot_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;
  
  IF v_reservation IS NULL THEN
    RETURN false;
  END IF;
  
  IF v_reservation.status != 'pending' THEN
    RETURN false;
  END IF;
  
  IF v_reservation.expires_at < NOW() THEN
    -- Reservation expired, release capacity
    PERFORM release_session_capacity(v_reservation.session_id, v_reservation.spots_reserved);
    UPDATE slot_reservations SET status = 'expired' WHERE id = p_reservation_id;
    RETURN false;
  END IF;
  
  -- Convert to booking
  UPDATE slot_reservations
  SET 
    status = 'converted',
    converted_at = NOW(),
    booking_id = p_booking_id
  WHERE id = p_reservation_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION convert_reservation_to_booking IS 
  'Convert a pending reservation to a confirmed booking. Returns false if reservation is expired or invalid.';

-- Function to cancel a reservation and release capacity
CREATE OR REPLACE FUNCTION cancel_slot_reservation(
  p_reservation_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_reservation RECORD;
BEGIN
  -- Get and lock reservation
  SELECT * INTO v_reservation
  FROM slot_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;
  
  IF v_reservation IS NULL OR v_reservation.status != 'pending' THEN
    RETURN false;
  END IF;
  
  -- Release capacity
  PERFORM release_session_capacity(v_reservation.session_id, v_reservation.spots_reserved);
  
  -- Mark as cancelled
  UPDATE slot_reservations
  SET status = 'cancelled'
  WHERE id = p_reservation_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cancel_slot_reservation IS 
  'Cancel a pending reservation and release capacity back to the pool.';

-- =====================================================
-- PART 6: CREATE CLEANUP FUNCTION FOR EXPIRED RESERVATIONS
-- =====================================================

-- Function to clean up expired reservations (called by cron job)
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS TABLE(
  cleaned_count INTEGER,
  capacity_released INTEGER
) AS $$
DECLARE
  v_cleaned INTEGER := 0;
  v_capacity INTEGER := 0;
  v_reservation RECORD;
BEGIN
  -- Find and process expired reservations
  FOR v_reservation IN
    SELECT id, session_id, spots_reserved
    FROM slot_reservations
    WHERE status = 'pending' AND expires_at < NOW()
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Release capacity
    PERFORM release_session_capacity(v_reservation.session_id, v_reservation.spots_reserved);
    
    -- Mark as expired
    UPDATE slot_reservations
    SET status = 'expired'
    WHERE id = v_reservation.id;
    
    v_cleaned := v_cleaned + 1;
    v_capacity := v_capacity + v_reservation.spots_reserved;
  END LOOP;
  
  RETURN QUERY SELECT v_cleaned, v_capacity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_reservations IS 
  'Clean up expired reservations and release their capacity. Should be called by a cron job every minute.';

-- =====================================================
-- PART 7: GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION reserve_session_capacity(UUID, INTEGER, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION release_session_capacity(UUID, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_slot_reservation(UUID, UUID, INTEGER, VARCHAR, VARCHAR, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION convert_reservation_to_booking(UUID, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION cancel_slot_reservation(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION cleanup_expired_reservations() TO service_role;

-- =====================================================
-- PART 8: INITIALIZE VERSION FOR EXISTING SESSIONS
-- =====================================================

-- Set version = 1 for any existing sessions that might have NULL
UPDATE activity_sessions 
SET version = 1 
WHERE version IS NULL;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration 070_add_optimistic_locking completed successfully';
  RAISE NOTICE 'Changes:';
  RAISE NOTICE '  - Added version column to activity_sessions';
  RAISE NOTICE '  - Created reserve_session_capacity() function';
  RAISE NOTICE '  - Created release_session_capacity() function';
  RAISE NOTICE '  - Created slot_reservations table';
  RAISE NOTICE '  - Created create_slot_reservation() function';
  RAISE NOTICE '  - Created convert_reservation_to_booking() function';
  RAISE NOTICE '  - Created cancel_slot_reservation() function';
  RAISE NOTICE '  - Created cleanup_expired_reservations() function';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Deploy cleanup-reservations edge function (cron every 1 min)';
  RAISE NOTICE '  2. Update booking service to use create_slot_reservation()';
  RAISE NOTICE '  3. Update checkout webhook to use convert_reservation_to_booking()';
END $$;
