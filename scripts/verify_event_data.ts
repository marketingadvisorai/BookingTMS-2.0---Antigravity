import { createClient } from '@supabase/supabase-js';


const supabaseUrl = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';


const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyEventData() {
    console.log('Verifying event data for Test Event 2...');

    // 1. Fetch all events to debug
    const { data: events, error: listError } = await supabase
        .from('activities')
        .select('id, name, settings');

    if (listError) {
        console.error('Error fetching event:', listError);
        return;
    }

    if (!events || events.length === 0) {
        console.error('Test Event 2 not found');
        return;
    }

    const event = events[0];
    console.log('Found event:', event.name, event.id);
    console.log('Settings:', event.settings);

    // 2. Verify initial values
    const settings = event.settings as any;
    if (settings.min_age === 10 && settings.child_price === 15) {
        console.log('SUCCESS: Initial values match (min_age: 10, child_price: 15)');
    } else {
        console.error(`FAILURE: Initial values mismatch. Got min_age: ${settings.min_age}, child_price: ${settings.child_price}`);
    }

    // 3. Update min_age to 12
    console.log('Updating min_age to 12...');
    const newSettings = { ...settings, min_age: 12 };

    const { error: updateError } = await supabase
        .from('activities')
        .update({ settings: newSettings })
        .eq('id', event.id);

    if (updateError) {
        console.error('Error updating event:', updateError);
        return;
    }

    // 4. Verify update
    const { data: updatedEvents, error: verifyError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', event.id)
        .single();

    if (verifyError) {
        console.error('Error verifying update:', verifyError);
        return;
    }

    const updatedSettings = updatedEvents.settings as any;
    if (updatedSettings.min_age === 12) {
        console.log('SUCCESS: Update verified (min_age: 12)');
    } else {
        console.error(`FAILURE: Update failed. Got min_age: ${updatedSettings.min_age}`);
    }
}

verifyEventData();
