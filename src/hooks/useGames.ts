/**
 * Games Hook
 * Manages game data using TanStack Query and inventoryService
 * Provides optimistic updates and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../modules/inventory/services/inventoryService';
import { Game, CreateGameDTO, UpdateGameDTO } from '../modules/inventory/types';
import { toast } from 'sonner';
import { useAuth } from '../lib/auth/AuthContext';

export function useGames(venueId?: string) {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const organizationId = currentUser?.organizationId || '';
  const queryKey = ['games', venueId, organizationId];

  // Query: Fetch Games
  const {
    data: games = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey,
    queryFn: () => inventoryService.getGames(organizationId, venueId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation: Create Game
  const createMutation = useMutation({
    mutationFn: (gameData: Omit<Game, 'id' | 'created_at' | 'updated_at'>) => {
      // Ensure required fields are present. 
      // Note: The caller should ideally provide a complete CreateGameDTO.
      // We cast here assuming the input matches what's needed or we might need to map it.
      // For now, we pass it through, but we might need to inject organization_id if missing.
      const payload = {
        ...gameData,
        organization_id: gameData.organization_id || organizationId,
        venue_id: gameData.venue_id || venueId || '',
      } as CreateGameDTO;

      return inventoryService.createGame(payload);
    },
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
      inventoryService.updateGame(id, updates as UpdateGameDTO),
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
    mutationFn: (id: string) => inventoryService.deleteGame(id),
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
