# BookingTMS Database ERD & Module Architecture

> **Version**: 0.1.65  
> **Last Updated**: November 30, 2025  
> **Supabase Project**: `qftjyjpitnoapqxlrvfs`

---

## Table of Contents
1. [Entity Relationship Diagram](#entity-relationship-diagram)
2. [Core Tables Overview](#core-tables-overview)
3. [Module Connections](#module-connections)
4. [RLS Policies](#rls-policies)
5. [Edge Functions](#edge-functions)
6. [Data Flow Diagrams](#data-flow-diagrams)

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           BOOKINGTMS DATABASE ERD                                    │
│                        Last Updated: Nov 30, 2025                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   ┌──────────────────────┐         ┌──────────────────────┐                         │
│   │      auth.users      │◄────────┤       users          │                         │
│   │  (Supabase Auth)     │   1:1   │  (Profile + Role)    │                         │
│   │                      │         │  - id                │                         │
│   │  - id                │         │  - email             │                         │
│   │  - email             │         │  - full_name         │                         │
│   │  - encrypted_pass    │         │  - role              │                         │
│   │  - created_at        │         │  - organization_id   │                         │
│   └──────────────────────┘         │  - is_platform_team  │                         │
│                                    └──────────┬───────────┘                         │
│                                               │                                      │
│                                               │ N:1                                  │
│                                               ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────────────┐   │
│   │                           organizations                                      │   │
│   │                                                                              │   │
│   │  id (PK)              │ name               │ owner_email                     │   │
│   │  owner_name           │ status             │ stripe_account_id               │   │
│   │  stripe_connect_*     │ plan_id            │ primary_color                   │   │
│   │  application_fee_*    │ subscription_*     │ current_venues_count            │   │
│   └────────────┬──────────────────────────────────────────────────────────────────┘   │
│                │                                                                      │
│    ┌───────────┼───────────────┬───────────────────┬─────────────────┐              │
│    │           │               │                   │                 │              │
│    ▼           ▼               ▼                   ▼                 ▼              │
│ ┌──────────┐ ┌──────────┐ ┌─────────────┐ ┌────────────────┐ ┌──────────────────┐   │
│ │ venues   │ │  users   │ │embed_configs│ │ organization_  │ │ organization_    │   │
│ │  (6)     │ │   (2)    │ │    (7)      │ │  members (2)   │ │   usage          │   │
│ └────┬─────┘ └──────────┘ └─────────────┘ └────────────────┘ └──────────────────┘   │
│      │                                                                               │
│      │ 1:N                                                                           │
│      ▼                                                                               │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │                              activities                                          │ │
│ │                                                                                  │ │
│ │  id (PK)          │ venue_id (FK)      │ organization_id (FK)                   │ │
│ │  name             │ description        │ duration                               │ │
│ │  price            │ min_players        │ max_players                            │ │
│ │  schedule (JSONB) │ settings (JSONB)   │ stripe_product_id                      │ │
│ │  is_active        │ difficulty         │ slug                                   │ │
│ └────────────────────────────┬────────────────────────────────────────────────────┘ │
│                              │                                                       │
│                              │ 1:N                                                   │
│                              ▼                                                       │
│ ┌─────────────────────────────────────────────────────────────────────────────────┐ │
│ │                         activity_sessions                                        │ │
│ │                          (2,305 rows)                                            │ │
│ │                                                                                  │ │
│ │  id (PK)          │ activity_id (FK)   │ venue_id (FK)                          │ │
│ │  organization_id  │ start_time         │ end_time                               │ │
│ │  capacity_total   │ capacity_remaining │ is_closed                              │ │
│ │  price_at_gen     │ created_at         │                                        │ │
│ └────────────────────────────┬────────────────────────────────────────────────────┘ │
│                              │                                                       │
│              ┌───────────────┴───────────────┐                                      │
│              │                               │                                      │
│              ▼                               ▼                                      │
│ ┌─────────────────────────┐    ┌─────────────────────────┐                         │
│ │       bookings          │    │   slot_reservations     │                         │
│ │        (2 rows)         │    │   (temp holds - 15min)  │                         │
│ │                         │    │                         │                         │
│ │  id (PK)                │    │  id (PK)                │                         │
│ │  session_id (FK)        │    │  session_id (FK)        │                         │
│ │  activity_id (FK)       │    │  party_size             │                         │
│ │  customer_id (FK) ──────┼────│  booking_id (FK)        │                         │
│ │  venue_id (FK)          │    │  expires_at             │                         │
│ │  organization_id (FK)   │    │  status                 │                         │
│ │  total_amount           │    └─────────────────────────┘                         │
│ │  status                 │                                                         │
│ │  payment_status         │                                                         │
│ │  stripe_payment_*       │                                                         │
│ │  booking_number         │    ┌─────────────────────────┐                         │
│ └─────────────────────────┘    │      customers          │                         │
│              │                 │       (6 rows)          │                         │
│              │                 │                         │                         │
│              └────────────────►│  id (PK)                │                         │
│                                │  email                  │                         │
│                                │  full_name              │                         │
│                                │  phone                  │                         │
│                                │  organization_id (FK)   │                         │
│                                │  stripe_customer_id     │                         │
│                                └─────────────────────────┘                         │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Tables Overview

### 1. Organizations (Tenant Account)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `name` | VARCHAR | Organization name |
| `owner_email` | VARCHAR | Owner's email |
| `owner_name` | VARCHAR | Owner's name |
| `status` | VARCHAR | 'active', 'pending', 'suspended' |
| `plan_id` | UUID | FK to plans |
| `stripe_account_id` | VARCHAR | Stripe Connect account |
| `stripe_connect_enabled` | BOOLEAN | Connect enabled |
| `stripe_charges_enabled` | BOOLEAN | Can accept charges |
| `stripe_payouts_enabled` | BOOLEAN | Can receive payouts |
| `application_fee_percentage` | DECIMAL | Platform fee % |
| `primary_color` | VARCHAR | Brand color |

### 2. Venues (Physical Location)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK to organizations |
| `name` | VARCHAR | Venue name |
| `address` | TEXT | Street address |
| `city`, `state`, `zip` | VARCHAR | Location |
| `timezone` | VARCHAR | e.g., 'America/New_York' |
| `embed_key` | VARCHAR | Unique key for widgets |
| `status` | VARCHAR | 'active', 'inactive' |
| `settings` | JSONB | Widget config, etc. |

### 3. Activities (Bookable Experience)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `venue_id` | UUID | FK to venues |
| `organization_id` | UUID | FK to organizations |
| `name` | VARCHAR | Activity name |
| `duration` | INTEGER | Duration in minutes |
| `price` | DECIMAL | Base price |
| `min_players` | INTEGER | Min capacity |
| `max_players` | INTEGER | Max capacity |
| `schedule` | JSONB | Operating schedule |
| `stripe_product_id` | VARCHAR | Stripe product |
| `is_active` | BOOLEAN | Published status |

### 4. Activity Sessions (Time Slots)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `activity_id` | UUID | FK to activities |
| `start_time` | TIMESTAMPTZ | Slot start |
| `end_time` | TIMESTAMPTZ | Slot end |
| `capacity_total` | INTEGER | Max capacity |
| `capacity_remaining` | INTEGER | Available spots |
| `is_closed` | BOOLEAN | Manually closed |

### 5. Bookings (Reservations)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `session_id` | UUID | FK to activity_sessions |
| `customer_id` | UUID | FK to customers |
| `booking_number` | VARCHAR | Human-readable ID |
| `total_amount` | DECIMAL | Total price |
| `status` | VARCHAR | 'pending', 'confirmed', 'cancelled' |
| `payment_status` | VARCHAR | 'pending', 'paid', 'refunded' |
| `stripe_payment_intent_id` | VARCHAR | Stripe PI |

### 6. Customers (Guests)
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | FK to organizations |
| `email` | VARCHAR | Customer email |
| `full_name` | VARCHAR | Customer name |
| `phone` | VARCHAR | Phone number |
| `stripe_customer_id` | VARCHAR | Stripe customer |

---

## Module Connections

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           MODULE ARCHITECTURE                                     │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐       │
│  │ DASHBOARD   │    │ BOOKINGS    │    │ ACTIVITIES  │    │ VENUES      │       │
│  │ /dashboard  │    │ /bookings   │    │ /events     │    │ /venues     │       │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘       │
│         │                  │                  │                  │               │
│         │                  │                  │                  │               │
│         ▼                  ▼                  ▼                  ▼               │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         SERVICE LAYER                                     │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │  BookingService     │ ActivityService  │ VenueService   │ OrgService    │   │
│  │  SessionService     │ CustomerService  │ PaymentService │ EmbedService  │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                             │
│                                    ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         SUPABASE CLIENT                                   │   │
│  │  /src/lib/supabase.ts  │  Real-time subscriptions  │  RLS enforcement   │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                    │                                             │
│                                    ▼                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                         SUPABASE DATABASE                                 │   │
│  │                    Project: qftjyjpitnoapqxlrvfs                          │   │
│  ├──────────────────────────────────────────────────────────────────────────┤   │
│  │  organizations │ venues │ activities │ activity_sessions │ bookings      │   │
│  │  customers     │ users  │ embed_configs │ organization_members            │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## RLS Policies

### Organizations
| Policy | Role | Command | Condition |
|--------|------|---------|-----------|
| Public read for widgets | anon | SELECT | `is_active = true` |
| Org users view own | authenticated | SELECT | User's org |
| Org admins update own | authenticated | UPDATE | Admin of org |
| Platform team all | authenticated | ALL | `is_platform_team = true` |

### Venues
| Policy | Role | Command | Condition |
|--------|------|---------|-----------|
| Public read active | anon | SELECT | `status = 'active'` |
| Tenant isolation | authenticated | ALL | Org member |

### Activities
| Policy | Role | Command | Condition |
|--------|------|---------|-----------|
| Public read active | anon | SELECT | `is_active = true` |
| Tenant isolation | authenticated | ALL | Org member |

### Bookings & Customers
| Policy | Role | Command | Condition |
|--------|------|---------|-----------|
| Anon read | anon | SELECT | true (for widgets) |
| Org access | authenticated | ALL | true (service role) |

---

## Edge Functions

| Function | Purpose | Auth | Endpoint |
|----------|---------|------|----------|
| `create-booking` | Widget booking | No | `/functions/v1/create-booking` |
| `stripe-webhook` | Stripe events | Stripe | `/functions/v1/stripe-webhook` |
| `generate-sessions` | Auto-generate slots | Yes | `/functions/v1/generate-sessions` |
| `stripe-manage-product` | Sync Stripe | Yes | `/functions/v1/stripe-manage-product` |
| `create-checkout-session` | Stripe Checkout | Yes | `/functions/v1/create-checkout-session` |
| `verify-checkout-session` | Verify payment | Yes | `/functions/v1/verify-checkout-session` |
| `create-org-admin` | Create org admin | Yes | `/functions/v1/create-org-admin` |
| `admin-password-reset` | Admin password ops | Admin | `/functions/v1/admin-password-reset` |

---

## Data Flow Diagrams

### 1. Booking Flow
```
Customer → Widget → create-booking → activity_sessions (capacity--) → bookings (created)
                 ↓
              stripe-webhook → payment confirmed → booking status = 'confirmed'
```

### 2. Activity Creation Flow
```
Admin → Events.tsx → ActivityService.createActivity → activities table
                  ↓
              generate-sessions → activity_sessions (90 days of slots)
                  ↓
              stripe-manage-product → Stripe product/price created
```

### 3. Organization Onboarding Flow
```
System Admin → Organizations.tsx → OrganizationService.create → organizations table
                               ↓
                        create-org-admin → auth.users + users table
                               ↓
                        Stripe Connect → stripe_account_id saved
```

---

## Current Statistics (Nov 30, 2025)

| Table | Rows | RLS |
|-------|------|-----|
| organizations | 4 | ✅ |
| venues | 6 | ✅ |
| activities | 10 | ✅ |
| activity_sessions | 2,305 | ✅ |
| bookings | 2 | ✅ |
| customers | 6 | ✅ |
| users | 2 | ✅ |
| embed_configs | 7 | ✅ |
| organization_members | 2 | ✅ |

---

*Document auto-generated. Last reviewed: November 30, 2025.*
