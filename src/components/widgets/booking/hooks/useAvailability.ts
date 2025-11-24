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
    selectedGame: string | null;
    selectedGameData?: any;
    venueData?: any;
    selectedDate: number;
    currentMonth: number;
    currentYear: number;
}

export const useAvailability = ({
    config,
    selectedGame,
    selectedGameData: passedGameData,
    venueData: passedVenueData,
    selectedDate,
    currentMonth,
    currentYear
}: UseAvailabilityProps) => {

    // Fetch real data from Supabase if not passed
    const {
        venue,
        activities: fetchedActivities,
        sessions: fetchedSessions,
        loading: dataLoading,
        error: dataError
    } = useWidgetData({
        venueId: config?.venueId,
        activityId: selectedGame || undefined,
        date: new Date(currentYear, currentMonth, selectedDate)
    });

    // Use passed data or fetched data
    const activeVenue = passedVenueData || venue;

    // Determine which games to use (fetched or config)
    const games = useMemo(() => {
        if (config?.venueId && fetchedActivities.length > 0) {
            return fetchedActivities;
        }
        return Array.isArray(config?.games) ? config.games : [];
    }, [config, fetchedActivities]);

    // Get selected game data
    const selectedGameData = useMemo(() => {
        if (passedGameData) return passedGameData;
        return games.find((g: any) => g.id === selectedGame) || games[0];
    }, [games, selectedGame, passedGameData]);

    // Calculate time slots
    const timeSlots: TimeSlot[] = useMemo(() => {
        if (!selectedGameData) return [];

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
                    timeZone: selectedGameData?.timezone || activeVenue?.timezone || 'UTC'
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
        const blockedDates = selectedGameData?.blockedDates || config?.blockedDates || [];
        const customAvailableDates = selectedGameData?.customDates || config?.customAvailableDates || [];

        const schedule = selectedGameData.schedule || {
            operatingDays: selectedGameData.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            startTime: selectedGameData.startTime || '10:00',
            endTime: selectedGameData.endTime || '22:00',
            slotInterval: selectedGameData.slotInterval || 60,
            duration: typeof selectedGameData.duration === 'string' ? parseInt(selectedGameData.duration) : (selectedGameData.duration || 90),
            advanceBooking: selectedGameData.advanceBooking || 30
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
    }, [selectedDate, currentMonth, currentYear, selectedGameData, config, fetchedSessions, activeVenue?.timezone, selectedGameData?.timezone]);

    const isLoading = dataLoading.venue || dataLoading.activities || dataLoading.sessions;

    return {
        timeSlots,
        games,
        selectedGameData,
        venue: activeVenue,
        loading: isLoading,
        error: dataError
    };
};
