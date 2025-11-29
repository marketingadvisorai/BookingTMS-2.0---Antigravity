# Customer Portal Architecture

> **Version**: 1.0 | **Created**: Nov 29, 2025 | **Module**: customer-portal

## Overview

The Customer Portal is a public-facing module that allows customers to manage their bookings without requiring admin authentication. Customers can look up their bookings using email, phone, or booking reference number.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER PORTAL FLOW                               │
└──────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  /my-bookings   │
                    │  or             │
                    │  /customer-portal│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  App.tsx        │
                    │  (Route Check)  │
                    │                 │
                    │ isCustomerPortal│
                    │   Mode = true   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │CustomerPortalPage│
                    │                 │
                    │ Uses:           │
                    │ - useCustomerAuth│
                    │ - useCustomerBookings│
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │ CustomerLookup  │           │CustomerDashboard│
    │                 │           │                 │
    │ Not Auth'd      │           │ Auth'd          │
    │ - Email lookup  │           │ - View bookings │
    │ - Phone lookup  │           │ - Cancel        │
    │ - Reference     │           │ - Reschedule    │
    │   lookup        │           │                 │
    └────────┬────────┘           └────────┬────────┘
             │                             │
             ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │customerAuth     │           │customerBooking  │
    │.service.ts      │           │.service.ts      │
    │                 │           │                 │
    │ - lookupCustomer│           │ - getBookings   │
    │ - saveSession   │           │ - cancelBooking │
    │ - clearSession  │           │ - reschedule    │
    └────────┬────────┘           └────────┬────────┘
             │                             │
             └──────────────┬──────────────┘
                            │
                            ▼
                   ┌─────────────────┐
                   │    Supabase     │
                   │                 │
                   │ - customers     │
                   │ - bookings      │
                   │ - activities    │
                   │ - venues        │
                   └─────────────────┘
```

---

## Module Structure

```
/src/modules/customer-portal/
├── index.ts                    # Module exports
├── pages/
│   └── CustomerPortalPage.tsx  # Main entry point (59 lines)
├── components/
│   ├── index.ts                # Component exports
│   ├── CustomerLookup.tsx      # Login/lookup form (152 lines)
│   ├── CustomerDashboard.tsx   # Main dashboard (212 lines)
│   ├── BookingCard.tsx         # Booking card display
│   └── BookingDetailsModal.tsx # Full booking details
├── hooks/
│   ├── index.ts                # Hook exports
│   ├── useCustomerAuth.ts      # Auth state management (96 lines)
│   └── useCustomerBookings.ts  # Booking operations
├── services/
│   ├── index.ts                # Service exports
│   ├── customerAuth.service.ts # Customer lookup (231 lines)
│   └── customerBooking.service.ts # Booking CRUD (403 lines)
└── types/
    └── index.ts                # TypeScript types
```

---

## Entity Relationship Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           DATABASE SCHEMA                                 │
└──────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    customers    │         │    bookings     │         │   activities    │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK)         │◀────────│ customer_id (FK)│────────▶│ id (PK)         │
│ organization_id │         │ activity_id (FK)│         │ venue_id (FK)   │
│ first_name      │         │ booking_number  │         │ name            │
│ last_name       │         │ booking_date    │         │ cover_image     │
│ email (unique)  │         │ start_time      │         │ duration        │
│ phone           │         │ end_time        │         │ price           │
│ status          │         │ party_size      │         │ capacity        │
│ total_bookings  │         │ players         │         └────────┬────────┘
│ total_spent     │         │ total_amount    │                  │
│ created_at      │         │ status          │                  │
└─────────────────┘         │ payment_status  │                  │
                            │ created_at      │                  │
                            │ cancelled_at    │                  ▼
                            │ cancellation_   │         ┌─────────────────┐
                            │   reason        │         │     venues      │
                            └─────────────────┘         ├─────────────────┤
                                                        │ id (PK)         │
                                                        │ organization_id │
                                                        │ name            │
                                                        │ address         │
                                                        │ city            │
                                                        │ state           │
                                                        └─────────────────┘
```

---

## Authentication Flow

### Session Management

```typescript
// Session stored in localStorage
interface CustomerSession {
  customer: CustomerProfile;
  sessionToken: string;      // Format: cps_XXXXXXXX (32 chars)
  expiresAt: string;         // ISO date string
}

// Session duration: 2 hours
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

// Storage key
const SESSION_STORAGE_KEY = 'customer_portal_session';
```

### Lookup Methods

| Method | Field | Query |
|--------|-------|-------|
| **Email** | `customers.email` | Exact match (lowercase) |
| **Phone** | `customers.phone` | Exact match |
| **Booking Reference** | `bookings.booking_number` or `bookings.confirmation_code` | Exact match (uppercase) |

### Lookup Flow

```
1. Customer enters email/phone/reference
           │
           ▼
2. Service queries database
           │
           ├─── Email: customers WHERE email = value
           │
           ├─── Phone: customers WHERE phone = value
           │
           └─── Reference: bookings WHERE booking_number = value
                          → get customer_id
                          → customers WHERE id = customer_id
           │
           ▼
3. If found, generate session token
           │
           ▼
4. Save session to localStorage
           │
           ▼
5. Return CustomerProfile to UI
```

---

## Booking Management

### Booking Status Lifecycle

```
pending → confirmed → checked_in → completed
    │         │
    │         └──────────────────┐
    │                            │
    └─────────────────┐          │
                      ▼          ▼
                  cancelled    no_show
```

### Cancellation Rules

- **Deadline**: 24 hours before booking time
- **Refund**: Full refund for paid bookings (manual process)
- **Status Change**: `status` → `cancelled`, `cancelled_at` set

### CustomerBooking Interface

```typescript
interface CustomerBooking {
  id: string;
  bookingReference: string;      // booking_number or id prefix
  status: BookingStatus;
  activityId: string;
  activityName: string;
  activityImage: string | null;
  venueName: string;
  venueAddress: string;
  bookingDate: string;           // YYYY-MM-DD
  startTime: string;             // HH:mm:ss
  endTime: string;
  partySize: number;
  totalAmount: number;
  currency: string;              // 'USD'
  paymentStatus: PaymentStatus;
  createdAt: string;
  canCancel: boolean;
  canReschedule: boolean;
  cancellationDeadline: string;
}
```

---

## Routes

| Route | Component | Auth Required |
|-------|-----------|---------------|
| `/my-bookings` | CustomerPortalPage | No (uses session) |
| `/customer-portal` | CustomerPortalPage | No (uses session) |

### Route Detection (App.tsx)

```typescript
const isCustomerPortalMode = 
  path === '/my-bookings' || 
  path === '/my-bookings/' || 
  path === '/customer-portal' || 
  path === '/customer-portal/';
```

---

## UI Components

### CustomerLookup

- **Purpose**: Login/lookup form
- **Features**:
  - Tab selector (Email / Reference / Phone)
  - Input validation
  - Error display
  - Loading state

### CustomerDashboard

- **Purpose**: Main dashboard after login
- **Features**:
  - Welcome header with customer name
  - Stats cards (Upcoming, Completed, Total)
  - Tab navigation (Upcoming / Past / Cancelled)
  - Booking list with BookingCard components
  - Logout button

### BookingCard

- **Purpose**: Single booking display
- **Features**:
  - Activity name and image
  - Date/time display
  - Status badge
  - Click to view details

### BookingDetailsModal

- **Purpose**: Full booking details
- **Features**:
  - Complete booking information
  - Cancel button (if allowed)
  - Reschedule button (if allowed)
  - Copy reference to clipboard

---

## Testing the Portal

### Test Customer (Use for Testing)

You can test the portal with these methods:

1. **Email Lookup**: Use any email from the customers table
2. **Create Test Customer via Admin**: Add a customer in the admin panel
3. **After Booking**: Make a booking, then use your email to look up

### Test URL

```
http://localhost:5173/my-bookings
```

---

## Known Issues & Fixes (v0.1.53)

### Fixed Issues

1. **Database Field Mismatch** ✅
   - Service used `booking_reference`, database has `booking_number`
   - Fixed to use `booking_number` with fallback to `confirmation_code`

2. **Party Size Field** ✅
   - Database has both `party_size` and `players` (legacy)
   - Fixed to use `party_size || players || 1`

### Remaining Tasks

- [ ] Add email verification for lookup (optional security)
- [ ] Implement Stripe refund in cancelBooking
- [ ] Add booking rescheduling UI
- [ ] Add booking modification notifications

---

## Security Considerations

1. **No Admin Auth**: Portal uses localStorage session, not Supabase auth
2. **Session Expiry**: 2-hour sessions with auto-extend on activity
3. **Customer Isolation**: Only shows bookings for the authenticated customer
4. **Rate Limiting**: Consider adding rate limits to prevent abuse

---

*Document maintained by development team. Last reviewed: November 29, 2025*
