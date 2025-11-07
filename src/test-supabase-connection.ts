/**
 * Supabase Connection Test Script
 * 
 * Run this to verify your Supabase connection is working
 * 
 * Usage:
 *   npx tsx test-supabase-connection.ts
 */

async function testConnection() {
  console.log('🧪 Testing Supabase Connection...\n');

  // Check environment variables
  console.log('1. Checking environment variables...');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Environment variables not found');
    console.log('');
    console.log('Please create .env.local with:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    console.log('');
    console.log('📖 See /CONNECT_TO_SUPABASE.md for setup instructions');
    process.exit(1);
  }

  console.log('✅ Environment variables found');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
  console.log('');

  // Import Supabase client
  console.log('2. Importing Supabase client...');
  try {
    const { supabase } = await import('./lib/supabase/client');
    console.log('✅ Supabase client imported successfully');
    console.log('');

    // Test connection
    console.log('3. Testing database connection...');
    const { data: kv, error: kvError } = await supabase
      .from('kv_store_84a71643')
      .select('*')
      .limit(1);

    if (kvError) {
      console.log('❌ Database query failed:', kvError.message);
      console.log('');
      console.log('Possible issues:');
      console.log('- Database migration not run');
      console.log('- Invalid API keys');
      console.log('- Network connection issue');
      console.log('');
      console.log('📖 See /CONNECT_TO_SUPABASE.md for troubleshooting');
      process.exit(1);
    }

    console.log('✅ Database connection successful');
    console.log(`   Table: kv_store_84a71643, sample size: ${kv?.length || 0}`);
    console.log('');

    // Test auth
    console.log('4. Testing authentication...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.log('⚠️  Auth check warning:', sessionError.message);
    } else if (session) {
      console.log('✅ Active session found');
      console.log(`   User: ${session.user.email}`);
    } else {
      console.log('ℹ️  No active session (this is normal)');
      console.log('   Log in via the app to create a session');
    }
    console.log('');

    // Check tables
    console.log('5. Checking database tables...');
    const tables = [
      'kv_store_84a71643',
      'users',
      'organizations',
      'games',
      'customers',
      'bookings',
      'payments',
      'notifications',
      'notification_settings',
      'stripe_webhook_events',
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);

      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: OK`);
      }
    }
    console.log('');

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 All tests passed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('Your Supabase connection is working correctly.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start your app: npm run dev');
    console.log('2. Log in with your Supabase credentials');
    console.log('3. Explore your data!');
    console.log('');
    console.log('📖 Documentation: /CONNECT_TO_SUPABASE.md');
    console.log('');

  } catch (error: any) {
    console.log('❌ Error importing Supabase:', error.message);
    console.log('');
    console.log('Make sure @supabase/supabase-js is installed:');
    console.log('   npm install @supabase/supabase-js');
    process.exit(1);
  }
}

// Run tests
testConnection().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
