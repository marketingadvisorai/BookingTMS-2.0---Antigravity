/**
 * Games Hook (Deprecated - Wrapper around useServiceItems)
 * Manages game data using useServiceItems hook
 * Provides backward compatibility for components still using useGames
 */

import { useServiceItems, ServiceItem } from './useServiceItems';
import { Game, CreateGameDTO, UpdateGameDTO } from '../modules/inventory/types';

export function useGames(venueId?: string) {
  const {
    serviceItems,
    loading,
    error,
    createServiceItem,
    updateServiceItem,
    deleteServiceItem,
    refreshServiceItems
  } = useServiceItems(venueId);

  // Map ServiceItem to Game
  const mapToGame = (item: ServiceItem): Game => ({
    id: item.id,
    organization_id: item.organization_id,
    venue_id: item.venue_id,
    name: item.name,
    description: item.description,
    difficulty: (item.difficulty?.toLowerCase() as any) || 'medium',
    duration_minutes: item.duration,
    min_players: item.min_players || 1,
    max_players: item.max_players || 10,
    price: item.price,
    image_url: item.image_url,
    is_active: item.status === 'active',
    created_at: item.created_at,
    updated_at: item.updated_at,
    // Legacy fields not in ServiceItem or mapped differently
    video_url: undefined,
  });

  const games: Game[] = serviceItems.map(mapToGame);

  return {
    games,
    loading,
    error: error ? (error as Error).message : null,

    createGame: async (data: CreateGameDTO) => {
      // Map CreateGameDTO to CreateActivityInput (via createServiceItem)
      // We need to match what createServiceItem expects (unflattened or flattened?)
      // useServiceItems expects "newItem" which it un-flattens.
      // So we pass a flattened object compatible with ServiceItem
      const payload = {
        ...data,
        duration: data.duration_minutes,
        status: data.is_active ? 'active' : 'inactive',
        // Add defaults for required fields if missing
        difficulty: data.difficulty || 'Medium',
      };
      await createServiceItem(payload);
    },

    updateGame: async (id: string, updates: Partial<Game>) => {
      const payload: any = { ...updates };
      if (updates.duration_minutes) {
        payload.duration = updates.duration_minutes;
        delete payload.duration_minutes;
      }
      if (updates.is_active !== undefined) {
        payload.status = updates.is_active ? 'active' : 'inactive';
        delete payload.is_active;
      }
      await updateServiceItem({ id, updates: payload });
    },

    deleteGame: deleteServiceItem,
    refreshGames: refreshServiceItems,

    getGameById: (id: string) => games.find(g => g.id === id),
    getGamesByVenue: (vid: string) => games.filter(g => g.venue_id === vid)
  };
}
