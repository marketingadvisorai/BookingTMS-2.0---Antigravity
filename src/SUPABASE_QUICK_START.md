# Supabase Quick Start (5 Minutes)

**Get BookingTMS connected to Supabase in 5 minutes**

---

## Step 1: Create Supabase Project (2 min)

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - Name: `BookingTMS`
   - Database Password: Generate & save
   - Region: Choose nearest
4. Click **"Create"**
5. Wait 2-3 minutes ☕

---

## Step 2: Get Your Keys (30 sec)

In Supabase dashboard:
1. Go to **Settings** → **API**
2. Copy these 3 values:

```bash
Project URL:     https://_____.supabase.co
anon/public key: eyJ...
service_role:    eyJ... (keep secret!)
```

---

## Step 3: Configure Environment (30 sec)

Create `.env.local` in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Replace the values with what you copied in Step 2.

---

## Step 4: Run Database Migration (1 min)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire file: `/supabase/migrations/001_initial_schema.sql`
4. Paste into SQL Editor
5. Click **"Run"** (or press Cmd+Enter)
6. Wait for "Success. No rows returned"

---

## Step 5: Create First User (1 min)

### 5a. Create Auth User
1. Go to **Authentication** → **Users**
2. Click **"Add user"**
3. Enter:
   - Email: `admin@yourdomain.com`
   - Password: `YourStrongPassword123!`
   - ✅ Check "Auto Confirm User"
4. Click **"Create user"**
5. **Copy the user ID** from the users table

### 5b. Create User Profile
1. Go back to **SQL Editor**
2. Run this (replace `USER_ID_HERE`):

```sql
INSERT INTO users (
  id,
  email,
  full_name,
  role,
  organization_id
)
VALUES (
  'USER_ID_HERE', -- Paste the ID you copied
  'admin@yourdomain.com',
  'Super Admin',
  'super-admin',
  '00000000-0000-0000-0000-000000000001'
);
```

---

## ✅ You're Done!

### Test It:

```bash
# In your project directory
npm install @supabase/supabase-js
npm run dev
```

Your app should now:
- Connect to Supabase
- Allow login with the credentials you created
- Load user profile and permissions

---

## 🎉 What You Just Did

- ✅ Created Supabase project
- ✅ Created 9 database tables (organizations, users, games, customers, bookings, payments, notifications, etc.)
- ✅ Enabled Row-Level Security (RLS) on all tables
- ✅ Created indexes for performance
- ✅ Set up triggers and functions
- ✅ Created your first super admin user

---

## 🔜 Next Steps

Now you can:

### 1. Add Sample Data (Optional)
Run in SQL Editor:
```sql
-- Add sample games
INSERT INTO games (organization_id, name, description, difficulty, duration_minutes, min_players, max_players, price)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'The Haunted Manor', 'Escape from a spooky mansion', 'medium', 60, 2, 6, 45.00),
  ('00000000-0000-0000-0000-000000000001', 'Bank Heist', 'Pull off the perfect robbery', 'hard', 75, 4, 8, 55.00);
```

### 2. Update AuthContext (5 min)
To use real Supabase authentication:

```bash
# Backup current version
cp lib/auth/AuthContext.tsx lib/auth/AuthContext.backup.tsx

# Use Supabase version
mv lib/auth/AuthContext.supabase.tsx lib/auth/AuthContext.tsx
```

Restart dev server: `npm run dev`

### 3. Test Login
- Go to your app
- Log in with the credentials you created
- You should see the dashboard with real data!

---

## 📚 For More Details

- **Complete Setup**: `/SUPABASE_SETUP_GUIDE.md` (30-page guide)
- **Integration Checklist**: `/SUPABASE_INTEGRATION_CHECKLIST.md` (step-by-step)
- **Database Schema**: `/supabase/migrations/001_initial_schema.sql`
- **PRD**: `/PRD_BOOKINGTMS_ENTERPRISE.md` (full architecture)

---

## 🆘 Troubleshooting

**"relation does not exist"**
→ Migration didn't run. Go back to Step 4.

**"row-level security policy violation"**
→ Not logged in or wrong organization. Check session.

**"Missing environment variables"**
→ Check `.env.local` exists and restart dev server.

**"Auth error"**
→ Verify email/password are correct. Check in Supabase dashboard.

---

**That's it!** You now have a fully connected Supabase backend. 🎊

**Time to complete**: ~5 minutes  
**Difficulty**: Easy  
**Status**: ✅ Production Ready

---

**Questions?** Check `/SUPABASE_SETUP_GUIDE.md` for detailed explanations.
