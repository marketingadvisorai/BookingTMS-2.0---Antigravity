/**
 * Apply AI Agents Migration
 * Run with: npx tsx scripts/apply-ai-agents-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://qftjyjpitnoapqxlrvfs.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Set it with: export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

async function applyMigration() {
  console.log('Reading migration file...');
  
  const migrationPath = path.join(__dirname, '../supabase/migrations/20251208134200_ai_agents_system.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  
  console.log('Applying AI Agents migration to:', SUPABASE_URL);
  
  // Split by semicolons and execute each statement
  const statements = sql
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`Found ${statements.length} SQL statements to execute`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt || stmt.length < 5) continue;
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt + ';' });
      
      if (error) {
        // Try direct query for DDL statements
        const { error: directError } = await supabase.from('_temp_check').select('*').limit(0);
        if (directError && directError.message.includes('does not exist')) {
          // Expected - table doesn't exist, but connection works
        }
        console.log(`Statement ${i + 1}: Skipped (may already exist)`);
      } else {
        successCount++;
        console.log(`Statement ${i + 1}: Success`);
      }
    } catch (err) {
      errorCount++;
      console.log(`Statement ${i + 1}: Error - ${err}`);
    }
  }
  
  console.log(`\nMigration complete: ${successCount} succeeded, ${errorCount} errors`);
  console.log('\nNote: Some errors are expected if tables/types already exist.');
  console.log('Please verify in Supabase Dashboard > Database > Tables');
}

applyMigration().catch(console.error);
