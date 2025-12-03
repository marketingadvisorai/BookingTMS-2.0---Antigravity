/**
 * useMedia Hook
 * @module media/hooks/useMedia
 * 
 * React hook for media management with storage limits
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { mediaService } from '../services/media.service';
import {
  MediaFile,
  MediaFilters,
  UploadMediaInput,
  AddExternalMediaInput,
  UpdateMediaInput,
  StorageStats,
  STORAGE_LIMITS,
} from '../types';

interface UseMediaOptions {
  organizationId: string;
  autoFetch?: boolean;
  filters?: MediaFilters;
}

interface UseMediaReturn {
  // Data
  files: MediaFile[];
  storageStats: StorageStats | null;
  
  // State
  loading: boolean;
  uploading: boolean;
  error: Error | null;
  
  // Actions
  upload: (input: Omit<UploadMediaInput, 'organizationId'>) => Promise<MediaFile | null>;
  uploadMultiple: (files: File[]) => Promise<MediaFile[]>;
  addExternal: (input: Omit<AddExternalMediaInput, 'organizationId'>) => Promise<MediaFile | null>;
  update: (id: string, input: UpdateMediaInput) => Promise<MediaFile | null>;
  remove: (id: string) => Promise<boolean>;
  removeMultiple: (ids: string[]) => Promise<boolean>;
  refresh: () => Promise<void>;
  
  // Filters
  setFilters: (filters: MediaFilters) => void;
  
  // Utilities
  canUpload: (fileSize: number) => boolean;
  formatBytes: (bytes: number) => string;
}

export function useMedia(options: UseMediaOptions): UseMediaReturn {
  const { organizationId, autoFetch = true, filters: initialFilters } = options;
  
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<MediaFilters>(initialFilters || {});
  
  // Fetch media files
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await mediaService.getByOrganization(organizationId, filters);
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch media'));
    } finally {
      setLoading(false);
    }
  }, [organizationId, filters]);
  
  // Fetch storage stats
  const fetchStorageStats = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const stats = await mediaService.getStorageStats(user.id, organizationId);
        setStorageStats(stats);
      }
    } catch (err) {
      console.error('[useMedia] Failed to fetch storage stats:', err);
    }
  }, [organizationId]);
  
  // Initial fetch
  useEffect(() => {
    if (autoFetch && organizationId) {
      fetchFiles();
      fetchStorageStats();
    }
  }, [autoFetch, organizationId, fetchFiles, fetchStorageStats]);
  
  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('media_files_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'media_files',
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          fetchFiles();
          fetchStorageStats();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [organizationId, fetchFiles, fetchStorageStats]);
  
  // Upload single file
  const upload = useCallback(async (
    input: Omit<UploadMediaInput, 'organizationId'>
  ): Promise<MediaFile | null> => {
    setUploading(true);
    try {
      const result = await mediaService.upload({
        ...input,
        organizationId,
      });
      
      if (result.success && result.mediaFile) {
        await fetchFiles();
        await fetchStorageStats();
        return result.mediaFile;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Upload failed'));
      return null;
    } finally {
      setUploading(false);
    }
  }, [organizationId, fetchFiles, fetchStorageStats]);
  
  // Upload multiple files
  const uploadMultiple = useCallback(async (inputFiles: File[]): Promise<MediaFile[]> => {
    setUploading(true);
    const uploadedFiles: MediaFile[] = [];
    
    try {
      for (const file of inputFiles) {
        const result = await mediaService.upload({
          file,
          organizationId,
        });
        
        if (result.success && result.mediaFile) {
          uploadedFiles.push(result.mediaFile);
        }
      }
      
      await fetchFiles();
      await fetchStorageStats();
      return uploadedFiles;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Upload failed'));
      return uploadedFiles;
    } finally {
      setUploading(false);
    }
  }, [organizationId, fetchFiles, fetchStorageStats]);
  
  // Add external media
  const addExternal = useCallback(async (
    input: Omit<AddExternalMediaInput, 'organizationId'>
  ): Promise<MediaFile | null> => {
    try {
      const result = await mediaService.addExternal({
        ...input,
        organizationId,
      });
      
      if (result.success && result.mediaFile) {
        await fetchFiles();
        return result.mediaFile;
      } else {
        throw new Error(result.error || 'Failed to add external media');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add external media'));
      return null;
    }
  }, [organizationId, fetchFiles]);
  
  // Update media
  const update = useCallback(async (
    id: string,
    input: UpdateMediaInput
  ): Promise<MediaFile | null> => {
    try {
      const updated = await mediaService.update(id, input);
      setFiles(prev => prev.map(f => f.id === id ? updated : f));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Update failed'));
      return null;
    }
  }, []);
  
  // Delete single file
  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await mediaService.delete(id);
      setFiles(prev => prev.filter(f => f.id !== id));
      await fetchStorageStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Delete failed'));
      return false;
    }
  }, [fetchStorageStats]);
  
  // Delete multiple files
  const removeMultiple = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      await mediaService.deleteMultiple(ids);
      setFiles(prev => prev.filter(f => !ids.includes(f.id)));
      await fetchStorageStats();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Delete failed'));
      return false;
    }
  }, [fetchStorageStats]);
  
  // Check if user can upload a file of given size
  const canUpload = useCallback((fileSize: number): boolean => {
    if (!storageStats) return true;
    return (storageStats.used + fileSize) <= storageStats.limit;
  }, [storageStats]);
  
  // Format bytes utility
  const formatBytes = useCallback((bytes: number): string => {
    return mediaService.formatBytes(bytes);
  }, []);
  
  return {
    files,
    storageStats,
    loading,
    uploading,
    error,
    upload,
    uploadMultiple,
    addExternal,
    update,
    remove,
    removeMultiple,
    refresh: fetchFiles,
    setFilters,
    canUpload,
    formatBytes,
  };
}
