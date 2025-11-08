/**
 * Waivers Database Hook
 * Manages waiver templates and submissions with real-time sync
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Waiver {
  id: string;
  venue_id: string;
  name: string;
  content: string;
  version: string;
  status: 'active' | 'inactive' | 'draft';
  required_for_booking: boolean;
  settings: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useWaivers(venueId?: string) {
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch waivers
  const fetchWaivers = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('waivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (venueId) {
        query = query.eq('venue_id', venueId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setWaivers(data || []);
    } catch (err: any) {
      console.error('Error fetching waivers:', err);
      setError(err.message);
      toast.error('Failed to load waivers');
    } finally {
      setLoading(false);
    }
  };

  // Create waiver
  const createWaiver = async (waiverData: Omit<Waiver, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: insertError } = await supabase
        .from('waivers')
        .insert([{
          ...waiverData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Waiver created successfully!');
      await fetchWaivers(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error creating waiver:', err);
      toast.error(err.message || 'Failed to create waiver');
      throw err;
    }
  };

  // Update waiver
  const updateWaiver = async (id: string, updates: Partial<Waiver>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('waivers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Waiver updated successfully!');
      await fetchWaivers(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error updating waiver:', err);
      toast.error(err.message || 'Failed to update waiver');
      throw err;
    }
  };

  // Delete waiver
  const deleteWaiver = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('waivers')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Waiver deleted successfully!');
      await fetchWaivers(); // Refresh list
    } catch (err: any) {
      console.error('Error deleting waiver:', err);
      toast.error(err.message || 'Failed to delete waiver');
      throw err;
    }
  };

  // Get waiver by ID
  const getWaiverById = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('waivers')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err: any) {
      console.error('Error fetching waiver:', err);
      toast.error('Failed to load waiver details');
      throw err;
    }
  };

  // Get active waiver for venue
  const getActiveWaiver = async (venueId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('waivers')
        .select('*')
        .eq('venue_id', venueId)
        .eq('status', 'active')
        .eq('required_for_booking', true)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError; // PGRST116 = no rows

      return data;
    } catch (err: any) {
      console.error('Error fetching active waiver:', err);
      return null;
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchWaivers();

    // Subscribe to waiver changes
    const subscription = supabase
      .channel('waivers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'waivers' },
        (payload) => {
          console.log('Waiver changed:', payload);
          fetchWaivers(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [venueId]);

  return {
    waivers,
    loading,
    error,
    createWaiver,
    updateWaiver,
    deleteWaiver,
    getWaiverById,
    getActiveWaiver,
    refreshWaivers: fetchWaivers,
  };
}
