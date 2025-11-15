#!/usr/bin/env node
/**
 * Migration and Cleanup Script
 * Applies schedule migration and cleans up old data
 * 
 * Usage: node scripts/migrate-and-cleanup.js
 */

const { createClient } = require('@supabase/supabase-js');

// Hardcoded credentials (from .env.example)
const SUPABASE_URL = 'https://pmpktygjzywlhuujnlca.supabase.co';
// You need to provide the actual anon key here
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY_HERE';

if (SUPABASE_ANON_KEY === 'YOUR_ANON_KEY_HERE') {
  console.error('❌ Please set VITE_SUPABASE_ANON_KEY environment variable');
  console.error('   Run: export VITE_SUPABASE_ANON_KEY="your-key-here"');
  console.error('   Or edit this script and replace YOUR_ANON_KEY_HERE');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('🚀 Starting migration and cleanup...\n');
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('');
  
  try {
    // Step 1: Check current games
    console.log('📊 Step 1: Checking current database state...');
    const { data: games, count, error: gamesError } = await supabase
      .from('games')
      .select('id, name, venue_id, schedule', { count: 'exact' });
    
    if (gamesError) {
      console.error('❌ Error fetching games:', gamesError.message);
      throw gamesError;
    }
    
    console.log(`Total games: ${count}`);
    console.log('');
    
    // Step 2: Update games without schedule
    console.log('📦 Step 2: Updating games with default schedule...');
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
    
    let updatedCount = 0;
    for (const game of games || []) {
      if (!game.schedule || Object.keys(game.schedule).length === 0) {
        const { error } = await supabase
          .from('games')
          .update({ schedule: defaultSchedule })
          .eq('id', game.id);
        
        if (!error) {
          console.log(`  ✅ Updated: ${game.name}`);
          updatedCount++;
        } else {
          console.log(`  ⚠️  Failed to update ${game.name}: ${error.message}`);
        }
      }
    }
    
    if (updatedCount === 0) {
      console.log('✅ All games already have schedules');
    } else {
      console.log(`✅ Updated ${updatedCount} games with default schedule`);
    }
    console.log('');
    
    // Step 3: Clean up orphaned games
    console.log('🧹 Step 3: Cleaning up orphaned games...');
    const orphanedGames = games?.filter(g => !g.venue_id) || [];
    
    if (orphanedGames.length > 0) {
      console.log(`Found ${orphanedGames.length} orphaned games (no venue):`);
      for (const game of orphanedGames) {
        console.log(`  - ${game.name} (${game.id})`);
        
        const { error } = await supabase
          .from('games')
          .delete()
          .eq('id', game.id);
        
        if (!error) {
          console.log(`    ✅ Deleted`);
        } else {
          console.log(`    ⚠️  Could not delete: ${error.message}`);
        }
      }
    } else {
      console.log('✅ No orphaned games found');
    }
    console.log('');
    
    // Step 4: Check for test/demo games
    console.log('🧹 Step 4: Checking for test/demo games...');
    const { data: testGames } = await supabase
      .from('games')
      .select('id, name')
      .or('name.ilike.%test%,name.ilike.%demo%,name.ilike.%sample%');
    
    if (testGames && testGames.length > 0) {
      console.log(`Found ${testGames.length} potential test games:`);
      testGames.forEach(g => console.log(`  - ${g.name} (${g.id})`));
      console.log('⚠️  Review manually - not auto-deleting');
    } else {
      console.log('✅ No test games found');
    }
    console.log('');
    
    // Step 5: Check venues
    console.log('📊 Step 5: Checking venues...');
    const { data: venues, count: venueCount } = await supabase
      .from('venues')
      .select('id, name, organization_id', { count: 'exact' });
    
    console.log(`Total venues: ${venueCount}`);
    
    const orphanedVenues = venues?.filter(v => !v.organization_id) || [];
    if (orphanedVenues.length > 0) {
      console.log(`⚠️  Found ${orphanedVenues.length} venues without organization_id:`);
      orphanedVenues.forEach(v => console.log(`  - ${v.name} (${v.id})`));
      console.log('⚠️  Manual review recommended');
    } else {
      console.log('✅ All venues have organization_id');
    }
    console.log('');
    
    // Step 6: Final verification
    console.log('🔍 Step 6: Final verification...');
    const { data: finalGames } = await supabase
      .from('games')
      .select('id, name, schedule')
      .limit(5);
    
    console.log('Sample games with schedules:');
    finalGames?.forEach(g => {
      const hasSchedule = g.schedule && Object.keys(g.schedule).length > 0;
      const days = g.schedule?.operatingDays?.length || 0;
      console.log(`  - ${g.name}: ${hasSchedule ? `✅ ${days} operating days` : '⚠️  No schedule'}`);
    });
    console.log('');
    
    // Summary
    console.log('=' .repeat(60));
    console.log('🎉 Migration and cleanup complete!\n');
    console.log('Summary:');
    console.log(`  - Total games: ${count}`);
    console.log(`  - Games updated with schedule: ${updatedCount}`);
    console.log(`  - Orphaned games removed: ${orphanedGames.length}`);
    console.log(`  - Test games found: ${testGames?.length || 0} (not deleted)`);
    console.log('');
    console.log('Next steps:');
    console.log('1. ✅ Test creating a new game with schedule');
    console.log('2. ✅ Test editing existing game schedule');
    console.log('3. ✅ Test calendar widget behavior');
    console.log('4. ✅ Verify in Supabase dashboard');
    console.log('');
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Check your Supabase credentials');
    console.error('2. Verify RLS policies allow access');
    console.error('3. Check network connection');
    console.error('4. Try applying migration manually in Supabase dashboard');
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('💥 Unhandled error:', err);
    process.exit(1);
  });
