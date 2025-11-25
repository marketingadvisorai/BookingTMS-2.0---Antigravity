import { useState, useEffect, useCallback, useRef } from 'react';
import { VenueService, Venue } from '../services/venue.service';
import { ActivityService, Activity } from '../modules/inventory/services/activity.service';
import { SessionService, Session } from '../services/session.service';
import { supabase } from '../lib/supabase';
import { startOfDay, endOfDay, addDays } from 'date-fns';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseWidgetDataProps {
    venueId?: string;
    activityId?: string;
    date?: Date;
    enableRealtime?: boolean; // Enable real-time subscriptions
}

/**
 * useWidgetData Hook
 * 
 * Fetches venue, activities, and sessions data for booking widgets.
 * Supports real-time updates via Supabase subscriptions.
 * 
 * Real-time updates when:
 * - Activity is updated (price, schedule changes)
 * - Session is updated (capacity changes from bookings)
 * - New sessions are generated
 */
export const useWidgetData = ({ venueId, activityId, date, enableRealtime = true }: UseWidgetDataProps) => {
    const [venue, setVenue] = useState<Venue | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState({
        venue: false,
        activities: false,
        sessions: false
    });
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    
    // Track subscriptions for cleanup
    const activitiesChannelRef = useRef<RealtimeChannel | null>(null);
    const sessionsChannelRef = useRef<RealtimeChannel | null>(null);

    // Fetch Venue
    useEffect(() => {
        if (!venueId) return;

        const fetchVenue = async () => {
            setLoading(prev => ({ ...prev, venue: true }));
            try {
                const data = await VenueService.getVenue(venueId);
                setVenue(data);
            } catch (err: any) {
                console.error('Error fetching venue:', err);
                setError(err.message);
            } finally {
                setLoading(prev => ({ ...prev, venue: false }));
            }
        };

        fetchVenue();
    }, [venueId]);

    // Fetch Activities
    useEffect(() => {
        if (!venueId) return;

        const fetchActivities = async () => {
            setLoading(prev => ({ ...prev, activities: true }));
            try {
                const data = await ActivityService.listActivities(venueId);
                // Filter only active activities
                const activeActivities = data.filter(a => a.status === 'active');
                setActivities(activeActivities);
            } catch (err: any) {
                console.error('Error fetching activities:', err);
                setError(err.message);
            } finally {
                setLoading(prev => ({ ...prev, activities: false }));
            }
        };

        fetchActivities();
    }, [venueId]);

    // Fetch Sessions
    const fetchSessions = useCallback(async (targetActivityId: string, targetDate: Date) => {
        setLoading(prev => ({ ...prev, sessions: true }));
        try {
            // Fetch for the whole day (UTC)
            // Note: Ideally we should respect venue timezone for "start of day"
            // But for now, we fetch a slightly wider range to be safe or rely on client filtering
            // Fetch for a wider range to account for timezone differences
            // We fetch from 1 day before to 2 days after to ensure we cover the full venue day
            // regardless of the user's local timezone.
            const start = startOfDay(addDays(targetDate, -1));
            const end = endOfDay(addDays(targetDate, 1));

            const data = await SessionService.listAvailableSessions(targetActivityId, start, end);
            setSessions(data);
        } catch (err: any) {
            console.error('Error fetching sessions:', err);
            setError(err.message);
            setSessions([]);
        } finally {
            setLoading(prev => ({ ...prev, sessions: false }));
        }
    }, []);

    // Auto-fetch sessions when dependencies change
    useEffect(() => {
        if (activityId && date) {
            fetchSessions(activityId, date);
        } else {
            setSessions([]);
        }
    }, [activityId, date, fetchSessions]);

    // Real-time subscription for activities (price/schedule changes)
    useEffect(() => {
        if (!venueId || !enableRealtime) return;

        // Subscribe to activities changes for this venue
        const activitiesChannel = supabase
            .channel(`activities-venue-${venueId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'activities',
                    filter: `venue_id=eq.${venueId}`
                },
                (payload) => {
                    console.log('[Widget Real-time] Activity change:', payload.eventType);
                    
                    // Refetch activities to get updated data
                    const refetchActivities = async () => {
                        try {
                            const data = await ActivityService.listActivities(venueId);
                            const activeActivities = data.filter(a => a.status === 'active');
                            setActivities(activeActivities);
                            setLastUpdate(new Date());
                        } catch (err) {
                            console.error('Error refetching activities:', err);
                        }
                    };
                    refetchActivities();
                }
            )
            .subscribe();

        activitiesChannelRef.current = activitiesChannel;

        return () => {
            if (activitiesChannelRef.current) {
                supabase.removeChannel(activitiesChannelRef.current);
                activitiesChannelRef.current = null;
            }
        };
    }, [venueId, enableRealtime]);

    // Real-time subscription for sessions (booking capacity changes)
    useEffect(() => {
        if (!activityId || !enableRealtime) return;

        // Subscribe to session changes for this activity
        const sessionsChannel = supabase
            .channel(`sessions-activity-${activityId}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'activity_sessions',
                    filter: `activity_id=eq.${activityId}`
                },
                (payload) => {
                    console.log('[Widget Real-time] Session change:', payload.eventType, payload.new);
                    
                    // Update sessions in state
                    if (payload.eventType === 'UPDATE' && payload.new) {
                        // Update the specific session in the list
                        setSessions(prevSessions => 
                            prevSessions.map(session => 
                                session.id === (payload.new as any).id 
                                    ? { ...session, ...(payload.new as Session) }
                                    : session
                            )
                        );
                        setLastUpdate(new Date());
                    } else if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
                        // Refetch all sessions for significant changes
                        if (date) {
                            fetchSessions(activityId, date);
                        }
                    }
                }
            )
            .subscribe();

        sessionsChannelRef.current = sessionsChannel;

        return () => {
            if (sessionsChannelRef.current) {
                supabase.removeChannel(sessionsChannelRef.current);
                sessionsChannelRef.current = null;
            }
        };
    }, [activityId, date, enableRealtime, fetchSessions]);

    // Manual refresh function
    const refresh = useCallback(async () => {
        if (venueId) {
            setLoading(prev => ({ ...prev, activities: true }));
            try {
                const data = await ActivityService.listActivities(venueId);
                const activeActivities = data.filter(a => a.status === 'active');
                setActivities(activeActivities);
            } catch (err: any) {
                console.error('Error refreshing activities:', err);
            } finally {
                setLoading(prev => ({ ...prev, activities: false }));
            }
        }
        if (activityId && date) {
            await fetchSessions(activityId, date);
        }
        setLastUpdate(new Date());
    }, [venueId, activityId, date, fetchSessions]);

    return {
        venue,
        activities,
        sessions,
        loading,
        error,
        lastUpdate,
        refresh,
        refetchSessions: () => activityId && date && fetchSessions(activityId, date)
    };
};
