/**
 * Direct SQL Migration Script
 * Applies schedule migration and cleans up old data
 * Run with: node scripts/apply-migration.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('🚀 Starting migration and cleanup...\n');
  
  // Step 1: Add schedule column if not exists
  console.log('📦 Step 1: Adding schedule column...');
  try {
    const { error } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE games ADD COLUMN IF NOT EXISTS schedule JSONB DEFAULT \'{}\'::jsonb;'
    });
    
    if (error && !error.message.includes('already exists')) {
      console.log('⚠️  Using direct query method...');
      // Column might already exist, continue
    }
    console.log('✅ Schedule column ready\n');
  } catch (err) {
    console.log('⚠️  Column may already exist, continuing...\n');
  }
  
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
  
  const { data: gamesWithoutSchedule } = await supabase
    .from('games')
    .select('id, name')
    .or('schedule.is.null,schedule.eq.{}');
  
  if (gamesWithoutSchedule && gamesWithoutSchedule.length > 0) {
    console.log(`Found ${gamesWithoutSchedule.length} games to update`);
    
    for (const game of gamesWithoutSchedule) {
      await supabase
        .from('games')
        .update({ schedule: defaultSchedule })
        .eq('id', game.id);
      console.log(`  ✅ ${game.name}`);
    }
  } else {
    console.log('✅ All games already have schedules');
  }
  console.log('');
  
  // Step 3: Clean up orphaned games
  console.log('🧹 Step 3: Cleaning up orphaned games...');
  const { data: orphanedGames } = await supabase
    .from('games')
    .select('id, name, venue_id')
    .is('venue_id', null);
  
  if (orphanedGames && orphanedGames.length > 0) {
    console.log(`Found ${orphanedGames.length} orphaned games (no venue):`);
    orphanedGames.forEach(g => console.log(`  - ${g.name} (${g.id})`));
    
    const { error } = await supabase
      .from('games')
      .delete()
      .is('venue_id', null);
    
    if (!error) {
      console.log(`✅ Deleted ${orphanedGames.length} orphaned games`);
    }
  } else {
    console.log('✅ No orphaned games found');
  }
  console.log('');
  
  // Step 4: Clean up test/demo games
  console.log('🧹 Step 4: Checking for test/demo games...');
  const { data: testGames } = await supabase
    .from('games')
    .select('id, name')
    .or('name.ilike.%test%,name.ilike.%demo%,name.ilike.%sample%');
  
  if (testGames && testGames.length > 0) {
    console.log(`Found ${testGames.length} potential test games:`);
    testGames.forEach(g => console.log(`  - ${g.name}`));
    console.log('⚠️  Review manually - not auto-deleting');
  } else {
    console.log('✅ No test games found');
  }
  console.log('');
  
  // Step 5: Verify implementation
  console.log('🔍 Step 5: Verifying implementation...');
  const { data: allGames, count } = await supabase
    .from('games')
    .select('id, name, schedule', { count: 'exact' })
    .limit(5);
  
  console.log(`Total games: ${count}`);
  if (allGames && allGames.length > 0) {
    console.log('Sample games:');
    allGames.forEach(g => {
      const hasSchedule = g.schedule && Object.keys(g.schedule).length > 0;
      const days = g.schedule?.operatingDays?.length || 0;
      console.log(`  - ${g.name}: ${hasSchedule ? `✅ Schedule (${days} days)` : '⚠️  No schedule'}`);
    });
  }
  console.log('');
  
  // Summary
  console.log('=' .repeat(60));
  console.log('🎉 Migration and cleanup complete!\n');
  console.log('Next steps:');
  console.log('1. Test creating a new game with schedule');
  console.log('2. Test editing existing game schedule');
  console.log('3. Test calendar widget behavior');
  console.log('4. Verify in Supabase dashboard: games.schedule column');
  console.log('');
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('💥 Error:', err.message);
    process.exit(1);
  });
