# Supabase Database Setup Guide - BookingTMS

## 📋 Overview

This guide will help you set up a complete Supabase database with demo data for BookingTMS.

**What You'll Get:**
- ✅ Complete database schema (organizations, users, games, customers, bookings, payments, notifications)
- ✅ Row-Level Security (RLS) policies for multi-tenant architecture
- ✅ Demo data for testing (14 bookings, 10 customers, 6 escape rooms, 4 users)
- ✅ Automated triggers for stats updates
- ✅ Helper functions for booking management
- ✅ Pre-configured views for reporting

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project Name**: `bookingtms-demo` (or your choice)
   - **Database Password**: Save this! You'll need it
   - **Region**: Choose closest to you
   - **Plan**: Free tier works perfectly
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

### Step 2: Get Your Project Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Project ID** (the `xxxxx` part)
   - **anon/public** key
   - **service_role** key (keep this SECRET!)

### Step 3: Run Database Migrations

**Option A: Using Supabase Dashboard (Easiest)**

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `/supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL Editor
5. Click **RUN** (bottom right)
6. Wait for "Success" message

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_ID

# Run migrations
supabase db push
```

### Step 4: Create Auth Users (CRITICAL!)

Before running the seed data, you MUST create the auth users:

1. In Supabase Dashboard, go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Create 4 users with these EXACT details:

**User 1: Super Admin**
- Email: `superadmin@bookingtms.com`
- Password: `demo123`
- Auto Confirm Email: ✅ YES
- **After creation, copy the User UID**
- It should be in format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**User 2: Admin**
- Email: `admin@bookingtms.com`
- Password: `demo123`
- Auto Confirm Email: ✅ YES
- **Copy the User UID**

**User 3: Manager**
- Email: `manager@bookingtms.com`
- Password: `demo123`
- Auto Confirm Email: ✅ YES
- **Copy the User UID**

**User 4: Staff**
- Email: `staff@bookingtms.com`
- Password: `demo123`
- Auto Confirm Email: ✅ YES
- **Copy the User UID**

### Step 5: Update Seed Data with User UIDs

1. Open `/supabase/migrations/002_seed_demo_data.sql`
2. Find the `USERS TABLE` section (around line 75)
3. Replace the UUIDs with your ACTUAL user UIDs from Step 4:

```sql
INSERT INTO users (id, email, full_name, role, organization_id, phone, is_active, last_login_at) 
VALUES 
  (
    'YOUR_SUPERADMIN_UID_HERE',  -- ← Replace this
    'superadmin@bookingtms.com',
    'Sarah Anderson',
    'super-admin',
    '00000000-0000-0000-0000-000000000001',
    '+1 (555) 100-0001',
    true,
    NOW() - INTERVAL '2 hours'
  ),
  -- ... repeat for other 3 users
```

### Step 6: Run Seed Data

1. Go back to **SQL Editor** in Supabase
2. Click "New query"
3. Copy the UPDATED `/supabase/migrations/002_seed_demo_data.sql` (with your UIDs)
4. Paste and click **RUN**
5. You should see a success message with stats:

```
========================================
BOOKINGTMS DEMO DATA SEED COMPLETE
========================================
Organizations: 1
Users: 4
Games/Rooms: 6
Customers: 10
Bookings: 14
Payments: 13
Notifications: 7
========================================
```

### Step 7: Configure Your App

1. Create `.env.local` file in your project root:

```env
# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database (optional, for direct access)
SUPABASE_DB_URL=postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_ID.supabase.co:5432/postgres
```

2. Replace:
   - `YOUR_PROJECT_ID` with your project ID
   - `your_anon_public_key_here` with your anon key
   - `your_service_role_key_here` with your service role key
   - `[YOUR-PASSWORD]` with your database password

### Step 8: Test Connection

Run the connection test script:

```bash
npm run test:supabase
```

Or manually test in your app:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Test query
const { data, error } = await supabase
  .from('organizations')
  .select('*')
  .single()

console.log('Organization:', data)
```

---

## ✅ Verify Setup

### Check Data in Supabase Dashboard

1. **Organizations**: Go to **Table Editor** → `organizations`
   - You should see "BookingTMS Escape Rooms"

2. **Users**: Go to **Table Editor** → `users`
   - You should see 4 users (Sarah Anderson, Michael Chen, Emily Rodriguez, David Thompson)

3. **Games**: Go to **Table Editor** → `games`
   - You should see 6 escape rooms (Mysterious Library, Heist at Museum, Escape from Alcatraz, etc.)

4. **Customers**: Go to **Table Editor** → `customers`
   - You should see 10 customers with different segments (VIP, Regular, New, Inactive)

5. **Bookings**: Go to **Table Editor** → `bookings`
   - You should see 14 bookings with dates ranging from past to future

6. **Payments**: Go to **Table Editor** → `payments`
   - You should see 13 payment records

### Test in Your App

Login with any of the demo accounts:

```
Super Admin:
- Email: superadmin@bookingtms.com
- Password: demo123

Admin:
- Email: admin@bookingtms.com
- Password: demo123

Manager:
- Email: manager@bookingtms.com
- Password: demo123

Staff:
- Email: staff@bookingtms.com
- Password: demo123
```

You should see:
- ✅ Dashboard with real booking data
- ✅ 14 bookings in the Bookings page
- ✅ 10 customers in the Customers page
- ✅ 6 games in the Games page
- ✅ Notifications in the notification center

---

## 📊 What's Included in Demo Data

### 1 Organization
- **BookingTMS Escape Rooms** (Pro plan)
- Configured business hours, timezone, and booking settings

### 4 Users
- **Sarah Anderson** (Super Admin) - Full system access
- **Michael Chen** (Admin) - Operational management
- **Emily Rodriguez** (Manager) - View and limited editing
- **David Thompson** (Staff) - Basic access

### 6 Escape Rooms
1. **The Mysterious Library** (Easy, 60 min, $120)
2. **Heist at the Museum** (Medium, 75 min, $150)
3. **Escape from Alcatraz** (Hard, 90 min, $180)
4. **Murder Mystery Manor** (Medium, 60 min, $130)
5. **The Lost Temple** (Expert, 90 min, $200)
6. **Zombie Apocalypse** (Medium, 60 min, $140)

### 10 Customers
- 2 VIP customers (high spend: Jessica Martinez, Robert Williams)
- 3 Regular customers (repeat visitors)
- 4 New customers (1-3 bookings)
- 1 Inactive customer (for re-engagement testing)

### 14 Bookings
- **5 Completed** (past dates, paid)
- **2 Checked In** (happening now)
- **5 Confirmed** (upcoming, paid)
- **1 Pending** (awaiting payment)
- **1 Cancelled** (refunded)

Booking distribution:
- Past: 5 bookings (30 days ago to 5 days ago)
- Today: 2 bookings (1 checked in, 1 confirmed)
- Tomorrow: 2 bookings
- This week: 3 bookings
- Next week: 1 pending, 1 cancelled

### 13 Payments
- 12 successful payments (Visa, Mastercard, Amex)
- 1 refund (for cancelled booking)

### 7 Notifications
- 3 Unread (new booking, payment received, check-in)
- 4 Read (cancellation, message, staff reminder, system update)

---

## 🔒 Security Features

### Row-Level Security (RLS)

All tables have RLS enabled with proper policies:

1. **Multi-tenant isolation**: Users can only see data from their organization
2. **Role-based permissions**: Different access levels for Super Admin, Admin, Manager, Staff
3. **Service role access**: Backend functions can bypass RLS for system operations

### Automated Features

1. **Auto-update timestamps**: `updated_at` automatically updates on row changes
2. **Customer stats**: `total_bookings` and `total_spent` auto-calculate from bookings
3. **Customer segmentation**: Automatic VIP/Regular/New classification based on spend
4. **Notification settings**: Auto-created when new user is added
5. **Booking number generation**: Unique BK-##### numbers auto-generated

---

## 🛠️ Useful Database Functions

### Check Game Availability

```sql
SELECT check_game_availability(
  'game_id_here',
  '2025-11-10'::DATE,
  '14:00'::TIME,
  '15:30'::TIME
);
-- Returns: true (available) or false (booked)
```

### Generate Booking Number

```sql
SELECT generate_booking_number();
-- Returns: 'BK-12345'
```

### View Booking Summary

```sql
SELECT * FROM booking_summary
WHERE booking_date = CURRENT_DATE
ORDER BY start_time;
```

### View Daily Revenue

```sql
SELECT * FROM daily_revenue
WHERE booking_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY booking_date DESC;
```

---

## 🐛 Troubleshooting

### Error: "Users table insert failed"

**Cause**: Auth users not created first

**Solution**: 
1. Create all 4 users in Supabase Auth (Step 4)
2. Copy their UIDs
3. Update the seed SQL with real UIDs (Step 5)
4. Re-run seed migration

### Error: "Permission denied for table users"

**Cause**: Using anon key instead of service role key

**Solution**: Use service_role key for backend operations

### Error: "Foreign key constraint violation"

**Cause**: Running seeds in wrong order or missing data

**Solution**: 
1. Run `001_initial_schema.sql` FIRST
2. Create auth users
3. Run `002_seed_demo_data.sql` LAST

### No data showing in app

**Cause**: App not connected to Supabase or wrong credentials

**Solution**:
1. Check `.env.local` has correct values
2. Restart your dev server
3. Verify connection in Backend Dashboard → Database tab

---

## 🔄 Reset Database (Start Fresh)

If you need to reset everything:

### Option 1: Dashboard

1. Go to **SQL Editor**
2. Run this query:

```sql
-- Drop all tables (CASCADE removes dependencies)
DROP TABLE IF EXISTS stripe_webhook_events CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS notification_settings CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Drop types
DROP TYPE IF EXISTS notification_priority CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS organization_plan CASCADE;
DROP TYPE IF EXISTS difficulty_level CASCADE;
DROP TYPE IF EXISTS customer_segment CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS generate_booking_number CASCADE;
DROP FUNCTION IF EXISTS check_game_availability CASCADE;
DROP FUNCTION IF EXISTS update_customer_stats CASCADE;
DROP FUNCTION IF EXISTS create_notification_settings_for_user CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Drop views
DROP VIEW IF EXISTS booking_summary CASCADE;
DROP VIEW IF EXISTS daily_revenue CASCADE;
```

3. Re-run migrations (Step 3-6 above)

### Option 2: Delete and Recreate Project

1. Go to **Settings** → **General**
2. Scroll to bottom
3. Click "Delete Project"
4. Start from Step 1

---

## 📈 Next Steps

After setting up the database:

1. **Integrate with Frontend**: Update all page components to use Supabase instead of localStorage
2. **Test CRUD Operations**: Try creating/editing/deleting bookings, customers, games
3. **Test RBAC**: Login with different roles and verify permissions
4. **Add Real Stripe**: Replace demo payment IDs with real Stripe integration
5. **Deploy**: Follow deployment guide in `/PRD_BOOKINGTMS_ENTERPRISE.md`

---

## 📚 Related Documentation

- **Database Schema**: `/supabase/migrations/001_initial_schema.sql`
- **Seed Data**: `/supabase/migrations/002_seed_demo_data.sql`
- **Connection Guide**: `/DATABASE_CONNECTION_GUIDE.md`
- **Master Guide**: `/TRAE_AI_BUILDER_MASTER_GUIDE.md`
- **PRD**: `/PRD_BOOKINGTMS_ENTERPRISE.md`

---

## 🆘 Need Help?

1. **Check Supabase Logs**: Dashboard → Logs → Query logs
2. **Test Connection**: Use Backend Dashboard → Database tab
3. **Review Errors**: Check browser console and network tab
4. **Ask in Discord**: Supabase has active community support

---

**Setup Complete!** 🎉

You now have a fully functional Supabase database with realistic demo data for BookingTMS.

**Login and test**: `superadmin@bookingtms.com` / `demo123`
