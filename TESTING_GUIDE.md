# Testing Guide - Real Supabase Bookings Implementation

## Overview
This guide helps you test the complete migration from localStorage demo data to real Supabase database persistence.

## Prerequisites

### 1. Database Setup
- ✅ Supabase project: `ohfjkcajnqvethmrpdwc`
- ✅ Migrations applied:
  - `add_embed_key_and_booking_enhancements`
  - `fix_venue_rls_policies`
- ✅ RPC functions created:
  - `get_venue_by_embed_key()`
  - `get_venue_games()`
  - `create_widget_booking()`

### 2. Environment Variables
Ensure your `.env` file has:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Testing Checklist

### Phase 1: Venue Management

#### Test 1.1: View Venues
1. ✅ Login to admin dashboard
2. ✅ Navigate to Venues page
3. ✅ Verify venues are displayed
4. ✅ Check that venue count is accurate

**Expected Result**: All venues from Supabase database are visible

#### Test 1.2: Create Venue
1. Click "Create Venue" button
2. Fill in venue details
3. Save venue
4. Verify embed_key was auto-generated

**Expected Result**: New venue created with auto-generated embed_key

### Phase 2: Widget Booking Flow

#### Test 2.1: Create Booking via Widget
1. Navigate to embed widget with valid embed_key
2. Select game, date, time, party size
3. Fill in customer details
4. Complete payment
5. Verify success page with confirmation code

**Expected Result**: Booking created in Supabase database

#### Test 2.2: Verify Booking in Database
1. Open Supabase dashboard
2. Check bookings table
3. Verify booking details match

**Expected Result**: Complete booking record in database

### Phase 3: Admin Dashboard

#### Test 3.1: View Bookings
1. Navigate to Bookings page
2. Verify all bookings visible
3. Check customer, game, venue details

**Expected Result**: All bookings from database visible

## Success Criteria

✅ **All tests pass**
✅ **No localStorage usage for bookings**
✅ **All bookings persist to Supabase**
✅ **Admin dashboard shows real data**
✅ **Widgets load venue/game data dynamically**
✅ **No UI/UX changes from user perspective**

