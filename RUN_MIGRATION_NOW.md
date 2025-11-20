# 🚀 Run Migration & Cleanup - QUICK START

**Time Required:** 5-10 minutes  
**Difficulty:** Easy  
**Status:** Ready to execute

---

## ⚡ FASTEST METHOD (Recommended)

### Option 1: Supabase Dashboard (No CLI needed)

**This is the easiest and most reliable method!**

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/pmpktygjzywlhuujnlca
   - Login if needed

2. **Open SQL Editor:**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New query"** button

3. **Copy Migration SQL:**
   - Open file: `supabase/migrations/008_add_game_schedule.sql`
   - Copy **entire contents** (Ctrl/Cmd + A, then Ctrl/Cmd + C)

4. **Paste and Run:**
   - Paste into Supabase SQL Editor
   - Click **"Run"** button (or press Ctrl/Cmd + Enter)

5. **Verify Success:**
   ```
   ✅ Expected: "Success. No rows returned"
   ℹ️  Notice: "Migrated X games to new schedule format"
   ```

6. **Verify Column Created:**
   Run this query in SQL Editor:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'games' AND column_name = 'schedule';
   ```
   
   **Expected result:** One row showing `schedule | jsonb`

**✅ DONE! Migration applied successfully!**

---

## 🔧 Option 2: Node.js Script (Cleanup + Migration)

**Use this if you want to also clean up old data automatically**

### Prerequisites:
- Node.js installed
- Supabase credentials

### Steps:

1. **Get Your Supabase Anon Key:**
   - Go to: https://supabase.com/dashboard/project/pmpktygjzywlhuujnlca/settings/api
   - Copy the **"anon public"** key

2. **Set Environment Variable:**
   ```bash
   export VITE_SUPABASE_ANON_KEY="your-anon-key-here"
   ```

3. **Run Migration Script:**
   ```bash
   cd "/Users/muhammadtariqul/Windsurf Project/Working - bookingtms/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2"
   
   node scripts/migrate-and-cleanup.js
   ```

4. **Review Output:**
   - Check for ✅ success messages
   - Note any ⚠️ warnings
   - Review orphaned games/venues

**What This Script Does:**
- ✅ Updates all games with default schedule
- ✅ Removes orphaned games (no venue_id)
- ✅ Lists test/demo games (doesn't delete)
- ✅ Checks for orphaned venues
- ✅ Verifies implementation

---

## 📊 Verification Steps

After running migration (either method), verify it worked:

### 1. Check Database Structure
```sql
-- Run in Supabase SQL Editor
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'games' AND column_name = 'schedule';
```

**Expected:** `schedule | jsonb | YES`

### 2. Check Game Data
```sql
-- Run in Supabase SQL Editor
SELECT 
  id,
  name,
  schedule->'operatingDays' as operating_days,
  schedule->'startTime' as start_time,
  schedule->'endTime' as end_time
FROM games
LIMIT 5;
```

**Expected:** All games should have schedule data

### 3. Count Games with Schedules
```sql
-- Run in Supabase SQL Editor
SELECT 
  COUNT(*) as total_games,
  COUNT(schedule) as games_with_schedule,
  COUNT(*) - COUNT(schedule) as games_without_schedule
FROM games;
```

**Expected:** `games_without_schedule` should be 0

---

## 🧹 Manual Cleanup (Optional)

If you want to manually clean up old data:

### Remove Orphaned Games
```sql
-- Check first
SELECT id, name, venue_id 
FROM games 
WHERE venue_id IS NULL;

-- Delete if confirmed
DELETE FROM games WHERE venue_id IS NULL;
```

### Remove Test Games
```sql
-- Check first
SELECT id, name 
FROM games 
WHERE name ILIKE '%test%' 
   OR name ILIKE '%demo%' 
   OR name ILIKE '%sample%';

-- Delete specific ones
DELETE FROM games WHERE id = 'specific-id-here';
```

### Check Orphaned Venues
```sql
-- Check venues without organization
SELECT id, name, organization_id 
FROM venues 
WHERE organization_id IS NULL;
```

---

## ✅ Success Checklist

After migration, verify these:

- [ ] **Migration Applied**
  - [ ] SQL ran without errors
  - [ ] `schedule` column exists in `games` table
  - [ ] Column type is `jsonb`

- [ ] **Data Migrated**
  - [ ] All existing games have schedule data
  - [ ] Default schedule applied (7 days, 10 AM - 10 PM)
  - [ ] No games with null/empty schedule

- [ ] **Cleanup Done**
  - [ ] No orphaned games (without venue_id)
  - [ ] Test/demo games reviewed
  - [ ] Orphaned venues identified (if any)

- [ ] **Application Works**
  - [ ] Can create new game with schedule
  - [ ] Can edit existing game schedule
  - [ ] Calendar widget shows correct availability
  - [ ] No console errors

---

## 🐛 Troubleshooting

### Error: "column already exists"
**Solution:** Migration already applied! This is fine, continue to verification.

### Error: "permission denied"
**Solution:** 
1. Make sure you're logged in as project owner
2. Check RLS policies
3. Try using service role key instead of anon key

### Error: "function does not exist"
**Solution:** Some parts of migration may have failed. Run the full SQL manually in dashboard.

### Script hangs or times out
**Solution:** 
1. Check network connection
2. Verify Supabase project is online
3. Try dashboard method instead

### Games still don't have schedule
**Solution:**
```sql
-- Manually update games
UPDATE games 
SET schedule = '{
  "operatingDays": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
  "startTime": "10:00",
  "endTime": "22:00",
  "slotInterval": 60,
  "advanceBooking": 30,
  "customHoursEnabled": false,
  "customHours": {},
  "customDates": [],
  "blockedDates": []
}'::jsonb
WHERE schedule IS NULL OR schedule = '{}'::jsonb;
```

---

## 📞 Need Help?

If you encounter issues:

1. **Check Logs:**
   - Browser console (F12)
   - Supabase logs dashboard
   - Script output

2. **Verify Credentials:**
   - Supabase URL correct
   - Anon key valid
   - Project accessible

3. **Common Issues:**
   - RLS policies blocking access
   - Network/firewall issues
   - Insufficient permissions

4. **Fallback:**
   - Use dashboard method (Option 1)
   - Apply migration manually
   - Contact support if needed

---

## 🎯 What's Next?

After successful migration:

1. **Test Game Creation:**
   - Create new game
   - Fill out schedule in Step 5
   - Verify saves to database

2. **Test Game Editing:**
   - Edit existing game
   - Check Step 5 pre-populates
   - Modify and save

3. **Test Calendar Widget:**
   - Open calendar preview
   - Check date filtering
   - Verify time slots

4. **Deploy to Production:**
   - All tests pass
   - No errors
   - Ready to go live!

---

**Status:** ✅ Migration ready to run  
**Estimated Time:** 5 minutes  
**Recommended Method:** Option 1 (Dashboard)

**GO FOR IT! 🚀**
