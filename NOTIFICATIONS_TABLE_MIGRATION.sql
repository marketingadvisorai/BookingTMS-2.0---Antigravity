-- Create notifications table with 30-day auto-deletion
-- This table stores user notifications with automatic cleanup

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('booking', 'payment', 'cancellation', 'customer', 'alert', 'message', 'system', 'staff', 'refund')),
  priority TEXT NOT NULL CHECK (priority IN ('urgent', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications for users
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically delete notifications older than 30 days
CREATE OR REPLACE FUNCTION delete_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Create a scheduled job to run the cleanup function daily
-- Note: This requires pg_cron extension to be enabled
-- If pg_cron is not available, you can use Supabase Edge Functions with cron triggers

-- Alternative: Create a trigger-based approach for automatic deletion
-- This trigger checks on every insert if there are old notifications to delete
CREATE OR REPLACE FUNCTION trigger_delete_old_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete notifications older than 30 days
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_delete_old_notifications
  AFTER INSERT ON notifications
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_delete_old_notifications();

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO service_role;

COMMENT ON TABLE notifications IS 'Stores user notifications with automatic 30-day cleanup';
COMMENT ON COLUMN notifications.id IS 'Unique notification identifier';
COMMENT ON COLUMN notifications.user_id IS 'User who receives the notification';
COMMENT ON COLUMN notifications.organization_id IS 'Organization context for the notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification (booking, payment, etc.)';
COMMENT ON COLUMN notifications.priority IS 'Priority level (urgent, high, medium, low)';
COMMENT ON COLUMN notifications.read IS 'Whether the notification has been read';
COMMENT ON COLUMN notifications.metadata IS 'Additional data related to the notification';
COMMENT ON COLUMN notifications.created_at IS 'When the notification was created';
