# Supabase Integration Checklist

**Complete checklist for integrating Supabase with BookingTMS**

---

## 🎯 Overview

This checklist guides you through connecting your fully-functional frontend to Supabase backend. Follow the steps in order for a smooth integration.

**Estimated Time**: 2-4 hours  
**Difficulty**: Intermediate  
**Prerequisites**: Supabase account, Node.js 18+

---

## Phase 1: Initial Setup (30 minutes)

### ✅ 1.1 Supabase Project Creation

- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project
  - [ ] Project name: BookingTMS
  - [ ] Database password: Generated and saved securely
  - [ ] Region: Selected
- [ ] Wait for project initialization (2-3 minutes)
- [ ] Note project URL: `https://_____.supabase.co`

### ✅ 1.2 Get API Keys

Navigate to Settings → API:
- [ ] Copy **Project URL**
- [ ] Copy **anon/public key**
- [ ] Copy **service_role key** (keep secret!)

### ✅ 1.3 Environment Setup

- [ ] Create `.env.local` file in project root
- [ ] Add Supabase credentials:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  ```
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Restart dev server: `npm run dev`

### ✅ 1.4 Install Dependencies

```bash
npm install @supabase/supabase-js
```

**Files Created**:
- ✅ `/lib/supabase/client.ts` - Supabase client setup
- ✅ `/types/supabase.ts` - TypeScript types
- ✅ `/supabase/migrations/001_initial_schema.sql` - Database schema

---

## Phase 2: Database Setup (45 minutes)

### ✅ 2.1 Run Database Migration

**Option A: Via Supabase Dashboard (Recommended)**
- [ ] Go to SQL Editor in Supabase dashboard
- [ ] Create new query
- [ ] Copy contents of `/supabase/migrations/001_initial_schema.sql`
- [ ] Paste and run (Cmd/Ctrl + Enter)
- [ ] Verify "Success. No rows returned"

**Option B: Via Supabase CLI**
```bash
supabase link --project-ref your-project-ref
supabase db push
```

### ✅ 2.2 Verify Tables Created

Go to Database → Tables and confirm:
- [ ] `organizations` table exists
- [ ] `users` table exists  
- [ ] `games` table exists
- [ ] `customers` table exists
- [ ] `bookings` table exists
- [ ] `payments` table exists
- [ ] `notifications` table exists
- [ ] `notification_settings` table exists
- [ ] `stripe_webhook_events` table exists

### ✅ 2.3 Verify Indexes Created

Go to Database → Indexes and spot-check:
- [ ] `idx_bookings_organization`
- [ ] `idx_customers_email`
- [ ] `idx_users_organization`

### ✅ 2.4 Verify Row-Level Security (RLS)

Go to Authentication → Policies:
- [ ] All tables show "RLS enabled"
- [ ] Multiple policies listed per table

---

## Phase 3: Authentication Setup (45 minutes)

### ✅ 3.1 Configure Auth Settings

Go to Authentication → Settings:
- [ ] Set **Site URL**: `http://localhost:3000`
- [ ] Add **Redirect URLs**: `http://localhost:3000/**`
- [ ] Configure email settings:
  - [ ] Enable Email Auth
  - [ ] For dev: Disable "Enable email confirmations"
  - [ ] For prod: Keep enabled + configure SMTP

### ✅ 3.2 Create First Super Admin User

**Step 1: Create Auth User**
- [ ] Go to Authentication → Users
- [ ] Click "Add user"
- [ ] Email: `admin@yourdomain.com`
- [ ] Password: Create strong password
- [ ] Check "Auto Confirm User" (for dev)
- [ ] Click "Create user"
- [ ] **Copy the user ID** (you'll need it next)

**Step 2: Add User Profile**
- [ ] Go to SQL Editor
- [ ] Run this query (replace `USER_ID_HERE`):
  ```sql
  INSERT INTO users (
    id,
    email,
    full_name,
    role,
    organization_id
  )
  VALUES (
    'USER_ID_HERE', -- Replace with actual ID
    'admin@yourdomain.com',
    'Super Admin',
    'super-admin',
    '00000000-0000-0000-0000-000000000001'
  );
  ```
- [ ] Verify success

### ✅ 3.3 Test Authentication

Create test file `test-auth.ts`:
```typescript
import { supabase } from './lib/supabase/client';

async function testAuth() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@yourdomain.com',
    password: 'your-password'
  });

  if (error) {
    console.error('❌ Auth failed:', error);
  } else {
    console.log('✅ Auth successful!');
    console.log('User:', data.user?.email);
  }
}

testAuth();
```

Run test:
```bash
npx tsx test-auth.ts
```

- [ ] Authentication successful
- [ ] User details returned
- [ ] No errors

---

## Phase 4: Connect Frontend (1-2 hours)

### ✅ 4.1 Update AuthContext

**Option A: Replace Entirely (Recommended)**
- [ ] Backup current: `cp lib/auth/AuthContext.tsx lib/auth/AuthContext.backup.tsx`
- [ ] Rename Supabase version: `mv lib/auth/AuthContext.supabase.tsx lib/auth/AuthContext.tsx`

**Option B: Merge Manually**
- [ ] Review `/lib/auth/AuthContext.supabase.tsx`
- [ ] Copy integration code to existing AuthContext
- [ ] Test thoroughly

### ✅ 4.2 Update App.tsx

Add Supabase session check:
```tsx
import { useEffect } from 'react';
import { supabase } from './lib/supabase/client';

function App() {
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ... rest of app
}
```

- [ ] Session detection working
- [ ] Auth state changes detected

### ✅ 4.3 Test Login Flow

- [ ] Navigate to app
- [ ] See login screen (if not authenticated)
- [ ] Enter credentials
- [ ] Successfully logs in
- [ ] User data loads
- [ ] Session persists on refresh

### ✅ 4.4 Test RBAC Integration

- [ ] User role displayed correctly
- [ ] Sidebar shows appropriate menu items
- [ ] Restricted pages blocked for non-admin
- [ ] Account Settings visible to super-admin only

---

## Phase 5: Data Integration (varies)

### ✅ 5.1 Add Sample Data

Run in SQL Editor:
```sql
-- Sample Games
INSERT INTO games (organization_id, name, description, difficulty, duration_minutes, min_players, max_players, price)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'The Haunted Manor', 'Escape from a spooky mansion', 'medium', 60, 2, 6, 45.00),
  ('00000000-0000-0000-0000-000000000001', 'Bank Heist', 'Pull off the perfect robbery', 'hard', 75, 4, 8, 55.00),
  ('00000000-0000-0000-0000-000000000001', 'Prison Break', 'Escape before time runs out', 'expert', 90, 3, 6, 65.00);

-- Sample Customer
INSERT INTO customers (organization_id, email, full_name, phone)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'john@example.com', 'John Doe', '+1234567890');
```

- [ ] Sample data inserted successfully
- [ ] No constraint violations

### ✅ 5.2 Connect Dashboard Page

Update `/pages/Dashboard.tsx`:
```tsx
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function loadStats() {
      if (!currentUser?.organizationId) return;

      // Fetch real data from Supabase
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('organization_id', currentUser.organizationId)
        .gte('booking_date', new Date().toISOString());

      // Process and set stats
      setStats({ totalBookings: bookings?.length || 0 });
    }

    loadStats();
  }, [currentUser]);

  // ... render
}
```

- [ ] Dashboard loads real data
- [ ] No RLS violations
- [ ] Loading states work

### ✅ 5.3 Connect Games Page

Update `/pages/Games.tsx` to fetch from Supabase:
```tsx
const { data: games, error } = await supabase
  .from('games')
  .select('*')
  .eq('organization_id', currentUser.organizationId)
  .order('created_at', { ascending: false });
```

- [ ] Games list loads
- [ ] Can create new game
- [ ] Can edit game
- [ ] Can delete game

### ✅ 5.4 Connect Customers Page

Similar integration for Customers:
- [ ] Customers list loads
- [ ] Can add customer
- [ ] Can edit customer
- [ ] Can delete customer (with permission check)

### ✅ 5.5 Connect Bookings Page

- [ ] Bookings list loads
- [ ] Can create booking
- [ ] Can update booking
- [ ] Can cancel booking
- [ ] Related customer and game data loads

---

## Phase 6: Real-Time Features (30 minutes)

### ✅ 6.1 Implement Real-Time Bookings

Add to bookings page:
```tsx
useEffect(() => {
  const channel = supabase
    .channel('bookings')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `organization_id=eq.${currentUser.organizationId}`,
      },
      (payload) => {
        console.log('Booking changed:', payload);
        // Refresh bookings list
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [currentUser]);
```

- [ ] Real-time updates working
- [ ] New bookings appear automatically
- [ ] Updates reflect immediately

### ✅ 6.2 Implement Real-Time Notifications

Connect NotificationContext to Supabase:
- [ ] Fetch notifications from database
- [ ] Subscribe to new notifications
- [ ] Mark as read updates database
- [ ] Delete removes from database

---

## Phase 7: Testing & Validation (30 minutes)

### ✅ 7.1 Functionality Tests

- [ ] **Authentication**
  - [ ] Login works
  - [ ] Logout works
  - [ ] Session persists
  - [ ] Auto-refresh token works

- [ ] **RBAC**
  - [ ] Super admin sees all features
  - [ ] Admin sees operational features
  - [ ] Manager has limited access
  - [ ] Staff is read-only

- [ ] **CRUD Operations**
  - [ ] Games: Create, Read, Update, Delete
  - [ ] Customers: Create, Read, Update, Delete
  - [ ] Bookings: Create, Read, Update, Cancel
  - [ ] Users: Create, Read, Update, Delete (super-admin only)

- [ ] **Data Integrity**
  - [ ] RLS prevents unauthorized access
  - [ ] Foreign key constraints work
  - [ ] Unique constraints enforced
  - [ ] Triggers execute (updated_at, etc.)

### ✅ 7.2 Performance Tests

- [ ] Dashboard loads in < 2 seconds
- [ ] Lists load quickly (even with 100+ items)
- [ ] No N+1 query issues
- [ ] Real-time updates are instant

### ✅ 7.3 Security Tests

- [ ] Unauthenticated users blocked
- [ ] Wrong organization data not accessible
- [ ] Service role key not exposed in frontend
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (React escaping)

---

## Phase 8: Production Preparation (varies)

### ✅ 8.1 Environment Variables

Create `.env.production`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key
```

- [ ] Production Supabase project created
- [ ] Separate from development
- [ ] Keys stored securely

### ✅ 8.2 Database Backup

- [ ] Enable daily backups in Supabase
- [ ] Test restore process
- [ ] Document backup procedures

### ✅ 8.3 Monitoring Setup

- [ ] Enable Supabase monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure alerts for downtime

### ✅ 8.4 Email Configuration

For production email confirmations:
- [ ] Configure custom SMTP in Supabase
- [ ] Or use SendGrid integration
- [ ] Test email delivery
- [ ] Customize email templates

---

## 🎯 Success Criteria

You've successfully integrated Supabase when:

- [x] All database tables created with proper schema
- [x] Authentication works end-to-end
- [x] RBAC permissions enforced
- [x] All CRUD operations working
- [x] Real-time updates functioning
- [x] No RLS violations
- [x] Performance is acceptable
- [x] Security measures in place
- [x] Production environment configured

---

## 🐛 Common Issues

### "relation does not exist"
- **Cause**: Migration didn't run
- **Fix**: Run migration in SQL Editor

### "row-level security policy violation"
- **Cause**: User not authenticated or wrong organization
- **Fix**: Check session and organization_id

### "auth session not found"
- **Cause**: Session expired or not initialized
- **Fix**: Implement session refresh logic

### "permission denied for table"
- **Cause**: Using anon key for service role operations
- **Fix**: Use service role client for admin operations

---

## 📚 Next Steps

After integration is complete:

1. **Stripe Integration** - See `/PRD_BOOKINGTMS_ENTERPRISE.md` Section 6
2. **Email/SMS Notifications** - Integrate SendGrid and Twilio
3. **Real-Time Dashboard** - Add WebSocket updates everywhere
4. **Advanced Analytics** - Implement reporting queries
5. **Multi-Tenancy** - Add organization switching
6. **API Marketplace** - Build public APIs

---

## 🔗 Resources

- **Setup Guide**: `/SUPABASE_SETUP_GUIDE.md`
- **PRD**: `/PRD_BOOKINGTMS_ENTERPRISE.md`
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **RLS Guide**: [supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Status**: Ready to Integrate  
**Last Updated**: November 3, 2025  
**Estimated Completion**: 2-4 hours

Good luck! 🚀
