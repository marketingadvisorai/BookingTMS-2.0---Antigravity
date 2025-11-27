/**
 * Widget Real-time Subscription Hook
 * 
 * Provides real-time updates for widget embeds.
 * Subscribes to activities, sessions, and venue changes.
 * 
 * @usage
 * ```tsx
 * const { isConnected, lastUpdate } = useWidgetRealtime({
 *   venueId: 'venue-uuid',
 *   activityId: 'activity-uuid', // optional
 *   onUpdate: (payload) => refetch(),
 * });
 * ```
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface UseWidgetRealtimeProps {
  venueId?: string;
  activityId?: string;
  onUpdate?: (payload: RealtimePayload) => void;
  debounceMs?: number;
}

interface RealtimePayload {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: Record<string, any>;
  old?: Record<string, any>;
}

interface UseWidgetRealtimeResult {
  isConnected: boolean;
  lastUpdate: Date | null;
  error: string | null;
}

/**
 * Hook for real-time widget updates
 */
export function useWidgetRealtime({
  venueId,
  activityId,
  onUpdate,
  debounceMs = 500,
}: UseWidgetRealtimeProps): UseWidgetRealtimeResult {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced update handler
  const handleUpdate = useCallback((payload: RealtimePayload) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setLastUpdate(new Date());
      onUpdate?.(payload);
    }, debounceMs);
  }, [onUpdate, debounceMs]);

  useEffect(() => {
    if (!venueId && !activityId) {
      return;
    }

    const channelName = activityId 
      ? `widget-activity-${activityId}` 
      : `widget-venue-${venueId}`;

    console.log(`🔄 [Widget] Setting up real-time subscription: ${channelName}`);

    const channel = supabase.channel(channelName);

    // Subscribe to activity changes
    if (activityId) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activities',
          filter: `id=eq.${activityId}`,
        },
        (payload) => {
          console.log('🔔 [Widget] Activity update:', payload.eventType);
          handleUpdate({
            table: 'activities',
            eventType: payload.eventType as any,
            new: payload.new as any,
            old: payload.old as any,
          });
        }
      );

      // Subscribe to session changes for this activity
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_sessions',
          filter: `activity_id=eq.${activityId}`,
        },
        (payload) => {
          console.log('🔔 [Widget] Session update:', payload.eventType);
          handleUpdate({
            table: 'activity_sessions',
            eventType: payload.eventType as any,
            new: payload.new as any,
            old: payload.old as any,
          });
        }
      );
    }

    // Subscribe to venue changes (for both activity and venue embeds)
    if (venueId) {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venues',
          filter: `id=eq.${venueId}`,
        },
        (payload) => {
          console.log('🔔 [Widget] Venue update:', payload.eventType);
          handleUpdate({
            table: 'venues',
            eventType: payload.eventType as any,
            new: payload.new as any,
            old: payload.old as any,
          });
        }
      );

      // For venue embeds, also subscribe to all activities in the venue
      if (!activityId) {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activities',
            filter: `venue_id=eq.${venueId}`,
          },
          (payload) => {
            console.log('🔔 [Widget] Venue activity update:', payload.eventType);
            handleUpdate({
              table: 'activities',
              eventType: payload.eventType as any,
              new: payload.new as any,
              old: payload.old as any,
            });
          }
        );

        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'activity_sessions',
            filter: `venue_id=eq.${venueId}`,
          },
          (payload) => {
            console.log('🔔 [Widget] Venue session update:', payload.eventType);
            handleUpdate({
              table: 'activity_sessions',
              eventType: payload.eventType as any,
              new: payload.new as any,
              old: payload.old as any,
            });
          }
        );
      }
    }

    // Subscribe and handle connection state
    channel.subscribe((status) => {
      console.log(`🔌 [Widget] Subscription status: ${status}`);
      
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        setError(null);
      } else if (status === 'CHANNEL_ERROR') {
        setIsConnected(false);
        setError('Failed to connect to real-time updates');
      } else if (status === 'TIMED_OUT') {
        setIsConnected(false);
        setError('Connection timed out');
      }
    });

    channelRef.current = channel;

    // Cleanup
    return () => {
      console.log(`🔌 [Widget] Cleaning up subscription: ${channelName}`);
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      
      setIsConnected(false);
    };
  }, [venueId, activityId, handleUpdate]);

  return { isConnected, lastUpdate, error };
}

export default useWidgetRealtime;
