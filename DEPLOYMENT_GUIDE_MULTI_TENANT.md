# Multi-Tenant Architecture - Deployment Guide

## Quick Start

This guide helps you deploy the multi-tenant, multi-venue database architecture with calendar support.

## Prerequisites

✅ Supabase project setup  
✅ Existing database with initial schema  
✅ Supabase CLI installed (optional but recommended)  

## Step 1: Review Changes

### What's Being Added

1. **Calendar Tables**
   - `venue_calendars`: Master calendars for venues
   - `game_calendars`: Game-specific schedules

2. **Enhanced Tables**
   - `bookings`: Calendar references, denormalized names
   - `games`: Organization/venue metadata, calendar link
   - `venues`: Organization metadata
   - `payments`: Multi-tenant references
   - `customers`: Name fields split, metadata
   - `organizations`: Display names

3. **New Features**
   - Automatic name population (triggers)
   - Stripe sync logging
   - Calendar availability engine
   - Multi-tenant RLS policies

## Step 2: Backup Your Database

**CRITICAL**: Always backup before major schema changes!

```bash
# Using Supabase CLI
supabase db dump -f backup-$(date +%Y%m%d).sql

# Or via Supabase Dashboard
# Settings > Database > Database Backups > Create Backup
```

## Step 3: Apply Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. Open Supabase Dashboard
2. Navigate to **SQL Editor**
3. Apply migrations in order:

#### Migration 1: Calendar Architecture
```sql
-- Copy contents from:
-- supabase/migrations/020_multi_tenant_calendar_architecture.sql
-- Paste into SQL Editor and Execute
```

#### Migration 2: Stripe Metadata
```sql
-- Copy contents from:
-- supabase/migrations/021_update_stripe_metadata_fields.sql
-- Paste into SQL Editor and Execute
```

### Option B: Using Supabase CLI

```bash
cd /path/to/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2

# Push migrations to remote database
supabase db push

# Or apply individually
supabase db execute -f supabase/migrations/020_multi_tenant_calendar_architecture.sql
supabase db execute -f supabase/migrations/021_update_stripe_metadata_fields.sql
```

## Step 4: Verify Migrations

Run these verification queries in Supabase SQL Editor:

```sql
-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('venue_calendars', 'game_calendars', 'stripe_sync_log');

-- Should return 3 rows

-- Check if new columns exist on bookings
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
  AND column_name IN (
    'venue_calendar_id', 
    'game_calendar_id', 
    'organization_name', 
    'venue_name', 
    'game_name'
  );

-- Should return 5 rows

-- Check if triggers exist
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%populate%';

-- Should return triggers for auto-populating names
```

## Step 5: Data Migration (If Needed)

### Backfill Organization Data

If your existing venues don't have `organization_id`:

```sql
-- Create or assign to default organization
INSERT INTO organizations (id, name, slug, plan)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Organization',
  'default-org',
  'pro'
) ON CONFLICT (id) DO NOTHING;

-- Update venues with default organization
UPDATE venues 
SET organization_id = '00000000-0000-0000-0000-000000000001'
WHERE organization_id IS NULL;

-- Update games with organization from venues
UPDATE games g
SET organization_id = v.organization_id
FROM venues v
WHERE g.venue_id = v.id
  AND g.organization_id IS NULL;
```

### Populate Denormalized Fields

```sql
-- Update existing bookings with names
UPDATE bookings b
SET 
  organization_name = o.name,
  venue_name = v.name,
  game_name = g.name
FROM organizations o, venues v, games g
WHERE b.organization_id = o.id
  AND b.venue_id = v.id
  AND b.game_id = g.id
  AND (b.organization_name IS NULL 
    OR b.venue_name IS NULL 
    OR b.game_name IS NULL);

-- Update existing games with names
UPDATE games g
SET 
  organization_name = o.name,
  venue_name = v.name
FROM organizations o, venues v
WHERE g.organization_id = o.id
  AND g.venue_id = v.id
  AND (g.organization_name IS NULL 
    OR g.venue_name IS NULL);
```

### Split Customer Names

```sql
-- Split full_name into first_name and last_name
UPDATE customers 
SET 
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE 
    WHEN ARRAY_LENGTH(STRING_TO_ARRAY(full_name, ' '), 1) > 1 
    THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL 
  AND full_name IS NOT NULL;
```

## Step 6: Create Default Calendars

```sql
-- Create default venue calendars for all existing venues
INSERT INTO venue_calendars (
  organization_id,
  venue_id,
  name,
  slug,
  is_default,
  is_active
)
SELECT 
  v.organization_id,
  v.id as venue_id,
  v.name || ' - Main Calendar' as name,
  'main' as slug,
  true as is_default,
  true as is_active
FROM venues v
WHERE NOT EXISTS (
  SELECT 1 FROM venue_calendars vc 
  WHERE vc.venue_id = v.id AND vc.is_default = true
);

-- Create game calendars for all existing games
INSERT INTO game_calendars (
  organization_id,
  venue_id,
  venue_calendar_id,
  game_id,
  name,
  slug,
  is_active
)
SELECT 
  g.organization_id,
  g.venue_id,
  vc.id as venue_calendar_id,
  g.id as game_id,
  g.name || ' Schedule' as name,
  LOWER(REGEXP_REPLACE(g.name, '[^a-zA-Z0-9]+', '-', 'g')) || '-schedule' as slug,
  true as is_active
FROM games g
INNER JOIN venue_calendars vc ON vc.venue_id = g.venue_id AND vc.is_default = true
WHERE NOT EXISTS (
  SELECT 1 FROM game_calendars gc WHERE gc.game_id = g.id
);

-- Link games to their calendars
UPDATE games g
SET calendar_id = gc.id
FROM game_calendars gc
WHERE gc.game_id = g.id
  AND g.calendar_id IS NULL;
```

## Step 7: Update Frontend Environment

No environment variable changes needed! The system will automatically:
- Fetch organization/venue data when creating games
- Send metadata to Stripe
- Use calendar system for availability

## Step 8: Test the Implementation

### Test 1: Create New Venue
```typescript
const venue = await createVenue({
  organization_id: 'your-org-id',
  name: 'Test Venue',
  address: '123 Test St'
});

// Verify:
// 1. Venue created with organization_name populated
// 2. Default venue calendar auto-created
```

### Test 2: Create New Game
```typescript
const game = await createGame({
  venue_id: 'venue-id',
  name: 'Test Game',
  price: 30.00,
  duration: 60
});

// Verify:
// 1. Game created with organization/venue names
// 2. Game calendar auto-created
// 3. Stripe product includes full metadata
```

### Test 3: Create Booking
```typescript
// Booking creation should auto-populate all context
// Check booking_metadata includes calendar IDs
```

### Test 4: Check RLS Policies
```sql
-- Login as a user from organization A
-- Should NOT see data from organization B
SELECT * FROM bookings; -- Only org A data
SELECT * FROM games; -- Only org A data
SELECT * FROM venues; -- Only org A data
```

## Step 9: Monitor Stripe Integration

```sql
-- Check Stripe sync log
SELECT * FROM stripe_sync_log
ORDER BY created_at DESC
LIMIT 20;

-- Should show successful syncs when games are created
```

## Step 10: Performance Verification

```sql
-- Test denormalized queries (should be fast)
EXPLAIN ANALYZE
SELECT 
  booking_number,
  organization_name,
  venue_name,
  game_name,
  booking_date
FROM bookings
WHERE organization_id = 'your-org-id'
  AND booking_date >= CURRENT_DATE
LIMIT 100;

-- Should use indexes efficiently
```

## Rollback Plan

If you need to rollback:

```sql
-- Drop new tables
DROP TABLE IF EXISTS stripe_sync_log CASCADE;
DROP TABLE IF EXISTS game_calendars CASCADE;
DROP TABLE IF EXISTS venue_calendars CASCADE;

-- Remove new columns (DO THIS CAREFULLY)
ALTER TABLE bookings 
  DROP COLUMN IF EXISTS venue_calendar_id,
  DROP COLUMN IF EXISTS game_calendar_id,
  DROP COLUMN IF EXISTS organization_name,
  DROP COLUMN IF EXISTS venue_name,
  DROP COLUMN IF EXISTS game_name,
  DROP COLUMN IF EXISTS booking_metadata;

ALTER TABLE games
  DROP COLUMN IF EXISTS calendar_id,
  DROP COLUMN IF EXISTS organization_name,
  DROP COLUMN IF EXISTS venue_name,
  DROP COLUMN IF EXISTS stripe_metadata;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_populate_booking_names ON bookings;
DROP TRIGGER IF EXISTS trigger_populate_game_names ON games;
DROP TRIGGER IF EXISTS trigger_populate_venue_names ON venues;

-- Restore from backup
-- psql your_db < backup-YYYYMMDD.sql
```

## Common Issues & Solutions

### Issue: Foreign Key Violation
**Problem**: Existing data has null organization_id  
**Solution**: Run Step 5 data migration queries

### Issue: Trigger Not Firing
**Problem**: Names not auto-populating  
**Solution**: Check trigger exists and is enabled:
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name LIKE '%populate%';
```

### Issue: RLS Blocking Queries
**Problem**: Can't see any data after migration  
**Solution**: Ensure user is properly linked to organization:
```sql
-- Check user's organization
SELECT organization_id FROM users WHERE id = auth.uid();

-- If null, assign to organization
UPDATE users SET organization_id = 'org-id' WHERE id = auth.uid();
```

### Issue: Calendar Not Created
**Problem**: New games don't have calendars  
**Solution**: Run default calendar creation from Step 6

## Support

- Review full documentation: `MULTI_TENANT_ARCHITECTURE_IMPLEMENTATION.md`
- Check migration files for detailed SQL
- Test in development environment first
- Take backups before production deployment

## Success Criteria

✅ All migrations applied without errors  
✅ New tables exist (venue_calendars, game_calendars, stripe_sync_log)  
✅ Denormalized fields populated on existing data  
✅ Triggers auto-populate names on new records  
✅ RLS policies enforce organization isolation  
✅ Calendars auto-created for venues and games  
✅ Stripe metadata includes organization/venue info  
✅ Widget bookings work with calendar system  

## Next Steps After Deployment

1. **Add Calendar UI**: Build calendar picker for bookings
2. **Availability View**: Show real-time slot availability
3. **Reporting**: Leverage denormalized fields for fast reports
4. **Multi-Organization**: Onboard additional companies
5. **Advanced Calendars**: Add pricing rules, blocked dates UI

---

**Remember**: Test in development first, backup production, and deploy during low-traffic hours!
