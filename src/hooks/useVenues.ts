/**
 * Venues Database Hook
 * Manages venue data with real-time sync
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
  capacity: number;
  timezone: string;
  status: 'active' | 'inactive' | 'maintenance';
  settings: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch venues
  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('venues')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setVenues(data || []);
    } catch (err: any) {
      console.error('Error fetching venues:', err);
      setError(err.message);
      toast.error('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  // Create venue
  const createVenue = async (venueData: Omit<Venue, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: insertError } = await supabase
        .from('venues')
        .insert([{
          ...venueData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Venue created successfully!');
      await fetchVenues(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error creating venue:', err);
      toast.error(err.message || 'Failed to create venue');
      throw err;
    }
  };

  // Update venue
  const updateVenue = async (id: string, updates: Partial<Venue>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('venues')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Venue updated successfully!');
      await fetchVenues(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error updating venue:', err);
      toast.error(err.message || 'Failed to update venue');
      throw err;
    }
  };

  // Delete venue
  const deleteVenue = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('venues')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Venue deleted successfully!');
      await fetchVenues(); // Refresh list
    } catch (err: any) {
      console.error('Error deleting venue:', err);
      toast.error(err.message || 'Failed to delete venue');
      throw err;
    }
  };

  // Get venue by ID
  const getVenueById = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('venues')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err: any) {
      console.error('Error fetching venue:', err);
      toast.error('Failed to load venue details');
      throw err;
    }
  };

  // Get venue statistics
  const getVenueStats = async (venueId: string) => {
    try {
      const { data, error: statsError } = await supabase
        .rpc('get_venue_stats', { p_venue_id: venueId });

      if (statsError) throw statsError;

      return data;
    } catch (err: any) {
      console.error('Error fetching venue stats:', err);
      return null;
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchVenues();

    // Subscribe to venue changes
    const subscription = supabase
      .channel('venues-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'venues' },
        (payload) => {
          console.log('Venue changed:', payload);
          fetchVenues(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    venues,
    loading,
    error,
    createVenue,
    updateVenue,
    deleteVenue,
    getVenueById,
    getVenueStats,
    refreshVenues: fetchVenues,
  };
}
