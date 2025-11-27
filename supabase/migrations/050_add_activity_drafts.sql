-- Migration: Add Activity Drafts Table
-- Purpose: Save incomplete activities as drafts so users can continue later
-- Date: 2025-11-27

-- Create activity_drafts table
CREATE TABLE IF NOT EXISTS activity_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  
  -- Draft metadata
  name VARCHAR(255),
  current_step INT DEFAULT 1,
  is_complete BOOLEAN DEFAULT false,
  
  -- Store the entire wizard state as JSONB
  draft_data JSONB NOT NULL DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days', -- Auto-expire after 30 days
  
  -- Constraints
  CONSTRAINT valid_step CHECK (current_step >= 1 AND current_step <= 8)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_drafts_user ON activity_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_drafts_org ON activity_drafts(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_drafts_updated ON activity_drafts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_drafts_expires ON activity_drafts(expires_at);

-- Enable RLS
ALTER TABLE activity_drafts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own drafts
CREATE POLICY "Users can view own drafts" ON activity_drafts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own drafts" ON activity_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own drafts" ON activity_drafts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own drafts" ON activity_drafts
  FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_activity_draft_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_activity_draft_timestamp ON activity_drafts;
CREATE TRIGGER update_activity_draft_timestamp
  BEFORE UPDATE ON activity_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_draft_timestamp();

-- Function to clean up expired drafts (run periodically via cron)
CREATE OR REPLACE FUNCTION cleanup_expired_drafts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM activity_drafts WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add to realtime for instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE activity_drafts;

COMMENT ON TABLE activity_drafts IS 'Stores incomplete activity wizard sessions for users to continue later';
COMMENT ON COLUMN activity_drafts.draft_data IS 'Full ActivityData object from wizard state';
COMMENT ON COLUMN activity_drafts.current_step IS 'Last completed step (1-8)';
