/**
 * Step 1: Game Selection Component
 * 
 * First step in booking flow - user selects which escape room game to play.
 * Displays games as attractive cards with images, difficulty, and details.
 * 
 * UX Features:
 * - Grid layout (responsive: 1 col mobile, 2-3 cols desktop)
 * - Large, tappable game cards
 * - Clear difficulty badges
 * - "Popular" indicators
 * - Hover animations
 * - Loading skeletons
 * - Empty state handling
 * 
 * For AI Agents:
 * - Fetches games from Supabase
 * - Uses React Query for caching
 * - Filters active games only
 * - Sorts by popularity/name
 * 
 * @module components/booking/steps
 */

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Star,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { Game, GameSelectionStepProps } from '../types';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Fetch active games for organization
 */
async function fetchGames(organizationId: string): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('name', { ascending: true });
  
  if (error) {
    console.error('Failed to fetch games:', error);
    throw new Error('Unable to load games. Please try again.');
  }
  
  return data || [];
}

/**
 * Get difficulty badge styling
 */
function getDifficultyStyle(difficulty: string): string {
  const styles: Record<string, string> = {
    easy: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    hard: 'bg-orange-100 text-orange-700 border-orange-200',
    expert: 'bg-red-100 text-red-700 border-red-200',
  };
  return styles[difficulty] || 'bg-gray-100 text-gray-700 border-gray-200';
}

/**
 * Format player range
 */
function formatPlayerRange(min: number, max: number): string {
  if (min === max) return `${min} players`;
  return `${min}-${max} players`;
}

// =============================================================================
// LOADING SKELETON
// =============================================================================

function GameCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200" />
      <CardContent className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// GAME CARD COMPONENT
// =============================================================================

interface GameCardProps {
  game: Game;
  selected: boolean;
  onSelect: (game: Game) => void;
}

function GameCard({ game, selected, onSelect }: GameCardProps) {
  // Mock popularity (in real app, fetch from analytics)
  const isPopular = game.difficulty === 'medium' || game.difficulty === 'hard';
  
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`
          overflow-hidden cursor-pointer transition-all duration-200
          ${selected
            ? 'ring-2 ring-primary shadow-lg'
            : 'hover:shadow-md'
          }
        `}
        onClick={() => onSelect(game)}
      >
        {/* Game Image */}
        <div className="relative aspect-video bg-gray-100">
          <ImageWithFallback
            src={game.image_url || ''}
            alt={game.name}
            className="w-full h-full object-cover"
          />
          
          {/* Popular Badge */}
          {isPopular && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-primary text-white shadow-md">
                <TrendingUp className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            </div>
          )}
          
          {/* Selected Indicator */}
          {selected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 left-2"
            >
              <div className="bg-primary text-white p-2 rounded-full shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Game Details */}
        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3 className={`
            font-bold text-lg line-clamp-1
            ${selected ? 'text-primary' : 'text-gray-900'}
          `}>
            {game.name}
          </h3>
          
          {/* Description */}
          {game.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {game.description}
            </p>
          )}
          
          {/* Meta Info */}
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{game.duration_minutes} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{formatPlayerRange(game.min_players, game.max_players)}</span>
            </div>
          </div>
          
          {/* Difficulty & Price */}
          <div className="flex items-center justify-between pt-2">
            <Badge className={getDifficultyStyle(game.difficulty)}>
              {game.difficulty.charAt(0).toUpperCase() + game.difficulty.slice(1)}
            </Badge>
            <span className="text-lg font-bold text-primary">
              ${game.price}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Step1_GameSelection Component
 * 
 * First step: Choose escape room game
 */
export function Step1_GameSelection({
  bookingState,
  onNext,
  onUpdate,
  organizationId,
}: GameSelectionStepProps) {
  // Fetch games
  const { data: games, isLoading, error } = useQuery({
    queryKey: ['games', organizationId],
    queryFn: () => fetchGames(organizationId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const selectedGame = bookingState.selectedGame;
  
  // Handle game selection
  const handleSelectGame = (game: Game) => {
    onUpdate({ type: 'SELECT_GAME', payload: game });
  };
  
  // Handle continue
  const handleContinue = () => {
    if (selectedGame) {
      onNext();
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Choose Your Adventure
          </h2>
          <p className="text-gray-600">
            Loading available escape rooms...
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Star className="w-12 h-12 mx-auto mb-2" />
          <p className="font-semibold">Unable to load games</p>
          <p className="text-sm text-gray-600 mt-2">
            {error instanceof Error ? error.message : 'Please try again later'}
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>
    );
  }
  
  // Empty state
  if (!games || games.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Games Available
        </h3>
        <p className="text-gray-600">
          There are no escape rooms available at the moment.
        </p>
      </div>
    );
  }
  
  // Main render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Choose Your Adventure
        </h2>
        <p className="text-gray-600">
          Select an escape room to begin your booking
        </p>
      </div>
      
      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => (
          <GameCard
            key={game.id}
            game={game}
            selected={selectedGame?.id === game.id}
            onSelect={handleSelectGame}
          />
        ))}
      </div>
      
      {/* Continue Button */}
      {selectedGame && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end pt-4"
        >
          <Button
            size="lg"
            onClick={handleContinue}
            className="min-w-[200px]"
          >
            Continue to Date & Time
          </Button>
        </motion.div>
      )}
    </div>
  );
}
