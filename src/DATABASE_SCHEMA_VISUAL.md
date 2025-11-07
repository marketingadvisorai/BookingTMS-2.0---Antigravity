# BookingTMS Database Schema - Visual Guide

## 🗂️ Database Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     BOOKINGTMS DATABASE                              │
│                     PostgreSQL via Supabase                          │
└─────────────────────────────────────────────────────────────────────┘

┌───────────────────┐
│  Organizations    │ ◄────┐
│  (Multi-tenant)   │      │
├───────────────────┤      │
│ • id (PK)         │      │
│ • name            │      │
│ • slug (unique)   │      │
│ • plan            │      │
│ • settings (JSON) │      │
│ • stripe IDs      │      │
└───────────────────┘      │
         │                 │
         │ has many        │ belongs to
         ▼                 │
┌───────────────────┐      │
│      Users        │──────┘
│   (RBAC System)   │
├───────────────────┤
│ • id (PK) ────────┼─── Links to auth.users
│ • email           │
│ • full_name       │
│ • role ◄──────────┼─── super-admin | admin | manager | staff
│ • organization_id │
│ • phone           │
│ • avatar_url      │
│ • is_active       │
│ • last_login_at   │
└───────────────────┘
         │
         │ creates
         ▼
┌───────────────────────────────────────────────────────────────────┐
│                        CORE BUSINESS ENTITIES                      │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────┐     ┌───────────────────┐     ┌───────────────┐
│      Games        │     │    Customers      │     │   Bookings    │
│ (Escape Rooms)    │     │   (CRM Data)      │     │ (Reservations)│
├───────────────────┤     ├───────────────────┤     ├───────────────┤
│ • id (PK)         │     │ • id (PK)         │     │ • id (PK)     │
│ • organization_id │     │ • organization_id │     │ • org_id      │
│ • name            │◄────┼─┐ email           │◄────┼─┐ booking_#  │
│ • description     │  │  │ │ • full_name     │  │  │ │ customer_id │
│ • difficulty ◄────┼──┼──┼─┤ • phone         │  │  │ │ game_id     │
│   (easy→expert)   │  │  │ │ • total_booking │  │  │ │ date        │
│ • duration_min    │  │  │ │ • total_spent   │  │  │ │ start_time  │
│ • min_players     │  │  │ │ • segment ◄─────┼──┼──┼─┤ end_time    │
│ • max_players     │  │  │ │   (VIP|Regular) │  │  │ │ party_size  │
│ • price           │  │  │ │ • stripe_cust_id│  │  │ │ status ◄────┼─ pending|confirmed|
│ • image_url       │  │  │ │ • notes         │  │  │ │             │  checked_in|completed|
│ • is_active       │  │  │ └───────────────────┘  │  │ │             │  cancelled
└───────────────────┘  │  │                        │  │ │ • total_amt │
                       │  │                        │  │ │ • discount  │
                       │  └────────────────────────┘  │ │ • final_amt │
         booked for    │           books             │ │ • payment_  │
                       └─────────────────────────────┘ │   status    │
                                                        │ • notes     │
                                                        │ • created_by│
                                                        └───────────────┘
                                                               │
                                                               │ has
                                                               ▼
                                                        ┌───────────────┐
                                                        │   Payments    │
                                                        │ (Stripe Data) │
                                                        ├───────────────┤
                                                        │ • id (PK)     │
                                                        │ • booking_id  │
                                                        │ • stripe_     │
                                                        │   payment_    │
                                                        │   intent_id   │
                                                        │ • stripe_     │
                                                        │   charge_id   │
                                                        │ • amount      │
                                                        │ • currency    │
                                                        │ • status ◄────┼─ pending|paid|
                                                        │ • payment_    │  refunded|failed|
                                                        │   method_type │  disputed
                                                        │ • last_4      │
                                                        │ • card_brand  │
                                                        │ • receipt_url │
                                                        │ • refund_amt  │
                                                        │ • metadata    │
                                                        └───────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION SYSTEM                            │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────┐                    ┌───────────────────────────┐
│  Notifications    │                    │  Notification Settings    │
│  (Inbox/Alerts)   │                    │  (User Preferences)       │
├───────────────────┤                    ├───────────────────────────┤
│ • id (PK)         │                    │ • user_id (PK) ───────────┼─ 1:1 with Users
│ • user_id ────────┼─ belongs to User   │ • sound_enabled           │
│ • organization_id │                    │ • sound_volume            │
│ • type ◄──────────┼─ booking|payment|  │ • sound_for_bookings      │
│                   │  cancellation|     │ • sound_for_payments      │
│                   │  message|staff|    │ • sound_for_cancellations │
│                   │  system            │ • sound_for_messages      │
│ • priority ◄──────┼─ low|medium|high   │ • desktop_enabled         │
│ • title           │                    │ • desktop_for_*           │
│ • message         │                    │ • email_enabled           │
│ • action_url      │                    │ • sms_enabled             │
│ • action_label    │                    │ • sms_phone_number        │
│ • metadata (JSON) │                    │ • quiet_hours_enabled     │
│ • is_read         │                    │ • quiet_hours_start       │
│ • read_at         │                    │ • quiet_hours_end         │
│ • created_at      │                    │ • show_in_app_notifs      │
└───────────────────┘                    └───────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                     WEBHOOK & INTEGRATION                          │
└───────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│  Stripe Webhook Events  │
│  (Event Log)            │
├─────────────────────────┤
│ • id (PK)               │
│ • event_id (unique)     │
│ • event_type            │
│ • payload (JSON)        │
│ • processed             │
│ • processing_error      │
│ • processed_at          │
└─────────────────────────┘
```

---

## 🎯 Entity Relationships

### Primary Relationships

```
Organizations (1) ──< (N) Users
Organizations (1) ──< (N) Games
Organizations (1) ──< (N) Customers
Organizations (1) ──< (N) Bookings

Users (1) ──< (N) Bookings (as creator)
Users (1) ──< (N) Notifications
Users (1) ──── (1) Notification Settings

Customers (1) ──< (N) Bookings
Games (1) ──< (N) Bookings
Bookings (1) ──< (N) Payments
```

### Key Constraints

```
✓ Bookings MUST have a customer, game, and creator
✓ Payments MUST link to a booking
✓ Users MUST belong to an organization
✓ Games MUST belong to an organization
✓ All entities belong to an organization (multi-tenant)
```

---

## 🔐 Security Model (RLS)

```
┌──────────────────────────────────────────────────────┐
│          ROW-LEVEL SECURITY POLICIES                 │
└──────────────────────────────────────────────────────┘

Organizations
├─ SELECT:  User's own organization only
└─ UPDATE:  Super Admins only

Users
├─ SELECT:  Users in same organization
└─ ALL:     Super Admins only

Games
├─ SELECT:  Users in same organization
└─ ALL:     Admins and Super Admins

Customers
├─ SELECT:  Users in same organization
└─ ALL:     Admins and Super Admins

Bookings
├─ SELECT:  Users in same organization
├─ INSERT:  All staff (own organization)
└─ UPDATE:  Admins and Managers

Payments
├─ SELECT:  Users in same organization
└─ ALL:     Admins only

Notifications
├─ SELECT:  Own notifications only
├─ UPDATE:  Own notifications only
└─ INSERT:  System (all)

Notification Settings
├─ SELECT:  Own settings only
└─ UPDATE:  Own settings only
```

---

## ⚙️ Automated Features

### Triggers

```
1. update_updated_at_column()
   ├─ Fires: BEFORE UPDATE
   ├─ Tables: organizations, users, games, customers, bookings, payments
   └─ Action: Sets updated_at = NOW()

2. create_notification_settings_for_user()
   ├─ Fires: AFTER INSERT on users
   └─ Action: Creates default notification settings

3. update_customer_stats()
   ├─ Fires: AFTER INSERT/UPDATE on bookings
   ├─ Condition: payment_status changes to 'paid' or 'refunded'
   └─ Action: Updates customer.total_bookings, total_spent, segment
```

### Functions

```sql
-- Generate unique booking number
generate_booking_number() → 'BK-12345'

-- Check if time slot is available
check_game_availability(
  game_id,
  date,
  start_time,
  end_time
) → boolean
```

### Views

```sql
-- Denormalized booking data with joins
booking_summary
├─ booking details
├─ customer name/email
├─ game name
└─ creator name

-- Daily revenue aggregation
daily_revenue
├─ organization_id
├─ booking_date
├─ total_bookings (count)
├─ total_revenue (sum)
└─ average_booking_value (avg)
```

---

## 📊 Data Types

### Enums

```typescript
user_role: 'super-admin' | 'admin' | 'manager' | 'staff'

booking_status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'

payment_status: 'pending' | 'paid' | 'refunded' | 'failed' | 'disputed' | 'partially_refunded'

customer_segment: 'vip' | 'regular' | 'new' | 'inactive'

difficulty_level: 'easy' | 'medium' | 'hard' | 'expert'

organization_plan: 'free' | 'starter' | 'pro' | 'enterprise'

notification_type: 'booking' | 'payment' | 'cancellation' | 'message' | 'staff' | 'system'

notification_priority: 'low' | 'medium' | 'high'
```

---

## 🔄 Customer Segmentation Logic

```
Automatic segment assignment based on:

VIP Customer:
├─ total_spent > $1,000
└─ OR total_bookings > 10

Regular Customer:
├─ total_bookings > 5
└─ AND not VIP

New Customer:
├─ total_bookings ≤ 5
└─ AND not VIP/Regular

Inactive Customer:
└─ Last booking > 6 months ago
```

---

## 📈 Sample Queries

### Get Active Bookings for Today

```sql
SELECT 
  b.booking_number,
  b.start_time,
  b.status,
  c.full_name as customer,
  c.phone,
  g.name as game,
  g.duration_minutes
FROM bookings b
JOIN customers c ON b.customer_id = c.id
JOIN games g ON b.game_id = g.id
WHERE b.booking_date = CURRENT_DATE
  AND b.status NOT IN ('cancelled', 'completed')
ORDER BY b.start_time;
```

### Get VIP Customers with Stats

```sql
SELECT 
  full_name,
  email,
  phone,
  total_bookings,
  total_spent,
  segment,
  ROUND((total_spent / NULLIF(total_bookings, 0)), 2) as avg_booking_value
FROM customers
WHERE segment = 'vip'
  AND organization_id = '00000000-0000-0000-0000-000000000001'
ORDER BY total_spent DESC;
```

### Get Revenue for Last 30 Days

```sql
SELECT 
  booking_date,
  COUNT(*) as bookings,
  SUM(final_amount) as revenue,
  AVG(final_amount) as avg_value
FROM bookings
WHERE booking_date >= CURRENT_DATE - INTERVAL '30 days'
  AND payment_status = 'paid'
  AND status != 'cancelled'
GROUP BY booking_date
ORDER BY booking_date DESC;
```

### Get Unread Notifications

```sql
SELECT 
  type,
  priority,
  title,
  message,
  action_url,
  created_at
FROM notifications
WHERE user_id = auth.uid()
  AND is_read = false
ORDER BY 
  CASE priority
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 3
  END,
  created_at DESC;
```

---

## 🎯 Indexing Strategy

```
Performance-optimized indexes on:

✓ Foreign keys (organization_id, customer_id, game_id, etc.)
✓ Status fields (booking_status, payment_status, is_active)
✓ Date fields (booking_date, created_at)
✓ Email lookups (users.email, customers.email)
✓ Unique identifiers (booking_number, stripe IDs)
✓ Composite indexes (organization_id + date + status)
```

---

## 💾 Storage Estimates

```
Demo Data Size:
├─ Organizations:     1 row      ≈ 1 KB
├─ Users:             4 rows     ≈ 4 KB
├─ Games:             6 rows     ≈ 12 KB
├─ Customers:         10 rows    ≈ 10 KB
├─ Bookings:          14 rows    ≈ 28 KB
├─ Payments:          13 rows    ≈ 26 KB
├─ Notifications:     7 rows     ≈ 7 KB
└─ Total:                        ≈ 88 KB

Production Estimate (1 year):
├─ Bookings:          10,000     ≈ 20 MB
├─ Customers:         5,000      ≈ 5 MB
├─ Payments:          10,000     ≈ 20 MB
├─ Notifications:     50,000     ≈ 50 MB
└─ Total:                        ≈ 100 MB

Supabase Free Tier: 500 MB (plenty!)
```

---

**Last Updated**: November 5, 2025  
**Schema Version**: 1.0.0  
**Database**: PostgreSQL 15 via Supabase
