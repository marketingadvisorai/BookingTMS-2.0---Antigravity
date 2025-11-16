# 🗑️ Soft-Delete System with 7-Day Auto-Cleanup

**Implementation Date:** November 16, 2025 06:09 AM UTC+6  
**Purpose:** Save database storage by automatically deleting test venues/games after 7 days  
**Status:** ✅ **IMPLEMENTED & READY**

---

## 📋 **WHAT IS SOFT-DELETE?**

### Concept:
Instead of immediately deleting records from the database, we:
1. **Mark them as deleted** (set `is_deleted = TRUE`, `deleted_at = NOW()`)
2. **Hide them from normal queries** (RLS policies exclude soft-deleted records)
3. **Auto-delete after 7 days** (Edge Function permanently removes old deleted records)

### Benefits:
- ✅ **Recovery possible** - Can restore within 7 days if deleted by mistake
- ✅ **Database efficiency** - Old test data automatically cleaned up
- ✅ **Storage savings** - Prevents bloat from test venues/games
- ✅ **Audit trail** - Know when items were deleted
- ✅ **Performance** - Indexes on deleted fields for fast queries

---

## 🛠️ **WHAT WAS IMPLEMENTED**

### 1. Database Schema Changes ✅

#### **New Columns Added:**
```sql
-- Games table
ALTER TABLE games ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE games ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- Venues table  
ALTER TABLE venues ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE venues ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
```

#### **Indexes for Performance:**
```sql
CREATE INDEX idx_games_deleted_at ON games(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_games_is_deleted ON games(is_deleted) WHERE is_deleted = TRUE;
CREATE INDEX idx_venues_deleted_at ON venues(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_venues_is_deleted ON venues(is_deleted) WHERE is_deleted = TRUE;
```

---

### 2. RLS Policies Updated ✅

**Games Table:**
```sql
-- Only show non-deleted games
CREATE POLICY "Authenticated users can view active games"
ON games FOR SELECT TO authenticated
USING (status = 'active' AND (is_deleted = FALSE OR is_deleted IS NULL));

CREATE POLICY "Anonymous users can view active games"
ON games FOR SELECT TO anon
USING (status = 'active' AND (is_deleted = FALSE OR is_deleted IS NULL));
```

**Venues Table:**
```sql
-- Only show non-deleted venues
CREATE POLICY "Authenticated users can view active venues"
ON venues FOR SELECT TO authenticated
USING (is_deleted = FALSE OR is_deleted IS NULL);

CREATE POLICY "Anonymous users can view active venues"
ON venues FOR SELECT TO anon
USING (is_deleted = FALSE OR is_deleted IS NULL);
```

---

### 3. Database Functions Created ✅

#### **Function: `soft_delete_game(game_id UUID)`**
```sql
-- Soft deletes a game
UPDATE games
SET is_deleted = TRUE, deleted_at = NOW(), status = 'deleted'
WHERE id = game_id;
```

**Usage:**
```sql
SELECT soft_delete_game('550e8400-e29b-41d4-a716-446655440000');
```

---

#### **Function: `soft_delete_venue(venue_id UUID)`**
```sql
-- Soft deletes venue AND all its games
UPDATE games SET is_deleted = TRUE, deleted_at = NOW(), status = 'deleted'
WHERE venue_id = venue_id;

UPDATE venues SET is_deleted = TRUE, deleted_at = NOW(), status = 'inactive'
WHERE id = venue_id;
```

**Usage:**
```sql
SELECT soft_delete_venue('550e8400-e29b-41d4-a716-446655440000');
```

---

#### **Function: `restore_game(game_id UUID)`**
```sql
-- Restores a soft-deleted game
UPDATE games
SET is_deleted = FALSE, deleted_at = NULL, status = 'active'
WHERE id = game_id;
```

**Usage:**
```sql
SELECT restore_game('550e8400-e29b-41d4-a716-446655440000');
```

---

#### **Function: `restore_venue(venue_id UUID)`**
```sql
-- Restores a soft-deleted venue
UPDATE venues
SET is_deleted = FALSE, deleted_at = NULL, status = 'active'
WHERE id = venue_id;
```

**Usage:**
```sql
SELECT restore_venue('550e8400-e29b-41d4-a716-446655440000');
```

---

#### **Function: `cleanup_deleted_records(days_old INTEGER)`**
```sql
-- Permanently deletes games/venues deleted more than N days ago
DELETE FROM games
WHERE is_deleted = TRUE
  AND deleted_at < NOW() - (days_old || ' days')::INTERVAL;

DELETE FROM venues
WHERE is_deleted = TRUE
  AND deleted_at < NOW() - (days_old || ' days')::INTERVAL;
```

**Usage:**
```sql
-- Delete records older than 7 days
SELECT * FROM cleanup_deleted_records(7);

-- Returns: {deleted_games: 5, deleted_venues: 2}
```

---

### 4. Edge Function Created ✅

**Location:** `supabase/functions/cleanup-deleted-records/index.ts`

**Purpose:** Automatically cleanup old deleted records (called via cron/webhook)

**Endpoint:**
```
POST https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/cleanup-deleted-records?days=7
Authorization: Bearer <SUPABASE_ANON_KEY>
```

**Response:**
```json
{
  "success": true,
  "message": "Cleanup completed successfully",
  "deleted_games": 3,
  "deleted_venues": 1,
  "days_threshold": 7,
  "timestamp": "2025-11-16T06:09:00.000Z"
}
```

---

## 🚀 **DEPLOYMENT STEPS**

### Step 1: Database Migration ✅
Already applied via MCP tool. Verify with:
```sql
-- Check columns exist
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name IN ('games', 'venues')
  AND column_name IN ('deleted_at', 'is_deleted');

-- Check functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%delete%';
```

---

### Step 2: Deploy Edge Function

```bash
# Navigate to project
cd /path/to/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2

# Deploy the cleanup function
supabase functions deploy cleanup-deleted-records

# Set secrets (if not already set)
supabase secrets set SUPABASE_URL=https://ohfjkcajnqvethmrpdwc.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

### Step 3: Schedule Automatic Cleanup

#### **Option A: Supabase Cron (Recommended)**
In Supabase Dashboard → Database → Cron Jobs:

```sql
-- Run cleanup daily at 2 AM
SELECT cron.schedule(
  'cleanup-deleted-records-daily',
  '0 2 * * *',  -- Daily at 2:00 AM
  $$
  SELECT net.http_post(
    url := 'https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/cleanup-deleted-records?days=7',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);
```

#### **Option B: External Cron (e.g., cron-job.org)**
Set up a daily HTTP request:
- **URL:** `https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/cleanup-deleted-records?days=7`
- **Method:** POST
- **Headers:** `Authorization: Bearer <SUPABASE_ANON_KEY>`
- **Schedule:** Daily at 2:00 AM UTC

#### **Option C: GitHub Actions**
Create `.github/workflows/cleanup-deleted-records.yml`:
```yaml
name: Cleanup Deleted Records
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call cleanup Edge Function
        run: |
          curl -X POST \
            'https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/cleanup-deleted-records?days=7' \
            -H 'Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}' \
            -H 'Content-Type: application/json'
```

---

## 📱 **FRONTEND UPDATES NEEDED**

### Update Delete Handlers

#### **Games Delete (example):**
```typescript
// Before (hard delete)
const deleteGame = async (gameId: string) => {
  const { error } = await supabase
    .from('games')
    .delete()
    .eq('id', gameId);
};

// After (soft delete)
const deleteGame = async (gameId: string) => {
  const { error } = await supabase
    .rpc('soft_delete_game', { game_id: gameId });
  
  if (!error) {
    toast.success('Game deleted (recoverable for 7 days)');
  }
};
```

#### **Venues Delete (example):**
```typescript
// Before (hard delete)
const deleteVenue = async (venueId: string) => {
  const { error } = await supabase
    .from('venues')
    .delete()
    .eq('id', venueId);
};

// After (soft delete)
const deleteVenue = async (venueId: string) => {
  const { error } = await supabase
    .rpc('soft_delete_venue', { venue_id: venueId });
  
  if (!error) {
    toast.success('Venue and all games deleted (recoverable for 7 days)');
  }
};
```

---

## 🧪 **TESTING**

### Test 1: Soft Delete a Game
```sql
-- Create test game
INSERT INTO games (id, venue_id, name, duration, price)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  '<your-venue-id>',
  'Test Game',
  60,
  30
);

-- Soft delete it
SELECT soft_delete_game('550e8400-e29b-41d4-a716-446655440000');

-- Verify it's hidden (should return 0 rows)
SELECT * FROM games WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Check deleted record exists (should return 1 row)
SELECT * FROM games WHERE id = '550e8400-e29b-41d4-a716-446655440000' AND is_deleted = TRUE;
```

---

### Test 2: Restore a Game
```sql
-- Restore the game
SELECT restore_game('550e8400-e29b-41d4-a716-446655440000');

-- Verify it's visible again
SELECT * FROM games WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

---

### Test 3: Cleanup Old Records
```sql
-- Manually set deleted_at to 8 days ago for testing
UPDATE games 
SET deleted_at = NOW() - INTERVAL '8 days'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Run cleanup (should delete games older than 7 days)
SELECT * FROM cleanup_deleted_records(7);

-- Verify game is permanently deleted
SELECT * FROM games WHERE id = '550e8400-e29b-41d4-a716-446655440000' AND is_deleted = TRUE;
-- Should return 0 rows
```

---

### Test 4: Edge Function
```bash
# Test Edge Function manually
curl -X POST \
  'https://ohfjkcajnqvethmrpdwc.supabase.co/functions/v1/cleanup-deleted-records?days=7' \
  -H 'Authorization: Bearer <SUPABASE_ANON_KEY>' \
  -H 'Content-Type: application/json'

# Expected response:
# {
#   "success": true,
#   "deleted_games": 0,
#   "deleted_venues": 0,
#   "days_threshold": 7
# }
```

---

## 📊 **MONITORING & MAINTENANCE**

### Check Soft-Deleted Records
```sql
-- View all soft-deleted games
SELECT id, name, deleted_at, 
  AGE(NOW(), deleted_at) as deleted_for
FROM games
WHERE is_deleted = TRUE
ORDER BY deleted_at DESC;

-- View all soft-deleted venues
SELECT id, name, deleted_at,
  AGE(NOW(), deleted_at) as deleted_for
FROM venues
WHERE is_deleted = TRUE
ORDER BY deleted_at DESC;
```

---

### Storage Savings Estimate
```sql
-- Count records pending cleanup
SELECT 
  'games' as table_name,
  COUNT(*) as pending_deletion,
  COUNT(*) FILTER (WHERE deleted_at < NOW() - INTERVAL '7 days') as ready_to_cleanup
FROM games
WHERE is_deleted = TRUE
UNION ALL
SELECT 
  'venues',
  COUNT(*),
  COUNT(*) FILTER (WHERE deleted_at < NOW() - INTERVAL '7 days')
FROM venues
WHERE is_deleted = TRUE;
```

---

### Manual Cleanup (if needed)
```sql
-- Force cleanup of all records older than 7 days
SELECT * FROM cleanup_deleted_records(7);

-- Aggressive cleanup (3 days instead of 7)
SELECT * FROM cleanup_deleted_records(3);

-- View what will be deleted (dry run)
SELECT 'games' as type, id, name, deleted_at
FROM games
WHERE is_deleted = TRUE
  AND deleted_at < NOW() - INTERVAL '7 days'
UNION ALL
SELECT 'venues', id, name, deleted_at
FROM venues
WHERE is_deleted = TRUE
  AND deleted_at < NOW() - INTERVAL '7 days';
```

---

## 🔒 **SECURITY CONSIDERATIONS**

### Permissions:
- ✅ `soft_delete_*` functions: `authenticated` + `service_role`
- ✅ `restore_*` functions: `authenticated` + `service_role`
- ✅ `cleanup_deleted_records`: `service_role` only (security)

### RLS Policies:
- ✅ Users can only see non-deleted records
- ✅ Soft-deleted records hidden from all SELECT queries
- ✅ Service role can access deleted records for cleanup

### Edge Function Auth:
- ✅ Requires Authorization header
- ✅ Uses service role key (admin access)
- ✅ Can only be called by authorized services

---

## 🎯 **SUCCESS CRITERIA**

### System Working Correctly When:
- ✅ Deleted games/venues disappear from UI immediately
- ✅ Deleted records hidden from normal queries
- ✅ Soft-deleted records have `deleted_at` timestamp
- ✅ Records older than 7 days automatically removed daily
- ✅ Storage usage stays optimal
- ✅ Test data doesn't bloat database

---

## 📚 **FILES CREATED/MODIFIED**

### New Files:
1. `supabase/functions/cleanup-deleted-records/index.ts` - Edge Function
2. `SOFT_DELETE_SYSTEM_GUIDE.md` - This documentation

### Modified:
1. Database schema (added `deleted_at`, `is_deleted` columns)
2. RLS policies (exclude soft-deleted records)

### To Update (Next):
1. `src/hooks/useGames.ts` - Update delete handler
2. `src/hooks/useVenues.ts` - Update delete handler
3. Frontend components using delete functions

---

## 🚨 **IMPORTANT NOTES**

### Recovery Window:
- **Soft-deleted records**: Recoverable for **7 days**
- **After 7 days**: **Permanently deleted** (cannot recover)
- **Test carefully** before production use

### Database Space:
- Soft-deleted records still use storage until cleaned up
- Cleanup runs **daily** automatically
- Manual cleanup available if needed

### Cascade Deletes:
- Deleting a **venue** soft-deletes **all its games**
- Restoring a **venue** does NOT auto-restore games (manual control)
- Be careful with cascade operations

---

## ✅ **DEPLOYMENT CHECKLIST**

- [x] Database migration applied
- [x] RLS policies updated
- [x] Database functions created
- [x] Edge Function created
- [x] Documentation written
- [ ] Deploy Edge Function to Supabase
- [ ] Set up cron job for automatic cleanup
- [ ] Update frontend delete handlers
- [ ] Test soft-delete in UI
- [ ] Test restore functionality
- [ ] Monitor cleanup logs
- [ ] Verify storage savings

---

## 📞 **SUPPORT**

### Troubleshooting:

**Issue:** Deleted records still visible
- **Fix:** Check RLS policies are updated, refresh browser

**Issue:** Cleanup not running
- **Fix:** Verify cron job is set up, check Edge Function logs

**Issue:** Can't restore record
- **Fix:** Check it hasn't been 7+ days, use `restore_*` function

**Issue:** Too many records being kept
- **Fix:** Reduce cleanup threshold (e.g., 3 days instead of 7)

---

**Status:** ✅ **SYSTEM IMPLEMENTED - READY FOR DEPLOYMENT**  
**Next Step:** Deploy Edge Function and set up cron job 🚀
