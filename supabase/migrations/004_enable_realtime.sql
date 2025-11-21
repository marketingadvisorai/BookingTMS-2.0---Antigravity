-- Enable Realtime for activity_sessions table
-- This allows the frontend to subscribe to changes in session capacity

BEGIN;

  -- Add table to supabase_realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE activity_sessions;

COMMIT;
