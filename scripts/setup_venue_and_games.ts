
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qftjyjpitnoapqxlrvfs.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdGp5anBpdG5vYXBxeGxydmZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU3MjI5MCwiZXhwIjoyMDc5MTQ4MjkwfQ.1SQ7AHXvB9qfRkmx8Qb6zKPU0x1JhrS4uplnfyNNiCI';

if (!supabaseServiceKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log('🚀 Starting Venue and Game Setup (Self-Contained)...');

    // 1. Get or Create Organization
    const { data: orgs, error: orgError } = await supabase.from('organizations').select('*').limit(1);
    if (orgError) throw orgError;

    let orgId;
    if (orgs && orgs.length > 0) {
        orgId = orgs[0].id;
        console.log(`✅ Found Organization: ${orgs[0].name} (${orgId})`);
    } else {
        const { data: newOrg, error: createOrgError } = await supabase
            .from('organizations')
            .insert({ name: 'Demo Organization', slug: 'demo-org' })
            .select()
            .single();
        if (createOrgError) throw createOrgError;
        orgId = newOrg.id;
        console.log(`✅ Created Organization: ${newOrg.name} (${orgId})`);
    }

    // 2. Get or Create Venue
    const { data: venues, error: venueError } = await supabase
        .from('venues')
        .select('*')
        .eq('organization_id', orgId)
        .limit(1);

    if (venueError) throw venueError;

    let venueId;
    const venueData = {
        name: 'Main Venue',
        organization_id: orgId,
        timezone: 'America/Los_Angeles',
        images: ['https://images.unsplash.com/photo-1519750783826-e2420f4d687f?auto=format&fit=crop&q=80&w=1000'],
        operating_hours: {
            monday: { open: "09:00", close: "22:00", closed: false },
            tuesday: { open: "09:00", close: "22:00", closed: false },
            wednesday: { open: "09:00", close: "22:00", closed: false },
            thursday: { open: "09:00", close: "22:00", closed: false },
            friday: { open: "09:00", close: "23:00", closed: false },
            saturday: { open: "10:00", close: "23:00", closed: false },
            sunday: { open: "10:00", close: "21:00", closed: false }
        }
    };

    if (venues && venues.length > 0) {
        venueId = venues[0].id;
        // Update existing venue with new fields
        const { error: updateError } = await supabase
            .from('venues')
            .update(venueData)
            .eq('id', venueId);
        if (updateError) throw updateError;
        console.log(`✅ Updated Venue: ${venueData.name} (${venueId})`);
    } else {
        const { data: newVenue, error: createVenueError } = await supabase
            .from('venues')
            .insert(venueData)
            .select()
            .single();
        if (createVenueError) throw createVenueError;
        venueId = newVenue.id;
        console.log(`✅ Created Venue: ${newVenue.name} (${venueId})`);
    }

    // 3. Create 4 Demo Games (Activities)
    const demoGames = [
        {
            name: 'Cosmic Bowling',
            description: 'Experience bowling like never before with neon lights and music!',
            capacity: 6,
            price: 35,
            duration: 60,
            image_url: 'https://images.unsplash.com/photo-1538510624418-6221e2820809?auto=format&fit=crop&q=80&w=1000',
            schedule: {
                operatingDays: ['Friday', 'Saturday', 'Sunday'],
                startTime: '18:00',
                endTime: '23:00',
                slotInterval: 60,
                advanceBooking: 30,
                customHoursEnabled: false,
                customHours: {},
                customDates: [],
                blockedDates: []
            }
        },
        {
            name: 'Escape The Vault',
            description: 'Crack the code and escape the bank vault before time runs out.',
            capacity: 8,
            price: 45,
            duration: 90,
            image_url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=1000',
            schedule: {
                operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                startTime: '10:00',
                endTime: '22:00',
                slotInterval: 90,
                advanceBooking: 14,
                customHoursEnabled: false,
                customHours: {},
                customDates: [],
                blockedDates: []
            }
        },
        {
            name: 'VR Zombie Apocalypse',
            description: 'Survive the undead horde in this immersive VR experience.',
            capacity: 4,
            price: 50,
            duration: 45,
            image_url: 'https://images.unsplash.com/photo-1622979135225-d2ba269fb1bd?auto=format&fit=crop&q=80&w=1000',
            schedule: {
                operatingDays: ['Saturday', 'Sunday'],
                startTime: '12:00',
                endTime: '20:00',
                slotInterval: 45,
                advanceBooking: 7,
                customHoursEnabled: false,
                customHours: {},
                customDates: [],
                blockedDates: []
            }
        },
        {
            name: 'Axe Throwing League',
            description: 'Compete with friends in our professional axe throwing lanes.',
            capacity: 10,
            price: 40,
            duration: 60,
            image_url: 'https://images.unsplash.com/photo-1584067036237-c65663836697?auto=format&fit=crop&q=80&w=1000',
            schedule: {
                operatingDays: ['Thursday', 'Friday', 'Saturday'],
                startTime: '16:00',
                endTime: '22:00',
                slotInterval: 60,
                advanceBooking: 60,
                customHoursEnabled: false,
                customHours: {},
                customDates: [],
                blockedDates: []
            }
        }
    ];

    console.log('🎮 Creating Demo Games...');

    for (const game of demoGames) {
        // Check if game exists
        const { data: existingGame } = await supabase
            .from('activities')
            .select('id')
            .eq('venue_id', venueId)
            .eq('name', game.name)
            .single();

        if (existingGame) {
            console.log(`ℹ️ Game "${game.name}" already exists. Skipping.`);
            continue;
        }

        const { error: createError } = await supabase
            .from('activities')
            .insert({
                organization_id: orgId,
                venue_id: venueId,
                name: game.name,
                description: game.description,
                max_players: game.capacity, // Mapping to DB column
                price: game.price,
                duration: game.duration,
                image_url: game.image_url,
                is_active: true,
                settings: {
                    schedule: game.schedule // Store schedule in settings for now as per schema
                },
                schedule: game.schedule // Also store in new column if it exists
            });

        if (createError) {
            console.error(`❌ Failed to create game "${game.name}":`, createError);
        } else {
            console.log(`✅ Created Game: "${game.name}"`);
        }
    }

    console.log('✨ Setup Complete!');
}

main().catch(console.error);
