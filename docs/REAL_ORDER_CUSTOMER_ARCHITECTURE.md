# Real Order & Customer Management Architecture

> **Version**: 1.0 | **Created**: Nov 29, 2025 | **Project**: qftjyjpitnoapqxlrvfs

## Overview

This document defines the production-ready architecture for real booking orders and customer management, building on the existing BookingTMS 2.0 system.

### Design Principles
- **Single Source of Truth**: Database is authoritative for all booking state
- **Event-Driven Updates**: Webhooks trigger state changes
- **Idempotent Operations**: Safe retries for all payment operations
- **Multi-Tenant Isolation**: RLS policies ensure data separation
- **Real-Time Sync**: Supabase subscriptions for live updates

---

## System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              CUSTOMER JOURNEY                               │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Widget    │───▶│  Checkout   │───▶│  Payment    │───▶│ Confirmation│ │
│  │  Selection  │    │    Form     │    │   Stripe    │    │    Page     │ │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘ │
│         │                  │                  │                  │         │
└─────────┼──────────────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │                  │
          ▼                  ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           EDGE FUNCTIONS (Supabase)                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐      │
│  │ create-checkout-  │  │  stripe-webhook   │  │  verify-checkout- │      │
│  │     session       │  │                   │  │     session       │      │
│  ├───────────────────┤  ├───────────────────┤  ├───────────────────┤      │
│  │ • Validate slot   │  │ • checkout.session│  │ • Verify payment  │      │
│  │ • Create Stripe   │  │   .completed      │  │ • Return booking  │      │
│  │   checkout        │  │ • payment_intent  │  │   details         │      │
│  │ • Reserve slot    │  │   .succeeded      │  │ • Send to email   │      │
│  │   (pending)       │  │ • Update DB       │  │                   │      │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘      │
│                                                                             │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐      │
│  │   send-email      │  │  create-refund    │  │ generate-sessions │      │
│  ├───────────────────┤  ├───────────────────┤  ├───────────────────┤      │
│  │ • Resend API      │  │ • Process refund  │  │ • Auto-generate   │      │
│  │ • Confirmation    │  │ • Update booking  │  │   time slots      │      │
│  │ • Reminders       │  │ • Release capacity│  │ • Cron job        │      │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘      │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
          │                  │                  │                  │
          ▼                  ▼                  ▼                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE (PostgreSQL)                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │  bookings   │◀──▶│  customers  │    │  activity   │    │  payments   │ │
│  │             │    │             │    │  _sessions  │    │   (future)  │ │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                                             │
│  Real-Time Subscriptions: bookings, customers, activity_sessions           │
│  RLS Policies: Tenant isolation, public widget read access                 │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Booking (Order) Lifecycle

### Status Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         BOOKING STATUS LIFECYCLE                          │
└──────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  Customer       │
                    │  Selects Slot   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ pending_payment │ ◀─── Slot reserved, awaiting payment
                    │                 │      (10-min timeout)
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │  confirmed  │   │   expired   │   │payment_failed│
    │             │   │             │   │             │
    │ Payment OK  │   │ Timeout     │   │ Card Error  │
    └──────┬──────┘   └─────────────┘   └─────────────┘
           │
           │
           ▼
    ┌─────────────┐
    │  checked_in │ ◀─── Staff checks in customer on arrival
    │             │
    └──────┬──────┘
           │
           │
           ▼
    ┌─────────────┐
    │  completed  │ ◀─── Experience finished
    │             │
    └─────────────┘

   CANCELLATION FLOW (from confirmed/checked_in):
   
    ┌─────────────┐
    │  cancelled  │ ◀─── Customer or admin cancellation
    │             │
    │ - refund    │
    │   processed │
    │ - capacity  │
    │   released  │
    └─────────────┘

    ┌─────────────┐
    │   no_show   │ ◀─── Customer didn't arrive
    │             │
    └─────────────┘
```

### Status Definitions

| Status | Trigger | Capacity Impact | Payment State |
|--------|---------|-----------------|---------------|
| `pending_payment` | Checkout started | Reserved | Unpaid |
| `confirmed` | Payment success webhook | Reserved | Paid |
| `expired` | 10-min timeout | Released | N/A |
| `payment_failed` | Payment error webhook | Released | Failed |
| `checked_in` | Staff action | Reserved | Paid |
| `completed` | Post-event | Released | Paid |
| `cancelled` | User/Admin action | Released | Refunded |
| `no_show` | Staff action | Released | Paid (policy) |

---

## Customer Management System

### Customer Lifecycle

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER LIFECYCLE                                 │
└──────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐        ┌─────────────────┐
    │   New Customer  │───────▶│    Active       │
    │                 │        │                 │
    │ First booking   │        │ Recent activity │
    │ created         │        │ within 90 days  │
    └─────────────────┘        └────────┬────────┘
                                        │
                          ┌─────────────┼─────────────┐
                          │             │             │
                          ▼             ▼             ▼
                   ┌──────────┐  ┌──────────┐  ┌──────────┐
                   │   VIP    │  │  At-Risk │  │  Churned │
                   │          │  │          │  │          │
                   │ High LTV │  │ 60-90    │  │ 90+ days │
                   │ Frequent │  │ days no  │  │ inactive │
                   └──────────┘  │ activity │  └──────────┘
                                 └──────────┘
```

### Customer Data Model

```typescript
interface Customer {
  // Core
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  
  // Stripe
  stripe_customer_id: string | null;
  
  // Analytics
  total_bookings: number;
  total_spent: number;
  average_booking_value: number;
  lifetime_value: number;
  
  // Segmentation
  segment: 'new' | 'active' | 'vip' | 'at-risk' | 'churned';
  last_booking_date: Date | null;
  last_activity_date: Date | null;
  
  // Metadata
  created_via: 'admin' | 'booking_widget' | 'import';
  status: 'active' | 'inactive' | 'blocked';
  notes: string;
  metadata: JsonObject;
}
```

### Customer Segmentation Rules

| Segment | Criteria |
|---------|----------|
| **New** | First booking within 30 days, < 2 total bookings |
| **Active** | Activity within 90 days, ≥ 2 bookings |
| **VIP** | Total spent > $500 OR ≥ 10 bookings OR monthly bookings |
| **At-Risk** | Was active, 60-90 days without booking |
| **Churned** | 90+ days without activity, was previously active |

---

## Payment Processing Architecture

### Stripe Integration Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                       STRIPE CHECKOUT FLOW                                │
└──────────────────────────────────────────────────────────────────────────┘

Customer Widget                Edge Function                    Stripe
     │                              │                             │
     │  1. Select Activity/Date/Time                              │
     │────────────────────────▶│                                  │
     │                         │                                  │
     │                         │  2. create-checkout-session      │
     │                         │────────────────────────────────▶│
     │                         │                                  │
     │                         │     • Multi-tier pricing         │
     │                         │     • Platform fee (Connect)     │
     │                         │     • Metadata (booking info)    │
     │                         │                                  │
     │                         │  3. Return checkout URL          │
     │                         │◀────────────────────────────────│
     │                         │                                  │
     │  4. Redirect to Stripe  │                                  │
     │────────────────────────────────────────────────────────▶│
     │                                                            │
     │                         5. Customer completes payment      │
     │                         │                                  │
     │  6. Redirect to success │  7. Webhook: checkout.session   │
     │◀─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─│◀────────────────────────────────│
     │                         │     .completed                   │
     │                         │                                  │
     │                         │  8. Update booking status        │
     │                         │  9. Create/update customer       │
     │                         │  10. Send confirmation email     │
     │                         │                                  │
     │  11. verify-checkout-   │                                  │
     │      session            │                                  │
     │────────────────────────▶│                                  │
     │                         │                                  │
     │  12. Booking details    │                                  │
     │◀────────────────────────│                                  │
```

### Stripe Metadata Schema

```typescript
// Passed to Stripe Checkout Session
interface CheckoutMetadata {
  // Booking identification
  activity_id: string;
  organization_id: string;
  venue_id: string;
  session_id: string;
  
  // Customer info
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  
  // Booking details
  booking_date: string;      // YYYY-MM-DD
  booking_time: string;      // HH:mm
  party_size: string;        // number as string
  
  // Pricing
  adult_count: string;
  child_count: string;
  
  // Optional
  promo_code?: string;
  gift_card_code?: string;
  special_requests?: string;
  
  // Platform
  platform_fee_percent: string;
}
```

---

## Admin Dashboard Integration

### Bookings Page Components

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         ADMIN BOOKINGS PAGE                               │
│                         /src/pages/Bookings.tsx                           │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                  │
│  ├── Title: "Bookings"                                                  │
│  ├── Stats: Today (12) | This Week (48) | Revenue ($3,240)              │
│  └── Actions: [+ Add Booking] [Export] [Refresh]                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  FILTERS                                                                 │
│  ├── Date Range: [Today] [This Week] [Custom]                           │
│  ├── Status: [All] [Confirmed] [Pending] [Cancelled]                    │
│  ├── Activity: [All Activities ▼]                                       │
│  └── Search: [Customer name, email, booking #...]                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BOOKING LIST (Table/Calendar View Toggle)                              │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ BK-ABC123 │ John Doe │ Mystery Room │ Nov 30, 2pm │ 4 guests │ $120│ │
│  │ Status: ● Confirmed │ Payment: ✓ Paid │ [Check In] [View] [···]   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ BK-DEF456 │ Jane Doe │ Escape Room  │ Dec 1, 10am │ 2 guests │ $60 │ │
│  │ Status: ○ Pending   │ Payment: ○ Unpaid │ [Cancel] [View] [···]   │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Customers Page Components

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         ADMIN CUSTOMERS PAGE                              │
│                         /src/pages/Customers.tsx                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  STATS CARDS                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Total    │ │ Active   │ │ VIP      │ │ At-Risk  │ │ New      │      │
│  │  1,234   │ │   845    │ │   56     │ │   123    │ │   210    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  CUSTOMER TABLE                                                          │
│                                                                          │
│  │ Name      │ Email           │ Bookings │ Spent  │ Segment │ Actions │ │
│  │───────────│─────────────────│──────────│────────│─────────│─────────│ │
│  │ John Doe  │ john@email.com  │    12    │ $1,440 │ VIP     │ [View]  │ │
│  │ Jane Doe  │ jane@email.com  │     3    │   $360 │ Active  │ [View]  │ │
│  │ New User  │ new@email.com   │     1    │   $120 │ New     │ [View]  │ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema Updates

### Current Tables (Verified)

```sql
-- bookings table (existing, verified)
bookings (
  id UUID PRIMARY KEY,
  booking_number VARCHAR,            -- BK-XXXXXX-XXXX
  organization_id UUID NOT NULL,
  venue_id UUID,
  activity_id UUID,
  customer_id UUID,
  session_id UUID,                   -- Links to activity_sessions
  booking_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  party_size INTEGER,
  total_amount NUMERIC,
  status VARCHAR,                    -- pending_payment, confirmed, etc.
  payment_status VARCHAR,            -- unpaid, paid, refunded, failed
  stripe_payment_intent_id VARCHAR,
  stripe_checkout_session_id VARCHAR,
  source VARCHAR,                    -- 'admin', 'widget'
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- customers table (existing, verified)
customers (
  id UUID PRIMARY KEY,
  organization_id UUID,
  first_name VARCHAR,
  last_name VARCHAR,
  email VARCHAR,
  phone VARCHAR,
  stripe_customer_id VARCHAR,
  total_bookings INTEGER DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  segment VARCHAR,
  status VARCHAR DEFAULT 'active',
  last_booking_date DATE,
  created_via VARCHAR,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Recommended Index Additions

```sql
-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_date_status 
  ON bookings(booking_date, status);

CREATE INDEX IF NOT EXISTS idx_bookings_customer 
  ON bookings(customer_id);

CREATE INDEX IF NOT EXISTS idx_bookings_stripe_session 
  ON bookings(stripe_checkout_session_id);

CREATE INDEX IF NOT EXISTS idx_customers_email_org 
  ON customers(email, organization_id);

CREATE INDEX IF NOT EXISTS idx_customers_segment 
  ON customers(segment, organization_id);
```

---

## Edge Function Responsibilities

### Function Matrix

| Function | Trigger | Responsibilities |
|----------|---------|-----------------|
| `create-checkout-session` | Widget checkout | Validate slot, create Stripe session, reserve capacity |
| `stripe-webhook` | Stripe events | Update booking/payment status, create customers |
| `verify-checkout-session` | Success page | Return booking details, verify payment |
| `send-email` | Webhook success | Send confirmation via Resend |
| `create-refund` | Admin action | Process refund, update status, release capacity |
| `generate-sessions` | Cron / Manual | Create activity_sessions for future dates |

### Webhook Event Handling

```typescript
// stripe-webhook/index.ts - Event handlers

switch (event.type) {
  case 'checkout.session.completed':
    // Primary booking confirmation
    // - Find/create customer
    // - Update booking to 'confirmed'
    // - Trigger confirmation email
    break;
    
  case 'payment_intent.succeeded':
    // Fallback for PaymentIntent flow
    // - Update booking if exists
    break;
    
  case 'payment_intent.payment_failed':
    // Handle failed payments
    // - Update booking to 'payment_failed'
    // - Release reserved capacity
    break;
    
  case 'charge.refunded':
    // Handle refunds
    // - Update payment_status to 'refunded'
    // - Update refund_amount
    break;
}
```

---

## Email System Integration

### Email Templates Needed

| Template | Trigger | Content |
|----------|---------|---------|
| `booking_confirmation` | Payment success | Booking details, date/time, location |
| `booking_reminder` | 24h before | Reminder with booking details |
| `booking_cancelled` | Cancellation | Cancellation confirmation, refund info |
| `booking_rescheduled` | Reschedule | New date/time, booking reference |

### Resend Integration

```typescript
// send-email/index.ts
import { Resend } from 'resend';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

await resend.emails.send({
  from: 'bookings@yourdomain.com',
  to: customerEmail,
  subject: `Booking Confirmed - ${activityName}`,
  html: confirmationTemplate({
    bookingNumber,
    customerName,
    activityName,
    venueName,
    bookingDate,
    startTime,
    partySize,
    totalAmount
  })
});
```

---

## Implementation Checklist

### Phase 1: Critical (Current)

- [x] 1.1 Fix Customers Page (mock data removed)
- [x] 1.2 Enhanced Stripe Webhook (checkout.session handler)
- [ ] 1.3 Test E2E Booking Flow
- [ ] 1.4 Email Confirmation (Resend)
- [ ] 1.5 Enable RLS Policies

### Phase 2: Important

- [ ] 2.1 Admin notification on new booking
- [ ] 2.2 Booking receipt PDF generation
- [ ] 2.3 Capacity management UI
- [ ] 2.4 Refund processing workflow
- [ ] 2.5 Customer merge/dedup tool

### Phase 3: Polish

- [ ] 3.1 Booking analytics dashboard
- [ ] 3.2 SMS confirmation (Twilio)
- [ ] 3.3 Webhook retry logic
- [ ] 3.4 Stripe Connect onboarding UX

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `/src/pages/Bookings.tsx` | Admin booking management |
| `/src/pages/Customers.tsx` | Customer management |
| `/src/hooks/useBookings.ts` | Booking CRUD operations |
| `/src/hooks/useCustomers.ts` | Customer CRUD operations |
| `/src/services/AdminBookingService.ts` | Admin booking logic |
| `/src/services/booking.service.ts` | Widget booking logic |
| `/supabase/functions/stripe-webhook/` | Payment webhooks |
| `/supabase/functions/create-checkout-session/` | Checkout creation |
| `/supabase/functions/verify-checkout-session/` | Payment verification |

---

*Document maintained by development team. Last reviewed: November 29, 2025*
