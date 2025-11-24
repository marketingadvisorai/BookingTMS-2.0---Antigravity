
import { createClient } from '@supabase/supabase-js';

// Supabase configuration (copied from src/lib/supabase.ts)
const supabaseUrl = 'https://qftjyjpitnoapqxlrvfs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdGp5anBpdG5vYXBxeGxydmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzIyOTAsImV4cCI6MjA3OTE0ODI5MH0.nO1YARU8309UaV5U1I-fxGeMYJg7CzWXOn2KQvqao7Y';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCreateActivity() {
    console.log('Starting testCreateActivity...');

    const venueId = 'cd5fa300-fb44-4349-86b2-06c9d3abc386'; // Main Venue

    // 1. Fetch venue to get organization_id
    const { data: fetchedVenueData, error: venueError } = await supabase
        .from('venues')
        .select('organization_id, name, id')
        .eq('id', venueId)
        .single();

    if (venueError) {
        console.error('Error fetching venue:', venueError);
        return;
    }

    const orgId = fetchedVenueData?.organization_id;
    console.log('Organization ID:', orgId);

    // 2. Prepare Insert Data
    // Mock input data
    const input = {
        venue_id: venueId,
        name: "Standalone Test Event",
        slug: "standalone-test-event-" + Date.now(),
        description: "Created via standalone script",
        min_players: 2,
        max_players: 10,
        price: 30,
        child_price: 15,
        min_age: 8,
        duration: 60,
        settings: {
            minChildren: 0,
            maxChildren: 5
        }
    };

    const { capacity, child_price, min_age, slug, tagline, success_rate, ...restInput } = input as any;

    const insertData = {
        ...restInput,
        organization_id: orgId,
        // created_by: session?.user?.id, // Skip auth for now, or use a dummy ID if needed. DB allows null.
        stripe_sync_status: 'pending',
        min_players: input.min_players || 1,
        max_players: input.max_players || 10, // simplified logic
        settings: {
            ...input.settings,
            child_price: input.child_price,
            min_age: input.min_age,
            slug: slug,
        }
    };

    console.log('Insert Data:', JSON.stringify(insertData, null, 2));

    // 3. Insert into DB
    const { data: createdActivity, error: insertError } = await supabase
        .from('activities')
        .insert([insertData])
        .select()
        .single();

    if (insertError) {
        console.error('Error creating activity:', insertError);
    } else {
        console.log('Successfully created activity:', createdActivity);
    }
}

testCreateActivity();
