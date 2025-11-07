import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Plus, MoreVertical, Users, Clock, DollarSign, Edit, Eye, Copy, Trash2, ExternalLink } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { Switch } from '../components/ui/switch';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { VisuallyHidden } from '../components/ui/visually-hidden';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useTheme } from '../components/layout/ThemeContext';
import AddGameWizard from '../components/games/AddGameWizard';
import { ViewGameBookings } from '../components/games/ViewGameBookings';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../lib/auth/AuthContext';
import DataSyncServiceWithEvents, {
  DataSyncEvents,
  Game,
  GameInput,
  GameDifficulty,
  GameMutationContext,
} from '../services/DataSyncService';

export function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [showAddGameWizard, setShowAddGameWizard] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [viewingBookingsGame, setViewingBookingsGame] = useState<Game | null>(null);
  const [deletingGame, setDeletingGame] = useState<Game | null>(null);
  const [embedGame, setEmbedGame] = useState<Game | null>(null);
  const [copiedEmbedUrl, setCopiedEmbedUrl] = useState(false);
  const [embedBaseUrl, setEmbedBaseUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  });
  const { currentUser, hasPermission } = useAuth();
  const { theme } = useTheme();
  const canCreateGame = hasPermission('games.create');
  const canEditGame = hasPermission('games.edit');
  const canDeleteGame = hasPermission('games.delete');
  const canViewBookings = hasPermission('bookings.view');
  const canAccessEventSettings = canCreateGame || canEditGame || canDeleteGame;

  const mutationContext = useMemo<GameMutationContext>(
    () => ({
      userId: currentUser?.id,
      userRole: currentUser?.role,
      organizationId: currentUser?.organizationId,
    }),
    [currentUser?.id, currentUser?.organizationId, currentUser?.role]
  );

  const refreshGames = useCallback(() => {
    const syncedGames = DataSyncServiceWithEvents.getAllGames();
    setGames(syncedGames);
  }, []);

  useEffect(() => {
    refreshGames();
    const handleGamesUpdated = () => refreshGames();
    DataSyncEvents.subscribe('games-updated', handleGamesUpdated);
    return () => {
      DataSyncEvents.unsubscribe('games-updated', handleGamesUpdated);
    };
  }, [refreshGames]);

  useEffect(() => {
    if (!canCreateGame && showAddGameWizard) {
      setShowAddGameWizard(false);
    }
    if (!canEditGame && editingGame) {
      setEditingGame(null);
    }
  }, [canCreateGame, canEditGame, editingGame, showAddGameWizard]);

  const toggleGameStatus = (id: string) => {
    const game = games.find((g) => g.id === id);
    if (!game) return;

    if (!canEditGame) {
      toast.error('You do not have permission to update events.');
      return;
    }

    const newStatus = game.status === 'active' ? 'inactive' : 'active';

    try {
      DataSyncServiceWithEvents.updateGame(
        id,
        { status: newStatus },
        mutationContext
      );
      toast.success(`${game.name} is now ${newStatus} and synced everywhere.`);
      refreshGames();
    } catch (error) {
      console.error('❌ Error updating game status:', error);
      toast.error('Error updating event status');
    }
  };

  const coerceNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    }
    return fallback;
  };

  const getDifficultyLabel = (game: Game): GameDifficulty => {
    if (game.difficultyLabel) return game.difficultyLabel;
    if (typeof game.difficulty === 'string') {
      const normalized = game.difficulty.toLowerCase();
      if (normalized.includes('easy')) return 'Easy';
      if (normalized.includes('medium')) return 'Medium';
      if (normalized.includes('hard')) return 'Hard';
      if (normalized.includes('extreme')) return 'Extreme';
    }
    if (typeof game.difficulty === 'number') {
      if (game.difficulty <= 2) return 'Easy';
      if (game.difficulty === 3) return 'Medium';
      if (game.difficulty >= 5) return 'Extreme';
      return 'Hard';
    }
    return 'Medium';
  };

  const getDifficultyBadgeClass = (label: GameDifficulty) => {
    switch (label) {
      case 'Easy':
        return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
      case 'Hard':
      case 'Extreme':
        return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30';
      default:
        return 'bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#737373] border-gray-200 dark:border-[#2a2a2a]';
    }
  };

  const mapWizardDifficulty = (value: number): GameDifficulty => {
    if (value <= 2) return 'Easy';
    if (value === 3) return 'Medium';
    if (value === 4) return 'Hard';
    return 'Extreme';
  };

  const buildGameInputFromWizard = (gameData: any): GameInput => {
    const difficultyLabel = mapWizardDifficulty(gameData.difficulty ?? 3);
    const capacity =
      (coerceNumber(gameData.maxAdults, 0) || 0) +
      (coerceNumber(gameData.maxChildren, 0) || 0);
    const coverImage =
      gameData.coverImage ||
      (Array.isArray(gameData.galleryImages) && gameData.galleryImages.length > 0
        ? gameData.galleryImages[0]
        : undefined);

    return {
      name: gameData.name,
      description: gameData.description,
      duration: gameData.duration,
      capacity: capacity || coerceNumber(gameData.capacity, 8),
      basePrice: coerceNumber(gameData.adultPrice, 0),
      status: 'active',
      difficulty: gameData.difficulty,
      difficultyLabel,
      coverImage,
      imageUrl: coverImage,
      galleryImages: Array.isArray(gameData.galleryImages) ? gameData.galleryImages : [],
      videos: Array.isArray(gameData.videos) ? gameData.videos : [],
      priceRange: `$${coerceNumber(gameData.adultPrice, 0)}`,
      ageRange: gameData.minAge ? `${gameData.minAge}+` : 'All ages',
      blockedDates: Array.isArray(gameData.blockedDates) ? gameData.blockedDates : [],
      availability:
        gameData.customHoursEnabled && typeof gameData.customHours === 'object'
          ? gameData.customHours
          : {},
      categoryId: 'default',
      settings: {
        visibility: gameData.eventType === 'private' ? 'private' : 'public',
        publishingTargets: {
          widgets: true,
          embed: true,
          calendars: true,
          previews: true,
        },
        bookingLeadTime: coerceNumber(gameData.advanceBooking, 0),
        cancellationWindow: coerceNumber(gameData.cancellationWindow, 24),
        specialInstructions: gameData.specialInstructions,
      },
    };
  };

  const buildGameInputFromExisting = (game: Game): GameInput => ({
    name: game.name,
    description: game.description,
    duration: game.duration,
    capacity: game.capacity,
    basePrice: game.basePrice,
    status: game.status,
    difficulty: typeof game.difficulty === 'number' ? game.difficulty : undefined,
    difficultyLabel: getDifficultyLabel(game),
    coverImage: game.coverImage,
    imageUrl: game.imageUrl,
    galleryImages: game.galleryImages ?? [],
    videos: game.videos ?? [],
    priceRange: game.priceRange,
    ageRange: game.ageRange,
    blockedDates: Array.isArray(game.blockedDates) ? game.blockedDates : [],
    availability: game.availability,
    categoryId: game.categoryId,
    settings: game.settings,
  });

  const handleAddGame = (gameData: any) => {
    if (!canCreateGame) {
      toast.error('You do not have permission to add events.');
      return;
    }

    const newGameData = buildGameInputFromWizard(gameData);

    try {
      DataSyncServiceWithEvents.saveGame(newGameData, mutationContext);
      setShowAddGameWizard(false);
      refreshGames();
      toast.success('Event published and synced everywhere!');
    } catch (error) {
      console.error('❌ Error saving game:', error);
      toast.error('Error saving event. Please try again.');
    }
  };

  const handleEditGame = (gameData: any) => {
    if (!editingGame) return;
    if (!canEditGame) {
      toast.error('You do not have permission to update events.');
      return;
    }

    const updatedGameData = {
      ...buildGameInputFromWizard(gameData),
      status: editingGame.status,
    };

    try {
      DataSyncServiceWithEvents.updateGame(
        editingGame.id,
        updatedGameData,
        mutationContext
      );
      setEditingGame(null);
      refreshGames();
      toast.success('Event updated successfully!');
    } catch (error) {
      console.error('❌ Error updating game:', error);
      toast.error('Error updating event. Please try again.');
    }
  };

  const handleDuplicateGame = (game: Game) => {
    if (!canCreateGame) {
      toast.error('You do not have permission to duplicate events.');
      return;
    }

    const duplicatedGame = buildGameInputFromExisting(game);
    duplicatedGame.name = `${game.name} (Copy)`;
    duplicatedGame.status = 'inactive';

    try {
      DataSyncServiceWithEvents.saveGame(duplicatedGame, mutationContext);
      refreshGames();
      toast.success(`${game.name} duplicated successfully!`);
    } catch (error) {
      console.error('❌ Error duplicating game:', error);
      toast.error('Error duplicating event.');
    }
  };

  // Generate embed URL for a single game preview
  const generateSingleGameEmbedUrl = (game: Game) => {
    const cleanedBase = (embedBaseUrl || '').trim().replace(/\/+$/, '');
    const params = new URLSearchParams({
      widget: 'singlegame',
      color: '2563eb',
      key: 'demo_preview',
      theme: (theme || 'light') as 'light' | 'dark',
    });
    if (game?.name) params.set('gameName', game.name);
    if (game?.description) params.set('gameDescription', game.description);
    if (game?.basePrice) params.set('gamePrice', String(game.basePrice));
    return `${cleanedBase}/?${params.toString()}`;
  };

  const handleDeleteGame = () => {
    if (!deletingGame) return;
    if (!canDeleteGame) {
      toast.error('You do not have permission to delete events.');
      return;
    }

    try {
      DataSyncServiceWithEvents.deleteGame(deletingGame.id, mutationContext);
      toast.success(`${deletingGame.name} deleted successfully!`);
      setDeletingGame(null);
      refreshGames();
    } catch (error) {
      console.error('❌ Error deleting game:', error);
      toast.error('Error deleting event.');
    }
  };

  // Convert game data to wizard format for editing
  const convertGameToWizardData = (game: Game) => {
    const difficultyLevelMap: Record<GameDifficulty, number> = {
      Easy: 2,
      Medium: 3,
      Hard: 4,
      Extreme: 5,
    };
    const difficultyLabel = getDifficultyLabel(game);
    const difficultyLevel =
      typeof game.difficulty === 'number'
        ? game.difficulty
        : difficultyLevelMap[difficultyLabel] ?? 3;
    const durationMinutes =
      typeof game.duration === 'number'
        ? game.duration
        : coerceNumber(String(game.duration).replace(/\D/g, ''), 60);
    const coverImage =
      game.coverImage ||
      game.imageUrl ||
      (Array.isArray(game.galleryImages) && game.galleryImages.length > 0
        ? game.galleryImages[0]
        : undefined);
    const visibility = game.settings?.visibility ?? 'public';

    return {
      // Step 1: Basic Info
      name: game.name,
      description: game.description,
      category: 'Escape Room',
      tagline: game.description,
      eventType: visibility === 'private' ? 'private' : 'public',
      selectedWidget: 'calendar-single-event',

      // Step 2: Capacity & Pricing
      minAdults: 2,
      maxAdults: game.capacity,
      minChildren: 0,
      maxChildren: 0,
      adultPrice: game.basePrice,
      childPrice: Math.round(game.basePrice * 0.7),
      customCapacityFields: [],
      groupDiscount: false,
      dynamicPricing: false,
      peakPricing: {
        enabled: false,
        weekdayPeakPrice: 35,
        weekendPeakPrice: 40,
        peakStartTime: '18:00',
        peakEndTime: '22:00',
      },
      groupTiers: [],

      // Step 3: Game Details
      duration: durationMinutes,
      difficulty: difficultyLevel,
      minAge: 12,
      language: ['English'],
      successRate: 45,
      activityDetails: '',
      additionalInformation: '',
      faqs: [],
      cancellationPolicies: [],
      accessibility: {
        strollerAccessible: false,
        wheelchairAccessible: false,
      },
      location: '123 Main Street, Los Angeles, CA 90012',

      // Step 4: Media
      coverImage,
      galleryImages: Array.isArray(game.galleryImages) ? game.galleryImages : [],
      videos: Array.isArray(game.videos) ? game.videos : [],

      // Step 5: Schedule
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: '10:00',
      endTime: '22:00',
      slotInterval: 30,
      advanceBooking: game.settings?.bookingLeadTime ?? 30,
      customHoursEnabled: false,
      customHours: {
        Monday: { enabled: true, startTime: '10:00', endTime: '22:00' },
        Tuesday: { enabled: true, startTime: '10:00', endTime: '22:00' },
        Wednesday: { enabled: true, startTime: '10:00', endTime: '22:00' },
        Thursday: { enabled: true, startTime: '10:00', endTime: '22:00' },
        Friday: { enabled: true, startTime: '10:00', endTime: '22:00' },
        Saturday: { enabled: true, startTime: '10:00', endTime: '22:00' },
        Sunday: { enabled: true, startTime: '10:00', endTime: '22:00' },
      },
      customDates: [],
      blockedDates: Array.isArray(game.blockedDates) ? game.blockedDates : [],

      // Step 6: Review & Waiver
      requiresWaiver: true,
      selectedWaiver: null,
      cancellationWindow: game.settings?.cancellationWindow ?? 24,
      specialInstructions: game.settings?.specialInstructions ?? '',
    };
  };

  const stats = useMemo(() => {
    const totalGames = games.length;
    const activeGames = games.filter((game) => game.status === 'active').length;
    const totalCapacity = games.reduce(
      (sum, game) => sum + coerceNumber(game.capacity, 0),
      0
    );
    const totalBasePrice = games.reduce(
      (sum, game) => sum + coerceNumber(game.basePrice, 0),
      0
    );

    return {
      totalGames,
      activeGames,
      totalCapacity,
      averagePrice: totalGames > 0 ? Math.round(totalBasePrice / totalGames) : 0,
    };
  }, [games]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Events / Rooms"
        description="Manage your escape room games and experiences"
        sticky
        action={
          canCreateGame && (
            <Button
              className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] w-full sm:w-auto h-11"
              onClick={() => setShowAddGameWizard(true)}
            >
              <Plus className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">Add New Events / Rooms</span>
            </Button>
          )
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mb-1 sm:mb-2">Total Games</p>
            <p className="text-gray-900 dark:text-white">{stats.totalGames}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mb-1 sm:mb-2">Active Games</p>
            <p className="text-gray-900 dark:text-white">{stats.activeGames}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mb-1 sm:mb-2">Total Capacity</p>
            <p className="text-gray-900 dark:text-white text-sm sm:text-base">
              {stats.totalCapacity} people
            </p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_15px_rgba(79,70,229,0.1)] transition-all">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mb-1 sm:mb-2">Avg. Price</p>
            <p className="text-gray-900 dark:text-white text-sm sm:text-base">
              ${stats.averagePrice}/person
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {games.map((game) => {
          const difficultyLabel = getDifficultyLabel(game);
          const difficultyClass = getDifficultyBadgeClass(difficultyLabel);
          const durationLabel =
            typeof game.duration === 'number'
              ? `${game.duration} min`
              : game.duration || '60 min';
          const showEditOption = canEditGame;
          const showEmbedOption = canAccessEventSettings;
          const showDuplicateOption = canCreateGame;
          const showDeleteOption = canDeleteGame;
          const showBookingsOption = canViewBookings;
          const showMenu =
            showEditOption ||
            showBookingsOption ||
            showEmbedOption ||
            showDuplicateOption ||
            showDeleteOption;
          const totalMediaCount =
            (Array.isArray(game.galleryImages) ? game.galleryImages.length : 0) +
            (Array.isArray(game.videos) ? game.videos.length : 0);

          return (
            <Card
              key={game.id}
              className="border-gray-200 dark:border-[#2a2a2a] shadow-sm hover:shadow-md dark:hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] transition-all overflow-hidden"
            >
              <div className="relative h-40 sm:h-48 bg-gray-100 dark:bg-[#1a1a1a]">
                <ImageWithFallback
                  src={game.imageUrl || game.coverImage || undefined}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
                {showMenu && (
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="bg-white dark:bg-[#1e1e1e] h-9 w-9 sm:h-10 sm:w-10 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {showEditOption && (
                          <DropdownMenuItem onClick={() => setEditingGame(game)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Event
                          </DropdownMenuItem>
                        )}
                        {showBookingsOption && (
                          <DropdownMenuItem onClick={() => setViewingBookingsGame(game)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Bookings
                          </DropdownMenuItem>
                        )}
                        {showEmbedOption && (
                          <DropdownMenuItem onClick={() => setEmbedGame(game)}>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Embed & Preview
                          </DropdownMenuItem>
                        )}
                        {showDuplicateOption && (
                          <DropdownMenuItem onClick={() => handleDuplicateGame(game)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                        )}
                        {showDeleteOption &&
                          (showEditOption ||
                            showBookingsOption ||
                            showEmbedOption ||
                            showDuplicateOption) && <DropdownMenuSeparator />}
                        {showDeleteOption && (
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-500 focus:text-red-600 dark:focus:text-red-500"
                            onClick={() => setDeletingGame(game)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 dark:text-white mb-1 truncate">
                      {game.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[#a3a3a3] line-clamp-2">
                      {game.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-sm text-gray-600 dark:text-[#a3a3a3] flex-wrap">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{durationLabel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span>Up to {game.capacity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 flex-shrink-0" />
                    <span>${game.basePrice}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 dark:border-[#2a2a2a] gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={`border ${difficultyClass}`}>
                      {difficultyLabel}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`border ${
                        game.status === 'active'
                          ? 'bg-blue-100 dark:bg-[#4f46e5]/20 text-blue-700 dark:text-[#6366f1] border-blue-200 dark:border-[#4f46e5]/30'
                          : 'bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#737373] border-gray-200 dark:border-[#2a2a2a]'
                      }`}
                    >
                      {game.status}
                    </Badge>
                    {Array.isArray(game.galleryImages) && game.galleryImages.length > 0 && (
                      <Badge variant="secondary" className="border bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#a3a3a3] border-gray-200 dark:border-[#2a2a2a]">
                        Gallery {game.galleryImages.length}
                      </Badge>
                    )}
                    {Array.isArray(game.videos) && game.videos.length > 0 && (
                      <Badge variant="secondary" className="border bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#a3a3a3] border-gray-200 dark:border-[#2a2a2a]">
                        Videos {game.videos.length}
                      </Badge>
                    )}
                    {totalMediaCount === 0 && (
                      <Badge variant="secondary" className="border bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#737373] border-gray-200 dark:border-[#2a2a2a]">
                        No media
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-[#737373] capitalize">
                      {game.status}
                    </span>
                    <Switch
                      checked={game.status === 'active'}
                      disabled={!canEditGame}
                      onCheckedChange={() => toggleGameStatus(String(game.id))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Game Wizard Dialog */}
      <Dialog open={showAddGameWizard} onOpenChange={setShowAddGameWizard}>
        <DialogContent className="!w-[90vw] !max-w-[1000px] h-[90vh] !max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <VisuallyHidden>
            <DialogTitle>Add New Game</DialogTitle>
            <DialogDescription>
              Complete the multi-step wizard to add a new escape room game to your venue
            </DialogDescription>
          </VisuallyHidden>
          {canCreateGame ? (
            <AddGameWizard
              onComplete={handleAddGame}
              onCancel={() => setShowAddGameWizard(false)}
              mode="create"
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-sm text-gray-600 dark:text-gray-400">
              You do not have permission to create events.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Embed & Preview Dialog */}
      <Dialog open={!!embedGame} onOpenChange={(open) => !open && setEmbedGame(null)}>
        <DialogContent className="!w-[90vw] !max-w-[1000px] h-[90vh] !max-h-[90vh] overflow-hidden p-6 flex flex-col gap-4">
          <VisuallyHidden>
            <DialogTitle>Embed & Preview</DialogTitle>
            <DialogDescription>
              Generate an embed URL and preview the widget for this game
            </DialogDescription>
          </VisuallyHidden>
          {embedGame && (
            <ScrollArea className="flex-1 min-h-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2 sm:p-4 pb-24 sm:pb-28">
                <div>
                  <Label className="text-sm text-gray-700 dark:text-gray-300">Base URL</Label>
                  <Input
                    value={embedBaseUrl}
                    onChange={(e) => setEmbedBaseUrl(e.target.value)}
                    placeholder="http://localhost:3000"
                    className="mt-1 h-10 text-sm bg-gray-50 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-gray-300"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Use your site origin for testing (e.g., http://localhost:3000).
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-700 dark:text-gray-300">Embed URL</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={generateSingleGameEmbedUrl(embedGame)}
                      readOnly
                      className="h-10 text-xs font-mono bg-gray-50 dark:bg-[#0a0a0a] border-gray-300 dark:border-[#2a2a2a] text-gray-900 dark:text-gray-300"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generateSingleGameEmbedUrl(embedGame));
                        setCopiedEmbedUrl(true);
                        toast.success('Embed URL copied');
                        setTimeout(() => setCopiedEmbedUrl(false), 2000);
                      }}
                      className="h-10 flex-shrink-0"
                    >
                      {copiedEmbedUrl ? <span>✓</span> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(generateSingleGameEmbedUrl(embedGame), '_blank')}
                      className="h-10 flex-shrink-0"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Theme auto-syncs to your admin mode ({theme === 'dark' ? 'Dark' : 'Light'}).
                  </p>
                </div>
              </div>

              {/* Inline Preview */}
              <div className="flex-1 px-2 sm:px-4">
                <div className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
                  <iframe
                    src={generateSingleGameEmbedUrl(embedGame)}
                    width="100%"
                    height="800"
                    frameBorder="0"
                    allow="payment; camera"
                    allowFullScreen
                    title={`Preview: ${embedGame.name}`}
                    className="bg-white dark:bg-[#0a0a0a]"
                  />
                </div>
              </div>

              {/* Bottom spacer to provide blank space after content */}
              <div className="h-12 sm:h-20" />
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Game Wizard Dialog */}
      <Dialog open={!!editingGame} onOpenChange={(open) => !open && setEditingGame(null)}>
        <DialogContent className="!w-[90vw] !max-w-[1000px] h-[90vh] !max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <VisuallyHidden>
            <DialogTitle>Edit Game</DialogTitle>
            <DialogDescription>
              Edit your escape room game details
            </DialogDescription>
          </VisuallyHidden>
          {editingGame && canEditGame ? (
            <AddGameWizard
              onComplete={handleEditGame}
              onCancel={() => setEditingGame(null)}
              initialData={convertGameToWizardData(editingGame)}
              mode="edit"
            />
          ) : editingGame ? (
            <div className="flex-1 flex items-center justify-center p-8 text-sm text-gray-600 dark:text-gray-400">
              You do not have permission to update events.
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* View Bookings Dialog */}
      <Dialog open={!!viewingBookingsGame} onOpenChange={(open) => !open && setViewingBookingsGame(null)}>
        <DialogContent className="!w-[90vw] !max-w-[1200px] h-[90vh] !max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <VisuallyHidden>
            <DialogTitle>View Game Bookings</DialogTitle>
            <DialogDescription>
              View all bookings for {viewingBookingsGame?.name}
            </DialogDescription>
          </VisuallyHidden>
          {viewingBookingsGame && (
            <ViewGameBookings
              game={viewingBookingsGame}
              onClose={() => setViewingBookingsGame(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingGame} onOpenChange={(open) => !open && setDeletingGame(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this game?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deletingGame?.name}" and all associated data. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!canDeleteGame}
              onClick={handleDeleteGame}
              className="bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700"
            >
              Delete Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
