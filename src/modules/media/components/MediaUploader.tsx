/**
 * Media Uploader Component
 * @module media/components/MediaUploader
 * 
 * Drag & drop file uploader with storage limit indicators
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  Cloud,
  Link as LinkIcon,
} from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import {
  STORAGE_LIMITS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MediaFile,
  FileType,
} from '../types';
import { mediaService } from '../services/media.service';

interface MediaUploaderProps {
  organizationId: string;
  onUploadComplete?: (files: MediaFile[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  acceptedTypes?: FileType[];
  storageUsed?: number;
  storageLimit?: number;
  className?: string;
  compact?: boolean;
  entityType?: string;
  entityId?: string;
  usageContext?: string;
}

interface FilePreview {
  file: File;
  preview: string;
  type: FileType;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  progress?: number;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  organizationId,
  onUploadComplete,
  onError,
  maxFiles = 10,
  acceptedTypes = ['image', 'video', 'document'],
  storageUsed = 0,
  storageLimit = STORAGE_LIMITS.MAX_USER_STORAGE,
  className,
  compact = false,
  entityType,
  entityId,
  usageContext,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get accepted MIME types
  const acceptedMimeTypes = React.useMemo(() => {
    const types: string[] = [];
    if (acceptedTypes.includes('image')) {
      types.push(...ALLOWED_IMAGE_TYPES);
    }
    if (acceptedTypes.includes('video')) {
      types.push(...ALLOWED_VIDEO_TYPES);
    }
    if (acceptedTypes.includes('document')) {
      types.push('application/pdf');
    }
    return types;
  }, [acceptedTypes]);

  // Get file type from MIME
  const getFileType = (mimeType: string): FileType | null => {
    if ((ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType)) return 'image';
    if ((ALLOWED_VIDEO_TYPES as readonly string[]).includes(mimeType)) return 'video';
    if (mimeType === 'application/pdf') return 'document';
    return null;
  };

  // Validate file
  const validateFile = (file: File): { valid: boolean; error?: string; type?: FileType } => {
    const fileType = getFileType(file.type);
    
    if (!fileType) {
      return { valid: false, error: 'Unsupported file type' };
    }
    
    if (!acceptedTypes.includes(fileType)) {
      return { valid: false, error: `${fileType} files are not allowed` };
    }
    
    // Check size limits
    if (fileType === 'image' && file.size > STORAGE_LIMITS.MAX_IMAGE_SIZE) {
      return { valid: false, error: `Images must be under ${mediaService.formatBytes(STORAGE_LIMITS.MAX_IMAGE_SIZE)}` };
    }
    if (fileType === 'video' && file.size > STORAGE_LIMITS.MAX_VIDEO_SIZE) {
      return { valid: false, error: `Videos must be under ${mediaService.formatBytes(STORAGE_LIMITS.MAX_VIDEO_SIZE)}` };
    }
    
    // Check storage limit
    const totalPending = files.reduce((sum, f) => sum + f.file.size, 0);
    if (storageUsed + totalPending + file.size > storageLimit) {
      return { valid: false, error: 'Storage limit exceeded' };
    }
    
    return { valid: true, type: fileType };
  };

  // Handle files selection
  const handleFiles = useCallback((selectedFiles: FileList | File[]) => {
    const newFiles: FilePreview[] = [];
    
    Array.from(selectedFiles).slice(0, maxFiles - files.length).forEach(file => {
      const validation = validateFile(file);
      
      if (validation.valid && validation.type) {
        const preview = file.type.startsWith('image/') 
          ? URL.createObjectURL(file)
          : '';
        
        newFiles.push({
          file,
          preview,
          type: validation.type,
          status: 'pending',
        });
      } else if (onError && validation.error) {
        onError(`${file.name}: ${validation.error}`);
      }
    });
    
    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, maxFiles, onError, storageUsed, storageLimit]);

  // Drag handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // Remove file from queue
  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // Upload all files
  const uploadAll = async () => {
    setUploading(true);
    const uploadedFiles: MediaFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;
      
      // Update status to uploading
      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'uploading' as const, progress: 0 } : f
      ));
      
      try {
        const result = await mediaService.upload({
          file: files[i].file,
          organizationId,
          entityType: entityType as any,
          entityId,
          usageContext: usageContext as any,
        });
        
        if (result.success && result.mediaFile) {
          uploadedFiles.push(result.mediaFile);
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, status: 'success' as const, progress: 100 } : f
          ));
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (err: any) {
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error' as const, error: err.message } : f
        ));
        onError?.(err.message);
      }
    }
    
    setUploading(false);
    
    if (uploadedFiles.length > 0) {
      onUploadComplete?.(uploadedFiles);
      // Clear successful uploads after a delay
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.status !== 'success'));
      }, 2000);
    }
  };

  // Clear all files
  const clearAll = () => {
    files.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setFiles([]);
  };

  // Storage usage percentage
  const usagePercentage = (storageUsed / storageLimit) * 100;
  const pendingSize = files.reduce((sum, f) => sum + f.file.size, 0);
  const projectedPercentage = ((storageUsed + pendingSize) / storageLimit) * 100;

  const FileIcon = ({ type }: { type: FileType }) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'document': return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Storage Usage Bar */}
      {!compact && (
        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Cloud className="w-5 h-5 text-blue-500" />
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Storage Used</span>
              <span className="font-medium">
                {mediaService.formatBytes(storageUsed)} / {mediaService.formatBytes(storageLimit)}
              </span>
            </div>
            <div className="relative">
              <Progress value={usagePercentage} className="h-2" />
              {pendingSize > 0 && (
                <div 
                  className="absolute top-0 h-2 bg-blue-300 rounded-r-full opacity-50"
                  style={{ 
                    left: `${usagePercentage}%`, 
                    width: `${Math.min(projectedPercentage - usagePercentage, 100 - usagePercentage)}%` 
                  }}
                />
              )}
            </div>
            {usagePercentage >= 90 && (
              <p className="text-xs text-amber-600 mt-1">Storage almost full</p>
            )}
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800',
          compact && 'p-4'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedMimeTypes.join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        
        <Upload className={cn(
          'mx-auto text-gray-400 mb-3',
          compact ? 'w-8 h-8' : 'w-12 h-12'
        )} />
        
        <p className="text-gray-600 dark:text-gray-400">
          {isDragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
        </p>
        
        <p className="text-xs text-gray-500 mt-2">
          Images up to {mediaService.formatBytes(STORAGE_LIMITS.MAX_IMAGE_SIZE)}, 
          Videos up to {mediaService.formatBytes(STORAGE_LIMITS.MAX_VIDEO_SIZE)}
        </p>
      </div>

      {/* File Previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((file, index) => (
              <motion.div
                key={`${file.file.name}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg',
                  file.status === 'error' 
                    ? 'bg-red-50 dark:bg-red-900/20' 
                    : 'bg-gray-50 dark:bg-gray-800'
                )}
              >
                {/* Preview */}
                {file.preview ? (
                  <img 
                    src={file.preview} 
                    alt={file.file.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <FileIcon type={file.type} />
                  </div>
                )}
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <p className="text-xs text-gray-500">
                    {mediaService.formatBytes(file.file.size)}
                    {file.error && (
                      <span className="text-red-500 ml-2">{file.error}</span>
                    )}
                  </p>
                </div>
                
                {/* Status */}
                <div className="flex items-center gap-2">
                  {file.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  {file.status === 'pending' && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={clearAll} disabled={uploading}>
                Clear All
              </Button>
              <Button 
                size="sm" 
                onClick={uploadAll} 
                disabled={uploading || files.every(f => f.status !== 'pending')}
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload {files.filter(f => f.status === 'pending').length} Files
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaUploader;
