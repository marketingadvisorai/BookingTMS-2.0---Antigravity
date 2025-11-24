/**
 * Widgets Database Hook
 * Manages booking widgets with real-time sync
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Widget {
  id: string;
  venue_id: string;
  game_id?: string;
  name: string;
  type: 'calendar' | 'single-event' | 'multi-step' | 'embedded' | 'popup' | 'inline';
  status: 'active' | 'inactive' | 'draft';
  settings: Record<string, any>;
  embed_code?: string;
  custom_css?: string;
  custom_js?: string;
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useWidgets(venueId?: string) {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch widgets
  const fetchWidgets = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = (supabase
        .from('widgets') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (venueId) {
        query = query.eq('venue_id', venueId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setWidgets(data || []);
    } catch (err: any) {
      console.error('Error fetching widgets:', err);
      setError(err.message);
      toast.error('Failed to load widgets');
    } finally {
      setLoading(false);
    }
  };

  // Create widget
  const createWidget = async (widgetData: Omit<Widget, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: insertError } = await (supabase
        .from('widgets') as any)
        .insert([{
          ...widgetData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Widget created successfully!');
      await fetchWidgets(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error creating widget:', err);
      toast.error(err.message || 'Failed to create widget');
      throw err;
    }
  };

  // Update widget
  const updateWidget = async (id: string, updates: Partial<Widget>) => {
    try {
      const { data, error: updateError } = await (supabase
        .from('widgets') as any)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Widget updated successfully!');
      await fetchWidgets(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error updating widget:', err);
      toast.error(err.message || 'Failed to update widget');
      throw err;
    }
  };

  // Delete widget
  const deleteWidget = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('widgets')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Widget deleted successfully!');
      await fetchWidgets(); // Refresh list
    } catch (err: any) {
      console.error('Error deleting widget:', err);
      toast.error(err.message || 'Failed to delete widget');
      throw err;
    }
  };

  // Get widget by ID
  const getWidgetById = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('widgets')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err: any) {
      console.error('Error fetching widget:', err);
      toast.error('Failed to load widget details');
      throw err;
    }
  };

  // Sync game from widget (creates/updates game based on widget settings)
  const syncGameFromWidget = async (widgetId: string, gameData: any) => {
    try {
      const { data, error: syncError } = await supabase
        .rpc('sync_game_from_widget', {
          p_widget_id: widgetId,
          p_game_data: gameData,
        } as any);

      if (syncError) throw syncError;

      toast.success('Game synced from widget successfully!');
      return data;
    } catch (err: any) {
      console.error('Error syncing game from widget:', err);
      toast.error(err.message || 'Failed to sync game');
      throw err;
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchWidgets();

    // Subscribe to widget changes
    const subscription = supabase
      .channel('widgets-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'widgets' },
        (payload) => {
          console.log('Widget changed:', payload);
          fetchWidgets(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [venueId]);

  return {
    widgets,
    loading,
    error,
    createWidget,
    updateWidget,
    deleteWidget,
    getWidgetById,
    syncGameFromWidget,
    refreshWidgets: fetchWidgets,
  };
}
