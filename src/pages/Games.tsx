import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { PageHeader } from '../components/layout/PageHeader';
import { PageLoadingScreen } from '../components/layout/PageLoadingScreen';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Info, Users, Clock, DollarSign, ExternalLink, RefreshCcw } from 'lucide-react';
import { useGames } from '../hooks/useGames';
import { useVenues } from '../hooks/useVenues';
import { toast } from 'sonner';

const formatDifficulty = (value?: string | null) => {
  if (!value) return 'Unknown';
  const normalized = value.toLowerCase();
  if (normalized.includes('easy')) return 'Easy';
  if (normalized.includes('medium')) return 'Medium';
  if (normalized.includes('hard')) return 'Hard';
  if (normalized.includes('extreme')) return 'Extreme';
  return value;
};

const difficultyBadgeClass = (label: string) => {
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

interface GamesProps {
  onNavigate?: (page: string) => void;
}

export function Games({ onNavigate }: GamesProps = {}) {
  const { games, loading, refreshGames } = useGames();
  const { venues, loading: venuesLoading, refreshVenues } = useVenues();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshGames(), refreshVenues()]);
      toast.success('Games refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh games');
    } finally {
      setIsRefreshing(false);
    }
  };

  const stats = useMemo(() => {
    const total = games.length;
    const active = games.filter((game) => game.status === 'active').length;
    const totalCapacity = games.reduce((sum, game) => sum + (game.max_players ?? 0), 0);
    const totalPrice = games.reduce((sum, game) => sum + Number(game.price ?? 0), 0);

    return {
      totalGames: total,
      activeGames: active,
      totalCapacity,
      averagePrice: total > 0 ? Math.round(totalPrice / total) : 0,
    };
  }, [games]);

  const findVenue = (venueId?: string | null) => venues.find((venue) => venue.id === venueId);

  if (loading || venuesLoading) {
    return <PageLoadingScreen message="Loading games..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Events / Rooms"
        description="Games and experiences are now managed from within each venue so that embed keys stay in sync. Use this page to review everything that's live."
        sticky
        action={
          <Button 
            variant="outline"
            className="h-11"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCcw className={`w-4 h-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        }
      />

      <Card className="border-dashed border-2">
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-[#6366f1] mt-0.5" />
            <div>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                Create and edit games from the Venues page.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Open any venue, create games there, and they'll appear here automatically with the correct embed key.
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="sm:ml-auto"
            onClick={() => onNavigate?.('venues')}
          >
            Go to Venues
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mb-1">Total Games</p>
            <p className="text-gray-900 dark:text-white text-lg">{stats.totalGames}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mb-1">Active Games</p>
            <p className="text-gray-900 dark:text-white text-lg">{stats.activeGames}</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mb-1">Total Capacity</p>
            <p className="text-gray-900 dark:text-white text-sm">{stats.totalCapacity} players</p>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#737373] mb-1">Avg. Price</p>
            <p className="text-gray-900 dark:text-white text-sm">${stats.averagePrice}/person</p>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6 text-sm text-gray-600 dark:text-gray-400">
            Loading games...
          </CardContent>
        </Card>
      ) : games.length === 0 ? (
        <Card className="border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-6 text-sm text-gray-600 dark:text-gray-400">
            No games yet. Create games inside a venue and they will appear here automatically.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {games.map((game) => {
            const venue = findVenue(game.venue_id);
            const difficultyLabel = formatDifficulty(game.difficulty);
            const minPlayers = game.min_players ?? 0;
            const maxPlayers = game.max_players ?? 0;
            const durationLabel = game.duration ? `${game.duration} min` : 'No duration set';
            const priceLabel = typeof game.price === 'number' ? `$${game.price}` : 'No price set';
            const statusBadgeClass =
              game.status === 'active'
                ? 'bg-blue-100 dark:bg-[#4f46e5]/20 text-blue-700 dark:text-[#6366f1] border-blue-200 dark:border-[#4f46e5]/30'
                : 'bg-gray-100 dark:bg-[#1e1e1e] text-gray-700 dark:text-[#737373] border-gray-200 dark:border-[#2a2a2a]';

            return (
              <Card key={game.id} className="border-gray-200 dark:border-[#2a2a2a]">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-base text-gray-900 dark:text-white truncate">
                    {game.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-[#a3a3a3] line-clamp-3">
                    {game.description || 'No description provided.'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Venue: {venue ? venue.name : 'Unassigned'}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-[#a3a3a3]">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        {minPlayers} - {maxPlayers} players
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{durationLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>{priceLabel}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={`border ${difficultyBadgeClass(difficultyLabel)}`}>
                      {difficultyLabel}
                    </Badge>
                    <Badge variant="secondary" className={`border ${statusBadgeClass}`}>
                      {game.status}
                    </Badge>
                  </div>

                  {venue ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => onNavigate?.('venues')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Go to Venue
                    </Button>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      No venue assigned yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
