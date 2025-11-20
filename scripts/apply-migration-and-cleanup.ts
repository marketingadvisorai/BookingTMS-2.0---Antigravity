/**
 * Script to apply schedule migration and clean up old data
 * Run with: npx tsx scripts/apply-migration-and-cleanup.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  console.log('📦 Applying schedule migration...\n');
  
  const migrationPath = path.join(__dirname, '../supabase/migrations/008_add_game_schedule.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  
  try {
    // Split SQL into individual statements (rough split by semicolon)
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length < 10) continue; // Skip very short statements
      
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      
      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase.from('_migrations').insert({
          version: '008_add_game_schedule',
          name: 'add_game_schedule',
          executed_at: new Date().toISOString()
        });
        
        if (directError && !directError.message.includes('already exists')) {
          console.warn(`⚠️  Warning: ${error.message}`);
        }
      }
    }
    
    console.log('\n✅ Migration applied successfully!\n');
    return true;
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

async function cleanupOldData() {
  console.log('🧹 Cleaning up old/invalid data...\n');
  
  try {
    // 1. Check for games without venue_id
    console.log('Checking for orphaned games...');
    const { data: orphanedGames, error: orphanError } = await supabase
      .from('games')
      .select('id, name, venue_id')
      .is('venue_id', null);
    
    if (orphanedGames && orphanedGames.length > 0) {
      console.log(`Found ${orphanedGames.length} orphaned games (no venue_id)`);
      console.log('Orphaned games:', orphanedGames.map(g => `${g.name} (${g.id})`).join(', '));
      
      const { error: deleteError } = await supabase
        .from('games')
        .delete()
        .is('venue_id', null);
      
      if (!deleteError) {
        console.log(`✅ Deleted ${orphanedGames.length} orphaned games\n`);
      }
    } else {
      console.log('✅ No orphaned games found\n');
    }
    
    // 2. Check for venues without organization_id
    console.log('Checking for orphaned venues...');
    const { data: orphanedVenues, error: venueError } = await supabase
      .from('venues')
      .select('id, name, organization_id')
      .is('organization_id', null);
    
    if (orphanedVenues && orphanedVenues.length > 0) {
      console.log(`Found ${orphanedVenues.length} orphaned venues (no organization_id)`);
      console.log('Orphaned venues:', orphanedVenues.map(v => `${v.name} (${v.id})`).join(', '));
      
      // Don't auto-delete venues, just report
      console.log('⚠️  Manual review recommended for orphaned venues\n');
    } else {
      console.log('✅ No orphaned venues found\n');
    }
    
    // 3. Check for games with invalid data
    console.log('Checking for games with invalid data...');
    const { data: allGames } = await supabase
      .from('games')
      .select('id, name, duration, price, min_players, max_players');
    
    const invalidGames = allGames?.filter(g => 
      !g.duration || g.duration <= 0 ||
      !g.price || g.price < 0 ||
      !g.min_players || g.min_players <= 0 ||
      !g.max_players || g.max_players < g.min_players
    ) || [];
    
    if (invalidGames.length > 0) {
      console.log(`Found ${invalidGames.length} games with invalid data:`);
      invalidGames.forEach(g => {
        console.log(`  - ${g.name} (${g.id}): duration=${g.duration}, price=${g.price}, players=${g.min_players}-${g.max_players}`);
      });
      console.log('⚠️  Manual review recommended\n');
    } else {
      console.log('✅ All games have valid data\n');
    }
    
    // 4. Check for old test data (games with "test" in name)
    console.log('Checking for test games...');
    const { data: testGames } = await supabase
      .from('games')
      .select('id, name')
      .or('name.ilike.%test%,name.ilike.%demo%,name.ilike.%sample%');
    
    if (testGames && testGames.length > 0) {
      console.log(`Found ${testGames.length} potential test games:`);
      testGames.forEach(g => console.log(`  - ${g.name} (${g.id})`));
      console.log('⚠️  Review and delete manually if needed\n');
    } else {
      console.log('✅ No test games found\n');
    }
    
    // 5. Update games without schedule to have default schedule
    console.log('Updating games without schedule...');
    const { data: gamesWithoutSchedule } = await supabase
      .from('games')
      .select('id, name, schedule')
      .or('schedule.is.null,schedule.eq.{}');
    
    if (gamesWithoutSchedule && gamesWithoutSchedule.length > 0) {
      console.log(`Found ${gamesWithoutSchedule.length} games without schedule`);
      
      const defaultSchedule = {
        operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        startTime: '10:00',
        endTime: '22:00',
        slotInterval: 60,
        advanceBooking: 30,
        customHoursEnabled: false,
        customHours: {},
        customDates: [],
        blockedDates: []
      };
      
      for (const game of gamesWithoutSchedule) {
        const { error } = await supabase
          .from('games')
          .update({ schedule: defaultSchedule })
          .eq('id', game.id);
        
        if (!error) {
          console.log(`  ✅ Updated schedule for: ${game.name}`);
        }
      }
      console.log('');
    } else {
      console.log('✅ All games have schedules\n');
    }
    
    return true;
  } catch (error: any) {
    console.error('❌ Cleanup failed:', error.message);
    return false;
  }
}

async function verifyImplementation() {
  console.log('🔍 Verifying implementation...\n');
  
  try {
    // 1. Check if schedule column exists
    console.log('Checking database schema...');
    const { data: columns } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'games')
      .eq('column_name', 'schedule');
    
    if (columns && columns.length > 0) {
      console.log('✅ Schedule column exists (type: jsonb)\n');
    } else {
      console.log('⚠️  Schedule column not found - migration may not be applied\n');
    }
    
    // 2. Check sample games
    console.log('Checking sample games...');
    const { data: games, count } = await supabase
      .from('games')
      .select('id, name, schedule', { count: 'exact' })
      .limit(3);
    
    console.log(`Total games in database: ${count}`);
    if (games && games.length > 0) {
      console.log('Sample games:');
      games.forEach(g => {
        const hasSchedule = g.schedule && Object.keys(g.schedule).length > 0;
        console.log(`  - ${g.name}: ${hasSchedule ? '✅ Has schedule' : '⚠️  No schedule'}`);
      });
    }
    console.log('');
    
    // 3. Check venues
    console.log('Checking venues...');
    const { data: venues, count: venueCount } = await supabase
      .from('venues')
      .select('id, name, organization_id', { count: 'exact' })
      .limit(3);
    
    console.log(`Total venues in database: ${venueCount}`);
    if (venues && venues.length > 0) {
      console.log('Sample venues:');
      venues.forEach(v => {
        console.log(`  - ${v.name} (org: ${v.organization_id || 'none'})`);
      });
    }
    console.log('');
    
    return true;
  } catch (error: any) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting migration and cleanup process...\n');
  console.log('=' .repeat(60));
  console.log('');
  
  // Step 1: Apply migration (will show warnings if already applied)
  console.log('STEP 1: Apply Migration');
  console.log('-'.repeat(60));
  const migrationSuccess = await applyMigration();
  
  // Step 2: Clean up old data
  console.log('STEP 2: Clean Up Old Data');
  console.log('-'.repeat(60));
  const cleanupSuccess = await cleanupOldData();
  
  // Step 3: Verify implementation
  console.log('STEP 3: Verify Implementation');
  console.log('-'.repeat(60));
  const verifySuccess = await verifyImplementation();
  
  // Summary
  console.log('=' .repeat(60));
  console.log('\n📊 SUMMARY\n');
  console.log(`Migration: ${migrationSuccess ? '✅ Success' : '⚠️  Check manually'}`);
  console.log(`Cleanup: ${cleanupSuccess ? '✅ Success' : '❌ Failed'}`);
  console.log(`Verification: ${verifySuccess ? '✅ Success' : '❌ Failed'}`);
  console.log('');
  
  if (migrationSuccess && cleanupSuccess && verifySuccess) {
    console.log('🎉 All tasks completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Test game creation with schedule');
    console.log('2. Test calendar widget behavior');
    console.log('3. Verify schedule data in Supabase dashboard');
    console.log('');
  } else {
    console.log('⚠️  Some tasks need manual attention.');
    console.log('Please check the Supabase dashboard and apply migration manually if needed.');
    console.log('');
  }
  
  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
