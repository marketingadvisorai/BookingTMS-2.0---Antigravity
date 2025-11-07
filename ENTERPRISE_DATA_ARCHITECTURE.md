# Enterprise Data Architecture & Synchronization

## 🎯 Core Principles

### 1. **Single Source of Truth**
All data is stored in ONE centralized database (Supabase PostgreSQL). No role-specific data silos.

### 2. **Role-Based Access Control (RBAC)**
- Permissions control WHAT users can do
- Data visibility controlled by Row Level Security (RLS)
- All roles see the SAME data (filtered by permissions)

### 3. **Data Synchronization**
- When Admin creates a venue → Super Admin sees it immediately
- When Beta Owner creates a booking → Admin sees it immediately  
- When Staff updates a game → Everyone with permission sees the update
- **Real-time sync via Supabase Realtime subscriptions**

---

## 📊 Data Entities & Relationships

### **Venues** (Multi-Location Support)
```sql
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  phone VARCHAR(50),
  email VARCHAR(255),
  capacity INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policy: Super Admin & Admin see ALL venues
-- Beta Owner sees only their created venues (or assigned venues)
```

### **Games/Escape Rooms**
```sql
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty VARCHAR(50),
  duration INTEGER, -- minutes
  min_players INTEGER,
  max_players INTEGER,
  price DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active',
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policy: Visible to all users with games.view permission
-- Editable by users with games.edit permission
```

### **Bookings**
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id),
  game_id UUID REFERENCES games(id),
  customer_id UUID REFERENCES customers(id),
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  players INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(10,2),
  payment_status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policy: All roles with bookings.view see ALL bookings
-- Filter by venue_id for venue-specific views
```

### **Customers**
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  total_bookings INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policy: Shared across all users with customers.view
```

### **Widgets**
```sql
CREATE TABLE widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  venue_id UUID REFERENCES venues(id),
  game_id UUID REFERENCES games(id),
  config JSONB,
  embed_code TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policy: 
-- Super Admin & Admin: See ALL widgets
-- Beta Owner: See only calendar, single-event, multi-step widgets
```

### **Staff Members**
```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policy: Super Admin & Admin only
-- Beta Owner: NO ACCESS
```

### **Waivers**
```sql
CREATE TABLE waivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  version VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policy: All roles with waivers.view see ALL waivers
```

---

## 🔐 Row Level Security (RLS) Policies

### **Super Admin**
```sql
-- Super Admin sees EVERYTHING
CREATE POLICY "super_admin_all_access" ON venues
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'super-admin'
    )
  );
```

### **Admin**
```sql
-- Admin sees ALL operational data
CREATE POLICY "admin_all_venues" ON venues
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role IN ('super-admin', 'admin')
    )
  );
```

### **Beta Owner**
```sql
-- Beta Owner sees only their venues (or assigned venues)
CREATE POLICY "beta_owner_venues" ON venues
  FOR SELECT
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM venue_assignments
      WHERE venue_id = venues.id
      AND user_id = auth.uid()
    )
  );
```

---

## 🔄 Data Flow Examples

### **Example 1: Admin Creates a Venue**
1. Admin logs in → Has `venues.create` permission ✅
2. Admin creates "New Escape Room Location"
3. Data saved to `venues` table with `created_by = admin_user_id`
4. **Super Admin** sees it immediately (RLS allows all access)
5. **Beta Owner** does NOT see it (not their venue)
6. **Staff** does NOT see it (no venues.view permission)

### **Example 2: Beta Owner Creates a Booking**
1. Beta Owner logs in → Has `bookings.create` permission ✅
2. Beta Owner creates booking for their venue
3. Data saved to `bookings` table
4. **Super Admin** sees it (all access)
5. **Admin** sees it (all bookings)
6. **Staff** with `bookings.view` sees it
7. **Real-time update** via Supabase Realtime

### **Example 3: Staff Updates a Game**
1. Staff logs in → Has `games.edit` permission ✅
2. Staff updates game difficulty from "Medium" to "Hard"
3. Data updated in `games` table
4. **Everyone** with `games.view` sees the update immediately
5. **Audit log** records who made the change

---

## 📡 Real-Time Synchronization

### **Supabase Realtime Subscriptions**
```typescript
// Subscribe to venue changes
const venueSubscription = supabase
  .channel('venues-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'venues' },
    (payload) => {
      console.log('Venue changed:', payload);
      // Update local state
      refreshVenues();
    }
  )
  .subscribe();

// Subscribe to booking changes
const bookingSubscription = supabase
  .channel('bookings-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'bookings' },
    (payload) => {
      console.log('Booking changed:', payload);
      // Update local state
      refreshBookings();
    }
  )
  .subscribe();
```

---

## ✅ Permission Matrix

| Feature | Super Admin | Admin | Beta Owner | Staff |
|---------|-------------|-------|------------|-------|
| **Venues** |
| View All | ✅ | ✅ | ❌ (Own only) | ❌ |
| Create | ✅ | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ✅ (Own only) | ❌ |
| Delete | ✅ | ✅ | ✅ (Own only) | ❌ |
| **Games** |
| View All | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ❌ |
| Edit | ✅ | ✅ | ✅ | ✅ |
| Delete | ✅ | ✅ | ✅ | ❌ |
| **Bookings** |
| View All | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ✅ |
| Edit | ✅ | ✅ | ✅ | ✅ |
| Delete | ✅ | ✅ | ✅ | ❌ |
| **Widgets** |
| View All | ✅ | ✅ | ❌ (3 only) | ❌ |
| Create | ✅ | ✅ | ✅ (3 types) | ❌ |
| Edit | ✅ | ✅ | ✅ (3 types) | ❌ |
| **Staff** |
| View | ✅ | ✅ | ❌ | ❌ |
| Manage | ✅ | ✅ | ❌ | ❌ |
| **AI Agents** |
| View Status | ✅ | ✅ | ✅ | ❌ |
| Configure | ✅ | ✅ | ❌ | ❌ |

---

## 🚀 Implementation Checklist

### **Phase 1: Database Setup**
- [ ] Create Supabase project
- [ ] Set up authentication
- [ ] Create all tables with proper relationships
- [ ] Implement RLS policies
- [ ] Add indexes for performance
- [ ] Set up audit logging

### **Phase 2: API Integration**
- [ ] Replace mock data with Supabase queries
- [ ] Implement CRUD operations for all entities
- [ ] Add real-time subscriptions
- [ ] Implement error handling
- [ ] Add loading states

### **Phase 3: Testing**
- [ ] Test Super Admin access (all data visible)
- [ ] Test Admin access (all operational data)
- [ ] Test Beta Owner access (limited to 3 venues)
- [ ] Test Staff access (limited permissions)
- [ ] Test cross-role data synchronization
- [ ] Test real-time updates

### **Phase 4: Deployment**
- [ ] Configure Vercel environment variables
- [ ] Set up production Supabase instance
- [ ] Deploy to Vercel
- [ ] Test in production
- [ ] Monitor performance

---

## 📝 Key Takeaways

1. ✅ **ONE DATABASE** - All users share the same data
2. ✅ **PERMISSIONS CONTROL ACCESS** - Not separate data stores
3. ✅ **REAL-TIME SYNC** - Changes visible immediately to all authorized users
4. ✅ **AUDIT TRAIL** - Track who created/modified what
5. ✅ **SCALABLE** - Enterprise-grade architecture ready for growth

This architecture ensures that when Admin creates a venue, Super Admin sees it. When Beta Owner creates a booking, everyone with permission sees it. **Data flows seamlessly across all roles.**
