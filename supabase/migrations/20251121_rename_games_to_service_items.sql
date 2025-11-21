-- Migration: Rename games to activities and add session management
-- Date: 2025-11-21
-- Description: Modernize database schema for multi-tenant booking system

-- 1. Rename games table to activities
ALTER TABLE IF EXISTS games RENAME TO activities;

-- 2. Add Timezone to Venues
ALTER TABLE venues 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- 3. Create activity_sessions table
CREATE TABLE IF NOT EXISTS activity_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    capacity_total INTEGER NOT NULL,
    capacity_remaining INTEGER NOT NULL,
    price_at_generation DECIMAL(10, 2),
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_sessions_activity_start ON activity_sessions(activity_id, start_time);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_venue_start ON activity_sessions(venue_id, start_time);
CREATE INDEX IF NOT EXISTS idx_activity_sessions_org ON activity_sessions(organization_id);

-- 4. Create activity_pricing table
CREATE TABLE IF NOT EXISTS activity_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
    base_price DECIMAL(10, 2) NOT NULL,
    peak_price DECIMAL(10, 2),
    weekend_price DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(activity_id, day_of_week)
);

-- 5. Update Bookings Table
-- Rename game_id to activity_id
ALTER TABLE bookings 
RENAME COLUMN game_id TO activity_id;

-- Add session_id FK
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES activity_sessions(id);

-- Add total_price
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2);

-- 6. RLS Policies (Tenant Isolation)

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_pricing ENABLE ROW LEVEL SECURITY;

-- Drop old policies on activities (formerly games) if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON activities;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON activities;
DROP POLICY IF EXISTS "Enable update for users based on email" ON activities;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON activities;

-- Create new strict policies
CREATE POLICY "Tenant Isolation: Activities" ON activities
USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Tenant Isolation: Sessions" ON activity_sessions
USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
));

CREATE POLICY "Tenant Isolation: Pricing" ON activity_pricing
USING (activity_id IN (
    SELECT id FROM activities WHERE organization_id IN (
        SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
));

-- 7. Concurrency Control RPC
CREATE OR REPLACE FUNCTION create_booking_transaction(
    p_session_id UUID,
    p_user_id UUID,
    p_organization_id UUID,
    p_quantity INTEGER
)
RETURNS UUID AS $$
DECLARE
    v_booking_id UUID;
    v_capacity_remaining INTEGER;
    v_price DECIMAL(10, 2);
BEGIN
    -- Lock the session row
    SELECT capacity_remaining, price_at_generation 
    INTO v_capacity_remaining, v_price
    FROM activity_sessions
    WHERE id = p_session_id
    FOR UPDATE;

    -- Check capacity
    IF v_capacity_remaining < p_quantity THEN
        RAISE EXCEPTION 'Insufficient capacity';
    END IF;

    -- Decrement capacity
    UPDATE activity_sessions
    SET capacity_remaining = capacity_remaining - p_quantity
    WHERE id = p_session_id;

    -- Insert booking
    INSERT INTO bookings (
        session_id,
        activity_id,
        user_id,
        organization_id,
        quantity,
        status,
        total_price
    )
    SELECT 
        p_session_id,
        activity_id,
        p_user_id,
        p_organization_id,
        p_quantity,
        'confirmed',
        COALESCE(v_price, 0) * p_quantity
    FROM activity_sessions
    WHERE id = p_session_id
    RETURNING id INTO v_booking_id;

    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION create_booking_transaction(UUID, UUID, UUID, INTEGER) TO authenticated;
