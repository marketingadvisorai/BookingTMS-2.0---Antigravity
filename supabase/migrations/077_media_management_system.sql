-- =====================================================
-- Migration: 077_media_management_system.sql
-- Description: Media management with storage limits and Google Drive integration
-- Created: 2025-12-04
-- 
-- Storage Limits:
-- - 150 MB total per user
-- - Images: max 5 MB each
-- - Videos: max 15 MB each
-- =====================================================

-- =====================================================
-- STORAGE LIMITS CONSTANTS (in bytes)
-- =====================================================
-- 150 MB = 157,286,400 bytes
-- 5 MB = 5,242,880 bytes
-- 15 MB = 15,728,640 bytes

-- =====================================================
-- MEDIA FILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- File Information
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  mime_type VARCHAR(100) NOT NULL,
  file_extension VARCHAR(20),
  
  -- Storage Details
  storage_path TEXT, -- Supabase storage path (null if external)
  storage_url TEXT NOT NULL, -- Public URL or external link
  thumbnail_url TEXT, -- Thumbnail for videos/large images
  
  -- Size & Dimensions
  file_size BIGINT NOT NULL DEFAULT 0, -- Size in bytes
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER, -- For videos
  
  -- Source Type
  source VARCHAR(50) NOT NULL DEFAULT 'upload' CHECK (source IN (
    'upload',        -- Direct upload to Supabase
    'google_drive',  -- Linked from Google Drive
    'external_link', -- External URL
    'activity'       -- Uploaded via activity creation
  )),
  external_id TEXT, -- External service file ID (e.g., Google Drive file ID)
  
  -- Metadata
  alt_text TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Usage Tracking
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_media_files_org ON media_files(organization_id);
CREATE INDEX idx_media_files_user ON media_files(uploaded_by);
CREATE INDEX idx_media_files_type ON media_files(file_type);
CREATE INDEX idx_media_files_source ON media_files(source);
CREATE INDEX idx_media_files_active ON media_files(is_active) WHERE is_active = true;

-- =====================================================
-- USER STORAGE USAGE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_storage_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Storage Limits (in bytes)
  storage_limit BIGINT NOT NULL DEFAULT 157286400, -- 150 MB default
  storage_used BIGINT NOT NULL DEFAULT 0,
  
  -- File Counts
  total_files INTEGER NOT NULL DEFAULT 0,
  image_count INTEGER NOT NULL DEFAULT 0,
  video_count INTEGER NOT NULL DEFAULT 0,
  document_count INTEGER NOT NULL DEFAULT 0,
  
  -- Last Updated
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, organization_id)
);

-- Index for quick lookups
CREATE INDEX idx_user_storage_user ON user_storage_usage(user_id);
CREATE INDEX idx_user_storage_org ON user_storage_usage(organization_id);

-- =====================================================
-- CONNECTED DRIVES TABLE (Google Drive, etc.)
-- =====================================================
CREATE TABLE IF NOT EXISTS connected_drives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Drive Provider
  provider VARCHAR(50) NOT NULL CHECK (provider IN ('google_drive', 'dropbox', 'onedrive')),
  
  -- OAuth Tokens (encrypted in practice)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Drive Info
  account_email VARCHAR(255),
  account_name VARCHAR(255),
  storage_quota BIGINT, -- Total quota in bytes
  storage_used BIGINT,  -- Used storage in bytes
  
  -- Status
  is_connected BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, organization_id, provider)
);

-- Index
CREATE INDEX idx_connected_drives_user ON connected_drives(user_id);
CREATE INDEX idx_connected_drives_org ON connected_drives(organization_id);

-- =====================================================
-- MEDIA USAGE TRACKING (which entities use which media)
-- =====================================================
CREATE TABLE IF NOT EXISTS media_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_file_id UUID NOT NULL REFERENCES media_files(id) ON DELETE CASCADE,
  
  -- Entity Reference
  entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN (
    'activity', 'venue', 'organization', 'user_profile', 
    'promotion', 'embed_config', 'email_template'
  )),
  entity_id UUID NOT NULL,
  
  -- Usage Context
  usage_context VARCHAR(50), -- e.g., 'cover_image', 'gallery', 'thumbnail'
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(media_file_id, entity_type, entity_id, usage_context)
);

-- Index
CREATE INDEX idx_media_usage_file ON media_usage(media_file_id);
CREATE INDEX idx_media_usage_entity ON media_usage(entity_type, entity_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update storage usage when file is added
CREATE OR REPLACE FUNCTION update_storage_usage_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only count files that are uploaded (not external links)
  IF NEW.source = 'upload' OR NEW.source = 'activity' THEN
    INSERT INTO user_storage_usage (user_id, organization_id, storage_used, total_files, image_count, video_count, document_count)
    VALUES (
      NEW.uploaded_by,
      NEW.organization_id,
      NEW.file_size,
      1,
      CASE WHEN NEW.file_type = 'image' THEN 1 ELSE 0 END,
      CASE WHEN NEW.file_type = 'video' THEN 1 ELSE 0 END,
      CASE WHEN NEW.file_type = 'document' THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, organization_id) DO UPDATE SET
      storage_used = user_storage_usage.storage_used + NEW.file_size,
      total_files = user_storage_usage.total_files + 1,
      image_count = user_storage_usage.image_count + CASE WHEN NEW.file_type = 'image' THEN 1 ELSE 0 END,
      video_count = user_storage_usage.video_count + CASE WHEN NEW.file_type = 'video' THEN 1 ELSE 0 END,
      document_count = user_storage_usage.document_count + CASE WHEN NEW.file_type = 'document' THEN 1 ELSE 0 END,
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update storage usage when file is deleted
CREATE OR REPLACE FUNCTION update_storage_usage_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.source = 'upload' OR OLD.source = 'activity' THEN
    UPDATE user_storage_usage SET
      storage_used = GREATEST(0, storage_used - OLD.file_size),
      total_files = GREATEST(0, total_files - 1),
      image_count = GREATEST(0, image_count - CASE WHEN OLD.file_type = 'image' THEN 1 ELSE 0 END),
      video_count = GREATEST(0, video_count - CASE WHEN OLD.file_type = 'video' THEN 1 ELSE 0 END),
      document_count = GREATEST(0, document_count - CASE WHEN OLD.file_type = 'document' THEN 1 ELSE 0 END),
      updated_at = now()
    WHERE user_id = OLD.uploaded_by AND organization_id = OLD.organization_id;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to check storage limit before insert
CREATE OR REPLACE FUNCTION check_storage_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_usage BIGINT;
  user_limit BIGINT;
  max_image_size BIGINT := 5242880;  -- 5 MB
  max_video_size BIGINT := 15728640; -- 15 MB
BEGIN
  -- Only check for uploads (not external links)
  IF NEW.source = 'upload' OR NEW.source = 'activity' THEN
    -- Check individual file size limits
    IF NEW.file_type = 'image' AND NEW.file_size > max_image_size THEN
      RAISE EXCEPTION 'Image file exceeds maximum size of 5 MB';
    END IF;
    
    IF NEW.file_type = 'video' AND NEW.file_size > max_video_size THEN
      RAISE EXCEPTION 'Video file exceeds maximum size of 15 MB';
    END IF;
    
    -- Check total storage limit
    SELECT COALESCE(storage_used, 0), COALESCE(storage_limit, 157286400)
    INTO current_usage, user_limit
    FROM user_storage_usage
    WHERE user_id = NEW.uploaded_by AND organization_id = NEW.organization_id;
    
    -- If no record exists, assume 0 usage and default limit
    IF current_usage IS NULL THEN
      current_usage := 0;
      user_limit := 157286400; -- 150 MB
    END IF;
    
    IF (current_usage + NEW.file_size) > user_limit THEN
      RAISE EXCEPTION 'Storage limit exceeded. You have used % of % bytes', current_usage, user_limit;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update media usage count
CREATE OR REPLACE FUNCTION update_media_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE media_files SET
      usage_count = usage_count + 1,
      last_used_at = now()
    WHERE id = NEW.media_file_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE media_files SET
      usage_count = GREATEST(0, usage_count - 1)
    WHERE id = OLD.media_file_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_media_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Check storage limit before insert
CREATE TRIGGER trigger_check_storage_limit
  BEFORE INSERT ON media_files
  FOR EACH ROW
  EXECUTE FUNCTION check_storage_limit();

-- Update storage usage on insert
CREATE TRIGGER trigger_update_storage_on_insert
  AFTER INSERT ON media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_usage_on_insert();

-- Update storage usage on delete
CREATE TRIGGER trigger_update_storage_on_delete
  AFTER DELETE ON media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_storage_usage_on_delete();

-- Update usage count
CREATE TRIGGER trigger_update_media_usage_count
  AFTER INSERT OR DELETE ON media_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_media_usage_count();

-- Auto-update updated_at
CREATE TRIGGER trigger_media_files_updated_at
  BEFORE UPDATE ON media_files
  FOR EACH ROW
  EXECUTE FUNCTION update_media_files_updated_at();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_storage_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_usage ENABLE ROW LEVEL SECURITY;

-- Media files: Users can view their organization's media
CREATE POLICY "media_files_select" ON media_files
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
    OR is_public = true
  );

-- Media files: Users can insert for their organization
CREATE POLICY "media_files_insert" ON media_files
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Media files: Users can update their own uploads or org admins can update any
CREATE POLICY "media_files_update" ON media_files
  FOR UPDATE USING (
    uploaded_by = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'admin', 'system-admin')
    )
  );

-- Media files: Users can delete their own uploads or org admins can delete any
CREATE POLICY "media_files_delete" ON media_files
  FOR DELETE USING (
    uploaded_by = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('owner', 'admin', 'system-admin')
    )
  );

-- Storage usage: Users can view their own usage
CREATE POLICY "user_storage_usage_select" ON user_storage_usage
  FOR SELECT USING (user_id = auth.uid());

-- Connected drives: Users can manage their own connections
CREATE POLICY "connected_drives_all" ON connected_drives
  FOR ALL USING (user_id = auth.uid());

-- Media usage: Users can view/manage based on media file access
CREATE POLICY "media_usage_select" ON media_usage
  FOR SELECT USING (
    media_file_id IN (
      SELECT id FROM media_files WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "media_usage_insert" ON media_usage
  FOR INSERT WITH CHECK (
    media_file_id IN (
      SELECT id FROM media_files WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "media_usage_delete" ON media_usage
  FOR DELETE USING (
    media_file_id IN (
      SELECT id FROM media_files WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- =====================================================
-- REAL-TIME
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE media_files;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE media_files IS 'Media files uploaded by users with storage limits';
COMMENT ON TABLE user_storage_usage IS 'Tracks storage usage per user per organization';
COMMENT ON TABLE connected_drives IS 'External drive connections (Google Drive, etc.)';
COMMENT ON TABLE media_usage IS 'Tracks which entities use which media files';
COMMENT ON COLUMN media_files.storage_path IS 'Path in Supabase storage, null for external files';
COMMENT ON COLUMN media_files.source IS 'Where the file came from: upload, google_drive, external_link, activity';
