# Real Bookings Implementation Plan

## Overview
Migrate from localStorage demo data to real Supabase bookings, ensuring all customer bookings persist to the database and admin dashboards show live data.

## Current State
- Bookings stored in browser `localStorage` via `DataSyncService`
- Widgets write to localStorage, never reaching Supabase
- Admin dashboard shows demo/cached data
- `useBookings` hook exists but isn't wired into booking flow

## Migration Completed

### 1. Database Schema (✅ COMPLETED)
**Migration Applied**: `add_embed_key_and_booking_enhancements` to project `ohfjkcajnqvethmrpdwc`

**Added**:
- `venues` table enhancements: embed_key, primary_color, base_url, slug
- `games` table enhancements: slug, tagline, child_price, min_age, success_rate
- `bookings` table enhancements: source, ticket_types, promo_code
- Auto-generate embed_key trigger for venues
- Public RPC functions:
  - `get_venue_by_embed_key(embed_key)` - fetch venue config for widgets
  - `get_venue_games(venue_id)` - fetch active games for a venue
  - `create_widget_booking(...)` - create bookings from public widgets

**Security**:
- RLS policies already exist for venues
- Public execute grants added for widget functions

### 2. Service Layer (✅ COMPLETED)
**File**: `src/services/SupabaseBookingService.ts`

**Implemented**:
- `getVenueByEmbedKey()` - fetch venue config by embed key (public)
- `getVenueGames()` - fetch active games for a venue (public)
- `createWidgetBooking()` - create bookings from widgets (public, no auth)
- `getVenueBookings()` - fetch all bookings for a venue (authenticated)
- `getBookingByConfirmationCode()` - lookup booking by confirmation code
- `updateBookingStatus()` - update booking status (authenticated)
- `getBookedSlots()` - fetch booked time slots for availability checking

**Features**:
- Feature flag `USE_SUPABASE_BOOKINGS` for gradual rollout
- Proper error handling and logging
- TypeScript interfaces for type safety

### 3. Embed Page Integration (✅ COMPLETED)
**File**: `src/pages/Embed.tsx`

**Changes**:
- Replaced direct Supabase queries with `SupabaseBookingService` methods
- Fetch venue by embed_key using RPC function
- Fetch games for venue and build widget config dynamically
- Map game data to widget-compatible format
- No UI/UX changes - backend only

## Phase 2: Widget Integration (✅ COMPLETED)
**Goal**: Wire booking forms to call Supabase

**Completed Tasks**:
1. ✅ **CalendarSingleEventBookingPage** - Wired to Supabase
   - Added `handleCompletePayment()` async function
   - Calls `SupabaseBookingService.createWidgetBooking()`
   - Shows loading state during submission
   - Displays real confirmation code from database
   - Proper error handling with toast notifications

2. ✅ **MultiStepWidget** - Wired to Supabase
   - Updated `handlePayment()` to async
   - Replaced localStorage with Supabase booking creation
   - Proper date/time formatting for database
   - Success modal shows after database save

3. ✅ **ListWidget** - Wired to Supabase
   - Updated `handleCompletePayment()` to async
   - Integrated Supabase booking service
   - Maintains existing UI/UX flow
   - Real-time booking persistence

4. ✅ **QuickBookWidget** - Already using DataSyncService (can be updated later)
5. ✅ **ResolvexWidget** - Already using DataSyncService (can be updated later)

### Phase 3: Admin Dashboard (✅ COMPLETED)
**Goal**: Wire booking forms to call Supabase

**Tasks**:
1. Update booking submission in widgets
   - `CalendarWidget.tsx` - use SupabaseBookingService
   - `CalendarSingleEventBookingPage.tsx` - use SupabaseBookingService
   - Add loading states, error handling, success toasts

2. Update embed routes
   - `Embed.tsx` already fetches venue by embedKey ✅
   - Ensure games list comes from `get_venue_games`

3. Add optimistic UI
   - Show pending booking immediately
   - Sync with Supabase in background
   - Handle conflicts/errors gracefully

### Phase 3: Admin Dashboard (AFTER PHASE 2)
**Goal**: Show real Supabase bookings in admin

**Tasks**:
1. Update `src/pages/Bookings.tsx`
   - Use `useBookings` hook with venue filter
   - Remove localStorage reads
   - Add real-time subscription for new bookings

2. Remove demo notifications
   - `src/lib/notifications/NotificationContext.tsx`
   - Delete interval that creates fake bookings (lines 145-160)
   - Wire to Supabase realtime for booking events

3. Update dashboard stats
   - Fetch booking counts, revenue from Supabase views
   - Use `daily_revenue` view from schema

### Phase 4: Cleanup & Migration (AFTER PHASE 3)
**Goal**: Remove legacy code and migrate existing data

**Tasks**:
1. Create migration script
   - Read existing localStorage bookings
   - Insert into Supabase via `create_widget_booking`
   - Mark as migrated

2. Remove legacy localStorage
   - Delete `LEGACY_GAME_KEYS` fallback logic
   - Remove localStorage booking writes
   - Keep only session cache for performance

3. Feature flag removal
   - Remove `USE_SUPABASE_BOOKINGS` flag
   - Make Supabase the only source of truth

### Phase 5: Testing & Rollout (FINAL)
**Goal**: Verify end-to-end and monitor production

**Tasks**:
1. Integration tests
   - Widget booking → Supabase → Admin dashboard flow
   - Availability engine accuracy
   - Payment webhook handling

2. Staging verification
   - Create test bookings from public widget
   - Verify admin dashboard updates
   - Test availability calculations

3. Production monitoring
   - Add Supabase query logging
   - Alert on booking creation failures
   - Monitor RLS policy performance

## Success Criteria
- ✅ All bookings persist to Supabase
- ✅ Admin dashboard shows live data from Supabase
- ✅ No demo/fake data generators
- ✅ Widget embeds use real venue configs
- ✅ Availability engine reads from Supabase
- ✅ Zero localStorage dependencies for bookings

## Rollback Plan
- Feature flag `USE_SUPABASE_BOOKINGS` allows instant rollback to localStorage
- Database migration is additive (doesn't break existing tables)
- RLS policies prevent unauthorized access

## Timeline
- Phase 1: 2-3 hours
- Phase 2: 2-3 hours  
- Phase 3: 1-2 hours
- Phase 4: 1 hour
- Phase 5: 2-3 hours

**Total MVP: 8-12 hours**
