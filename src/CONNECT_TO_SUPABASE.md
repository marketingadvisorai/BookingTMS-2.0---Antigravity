# Connect BookingTMS to Supabase - Complete Guide

**🎯 Your app is now ready to connect to Supabase!**

This guide will walk you through connecting your fully-functional frontend to a Supabase backend in **5 simple steps**.

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Supabase Package

```bash
npm install @supabase/supabase-js
```

### Step 2: Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: BookingTMS
   - **Database Password**: Generate and save securely
   - **Region**: Choose nearest to your users
4. Click **"Create new project"**
5. Wait 2-3 minutes for initialization

### Step 3: Get Your API Keys

In Supabase dashboard, go to **Settings → API**:

```
Project URL:     https://your-project.supabase.co
anon/public key: eyJ...
service_role key: eyJ... (keep this secret!)
```

### Step 4: Create `.env.local` File

Create a file named `.env.local` in your project root:

```bash
# Copy from .env.local.example
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Important**: Replace the placeholder values with your actual keys from Step 3.

### Step 5: Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Open `/supabase/migrations/001_initial_schema.sql` from your project
4. Copy the entire file
5. Paste into SQL Editor
6. Click **"Run"** (or press Cmd+Enter)
7. Wait for "Success. No rows returned"

### Step 6: Create Your First User

**6a. Create Auth User**:
1. In Supabase dashboard, go to **Authentication → Users**
2. Click **"Add user"**
3. Fill in:
   - Email: `admin@yourdomain.com`
   - Password: `YourStrongPassword123!`
   - ✅ Check "Auto Confirm User"
4. Click **"Create user"**
5. **Copy the user ID** from the users table

**6b. Create User Profile**:
1. Go back to **SQL Editor**
2. Run this query (replace `USER_ID_HERE` with the ID you copied):

```sql
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  organization_id
)
VALUES (
  'USER_ID_HERE', -- Replace with actual user ID
  'admin@yourdomain.com',
  'Super Admin',
  'super-admin',
  '00000000-0000-0000-0000-000000000001'
);
```

### Step 7: Start Your App!

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:3000`

**You're now connected to Supabase!** 🎉

---

## ✅ What Just Happened?

Your app now:
- ✅ Connects to Supabase PostgreSQL database
- ✅ Uses real authentication (Supabase Auth)
- ✅ Has Row-Level Security (RLS) enabled
- ✅ Supports real-time updates (WebSocket)
- ✅ Has full multi-tenant architecture
- ✅ **Still works with mock data** if Supabase is not configured

---

## 🔄 How It Works

### Hybrid Mode (Smart Fallback)

The updated `AuthContext.tsx` now works in **hybrid mode**:

```typescript
// If Supabase is configured (.env.local has keys):
✅ Uses real Supabase authentication
✅ Fetches data from PostgreSQL
✅ Real-time updates via WebSocket
✅ Row-Level Security enforced

// If Supabase is NOT configured:
✅ Falls back to mock data
✅ Uses localStorage
✅ All features still work
✅ Perfect for development
```

This means:
- **No breaking changes** - Your app works with or without Supabase
- **Gradual migration** - Connect when ready
- **Easy development** - Test without database
- **Production ready** - Full Supabase when deployed

---

## 📊 Using Supabase in Your Pages

### Example 1: Fetch Bookings

```typescript
// In your component
import { useBookings } from '@/lib/supabase/hooks';

export default function BookingsPage() {
  const { bookings, isLoading, error } = useBookings();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Bookings ({bookings.length})</h1>
      {bookings.map(booking => (
        <div key={booking.id}>
          {booking.booking_number} - {booking.customer.full_name}
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Fetch Dashboard Stats

```typescript
import { useDashboardStats } from '@/lib/supabase/hooks';

export default function Dashboard() {
  const { stats, isLoading } = useDashboardStats();

  return (
    <div>
      <KPICard
        title="Total Revenue"
        value={`$${stats.totalRevenue.toLocaleString()}`}
      />
      <KPICard
        title="Total Bookings"
        value={stats.totalBookings}
      />
    </div>
  );
}
```

### Example 3: Create a Booking

```typescript
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';

const handleCreateBooking = async (bookingData) => {
  const { currentUser } = useAuth();
  
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      organization_id: currentUser.organizationId,
      booking_number: generateBookingNumber(),
      customer_id: bookingData.customerId,
      game_id: bookingData.gameId,
      booking_date: bookingData.date,
      start_time: bookingData.time,
      party_size: bookingData.partySize,
      total_amount: bookingData.amount,
      final_amount: bookingData.amount,
      created_by: currentUser.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    throw error;
  }

  return data;
};
```

### Example 4: Real-Time Updates

```typescript
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

useEffect(() => {
  // Subscribe to new bookings
  const channel = supabase
    .channel('bookings')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `organization_id=eq.${currentUser.organizationId}`,
      },
      (payload) => {
        console.log('New booking created!', payload.new);
        // Update your UI
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## 🎯 Available Custom Hooks

We've created ready-to-use hooks for you:

### `/lib/supabase/hooks.ts`

- **`useBookings()`** - Fetch bookings with real-time updates
- **`useGames()`** - Fetch games/rooms
- **`useCustomers()`** - Fetch customers
- **`useDashboardStats()`** - Fetch dashboard statistics
- **`useNotificationsData()`** - Fetch notifications with real-time

Each hook returns:
```typescript
{
  data: T[],          // Your data
  isLoading: boolean, // Loading state
  error: string | null, // Error message
  refetch: () => void // Manual refresh function
}
```

---

## 🔐 Authentication Flow

### Login

```typescript
import { useAuth } from '@/lib/auth/AuthContext';

function LoginPage() {
  const { login } = useAuth();

  const handleLogin = async (email, password) => {
    try {
      await login(email, password);
      // User is now logged in
      // AuthContext automatically loads user profile
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
}
```

### Check Current User

```typescript
import { useAuth } from '@/lib/auth/AuthContext';

function MyComponent() {
  const { currentUser, hasPermission, isRole } = useAuth();

  if (!currentUser) {
    return <div>Please log in</div>;
  }

  const canEdit = hasPermission('bookings.edit');
  const isSuperAdmin = isRole('super-admin');

  return (
    <div>
      <h1>Welcome, {currentUser.name}!</h1>
      {canEdit && <button>Edit Booking</button>}
      {isSuperAdmin && <button>Manage Users</button>}
    </div>
  );
}
```

### Logout

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // User is now logged out
};
```

---

## 📝 Add Sample Data (Optional)

To populate your database with test data, run this in **SQL Editor**:

```sql
-- Sample Games
INSERT INTO games (organization_id, name, description, difficulty, duration_minutes, min_players, max_players, price)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'The Haunted Manor', 'Escape from a spooky Victorian mansion before the clock strikes midnight', 'medium', 60, 2, 6, 45.00),
  ('00000000-0000-0000-0000-000000000001', 'Bank Heist', 'Pull off the perfect robbery and escape with the loot', 'hard', 75, 4, 8, 55.00),
  ('00000000-0000-0000-0000-000000000001', 'Prison Break', 'Break out of maximum security before the guards return', 'expert', 90, 3, 6, 65.00),
  ('00000000-0000-0000-0000-000000000001', 'Lost Temple', 'Navigate ancient ruins and recover the sacred artifact', 'easy', 60, 2, 8, 40.00);

-- Sample Customers
INSERT INTO customers (organization_id, email, full_name, phone, segment)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'john.doe@example.com', 'John Doe', '+1-555-0101', 'regular'),
  ('00000000-0000-0000-0000-000000000001', 'jane.smith@example.com', 'Jane Smith', '+1-555-0102', 'vip'),
  ('00000000-0000-0000-0000-000000000001', 'bob.johnson@example.com', 'Bob Johnson', '+1-555-0103', 'new'),
  ('00000000-0000-0000-0000-000000000001', 'alice.williams@example.com', 'Alice Williams', '+1-555-0104', 'regular');

-- Sample Bookings
INSERT INTO bookings (
  organization_id, 
  booking_number, 
  customer_id, 
  game_id, 
  booking_date, 
  start_time, 
  end_time, 
  party_size, 
  status, 
  total_amount, 
  final_amount, 
  payment_status, 
  created_by
)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  'BK-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0'),
  c.id,
  g.id,
  CURRENT_DATE + (FLOOR(RANDOM() * 30)::INT),
  '18:00',
  '19:00',
  4,
  'confirmed',
  g.price,
  g.price,
  'paid',
  (SELECT id FROM users LIMIT 1)
FROM customers c, games g
WHERE c.organization_id = '00000000-0000-0000-0000-000000000001'
  AND g.organization_id = '00000000-0000-0000-0000-000000000001'
LIMIT 20;
```

---

## 🔍 Verify Everything Works

### Test Checklist

- [ ] **App starts without errors**: `npm run dev`
- [ ] **Console shows "✅ Supabase connected"**
- [ ] **Login works** with your created credentials
- [ ] **Dashboard shows real data** (if sample data added)
- [ ] **User profile loads** correctly
- [ ] **Navigation works** based on user role
- [ ] **No console errors** related to Supabase

### Test Real-Time Updates

1. Open your app in two browser windows
2. Create a booking in one window
3. Watch it appear in the other window instantly
4. **That's real-time!** 🎉

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

**Solution**: 
- Check `.env.local` exists in project root
- Verify variable names are exact: `NEXT_PUBLIC_SUPABASE_URL`
- Restart dev server: Stop (Ctrl+C) and `npm run dev`

### "relation 'public.users' does not exist"

**Solution**:
- Migration didn't run successfully
- Go to SQL Editor and run migration again
- Check for syntax errors in output

### "row-level security policy violation"

**Solution**:
- You're not authenticated
- Make sure you're logged in
- Check user has correct `organization_id`
- Verify RLS policies in Supabase dashboard

### "App still uses mock data after setup"

**Solution**:
- Clear browser console and refresh
- Check console for "✅ Supabase connected" message
- If you see "📦 Supabase not configured", check `.env.local`
- Verify environment variables loaded (restart server)

### "Auth session not persisting"

**Solution**:
- Check browser allows cookies
- Clear localStorage: `localStorage.clear()` in console
- Try incognito/private window
- Check Supabase Auth settings (Site URL, Redirect URLs)

---

## 📚 Next Steps

Now that you're connected, you can:

### 1. Update Existing Pages

Connect your existing pages to real data:

- **Dashboard** → Use `useDashboardStats()`
- **Bookings** → Use `useBookings()`
- **Games** → Use `useGames()`
- **Customers** → Use `useCustomers()`
- **Notifications** → Use `useNotificationsData()`

### 2. Integrate Stripe Payments

Follow the complete guide in:
- `/PRD_BOOKINGTMS_ENTERPRISE.md` Section 6 (Stripe Integration)
- Covers: Setup, Payment Intents, Webhooks, Refunds, Security

### 3. Add Email/SMS Notifications

Integrate SendGrid and Twilio:
- Email: SendGrid API
- SMS: Twilio API
- See PRD Section 7 for complete guide

### 4. Deploy to Production

1. Create production Supabase project
2. Run migration on production
3. Update environment variables
4. Deploy to Vercel
5. Monitor and optimize

---

## 📖 Documentation Reference

- **Quick Start**: `/SUPABASE_QUICK_START.md` (5 min setup)
- **Complete Guide**: `/SUPABASE_SETUP_GUIDE.md` (30 pages)
- **Integration Checklist**: `/SUPABASE_INTEGRATION_CHECKLIST.md`
- **Summary**: `/SUPABASE_INTEGRATION_SUMMARY.md`
- **PRD**: `/PRD_BOOKINGTMS_ENTERPRISE.md`
- **Guidelines**: `/guidelines/Guidelines.md`

---

## 🎉 Congratulations!

You've successfully connected BookingTMS to Supabase! You now have:

- ✅ Real PostgreSQL database
- ✅ Secure authentication (Supabase Auth)
- ✅ Row-Level Security (multi-tenant)
- ✅ Real-time updates (WebSocket)
- ✅ Type-safe client (TypeScript)
- ✅ Production-ready backend

**Your app is now a full-stack SaaS platform!** 🚀

---

**Questions?** Check the troubleshooting section or refer to the detailed setup guides.

**Status**: ✅ Ready to Connect  
**Last Updated**: November 3, 2025  
**Estimated Time**: 5-10 minutes

**Let's build something amazing!** 💙
