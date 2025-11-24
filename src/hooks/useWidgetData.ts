import { useState, useEffect, useCallback } from 'react';
import { VenueService, Venue } from '../services/venue.service';
import { ActivityService, Activity } from '../modules/inventory/services/activity.service';
import { SessionService, Session } from '../services/session.service';
import { startOfDay, endOfDay, addDays } from 'date-fns';

interface UseWidgetDataProps {
    venueId?: string;
    activityId?: string;
    date?: Date;
}

export const useWidgetData = ({ venueId, activityId, date }: UseWidgetDataProps) => {
    const [venue, setVenue] = useState<Venue | null>(null);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState({
        venue: false,
        activities: false,
        sessions: false
    });
    const [error, setError] = useState<string | null>(null);

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

    return {
        venue,
        activities,
        sessions,
        loading,
        error,
        refetchSessions: () => activityId && date && fetchSessions(activityId, date)
    };
};
