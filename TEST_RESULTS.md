# 🧪 Test Results - Supabase Bookings Implementation

**Test Date**: November 8, 2025, 10:14 AM UTC+06:00
**Tester**: Automated Setup + Manual Verification Required
**Environment**: Development (localhost:3000)

## ✅ Pre-Test Setup Complete

### Database Connection
- ✅ Supabase project connected: `ohfjkcajnqvethmrpdwc`
- ✅ Connection verified
- ✅ Tables accessible

### Test Data Created

#### Venues (3 total)
1. **eees**
   - Embed Key: `emb_j542svtecbwu`
   - Slug: `eees`
   - Widget URL: `/embed?widgetId=farebook&widgetKey=emb_j542svtecbwu`

2. **Axe**
   - Embed Key: `emb_hbup7vpmk296`
   - Slug: `axe`
   - Widget URL: `/embed?widgetId=farebook&widgetKey=emb_hbup7vpmk296`

3. **Smash Room**
   - Embed Key: `emb_loynyx2s5hh3`
   - Slug: `smash-room`
   - Widget URL: `/embed?widgetId=farebook&widgetKey=emb_loynyx2s5hh3`

#### Games (1 created)
- **Mystery Manor** (at venue "eees")
  - ID: `a35cb49c-c2cc-44f3-b176-d2579eac482e`
  - Price: $30 (Adult), $20 (Child)
  - Players: 2-8
  - Duration: 60 minutes
  - Difficulty: Medium
  - Status: Active

## 📋 Manual Testing Checklist

### Test 1: Admin Dashboard - View Venues
**URL**: http://localhost:3000/venues

**Steps**:
1. ✅ Login to admin dashboard
2. ✅ Navigate to Venues page
3. ⏳ Verify 3 venues are displayed
4. ⏳ Check that each venue has an embed_key
5. ⏳ Verify venue count shows "3"

**Expected Result**: All 3 venues visible with embed keys

---

### Test 2: Admin Dashboard - View Games
**URL**: http://localhost:3000/games

**Steps**:
1. ⏳ Navigate to Games page
2. ⏳ Verify "Mystery Manor" game is displayed
3. ⏳ Check that it's linked to "eees" venue
4. ⏳ Verify price shows $30

**Expected Result**: Game visible and linked to venue

---

### Test 3: Widget Loading - Embed Page
**URL**: http://localhost:3000/embed?widgetId=farebook&widgetKey=emb_j542svtecbwu

**Steps**:
1. ⏳ Open widget URL in browser
2. ⏳ Verify widget loads without errors
3. ⏳ Check that "Mystery Manor" game is displayed
4. ⏳ Verify venue branding (if configured)
5. ⏳ Check browser console for errors

**Expected Result**: Widget displays game, no errors

---

### Test 4: Create Booking via Widget
**URL**: http://localhost:3000/embed?widgetId=farebook&widgetKey=emb_j542svtecbwu

**Steps**:
1. ⏳ Select "Mystery Manor" game
2. ⏳ Choose a date (e.g., November 15, 2025)
3. ⏳ Select a time slot (e.g., 14:00)
4. ⏳ Set party size (e.g., 4 players)
5. ⏳ Fill customer details:
   - Name: "John Doe"
   - Email: "john.test@example.com"
   - Phone: "555-1234"
6. ⏳ Fill payment details (test data):
   - Card: "4242 4242 4242 4242"
   - Expiry: "12/25"
   - CVV: "123"
7. ⏳ Click "Complete Payment"
8. ⏳ Verify "Processing..." shows
9. ⏳ Verify success page displays
10. ⏳ Note the confirmation code (e.g., "BK-12345")

**Expected Result**: Booking created, confirmation code displayed

---

### Test 5: Verify Booking in Admin Dashboard
**URL**: http://localhost:3000/bookings

**Steps**:
1. ⏳ Navigate to Bookings page
2. ⏳ Verify the booking appears in the list
3. ⏳ Check booking details:
   - Customer: "John Doe"
   - Game: "Mystery Manor"
   - Venue: "eees"
   - Date: November 15, 2025
   - Time: 14:00
   - Players: 4
   - Status: "Pending"
   - Source: "widget"
4. ⏳ Verify confirmation code matches

**Expected Result**: Booking visible with all correct details

---

### Test 6: Verify Booking in Supabase Database
**URL**: https://supabase.com/dashboard/project/ohfjkcajnqvethmrpdwc

**Steps**:
1. ⏳ Open Supabase dashboard
2. ⏳ Navigate to Table Editor > `bookings`
3. ⏳ Find the booking (sort by `created_at` DESC)
4. ⏳ Verify fields:
   - `source` = 'widget'
   - `confirmation_code` matches
   - `venue_id` is correct
   - `game_id` is correct
   - `customer_id` is set
   - `ticket_types` has JSON data
   - `status` = 'pending'
   - `total_amount` = 120 (4 players × $30)

**Expected Result**: Complete booking record in database

---

### Test 7: Update Booking Status
**URL**: http://localhost:3000/bookings

**Steps**:
1. ⏳ Click on the booking
2. ⏳ Change status to "Confirmed"
3. ⏳ Save changes
4. ⏳ Verify success toast appears
5. ⏳ Verify status badge updates to "Confirmed"
6. ⏳ Check Supabase database - status should be "confirmed"

**Expected Result**: Status updated successfully

---

### Test 8: Real-time Sync (Optional)
**Steps**:
1. ⏳ Open admin dashboard in two browser windows
2. ⏳ In window 1: Keep Bookings page open
3. ⏳ In window 2: Create a new booking via widget
4. ⏳ In window 1: Refresh or wait for auto-update
5. ⏳ Verify new booking appears

**Expected Result**: Real-time or refresh shows new booking

---

## 🔍 Verification Queries

### Check All Venues
```sql
SELECT id, name, embed_key, slug, status 
FROM venues 
ORDER BY created_at DESC;
```

### Check All Games
```sql
SELECT g.id, g.name, v.name as venue_name, g.price, g.status
FROM games g
LEFT JOIN venues v ON g.venue_id = v.id
ORDER BY g.created_at DESC;
```

### Check All Bookings
```sql
SELECT 
  b.id,
  b.confirmation_code,
  b.source,
  b.status,
  c.first_name || ' ' || c.last_name as customer_name,
  g.name as game_name,
  v.name as venue_name,
  b.booking_date,
  b.booking_time,
  b.players,
  b.total_amount,
  b.created_at
FROM bookings b
LEFT JOIN customers c ON b.customer_id = c.id
LEFT JOIN games g ON b.game_id = g.id
LEFT JOIN venues v ON b.venue_id = v.id
ORDER BY b.created_at DESC;
```

---

## 🎯 Success Criteria

- [ ] All 3 venues visible in admin dashboard
- [ ] Venues have embed_keys generated
- [ ] Game "Mystery Manor" visible and linked to venue
- [ ] Widget loads with embed_key
- [ ] Widget displays game correctly
- [ ] Booking can be created via widget
- [ ] Booking appears in admin dashboard
- [ ] Booking persists in Supabase database
- [ ] Booking has correct source ('widget')
- [ ] Customer auto-created in database
- [ ] Confirmation code generated and displayed
- [ ] Status can be updated from admin
- [ ] No localStorage usage for bookings
- [ ] No UI/UX changes visible

---

## 🐛 Known Issues to Watch For

1. **Missing embed_key**: If widget shows "Widget not found", check that venue has embed_key
2. **Missing venueId/gameId**: If booking fails with "Missing venue or game information", check config
3. **RLS Policy Errors**: If venues don't show, check that you're logged in
4. **Date Format Errors**: Ensure date is YYYY-MM-DD format
5. **Time Format Errors**: Ensure time is HH:MM:SS format

---

## 📊 Test Summary

**Setup Status**: ✅ Complete
**Manual Tests**: ⏳ Pending User Verification
**Database**: ✅ Connected and Ready
**Test Data**: ✅ Created

**Next Step**: Open http://localhost:3000 and follow the manual testing checklist above.

