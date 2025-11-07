# 🤖 Trae AI Builder Master Guide
**Complete Development & Database Guide for Claude Sonnet 4**

**Version**: 4.0  
**Last Updated**: November 4, 2025  
**Project**: BookingTMS SaaS Admin Portal

---

## 📋 Table of Contents

1. [🎯 AI Builder Overview](#-ai-builder-overview)
2. [⚡ Quick Start (5 Minutes)](#-quick-start-5-minutes)
3. [🏗️ Development Workflow](#️-development-workflow)
4. [🗄️ Database Creation & Connection](#️-database-creation--connection)
5. [🎨 UI Development Guide](#-ui-development-guide)
6. [🔐 Authentication & Authorization](#-authentication--authorization)
7. [📡 API Development](#-api-development)
8. [🐛 Debugging & Troubleshooting](#-debugging--troubleshooting)
9. [✅ Pre-Deployment Checklist](#-pre-deployment-checklist)
10. [📚 Reference Documentation](#-reference-documentation)

---

## 🎯 AI Builder Overview

### What is Trae AI Builder?

**Trae AI Builder** is the codename for using **Claude Sonnet 4** (or similar advanced AI models) to develop features for BookingTMS. This guide is optimized for AI assistants to:

✅ Understand the project architecture  
✅ Build features following established patterns  
✅ Connect to Supabase database correctly  
✅ Implement dark mode consistently  
✅ Follow security best practices  
✅ Debug issues efficiently  

### Project Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend** | React 18 + TypeScript | Component-based UI |
| **Styling** | Tailwind CSS v4 | Utility-first, dark mode |
| **UI Components** | Shadcn/UI | Accessible, customizable |
| **Backend** | Hono.js on Deno | Edge functions |
| **Database** | Supabase PostgreSQL | Managed database |
| **Authentication** | Supabase Auth | JWT-based |
| **State** | React Context | Global state management |
| **Icons** | Lucide React | Modern icon library |
| **Charts** | Recharts | Data visualization |

### Critical Rules (Must Follow)

1. ✅ **Dark Mode is Mandatory** - Every component must support dark mode
2. ✅ **Mobile-First Design** - Always responsive, start with mobile
3. ✅ **Explicit Styling** - Always override base component defaults
4. ✅ **Security First** - Never expose service keys in frontend
5. ✅ **Use KV Store** - Default to KV store, avoid custom tables
6. ✅ **Permission Guards** - Protect all sensitive features
7. ✅ **Error Handling** - Every async operation needs try/catch
8. ✅ **Loading States** - Every data fetch needs loading UI

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Understand the Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 BOOKINGTMS APPLICATION                   │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
    ┌─────────────┐                ┌─────────────┐
    │  FRONTEND   │                │   BACKEND   │
    │  (React)    │                │   (Hono)    │
    │             │                │             │
    │ • Pages     │                │ • API       │
    │ • Components│                │ • KV Store  │
    │ • Context   │                │ • Auth      │
    └─────────────┘                └─────────────┘
           │                               │
           │ publicAnonKey                 │ serviceRoleKey
           │                               │
           └───────────────┬───────────────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │    SUPABASE      │
                 │   PostgreSQL     │
                 └──────────────────┘
```

### Step 2: Essential File Locations

**Must-Read Documentation:**
```
/guidelines/Guidelines.md              → Main development guide
/guidelines/AI_AGENT_QUICK_START.md   → Fast patterns & templates
/guidelines/DESIGN_SYSTEM.md          → Design rules & colors
/AI_BUILDER_QUICK_REFERENCE.md        → Quick command reference
/DATABASE_CONNECTION_GUIDE.md         → Database setup & patterns
```

**Key Code Files:**
```
/components/layout/ThemeContext.tsx   → Dark mode context
/components/layout/AdminLayout.tsx    → Main layout wrapper
/lib/auth/AuthContext.tsx             → RBAC authentication
/lib/auth/permissions.ts              → Permission definitions
/supabase/functions/server/index.tsx  → API server
/supabase/functions/server/kv_store.tsx → Database utilities (protected)
/utils/supabase/info.tsx              → Supabase config
```

**Reference Implementations:**
```
/pages/Dashboard.tsx                  → Admin page pattern
/pages/Bookings.tsx                   → Data table pattern
/pages/Notifications.tsx              → Full-featured page
/components/widgets/FareBookWidget.tsx → Widget pattern
```

### Step 3: Verify Environment

Before building anything, verify database connection:

```tsx
// Navigate to: /backend-dashboard (Super Admin only)
// Click: "Test Database Connection"
// Expected: ✅ Connection Successful
```

**Environment Variables (Auto-configured):**
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `SUPABASE_DB_URL`

---

## 🏗️ Development Workflow

### Workflow 1: Building a New Admin Page

**Step 1: Create the Page File**

```tsx
// File: /pages/MyNewPage.tsx
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTheme } from '@/components/layout/ThemeContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const MyNewPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      // API call here
      setData([]); // Replace with actual data
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AdminLayout>
      <PageHeader title="My New Page" />
      
      <div className={`p-6 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <Card className={`p-6 ${isDark ? 'bg-[#161616] border-gray-800' : 'bg-white border-gray-200'}`}>
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : error ? (
            <div className="text-center p-12">
              <p className={isDark ? 'text-red-400' : 'text-red-600'}>{error}</p>
              <Button onClick={fetchData} className="mt-4">Retry</Button>
            </div>
          ) : (
            <div>
              {/* Your content here */}
              <p className={isDark ? 'text-white' : 'text-gray-900'}>
                Content goes here
              </p>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default MyNewPage;
```

**Step 2: Add Route to App.tsx**

```tsx
// File: /App.tsx
import MyNewPage from './pages/MyNewPage';

// Add to your router configuration
<Route path="/my-new-page" element={<MyNewPage />} />
```

**Step 3: Add to Sidebar Navigation (if needed)**

```tsx
// File: /components/layout/Sidebar.tsx
// Add navigation item with appropriate permission check
```

---

### Workflow 2: Creating a Form Component

```tsx
'use client';

import { useState } from 'react';
import { useTheme } from '@/components/layout/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner@2.0.3';

interface MyFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MyForm = ({ open, onClose, onSuccess }: MyFormProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      // API call here
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Failed to submit');
      
      toast.success('Submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={isDark ? 'bg-[#1e1e1e] border-gray-800' : 'bg-white'}>
        <DialogHeader>
          <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>
            Add New Item
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label className="text-gray-700">Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
              placeholder="Enter name"
              required
            />
          </div>
          
          {/* Email Field */}
          <div className="space-y-2">
            <Label className="text-gray-700">Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
              placeholder="email@example.com"
              required
            />
          </div>
          
          {/* Phone Field */}
          <div className="space-y-2">
            <Label className="text-gray-700">Phone</Label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
              placeholder="(555) 555-5555"
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: isDark ? '#4f46e5' : '#4f46e5' }}
              className="text-white"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
```

---

### Workflow 3: Adding Permission-Based Features

```tsx
import { useAuth } from '@/lib/auth/AuthContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Button } from '@/components/ui/button';

const MyComponent = () => {
  const { hasPermission, isRole, currentUser } = useAuth();
  
  // Check permissions programmatically
  const canEdit = hasPermission('bookings.edit');
  const canDelete = hasPermission('bookings.delete');
  const isSuperAdmin = isRole('super-admin');
  
  return (
    <div>
      {/* Method 1: PermissionGuard component */}
      <PermissionGuard permissions={['bookings.edit']}>
        <Button>Edit Booking</Button>
      </PermissionGuard>
      
      {/* Method 2: Conditional rendering */}
      {canDelete && (
        <Button variant="destructive">Delete Booking</Button>
      )}
      
      {/* Method 3: Role-based */}
      {isSuperAdmin && (
        <div>Super Admin Only Content</div>
      )}
      
      {/* Method 4: Multiple permissions (AND logic) */}
      <PermissionGuard permissions={['bookings.edit', 'bookings.delete']}>
        <Button>Edit & Delete</Button>
      </PermissionGuard>
    </div>
  );
};
```

**Available Roles:**
- `super-admin` - Full system access
- `admin` - Full operational access
- `manager` - View and limited edit
- `staff` - Basic view-only

**Common Permissions:**
```typescript
// Bookings
'bookings.view'
'bookings.create'
'bookings.edit'
'bookings.delete'
'bookings.export'

// Customers
'customers.view'
'customers.create'
'customers.edit'
'customers.delete'

// Games
'games.view'
'games.create'
'games.edit'
'games.delete'

// Staff
'staff.view'
'staff.create'
'staff.edit'
'staff.delete'

// Settings
'settings.view'
'settings.edit'
'settings.advanced'

// Users (Super Admin only)
'users.manage'
```

---

## 🗄️ Database Creation & Connection

### Database Architecture

BookingTMS uses **Supabase PostgreSQL** with a **KV Store** pattern for most data.

```
┌────────────────────────────────────────────┐
│          SUPABASE DATABASE                 │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────┐    │
│  │  kv_store_84a71643 (Main Table) │    │
│  ├──────────────────────────────────┤    │
│  │  • key (text, primary key)       │    │
│  │  • value (jsonb)                 │    │
│  │  • created_at (timestamp)        │    │
│  │  • updated_at (timestamp)        │    │
│  └──────────────────────────────────┘    │
│                                            │
│  ┌──────────────────────────────────┐    │
│  │  auth.users (Built-in)           │    │
│  │  • Managed by Supabase Auth      │    │
│  └──────────────────────────────────┘    │
│                                            │
└────────────────────────────────────────────┘
```

### KV Store Functions

**Import in Server Code:**
```tsx
import * as kv from './kv_store.tsx';
```

**Available Functions:**

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `set()` | `key: string, value: any` | `Promise<void>` | Store single value |
| `get()` | `key: string` | `Promise<any>` | Retrieve single value |
| `mget()` | `keys: string[]` | `Promise<any[]>` | Retrieve multiple values |
| `mset()` | `entries: Record<string, any>` | `Promise<void>` | Store multiple values |
| `del()` | `key: string` | `Promise<void>` | Delete single value |
| `mdel()` | `keys: string[]` | `Promise<void>` | Delete multiple values |
| `getByPrefix()` | `prefix: string` | `Promise<any[]>` | Get all keys with prefix |

---

### Database Pattern 1: CRUD Operations

**CREATE - Add New Record**

```tsx
// Server: /supabase/functions/server/index.tsx
import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

app.post('/make-server-84a71643/bookings', async (c) => {
  try {
    const body = await c.req.json();
    
    // Generate unique ID
    const id = crypto.randomUUID();
    
    // Create booking object
    const booking = {
      id,
      customerName: body.customerName,
      gameId: body.gameId,
      date: body.date,
      time: body.time,
      players: body.players,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Store in KV store
    await kv.set(`booking:${id}`, booking);
    
    return c.json({ booking }, 201);
  } catch (error) {
    console.error('Create booking error:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

**READ - Get Single Record**

```tsx
app.get('/make-server-84a71643/bookings/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Retrieve from KV store
    const booking = await kv.get(`booking:${id}`);
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    return c.json({ booking });
  } catch (error) {
    console.error('Get booking error:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

**READ - Get All Records**

```tsx
app.get('/make-server-84a71643/bookings', async (c) => {
  try {
    // Get all bookings using prefix
    const bookings = await kv.getByPrefix('booking:');
    
    // Sort by date (newest first)
    const sorted = bookings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json({ bookings: sorted });
  } catch (error) {
    console.error('List bookings error:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

**UPDATE - Modify Record**

```tsx
app.put('/make-server-84a71643/bookings/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    // Get existing booking
    const existing = await kv.get(`booking:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    // Merge updates
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    // Save back to KV store
    await kv.set(`booking:${id}`, updated);
    
    return c.json({ booking: updated });
  } catch (error) {
    console.error('Update booking error:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

**DELETE - Remove Record**

```tsx
app.delete('/make-server-84a71643/bookings/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Check if exists
    const existing = await kv.get(`booking:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    // Delete from KV store
    await kv.del(`booking:${id}`);
    
    return c.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

---

### Database Pattern 2: Relationships

**One-to-Many (Game → Bookings)**

```tsx
// Store game
await kv.set('game:escape-room-1', {
  id: 'escape-room-1',
  name: 'Mystery Mansion',
  description: 'Solve the mystery',
  duration: 60,
  maxPlayers: 6,
  difficulty: 'medium',
});

// Store bookings with game reference
await kv.set('booking:123', {
  id: '123',
  gameId: 'escape-room-1', // ← Reference
  customerName: 'John Doe',
  date: '2025-11-05',
  time: '19:00',
});

// Get game with all bookings
app.get('/make-server-84a71643/games/:id/bookings', async (c) => {
  try {
    const gameId = c.req.param('id');
    
    // Get game
    const game = await kv.get(`game:${gameId}`);
    
    // Get all bookings
    const allBookings = await kv.getByPrefix('booking:');
    
    // Filter bookings for this game
    const gameBookings = allBookings.filter(b => b.gameId === gameId);
    
    return c.json({
      game,
      bookings: gameBookings,
    });
  } catch (error) {
    console.error('Get game bookings error:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

**Many-to-Many (Staff → Shifts)**

```tsx
// Store staff member
await kv.set('staff:alice', {
  id: 'alice',
  name: 'Alice Smith',
  email: 'alice@bookingtms.com',
  role: 'manager',
});

// Store shift assignments
await kv.set('shift:2025-11-05-morning', {
  id: '2025-11-05-morning',
  date: '2025-11-05',
  time: 'morning',
  staffIds: ['alice', 'bob', 'charlie'], // ← Array of references
});

// Get staff with their shifts
app.get('/make-server-84a71643/staff/:id/shifts', async (c) => {
  try {
    const staffId = c.req.param('id');
    
    // Get staff
    const staff = await kv.get(`staff:${staffId}`);
    
    // Get all shifts
    const allShifts = await kv.getByPrefix('shift:');
    
    // Filter shifts that include this staff member
    const staffShifts = allShifts.filter(shift => 
      shift.staffIds.includes(staffId)
    );
    
    return c.json({
      staff,
      shifts: staffShifts,
    });
  } catch (error) {
    console.error('Get staff shifts error:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

---

### Database Pattern 3: Search & Filtering

```tsx
app.get('/make-server-84a71643/bookings/search', async (c) => {
  try {
    // Get query parameters
    const query = c.req.query('q');
    const status = c.req.query('status');
    const date = c.req.query('date');
    
    // Get all bookings
    let bookings = await kv.getByPrefix('booking:');
    
    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      bookings = bookings.filter(b => 
        b.customerName.toLowerCase().includes(lowerQuery) ||
        b.email?.toLowerCase().includes(lowerQuery)
      );
    }
    
    // Filter by status
    if (status) {
      bookings = bookings.filter(b => b.status === status);
    }
    
    // Filter by date
    if (date) {
      bookings = bookings.filter(b => b.date === date);
    }
    
    // Sort by created date (newest first)
    bookings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json({ bookings, count: bookings.length });
  } catch (error) {
    console.error('Search bookings error:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

---

### Database Pattern 4: Pagination

```tsx
app.get('/make-server-84a71643/bookings/paginated', async (c) => {
  try {
    // Get pagination params
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    
    // Get all bookings
    const allBookings = await kv.getByPrefix('booking:');
    
    // Sort by date
    allBookings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Calculate pagination
    const total = allBookings.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // Get page of results
    const bookings = allBookings.slice(startIndex, endIndex);
    
    return c.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Paginated bookings error:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

---

### Database Pattern 5: Aggregations & Stats

```tsx
app.get('/make-server-84a71643/stats/bookings', async (c) => {
  try {
    // Get all bookings
    const bookings = await kv.getByPrefix('booking:');
    
    // Calculate stats
    const stats = {
      total: bookings.length,
      byStatus: {
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
      },
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0),
      totalPlayers: bookings.reduce((sum, b) => sum + (b.players || 0), 0),
      byGame: {},
      byDate: {},
    };
    
    // Group by game
    bookings.forEach(b => {
      if (!stats.byGame[b.gameId]) {
        stats.byGame[b.gameId] = 0;
      }
      stats.byGame[b.gameId]++;
    });
    
    // Group by date
    bookings.forEach(b => {
      if (!stats.byDate[b.date]) {
        stats.byDate[b.date] = 0;
      }
      stats.byDate[b.date]++;
    });
    
    return c.json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

---

### Key Naming Conventions

Use clear, consistent prefixes for organization:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `booking:` | Booking records | `booking:abc-123` |
| `game:` | Game/room records | `game:escape-room-1` |
| `customer:` | Customer profiles | `customer:john@example.com` |
| `staff:` | Staff members | `staff:alice` |
| `shift:` | Staff shifts | `shift:2025-11-05-morning` |
| `waiver:` | Digital waivers | `waiver:booking-abc-123` |
| `payment:` | Payment records | `payment:ch_abc123` |
| `config:` | App configuration | `config:email-settings` |
| `notification:` | Notifications | `notification:user-123-001` |
| `session:` | Session data | `session:xyz-789` |

---

## 🎨 UI Development Guide

### Dark Mode Implementation

**Every component MUST support dark mode using ThemeContext:**

```tsx
import { useTheme } from '@/components/layout/ThemeContext';

const MyComponent = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Use semantic variables
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const borderClass = isDark ? 'border-gray-800' : 'border-gray-200';
  
  return (
    <div className={`${bgClass} ${textClass} ${borderClass} p-6 rounded-lg border`}>
      <h2>My Component</h2>
      <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
        Secondary text
      </p>
    </div>
  );
};
```

### 3-Tier Background System (Dark Mode)

```tsx
// Level 1: Main background (deepest)
<div className="bg-[#0a0a0a]">
  
  // Level 2: Cards, containers
  <div className="bg-[#161616]">
    
    // Level 3: Modals, elevated elements
    <div className="bg-[#1e1e1e]">
      Content
    </div>
  </div>
</div>
```

### Color Reference

**Light Mode:**
```tsx
// Input fields
className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"

// Cards & containers
className="bg-white border border-gray-200 shadow-sm"

// Labels
className="text-gray-700"

// Secondary text
className="text-gray-600"

// Icons
className="text-gray-400"
```

**Dark Mode:**
```tsx
// Backgrounds
bg-[#0a0a0a]  // Main
bg-[#161616]  // Cards
bg-[#1e1e1e]  // Modals

// Text
text-white          // Primary
text-gray-400       // Secondary
text-gray-500       // Tertiary

// Borders
border-gray-800     // Standard
border-gray-700     // Lighter

// Primary color
#4f46e5            // Vibrant blue (always)
```

### Responsive Design (Mobile-First)

```tsx
// ✅ CORRECT - Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ❌ WRONG - Desktop first
<div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1">

// Common breakpoints
sm:   // 640px
md:   // 768px
lg:   // 1024px
xl:   // 1280px
2xl:  // 1536px
```

### Form Styling (Explicit Overrides)

```tsx
// ALWAYS explicitly set classes to override base component defaults
<div className="space-y-4">
  {/* Label */}
  <Label className="text-gray-700">
    Name *
  </Label>
  
  {/* Input */}
  <Input
    className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
    placeholder="Enter name"
  />
  
  {/* Select */}
  <Select>
    <SelectTrigger className="h-12 bg-gray-100 border-gray-300">
      <SelectValue placeholder="Choose option" />
    </SelectTrigger>
  </Select>
  
  {/* Textarea */}
  <Textarea
    className="bg-gray-100 border-gray-300 placeholder:text-gray-500 min-h-[100px]"
    placeholder="Enter description"
  />
</div>
```

---

## 🔐 Authentication & Authorization

### Frontend Authentication

**Check Login Status:**

```tsx
import { useAuth } from '@/lib/auth/AuthContext';

const MyComponent = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <p>Welcome, {currentUser.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

**Login Flow:**

```tsx
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { toast } from 'sonner@2.0.3';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const handleLogin = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Store session
    const accessToken = data.session?.access_token;
    localStorage.setItem('supabase_access_token', accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    toast.success('Login successful!');
    navigate('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    toast.error('Invalid credentials');
  }
};
```

### Backend Authentication

**Protected Route Pattern:**

```tsx
// Server: /supabase/functions/server/index.tsx
import { createClient } from 'npm:@supabase/supabase-js@2';

app.get('/make-server-84a71643/protected-route', async (c) => {
  try {
    // Extract token from Authorization header
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
    
    // User is authenticated ✅
    // Access user details
    const userId = user.id;
    const userEmail = user.email;
    const userName = user.user_metadata?.name;
    const userRole = user.user_metadata?.role;
    
    // Your protected logic here
    const data = await kv.get(`user:${userId}:data`);
    
    return c.json({ data });
    
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
});
```

---

## 📡 API Development

### Complete API Endpoint Example

**Server Implementation:**

```tsx
// File: /supabase/functions/server/index.tsx
import { Hono } from 'npm:hono@4';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors({ origin: '*', credentials: true }));
app.use('*', logger(console.log));

// Health check
app.get('/make-server-84a71643/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create booking
app.post('/make-server-84a71643/bookings', async (c) => {
  try {
    // Parse request body
    const body = await c.req.json();
    
    // Validate required fields
    if (!body.customerName || !body.gameId || !body.date) {
      return c.json({ 
        error: 'Missing required fields: customerName, gameId, date' 
      }, 400);
    }
    
    // Create booking
    const id = crypto.randomUUID();
    const booking = {
      id,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      gameId: body.gameId,
      date: body.date,
      time: body.time,
      players: body.players || 1,
      status: 'pending',
      totalAmount: body.totalAmount || 0,
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Save to database
    await kv.set(`booking:${id}`, booking);
    
    // Log success
    console.log('Booking created:', id);
    
    // Return response
    return c.json({ 
      message: 'Booking created successfully',
      booking 
    }, 201);
    
  } catch (error) {
    console.error('Create booking error:', error);
    return c.json({ 
      error: 'Failed to create booking',
      details: error.message 
    }, 500);
  }
});

// Get all bookings
app.get('/make-server-84a71643/bookings', async (c) => {
  try {
    const bookings = await kv.getByPrefix('booking:');
    
    // Sort by date (newest first)
    bookings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json({ 
      bookings,
      count: bookings.length 
    });
    
  } catch (error) {
    console.error('List bookings error:', error);
    return c.json({ 
      error: 'Failed to fetch bookings',
      details: error.message 
    }, 500);
  }
});

// Get single booking
app.get('/make-server-84a71643/bookings/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const booking = await kv.get(`booking:${id}`);
    
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    return c.json({ booking });
    
  } catch (error) {
    console.error('Get booking error:', error);
    return c.json({ 
      error: 'Failed to fetch booking',
      details: error.message 
    }, 500);
  }
});

// Update booking
app.put('/make-server-84a71643/bookings/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const updates = await c.req.json();
    
    // Get existing booking
    const existing = await kv.get(`booking:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    // Merge updates
    const updated = {
      ...existing,
      ...updates,
      id: existing.id, // Preserve ID
      createdAt: existing.createdAt, // Preserve created date
      updatedAt: new Date().toISOString(), // Update timestamp
    };
    
    // Save
    await kv.set(`booking:${id}`, updated);
    
    console.log('Booking updated:', id);
    
    return c.json({ 
      message: 'Booking updated successfully',
      booking: updated 
    });
    
  } catch (error) {
    console.error('Update booking error:', error);
    return c.json({ 
      error: 'Failed to update booking',
      details: error.message 
    }, 500);
  }
});

// Delete booking
app.delete('/make-server-84a71643/bookings/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Check if exists
    const existing = await kv.get(`booking:${id}`);
    
    if (!existing) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    // Delete
    await kv.del(`booking:${id}`);
    
    console.log('Booking deleted:', id);
    
    return c.json({ 
      message: 'Booking deleted successfully' 
    });
    
  } catch (error) {
    console.error('Delete booking error:', error);
    return c.json({ 
      error: 'Failed to delete booking',
      details: error.message 
    }, 500);
  }
});

// Start server
Deno.serve(app.fetch);
```

**Frontend API Client:**

```tsx
// File: /utils/api/bookings.ts
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-84a71643`;

export const bookingsApi = {
  // Create booking
  create: async (data: any) => {
    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }
    
    return response.json();
  },
  
  // Get all bookings
  getAll: async () => {
    const response = await fetch(`${API_BASE}/bookings`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    
    return response.json();
  },
  
  // Get single booking
  getById: async (id: string) => {
    const response = await fetch(`${API_BASE}/bookings/${id}`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Booking not found');
      }
      throw new Error('Failed to fetch booking');
    }
    
    return response.json();
  },
  
  // Update booking
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE}/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update booking');
    }
    
    return response.json();
  },
  
  // Delete booking
  delete: async (id: string) => {
    const response = await fetch(`${API_BASE}/bookings/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete booking');
    }
    
    return response.json();
  },
};
```

**Using API in Component:**

```tsx
import { useState, useEffect } from 'react';
import { bookingsApi } from '@/utils/api/bookings';
import { toast } from 'sonner@2.0.3';

const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchBookings();
  }, []);
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { bookings } = await bookingsApi.getAll();
      setBookings(bookings);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      await bookingsApi.delete(id);
      toast.success('Booking deleted');
      fetchBookings(); // Refresh list
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete booking');
    }
  };
  
  return (
    <div>
      {/* UI here */}
    </div>
  );
};
```

---

## 🐛 Debugging & Troubleshooting

### Issue 1: Dark Mode Not Working

**Symptoms:**
- Component doesn't change with theme toggle
- Colors stay the same in dark mode
- `isDark` is undefined

**Solution:**

```tsx
// ❌ WRONG - Missing theme context
const MyComponent = () => {
  return <div className="bg-white">Content</div>;
};

// ✅ CORRECT - Using theme context
import { useTheme } from '@/components/layout/ThemeContext';

const MyComponent = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={isDark ? 'bg-[#161616]' : 'bg-white'}>
      Content
    </div>
  );
};
```

---

### Issue 2: API Calls Failing

**Symptoms:**
- 401 Unauthorized
- CORS errors
- Network errors

**Solution Checklist:**

```tsx
// ✅ Check 1: Correct URL format
const url = `https://${projectId}.supabase.co/functions/v1/make-server-84a71643/endpoint`;

// ✅ Check 2: Authorization header
headers: {
  'Authorization': `Bearer ${publicAnonKey}`,
}

// ✅ Check 3: Content-Type for POST/PUT
headers: {
  'Content-Type': 'application/json',
}

// ✅ Check 4: Error handling
try {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  console.error('API error:', error);
}
```

---

### Issue 3: KV Store Returns Null

**Symptoms:**
- `kv.get()` returns null
- Data not persisting
- Can't retrieve data

**Solution:**

```tsx
// ❌ WRONG - Inconsistent key format
await kv.set('booking123', data);
const result = await kv.get('booking:123'); // Won't find it!

// ✅ CORRECT - Consistent keys
await kv.set('booking:123', data);
const result = await kv.get('booking:123'); // ✅ Found!

// ✅ Check if data exists before using
const booking = await kv.get('booking:123');
if (!booking) {
  console.log('Booking not found');
  return;
}
console.log('Booking:', booking);
```

---

### Issue 4: Permission Errors

**Symptoms:**
- Features hidden for admin users
- Permission guards not working
- Role checks failing

**Solution:**

```tsx
// ✅ Check 1: User is logged in
import { useAuth } from '@/lib/auth/AuthContext';

const { currentUser, isAuthenticated } = useAuth();

if (!isAuthenticated) {
  console.log('User not logged in');
}

console.log('User role:', currentUser?.role);

// ✅ Check 2: Permission exists
import { hasPermission } from '@/lib/auth/permissions';

const canEdit = hasPermission('bookings.edit', currentUser?.role);
console.log('Can edit:', canEdit);

// ✅ Check 3: PermissionGuard usage
<PermissionGuard permissions={['bookings.edit']}>
  <Button>Edit</Button>
</PermissionGuard>
```

---

### Issue 5: Build Errors

**Common Build Errors:**

```bash
# Error: Cannot find module
# Solution: Check import path
import { Component } from '@/components/Component'; // ✅
import { Component } from './components/Component'; // ❌

# Error: Type error
# Solution: Add TypeScript types
const handleChange = (value: string) => { // ✅
const handleChange = (value) => { // ❌

# Error: Unexpected token
# Solution: Check JSX syntax
return (
  <div>
    <Component />
  </div>
); // ✅

return (
  <div>
    <Component>
  </div>
); // ❌ Missing closing tag
```

---

## ✅ Pre-Deployment Checklist

### Design & UX
- [ ] Dark mode implemented and tested
- [ ] Mobile-responsive (tested at 375px, 768px, 1024px)
- [ ] All interactive elements have hover/focus states
- [ ] Loading states for all async operations
- [ ] Error states with user-friendly messages
- [ ] Empty states (no data) handled
- [ ] Success feedback (toasts/messages)

### Functionality
- [ ] All CRUD operations work
- [ ] Form validation implemented
- [ ] API error handling in place
- [ ] Permission guards applied correctly
- [ ] Data persists in KV store
- [ ] Search/filter functions work
- [ ] Pagination works (if applicable)

### Code Quality
- [ ] No console errors in browser
- [ ] No TypeScript errors
- [ ] Imports use correct paths (@/)
- [ ] Components properly typed
- [ ] Semantic variable names
- [ ] Comments on complex logic
- [ ] No hardcoded values (use constants)

### Security
- [ ] No service keys in frontend
- [ ] Protected routes use auth middleware
- [ ] User input sanitized
- [ ] SQL injection safe (using KV store)
- [ ] XSS prevention (React handles this)

### Performance
- [ ] No unnecessary re-renders
- [ ] Images optimized
- [ ] Data fetched only when needed
- [ ] Debounce on search inputs
- [ ] Lazy loading where appropriate

---

## 📚 Reference Documentation

### Core Guides
- **Main Guidelines**: `/guidelines/Guidelines.md`
- **Design System**: `/guidelines/DESIGN_SYSTEM.md`
- **Component Library**: `/guidelines/COMPONENT_LIBRARY.md`
- **AI Quick Start**: `/guidelines/AI_AGENT_QUICK_START.md`

### Specialized Guides
- **Quick Reference**: `/AI_BUILDER_QUICK_REFERENCE.md`
- **Database Guide**: `/DATABASE_CONNECTION_GUIDE.md`
- **Auth System**: `/lib/auth/README.md`
- **Backend API**: `/backend/README.md`
- **Dark Mode**: `/DARK_MODE_COLOR_GUIDE.md`
- **Supabase Setup**: `/SUPABASE_QUICK_START.md`

### Example Files
- **Admin Page**: `/pages/Dashboard.tsx`
- **Data Table**: `/pages/Bookings.tsx`
- **Full Feature**: `/pages/Notifications.tsx`
- **Form Dialog**: `/components/customers/AddCustomerDialog.tsx`
- **Widget**: `/components/widgets/FareBookWidget.tsx`
- **API Server**: `/supabase/functions/server/index.tsx`

---

## 🎓 Learning Path

### Day 1: Foundation (1-2 hours)
1. Read this guide (30 min)
2. Review `/guidelines/AI_AGENT_QUICK_START.md` (15 min)
3. Examine `/pages/Dashboard.tsx` (15 min)
4. Test dark mode toggle in browser (10 min)
5. Explore Backend Dashboard (10 min)

### Day 2: Basic Development (2-3 hours)
1. Create a simple admin page
2. Add dark mode support
3. Make it responsive
4. Test at different screen sizes

### Day 3: Database Integration (2-3 hours)
1. Create API endpoint in server
2. Use KV store for data
3. Build frontend component to consume API
4. Test CRUD operations

### Day 4: Advanced Features (3-4 hours)
1. Add authentication to routes
2. Implement permission guards
3. Create form with validation
4. Add search/filter functionality

### Week 2: Production Features
1. Build complete feature end-to-end
2. Add error handling everywhere
3. Implement loading states
4. Write comprehensive tests
5. Deploy and monitor

---

## 🚀 Quick Commands for AI Builder

### Create New Page
```
Create a new admin page called [PageName] that displays [data].
Include:
- AdminLayout wrapper
- PageHeader with title
- Dark mode support
- Mobile-responsive grid
- Loading and error states
- Permission guard for [role]
```

### Add API Endpoint
```
Add API endpoint /make-server-84a71643/[endpoint] that:
- Accepts [method] requests
- Stores data in KV store with prefix "[prefix]:"
- Returns [response format]
- Includes error handling
```

### Fix Dark Mode
```
Fix dark mode support for [component].
Use 3-tier backgrounds:
- #0a0a0a for main
- #161616 for cards
- #1e1e1e for modals
Ensure all text is readable in both modes.
```

### Add Form
```
Create form dialog for [purpose] with fields:
- [field1] (type)
- [field2] (type)
- [field3] (type)

Include:
- Validation
- Loading state
- Error handling
- Success toast
- Dark mode support
```

---

## 📞 Support & Help

**When Stuck:**
1. Check this guide first
2. Review relevant documentation
3. Examine similar existing code
4. Check browser console for errors
5. Test in Backend Dashboard

**Common Resources:**
- Guidelines: `/guidelines/Guidelines.md`
- Examples: `/pages/*.tsx`
- API: `/supabase/functions/server/index.tsx`
- Permissions: `/lib/auth/permissions.ts`

---

**Version**: 4.0  
**Last Updated**: November 4, 2025  
**Status**: ✅ Production Ready  
**Maintained By**: BookingTMS Development Team

**Remember:**
- ✅ Always implement dark mode
- ✅ Always make responsive
- ✅ Always handle errors
- ✅ Always use KV store first
- ✅ Never expose service keys
- ✅ Always add permission guards
- ✅ Always test thoroughly

**Happy Building! 🚀**
