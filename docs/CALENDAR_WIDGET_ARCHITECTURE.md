# Calendar Widget Pro - Architecture Document

## Overview

The Calendar Widget Pro provides a calendar-first booking experience where customers can:
1. View availability at a glance
2. Select a date
3. Choose a time slot
4. Select party size
5. Enter customer details
6. Complete payment via Stripe Checkout

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CALENDAR WIDGET DATA FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   embed_configs  │────▶│    activities    │────▶│      venues      │
│                  │     │                  │     │                  │
│ - id             │     │ - id             │     │ - id             │
│ - embed_key      │     │ - name           │     │ - name           │
│ - organization_id│     │ - price          │     │ - address        │
│ - target_type    │     │ - duration       │     │ - timezone       │
│ - target_id      │     │ - schedule (JSON)│     │ - primary_color  │
│ - type           │     │ - min_players    │     │ - organization_id│
│ - style (JSON)   │     │ - max_players    │     └──────────────────┘
│ - config (JSON)  │     │ - stripe_price_id│              │
│ - is_active      │     │ - venue_id       │              │
└──────────────────┘     │ - organization_id│              │
         │               └──────────────────┘              │
         │                        │                        │
         ▼                        ▼                        │
┌──────────────────┐     ┌──────────────────┐              │
│ embed_analytics  │     │activity_sessions │              │
│                  │     │                  │              │
│ - embed_config_id│     │ - id             │              │
│ - event_type     │     │ - activity_id    │              │
│ - metadata       │     │ - start_time     │              │
│ - created_at     │     │ - end_time       │              │
└──────────────────┘     │ - capacity       │              │
                         │ - capacity_remain│              │
                         │ - status         │              │
                         └──────────────────┘              │
                                  │                        │
                                  ▼                        │
                         ┌──────────────────┐              │
                         │   reservations   │              │
                         │                  │              │
                         │ - id             │              │
                         │ - session_id     │              │
                         │ - spots          │              │
                         │ - customer_email │              │
                         │ - expires_at     │              │
                         │ - status         │              │
                         └──────────────────┘              │
                                  │                        │
                                  ▼                        ▼
                         ┌──────────────────┐     ┌──────────────────┐
                         │     bookings     │────▶│    customers     │
                         │                  │     │                  │
                         │ - id             │     │ - id             │
                         │ - booking_number │     │ - email          │
                         │ - activity_id    │     │ - first_name     │
                         │ - customer_id    │     │ - last_name      │
                         │ - session_id     │     │ - phone          │
                         │ - booking_date   │     │ - organization_id│
                         │ - start_time     │     └──────────────────┘
                         │ - party_size     │
                         │ - total_amount   │
                         │ - status         │
                         │ - payment_status │
                         │ - stripe_session │
                         │ - organization_id│
                         └──────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           CALENDAR WIDGET COMPONENT TREE                             │
└─────────────────────────────────────────────────────────────────────────────────────┘

EmbedProContainer
    │
    ├── useEmbedProData (hook) ─────────────────────────────────────────┐
    │   └── Fetches: embed_config → activity → venue → schedule         │
    │                                                                    │
    └── CalendarWidgetPro ◀─────────────────────────────────────────────┘
            │
            ├── useBookingFlow (hook)
            │   └── State machine for booking steps
            │
            ├── WidgetHeader
            │   └── Activity name, venue, price badge
            │
            ├── WidgetActivityInfo
            │   └── Price, duration, player count
            │
            ├── Step: select-date
            │   └── WidgetCalendar
            │       └── Month grid with availability colors
            │
            ├── Step: select-time
            │   └── WidgetTimeSlots
            │       └── Time slot grid from schedule
            │
            ├── Step: select-party
            │   └── WidgetPartySize
            │       └── Adult/child counters
            │
            ├── Step: checkout
            │   ├── WidgetDiscounts (promo/gift card)
            │   └── WidgetCheckout
            │       └── Customer form → Stripe redirect
            │
            └── Step: success
                └── WidgetSuccess
                    └── Confirmation with booking details
```

## Booking Flow State Machine

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              BOOKING FLOW STATE MACHINE                              │
└─────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   INITIAL   │
    │ (Calendar)  │
    └──────┬──────┘
           │ User selects date
           ▼
    ┌─────────────┐
    │ select-time │◀──────────────────────────────────────┐
    └──────┬──────┘                                       │
           │ User selects time slot                       │ Back
           ▼                                              │
    ┌─────────────┐                                       │
    │select-party │◀──────────────────────────────────────┤
    └──────┬──────┘                                       │
           │ User sets party size                         │ Back
           ▼                                              │
    ┌─────────────┐                                       │
    │  checkout   │───────────────────────────────────────┘
    └──────┬──────┘
           │ User submits form
           │
           ├─────────────────────────────────────────────┐
           │                                             │
           ▼                                             ▼
    ┌─────────────┐                              ┌─────────────┐
    │ RESERVATION │                              │   ERROR     │
    │  (10 min)   │                              │  (Retry)    │
    └──────┬──────┘                              └─────────────┘
           │
           ▼
    ┌─────────────┐
    │   STRIPE    │
    │  CHECKOUT   │
    └──────┬──────┘
           │
           ├─────────────────────────────────────────────┐
           │ Payment Success                             │ Payment Failed
           ▼                                             ▼
    ┌─────────────┐                              ┌─────────────┐
    │   WEBHOOK   │                              │  CANCELLED  │
    │  RECEIVED   │                              │ (Release)   │
    └──────┬──────┘                              └─────────────┘
           │
           ▼
    ┌─────────────┐
    │   SUCCESS   │
    │ (Confirmed) │
    └─────────────┘
```

## Webhook Integration Flow

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              STRIPE WEBHOOK FLOW                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

Customer                Widget                  Edge Function              Stripe
   │                      │                          │                       │
   │  1. Fill form        │                          │                       │
   │─────────────────────▶│                          │                       │
   │                      │                          │                       │
   │                      │  2. Create reservation   │                       │
   │                      │─────────────────────────▶│                       │
   │                      │                          │                       │
   │                      │  3. Reservation ID       │                       │
   │                      │◀─────────────────────────│                       │
   │                      │                          │                       │
   │                      │  4. Create checkout      │                       │
   │                      │─────────────────────────▶│                       │
   │                      │                          │  5. Create session    │
   │                      │                          │──────────────────────▶│
   │                      │                          │                       │
   │                      │                          │  6. Session URL       │
   │                      │                          │◀──────────────────────│
   │                      │                          │                       │
   │                      │  7. Redirect URL         │                       │
   │                      │◀─────────────────────────│                       │
   │                      │                          │                       │
   │  8. Redirect to Stripe                          │                       │
   │─────────────────────────────────────────────────────────────────────────▶│
   │                      │                          │                       │
   │  9. Complete payment │                          │                       │
   │◀─────────────────────────────────────────────────────────────────────────│
   │                      │                          │                       │
   │                      │                          │  10. Webhook event    │
   │                      │                          │◀──────────────────────│
   │                      │                          │                       │
   │                      │                          │  11. Create booking   │
   │                      │                          │  12. Update session   │
   │                      │                          │  13. Clear reservation│
   │                      │                          │                       │
   │  14. Success page    │                          │                       │
   │◀─────────────────────│                          │                       │
```

## Database Schema Details

### embed_configs
```sql
CREATE TABLE embed_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  embed_key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'calendar-widget', 'booking-widget', etc.
  target_type VARCHAR(50) NOT NULL, -- 'activity', 'venue', 'multi-activity'
  target_id UUID, -- Single activity/venue
  target_ids UUID[], -- Multiple activities
  config JSONB DEFAULT '{}',
  style JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  booking_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### activity_sessions
```sql
CREATE TABLE activity_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL,
  capacity_remaining INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'available', -- 'available', 'limited', 'full', 'blocked'
  price_override NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### reservations
```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES activity_sessions(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  spots INTEGER NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'confirmed', 'expired', 'cancelled'
  expires_at TIMESTAMPTZ NOT NULL,
  stripe_session_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### bookings
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(20) UNIQUE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  activity_id UUID NOT NULL REFERENCES activities(id),
  session_id UUID REFERENCES activity_sessions(id),
  customer_id UUID REFERENCES customers(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  party_size INTEGER NOT NULL,
  adult_count INTEGER DEFAULT 0,
  child_count INTEGER DEFAULT 0,
  subtotal NUMERIC(10,2),
  discount_total NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_status VARCHAR(20) DEFAULT 'pending',
  stripe_session_id VARCHAR(255),
  stripe_payment_intent VARCHAR(255),
  customer_notes TEXT,
  internal_notes TEXT,
  source VARCHAR(50) DEFAULT 'embed-pro-widget',
  embed_key VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Key Services

### 1. useEmbedProData Hook
Fetches and normalizes widget data from Supabase.

### 2. useBookingFlow Hook
State machine managing the booking flow steps.

### 3. checkoutProService
Creates Stripe checkout sessions with slot reservations.

### 4. availabilityService
Checks real-time slot availability from activity_sessions.

### 5. reservationService
Manages temporary slot reservations during checkout.

## Edge Functions

### create-checkout-session
- Creates Stripe checkout session
- Stores booking metadata
- Returns checkout URL

### verify-checkout-session (Webhook)
- Receives Stripe webhook events
- Creates booking record
- Updates activity_session capacity
- Clears reservation
- Sends confirmation email

## File Structure

```
/src/modules/embed-pro/
├── widgets/
│   ├── CalendarWidgetPro.tsx    # Main calendar widget (refactored)
│   ├── BookingWidgetPro.tsx     # Full booking widget
│   └── index.ts
├── widget-components/
│   ├── WidgetCalendar.tsx       # Calendar grid
│   ├── WidgetTimeSlots.tsx      # Time slot selection
│   ├── WidgetPartySize.tsx      # Party size selector
│   ├── WidgetCheckout.tsx       # Customer form
│   ├── WidgetSuccess.tsx        # Confirmation
│   ├── WidgetDiscounts.tsx      # Promo/gift cards
│   └── index.ts
├── hooks/
│   ├── useBookingFlow.ts        # Booking state machine
│   ├── useEmbedProData.ts       # Data fetching
│   ├── usePromoCode.ts          # Promo validation
│   └── useGiftCard.ts           # Gift card validation
├── services/
│   ├── checkoutPro.service.ts   # Stripe checkout
│   ├── availability.service.ts  # Slot availability
│   └── preview.service.ts       # Preview URLs
└── types/
    └── widget.types.ts          # Type definitions
```

## Implementation Notes

1. **Calendar Widget** now uses the same `useBookingFlow` hook as BookingWidgetPro
2. **Step transitions** use `goToStep()` directly to avoid stale closure issues
3. **Slot reservations** are created before Stripe redirect (10-minute TTL)
4. **Real-time availability** is fetched from `activity_sessions` table
5. **Fallback mode** generates slots from schedule if no sessions exist
