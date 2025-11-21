import { supabase } from '../lib/supabase';
import { Activity, ActivityService, ActivityScheduleRules } from './activity.service';
import { addDays, format, parse, addMinutes, isBefore, startOfDay } from 'date-fns';

export interface Session {
    id: string;
    activity_id: string;
    venue_id: string;
    organization_id: string;
    start_time: string; // ISO string (UTC)
    end_time: string;   // ISO string (UTC)
    capacity_total: number;
    capacity_remaining: number;
    price_at_generation: number;
    is_closed: boolean;
}

export class SessionService {
    /**
     * Generate sessions for an activity using a rolling window strategy.
     * @param activityId The ID of the activity
     * @param daysToGenerate Number of days to generate ahead (default 90)
     */
    static async generateSessions(activityId: string, daysToGenerate: number = 90): Promise<void> {
        // 1. Fetch Activity and Venue
        const activity = await ActivityService.getActivity(activityId);
        if (!activity || !activity.schedule) {
            throw new Error('Activity not found or has no schedule');
        }

        const { data: venue } = await supabase
            .from('venues')
            .select('timezone')
            .eq('id', activity.venue_id)
            .single();

        if (!venue) throw new Error('Venue not found');
        const timeZone = venue.timezone || 'UTC';

        // 2. Determine Start Date
        // Find the last generated session to know where to start
        const { data: lastSession } = await supabase
            .from('activity_sessions')
            .select('start_time')
            .eq('activity_id', activityId)
            .order('start_time', { ascending: false })
            .limit(1)
            .single();

        let currentDate = lastSession
            ? addDays(new Date(lastSession.start_time), 1)
            : new Date(); // Start from today if no sessions exist

        // 3. Loop and Generate
        const sessionsToInsert: any[] = [];
        const schedule = activity.schedule;

        for (let i = 0; i < daysToGenerate; i++) {
            const dateStr = format(currentDate, 'yyyy-MM-dd');
            const dayName = format(currentDate, 'EEEE'); // 'Monday', 'Tuesday', etc.

            // Check if open on this day
            if (schedule.operatingDays.includes(dayName)) {
                // Parse start and end times (e.g., "10:00", "22:00")
                // We need to construct a Date object that represents this time IN THE VENUE'S TIMEZONE
                // Then convert it to UTC.

                // Since we don't have date-fns-tz, we use a robust native approach:
                // Create a string "YYYY-MM-DDTHH:mm:00" and treat it as the local time
                // Then shift it to UTC based on the timezone offset.

                const slots = this.generateSlotsForDay(dateStr, schedule, timeZone);

                slots.forEach(slot => {
                    sessionsToInsert.push({
                        activity_id: activity.id,
                        venue_id: activity.venue_id,
                        organization_id: activity.organization_id,
                        start_time: slot.start.toISOString(),
                        end_time: slot.end.toISOString(),
                        capacity_total: activity.capacity,
                        capacity_remaining: activity.capacity,
                        price_at_generation: activity.price, // Snapshot price
                        is_closed: false
                    });
                });
            }

            currentDate = addDays(currentDate, 1);
        }

        // 4. Bulk Insert
        if (sessionsToInsert.length > 0) {
            // Insert in chunks of 100 to avoid limits
            const chunkSize = 100;
            for (let i = 0; i < sessionsToInsert.length; i += chunkSize) {
                const chunk = sessionsToInsert.slice(i, i + chunkSize);
                const { error } = await supabase
                    .from('activity_sessions')
                    .insert(chunk);

                if (error) {
                    console.error('Error inserting sessions chunk:', error);
                    // Continue to next chunk or throw? 
                    // Throwing is safer to alert the caller.
                    throw error;
                }
            }
        }
    }

    /**
     * Helper to generate slot times for a specific day in the Venue's Timezone
     */
    private static generateSlotsForDay(dateStr: string, schedule: ActivityScheduleRules, timeZone: string): { start: Date, end: Date }[] {
        const slots: { start: Date, end: Date }[] = [];

        // Parse "HH:mm"
        const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
        const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

        // Create base date in UTC first, then we will adjust
        // Actually, simpler: Create a date string and parse it as if it were in the timezone
        // But JS Date parsing is tricky.

        // Strategy: 
        // 1. Construct "YYYY-MM-DD HH:mm:00"
        // 2. Use Intl.DateTimeFormat to find the offset for that timezone on that date
        // 3. Apply offset to get UTC

        let currentSlotStart = new Date(`${dateStr}T${schedule.startTime}:00`);
        // WARNING: The above creates a date in Local Browser Time (or Server Time). 
        // We need to interpret it as "Venue Time".

        // Better Strategy without library:
        // We iterate minutes from start to end.
        // For each minute, we construct the UTC date.

        const totalStartMinutes = startHour * 60 + startMinute;
        const totalEndMinutes = endHour * 60 + endMinute;
        const interval = schedule.slotInterval;

        for (let time = totalStartMinutes; time + interval <= totalEndMinutes; time += interval) {
            const h = Math.floor(time / 60);
            const m = time % 60;
            const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;

            // This function returns the UTC Date object for a given "Venue Wall Clock Time"
            const startUtc = this.venueTimeToUtc(dateStr, timeStr, timeZone);
            const endUtc = addMinutes(startUtc, interval);

            slots.push({ start: startUtc, end: endUtc });
        }

        return slots;
    }

    /**
     * Converts "YYYY-MM-DD" + "HH:mm:ss" in a specific TimeZone to a UTC Date object
     */
    private static venueTimeToUtc(dateStr: string, timeStr: string, timeZone: string): Date {
        // Create a date object that represents the components
        // We use "en-US" with the target timezone to see what "time" it thinks a UTC date is,
        // then adjust.
        // Actually, simpler:
        // new Date("2023-01-01T10:00:00Z") is UTC.
        // We want to find X such that X in TimeZone is "2023-01-01 10:00:00".

        // Since we can't easily invert without a library, we can use a trick:
        // 1. Create a naive date (treated as local or UTC)
        // 2. Format it to parts in the target timezone
        // 3. Calculate difference

        // Or, just use the fact that we are on a server/browser environment.
        // If we assume the input string is ISO-like, we can try to append the offset?
        // No, we don't know the offset (DST).

        // Robust Native Solution:
        // 1. Guess UTC = Local components
        // 2. Check what time that UTC is in the target timezone
        // 3. Adjust by the difference

        const targetIso = `${dateStr}T${timeStr}`;
        const naive = new Date(targetIso + 'Z'); // Treat as UTC initially

        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone,
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
        }).formatToParts(naive);

        // Reconstruct the time that `naive` represents in `timeZone`
        const p: any = {};
        parts.forEach(({ type, value }) => p[type] = value);

        // p.month is "1" for Jan
        const actualInTzStr = `${p.year}-${p.month.padStart(2, '0')}-${p.day.padStart(2, '0')}T${p.hour === '24' ? '00' : p.hour.padStart(2, '0')}:${p.minute.padStart(2, '0')}:${p.second.padStart(2, '0')}`;

        const actualInTz = new Date(actualInTzStr + 'Z');
        const diff = naive.getTime() - actualInTz.getTime();

        return new Date(naive.getTime() + diff);
    }

    /**
     * List available sessions for a date range
     */
    static async listAvailableSessions(activityId: string, startDate: Date, endDate: Date): Promise<Session[]> {
        const { data, error } = await supabase
            .from('activity_sessions')
            .select('*')
            .eq('activity_id', activityId)
            .gte('start_time', startDate.toISOString())
            .lte('end_time', endDate.toISOString())
            .eq('is_closed', false)
            .gt('capacity_remaining', 0) // Only show available
            .order('start_time', { ascending: true });

        if (error) throw error;
        return data;
    }

    /**
     * Find a session by activity and start time
     */
    static async getSessionByTime(activityId: string, startTime: string): Promise<Session | null> {
        // startTime should be ISO string or compatible
        const { data, error } = await supabase
            .from('activity_sessions')
            .select('*')
            .eq('activity_id', activityId)
            .eq('start_time', startTime)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    }
}
