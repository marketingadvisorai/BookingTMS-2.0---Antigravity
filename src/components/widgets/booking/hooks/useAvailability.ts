import { useMemo } from 'react';
import { useWidgetData } from '../../../../hooks/useWidgetData';
import { generateTimeSlots } from '../../../../utils/availabilityEngine';

export interface TimeSlot {
    time: string;
    available: boolean;
    capacity?: number;
    totalCapacity?: number;
    sessionId?: string;
    spots?: number;
    reason?: string;
}

interface UseAvailabilityProps {
    config: any;
    selectedActivity: string | null;
    selectedActivityData?: any;
    venueData?: any;
    selectedDate: number;
    currentMonth: number;
    currentYear: number;
}

export const useAvailability = ({
    config,
    selectedActivity,
    selectedActivityData: passedActivityData,
    venueData: passedVenueData,
    selectedDate,
    currentMonth,
    currentYear
}: UseAvailabilityProps) => {

    // Memoize the date object to prevent infinite re-renders
    // Only recreate when the actual date values change
    const memoizedDate = useMemo(() => {
        return new Date(currentYear, currentMonth, selectedDate);
    }, [currentYear, currentMonth, selectedDate]);

    // Fetch real data from Supabase if not passed
    const {
        venue,
        activities: fetchedActivities,
        sessions: fetchedSessions,
        loading: dataLoading,
        error: dataError
    } = useWidgetData({
        venueId: config?.venueId,
        activityId: selectedActivity || undefined,
        date: memoizedDate
    });

    // Use passed data or fetched data
    const activeVenue = passedVenueData || venue;

    // Determine which activities to use (fetched or config)
    const activities = useMemo(() => {
        if (config?.venueId && fetchedActivities.length > 0) {
            return fetchedActivities;
        }
        return Array.isArray(config?.activities) ? config.activities : (Array.isArray(config?.games) ? config.games : []);
    }, [config, fetchedActivities]);

    // Get selected activity data
    const selectedActivityData = useMemo(() => {
        if (passedActivityData) return passedActivityData;
        return activities.find((a: any) => a.id === selectedActivity) || activities[0];
    }, [activities, selectedActivity, passedActivityData]);

    // Calculate time slots
    const timeSlots: TimeSlot[] = useMemo(() => {
        if (!selectedActivityData) return [];

        // Mode 1: Real Data (Venue Mode)
        if (config?.venueId && fetchedSessions.length > 0) {
            return fetchedSessions.map(session => {
                const date = new Date(session.start_time);
                // Note: We rely on the session's start_time being correct. 
                // Formatting to local time string for display.
                const timeString = date.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: selectedActivityData?.timezone || activeVenue?.timezone || 'UTC'
                });

                return {
                    time: timeString,
                    available: session.capacity_remaining > 0,
                    capacity: session.capacity_remaining,
                    totalCapacity: session.capacity_total,
                    sessionId: session.id
                };
            });
        }

        // Mode 2: Template/Preview Mode (Generated Slots)
        const selectedDateObj = new Date(currentYear, currentMonth, selectedDate);
        const blockedDates = selectedActivityData?.blockedDates || config?.blockedDates || [];
        const customAvailableDates = selectedActivityData?.customDates || config?.customAvailableDates || [];

        const schedule = selectedActivityData.schedule || {
            operatingDays: selectedActivityData.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            startTime: selectedActivityData.startTime || '10:00',
            endTime: selectedActivityData.endTime || '22:00',
            slotInterval: selectedActivityData.slotInterval || 60,
            duration: typeof selectedActivityData.duration === 'string' ? parseInt(selectedActivityData.duration) : (selectedActivityData.duration || 90),
            advanceBooking: selectedActivityData.advanceBooking || 30,
            customHours: selectedActivityData.customHours,
            customHoursEnabled: selectedActivityData.customHoursEnabled
        };

        const generatedSlots = generateTimeSlots(
            selectedDateObj,
            schedule,
            blockedDates,
            [], // No existing bookings in template mode
            customAvailableDates
        );

        return generatedSlots.map((slot: any) => ({
            ...slot,
            sessionId: undefined // No session ID in template mode
        }));
    }, [selectedDate, currentMonth, currentYear, selectedActivityData, config, fetchedSessions, activeVenue?.timezone, selectedActivityData?.timezone]);

    const isLoading = dataLoading.venue || dataLoading.activities || dataLoading.sessions;

    return {
        timeSlots,
        activities,
        selectedActivityData,
        venue: activeVenue,
        loading: isLoading,
        error: dataError
    };
};
