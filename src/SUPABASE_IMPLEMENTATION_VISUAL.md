# Supabase Implementation - Visual Guide 🎨

## 🗺️ Setup Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE SETUP WORKFLOW                    │
└─────────────────────────────────────────────────────────────┘

Step 1: Create Project
    │
    ├─→ Go to supabase.com
    ├─→ Click "New Project"
    ├─→ Enter name: bookingtms-demo
    ├─→ Choose region (closest to you)
    ├─→ Save database password! 🔑
    └─→ Wait 2-3 minutes ⏱️
         │
         ▼
Step 2: Get Credentials
    │
    ├─→ Settings → API
    ├─→ Copy Project URL
    ├─→ Copy Project ID
    ├─→ Copy anon/public key
    └─→ Copy service_role key (KEEP SECRET!)
         │
         ▼
Step 3: Run Schema Migration
    │
    ├─→ SQL Editor → New Query
    ├─→ Copy: /supabase/migrations/001_initial_schema.sql
    ├─→ Paste into editor
    ├─→ Click RUN ▶️
    └─→ Wait for "Success" ✅
         │
         ▼
Step 4: Create Auth Users ⚠️ CRITICAL!
    │
    ├─→ Authentication → Users → Add user
    ├─→ Email: superadmin@bookingtms.com
    ├─→ Password: demo123
    ├─→ Auto Confirm: ✅ YES
    ├─→ Copy User UID → SAVE IT!
    │
    ├─→ Repeat for:
    │   ├─→ admin@bookingtms.com
    │   ├─→ manager@bookingtms.com
    │   └─→ staff@bookingtms.com
    └─→ You now have 4 User UIDs
         │
         ▼
Step 5: Update Seed SQL
    │
    ├─→ Open: /supabase/migrations/002_seed_demo_data.sql
    ├─→ Find: INSERT INTO users (id, email...
    ├─→ Line ~75: Replace UUIDs with YOUR real UIDs
    └─→ Save file
         │
         ▼
Step 6: Run Seed Migration
    │
    ├─→ SQL Editor → New Query
    ├─→ Paste: 002_seed_demo_data.sql (with your UIDs!)
    ├─→ Click RUN ▶️
    └─→ See stats:
         Organizations: 1
         Users: 4
         Games: 6
         Customers: 10
         Bookings: 14
         Payments: 13
         Notifications: 7
         │
         ▼
Step 7: Configure App
    │
    ├─→ Create .env.local in project root
    ├─→ Add:
    │   SUPABASE_URL=https://xxxxx.supabase.co
    │   SUPABASE_ANON_KEY=eyJhb...
    │   SUPABASE_SERVICE_ROLE_KEY=eyJhb...
    └─→ Save file
         │
         ▼
Step 8: Test Connection ✅
    │
    ├─→ Restart dev server
    ├─→ Go to Backend Dashboard → Database tab
    ├─→ Click "Test Connection"
    └─→ See success message
         │
         ▼
Step 9: Login & Verify 🎉
    │
    ├─→ Login: superadmin@bookingtms.com / demo123
    ├─→ Check Dashboard (should show real data)
    ├─→ Check Bookings (14 bookings)
    ├─→ Check Customers (10 customers)
    └─→ Check Games (6 rooms)
         │
         ▼
    ✅ SETUP COMPLETE!
```

---

## 🏗️ Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│                    BOOKINGTMS ARCHITECTURE                      │
└────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│   Frontend      │
│  (React/Next)   │
│                 │
│  ┌───────────┐  │
│  │ Dashboard │  │
│  │ Bookings  │  │
│  │ Customers │  │
│  │ Games     │  │
│  └───────────┘  │
│        │        │
│        │ API    │
│        │ Calls  │
└────────┼────────┘
         │
         │ HTTPS (TLS 1.3)
         │ JWT Auth
         │
         ▼
┌─────────────────────────────────────────────────────┐
│              SUPABASE PLATFORM                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐      ┌──────────────┐            │
│  │   Auth       │      │  PostgREST   │            │
│  │              │◄─────┤   API        │            │
│  │ - JWT tokens │      │              │            │
│  │ - RLS        │      │ - Auto REST  │            │
│  │ - Policies   │      │ - GraphQL    │            │
│  └──────────────┘      └──────┬───────┘            │
│                                │                     │
│                                │                     │
│  ┌──────────────────────────────┼──────────────┐   │
│  │         PostgreSQL 15        │              │   │
│  ├──────────────────────────────┼──────────────┤   │
│  │                              ▼              │   │
│  │  Organizations         Users                │   │
│  │       │                  │                  │   │
│  │       ├─ Games           ├─ Notifications   │   │
│  │       ├─ Customers       └─ Settings        │   │
│  │       └─ Bookings                          │   │
│  │              │                               │   │
│  │              └─ Payments                     │   │
│  │                                              │   │
│  │  Row-Level Security (RLS) ✅                │   │
│  │  Foreign Keys ✅                            │   │
│  │  Triggers ✅                                │   │
│  │  Indexes ✅                                 │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────┐                                   │
│  │  Realtime    │  (Future: Live updates)           │
│  └──────────────┘                                   │
│                                                      │
│  ┌──────────────┐                                   │
│  │  Storage     │  (Future: Images, files)          │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
```

---

## 🔐 Security Layers

```
┌──────────────────────────────────────────────────────┐
│            SECURITY ARCHITECTURE                      │
└──────────────────────────────────────────────────────┘

Layer 1: Network Security
    │
    ├─→ HTTPS only (TLS 1.3)
    ├─→ Certificate verification
    └─→ Encrypted connections
         │
         ▼
Layer 2: Authentication
    │
    ├─→ Supabase Auth (JWT)
    ├─→ Email/Password
    ├─→ OAuth (Google, Facebook, GitHub)
    └─→ Token expiration & refresh
         │
         ▼
Layer 3: Row-Level Security (RLS)
    │
    ├─→ Multi-tenant isolation
    ├─→ Organization-based filtering
    ├─→ Role-based policies
    │   ├─→ Super Admin: Full access
    │   ├─→ Admin: Org access
    │   ├─→ Manager: Limited access
    │   └─→ Staff: Read-only
    └─→ Auto-enforced on all queries
         │
         ▼
Layer 4: API Keys
    │
    ├─→ anon key: Frontend (public)
    ├─→ service_role key: Backend (private)
    └─→ Environment variables (.env.local)
         │
         ▼
Layer 5: Data Validation
    │
    ├─→ Foreign key constraints
    ├─→ NOT NULL requirements
    ├─→ UNIQUE constraints
    ├─→ CHECK constraints
    └─→ Type validation (enums)
         │
         ▼
    ✅ Multi-layer security active
```

---

## 🔄 Data Flow Diagram

```
┌──────────────────────────────────────────────────────┐
│          BOOKING CREATION FLOW EXAMPLE               │
└──────────────────────────────────────────────────────┘

User Interface
    │
    │ 1. User fills booking form
    │
    ▼
Frontend Component (Bookings.tsx)
    │
    │ 2. Form validation
    │ 3. Data preparation
    │
    ▼
Supabase Client
    │
    │ 4. Create booking request
    │    await supabase.from('bookings').insert({
    │      customer_id,
    │      game_id,
    │      booking_date,
    │      ...
    │    })
    │
    ▼
Supabase Auth Layer
    │
    │ 5. Verify JWT token
    │ 6. Extract user_id
    │ 7. Check RLS policies
    │
    ▼
Row-Level Security Check
    │
    │ 8. Is user in same organization? ✅
    │ 9. Does user have 'bookings.create'? ✅
    │
    ▼
PostgreSQL Database
    │
    │ 10. Check foreign keys exist
    │     - customer_id valid? ✅
    │     - game_id valid? ✅
    │
    │ 11. Check game availability
    │     - call check_game_availability() ✅
    │
    │ 12. Generate booking number
    │     - call generate_booking_number() → BK-12345
    │
    │ 13. Insert booking record
    │
    ▼
Triggers Fire
    │
    │ 14. update_updated_at_column()
    │     - Set created_at = NOW()
    │
    │ 15. (Future) Send notification
    │
    ▼
Response to Frontend
    │
    │ 16. { data: { id, booking_number, ... } }
    │
    ▼
UI Update
    │
    │ 17. Show success toast
    │ 18. Refresh bookings list
    │ 19. Navigate to booking detail
    │
    ▼
✅ Booking created!
```

---

## 📊 Database Relationship Map

```
┌─────────────────────────────────────────────────────────┐
│            ENTITY RELATIONSHIP DIAGRAM                   │
└─────────────────────────────────────────────────────────┘

                    ┌────────────────┐
                    │ Organizations  │
                    │ (Multi-tenant) │
                    └───────┬────────┘
                            │
                ┌───────────┼───────────┬──────────┬────────┐
                │           │           │          │        │
                │           │           │          │        │
        ┌───────▼──┐  ┌────▼────┐  ┌──▼─────┐ ┌──▼────┐ ┌─▼──────┐
        │  Users   │  │  Games  │  │Customers│ │Bookings│ │Notifs  │
        │          │  │         │  │         │ │        │ │        │
        └────┬─────┘  └────┬────┘  └────┬────┘ └───┬────┘ └────────┘
             │             │              │          │
             │             │              │          │
             │ created_by  │ game_id      │ customer_│
             └─────────────┴──────────────┴──────────┤
                                                     │
                                              ┌──────▼─────┐
                                              │  Bookings  │
                                              │            │
                                              └──────┬─────┘
                                                     │
                                                     │ has
                                                     │
                                              ┌──────▼─────┐
                                              │  Payments  │
                                              │  (Stripe)  │
                                              └────────────┘

Relationships:
├─ Organizations (1) ──< (N) Users
├─ Organizations (1) ──< (N) Games
├─ Organizations (1) ──< (N) Customers
├─ Organizations (1) ──< (N) Bookings
├─ Users (1) ──< (N) Bookings (created_by)
├─ Games (1) ──< (N) Bookings
├─ Customers (1) ──< (N) Bookings
└─ Bookings (1) ──< (N) Payments
```

---

## 🎯 Migration Path (Phase 1 → Phase 2)

```
┌──────────────────────────────────────────────────────┐
│     LOCALSTORAGE → SUPABASE MIGRATION                │
└──────────────────────────────────────────────────────┘

BEFORE (Phase 1):                AFTER (Phase 2):

┌────────────┐                   ┌────────────┐
│ Component  │                   │ Component  │
└─────┬──────┘                   └─────┬──────┘
      │                                │
      │ useState                       │ useState
      │ useEffect                      │ useEffect
      ▼                                ▼
┌─────────────┐                  ┌────────────┐
│localStorage │                  │  Supabase  │
│  (Browser)  │                  │   Client   │
└─────────────┘                  └─────┬──────┘
      │                                │
      │ getItem('bookings')            │ .from('bookings')
      │ setItem('bookings')            │ .select()
      ▼                                │ .insert()
┌─────────────┐                  ▼
│   Memory    │                  ┌────────────┐
│  (Volatile) │                  │ PostgreSQL │
└─────────────┘                  │ (Persistent)│
                                 └────────────┘

❌ Data lost on refresh          ✅ Data persists
❌ No sharing across devices     ✅ Multi-device sync
❌ No collaboration              ✅ Real-time updates
❌ Limited capacity (5-10MB)     ✅ Unlimited storage
❌ No backup                     ✅ Auto-backup
❌ No validation                 ✅ Schema validation
```

---

## 🔍 Query Examples

### 1. Simple Query
```typescript
// Get all active games
const { data: games } = await supabase
  .from('games')
  .select('*')
  .eq('is_active', true)
  .order('name')

console.log(games)
// [
//   { id: '...', name: 'The Mysterious Library', ... },
//   { id: '...', name: 'Heist at the Museum', ... }
// ]
```

### 2. Join Query
```typescript
// Get bookings with customer and game details
const { data: bookings } = await supabase
  .from('bookings')
  .select(`
    *,
    customer:customers(full_name, email, phone),
    game:games(name, difficulty, duration_minutes),
    creator:users(full_name)
  `)
  .eq('booking_date', '2025-11-05')
  .order('start_time')

console.log(bookings)
// [
//   {
//     booking_number: 'BK-10006',
//     status: 'confirmed',
//     customer: { full_name: 'Daniel Brown', ... },
//     game: { name: 'The Mysterious Library', ... },
//     creator: { full_name: 'Sarah Anderson' }
//   }
// ]
```

### 3. Insert with Return
```typescript
// Create new booking
const { data: booking, error } = await supabase
  .from('bookings')
  .insert({
    booking_number: 'BK-' + Date.now(),
    customer_id: 'xxx',
    game_id: 'yyy',
    booking_date: '2025-11-10',
    start_time: '14:00',
    end_time: '15:30',
    party_size: 4,
    status: 'confirmed',
    total_amount: 120.00,
    final_amount: 120.00,
    payment_status: 'paid',
    created_by: userId
  })
  .select()
  .single()

if (error) {
  toast.error('Failed to create booking')
} else {
  toast.success(`Booking ${booking.booking_number} created!`)
}
```

### 4. Update
```typescript
// Update booking status
const { error } = await supabase
  .from('bookings')
  .update({ status: 'checked_in' })
  .eq('id', bookingId)

if (!error) {
  toast.success('Customer checked in!')
}
```

### 5. Delete
```typescript
// Cancel booking
const { error } = await supabase
  .from('bookings')
  .update({
    status: 'cancelled',
    payment_status: 'refunded'
  })
  .eq('id', bookingId)
```

---

## 📈 Performance Tips

```
┌──────────────────────────────────────────────────────┐
│          PERFORMANCE OPTIMIZATION                     │
└──────────────────────────────────────────────────────┘

1. Use Indexes (Already created ✅)
   ├─→ Foreign keys indexed
   ├─→ Status fields indexed
   ├─→ Date fields indexed
   └─→ Composite indexes for common queries

2. Select Only What You Need
   ❌ .select('*')  // Gets ALL columns
   ✅ .select('id, name, email')  // Gets only needed

3. Use Pagination
   ✅ .range(0, 9)  // First 10 records
   ✅ .limit(20)     // Max 20 records

4. Filter Early
   ✅ .eq('status', 'active')  // Filter at DB
   ❌ data.filter(x => x.status === 'active')  // Filter in JS

5. Use Views for Complex Queries
   ✅ .from('booking_summary').select('*')
   Better than joining 4 tables every time

6. Cache Results
   ✅ useState + useEffect
   ✅ React Query / SWR
   Avoid re-fetching same data

7. Use Realtime Subscriptions Sparingly
   ✅ For critical updates only
   ❌ Don't subscribe to everything

8. Batch Operations
   ✅ .insert([booking1, booking2, ...])
   Better than multiple single inserts
```

---

## 🎉 Success Checklist

```
Setup Complete When:

Database:
  [✓] Schema migration successful
  [✓] Seed data inserted
  [✓] All tables visible in Table Editor
  [✓] RLS policies active
  [✓] Triggers working
  [✓] Functions created

Auth:
  [✓] 4 users created in Supabase Auth
  [✓] Users can login
  [✓] JWT tokens generated
  [✓] Passwords work (demo123)

App Configuration:
  [✓] .env.local created
  [✓] SUPABASE_URL set
  [✓] SUPABASE_ANON_KEY set
  [✓] SUPABASE_SERVICE_ROLE_KEY set

Testing:
  [✓] Connection test passes
  [✓] Can query organizations table
  [✓] Can login with superadmin
  [✓] Dashboard shows real data
  [✓] Bookings page loads
  [✓] Customers page loads

Documentation:
  [✓] Setup guide read
  [✓] Quick card reviewed
  [✓] Schema diagram understood
  [✓] Ready for Phase 2
```

---

**You're all set! 🚀**

**Next**: Start migrating pages from localStorage to Supabase!

---

**Last Updated**: November 5, 2025  
**Status**: ✅ Production Ready
