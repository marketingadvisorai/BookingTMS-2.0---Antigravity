/**
 * Media Module Types
 * @module media/types
 */

// =====================================================
// CONSTANTS
// =====================================================

export const STORAGE_LIMITS = {
  /** Maximum total storage per user in bytes (150 MB) */
  MAX_USER_STORAGE: 150 * 1024 * 1024, // 157,286,400 bytes
  
  /** Maximum image file size in bytes (5 MB) */
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5,242,880 bytes
  
  /** Maximum video file size in bytes (15 MB) */
  MAX_VIDEO_SIZE: 15 * 1024 * 1024, // 15,728,640 bytes
  
  /** Maximum document file size in bytes (10 MB) */
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10,485,760 bytes
} as const;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

// =====================================================
// ENUMS
// =====================================================

export type FileType = 'image' | 'video' | 'document';

export type MediaSource = 'upload' | 'google_drive' | 'external_link' | 'activity';

export type DriveProvider = 'google_drive' | 'dropbox' | 'onedrive';

export type EntityType = 
  | 'activity' 
  | 'venue' 
  | 'organization' 
  | 'user_profile' 
  | 'promotion' 
  | 'embed_config' 
  | 'email_template';

export type UsageContext = 
  | 'cover_image' 
  | 'gallery' 
  | 'thumbnail' 
  | 'logo' 
  | 'banner' 
  | 'background';

// =====================================================
// DATABASE ENTITIES
// =====================================================

export interface MediaFile {
  id: string;
  organization_id: string;
  uploaded_by: string | null;
  
  // File Information
  name: string;
  original_name: string;
  file_type: FileType;
  mime_type: string;
  file_extension: string | null;
  
  // Storage Details
  storage_path: string | null;
  storage_url: string;
  thumbnail_url: string | null;
  
  // Size & Dimensions
  file_size: number;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  
  // Source Type
  source: MediaSource;
  external_id: string | null;
  
  // Metadata
  alt_text: string | null;
  description: string | null;
  tags: string[];
  
  // Usage Tracking
  usage_count: number;
  last_used_at: string | null;
  
  // Status
  is_active: boolean;
  is_public: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface UserStorageUsage {
  id: string;
  user_id: string;
  organization_id: string;
  storage_limit: number;
  storage_used: number;
  total_files: number;
  image_count: number;
  video_count: number;
  document_count: number;
  updated_at: string;
}

export interface ConnectedDrive {
  id: string;
  user_id: string;
  organization_id: string;
  provider: DriveProvider;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  account_email: string | null;
  account_name: string | null;
  storage_quota: number | null;
  storage_used: number | null;
  is_connected: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaUsage {
  id: string;
  media_file_id: string;
  entity_type: EntityType;
  entity_id: string;
  usage_context: UsageContext | null;
  created_at: string;
}

// =====================================================
// INPUT TYPES
// =====================================================

export interface UploadMediaInput {
  file: File;
  organizationId: string;
  name?: string;
  altText?: string;
  description?: string;
  tags?: string[];
  source?: MediaSource;
  entityType?: EntityType;
  entityId?: string;
  usageContext?: UsageContext;
}

export interface AddExternalMediaInput {
  organizationId: string;
  url: string;
  name: string;
  fileType: FileType;
  source: 'google_drive' | 'external_link';
  externalId?: string;
  altText?: string;
  description?: string;
  tags?: string[];
  thumbnailUrl?: string;
  fileSize?: number;
}

export interface UpdateMediaInput {
  name?: string;
  altText?: string;
  description?: string;
  tags?: string[];
  is_active?: boolean;
  is_public?: boolean;
}

export interface MediaFilters {
  fileType?: FileType;
  source?: MediaSource;
  search?: string;
  tags?: string[];
  isActive?: boolean;
}

// =====================================================
// RESPONSE TYPES
// =====================================================

export interface UploadResult {
  success: boolean;
  mediaFile?: MediaFile;
  error?: string;
}

export interface StorageStats {
  used: number;
  limit: number;
  percentage: number;
  remaining: number;
  totalFiles: number;
  imageCount: number;
  videoCount: number;
  documentCount: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  fileType?: FileType;
}

// =====================================================
// GOOGLE DRIVE TYPES
// =====================================================

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export interface GoogleDriveAuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  email?: string;
  error?: string;
}
