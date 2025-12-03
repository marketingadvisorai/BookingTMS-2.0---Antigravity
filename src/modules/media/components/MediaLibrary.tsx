/**
 * Media Library Component
 * @module media/components/MediaLibrary
 * 
 * Grid view of all media files with filtering and selection
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  Download,
  Eye,
  MoreVertical,
  Check,
  X,
  Loader2,
  Cloud,
  Link as LinkIcon,
  HardDrive,
  Plus,
} from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { useMedia } from '../hooks/useMedia';
import { MediaUploader } from './MediaUploader';
import { MediaFile, FileType } from '../types';
import { mediaService } from '../services/media.service';
import { toast } from 'sonner';

interface MediaLibraryProps {
  organizationId: string;
  onSelect?: (files: MediaFile[]) => void;
  selectionMode?: 'single' | 'multiple' | 'none';
  acceptedTypes?: FileType[];
  className?: string;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  organizationId,
  onSelect,
  selectionMode = 'none',
  acceptedTypes,
  className,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FileType | 'all'>('all');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  const {
    files,
    storageStats,
    loading,
    remove,
    removeMultiple,
    refresh,
    formatBytes,
  } = useMedia({ organizationId });

  // Filtered files
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || file.file_type === filterType;
      const matchesAccepted = !acceptedTypes || acceptedTypes.includes(file.file_type);
      return matchesSearch && matchesType && matchesAccepted;
    });
  }, [files, searchQuery, filterType, acceptedTypes]);

  // Handle file selection
  const toggleSelection = (fileId: string) => {
    if (selectionMode === 'none') return;
    
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        if (selectionMode === 'single') {
          newSet.clear();
        }
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  // Confirm selection
  const confirmSelection = () => {
    if (onSelect) {
      const selected = files.filter(f => selectedFiles.has(f.id));
      onSelect(selected);
      setSelectedFiles(new Set());
    }
  };

  // Delete selected files
  const deleteSelected = async () => {
    if (selectedFiles.size === 0) return;
    
    if (!confirm(`Delete ${selectedFiles.size} file(s)? This cannot be undone.`)) return;
    
    const success = await removeMultiple(Array.from(selectedFiles));
    if (success) {
      toast.success(`Deleted ${selectedFiles.size} file(s)`);
      setSelectedFiles(new Set());
    } else {
      toast.error('Failed to delete some files');
    }
  };

  // Delete single file
  const deleteFile = async (file: MediaFile) => {
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    
    const success = await remove(file.id);
    if (success) {
      toast.success('File deleted');
    } else {
      toast.error('Failed to delete file');
    }
  };

  // Get file icon
  const FileIcon = ({ type, className }: { type: FileType; className?: string }) => {
    switch (type) {
      case 'image': return <ImageIcon className={className} />;
      case 'video': return <Video className={className} />;
      case 'document': return <FileText className={className} />;
    }
  };

  // Get source badge
  const SourceBadge = ({ source }: { source: string }) => {
    switch (source) {
      case 'google_drive':
        return <Badge variant="outline" className="gap-1"><HardDrive className="w-3 h-3" /> Drive</Badge>;
      case 'external_link':
        return <Badge variant="outline" className="gap-1"><LinkIcon className="w-3 h-3" /> Link</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Storage Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-500" />
            Media Library
          </h2>
          {storageStats && (
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Cloud className="w-4 h-4" />
              <span>{formatBytes(storageStats.used)} of {formatBytes(storageStats.limit)} used</span>
              <Progress value={storageStats.percentage} className="w-24 h-2" />
            </div>
          )}
        </div>
        
        <Button onClick={() => setShowUploader(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Upload Files
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as FileType | 'all')}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          {/* Selection actions */}
          {selectedFiles.size > 0 && (
            <>
              {selectionMode !== 'none' && onSelect && (
                <Button size="sm" onClick={confirmSelection} className="gap-2">
                  <Check className="w-4 h-4" />
                  Use Selected ({selectedFiles.size})
                </Button>
              )}
              <Button size="sm" variant="destructive" onClick={deleteSelected} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete ({selectedFiles.size})
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedFiles(new Set())}>
                <X className="w-4 h-4" />
              </Button>
            </>
          )}
          
          {/* View mode toggle */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list' 
                  ? 'bg-white dark:bg-gray-600 shadow-sm' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* File Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || filterType !== 'all' 
              ? 'No files match your filters' 
              : 'No files uploaded yet'}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setShowUploader(true)}
          >
            Upload Your First File
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {filteredFiles.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  'relative group aspect-square rounded-lg overflow-hidden border-2 transition-colors cursor-pointer',
                  selectedFiles.has(file.id)
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-transparent hover:border-gray-300'
                )}
                onClick={() => selectionMode !== 'none' && toggleSelection(file.id)}
              >
                {/* Thumbnail */}
                {file.file_type === 'image' ? (
                  <img
                    src={file.storage_url}
                    alt={file.alt_text || file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <FileIcon type={file.file_type} className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Selection checkbox */}
                {selectionMode !== 'none' && (
                  <div className={cn(
                    'absolute top-2 left-2 w-6 h-6 rounded-full border-2 transition-all',
                    selectedFiles.has(file.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-white bg-black/20 group-hover:bg-white/80'
                  )}>
                    {selectedFiles.has(file.id) && (
                      <Check className="w-4 h-4 text-white m-0.5" />
                    )}
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30"
                  >
                    <Eye className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteFile(file); }}
                    className="p-2 bg-white/20 rounded-full hover:bg-red-500"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                {/* File info */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-xs text-white truncate">{file.name}</p>
                  <p className="text-xs text-white/60">{formatBytes(file.file_size)}</p>
                </div>
                
                {/* Source badge */}
                {file.source !== 'upload' && file.source !== 'activity' && (
                  <div className="absolute top-2 right-2">
                    <SourceBadge source={file.source} />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={cn(
                'flex items-center gap-4 p-3 rounded-lg border transition-colors cursor-pointer',
                selectedFiles.has(file.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
              onClick={() => selectionMode !== 'none' && toggleSelection(file.id)}
            >
              {/* Thumbnail */}
              {file.file_type === 'image' ? (
                <img
                  src={file.storage_url}
                  alt={file.alt_text || file.name}
                  className="w-12 h-12 rounded object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FileIcon type={file.file_type} className="w-6 h-6 text-gray-400" />
                </div>
              )}
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{formatBytes(file.file_size)}</span>
                  <span>•</span>
                  <span className="capitalize">{file.file_type}</span>
                  {file.source !== 'upload' && file.source !== 'activity' && (
                    <>
                      <span>•</span>
                      <SourceBadge source={file.source} />
                    </>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPreviewFile(file)}>
                    <Eye className="w-4 h-4 mr-2" /> Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href={file.storage_url} download={file.name} target="_blank">
                      <Download className="w-4 h-4 mr-2" /> Download
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => deleteFile(file)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploader} onOpenChange={setShowUploader}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <MediaUploader
            organizationId={organizationId}
            storageUsed={storageStats?.used}
            storageLimit={storageStats?.limit}
            onUploadComplete={(newFiles) => {
              toast.success(`Uploaded ${newFiles.length} file(s)`);
              refresh();
              setShowUploader(false);
            }}
            onError={(error) => toast.error(error)}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="space-y-4">
              {previewFile.file_type === 'image' ? (
                <img
                  src={previewFile.storage_url}
                  alt={previewFile.alt_text || previewFile.name}
                  className="max-h-[60vh] mx-auto rounded-lg"
                />
              ) : previewFile.file_type === 'video' ? (
                <video
                  src={previewFile.storage_url}
                  controls
                  className="max-h-[60vh] mx-auto rounded-lg"
                />
              ) : (
                <div className="text-center py-8">
                  <FileIcon type={previewFile.file_type} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <a
                    href={previewFile.storage_url}
                    target="_blank"
                    className="text-blue-500 hover:underline"
                  >
                    Open in new tab
                  </a>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Size:</span>
                  <span className="ml-2">{formatBytes(previewFile.file_size)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 capitalize">{previewFile.file_type}</span>
                </div>
                {previewFile.width && previewFile.height && (
                  <div>
                    <span className="text-gray-500">Dimensions:</span>
                    <span className="ml-2">{previewFile.width} × {previewFile.height}</span>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">Uploaded:</span>
                  <span className="ml-2">{new Date(previewFile.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaLibrary;
