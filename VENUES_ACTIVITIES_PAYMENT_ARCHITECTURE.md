# Venues & Games Payment Integration Architecture
## Stripe Payment System for Direct Bookings

**Version:** 1.0.0  
**Date:** November 10, 2025  
**Architect:** Software Engineering Team

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [User Flow & Journey](#user-flow--journey)
4. [Component Design](#component-design)
5. [Data Flow](#data-flow)
6. [Implementation Plan](#implementation-plan)
7. [Security & Compliance](#security--compliance)

---

## Executive Summary

### Objective
Integrate Stripe payment processing into Venues and Games pages to enable customers to book and pay for games directly from the admin dashboard or public-facing pages.

### Key Requirements
- ✅ Accept payments when booking games from Venues page
- ✅ Accept payments when booking games from Games page
- ✅ **Exclude** calendar widgets (as per requirements)
- ✅ Seamless booking-to-payment flow
- ✅ Support multiple payment methods
- ✅ Real-time booking confirmation
- ✅ Email notifications with QR codes

### Scope
**In Scope:**
- Venues page booking flow with payment
- Games page booking flow with payment
- Booking confirmation page
- Payment status tracking
- Email notifications

**Out of Scope:**
- Calendar widget payments (excluded per requirements)
- Subscription billing
- Recurring payments

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Venues     │  │    Games     │  │   Booking    │     │
│  │    Page      │  │    Page      │  │  Checkout    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│                   ┌────────▼────────┐                       │
│                   │ PaymentWrapper  │                       │
│                   │  (Stripe UI)    │                       │
│                   └────────┬────────┘                       │
└────────────────────────────┼──────────────────────────────┘
                             │
                             │
┌────────────────────────────▼──────────────────────────────┐
│              Supabase Edge Functions                       │
│                                                            │
│  ┌──────────────────────┐  ┌──────────────────────┐      │
│  │ create-payment-      │  │ stripe-webhook       │      │
│  │    intent            │  │                      │      │
│  └──────────┬───────────┘  └──────────┬───────────┘      │
└─────────────┼──────────────────────────┼──────────────────┘
              │                          │
              │                          │
      ┌───────▼──────────┐       ┌──────▼──────────┐
      │  Stripe API      │       │  Stripe         │
      │  (Payments)      │       │  Webhooks       │
      └───────┬──────────┘       └──────┬──────────┘
              │                          │
              │                          │
┌─────────────▼──────────────────────────▼──────────────────┐
│                  Supabase Database                         │
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ venues   │  │  games   │  │ bookings │  │ payments │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                                            │
│  ┌──────────┐  ┌──────────┐                              │
│  │customers │  │ refunds  │                              │
│  └──────────┘  └──────────┘                              │
└────────────────────────────────────────────────────────────┘
```

---

## User Flow & Journey

### Flow 1: Book from Venues Page

```
1. User navigates to Venues page
   ↓
2. User selects a venue
   ↓
3. User clicks "Book Now" or "View Games"
   ↓
4. User selects a game
   ↓
5. User selects date & time
   ↓
6. User enters party size
   ↓
7. User enters customer details (name, email, phone)
   ↓
8. System calculates total price
   ↓
9. User clicks "Proceed to Payment"
   ↓
10. Payment modal opens with Stripe Elements
   ↓
11. User enters payment details
   ↓
12. User clicks "Pay $XX.XX"
   ↓
13. Stripe processes payment
   ↓
14. Webhook confirms payment
   ↓
15. Booking status → "confirmed"
   ↓
16. Email sent with QR code
   ↓
17. User redirected to confirmation page
```

### Flow 2: Book from Games Page

```
1. User navigates to Games page
   ↓
2. User browses available games
   ↓
3. User clicks "Book This Game"
   ↓
4. User selects date & time
   ↓
5. User enters party size
   ↓
6. User enters customer details
   ↓
7. System calculates total price
   ↓
8. User clicks "Proceed to Payment"
   ↓
9. Payment modal opens
   ↓
10. [Same as Venues Flow steps 11-17]
```

---

## Component Design

### 1. Booking Dialog Component

**File:** `src/components/bookings/BookingDialog.tsx`

```typescript
interface BookingDialogProps {
  game: Game;
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
}

// Features:
- Date picker
- Time slot selector
- Party size input
- Customer form (name, email, phone)
- Price calculator
- "Proceed to Payment" button
```

### 2. Payment Checkout Component

**File:** `src/components/bookings/PaymentCheckout.tsx`

```typescript
interface PaymentCheckoutProps {
  booking: BookingData;
  onSuccess: (bookingId: string) => void;
  onCancel: () => void;
}

// Features:
- Booking summary
- Price breakdown
- PaymentWrapper integration
- Loading states
- Error handling
```

### 3. Booking Confirmation Component

**File:** `src/components/bookings/BookingConfirmation.tsx`

```typescript
interface BookingConfirmationProps {
  bookingId: string;
}

// Features:
- Booking details display
- QR code display
- Download ticket button
- Email confirmation status
- Add to calendar button
```

### 4. Enhanced Venues Page

**Updates to:** `src/pages/Venues.tsx`

```typescript
// Add:
- "Book Now" button on each venue card
- BookingDialog integration
- Payment flow trigger
```

### 5. Enhanced Games Page

**Updates to:** `src/pages/Games.tsx`

```typescript
// Add:
- "Book This Game" button on each game card
- BookingDialog integration
- Payment flow trigger
```

---

## Data Flow

### Booking Creation Flow

```
Frontend                    Edge Function              Stripe              Database
   │                             │                       │                    │
   │  1. Create Booking          │                       │                    │
   ├────────────────────────────>│                       │                    │
   │                             │  2. Insert Booking    │                    │
   │                             ├──────────────────────────────────────────>│
   │                             │                       │                    │
   │                             │  3. Create Payment    │                    │
   │                             │      Intent           │                    │
   │                             ├──────────────────────>│                    │
   │                             │                       │                    │
   │                             │  4. Return Client     │                    │
   │                             │      Secret           │                    │
   │  5. Client Secret           │<──────────────────────┤                    │
   │<────────────────────────────┤                       │                    │
   │                             │                       │                    │
   │  6. Display Payment Form    │                       │                    │
   │  (Stripe Elements)          │                       │                    │
   │                             │                       │                    │
   │  7. Submit Payment          │                       │                    │
   ├─────────────────────────────────────────────────────>│                    │
   │                             │                       │                    │
   │                             │                       │  8. Process        │
   │                             │                       │     Payment        │
   │                             │                       │                    │
   │                             │  9. Webhook Event     │                    │
   │                             │<──────────────────────┤                    │
   │                             │                       │                    │
   │                             │  10. Update Booking   │                    │
   │                             │       & Payment       │                    │
   │                             ├──────────────────────────────────────────>│
   │                             │                       │                    │
   │  11. Payment Success        │                       │                    │
   │<────────────────────────────┤                       │                    │
   │                             │                       │                    │
   │  12. Redirect to            │                       │                    │
   │      Confirmation           │                       │                    │
```

### Database Schema Updates

**bookings table:**
```sql
- id (UUID)
- venue_id (UUID) → FK to venues
- game_id (UUID) → FK to games
- customer_id (UUID) → FK to customers
- booking_date (DATE)
- start_time (TIME)
- end_time (TIME)
- party_size (INTEGER)
- total_price (DECIMAL)
- status (VARCHAR) → 'pending', 'confirmed', 'canceled'
- payment_status (VARCHAR) → 'pending', 'paid', 'failed', 'refunded'
- payment_amount (DECIMAL)
- payment_currency (VARCHAR)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**payments table:**
```sql
- id (UUID)
- booking_id (UUID) → FK to bookings
- customer_id (UUID) → FK to customers
- stripe_payment_intent_id (VARCHAR)
- stripe_charge_id (VARCHAR)
- amount (DECIMAL)
- currency (VARCHAR)
- status (VARCHAR)
- paid_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
```

---

## Implementation Plan

### Phase 1: Component Development (Week 1)

#### Day 1-2: Booking Dialog
```typescript
// Create BookingDialog component
- Date picker integration
- Time slot selector
- Party size input
- Customer form
- Price calculation
- Validation
```

#### Day 3-4: Payment Checkout
```typescript
// Create PaymentCheckout component
- Integrate PaymentWrapper
- Booking summary display
- Price breakdown
- Success/error handling
```

#### Day 5: Confirmation Page
```typescript
// Create BookingConfirmation component
- Fetch booking details
- Display QR code
- Email status
- Download ticket
```

### Phase 2: Page Integration (Week 2)

#### Day 1-2: Venues Page
```typescript
// Update Venues.tsx
- Add "Book Now" button
- Integrate BookingDialog
- Handle booking flow
- Test end-to-end
```

#### Day 3-4: Games Page
```typescript
// Update Games.tsx
- Add "Book This Game" button
- Integrate BookingDialog
- Handle booking flow
- Test end-to-end
```

#### Day 5: Testing & Bug Fixes
```
- Test all flows
- Fix bugs
- Optimize performance
```

### Phase 3: Email & Notifications (Week 3)

#### Day 1-2: Email Templates
```typescript
// Create booking confirmation email
- Booking details
- QR code
- Venue/game info
- Cancellation policy
```

#### Day 3-4: Email Integration
```typescript
// Integrate with send-email Edge Function
- Trigger on payment success
- Include QR code
- Track email status
```

#### Day 5: Testing
```
- Test email delivery
- Verify QR codes
- Check all scenarios
```

---

## Security & Compliance

### Payment Security
- ✅ PCI DSS compliant (Stripe handles card data)
- ✅ No card numbers stored in database
- ✅ Stripe Elements for secure input
- ✅ HTTPS only
- ✅ Webhook signature verification

### Data Protection
- ✅ Customer data encrypted at rest
- ✅ Row Level Security (RLS) on all tables
- ✅ API keys in environment variables
- ✅ Secure session management

### Booking Security
- ✅ Prevent double bookings
- ✅ Validate time slots
- ✅ Check venue capacity
- ✅ Verify payment before confirmation

---

## API Endpoints

### Frontend API Calls

```typescript
// 1. Create Booking & Payment Intent
POST /functions/v1/create-booking-with-payment
Body: {
  venueId: string,
  gameId: string,
  bookingDate: string,
  startTime: string,
  partySize: number,
  customer: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string
  }
}
Response: {
  bookingId: string,
  clientSecret: string,
  amount: number
}

// 2. Get Booking Details
GET /bookings/{bookingId}
Response: {
  booking: Booking,
  payment: Payment,
  venue: Venue,
  game: Game
}

// 3. Cancel Booking
POST /functions/v1/cancel-booking
Body: {
  bookingId: string,
  reason: string
}
Response: {
  success: boolean,
  refundId?: string
}
```

---

## Component File Structure

```
src/
├── components/
│   ├── bookings/
│   │   ├── BookingDialog.tsx          # Main booking form
│   │   ├── DateTimePicker.tsx         # Date & time selection
│   │   ├── CustomerForm.tsx           # Customer details
│   │   ├── PriceCalculator.tsx        # Price breakdown
│   │   ├── PaymentCheckout.tsx        # Payment integration
│   │   ├── BookingConfirmation.tsx    # Success page
│   │   └── BookingSummary.tsx         # Order summary
│   │
│   └── payments/
│       ├── PaymentWrapper.tsx         # Existing
│       ├── PaymentForm.tsx            # Existing
│       └── PaymentStatus.tsx          # New - status display
│
├── pages/
│   ├── Venues.tsx                     # Updated
│   ├── Games.tsx                      # Updated
│   └── BookingConfirmationPage.tsx    # New
│
├── lib/
│   ├── bookings/
│   │   ├── bookingService.ts          # Booking API
│   │   ├── priceCalculator.ts         # Price logic
│   │   └── availabilityChecker.ts     # Slot validation
│   │
│   └── payments/
│       └── paymentService.ts          # Existing
│
└── hooks/
    ├── useBooking.ts                  # Booking state
    ├── usePayment.ts                  # Payment state
    └── useAvailability.ts             # Availability check
```

---

## Edge Functions

### New Function: create-booking-with-payment

**File:** `supabase/functions/create-booking-with-payment/index.ts`

```typescript
// Purpose: Create booking and payment intent in one transaction
// Steps:
1. Validate input data
2. Check availability
3. Create customer record (if new)
4. Create booking record
5. Create Stripe payment intent
6. Create payment record
7. Return booking ID and client secret
```

---

## Testing Strategy

### Unit Tests
```typescript
// Test components
- BookingDialog validation
- Price calculation
- Date/time selection
- Customer form validation

// Test services
- Booking creation
- Payment intent creation
- Availability checking
```

### Integration Tests
```typescript
// Test flows
- Complete booking flow
- Payment processing
- Webhook handling
- Email sending
```

### E2E Tests
```typescript
// Test user journeys
- Book from Venues page
- Book from Games page
- Payment success flow
- Payment failure flow
- Cancellation flow
```

---

## Monitoring & Analytics

### Key Metrics
- Booking conversion rate
- Payment success rate
- Average booking value
- Popular games/venues
- Peak booking times

### Logging
```typescript
// Log events
- Booking created
- Payment initiated
- Payment succeeded
- Payment failed
- Booking confirmed
- Email sent
```

---

## Rollout Plan

### Phase 1: Internal Testing (Week 1)
- Deploy to staging
- Test with team
- Fix critical bugs

### Phase 2: Beta Testing (Week 2)
- Select beta users
- Monitor closely
- Gather feedback

### Phase 3: Production (Week 3)
- Deploy to production
- Monitor metrics
- Support users

---

## Success Criteria

✅ Users can book games from Venues page  
✅ Users can book games from Games page  
✅ Payments process successfully (>95% success rate)  
✅ Bookings confirmed in real-time  
✅ Emails sent within 1 minute  
✅ QR codes generated correctly  
✅ Zero security vulnerabilities  
✅ Page load time < 2 seconds  

---

**Status:** Architecture Complete  
**Next Step:** Begin Phase 1 Implementation  
**Estimated Timeline:** 3 weeks  
**Team Size:** 2-3 developers
