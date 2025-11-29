-- Capacity Management Tables
-- Created: 2025-11-30
-- Purpose: Support session blocking and capacity overrides

-- Blocked Sessions Table
CREATE TABLE IF NOT EXISTS blocked_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  session_id UUID REFERENCES activity_sessions(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_full_day BOOLEAN DEFAULT false,
  reason TEXT NOT NULL CHECK (reason IN ('maintenance', 'private_event', 'staff_unavailable', 'weather', 'holiday', 'other')),
  notes TEXT,
  blocked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Capacity Overrides Table
CREATE TABLE IF NOT EXISTS capacity_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  max_capacity INTEGER NOT NULL,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, date, start_time)
);

-- Add is_blocked column to activity_sessions if not exists
ALTER TABLE activity_sessions 
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

ALTER TABLE activity_sessions 
ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocked_sessions_activity_date 
ON blocked_sessions(activity_id, date);

CREATE INDEX IF NOT EXISTS idx_capacity_overrides_activity_date 
ON capacity_overrides(activity_id, date);

-- RLS Policies
ALTER TABLE blocked_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE capacity_overrides ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to manage blocked sessions
CREATE POLICY "Authenticated users can manage blocked sessions"
ON blocked_sessions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to manage capacity overrides
CREATE POLICY "Authenticated users can manage capacity overrides"
ON capacity_overrides FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Comment
COMMENT ON TABLE blocked_sessions IS 'Stores blocked/unavailable time slots for activities';
COMMENT ON TABLE capacity_overrides IS 'Stores temporary capacity overrides for specific dates/times';
