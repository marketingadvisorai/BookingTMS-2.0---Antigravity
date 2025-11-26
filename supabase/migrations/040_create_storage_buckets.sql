-- Migration: Create Storage Buckets for Images
-- Date: 2025-11-25
-- Purpose: Set up Supabase storage buckets for activity and venue images

-- Create activity-images bucket (public for widget display)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'activity-images',
  'activity-images',
  true, -- Public bucket for widget display
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create venue-images bucket (public for widget display)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'venue-images',
  'venue-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage Policies for activity-images bucket

-- Policy: Public read access for activity images
CREATE POLICY "Public read access for activity images"
ON storage.objects FOR SELECT
USING (bucket_id = 'activity-images');

-- Policy: Authenticated users can upload activity images
CREATE POLICY "Authenticated users can upload activity images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'activity-images');

-- Policy: Users can update their own activity images
CREATE POLICY "Users can update own activity images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'activity-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Users can delete their own activity images
CREATE POLICY "Users can delete own activity images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'activity-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage Policies for venue-images bucket

-- Policy: Public read access for venue images
CREATE POLICY "Public read access for venue images"
ON storage.objects FOR SELECT
USING (bucket_id = 'venue-images');

-- Policy: Authenticated users can upload venue images
CREATE POLICY "Authenticated users can upload venue images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'venue-images');

-- Policy: Users can update their own venue images
CREATE POLICY "Users can update own venue images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'venue-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Users can delete their own venue images
CREATE POLICY "Users can delete own venue images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'venue-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add comment
COMMENT ON TABLE storage.buckets IS 'Storage buckets for activity and venue images. Both are public for widget display.';
