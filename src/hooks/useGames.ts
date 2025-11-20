/**
 * Games Hook
 * Manages game data using TanStack Query and GameService
 * Provides optimistic updates and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GameService, Game } from '../services/GameService';
import { toast } from 'sonner';

export function useGames(venueId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ['games', venueId];

  // Query: Fetch Games
  const {
    data: games = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey,
    queryFn: () => GameService.getGames(venueId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation: Create Game
  const createMutation = useMutation({
    mutationFn: (gameData: Omit<Game, 'id' | 'created_at' | 'updated_at' | 'created_by'>) =>
      GameService.createGame(gameData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Game created successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create game');
    }
  });

  // Mutation: Update Game (Optimistic)
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Game> }) =>
      GameService.updateGame(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousGames = queryClient.getQueryData<Game[]>(queryKey);

      // Optimistically update
      if (previousGames) {
        queryClient.setQueryData<Game[]>(queryKey, (old) =>
          (old || []).map(game =>
            game.id === id ? { ...game, ...updates } : game
          )
        );
      }

      return { previousGames };
    },
    onError: (err, newGame, context) => {
      // Rollback on error
      if (context?.previousGames) {
        queryClient.setQueryData(queryKey, context.previousGames);
      }
      toast.error('Failed to update game');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Game updated successfully!');
    }
  });

  // Mutation: Delete Game
  const deleteMutation = useMutation({
    mutationFn: (id: string) => GameService.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Game deleted successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to delete game');
    }
  });

  return {
    games,
    loading,
    error: error ? (error as Error).message : null,
    createGame: createMutation.mutateAsync,
    updateGame: (id: string, updates: Partial<Game>) => updateMutation.mutateAsync({ id, updates }),
    deleteGame: deleteMutation.mutateAsync,
    refreshGames: () => queryClient.invalidateQueries({ queryKey }),
    // Helper to get a single game from cache
    getGameById: (id: string) => games.find(g => g.id === id),
    getGamesByVenue: (vid: string) => games.filter(g => g.venue_id === vid)
  };
}
