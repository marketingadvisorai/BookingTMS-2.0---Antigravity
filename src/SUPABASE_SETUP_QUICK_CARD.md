# Supabase Setup - Quick Reference Card ⚡

## 🎯 5-Minute Setup

### 1️⃣ Create Project (2 min)
```
→ supabase.com → New Project
→ Name: bookingtms-demo
→ Copy: Project URL, Project ID, anon key, service_role key
```

### 2️⃣ Run Schema (1 min)
```
→ SQL Editor → New Query
→ Paste: /supabase/migrations/001_initial_schema.sql
→ Click RUN → Wait for Success
```

### 3️⃣ Create Auth Users (1 min)
```
→ Authentication → Users → Add user (×4)

User 1: superadmin@bookingtms.com / demo123 (Auto-confirm ✅)
User 2: admin@bookingtms.com / demo123 (Auto-confirm ✅)
User 3: manager@bookingtms.com / demo123 (Auto-confirm ✅)
User 4: staff@bookingtms.com / demo123 (Auto-confirm ✅)

→ COPY each User UID!
```

### 4️⃣ Update Seed SQL (30 sec)
```typescript
// Open: /supabase/migrations/002_seed_demo_data.sql
// Find: INSERT INTO users (id, email...
// Replace placeholder UUIDs with YOUR real User UIDs from step 3
```

### 5️⃣ Run Seed Data (30 sec)
```
→ SQL Editor → New Query
→ Paste: /supabase/migrations/002_seed_demo_data.sql (updated)
→ Click RUN → See success stats
```

### 6️⃣ Configure App (30 sec)
```bash
# Create .env.local
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## ✅ Verify

### Check Database
```sql
-- Table Editor → organizations (1 row)
-- Table Editor → users (4 rows)
-- Table Editor → games (6 rows)
-- Table Editor → customers (10 rows)
-- Table Editor → bookings (14 rows)
```

### Test Login
```
Email: superadmin@bookingtms.com
Password: demo123
```

---

## 📊 What You Get

| Table | Records | Description |
|-------|---------|-------------|
| Organizations | 1 | BookingTMS Escape Rooms |
| Users | 4 | Super Admin, Admin, Manager, Staff |
| Games | 6 | Escape rooms (Easy to Expert) |
| Customers | 10 | VIP, Regular, New, Inactive |
| Bookings | 14 | Past, Today, Future |
| Payments | 13 | Successful + 1 refund |
| Notifications | 7 | 3 unread, 4 read |

---

## 🔑 Demo Credentials

```
Super Admin: superadmin@bookingtms.com / demo123
Admin:       admin@bookingtms.com / demo123
Manager:     manager@bookingtms.com / demo123
Staff:       staff@bookingtms.com / demo123
```

---

## 🛠️ Useful Queries

### Test Connection
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

const { data } = await supabase.from('organizations').select('*').single()
console.log(data) // Should show BookingTMS Escape Rooms
```

### Get Today's Bookings
```sql
SELECT 
  b.booking_number,
  c.full_name as customer,
  g.name as game,
  b.start_time,
  b.status
FROM bookings b
JOIN customers c ON b.customer_id = c.id
JOIN games g ON b.game_id = g.id
WHERE b.booking_date = CURRENT_DATE
ORDER BY b.start_time;
```

### Get Revenue Stats
```sql
SELECT * FROM daily_revenue
WHERE booking_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY booking_date DESC;
```

---

## 🐛 Common Fixes

### "Users insert failed"
```
❌ Auth users not created first
✅ Create 4 users in Auth → Copy UIDs → Update seed SQL
```

### "No data in app"
```
❌ Wrong .env.local credentials
✅ Check SUPABASE_URL and SUPABASE_ANON_KEY
✅ Restart dev server
```

### "Permission denied"
```
❌ Using anon key for admin operations
✅ Use SUPABASE_SERVICE_ROLE_KEY for backend
```

---

## 🔄 Reset Database

```sql
-- Drop everything (run in SQL Editor)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run migrations from Step 2
```

---

## 📈 Next Steps

1. ✅ Test login with all 4 roles
2. ✅ Verify data in Table Editor
3. ✅ Check RLS policies work
4. ⏭️ Integrate frontend with Supabase
5. ⏭️ Replace localStorage with database calls

---

## 📚 Full Guide

**Detailed instructions**: `/SUPABASE_DATABASE_SETUP_GUIDE.md`

**Schema reference**: `/supabase/migrations/001_initial_schema.sql`

**Seed data**: `/supabase/migrations/002_seed_demo_data.sql`

---

**Last Updated**: November 5, 2025
**Status**: Ready for Phase 2 Database Integration
