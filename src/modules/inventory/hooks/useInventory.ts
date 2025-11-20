import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';
import { Game, CreateGameDTO } from '../types';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../../lib/auth/AuthContext';

export function useInventory() {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const gamesQuery = useQuery({
    queryKey: ['games', currentUser?.organizationId],
    queryFn: () => inventoryService.getGames(currentUser!.organizationId),
    enabled: !!currentUser?.organizationId,
  });

  const statsQuery = useQuery({
    queryKey: ['inventoryStats', currentUser?.organizationId],
    queryFn: () => inventoryService.getStats(currentUser!.organizationId),
    enabled: !!currentUser?.organizationId,
  });

  const createGameMutation = useMutation({
    mutationFn: (gameData: CreateGameDTO) => inventoryService.createGame(gameData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
      toast.success('Game created successfully');
    },
    onError: (error) => {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
    }
  });

  const updateGameMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => 
      inventoryService.updateGame(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
      toast.success('Game updated successfully');
    },
    onError: (error) => {
      console.error('Error updating game:', error);
      toast.error('Failed to update game');
    }
  });

  const deleteGameMutation = useMutation({
    mutationFn: (id: string) => inventoryService.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryStats'] });
      toast.success('Game deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
    }
  });

  // Wrapper functions to match previous interface
  const createGame = async (gameData: CreateGameDTO) => {
    return createGameMutation.mutateAsync(gameData);
  };

  const updateGame = async (id: string, updates: any) => {
    return updateGameMutation.mutateAsync({ id, updates });
  };

  const deleteGame = async (id: string) => {
    return deleteGameMutation.mutateAsync(id);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    return updateGameMutation.mutateAsync({ 
      id, 
      updates: { is_active: !currentStatus } 
    });
  };

  const duplicateGame = async (game: Game) => {
    const duplicateData: CreateGameDTO = {
      organization_id: game.organization_id,
      venue_id: game.venue_id,
      name: `${game.name} (Copy)`,
      difficulty: game.difficulty,
      duration_minutes: game.duration_minutes,
      min_players: game.min_players,
      max_players: game.max_players,
      price: game.price,
      image_url: game.image_url,
      is_active: false,
      description: game.description
    };
    return createGameMutation.mutateAsync(duplicateData);
  };

  return {
    games: gamesQuery.data || [],
    stats: statsQuery.data || null,
    isLoading: gamesQuery.isLoading || statsQuery.isLoading,
    isError: gamesQuery.isError || statsQuery.isError,
    refresh: () => {
      gamesQuery.refetch();
      statsQuery.refetch();
    },
    createGame,
    updateGame,
    toggleStatus,
    deleteGame,
    duplicateGame
  };
}
