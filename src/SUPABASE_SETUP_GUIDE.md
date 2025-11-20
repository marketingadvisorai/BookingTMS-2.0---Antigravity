# Supabase Setup Guide for BookingTMS

**Complete guide to setting up and connecting Supabase with BookingTMS**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Migration](#database-migration)
5. [Authentication Setup](#authentication-setup)
6. [Testing the Connection](#testing-the-connection)
7. [Next Steps](#next-steps)
8. [Troubleshooting](#troubleshooting)

---

## 1. Prerequisites

Before starting, ensure you have:

- [ ] Supabase account (sign up at [supabase.com](https://supabase.com))
- [ ] Node.js 18+ installed
- [ ] Supabase CLI installed (optional but recommended)

### Install Supabase CLI (Optional)

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (via npm)
npm install -g supabase

# Verify installation
supabase --version
```

---

## 2. Supabase Project Setup

### Step 1: Create a New Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: BookingTMS (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely!)
   - **Region**: Select closest to your users
   - **Plan**: Start with Free tier
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

### Step 2: Get Your API Keys

Once the project is ready:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values (you'll need them for environment variables):
   - **Project URL**: `https://your-project.supabase.co`
   - **anon/public key**: Starts with `eyJ...`
   - **service_role key**: Starts with `eyJ...` (keep this secret!)

---

## 3. Environment Configuration

### Step 1: Create Environment Files

Create a `.env.local` file in your project root:

```bash
# .env.local (for local development)

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Stripe Configuration (optional - for later)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid (optional - for email notifications)
SENDGRID_API_KEY=SG...

# Twilio (optional - for SMS notifications)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
```

### Step 2: Update Environment Variables

Replace the placeholder values with your actual Supabase credentials:

```bash
# Example values (use your actual values!)
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghij.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Add to .gitignore

Ensure `.env.local` is in your `.gitignore`:

```bash
# .gitignore
.env.local
.env*.local
```

---

## 4. Database Migration

### Method 1: Using Supabase Dashboard (Recommended for First Time)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Copy the entire contents of `/supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. Wait for execution to complete (should take 5-10 seconds)
8. Check for any errors in the output

### Method 2: Using Supabase CLI (For Team Collaboration)

```bash
# Link your local project to Supabase
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or apply specific migration
supabase migration up
```

### Verify Migration Success

Go to **Database** → **Tables** in Supabase dashboard. You should see these tables:

- ✅ organizations
- ✅ users
- ✅ games
- ✅ customers
- ✅ bookings
- ✅ payments
- ✅ notifications
- ✅ notification_settings
- ✅ stripe_webhook_events

---

## 5. Authentication Setup

### Step 1: Configure Auth Settings

1. Go to **Authentication** → **Settings** in Supabase dashboard
2. Configure the following:

**Site URL**:
```
http://localhost:3000 (for development)
https://your-domain.com (for production)
```

**Redirect URLs**:
```
http://localhost:3000/**
https://your-domain.com/**
```

**Email Auth**:
- Enable "Enable email confirmations" if you want email verification
- For development, you can disable it for faster testing

### Step 2: Create Your First User

#### Option A: Via Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Fill in:
   - **Email**: your-email@example.com
   - **Password**: Create a strong password
   - **Auto Confirm User**: Check this (for development)
4. Click **"Create user"**

#### Option B: Via SQL (Including Organization)

Run this in **SQL Editor**:

```sql
-- Create a test user in auth.users first via Dashboard
-- Then run this to add to users table:

INSERT INTO users (
  id,
  email,
  full_name,
  role,
  organization_id
)
VALUES (
  'auth-user-id-here', -- Replace with actual auth.users id
  'admin@example.com',
  'Admin User',
  'super-admin',
  '00000000-0000-0000-0000-000000000001' -- Demo organization
);
```

### Step 3: Test Authentication

Create a simple test file to verify auth works:

```typescript
// test-auth.ts
import { supabase } from './lib/supabase/client';

async function testAuth() {
  // Sign in
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'your-password'
  });

  if (error) {
    console.error('Auth error:', error);
  } else {
    console.log('✅ Authentication successful!');
    console.log('User:', data.user);
    console.log('Session:', data.session);
  }

  // Get current session
  const { data: { session } } = await supabase.auth.getSession();
  console.log('Current session:', session);
}

testAuth();
```

---

## 6. Testing the Connection

### Step 1: Install Dependencies

```bash
npm install @supabase/supabase-js
```

### Step 2: Test Database Connection

Create a test file:

```typescript
// test-db.ts
import { supabase } from './lib/supabase/client';

async function testDatabase() {
  console.log('Testing database connection...\n');

  // Test 1: Check organizations
  const { data: orgs, error: orgsError } = await supabase
    .from('organizations')
    .select('*')
    .limit(5);

  if (orgsError) {
    console.error('❌ Organizations query failed:', orgsError);
  } else {
    console.log('✅ Organizations query successful');
    console.log('Found', orgs.length, 'organization(s)');
  }

  // Test 2: Check users
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*')
    .limit(5);

  if (usersError) {
    console.error('❌ Users query failed:', usersError);
  } else {
    console.log('✅ Users query successful');
    console.log('Found', users.length, 'user(s)');
  }

  // Test 3: Check games
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('*')
    .limit(5);

  if (gamesError) {
    console.error('❌ Games query failed:', gamesError);
  } else {
    console.log('✅ Games query successful');
    console.log('Found', games.length, 'game(s)');
  }

  console.log('\n✅ All database tests passed!');
}

testDatabase();
```

Run the test:

```bash
npx tsx test-db.ts
```

### Step 3: Verify Row-Level Security (RLS)

RLS should prevent unauthorized access. Test it:

```typescript
// test-rls.ts
import { supabase } from './lib/supabase/client';

async function testRLS() {
  // Try to query without authentication
  await supabase.auth.signOut();

  const { data, error } = await supabase
    .from('bookings')
    .select('*');

  if (error) {
    console.log('✅ RLS working! Unauthenticated users blocked:', error.message);
  } else {
    console.log('⚠️ RLS might not be working. Got data:', data);
  }

  // Sign in and try again
  await supabase.auth.signInWithPassword({
    email: 'admin@example.com',
    password: 'your-password'
  });

  const { data: authData, error: authError } = await supabase
    .from('bookings')
    .select('*');

  if (authError) {
    console.log('❌ Authenticated query failed:', authError);
  } else {
    console.log('✅ Authenticated query successful. Found', authData.length, 'booking(s)');
  }
}

testRLS();
```

---

## 7. Next Steps

Now that Supabase is connected, you can:

### 1. Update AuthContext to Use Supabase

Modify `/lib/auth/AuthContext.tsx` to integrate with Supabase:

```typescript
import { supabase, getCurrentUser } from '@/lib/supabase/client';

// Update login function
const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // Fetch user profile from users table
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  setCurrentUser(profile);
};
```

### 2. Create API Routes

Start implementing API routes for:
- `/api/bookings` - CRUD operations for bookings
- `/api/customers` - Customer management
- `/api/games` - Game management
- `/api/payments` - Stripe integration

### 3. Implement Real-Time Updates

Use Supabase Realtime for live updates:

```typescript
import { supabase } from '@/lib/supabase/client';

// Subscribe to booking changes
const subscription = supabase
  .channel('bookings')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookings'
  }, (payload) => {
    console.log('Booking changed:', payload);
    // Update UI
  })
  .subscribe();
```

### 4. Add Sample Data

For development, add some test data:

```sql
-- Insert sample games
INSERT INTO games (organization_id, name, description, difficulty, duration_minutes, min_players, max_players, price)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'The Haunted Manor', 'Escape from a spooky mansion', 'medium', 60, 2, 6, 45.00),
  ('00000000-0000-0000-0000-000000000001', 'Bank Heist', 'Pull off the perfect robbery', 'hard', 75, 4, 8, 55.00),
  ('00000000-0000-0000-0000-000000000001', 'Prison Break', 'Escape before time runs out', 'expert', 90, 3, 6, 65.00);

-- Insert sample customer
INSERT INTO customers (organization_id, email, full_name, phone)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'john@example.com', 'John Doe', '+1234567890');
```

---

## 8. Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**: 
- Check that `.env.local` exists in project root
- Verify variable names match exactly: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your dev server after adding environment variables

### Issue: "relation 'public.users' does not exist"

**Solution**:
- Migration didn't run successfully
- Go to SQL Editor and run the migration file again
- Check for SQL syntax errors in output

### Issue: "Row-level security policy violation"

**Solution**:
- You're trying to access data without proper authentication
- Make sure you're signed in: `await supabase.auth.getSession()`
- Verify your user has the correct role and organization_id

### Issue: "Auth session not persisting"

**Solution**:
- Check that cookies are enabled in your browser
- Verify `auth.persistSession` is set to `true` in client config
- Clear browser localStorage and try again

### Issue: "Cannot read properties of undefined (reading 'supabase')"

**Solution**:
- Supabase client not initialized properly
- Check import statement: `import { supabase } from '@/lib/supabase/client'`
- Verify environment variables are loaded

### Issue: "Database connection failed"

**Solution**:
- Check Supabase project is running (not paused)
- Verify project URL is correct
- Check network connection
- Free tier projects pause after 1 week of inactivity - wake it up from dashboard

---

## 🎯 Quick Checklist

Before moving to development, verify:

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database migration completed
- [ ] All tables visible in dashboard
- [ ] First user created (super-admin)
- [ ] Authentication tested and working
- [ ] Database queries working
- [ ] RLS policies active
- [ ] Sample data added (optional)

---

## 📚 Additional Resources

### Supabase Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Authentication Guide](https://supabase.com/docs/guides/auth)
- [Database Guide](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime](https://supabase.com/docs/guides/realtime)

### BookingTMS Documentation
- **PRD**: `/PRD_BOOKINGTMS_ENTERPRISE.md` - Complete product requirements
- **Database Schema**: `/supabase/migrations/001_initial_schema.sql`
- **API Design**: See PRD Section 3.4
- **RBAC Guide**: `/lib/auth/README.md`

---

## 🚀 What's Next?

After completing this setup:

1. **Update AuthContext** - Integrate Supabase auth
2. **Create API Routes** - Implement backend endpoints
3. **Connect Frontend** - Update pages to use real data
4. **Stripe Integration** - Set up payment processing (see PRD Section 6)
5. **Real-Time Features** - Add WebSocket updates
6. **Notifications** - Connect notification system to database

**Full implementation guide**: See `/PRD_BOOKINGTMS_ENTERPRISE.md` Section 5 (Software Engineering Roadmap)

---

**Status**: ✅ Ready to Connect  
**Last Updated**: November 3, 2025  
**Next Step**: Run database migration and create first user

---

**Questions?** Check the troubleshooting section or refer to Supabase documentation.
