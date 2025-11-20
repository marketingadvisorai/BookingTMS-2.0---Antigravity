# 🗄️ Database Connection Guide
**Complete Supabase Integration for BookingTMS with Trae AI Builder**

---

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Environment Setup](#environment-setup)
4. [Connection Testing](#connection-testing)
5. [KV Store Usage](#kv-store-usage)
6. [Custom Tables (Advanced)](#custom-tables-advanced)
7. [Authentication Flow](#authentication-flow)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Step 1: Verify Environment Variables
```bash
# These should already be configured
✅ SUPABASE_URL
✅ SUPABASE_ANON_KEY  
✅ SUPABASE_SERVICE_ROLE_KEY
✅ SUPABASE_DB_URL
```

### Step 2: Test Connection
1. Navigate to **Backend Dashboard** (Super Admin only)
2. Click **"Test Database Connection"**
3. Should see: ✅ **Connection Successful**

### Step 3: Start Using KV Store
```tsx
// In /supabase/functions/server/index.tsx
import * as kv from './kv_store.tsx';

// You're ready to go!
await kv.set('test:1', { message: 'Hello World' });
const data = await kv.get('test:1');
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      BookingTMS Application                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────┐                      ┌──────────────┐
│   FRONTEND   │                      │   BACKEND    │
│  (React UI)  │                      │  (Hono API)  │
└──────────────┘                      └──────────────┘
        │                                       │
        │ publicAnonKey                        │ serviceRoleKey
        │                                       │
        └───────────────────┬───────────────────┘
                            │
                            ▼
                ┌────────────────────┐
                │  SUPABASE POSTGRES │
                │   (Database)       │
                └────────────────────┘
                            │
                            │
                ┌───────────┴────────────┐
                │                        │
                ▼                        ▼
        ┌──────────────┐       ┌──────────────┐
        │  KV Store    │       │  Auth Users  │
        │  (Built-in)  │       │  (Built-in)  │
        └──────────────┘       └──────────────┘
```

---

## 🌐 Environment Setup

### Frontend Configuration

**File: `/utils/supabase/info.tsx`**
```tsx
// Auto-configured - DO NOT EDIT
export const projectId = 'your-project-id';
export const publicAnonKey = 'your-public-key';
```

**Usage in Frontend:**
```tsx
import { projectId, publicAnonKey } from './utils/supabase/info';

const SUPABASE_URL = `https://${projectId}.supabase.co`;
const API_BASE = `${SUPABASE_URL}/functions/v1/make-server-84a71643`;

// Make API calls
const response = await fetch(`${API_BASE}/bookings`, {
  headers: {
    'Authorization': `Bearer ${publicAnonKey}`,
  },
});
```

### Backend Configuration

**File: `/supabase/functions/server/index.tsx`**
```tsx
// Environment variables automatically available
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
```

---

## 🧪 Connection Testing

### Method 1: Backend Dashboard (Recommended)

**Access:** `/backend-dashboard` (Super Admin only)

**Features:**
- ✅ One-click connection test
- ✅ Performance metrics
- ✅ Real-time status monitoring
- ✅ LLM provider testing

**Steps:**
1. Login as Super Admin
2. Navigate to Backend Dashboard
3. Scroll to "Database Connections"
4. Click **"Test Connection"**
5. View results:
   - ✅ **Success**: Connection working
   - ❌ **Failed**: Check troubleshooting section

### Method 2: Manual Test

**Create test file: `/pages/SupabaseTest.tsx`**
```tsx
'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const SupabaseTest = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  
  const testConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-84a71643/health`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        setStatus('✅ Connection Successful!');
      } else {
        setStatus(`❌ Connection Failed: ${response.status}`);
      }
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="p-6">
        <Card className="p-6">
          <h2 className="text-xl mb-4">Database Connection Test</h2>
          <Button onClick={testConnection} disabled={loading}>
            {loading ? 'Testing...' : 'Test Connection'}
          </Button>
          {status && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              {status}
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SupabaseTest;
```

### Method 3: Console Test

Open browser console and run:
```javascript
// Test API endpoint
fetch('https://[your-project].supabase.co/functions/v1/make-server-84a71643/health', {
  headers: {
    'Authorization': 'Bearer [your-anon-key]'
  }
})
.then(res => res.json())
.then(data => console.log('✅ Connection successful:', data))
.catch(err => console.error('❌ Connection failed:', err));
```

---

## 💾 KV Store Usage

### What is KV Store?

The KV Store (`kv_store_84a71643` table) is a pre-configured key-value database perfect for:
- ✅ Rapid prototyping
- ✅ Simple data storage
- ✅ Configuration settings
- ✅ Session management
- ✅ Feature flags
- ✅ Cache data

### KV Store API

**File: `/supabase/functions/server/kv_store.tsx`** (Protected - DO NOT EDIT)

**Available Functions:**
```tsx
// Set single value
await kv.set(key: string, value: any): Promise<void>

// Get single value  
await kv.get(key: string): Promise<any>

// Get multiple values
await kv.mget(keys: string[]): Promise<any[]>

// Set multiple values
await kv.mset(entries: Record<string, any>): Promise<void>

// Delete single value
await kv.del(key: string): Promise<void>

// Delete multiple values
await kv.mdel(keys: string[]): Promise<void>

// Get all values with prefix
await kv.getByPrefix(prefix: string): Promise<any[]>
```

### KV Store Patterns

#### Pattern 1: User Profiles
```tsx
// Store user profile
await kv.set('user:john@example.com', {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
  preferences: {
    theme: 'dark',
    notifications: true
  }
});

// Retrieve user profile
const user = await kv.get('user:john@example.com');

// Get all users
const allUsers = await kv.getByPrefix('user:');
```

#### Pattern 2: Bookings
```tsx
// Create booking
const bookingId = crypto.randomUUID();
await kv.set(`booking:${bookingId}`, {
  id: bookingId,
  customerName: 'Jane Smith',
  gameId: 'escape-room-1',
  date: '2025-11-05',
  time: '19:00',
  status: 'confirmed',
  createdAt: new Date().toISOString()
});

// Get specific booking
const booking = await kv.get(`booking:${bookingId}`);

// Get all bookings
const allBookings = await kv.getByPrefix('booking:');

// Update booking
const existing = await kv.get(`booking:${bookingId}`);
await kv.set(`booking:${bookingId}`, {
  ...existing,
  status: 'completed',
  updatedAt: new Date().toISOString()
});

// Delete booking
await kv.del(`booking:${bookingId}`);
```

#### Pattern 3: Settings/Config
```tsx
// Store application settings
await kv.set('config:email', {
  provider: 'sendgrid',
  fromEmail: 'noreply@bookingtms.com',
  enabled: true
});

await kv.set('config:payment', {
  provider: 'stripe',
  publicKey: 'pk_test_...',
  enabled: true
});

// Get all config
const configs = await kv.getByPrefix('config:');
```

#### Pattern 4: Relationships
```tsx
// Store game and its bookings
await kv.set('game:escape-room-1', {
  id: 'escape-room-1',
  name: 'Mystery Mansion',
  duration: 60,
  maxPlayers: 6
});

await kv.set('game:escape-room-1:bookings', [
  'booking-id-1',
  'booking-id-2',
  'booking-id-3'
]);

// Get game with bookings
const game = await kv.get('game:escape-room-1');
const bookingIds = await kv.get('game:escape-room-1:bookings');
const bookings = await kv.mget(
  bookingIds.map(id => `booking:${id}`)
);
```

### Key Naming Conventions

Use clear prefixes for organization:
```
user:               → User profiles
booking:            → Bookings
game:               → Games/Rooms
staff:              → Staff members
config:             → Configuration
session:            → Session data
notification:       → Notifications
payment:            → Payment records
waiver:             → Waivers
customer:           → Customer data
```

---

## 🎯 Custom Tables (Advanced)

### ⚠️ Important Limitations

**You CANNOT create custom tables from code in this environment.**

The Figma Make environment does not support:
- ❌ Running SQL migrations
- ❌ DDL statements (CREATE TABLE, ALTER TABLE)
- ❌ Custom migration scripts
- ❌ Programmatic schema changes

### When Custom Tables Are Needed

**Decision Matrix:**

| Requirement | KV Store | Custom Table |
|------------|----------|--------------|
| Simple key-value data | ✅ Use KV | ❌ Overkill |
| Relationships (1-to-many) | ✅ Store IDs | ⚠️ Consider Custom |
| Complex queries (JOINs) | ❌ Not ideal | ✅ Use Custom |
| Full-text search | ❌ Limited | ✅ Use Custom |
| Large datasets (>10k rows) | ⚠️ Possible | ✅ Use Custom |
| Rapid prototyping | ✅ Perfect | ❌ Too slow |

### Creating Custom Tables (Manual)

If you absolutely need custom tables:

**Step 1:** Inform the user they need to:
1. Open Supabase Dashboard
2. Navigate to SQL Editor
3. Run the provided SQL

**Step 2:** Provide SQL script:

```sql
-- Example: Bookings table with relationships
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  game_id UUID NOT NULL,
  booking_date TIMESTAMPTZ NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  number_of_players INT NOT NULL CHECK (number_of_players > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  total_amount DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_game ON bookings(game_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
BEFORE UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Enable Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (auth.uid()::text = customer_id::text);

-- Policy: Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
ON bookings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' IN ('admin', 'super-admin')
  )
);

-- Policy: Admins can insert/update/delete
CREATE POLICY "Admins can manage bookings"
ON bookings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' IN ('admin', 'super-admin')
  )
);
```

**Step 3:** Update server code to use custom table:

```tsx
// In /supabase/functions/server/index.tsx
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Query custom table
app.get('/make-server-84a71643/bookings', async (c) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: true });
    
    if (error) throw error;
    
    return c.json(data);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Insert into custom table
app.post('/make-server-84a71643/bookings', async (c) => {
  try {
    const body = await c.req.json();
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([body])
      .select()
      .single();
    
    if (error) throw error;
    
    return c.json(data, 201);
  } catch (error) {
    console.error('Create booking error:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

---

## 🔐 Authentication Flow

### Sign Up Flow

```
┌──────────────┐
│  User enters │
│  credentials │
└──────┬───────┘
       │
       ▼
┌─────────────────────┐
│ Frontend sends to   │
│ /auth/signup        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────┐
│ Server validates data       │
│ Uses SERVICE_ROLE_KEY       │
│ Calls supabase.auth.admin   │
│   .createUser()             │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────┐
│ User created        │
│ Auto-confirmed      │
│ (no email needed)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Return user data    │
│ to frontend         │
└─────────────────────┘
```

**Implementation:**

```tsx
// Server: /supabase/functions/server/index.tsx
app.post('/make-server-84a71643/auth/signup', async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { email, password, name, role } = await c.req.json();
  
  // Validate input
  if (!email || !password || !name) {
    return c.json({ error: 'Missing required fields' }, 400);
  }
  
  // Create user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name, role: role || 'staff' },
    email_confirm: true, // Auto-confirm
  });
  
  if (error) {
    console.error('Signup error:', error);
    return c.json({ error: error.message }, 400);
  }
  
  return c.json({ user: data.user }, 201);
});

// Frontend: /pages/Signup.tsx
const handleSignup = async (formData) => {
  try {
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-84a71643/auth/signup`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }
    );
    
    const data = await response.json();
    
    if (response.ok) {
      toast.success('Account created successfully!');
      navigate('/login');
    } else {
      toast.error(data.error || 'Signup failed');
    }
  } catch (error) {
    console.error('Signup error:', error);
    toast.error('An error occurred');
  }
};
```

### Sign In Flow

```
┌──────────────┐
│  User enters │
│  credentials │
└──────┬───────┘
       │
       ▼
┌────────────────────────┐
│ Frontend calls         │
│ supabase.auth          │
│   .signInWithPassword()│
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│ Supabase validates     │
│ Returns session        │
│ with access_token      │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│ Store access_token     │
│ in localStorage        │
└──────┬─────────────────┘
       │
       ▼
┌────────────────────────┐
│ Navigate to dashboard  │
└────────────────────────┘
```

**Implementation:**

```tsx
// Frontend: /pages/Login.tsx
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const handleLogin = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Store token
    const accessToken = data.session?.access_token;
    localStorage.setItem('supabase_access_token', accessToken);
    
    // Store user info
    localStorage.setItem('user', JSON.stringify(data.user));
    
    toast.success('Login successful!');
    navigate('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    toast.error('Invalid credentials');
  }
};
```

### Protected Route Flow

```
┌──────────────────┐
│  User makes      │
│  API request     │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────┐
│ Include Authorization   │
│ header with token       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Server extracts token   │
│ Calls getUser()         │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  Valid    Invalid
    │         │
    ▼         ▼
 Process   Return 401
 Request   Unauthorized
```

**Implementation:**

```tsx
// Server: Protected route
app.get('/make-server-84a71643/protected-data', async (c) => {
  // Extract token
  const authHeader = c.req.header('Authorization');
  const accessToken = authHeader?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'No token provided' }, 401);
  }
  
  // Verify token
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  // User is authenticated
  // Proceed with request
  const userData = await kv.get(`user:${user.id}`);
  return c.json(userData);
});

// Frontend: Making protected request
const fetchProtectedData = async () => {
  const accessToken = localStorage.getItem('supabase_access_token');
  
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/make-server-84a71643/protected-data`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  if (response.status === 401) {
    // Token expired or invalid
    toast.error('Session expired. Please login again.');
    navigate('/login');
    return;
  }
  
  const data = await response.json();
  return data;
};
```

---

## 🔧 Troubleshooting

### Issue 1: Connection Failed

**Symptoms:**
- ❌ "Connection failed" error
- ❌ Network timeout
- ❌ 500 Internal Server Error

**Solutions:**
1. **Check environment variables:**
   ```tsx
   console.log('URL:', Deno.env.get('SUPABASE_URL'));
   console.log('Key:', Deno.env.get('SUPABASE_ANON_KEY'));
   ```

2. **Verify Supabase project is active:**
   - Login to Supabase Dashboard
   - Check project status
   - Ensure project is not paused

3. **Test from Backend Dashboard:**
   - Navigate to `/backend-dashboard`
   - Run connection test
   - Review error messages

### Issue 2: 401 Unauthorized

**Symptoms:**
- ❌ "Unauthorized" error
- ❌ 401 status code
- ❌ "Invalid API key" error

**Solutions:**
1. **Frontend - Check anon key:**
   ```tsx
   import { publicAnonKey } from './utils/supabase/info';
   console.log('Using key:', publicAnonKey);
   ```

2. **Backend - Check service key:**
   ```tsx
   const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
   console.log('Service key exists:', !!key);
   ```

3. **Verify Authorization header:**
   ```tsx
   headers: {
     'Authorization': `Bearer ${publicAnonKey}`,
   }
   ```

### Issue 3: CORS Error

**Symptoms:**
- ❌ "CORS policy" error in console
- ❌ Preflight request failed
- ❌ "Access-Control-Allow-Origin" error

**Solutions:**
1. **Check CORS in server:**
   ```tsx
   import { cors } from 'npm:hono/cors';
   
   app.use('*', cors({
     origin: '*',
     credentials: true,
   }));
   ```

2. **Verify route prefix:**
   ```tsx
   // All routes must start with:
   app.get('/make-server-84a71643/your-route', ...);
   ```

### Issue 4: KV Store Not Working

**Symptoms:**
- ❌ "Table not found" error
- ❌ Cannot read/write to KV store
- ❌ `kv.get()` returns null

**Solutions:**
1. **Verify import:**
   ```tsx
   import * as kv from './kv_store.tsx';
   ```

2. **Check key format:**
   ```tsx
   // Use consistent prefixes
   await kv.set('prefix:id', data); // ✅ Good
   await kv.set('random', data);     // ⚠️ Hard to query
   ```

3. **Test basic operations:**
   ```tsx
   // Write test
   await kv.set('test:1', { value: 'test' });
   
   // Read test
   const result = await kv.get('test:1');
   console.log('Test result:', result);
   ```

### Issue 5: Service Key Exposed

**Symptoms:**
- ⚠️ Security warning
- ⚠️ Service key visible in frontend code
- ⚠️ Build warnings about secrets

**Solutions:**
1. **NEVER use service key in frontend:**
   ```tsx
   // ❌ WRONG - Frontend
   const supabase = createClient(url, serviceRoleKey);
   
   // ✅ CORRECT - Frontend
   const supabase = createClient(url, publicAnonKey);
   ```

2. **Only use service key in backend:**
   ```tsx
   // ✅ CORRECT - Backend
   const supabase = createClient(
     Deno.env.get('SUPABASE_URL')!,
     Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
   );
   ```

### Issue 6: Authentication Not Working

**Symptoms:**
- ❌ Login fails
- ❌ Token invalid
- ❌ User not authenticated

**Solutions:**
1. **Check user creation:**
   ```tsx
   // Ensure email_confirm: true
   await supabase.auth.admin.createUser({
     email,
     password,
     email_confirm: true, // Important!
   });
   ```

2. **Verify token storage:**
   ```tsx
   const token = localStorage.getItem('supabase_access_token');
   console.log('Token exists:', !!token);
   ```

3. **Test token validity:**
   ```tsx
   const { data: { user }, error } = await supabase.auth.getUser(token);
   console.log('User:', user);
   console.log('Error:', error);
   ```

---

## 📊 Connection Status Checklist

Use this checklist to verify your database setup:

### Environment
- [ ] SUPABASE_URL configured
- [ ] SUPABASE_ANON_KEY configured
- [ ] SUPABASE_SERVICE_ROLE_KEY configured
- [ ] No hardcoded keys in code

### Frontend
- [ ] Import `projectId` and `publicAnonKey` from `/utils/supabase/info`
- [ ] API calls use correct URL format
- [ ] Authorization header included
- [ ] Error handling implemented

### Backend
- [ ] Import from `kv_store.tsx` working
- [ ] Routes prefixed with `/make-server-84a71643/`
- [ ] CORS enabled
- [ ] Error logging added
- [ ] Service role key used (not anon key)

### Testing
- [ ] Backend Dashboard connection test passes
- [ ] KV store read/write works
- [ ] API endpoints respond
- [ ] Authentication flow works
- [ ] Protected routes return 401 when unauthorized

---

## 🎯 Next Steps

After successful database connection:

1. **✅ Start Building Features**
   - Use KV store for data persistence
   - Create API endpoints in server
   - Build frontend components

2. **✅ Implement Authentication**
   - Set up sign up/login flows
   - Protect sensitive routes
   - Add role-based permissions

3. **✅ Add Data Management**
   - CRUD operations for your entities
   - Search and filtering
   - Data validation

4. **✅ Test Thoroughly**
   - Test all CRUD operations
   - Verify authentication works
   - Check error handling

5. **✅ Deploy & Monitor**
   - Use Backend Dashboard for monitoring
   - Check connection status regularly
   - Review error logs

---

## 📚 Related Documentation

- **Main Guide**: `/guidelines/Guidelines.md` → 🤖 AI Builder section
- **Quick Reference**: `/AI_BUILDER_QUICK_REFERENCE.md`
- **Supabase Setup**: `/SUPABASE_QUICK_START.md`
- **Backend API**: `/backend/README.md`
- **Auth System**: `/lib/auth/README.md`

---

**Version**: 3.3  
**Last Updated**: November 4, 2025  
**Status**: ✅ Production Ready
