import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../components/layout/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Upload,
  MoreVertical,
  Image as ImageIcon,
  Trash2,
  Download,
  Eye,
  Cloud,
  CheckCircle2,
  FolderOpen,
  FileImage,
  ChevronRight,
  FileText,
  HardDrive,
  TrendingUp,
  X,
  Search,
  Filter,
  Grid3x3,
  List
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import googleDriveIcon from 'figma:asset/701ad43cc3caf6f9abad86d954bb51aae6accad1.png';
import { PageHeader } from '../components/layout/PageHeader';

const LOCAL_STORAGE_KEY = 'booking_tms_media_items';

type MediaItem = {
  id: number;
  url: string;
  title: string;
  game: string;
  uploadDate: string;
  size: string;
  type: 'image' | 'video';
};

const mediaData = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=400&fit=crop',
    title: 'Mystery Manor - Main Room',
    game: 'Mystery Manor',
    uploadDate: 'Oct 20, 2025',
    size: '2.4 MB',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=600&h=400&fit=crop',
    title: 'Space Odyssey - Control Room',
    game: 'Space Odyssey',
    uploadDate: 'Oct 18, 2025',
    size: '3.1 MB',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&h=400&fit=crop',
    title: 'Zombie Outbreak - Laboratory',
    game: 'Zombie Outbreak',
    uploadDate: 'Oct 15, 2025',
    size: '2.8 MB',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1511800453077-8c0afa94175f?w=600&h=400&fit=crop',
    title: 'Treasure Hunt - Cave Entrance',
    game: 'Treasure Hunt',
    uploadDate: 'Oct 12, 2025',
    size: '2.2 MB',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=600&h=400&fit=crop',
    title: 'Prison Break - Cell Block',
    game: 'Prison Break',
    uploadDate: 'Oct 10, 2025',
    size: '2.9 MB',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1518133683791-0b9de5a55f34?w=600&h=400&fit=crop',
    title: 'Wizards Quest - Magical Library',
    game: 'Wizards Quest',
    uploadDate: 'Oct 8, 2025',
    size: '3.3 MB',
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=600&h=400&fit=crop',
    title: 'Mystery Manor - Secret Passage',
    game: 'Mystery Manor',
    uploadDate: 'Oct 5, 2025',
    size: '2.6 MB',
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop',
    title: 'Space Odyssey - Navigation Deck',
    game: 'Space Odyssey',
    uploadDate: 'Oct 3, 2025',
    size: '3.0 MB',
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1489514354504-1653aa90e34e?w=600&h=400&fit=crop',
    title: 'Zombie Outbreak - Safe Room',
    game: 'Zombie Outbreak',
    uploadDate: 'Oct 1, 2025',
    size: '2.5 MB',
  },
];

export function Media() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Semantic class variables
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevatedClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';
  const hoverShadowClass = isDark ? 'hover:shadow-[0_0_15px_rgba(79,70,229,0.1)]' : 'hover:shadow-lg';

  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedUploadFiles, setSelectedUploadFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadFileType, setUploadFileType] = useState<'image' | 'video'>('image');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGame, setFilterGame] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Load media items from local storage or fall back to sample data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setMediaItems(parsed.map((item: any) => ({
            id: Number(item.id),
            url: String(item.url),
            title: String(item.title),
            game: String(item.game ?? 'Uncategorized'),
            uploadDate: String(item.uploadDate),
            size: String(item.size),
            type: (item.type === 'video' ? 'video' : 'image'),
          })));
        } else {
          setMediaItems(mediaData.map((m) => ({ ...m, type: 'image' as const })));
        }
      } else {
        setMediaItems(mediaData.map((m) => ({ ...m, type: 'image' as const })));
      }
    } catch {
      setMediaItems(mediaData.map((m) => ({ ...m, type: 'image' as const })));
    }
  }, []);

  // Persist to local storage whenever media items change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mediaItems));
    } catch { }
  }, [mediaItems]);

  // Mock Google Drive folders and files
  const googleDriveFolders = [
    { id: 'folder1', name: 'Escape Room Photos', fileCount: 45, type: 'folder' as const },
    { id: 'folder2', name: 'Game Marketing', fileCount: 23, type: 'folder' as const },
    { id: 'folder3', name: 'Customer Events', fileCount: 67, type: 'folder' as const }
  ];

  const googleDriveFiles = [
    {
      id: 'file1',
      name: 'mystery-room-entrance.jpg',
      size: '3.2 MB',
      modified: '2 days ago',
      thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=200&h=200&fit=crop',
      type: 'file' as const
    },
    {
      id: 'file2',
      name: 'space-control-panel.jpg',
      size: '2.8 MB',
      modified: '5 days ago',
      thumbnail: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200&h=200&fit=crop',
      type: 'file' as const
    },
    {
      id: 'file3',
      name: 'zombie-lab-scene.jpg',
      size: '4.1 MB',
      modified: '1 week ago',
      thumbnail: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=200&h=200&fit=crop',
      type: 'file' as const
    },
    {
      id: 'file4',
      name: 'treasure-cave.jpg',
      size: '3.5 MB',
      modified: '1 week ago',
      thumbnail: 'https://images.unsplash.com/photo-1511800453077-8c0afa94175f?w=200&h=200&fit=crop',
      type: 'file' as const
    },
    {
      id: 'file5',
      name: 'prison-cell-block.jpg',
      size: '2.9 MB',
      modified: '2 weeks ago',
      thumbnail: 'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=200&h=200&fit=crop',
      type: 'file' as const
    },
    {
      id: 'file6',
      name: 'wizard-library.jpg',
      size: '3.7 MB',
      modified: '2 weeks ago',
      thumbnail: 'https://images.unsplash.com/photo-1518133683791-0b9de5a55f34?w=200&h=200&fit=crop',
      type: 'file' as const
    }
  ];

  const filteredMedia = mediaItems.filter(media => {
    const matchesSearch = media.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      media.game.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterGame === 'all' || media.game === filterGame;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: number) => {
    const item = mediaItems.find(m => Number(m.id) === Number(id));
    setMediaItems(prev => prev.filter(m => Number(m.id) !== Number(id)));
    // Revoke blob URLs for locally uploaded items
    if (item && typeof item.url === 'string' && item.url.startsWith('blob:')) {
      try { URL.revokeObjectURL(item.url); } catch { }
    }
    toast.success('Media deleted');
  };

  const handleDownload = async (media: MediaItem) => {
    const filename = media.title.includes('.')
      ? media.title
      : media.type === 'video'
        ? `${media.title.replace(/\s+/g, '_')}.mp4`
        : `${media.title.replace(/\s+/g, '_')}.jpg`;
    try {
      let href = media.url;
      let createdObjectUrl: string | null = null;
      if (!href.startsWith('blob:')) {
        const res = await fetch(href);
        const blob = await res.blob();
        href = URL.createObjectURL(blob);
        createdObjectUrl = href;
      }
      const a = document.createElement('a');
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      if (createdObjectUrl) {
        setTimeout(() => URL.revokeObjectURL(createdObjectUrl!), 1000);
      }
      toast.success('Download started');
    } catch {
      window.open(media.url, '_blank');
      toast.info('Opened in new tab');
    }
  };

  const handleConnectGoogleDrive = () => {
    setTimeout(() => {
      setIsGoogleDriveConnected(true);
      setShowConnectDialog(false);
      toast.success('Google Drive connected successfully');
    }, 1500);
  };

  const handleDisconnectGoogleDrive = () => {
    setIsGoogleDriveConnected(false);
    toast.success('Google Drive disconnected');
  };

  const handleToggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleImportFromDrive = () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one file to import');
      return;
    }
    toast.success(`Importing ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} from Google Drive`);
    setShowImportDialog(false);
    setSelectedFiles([]);
  };

  const handleUploadClick = () => {
    setShowUploadDialog(true);
  };

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: any) => {
    const files = Array.from(e.target?.files || []);
    const filtered = files.filter((file: any) =>
      uploadFileType === 'image' ? file.type?.startsWith('image/') : file.type?.startsWith('video/')
    );
    setSelectedUploadFiles(filtered as File[]);
  };

  const handleUpload = () => {
    if (selectedUploadFiles.length === 0) {
      toast.error('Please select files to upload');
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const now = new Date();
          const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const maxId = mediaItems.length ? Math.max(...mediaItems.map(m => Number(m.id))) : 0;
          const newItems: MediaItem[] = selectedUploadFiles.map((file, idx) => ({
            id: maxId + idx + 1,
            url: URL.createObjectURL(file),
            title: file.name,
            game: 'Uncategorized',
            uploadDate: dateStr,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            type: file.type?.startsWith('video/') ? 'video' : 'image',
          }));
          setMediaItems(prev => [...newItems, ...prev]);
          setTimeout(() => {
            setIsUploading(false);
            setShowUploadDialog(false);
            setUploadProgress(0);
            setSelectedUploadFiles([]);
            toast.success('Photos and videos uploaded successfully');
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Media Library"
        description="Manage photos and media for your games"
        sticky
        action={
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isGoogleDriveConnected ? (
              <Button
                variant="outline"
                className={`h-11 flex-1 sm:flex-initial ${isDark ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400' : 'border-green-200 bg-green-50 hover:bg-green-100'}`}
                onClick={() => setShowImportDialog(true)}
              >
                <img src={googleDriveIcon} alt="Google Drive" className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Import from Drive</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowConnectDialog(true)}
                className="h-11 flex-1 sm:flex-initial"
              >
                <Cloud className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Connect Google Drive</span>
              </Button>
            )}
            <Button
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={isDark ? 'text-white hover:bg-[#4338ca]' : 'bg-blue-600 hover:bg-blue-700'}
              onClick={handleUploadClick}
            >
              <Upload className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Upload Media</span>
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Total Photos</p>
                <p className={`text-2xl mt-2 ${textClass}`}>{mediaItems.length}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[#4f46e5]/20' : 'bg-blue-100'}`}>
                <ImageIcon className={`w-6 h-6 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Uploaded This Month</p>
                <p className={`text-2xl mt-2 ${textClass}`}>24</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/20' : 'bg-green-100'}`}>
                <TrendingUp className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderClass} shadow-sm ${hoverShadowClass} transition-all`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`text-sm ${textMutedClass}`}>Storage Used</p>
                <p className={`text-2xl mt-2 ${textClass}`}>124.5 MB</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                <HardDrive className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Google Drive Connection Status */}
      {isGoogleDriveConnected && (
        <Card className={`border shadow-sm ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-green-50 border-green-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <img src={googleDriveIcon} alt="Google Drive" className="w-8 h-8 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${isDark ? 'text-emerald-300' : 'text-green-900'}`}>Google Drive Connected</p>
                    <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                  </div>
                  <p className={`text-xs ${isDark ? 'text-emerald-400/70' : 'text-green-700'}`}>
                    Access your photos directly from Google Drive
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImportDialog(true)}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Browse Drive
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnectGoogleDrive}
                  className={isDark ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
              <Input
                placeholder="Search photos by title or game..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterGame} onValueChange={setFilterGame}>
                <SelectTrigger className="w-[160px] h-11">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="Mystery Manor">Mystery Manor</SelectItem>
                  <SelectItem value="Space Odyssey">Space Odyssey</SelectItem>
                  <SelectItem value="Zombie Outbreak">Zombie Outbreak</SelectItem>
                  <SelectItem value="Treasure Hunt">Treasure Hunt</SelectItem>
                  <SelectItem value="Prison Break">Prison Break</SelectItem>
                  <SelectItem value="Wizards Quest">Wizards Quest</SelectItem>
                  <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8"
                  style={{ backgroundColor: viewMode === 'grid' && isDark ? '#4f46e5' : undefined }}
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8"
                  style={{ backgroundColor: viewMode === 'list' && isDark ? '#4f46e5' : undefined }}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid/List */}
      <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
        <CardHeader className="p-6">
          <div className="flex items-center justify-between">
            <CardTitle className={textClass}>Photo Gallery</CardTitle>
            <Badge variant="secondary" className={isDark ? 'bg-[#1e1e1e] text-[#a3a3a3]' : 'bg-gray-100 text-gray-700'}>
              {filteredMedia.length} photos
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {filteredMedia.length === 0 ? (
            <div className={`text-center py-12 ${textMutedClass}`}>
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No photos found</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMedia.map((media) => (
                <div
                  key={media.id}
                  className={`group relative rounded-lg overflow-hidden border ${borderClass} ${cardBgClass} ${hoverShadowClass} transition-all cursor-pointer`}
                >
                  <div className={`aspect-video relative overflow-hidden ${bgElevatedClass}`}>
                    {media.type === 'video' ? (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <ImageWithFallback
                        src={media.url}
                        alt={media.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity bg-white"
                        onClick={() => setSelectedImage(media)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm truncate ${textClass}`}>{media.title}</h3>
                        <Badge
                          variant="secondary"
                          className={`mt-1 text-xs ${isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-50 text-blue-700'}`}
                        >
                          {media.game}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedImage(media)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Full Size
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(media)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(media.id)} className={isDark ? 'text-red-400' : 'text-red-600'}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className={`flex items-center justify-between text-xs ${textMutedClass}`}>
                      <span>{media.uploadDate}</span>
                      <span>{media.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredMedia.map((media) => (
                <div
                  key={media.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border ${borderClass} ${hoverBgClass} transition-all cursor-pointer`}
                >
                  <div className={`w-20 h-20 rounded overflow-hidden flex-shrink-0 ${bgElevatedClass}`}>
                    {media.type === 'video' ? (
                      <video src={media.url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                    ) : (
                      <ImageWithFallback
                        src={media.url}
                        alt={media.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm ${textClass}`}>{media.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-50 text-blue-700'}`}
                      >
                        {media.game}
                      </Badge>
                      <span className={`text-xs ${textMutedClass}`}>{media.uploadDate}</span>
                      <span className={`text-xs ${textMutedClass}`}>{media.size}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedImage(media)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDownload(media)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(media.id)} className={isDark ? 'text-red-400' : 'text-red-600'}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className={`max-w-4xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>{selectedImage?.title}</DialogTitle>
            <DialogDescription className={textMutedClass}>
              {selectedImage?.game} • {selectedImage?.uploadDate} • {selectedImage?.size}
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="mt-4">
              <ImageWithFallback
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedImage(null)}>
              Close
            </Button>
            <Button
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={!isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
              onClick={() => selectedImage && handleDownload(selectedImage)}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connect Google Drive Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className={`max-w-md ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Connect Google Drive</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Connect your Google Drive to easily import and manage photos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center py-6">
              <img src={googleDriveIcon} alt="Google Drive" className="w-20 h-20" />
            </div>

            <div className="space-y-3">
              <div className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-[#4f46e5]/10' : 'bg-blue-50'}`}>
                <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Access Your Photos</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                    Browse and import photos directly from your Google Drive
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-[#4f46e5]/10' : 'bg-blue-50'}`}>
                <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Automatic Sync</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                    Keep your media library in sync with your Drive folders
                  </p>
                </div>
              </div>

              <div className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-[#4f46e5]/10' : 'bg-blue-50'}`}>
                <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
                <div>
                  <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>Save Storage Space</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-[#c7d2fe]' : 'text-blue-700'}`}>
                    Reference files from Drive without using local storage
                  </p>
                </div>
              </div>
            </div>

            <Separator className={borderClass} />

            <div className={`p-3 rounded-lg text-xs ${bgElevatedClass} ${textMutedClass}`}>
              <p className="mb-2">By connecting Google Drive, you authorize BookingTMS to:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>View and manage files in your Google Drive</li>
                <li>Upload files to your Google Drive</li>
                <li>Access file metadata and permissions</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={!isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
              onClick={handleConnectGoogleDrive}
            >
              <img src={googleDriveIcon} alt="" className="w-4 h-4 mr-2" />
              Connect Google Drive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import from Google Drive Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className={`max-w-3xl ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}`}>
          <DialogHeader>
            <DialogTitle className={textClass}>Import from Google Drive</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Select photos from your Google Drive to import into your media library
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Folders Section */}
            <div>
              <h3 className={`text-sm mb-3 flex items-center gap-2 ${textClass}`}>
                <FolderOpen className="w-4 h-4" />
                Folders
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {googleDriveFolders.map((folder) => (
                  <button
                    key={folder.id}
                    className={`p-3 border rounded-lg transition-all text-left ${isDark
                      ? 'border-[#2a2a2a] hover:border-[#4f46e5] hover:bg-[#4f46e5]/10'
                      : 'border-gray-200 hover:border-blue-600 hover:bg-blue-50'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FolderOpen className={`w-5 h-5 ${textMutedClass}`} />
                      <p className={`text-sm truncate ${textClass}`}>{folder.name}</p>
                    </div>
                    <p className={`text-xs ${textMutedClass}`}>{folder.fileCount} files</p>
                  </button>
                ))}
              </div>
            </div>

            <Separator className={borderClass} />

            {/* Files Section */}
            <div>
              <h3 className={`text-sm mb-3 flex items-center gap-2 ${textClass}`}>
                <FileImage className="w-4 h-4" />
                Recent Files
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {googleDriveFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedFiles.includes(file.id)
                      ? (isDark ? 'border-[#4f46e5] bg-[#4f46e5]/10' : 'border-blue-600 bg-blue-50')
                      : (isDark ? `border-[#2a2a2a] ${hoverBgClass}` : 'border-gray-200 hover:bg-gray-50')
                      }`}
                    onClick={() => handleToggleFileSelection(file.id)}
                  >
                    <Checkbox
                      checked={selectedFiles.includes(file.id)}
                      onCheckedChange={() => handleToggleFileSelection(file.id)}
                    />
                    <div className={`w-16 h-16 rounded overflow-hidden flex-shrink-0 ${bgElevatedClass}`}>
                      <ImageWithFallback
                        src={file.thumbnail}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${textClass}`}>{file.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs ${textMutedClass}`}>{file.size}</span>
                        <span className={`text-xs ${textMutedClass}`}>Modified {file.modified}</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 ${textMutedClass}`} />
                  </div>
                ))}
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30' : 'bg-blue-50 border-blue-200'}`}>
                <p className={`text-sm ${isDark ? 'text-[#e0e7ff]' : 'text-blue-900'}`}>
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowImportDialog(false);
                setSelectedFiles([]);
              }}
            >
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={!isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
              onClick={handleImportFromDrive}
              disabled={selectedFiles.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Import {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Photos & Videos Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
          <DialogHeader>
            <DialogTitle className={textClass}>Upload Photos & Videos</DialogTitle>
            <DialogDescription className={textMutedClass}>
              Upload media files from your device to your library
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!isUploading ? (
              <>
                {/* Upload Area */}
                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDark
                  ? 'border-[#2a2a2a] hover:border-[#4f46e5] bg-[#0a0a0a]'
                  : 'border-gray-300 hover:border-blue-500 bg-gray-50'
                  }`} onClick={handleChooseFiles}>
                  <Upload className={`w-12 h-12 mx-auto mb-3 ${textMutedClass}`} />
                  <p className={`text-sm mb-1 ${textClass}`}>
                    Drag and drop files here or click to browse
                  </p>
                  <p className={`text-xs ${textMutedClass}`}>
                    Supports: JPG, PNG, GIF, MP4, MOV (Max 50MB per file)
                  </p>
                  <Button
                    className="mt-4"
                    style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                    onClick={handleChooseFiles}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={uploadFileType === 'image' ? 'image/*' : 'video/*'}
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>

                {selectedUploadFiles.length > 0 && (
                  <div className={`p-3 rounded-lg border ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-sm ${textClass}`}>{selectedUploadFiles.length} file(s) selected</p>
                    <ul className="text-xs mt-2 space-y-1">
                      {selectedUploadFiles.map((file) => (
                        <li key={`${file.name}-${file.size}`} className={textMutedClass}>
                          {file.name} • {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedUploadFiles([])}>
                        <X className="w-4 h-4 mr-1" /> Clear
                      </Button>
                    </div>
                  </div>
                )}

                {/* File Type Selection */}
                <div>
                  <Label className={`text-sm mb-2 ${textClass}`}>File Type</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button
                      className={`p-3 border-2 rounded-lg text-left ${uploadFileType === 'image'
                        ? (isDark ? 'border-[#4f46e5] bg-[#4f46e5]/10' : 'border-blue-600 bg-blue-50')
                        : (isDark ? `border-[#2a2a2a] ${hoverBgClass}` : 'border-gray-200 hover:border-gray-300')
                        }`}
                      onClick={() => setUploadFileType('image')}
                      aria-pressed={uploadFileType === 'image'}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ImageIcon className={`w-4 h-4 ${uploadFileType === 'image' ? (isDark ? 'text-[#6366f1]' : 'text-blue-600') : textMutedClass}`} />
                        <p className={`text-sm ${textClass}`}>Photos</p>
                      </div>
                      <p className={`text-xs ${textMutedClass}`}>JPG, PNG, GIF</p>
                    </button>
                    <button
                      className={`p-3 border-2 rounded-lg text-left ${uploadFileType === 'video'
                        ? (isDark ? 'border-[#4f46e5] bg-[#4f46e5]/10' : 'border-blue-600 bg-blue-50')
                        : (isDark ? `border-[#2a2a2a] ${hoverBgClass}` : 'border-gray-200 hover:border-gray-300')
                        }`}
                      onClick={() => setUploadFileType('video')}
                      aria-pressed={uploadFileType === 'video'}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className={`w-4 h-4 ${uploadFileType === 'video' ? (isDark ? 'text-[#6366f1]' : 'text-blue-600') : textMutedClass}`} />
                        <p className={`text-sm ${textClass}`}>Videos</p>
                      </div>
                      <p className={`text-xs ${textMutedClass}`}>MP4, MOV, AVI</p>
                    </button>
                  </div>
                </div>

                {/* Connected to Google Drive Notice */}
                {isGoogleDriveConnected && (
                  <div className={`p-3 rounded-lg border ${isDark
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-green-50 border-green-200'
                    }`}>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                      <div>
                        <p className={`text-xs ${isDark ? 'text-emerald-300' : 'text-green-900'}`}>
                          Google Drive Connected
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400/70' : 'text-green-700'}`}>
                          Files will be automatically backed up to your Google Drive
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <Upload className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'} animate-pulse`} />
                  <p className={`text-sm ${textClass}`}>Uploading files...</p>
                  <p className={`text-xs mt-1 ${textMutedClass}`}>{uploadProgress}% complete</p>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowUploadDialog(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
              className={!isDark ? 'bg-blue-600 hover:bg-blue-700' : ''}
              onClick={handleUpload}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
