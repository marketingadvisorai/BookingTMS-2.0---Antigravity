/**
 * Games Database Hook
 * Manages escape room games/events with real-time sync
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Game {
  id: string;
  venue_id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  duration: number; // in minutes
  min_players: number;
  max_players: number;
  price: number;
  image_url?: string;
  status: 'active' | 'inactive' | 'maintenance';
  settings: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useGames(venueId?: string) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch games
  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('games')
        .select('*')
        .order('created_at', { ascending: false });

      if (venueId) {
        query = query.eq('venue_id', venueId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setGames(data || []);
    } catch (err: any) {
      console.error('Error fetching games:', err);
      setError(err.message);
      toast.error('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  // Create game
  const createGame = async (gameData: Omit<Game, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: insertError } = await supabase
        .from('games')
        .insert([{
          ...gameData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Game created successfully!');
      await fetchGames(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error creating game:', err);
      toast.error(err.message || 'Failed to create game');
      throw err;
    }
  };

  // Update game
  const updateGame = async (id: string, updates: Partial<Game>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('games')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Game updated successfully!');
      await fetchGames(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error updating game:', err);
      toast.error(err.message || 'Failed to update game');
      throw err;
    }
  };

  // Delete game
  const deleteGame = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Game deleted successfully!');
      await fetchGames(); // Refresh list
    } catch (err: any) {
      console.error('Error deleting game:', err);
      toast.error(err.message || 'Failed to delete game');
      throw err;
    }
  };

  // Get game by ID
  const getGameById = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err: any) {
      console.error('Error fetching game:', err);
      toast.error('Failed to load game details');
      throw err;
    }
  };

  // Get games by venue
  const getGamesByVenue = async (venueId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('games')
        .select('*')
        .eq('venue_id', venueId)
        .eq('status', 'active')
        .order('name');

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching games by venue:', err);
      return [];
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchGames();

    // Subscribe to game changes
    const subscription = supabase
      .channel('games-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'games' },
        (payload) => {
          console.log('Game changed:', payload);
          fetchGames(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [venueId]);

  return {
    games,
    loading,
    error,
    createGame,
    updateGame,
    deleteGame,
    getGameById,
    getGamesByVenue,
    refreshGames: fetchGames,
  };
}
