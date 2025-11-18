# Task 01: Booking Widget Simplification - Implementation Plan
**Feature Branch:** `feature/mvp-01-booking-widget-simplification`  
**Priority:** CRITICAL  
**Estimated Effort:** 3-4 days  
**Date Started:** November 18, 2025

---

## 🎯 Objective

Simplify the booking widget from **3,284 lines** to a clean, focused **4-step escape room booking flow** that prioritizes:
- Speed (<60 seconds to book)
- Mobile-first design
- Clear user journey
- Supabase-powered availability
- Stripe payment integration

---

## 📊 Current State Analysis

### Problems with Current CalendarWidget.tsx
- ✗ **3,284 lines** - monolithic, hard to maintain
- ✗ **Multiple modes** - venue mode, template mode, dual-purpose confusion
- ✗ **Complex state** - 30+ useState hooks
- ✗ **Mixed concerns** - booking logic + payment + UI all in one file
- ✗ **Poor mobile UX** - not optimized for phones
- ✗ **Unclear flow** - users get lost in options

### What Works (Keep)
- ✓ Stripe integration foundation
- ✓ Supabase booking service
- ✓ Time slot generation logic
- ✓ Promo code validation
- ✓ Form validation utilities

---

## 🏗️ New Architecture

### Component Structure
```
src/components/booking/
├── EscapeRoomBookingWidget.tsx          # Main orchestrator (200 lines)
├── steps/
│   ├── Step1_GameSelection.tsx          # Game picker (150 lines)
│   ├── Step2_DateTimeSelection.tsx      # Date + time slots (200 lines)
│   ├── Step3_PartyDetails.tsx           # Players + customer info (150 lines)
│   └── Step4_PaymentCheckout.tsx        # Stripe payment (200 lines)
├── shared/
│   ├── BookingProgressBar.tsx           # Progress indicator (50 lines)
│   ├── BookingSummaryCard.tsx           # Booking details sidebar (100 lines)
│   └── TimeSlotButton.tsx               # Reusable time slot (50 lines)
└── hooks/
    ├── useBookingFlow.ts                # Booking state management (150 lines)
    ├── useAvailability.ts               # Fetch available slots (100 lines)
    └── useBookingSubmit.ts              # Handle booking creation (100 lines)
```

**Total:** ~1,250 lines across 11 focused files (vs 3,284 in one file)

---

## 🎨 4-Step Booking Flow

### Step 1: Game Selection
**Goal:** User picks which escape room game to play

**UI:**
- Grid of game cards with images
- Show: Name, difficulty, duration, price, player range
- Highlight recommended/popular games
- Mobile: 1 column, Desktop: 2-3 columns

**Data:**
- Fetch games from Supabase `games` table
- Filter: `is_active = true` AND `organization_id = current_org`
- Sort: Popular first, then alphabetically

**Validation:**
- Must select a game to proceed

---

### Step 2: Date & Time Selection
**Goal:** User picks when they want to play

**UI:**
- Calendar view (current month + next 2 months)
- Available dates highlighted
- Unavailable dates grayed out
- Time slots shown for selected date
- Show capacity: "3 spots left" indicator

**Data:**
- Call Supabase function `get_available_slots(game_id, date)`
- Returns: time slots with availability
- Update in real-time (refetch every 30 seconds)

**Validation:**
- Must select date + time slot
- Check slot still available before proceeding

---

### Step 3: Party Details
**Goal:** Collect customer info and party size

**UI:**
- Player count selector (min to max for game)
- Customer form: Name, Email, Phone
- Optional: Special requests textarea
- Show price calculation: Base + per player

**Data:**
- Validate email format
- Validate phone format
- Check player count within game limits

**Validation:**
- All required fields filled
- Valid email/phone format
- Player count within range

---

### Step 4: Payment & Confirmation
**Goal:** Process payment and confirm booking

**UI:**
- Booking summary (game, date, time, players, total)
- Stripe Payment Element (embedded)
- Terms & conditions checkbox
- "Complete Booking" button

**Data:**
- Create booking in Supabase (status: pending)
- Create Stripe payment intent
- On success: Update booking (status: confirmed)
- Send confirmation email with QR code

**Validation:**
- Payment successful
- Booking created
- Email sent

---

## 🔧 Implementation Steps

### Phase 1: Setup & Structure (Day 1 Morning)
- [x] Create feature branch
- [ ] Create new directory structure
- [ ] Set up base components (empty shells)
- [ ] Create TypeScript interfaces
- [ ] Set up hooks structure

### Phase 2: Core Booking Logic (Day 1 Afternoon - Day 2)
- [ ] Implement `useBookingFlow` hook
- [ ] Implement `useAvailability` hook
- [ ] Create Supabase function `get_available_slots`
- [ ] Test availability fetching
- [ ] Implement booking state management

### Phase 3: UI Components (Day 2 - Day 3 Morning)
- [ ] Build Step 1: Game Selection
- [ ] Build Step 2: Date & Time Selection
- [ ] Build Step 3: Party Details
- [ ] Build Step 4: Payment Checkout
- [ ] Build shared components (progress bar, summary card)

### Phase 4: Integration (Day 3 Afternoon)
- [ ] Connect all steps in main widget
- [ ] Implement navigation between steps
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test full flow end-to-end

### Phase 5: Polish & Testing (Day 4)
- [ ] Mobile responsiveness testing
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Edge case testing
- [ ] Documentation

---

## 📱 Mobile-First Design Principles

1. **Touch targets:** Minimum 44px height
2. **Font sizes:** Minimum 16px (prevent zoom on iOS)
3. **Spacing:** Generous padding for thumbs
4. **Navigation:** Bottom-fixed action buttons
5. **Forms:** One field per row on mobile
6. **Calendar:** Swipe gestures for month navigation

---

## 🗄️ Supabase Integration

### Database Function: get_available_slots

```sql
CREATE OR REPLACE FUNCTION get_available_slots(
  p_game_id UUID,
  p_date DATE,
  p_organization_id UUID
)
RETURNS TABLE (
  time_slot TIME,
  end_time TIME,
  available_spots INT,
  total_capacity INT,
  is_available BOOLEAN,
  price DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH game_info AS (
    SELECT 
      duration_minutes,
      max_players,
      price
    FROM games
    WHERE id = p_game_id
      AND organization_id = p_organization_id
      AND is_active = TRUE
  ),
  time_slots AS (
    SELECT generate_series(
      '10:00'::TIME,
      '22:00'::TIME,
      '1 hour'::INTERVAL
    ) AS slot_time
  ),
  bookings_count AS (
    SELECT
      booking_time::TIME AS slot,
      SUM(players) AS booked_players
    FROM bookings
    WHERE game_id = p_game_id
      AND booking_date = p_date
      AND status NOT IN ('cancelled', 'no-show')
    GROUP BY booking_time
  )
  SELECT
    ts.slot_time,
    ts.slot_time + (SELECT duration_minutes FROM game_info) * INTERVAL '1 minute' AS end_time,
    (SELECT max_players FROM game_info) - COALESCE(bc.booked_players, 0) AS available_spots,
    (SELECT max_players FROM game_info) AS total_capacity,
    (COALESCE(bc.booked_players, 0) < (SELECT max_players FROM game_info)) AS is_available,
    (SELECT price FROM game_info) AS price
  FROM time_slots ts
  LEFT JOIN bookings_count bc ON ts.slot_time = bc.slot
  WHERE (SELECT max_players FROM game_info) IS NOT NULL
  ORDER BY ts.slot_time;
END;
$$ LANGUAGE plpgsql;
```

### React Query Hook

```typescript
export function useAvailability(gameId: string, date: Date) {
  return useQuery({
    queryKey: ['availability', gameId, format(date, 'yyyy-MM-dd')],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_available_slots', {
          p_game_id: gameId,
          p_date: format(date, 'yyyy-MM-dd'),
          p_organization_id: getCurrentOrgId(),
        });
      
      if (error) throw error;
      return data;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
```

---

## 💳 Stripe Payment Flow

### Sequence
1. User completes Step 3 (customer info)
2. Click "Proceed to Payment"
3. Create booking in Supabase (status: `pending`)
4. Create Stripe Payment Intent
5. Show Stripe Payment Element
6. User enters card details
7. Submit payment
8. Webhook updates booking (status: `confirmed`)
9. Send confirmation email
10. Show success page

### Error Handling
- Payment fails → Show error, allow retry
- Network error → Save form data, allow resume
- Timeout → Booking expires after 15 minutes

---

## ✅ Success Criteria

### Functional
- [ ] User can complete booking in <60 seconds
- [ ] No double bookings possible
- [ ] Availability updates in real-time
- [ ] Payment processes successfully
- [ ] Confirmation email sent with QR code

### Technical
- [ ] Build completes without errors
- [ ] TypeScript strict mode passes
- [ ] Mobile responsive (tested on iPhone, Android)
- [ ] Accessibility score >90
- [ ] Page load <3 seconds

### User Experience
- [ ] Clear progress indicator
- [ ] Helpful error messages
- [ ] Loading states for all async operations
- [ ] Can go back to previous steps
- [ ] Booking summary always visible

---

## 🐛 Known Issues to Fix

1. **Double booking prevention**
   - Add unique constraint: `(game_id, booking_date, booking_time)`
   - Implement optimistic locking

2. **Race conditions**
   - Use Supabase RLS policies
   - Add transaction support

3. **Mobile calendar UX**
   - Replace with mobile-optimized date picker
   - Add swipe gestures

---

## 📦 Dependencies

### New Packages (if needed)
```json
{
  "date-fns": "^4.1.0",  // Already installed
  "@tanstack/react-query": "^5.90.9",  // Already installed
  "react-day-picker": "^9.11.1"  // Already installed
}
```

### Supabase Setup
- Create `get_available_slots` function
- Add indexes for performance
- Set up RLS policies

---

## 🚀 Deployment Plan

### Testing
1. Test on localhost
2. Deploy to develop branch
3. Test on Render preview
4. Get user feedback
5. Fix bugs
6. Merge to main

### Rollback Plan
- Keep old CalendarWidget as `CalendarWidget.legacy.tsx`
- Can revert if critical issues found
- Remove legacy after 2 weeks of stable operation

---

## 📝 Documentation Needed

- [ ] Component API documentation
- [ ] Booking flow diagram
- [ ] Supabase function documentation
- [ ] Testing guide
- [ ] Troubleshooting guide

---

## 🎯 Next Actions

1. **Create directory structure**
2. **Set up TypeScript interfaces**
3. **Create Supabase function**
4. **Build useBookingFlow hook**
5. **Implement Step 1 component**

---

**Status:** 🚧 In Progress  
**Last Updated:** 2025-11-18 12:20 UTC+06  
**Next Review:** Daily standup
