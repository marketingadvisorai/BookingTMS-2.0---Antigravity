/**
 * Environment Variables Verification Script
 * 
 * Run this to verify your environment is set up correctly
 * Usage: node verify-env.js
 */

console.log('🔍 Checking BookingTMS Environment Setup...\n');

// Check if running in Node.js
if (typeof process === 'undefined') {
  console.log('❌ Not running in Node.js environment');
  process.exit(1);
}

// Check .env.local file
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.local.example');

console.log('1️⃣  Checking .env.local file...');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env.local exists');
  
  // Read and check contents
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('   ✅ Supabase variables found');
    console.log('   ℹ️  App will use Supabase when started\n');
  } else {
    console.log('   ⚠️  Supabase variables not found or incomplete');
    console.log('   ℹ️  App will use mock data (this is OK for development)\n');
  }
} else {
  console.log('   ⚠️  .env.local not found');
  console.log('   ℹ️  App will use mock data (this is OK for development)');
  
  if (fs.existsSync(envExamplePath)) {
    console.log('   💡 To connect Supabase: Copy .env.local.example to .env.local\n');
  } else {
    console.log('   💡 To connect Supabase: See /CONNECT_TO_SUPABASE.md\n');
  }
}

// Check required files
console.log('2️⃣  Checking required files...');
const requiredFiles = [
  '/lib/auth/AuthContext.tsx',
  '/lib/supabase/client.ts',
  '/lib/supabase/hooks.ts',
  '/types/supabase.ts',
  '/supabase/migrations/001_initial_schema.sql',
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('   ✅ All required files present\n');
} else {
  console.log('   ❌ Some files are missing\n');
}

// Check node_modules
console.log('3️⃣  Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules exists');
  
  const supabasePath = path.join(nodeModulesPath, '@supabase', 'supabase-js');
  if (fs.existsSync(supabasePath)) {
    console.log('   ✅ @supabase/supabase-js installed\n');
  } else {
    console.log('   ⚠️  @supabase/supabase-js not found');
    console.log('   💡 Run: npm install @supabase/supabase-js\n');
  }
} else {
  console.log('   ❌ node_modules not found');
  console.log('   💡 Run: npm install\n');
}

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (fs.existsSync(envPath)) {
  console.log('✅ Environment: Configured for Supabase');
  console.log('');
  console.log('Next steps:');
  console.log('1. Make sure you\'ve created a Supabase project');
  console.log('2. Run the database migration (see /CONNECT_TO_SUPABASE.md)');
  console.log('3. Create your first user in Supabase dashboard');
  console.log('4. Start the app: npm run dev');
  console.log('5. Look for: "✅ Supabase connected" in console\n');
} else {
  console.log('📦 Environment: Using mock data (development mode)');
  console.log('');
  console.log('Your app will work perfectly with demo data!');
  console.log('');
  console.log('To connect Supabase later:');
  console.log('1. Read: /CONNECT_TO_SUPABASE.md');
  console.log('2. Create .env.local with your Supabase keys');
  console.log('3. Restart dev server');
  console.log('');
  console.log('For now, just run: npm run dev\n');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('📖 Documentation:');
console.log('   - Quick Start: /CONNECT_TO_SUPABASE.md');
console.log('   - Environment Fix: /SUPABASE_ENV_FIX.md');
console.log('   - Complete Guide: /SUPABASE_SETUP_GUIDE.md');
console.log('');
console.log('🎉 You\'re all set! Run: npm run dev');
console.log('');
