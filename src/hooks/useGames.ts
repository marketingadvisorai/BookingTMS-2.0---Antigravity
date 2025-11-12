/**
 * Games Database Hook
 * Manages escape room games/events with real-time sync
 * Automatically creates Stripe products/prices for payment processing
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '../lib/auth/AuthContext';
import { StripeProductService } from '../lib/stripe/stripeProductService';

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
  // Stripe integration fields
  stripe_product_id?: string;
  stripe_price_id?: string;
  stripe_prices?: any[];
  stripe_checkout_url?: string;
  stripe_sync_status?: string;
  stripe_last_sync?: string;
}

export function useGames(venueId?: string) {
  const { currentUser } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Fetch games
  const fetchGames = async (showToast = false) => {
    try {
      setError(null);
      // Only show loading spinner on first load, not on refreshes
      if (isFirstLoad) {
        setLoading(true);
      }

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
      if (showToast) {
        toast.error('Failed to load games');
      }
    } finally {
      if (isFirstLoad) {
        setLoading(false);
        setIsFirstLoad(false);
      }
    }
  };

  // Create game with optional Stripe product/price creation
  const createGame = async (gameData: Omit<Game, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    let stripeProductId: string | null = null;
    let stripePriceId: string | null = null;
    
    try {
      console.log('useGames.createGame called with:', gameData);
      console.log('Current user from context:', currentUser);
      
      // Validate venue_id is present
      if (!gameData.venue_id) {
        throw new Error('Venue ID is required to create a game');
      }
      
      // Step 1: Only create Stripe product if price is set and Stripe was configured in wizard
      // Check if Stripe IDs already exist from wizard (Step 6)
      if (gameData.stripe_product_id && gameData.stripe_price_id) {
        console.log('Using Stripe IDs from wizard:', {
          productId: gameData.stripe_product_id,
          priceId: gameData.stripe_price_id,
        });
        stripeProductId = gameData.stripe_product_id;
        stripePriceId = gameData.stripe_price_id;
      } else if (gameData.price && gameData.price > 0) {
        // Only auto-create if there's a price but no Stripe IDs
        try {
          console.log('Attempting to auto-create Stripe product and price...');
          toast.loading('Creating payment product...', { id: 'stripe-create' });
          
          const { productId, priceId } = await StripeProductService.createProductAndPrice({
            name: gameData.name,
            description: gameData.description || `${gameData.name} - ${gameData.duration} minutes`,
            price: gameData.price,
            currency: 'usd',
            metadata: {
              venue_id: gameData.venue_id,
              duration: gameData.duration.toString(),
              difficulty: gameData.difficulty,
              image_url: gameData.image_url || '',
            },
          });
          
          stripeProductId = productId;
          stripePriceId = priceId;
          console.log('Stripe product created:', productId, 'price:', priceId);
          toast.success('Payment product created!', { id: 'stripe-create' });
        } catch (stripeError: any) {
          console.warn('Stripe product creation failed (non-blocking):', stripeError);
          toast.dismiss('stripe-create');
          // Don't show warning toast - just continue without Stripe
          console.log('Continuing without Stripe integration');
          // Continue without Stripe - not critical for game creation
        }
      } else {
        console.log('No price set or Stripe not configured - skipping Stripe product creation');
      }
      
      // Step 2: Get Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      
      if (userId) {
        console.log('Using Supabase user ID:', userId);
      } else {
        console.log('No Supabase session - proceeding with anon access');
      }

      // Step 3: Save game to database (with or without Stripe IDs)
      const insertData = {
        ...gameData,
        created_by: userId,
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
        stripe_sync_status: stripeProductId ? 'synced' : 'pending',
        stripe_last_sync: stripeProductId ? new Date().toISOString() : null,
      };

      console.log('Inserting game data:', insertData);

      const { data, error: insertError } = await supabase
        .from('games')
        .insert([insertData])
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        });
        throw insertError;
      }

      // Step 4: Update Stripe product metadata with game ID (if Stripe was created)
      if (stripeProductId) {
        try {
          console.log('Updating Stripe product with game ID:', data.id);
          await StripeProductService.updateProductMetadata(stripeProductId, {
            game_id: data.id,
          });
        } catch (updateError) {
          console.warn('Failed to update Stripe metadata (non-critical):', updateError);
        }
      }

      console.log('Game created successfully in database:', data);
      toast.success(stripeProductId ? 'Game created and ready for payments!' : 'Game created successfully!');
      
      // Force refresh the games list (don't show toast to avoid duplicate messages)
      await fetchGames(false);
      
      return data;
    } catch (err: any) {
      console.error('Error creating game:', {
        message: err?.message,
        code: err?.code,
        details: err?.details,
        hint: err?.hint,
        stack: err?.stack,
      });
      
      // Rollback: Archive Stripe product if game creation failed
      if (stripeProductId) {
        console.log('Rolling back: Archiving Stripe product', stripeProductId);
        await StripeProductService.archiveProduct(stripeProductId);
        toast.error('Failed to create game. Stripe product has been archived.');
      } else {
        toast.error(err.message || 'Failed to create game');
      }
      
      throw err;
    }
  };

  // Update game with Stripe product/price updates
  const updateGame = async (id: string, updates: Partial<Game>) => {
    try {
      // Get current game data
      const { data: currentGame } = await supabase
        .from('games')
        .select('*')
        .eq('id', id)
        .single();

      if (!currentGame) {
        throw new Error('Game not found');
      }

      // Check if we need to update Stripe
      const needsStripeUpdate = 
        updates.name || 
        updates.description || 
        updates.price;

      if (needsStripeUpdate && currentGame.stripe_product_id) {
        console.log('Updating Stripe product...');
        toast.loading('Updating payment product...', { id: 'stripe-update' });

        // Update product if name or description changed
        if (updates.name || updates.description) {
          await StripeProductService.updateProduct(currentGame.stripe_product_id, {
            name: updates.name,
            description: updates.description,
          });
        }

        // Create new price if price changed (prices are immutable in Stripe)
        if (updates.price && StripeProductService.priceHasChanged(currentGame.price, updates.price)) {
          const newPriceId = await StripeProductService.createPrice(
            currentGame.stripe_product_id,
            {
              amount: updates.price,
              currency: 'usd',
            }
          );
          updates.stripe_price_id = newPriceId;
          console.log('New Stripe price created:', newPriceId);
        }

        updates.stripe_sync_status = 'synced';
        updates.stripe_last_sync = new Date().toISOString();
        toast.success('Payment product updated!', { id: 'stripe-update' });
      }

      // Update game in database
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
      // First check if there are any bookings for this game
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('id')
        .eq('game_id', id)
        .limit(1);

      if (bookingsError) {
        console.error('Error checking bookings:', bookingsError);
      }

      if (bookings && bookings.length > 0) {
        toast.error('Cannot delete game with existing bookings. Please cancel all bookings first or archive the game instead.', {
          duration: 5000,
        });
        throw new Error('Game has existing bookings');
      }

      // If no bookings, proceed with deletion
      const { error: deleteError } = await supabase
        .from('games')
        .delete()
        .eq('id', id);

      if (deleteError) {
        // Handle foreign key constraint error with user-friendly message
        if (deleteError.code === '23503') {
          toast.error('Cannot delete game with existing bookings. Please cancel all bookings first or archive the game instead.', {
            duration: 5000,
          });
        } else {
          throw deleteError;
        }
        throw deleteError;
      }

      toast.success('Game deleted successfully!');
      await fetchGames(); // Refresh list
    } catch (err: any) {
      console.error('Error deleting game:', err);
      if (err.message !== 'Game has existing bookings' && err.code !== '23503') {
        toast.error(err.message || 'Failed to delete game');
      }
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
