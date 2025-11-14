# Migration Application Guide
## BookingTMS Backend - Quick Start

**⚠️ IMPORTANT:** Apply migrations in the exact order listed below.

---

## Prerequisites

1. **Supabase Project** - Active Supabase project
2. **Database Access** - Connection string or SQL Editor access
3. **Backup** - Always backup before applying migrations

---

## Method 1: Supabase Dashboard (Recommended)

### Step 1: Open SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

### Step 2: Apply Migrations in Order

#### Migration 1: Dashboard & Core Functions
```sql
-- Copy and paste content from:
-- src/supabase/migrations/014_add_missing_dashboard_functions.sql

-- Then click "Run" or press Cmd/Ctrl + Enter
```

#### Migration 2: Venues System
```sql
-- Copy and paste content from:
-- src/supabase/migrations/015_complete_venues_implementation.sql

-- Then click "Run"
```

#### Migration 3: Security & RLS
```sql
-- Copy and paste content from:
-- src/supabase/migrations/016_comprehensive_rls_policies.sql

-- Then click "Run"
```

#### Migration 4: Staff, Waivers & Reports
```sql
-- Copy and paste content from:
-- src/supabase/migrations/017_staff_waivers_reports.sql

-- Then click "Run"
```

### Step 3: Verify Installation

```sql
-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_type = 'FUNCTION'
  AND routine_name LIKE 'get_%'
ORDER BY routine_name;

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Test a function
SELECT * FROM get_dashboard_stats();
```

---

## Method 2: Command Line (psql)

### Step 1: Get Connection String
1. Go to Supabase Dashboard → Settings → Database
2. Copy the connection string (use "Transaction" pooler for migrations)
3. Replace `[YOUR-PASSWORD]` with your actual password

### Step 2: Apply Migrations

```bash
# Navigate to project directory
cd /Users/muhammadtariqul/Downloads/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2

# Set connection string
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.ohfjkcajnqvethmrpdwc.supabase.co:5432/postgres"

# Apply migrations in order
psql $DATABASE_URL -f src/supabase/migrations/014_add_missing_dashboard_functions.sql
psql $DATABASE_URL -f src/supabase/migrations/015_complete_venues_implementation.sql
psql $DATABASE_URL -f src/supabase/migrations/016_comprehensive_rls_policies.sql
psql $DATABASE_URL -f src/supabase/migrations/017_staff_waivers_reports.sql
```

### Step 3: Verify

```bash
# Test connection and functions
psql $DATABASE_URL -c "SELECT * FROM get_dashboard_stats();"
```

---

## Method 3: Supabase CLI

### Step 1: Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

### Step 2: Link Project

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ohfjkcajnqvethmrpdwc
```

### Step 3: Apply Migrations

```bash
# Apply all pending migrations
supabase db push

# Or apply specific migration
supabase db execute -f src/supabase/migrations/014_add_missing_dashboard_functions.sql
supabase db execute -f src/supabase/migrations/015_complete_venues_implementation.sql
supabase db execute -f src/supabase/migrations/016_comprehensive_rls_policies.sql
supabase db execute -f src/supabase/migrations/017_staff_waivers_reports.sql
```

---

## Post-Migration Testing

### 1. Test Dashboard Functions

```sql
-- Dashboard stats
SELECT * FROM get_dashboard_stats();

-- Weekly trend
SELECT * FROM get_weekly_bookings_trend();

-- Upcoming bookings
SELECT * FROM get_upcoming_bookings(5);
```

### 2. Test Venue Functions

```sql
-- List all venues
SELECT id, name, embed_key, is_active 
FROM venues;

-- If no venues exist, create one
SELECT create_venue(
  (SELECT id FROM organizations LIMIT 1),
  'Test Venue',
  'Test venue description',
  '123 Test St',
  'Test City',
  'TS',
  'America/New_York'
);
```

### 3. Test Security

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true;

-- Should show all major tables with RLS enabled
```

### 4. Test Audit Logging

```sql
-- Check audit logs table exists
SELECT COUNT(*) FROM audit_logs;

-- Create a test booking to trigger audit
-- Then check audit logs
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Troubleshooting

### Error: "relation already exists"
**Solution:** Some tables may already exist. This is OK - the migration uses `IF NOT EXISTS` clauses.

### Error: "function already exists"
**Solution:** Use `CREATE OR REPLACE FUNCTION` - migrations handle this automatically.

### Error: "permission denied"
**Solution:** Ensure you're using the correct database credentials with sufficient permissions.

### Error: "column does not exist"
**Solution:** Apply migrations in the correct order (014 → 015 → 016 → 017).

### RLS Blocking Queries
**Solution:** 
```sql
-- Temporarily disable RLS for testing (as superuser)
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Re-enable after testing
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
```

---

## Rollback (If Needed)

### Rollback Last Migration

```sql
-- Drop functions from migration 017
DROP FUNCTION IF EXISTS create_waiver CASCADE;
DROP FUNCTION IF EXISTS submit_waiver CASCADE;
-- ... (drop all functions from that migration)

-- Drop tables from migration 017
DROP TABLE IF EXISTS waiver_submissions CASCADE;
DROP TABLE IF EXISTS waivers CASCADE;
-- ... (drop all tables from that migration)
```

### Full Rollback

```sql
-- WARNING: This will delete ALL data
-- Only use in development/testing

-- Drop all custom functions
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

---

## Migration Checklist

- [ ] Backup database
- [ ] Apply Migration 014 (Dashboard & Core)
- [ ] Apply Migration 015 (Venues)
- [ ] Apply Migration 016 (Security & RLS)
- [ ] Apply Migration 017 (Staff, Waivers, Reports)
- [ ] Test dashboard functions
- [ ] Test venue functions
- [ ] Test booking functions
- [ ] Verify RLS policies
- [ ] Check audit logging
- [ ] Test from frontend application
- [ ] Monitor for errors in logs
- [ ] Update frontend to use new functions

---

## Success Indicators

✅ All migrations applied without errors  
✅ Dashboard functions return data  
✅ Venue functions work correctly  
✅ RLS policies are active  
✅ Audit logging captures changes  
✅ Frontend can fetch data  
✅ No permission errors in logs  

---

## Next Steps After Migration

1. **Update Frontend Hooks**
   - Ensure all hooks use new RPC functions
   - Update API calls to match new signatures
   - Test real-time subscriptions

2. **Test Each Page**
   - Dashboard - verify all widgets load
   - Bookings - test CRUD operations
   - Venues - test venue management
   - Customers - test segmentation
   - Reports - test report generation

3. **Monitor Performance**
   - Check query execution times
   - Monitor database connections
   - Watch for slow queries
   - Review audit logs

4. **Security Audit**
   - Test RLS with different user roles
   - Verify organization isolation
   - Test public widget access
   - Review audit trail

---

## Support

If you encounter issues:

1. **Check Logs**
   - Supabase Dashboard → Logs → Postgres Logs
   - Look for error messages

2. **Review Migration Files**
   - Check SQL syntax
   - Verify function signatures
   - Ensure proper ordering

3. **Test Incrementally**
   - Apply one migration at a time
   - Test after each migration
   - Rollback if issues occur

4. **Consult Documentation**
   - `BACKEND_AUDIT_AND_IMPLEMENTATION.md` - Full audit
   - `BACKEND_IMPLEMENTATION_SUMMARY.md` - Implementation details
   - Migration files - SQL comments

---

**Status:** Ready for application  
**Estimated Time:** 10-15 minutes  
**Risk Level:** Low (uses safe migration patterns)  
**Rollback Available:** Yes

---

**Last Updated:** 2025-01-11  
**Version:** 1.0
