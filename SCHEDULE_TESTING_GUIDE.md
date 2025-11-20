# Complete Schedule System Testing & Verification Guide

**Date:** November 16, 2025  
**Version:** 1.0  
**Status:** ✅ Ready for Testing

---

## 🎯 What Was Implemented

### ✅ Database Layer (Supabase)
- **Migration:** `008_add_game_schedule.sql`
- **Column:** `games.schedule` (JSONB)
- **Validation:** `validate_game_schedule()` function
- **Indexing:** GIN index for fast queries

### ✅ Backend Integration (useGames Hook)
- **Create:** Packs schedule into JSONB on save
- **Update:** Intelligently merges schedule changes
- **Fetch:** Unpacks JSONB to flat structure

### ✅ Frontend (AddGameWizard Step 5)
- Operating days selection
- Operating hours configuration
- Custom hours per day
- Time slot interval
- Advance booking limit
- Custom dates with override hours
- Blocked dates (full day & time range)
- **NEW:** Complete validation logic

### ✅ Calendar Widget
- Reads schedule from database
- Disables non-operating days
- Respects advance booking limit
- Hides blocked dates
- Shows custom dates
- Generates time slots from schedule

### ✅ Validation
- Operating days (at least one required)
- Time ranges (end > start)
- Custom hours validation
- Slot interval vs duration check
- Advance booking limits (1-365 days)
- Custom dates validation
- Blocked dates validation

---

## 📋 PRE-TESTING CHECKLIST

### Step 1: Apply Database Migration ⚠️ CRITICAL

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to: https://supabase.com/dashboard/project/pmpktygjzywlhuujnlca
2. Click "SQL Editor" in left sidebar
3. Click "New query"
4. Copy contents from: `supabase/migrations/008_add_game_schedule.sql`
5. Paste into editor
6. Click "Run" (or Ctrl/Cmd + Enter)
7. **Verify:** You should see "Success. No rows returned" and notice "Migrated X games"

**Option B: Via CLI**
```bash
cd "/Users/muhammadtariqul/Windsurf Project/Working - bookingtms/Booking-TMS-Beta-Dev-V0.1-widget-update-0.2"
supabase migration up
```

**Verification Query:**
```sql
-- Run this to verify migration worked
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'games' 
  AND table_schema = 'public'
  AND column_name = 'schedule';

-- Should return: schedule | jsonb | YES
```

### Step 2: Verify Code Changes

**Files Modified:**
- ✅ `src/hooks/useGames.ts` - Schedule data handling
- ✅ `src/components/widgets/CalendarWidget.tsx` - Schedule integration
- ✅ `src/components/games/AddGameWizard.tsx` - Validation added

**Run Build Check:**
```bash
npm run build
# or
yarn build
```

**Expected:** No TypeScript errors related to schedule fields

### Step 3: Start Development Server

```bash
npm run dev
# or
yarn dev
```

---

## 🧪 TEST SCENARIOS

### Test 1: Create Game with Full Schedule ⭐

**Objective:** Verify all schedule features save correctly

**Steps:**
1. Navigate to Games page
2. Click "Add Game" button
3. Fill Steps 1-4 (Basic Info, Players, Duration, Media)
4. **Step 5 - Schedule & Availability:**
   
   a. **Operating Days:**
   - Select: Monday, Wednesday, Friday, Saturday
   
   b. **Operating Hours:**
   - Start Time: 6:00 PM (18:00)
   - End Time: 11:00 PM (23:00)
   
   c. **Custom Hours (Optional):**
   - Toggle "Set different hours for each day"
   - Saturday: 12:00 PM - 12:00 AM (00:00)
   
   d. **Time Slot Interval:**
   - Select: 1 hour (60 minutes)
   
   e. **Advance Booking:**
   - Enter: 14 days
   
   f. **Custom Dates:**
   - Click "Add Custom Date"
   - Date: December 25, 2025
   - Start Time: 12:00 PM
   - End Time: 6:00 PM
   - Click "Add"
   
   g. **Blocked Dates:**
   - Click "Add Blocked Date"
   - Date: December 24, 2025
   - Select "Block full day"
   - Click "Block Date"

5. Complete Steps 6-8
6. Click "Publish"

**Expected Results:**
- ✅ Game created successfully
- ✅ Success toast appears
- ✅ No console errors

**Verification in Supabase:**
```sql
SELECT 
  id,
  name,
  schedule->'operatingDays' as operating_days,
  schedule->'startTime' as start_time,
  schedule->'endTime' as end_time,
  schedule->'slotInterval' as slot_interval,
  schedule->'advanceBooking' as advance_booking,
  schedule->'customDates' as custom_dates,
  schedule->'blockedDates' as blocked_dates
FROM games
WHERE name = 'YOUR_GAME_NAME'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Data:**
- operating_days: ["Monday", "Wednesday", "Friday", "Saturday"]
- start_time: "18:00"
- end_time: "23:00"
- slot_interval: 60
- advance_booking: 14
- custom_dates: Array with Dec 25 entry
- blocked_dates: Array with Dec 24 entry

---

### Test 2: Edit Existing Game Schedule

**Objective:** Verify schedule updates persist correctly

**Steps:**
1. Open game from Test 1 in edit mode
2. Navigate to Step 5
3. **Verify Pre-population:**
   - Operating days: Mon, Wed, Fri, Sat ✅
   - Hours: 6 PM - 11 PM ✅
   - Custom dates shown ✅
   - Blocked dates shown ✅

4. **Make Changes:**
   - Add Sunday to operating days
   - Change end time to 12:00 AM
   - Add new blocked date: Dec 26, 2025 (time range: 2 PM - 4 PM)

5. Click "Save Changes"

**Expected Results:**
- ✅ Update successful toast
- ✅ Changes persist after refresh
- ✅ Supabase data updated

**Verification:**
```sql
SELECT 
  schedule->'operatingDays' as operating_days,
  schedule->'endTime' as end_time,
  schedule->'blockedDates' as blocked_dates
FROM games
WHERE id = 'YOUR_GAME_ID';
```

---

### Test 3: Calendar Widget Integration ⭐⭐⭐

**Objective:** Verify calendar respects game schedule

**Setup:**
1. Create/use game from Test 1
2. Navigate to Venues page
3. Find your venue
4. Click "Preview Calendar Widget"

**Test A: Date Availability**

1. **Navigate to current month**
   - **Expected:** Only Mon, Wed, Fri, Sat are clickable (green)
   - **Expected:** Tue, Thu, Sun are grayed out (red)

2. **Navigate to December 2025**
   - **Expected:** Dec 24 is grayed out (blocked)
   - **Expected:** Dec 25 is green (custom date)
   - **Expected:** Dec 26 shows green (but will have blocked time later)

3. **Try clicking 15+ days in future**
   - **Expected:** Dates beyond advance booking limit (14 days) are grayed out
   - **Hover tooltip:** "Cannot book more than 14 days in advance"

**Test B: Time Slots**

1. **Click Monday (operating day)**
   - **Expected:** Time slots from 6:00 PM - 11:00 PM
   - **Expected:** 1-hour intervals: 6:00 PM, 7:00 PM, 8:00 PM, 9:00 PM, 10:00 PM
   - **Expected:** "Available" status with spot count

2. **Click Tuesday (non-operating day)**
   - **Expected:** "No Available Times" message
   - **Expected:** "This date is not available for booking" explanation

3. **Click Dec 24 (blocked full day)**
   - **Expected:** Cannot select (grayed out)

4. **Click Dec 25 (custom date: 12 PM - 6 PM)**
   - **Expected:** Time slots from 12:00 PM - 6:00 PM
   - **Expected:** NOT regular hours (6 PM - 11 PM)
   - **Expected:** 1-hour intervals

5. **Click Dec 26 (has blocked time: 2 PM - 4 PM)**
   - **Expected:** Regular time slots shown
   - **Expected:** 2:00 PM and 3:00 PM slots show "Sold out" or hidden
   - **Expected:** Other times are available

**Test C: Past Dates**
1. **Navigate to last month**
   - **Expected:** All dates grayed out
   - **Hover:** "Past date"

---

### Test 4: Validation Tests

**Objective:** Verify validation prevents invalid data

**Test 4A: No Operating Days**
1. Create new game
2. Navigate to Step 5
3. **Deselect all days**
4. Try to click "Next"
   - **Expected:** Error toast: "Please select at least one operating day"
   - **Expected:** Stay on Step 5

**Test 4B: Invalid Time Range**
1. Set Start Time: 10:00 PM
2. Set End Time: 6:00 PM (earlier!)
3. Try to click "Next"
   - **Expected:** Error toast: "End time must be after start time"

**Test 4C: Slot Interval < Duration**
1. Game duration: 90 minutes (from Step 2)
2. Slot interval: 60 minutes
3. Try to click "Next"
   - **Expected:** Error toast: "Time slot interval cannot be shorter than game duration"
   - **Expected:** Warning about booking overlaps

**Test 4D: Invalid Advance Booking**
1. Set advance booking: 500 days
2. Try to click "Next"
   - **Expected:** Error toast: "Advance booking must be between 1 and 365 days"

**Test 4E: Invalid Custom Date**
1. Add custom date
2. Start Time: 8:00 PM
3. End Time: 2:00 PM
4. Try to click "Next"
   - **Expected:** Error toast: "Some custom dates have invalid time ranges"

---

### Test 5: Stripe Integration (Payment Metadata)

**Objective:** Verify schedule doesn't break Stripe sync

**Steps:**
1. Create game with full schedule
2. Ensure price is set (Step 2)
3. Complete wizard and publish
4. Check Stripe Dashboard

**Verification:**
1. Go to: https://dashboard.stripe.com/products
2. Find your product
3. Click to view details
4. **Expected:** Product created successfully
5. **Expected:** Price attached
6. **Metadata:** Game details present

**Optional Enhancement:**
Check if schedule info is in Stripe metadata:
```
metadata: {
  operating_days: "Mon,Wed,Fri,Sat"
  advance_booking: "14"
}
```

---

### Test 6: Edge Cases

**Test 6A: Midnight Crossing**
1. Start Time: 11:00 PM
2. End Time: 2:00 AM (next day)
   - **Current Limitation:** May not work correctly
   - **Expected Behavior:** Validation error OR correct handling

**Test 6B: Same Start/End Time**
1. Start: 10:00 AM
2. End: 10:00 AM
   - **Expected:** Validation error

**Test 6C: No Custom Hours Data**
1. Toggle "Different hours per day"
2. Don't modify any days
3. Save game
   - **Expected:** No errors, uses default hours

**Test 6D: Remove All Custom Dates**
1. Add 3 custom dates
2. Remove all 3
3. Save game
   - **Expected:** customDates = []
   - **Expected:** No errors

---

## 🔍 VERIFICATION QUERIES

### Query 1: Check All Games' Schedules
```sql
SELECT 
  id,
  name,
  created_at,
  CASE 
    WHEN schedule IS NULL THEN 'NO SCHEDULE'
    WHEN schedule = '{}'::jsonb THEN 'EMPTY'
    ELSE 'HAS SCHEDULE'
  END as schedule_status,
  schedule->'operatingDays' as operating_days,
  schedule->'slotInterval' as slot_interval,
  schedule->'advanceBooking' as advance_booking
FROM games
ORDER BY created_at DESC;
```

### Query 2: Find Games with Custom Dates
```sql
SELECT 
  id,
  name,
  jsonb_array_length(schedule->'customDates') as custom_date_count,
  schedule->'customDates' as custom_dates
FROM games
WHERE jsonb_array_length(schedule->'customDates') > 0;
```

### Query 3: Find Games with Blocked Dates
```sql
SELECT 
  id,
  name,
  jsonb_array_length(schedule->'blockedDates') as blocked_date_count,
  schedule->'blockedDates' as blocked_dates
FROM games
WHERE jsonb_array_length(schedule->'blockedDates') > 0;
```

### Query 4: Validate All Schedules
```sql
SELECT 
  id,
  name,
  validate_game_schedule(schedule) as is_valid
FROM games
WHERE schedule IS NOT NULL;
-- All should return TRUE
```

---

## 🐛 TROUBLESHOOTING

### Issue: Migration Fails

**Error:** "column already exists"
- **Solution:** Migration already applied, check with verification query

**Error:** "permission denied"
- **Solution:** Use project owner account in dashboard

**Error:** "function does not exist"
- **Solution:** Re-run migration, ensure functions are created

### Issue: Schedule Data Not Saving

**Check:**
1. Console logs in browser DevTools
2. Network tab for Supabase request
3. Response body for errors

**Common Causes:**
- Validation function rejecting data
- Missing fields in schedule object
- RLS policies blocking insert/update

**Fix:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'games';

-- Temporarily disable RLS for testing (DEV ONLY!)
ALTER TABLE games DISABLE ROW LEVEL SECURITY;
-- Re-enable after testing:
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
```

### Issue: Schedule Data Not Loading

**Check:**
1. `useGames` hook console logs
2. Verify data structure in database
3. Check unpacking logic

**Debug:**
```typescript
// Add to useGames.ts fetchGames()
console.log('Raw game data:', data);
console.log('Unpacked schedule:', gamesWithSchedule);
```

### Issue: Calendar Shows All Days Available

**Check:**
1. selectedGameData is defined
2. operatingDays array has values
3. isDayOperating function works

**Debug:**
```typescript
// Add to CalendarWidget.tsx
console.log('Selected game:', selectedGameData);
console.log('Operating days:', selectedGameData?.operatingDays);
console.log('Is operating?', isOperatingDay);
```

### Issue: Validation Not Working

**Check:**
1. handleNext Step 5 condition
2. gameData.operatingDays is array
3. Time comparisons use correct format

**Debug:**
```typescript
// Add to AddGameWizard.tsx handleNext
if (currentStep === 5) {
  console.log('Validating schedule:', gameData);
}
```

---

## ✅ SUCCESS CRITERIA

### Must Pass All:
- [ ] Migration applied without errors
- [ ] Create game with schedule saves to database
- [ ] Schedule data pre-populates in edit mode
- [ ] Calendar widget filters dates correctly
- [ ] Calendar widget shows correct time slots
- [ ] Non-operating days are disabled
- [ ] Blocked dates are disabled
- [ ] Custom dates override regular hours
- [ ] Advance booking limit enforced
- [ ] All validation errors work
- [ ] No console errors in any flow
- [ ] Stripe integration still works

### Performance Benchmarks:
- [ ] Game creation < 3 seconds
- [ ] Schedule load in edit < 1 second
- [ ] Calendar render < 500ms
- [ ] Time slots generate < 100ms

---

## 📊 TEST RESULTS TEMPLATE

```markdown
## Test Results - [Date]

### Environment:
- Browser: [Chrome/Safari/Firefox]
- Supabase Project: pmpktygjzywlhuujnlca
- Branch: main

### Test 1: Create Game with Full Schedule
- Status: [PASS/FAIL]
- Notes: [Any issues or observations]

### Test 2: Edit Existing Game Schedule
- Status: [PASS/FAIL]
- Notes: 

### Test 3: Calendar Widget Integration
- Test 3A (Date Availability): [PASS/FAIL]
- Test 3B (Time Slots): [PASS/FAIL]
- Test 3C (Past Dates): [PASS/FAIL]
- Notes:

### Test 4: Validation Tests
- Test 4A (No Operating Days): [PASS/FAIL]
- Test 4B (Invalid Time Range): [PASS/FAIL]
- Test 4C (Slot Interval): [PASS/FAIL]
- Test 4D (Advance Booking): [PASS/FAIL]
- Test 4E (Invalid Custom Date): [PASS/FAIL]
- Notes:

### Test 5: Stripe Integration
- Status: [PASS/FAIL]
- Notes:

### Test 6: Edge Cases
- Test 6A-6D: [Summary]

### Issues Found:
1. [Issue description]
2. [Issue description]

### Overall Status: [PASS/FAIL]
```

---

**Next:** Run through all tests and report results! 🚀
