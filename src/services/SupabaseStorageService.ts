/**
 * Supabase Storage Service
 * Enterprise-grade service for managing file uploads to Supabase Storage
 * Replaces base64 image storage with proper CDN-backed storage
 */

import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export type StorageBucket = 'venue-logos' | 'game-images' | 'user-uploads' | 'private-documents' | 'profile-photos';

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

export interface UploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  folder?: string;
  upsert?: boolean;
}

/**
 * Service for managing Supabase Storage operations
 */
export class SupabaseStorageService {
  /**
   * Upload an image file to Supabase Storage
   * Automatically optimizes and resizes large images
   */
  static async uploadImage(
    file: File,
    bucket: StorageBucket,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.85,
      folder = '',
      upsert = false
    } = options;

    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Check file size before processing (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Image size must be less than 10MB');
      }

      // Optimize image if it's large
      let fileToUpload = file;
      if (file.size > 500 * 1024) { // Optimize if > 500KB
        fileToUpload = await this.optimizeImage(file, maxWidth, maxHeight, quality);
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${randomStr}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload to Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, fileToUpload, {
          cacheControl: '3600',
          upsert
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        path: filePath,
        size: fileToUpload.size
      };
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images at once
   */
  static async uploadMultipleImages(
    files: File[],
    bucket: StorageBucket,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadImage(file, bucket, options);
        results.push(result);
      } catch (error: any) {
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Some uploads failed:', errors);
    }

    return results;
  }

  /**
   * Delete a file from Storage
   */
  static async deleteFile(bucket: StorageBucket, path: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Storage delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error: any) {
      console.error('File deletion error:', error);
      throw error;
    }
  }

  /**
   * Delete multiple files at once
   */
  static async deleteMultipleFiles(bucket: StorageBucket, paths: string[]): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) {
        console.error('Storage bulk delete error:', error);
        throw new Error(`Bulk delete failed: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Bulk deletion error:', error);
      throw error;
    }
  }

  /**
   * Get public URL for a file (without uploading)
   */
  static getPublicUrl(bucket: StorageBucket, path: string): string {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return publicUrl;
  }

  /**
   * Check if a file exists in storage
   */
  static async fileExists(bucket: StorageBucket, path: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop()
        });

      return !error && data && data.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Optimize and resize an image before upload
   * Converts to JPEG and applies compression
   */
  private static async optimizeImage(
    file: File,
    maxWidth: number,
    maxHeight: number,
    quality: number
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const img = new Image();
        
        img.onload = () => {
          try {
            // Calculate new dimensions while maintaining aspect ratio
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
              const aspectRatio = width / height;
              
              if (width > height) {
                width = Math.min(width, maxWidth);
                height = Math.round(width / aspectRatio);
              } else {
                height = Math.min(height, maxHeight);
                width = Math.round(height * aspectRatio);
              }
            }

            // Create canvas for resizing
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }

            // Enable image smoothing for better quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Draw resized image
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Image optimization failed'));
                  return;
                }

                // Create optimized file
                const optimizedFile = new File(
                  [blob],
                  file.name.replace(/\.[^.]+$/, '.jpg'),
                  {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  }
                );

                resolve(optimizedFile);
              },
              'image/jpeg',
              quality
            );
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert a base64 data URL to a File object
   * Useful for migrating existing base64 images to Storage
   */
  static async base64ToFile(base64String: string, filename: string): Promise<File> {
    try {
      const response = await fetch(base64String);
      const blob = await response.blob();
      return new File([blob], filename, { type: blob.type });
    } catch (error) {
      throw new Error('Failed to convert base64 to file');
    }
  }

  /**
   * Migrate a base64 image to Storage
   * Returns the new Storage URL
   */
  static async migrateBase64ToStorage(
    base64String: string,
    bucket: StorageBucket,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    if (!base64String.startsWith('data:')) {
      throw new Error('Not a valid base64 data URL');
    }

    // Convert base64 to file
    const file = await this.base64ToFile(base64String, 'image.jpg');

    // Upload to storage
    return await this.uploadImage(file, bucket, options);
  }

  /**
   * Helper to clean up old storage files when updating
   */
  static async replaceFile(
    bucket: StorageBucket,
    oldPath: string | null,
    newFile: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    // Upload new file
    const result = await this.uploadImage(newFile, bucket, options);

    // Delete old file if it exists
    if (oldPath) {
      try {
        await this.deleteFile(bucket, oldPath);
      } catch (error) {
        console.warn('Failed to delete old file:', error);
        // Don't throw - new file was uploaded successfully
      }
    }

    return result;
  }
}

/**
 * Helper function to handle common upload patterns with toast notifications
 */
export async function uploadImageWithToast(
  file: File,
  bucket: StorageBucket,
  options: UploadOptions = {}
): Promise<UploadResult | null> {
  const toastId = `upload-${Date.now()}`;
  
  try {
    toast.loading('Uploading image...', { id: toastId });
    
    const result = await SupabaseStorageService.uploadImage(file, bucket, options);
    
    toast.success('Image uploaded successfully!', { id: toastId });
    
    return result;
  } catch (error: any) {
    toast.error(error.message || 'Failed to upload image', { id: toastId });
    return null;
  }
}

/**
 * Helper to determine which bucket to use based on context
 */
export function getBucketForContext(context: 'venue' | 'game' | 'profile' | 'document'): StorageBucket {
  switch (context) {
    case 'venue':
      return 'venue-logos';
    case 'game':
      return 'game-images';
    case 'profile':
      return 'profile-photos';
    case 'document':
      return 'private-documents';
    default:
      return 'user-uploads';
  }
}

export default SupabaseStorageService;
