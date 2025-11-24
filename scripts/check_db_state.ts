
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';


// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env');

let env: Record<string, string> = {};

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            env[key.trim()] = value.trim();
        }
    });
}

const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Checking database tables...');


    const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .limit(1);

    const { count: activitiesCount, error: activitiesError } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true });

    console.log('--- Results ---');

    if (gamesError && gamesError.code === '42P01') {
        console.log('❌ Table "games" does NOT exist.');
    } else if (gamesError) {
        console.log('⚠️ Error checking "games":', gamesError.message);
    } else {
        console.log(`✅ Table "games" EXISTS. Data sample: ${JSON.stringify(gamesData)}`);
    }


    if (activitiesError && activitiesError.code === '42P01') {
        console.log('❌ Table "activities" does NOT exist.');
    } else if (activitiesError) {
        console.log('⚠️ Error checking "activities":', activitiesError.message);
    } else {
        console.log(`✅ Table "activities" EXISTS. Count: ${activitiesCount}`);
    }
}

checkTables();
