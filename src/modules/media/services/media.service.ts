/**
 * Media Service
 * @module media/services/media
 * 
 * Handles file uploads, storage management, and media operations
 */

import { supabase } from '../../../lib/supabase';
import {
  MediaFile,
  UserStorageUsage,
  UploadMediaInput,
  AddExternalMediaInput,
  UpdateMediaInput,
  MediaFilters,
  UploadResult,
  StorageStats,
  ValidationResult,
  STORAGE_LIMITS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  FileType,
} from '../types';

// =====================================================
// STORAGE BUCKET NAME
// =====================================================
const BUCKET_NAME = 'media';

// =====================================================
// MEDIA SERVICE CLASS
// =====================================================

class MediaService {
  // =====================================================
  // VALIDATION
  // =====================================================

  /**
   * Validate file type and size
   */
  validateFile(file: File): ValidationResult {
    const mimeType = file.type;
    
    // Determine file type
    let fileType: FileType | undefined;
    
    if ((ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType)) {
      fileType = 'image';
      if (file.size > STORAGE_LIMITS.MAX_IMAGE_SIZE) {
        return {
          valid: false,
          error: `Image exceeds maximum size of ${this.formatBytes(STORAGE_LIMITS.MAX_IMAGE_SIZE)}`,
        };
      }
    } else if ((ALLOWED_VIDEO_TYPES as readonly string[]).includes(mimeType)) {
      fileType = 'video';
      if (file.size > STORAGE_LIMITS.MAX_VIDEO_SIZE) {
        return {
          valid: false,
          error: `Video exceeds maximum size of ${this.formatBytes(STORAGE_LIMITS.MAX_VIDEO_SIZE)}`,
        };
      }
    } else if ((ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(mimeType)) {
      fileType = 'document';
      if (file.size > STORAGE_LIMITS.MAX_DOCUMENT_SIZE) {
        return {
          valid: false,
          error: `Document exceeds maximum size of ${this.formatBytes(STORAGE_LIMITS.MAX_DOCUMENT_SIZE)}`,
        };
      }
    } else {
      return {
        valid: false,
        error: `File type "${mimeType}" is not supported`,
      };
    }
    
    return { valid: true, fileType };
  }

  /**
   * Check if user has storage space available
   */
  async checkStorageLimit(
    userId: string,
    organizationId: string,
    fileSize: number
  ): Promise<{ allowed: boolean; error?: string; stats?: StorageStats }> {
    const stats = await this.getStorageStats(userId, organizationId);
    
    if (stats.used + fileSize > stats.limit) {
      return {
        allowed: false,
        error: `Storage limit exceeded. You have ${this.formatBytes(stats.remaining)} remaining.`,
        stats,
      };
    }
    
    return { allowed: true, stats };
  }

  // =====================================================
  // UPLOAD
  // =====================================================

  /**
   * Upload a file to Supabase storage
   */
  async upload(input: UploadMediaInput): Promise<UploadResult> {
    try {
      const { file, organizationId, name, altText, description, tags, source = 'upload' } = input;
      
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      // Check storage limit
      const limitCheck = await this.checkStorageLimit(user.id, organizationId, file.size);
      if (!limitCheck.allowed) {
        return { success: false, error: limitCheck.error };
      }
      
      // Generate unique file path
      const fileExt = file.name.split('.').pop() || '';
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const storagePath = `${organizationId}/${user.id}/${uniqueName}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) {
        console.error('[MediaService] Upload error:', uploadError);
        return { success: false, error: uploadError.message };
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath);
      
      // Get image dimensions if applicable
      let width: number | null = null;
      let height: number | null = null;
      
      if (validation.fileType === 'image') {
        const dimensions = await this.getImageDimensions(file);
        width = dimensions.width;
        height = dimensions.height;
      }
      
      // Create media file record
      const { data: mediaFile, error: dbError } = await supabase
        .from('media_files')
        .insert({
          organization_id: organizationId,
          uploaded_by: user.id,
          name: name || file.name.replace(/\.[^/.]+$/, ''),
          original_name: file.name,
          file_type: validation.fileType,
          mime_type: file.type,
          file_extension: fileExt,
          storage_path: storagePath,
          storage_url: publicUrl,
          file_size: file.size,
          width,
          height,
          source,
          alt_text: altText || null,
          description: description || null,
          tags: tags || [],
        } as never)
        .select()
        .single();
      
      if (dbError) {
        // Rollback: delete uploaded file
        await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
        console.error('[MediaService] DB error:', dbError);
        return { success: false, error: dbError.message };
      }
      
      // Link to entity if specified
      if (input.entityType && input.entityId) {
        await this.linkToEntity(
          (mediaFile as MediaFile).id,
          input.entityType,
          input.entityId,
          input.usageContext
        );
      }
      
      return { success: true, mediaFile };
    } catch (error: any) {
      console.error('[MediaService] Upload exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Add external media (Google Drive link, external URL)
   */
  async addExternal(input: AddExternalMediaInput): Promise<UploadResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }
      
      const { data: mediaFile, error } = await supabase
        .from('media_files')
        .insert({
          organization_id: input.organizationId,
          uploaded_by: user.id,
          name: input.name,
          original_name: input.name,
          file_type: input.fileType,
          mime_type: this.getMimeTypeFromFileType(input.fileType),
          storage_url: input.url,
          thumbnail_url: input.thumbnailUrl,
          file_size: input.fileSize || 0,
          source: input.source,
          external_id: input.externalId,
          alt_text: input.altText,
          description: input.description,
          tags: input.tags || [],
        } as never)
        .select()
        .single();
      
      if (error) {
        console.error('[MediaService] Add external error:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true, mediaFile };
    } catch (error: any) {
      console.error('[MediaService] Add external exception:', error);
      return { success: false, error: error.message };
    }
  }

  // =====================================================
  // CRUD OPERATIONS
  // =====================================================

  /**
   * Get all media files for an organization
   */
  async getByOrganization(
    organizationId: string,
    filters?: MediaFilters
  ): Promise<MediaFile[]> {
    let query = supabase
      .from('media_files')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
    
    if (filters?.fileType) {
      query = query.eq('file_type', filters.fileType);
    }
    if (filters?.source) {
      query = query.eq('source', filters.source);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('[MediaService] Get by org error:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Get a single media file by ID
   */
  async getById(id: string): Promise<MediaFile | null> {
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  }

  /**
   * Update a media file
   */
  async update(id: string, input: UpdateMediaInput): Promise<MediaFile> {
    const { data, error } = await supabase
      .from('media_files')
      .update(input as never)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as MediaFile;
  }

  /**
   * Delete a media file
   */
  async delete(id: string): Promise<void> {
    // Get file info first
    const file = await this.getById(id);
    if (!file) return;
    
    // Delete from storage if it's an uploaded file
    if (file.storage_path && (file.source === 'upload' || file.source === 'activity')) {
      await supabase.storage.from(BUCKET_NAME).remove([file.storage_path]);
    }
    
    // Delete from database
    const { error } = await supabase
      .from('media_files')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  /**
   * Delete multiple media files
   */
  async deleteMultiple(ids: string[]): Promise<void> {
    // Get files info
    const { data: files } = await supabase
      .from('media_files')
      .select('id, storage_path, source')
      .in('id', ids);
    
    if (files && files.length > 0) {
      // Delete from storage
      const typedFiles = files as Array<{ id: string; storage_path: string | null; source: string }>;
      const storagePaths = typedFiles
        .filter(f => f.storage_path && (f.source === 'upload' || f.source === 'activity'))
        .map(f => f.storage_path as string);
      
      if (storagePaths.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(storagePaths);
      }
    }
    
    // Delete from database
    const { error } = await supabase
      .from('media_files')
      .delete()
      .in('id', ids);
    
    if (error) throw error;
  }

  // =====================================================
  // MEDIA USAGE
  // =====================================================

  /**
   * Link media file to an entity
   */
  async linkToEntity(
    mediaFileId: string,
    entityType: string,
    entityId: string,
    usageContext?: string
  ): Promise<void> {
    const { error } = await supabase
      .from('media_usage')
      .upsert({
        media_file_id: mediaFileId,
        entity_type: entityType,
        entity_id: entityId,
        usage_context: usageContext || null,
      } as never, {
        onConflict: 'media_file_id,entity_type,entity_id,usage_context',
      });
    
    if (error) throw error;
  }

  /**
   * Unlink media file from an entity
   */
  async unlinkFromEntity(
    mediaFileId: string,
    entityType: string,
    entityId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('media_usage')
      .delete()
      .eq('media_file_id', mediaFileId)
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);
    
    if (error) throw error;
  }

  /**
   * Get media files linked to an entity
   */
  async getByEntity(entityType: string, entityId: string): Promise<MediaFile[]> {
    const { data, error } = await supabase
      .from('media_usage')
      .select('media_file_id, media_files(*)')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId);
    
    if (error) throw error;
    
    return (data || [])
      .map(d => (d as { media_files: MediaFile }).media_files)
      .filter(Boolean);
  }

  // =====================================================
  // STORAGE STATS
  // =====================================================

  /**
   * Get storage statistics for a user
   */
  async getStorageStats(userId: string, organizationId: string): Promise<StorageStats> {
    const { data, error } = await supabase
      .from('user_storage_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('[MediaService] Get storage stats error:', error);
    }
    
    const usage = data as UserStorageUsage | null;
    
    const used = usage?.storage_used || 0;
    const limit = usage?.storage_limit || STORAGE_LIMITS.MAX_USER_STORAGE;
    
    return {
      used,
      limit,
      percentage: (used / limit) * 100,
      remaining: Math.max(0, limit - used),
      totalFiles: usage?.total_files || 0,
      imageCount: usage?.image_count || 0,
      videoCount: usage?.video_count || 0,
      documentCount: usage?.document_count || 0,
    };
  }

  // =====================================================
  // UTILITIES
  // =====================================================

  /**
   * Format bytes to human readable string
   */
  formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Get image dimensions
   */
  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get mime type from file type
   */
  private getMimeTypeFromFileType(fileType: string): string {
    switch (fileType) {
      case 'image': return 'image/jpeg';
      case 'video': return 'video/mp4';
      case 'document': return 'application/pdf';
      default: return 'application/octet-stream';
    }
  }

  /**
   * Generate thumbnail URL for videos (placeholder)
   */
  async generateThumbnail(file: File): Promise<string | null> {
    if (!file.type.startsWith('video/')) return null;
    
    // For now, return null - could integrate with a video thumbnail service
    return null;
  }
}

// Export singleton instance
export const mediaService = new MediaService();
