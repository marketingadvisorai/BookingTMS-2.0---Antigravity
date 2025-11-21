
import { createClient } from '@supabase/supabase-js';
import { addDays, format, addMinutes } from 'date-fns';

// Configuration
const SUPABASE_URL = 'https://qftjyjpitnoapqxlrvfs.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdGp5anBpdG5vYXBxeGxydmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU3MjI5MCwiZXhwIjoyMDc5MTQ4MjkwfQ.1SQ7AHXvB9qfRkmx8Qb6zKPU0x1JhrS4uplnfyNNiCI';

// Create Admin Client
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// IDs
const ORGANIZATION_ID = '64fa1946-3cdd-43af-b7de-cc4708cd4b80';
const VENUE_ID = 'cd5fa300-fb44-4349-86b2-06c9d3abc386';

const activities = [
    {
        name: 'Laser Tag',
        description: 'Action-packed laser tag arena',
        duration: 30,
        price: 15.00,
        capacity: 20,
        venue_id: VENUE_ID,
        organization_id: ORGANIZATION_ID,
        is_active: true,
        schedule: {
            operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            startTime: '10:00',
            endTime: '22:00',
            slotInterval: 30
        }
    },
    {
        name: 'Bowling',
        description: 'Classic 10-pin bowling',
        duration: 60,
        price: 25.00,
        capacity: 6,
        venue_id: VENUE_ID,
        organization_id: ORGANIZATION_ID,
        is_active: true,
        schedule: {
            operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            startTime: '10:00',
            endTime: '23:00',
            slotInterval: 60
        }
    },
    {
        name: 'Escape Room',
        description: 'Solve puzzles to escape in time',
        duration: 60,
        price: 30.00,
        capacity: 8,
        venue_id: VENUE_ID,
        organization_id: ORGANIZATION_ID,
        is_active: true,
        schedule: {
            operatingDays: ['Friday', 'Saturday', 'Sunday'],
            startTime: '12:00',
            endTime: '22:00',
            slotInterval: 60
        }
    }
];

async function ensureOrganization() {
    const { data, error } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('id', ORGANIZATION_ID)
        .single();

    if (!data) {
        console.log('Creating Organization...');
        const { error: insertError } = await supabaseAdmin
            .from('organizations')
            .insert({
                id: ORGANIZATION_ID,
                name: 'Test Organization',
                slug: 'test-org',
                is_active: true
            });

        if (insertError) {
            console.error('Error creating organization:', insertError);
            throw insertError;
        }
        console.log('Organization created.');
    } else {
        console.log('Organization exists.');
    }
}

async function ensureVenue() {
    const { data, error } = await supabaseAdmin
        .from('venues')
        .select('id')
        .eq('id', VENUE_ID)
        .single();

    if (!data) {
        console.log('Creating Venue...');
        const { error: insertError } = await supabaseAdmin
            .from('venues')
            .insert({
                id: VENUE_ID,
                organization_id: ORGANIZATION_ID,
                name: 'Test Venue',
                slug: 'test-venue',
                timezone: 'UTC',
                status: 'active'
            });

        if (insertError) {
            console.error('Error creating venue:', insertError);
            throw insertError;
        }
        console.log('Venue created.');
    } else {
        console.log('Venue exists.');
    }
}

async function generateSessions(activityId: string, schedule: any, venueTimezone: string) {
    console.log(`Generating sessions for activity ${activityId}...`);

    const sessionsToInsert: any[] = [];
    const daysToGenerate = 7;
    let currentDate = new Date();

    for (let i = 0; i < daysToGenerate; i++) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const dayName = format(currentDate, 'EEEE');

        if (schedule.operatingDays.includes(dayName)) {
            const slots = generateSlotsForDay(dateStr, schedule, venueTimezone);

            slots.forEach(slot => {
                sessionsToInsert.push({
                    activity_id: activityId,
                    venue_id: VENUE_ID,
                    organization_id: ORGANIZATION_ID,
                    start_time: slot.start.toISOString(),
                    end_time: slot.end.toISOString(),
                    capacity_total: schedule.capacity || 10, // Fallback
                    capacity_remaining: schedule.capacity || 10,
                    price_at_generation: schedule.price || 0,
                    is_closed: false
                });
            });
        }
        currentDate = addDays(currentDate, 1);
    }

    if (sessionsToInsert.length > 0) {
        const { error } = await supabaseAdmin
            .from('activity_sessions')
            .insert(sessionsToInsert);

        if (error) {
            console.error('Error inserting sessions:', error);
        } else {
            console.log(`Generated ${sessionsToInsert.length} sessions.`);
        }
    }
}

function generateSlotsForDay(dateStr: string, schedule: any, timeZone: string): { start: Date, end: Date }[] {
    const slots: { start: Date, end: Date }[] = [];
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

    const totalStartMinutes = startHour * 60 + startMinute;
    const totalEndMinutes = endHour * 60 + endMinute;
    const interval = schedule.slotInterval;

    for (let time = totalStartMinutes; time + interval <= totalEndMinutes; time += interval) {
        const h = Math.floor(time / 60);
        const m = time % 60;
        const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`;

        // Simplified UTC conversion for seeding
        const startUtc = new Date(`${dateStr}T${timeStr}Z`); // Treat as UTC
        const endUtc = addMinutes(startUtc, interval);

        slots.push({ start: startUtc, end: endUtc });
    }
    return slots;
}

async function seed() {
    console.log('Starting seed with Service Role Key...');

    await ensureOrganization();
    await ensureVenue();

    // 1. Get Venue Timezone
    const { data: venue, error: venueError } = await supabaseAdmin
        .from('venues')
        .select('timezone')
        .eq('id', VENUE_ID)
        .single();

    if (venueError) {
        console.error('Error fetching venue:', venueError);
        return;
    }
    const timeZone = venue?.timezone || 'UTC';

    for (const activity of activities) {
        console.log(`Creating ${activity.name}...`);

        const { capacity, is_active, schedule, ...activityData } = activity;
        const insertData = {
            ...activityData,
            max_players: capacity,
            min_players: 1,
            is_active: is_active,
            schedule: schedule // Store schedule in JSONB column
        };

        const { data, error } = await supabaseAdmin
            .from('activities')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error(`Error creating ${activity.name}:`, error);
            continue;
        }

        console.log(`Created ${activity.name} with ID: ${data.id}`);

        // Pass capacity and price to generator for session fields
        const scheduleWithDetails = {
            ...schedule,
            capacity: capacity,
            price: activity.price
        };

        await generateSessions(data.id, scheduleWithDetails, timeZone);
    }

    console.log('Seed completed.');
}

seed().catch(console.error);
