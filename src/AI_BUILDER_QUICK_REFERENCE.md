# 🤖 Trae AI Builder Quick Reference

**Quick access guide for using Claude Sonnet 4 (Trae AI Builder) with BookingTMS**

---

## 🚀 Essential Commands

### Starting a New Feature
```
I need to build [feature name] that [description].

Context:
- User role: [Admin/Manager/Staff]
- Page: [which page]
- Permissions: [required permissions]

Requirements:
1. [req 1]
2. [req 2]

Must have dark mode, mobile-responsive, follow design system.
```

### Database Operations
```
Set up data storage for [feature]:

Data: 
- [field]: [type]

Use KV store with prefix "[prefix]:"
```

### Fixing Issues
```
Fix issue with [component]:
Problem: [describe]
Expected: [what should happen]
Current: [what happens]
Code: [paste code]
Errors: [paste errors]
```

---

## 📦 KV Store Cheat Sheet

```tsx
// Import in server code
import * as kv from './kv_store.tsx';

// Set single value
await kv.set('booking:123', { name: 'John', date: '2025-11-04' });

// Get single value
const booking = await kv.get('booking:123');

// Get multiple
const bookings = await kv.mget(['booking:123', 'booking:456']);

// Get by prefix (all bookings)
const allBookings = await kv.getByPrefix('booking:');

// Delete
await kv.del('booking:123');

// Set multiple
await kv.mset({
  'booking:123': { data1 },
  'booking:456': { data2 }
});
```

---

## 🎨 Dark Mode Template

```tsx
import { useTheme } from '@/components/layout/ThemeContext';

const MyComponent = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={isDark ? 'bg-[#161616] text-white' : 'bg-white text-gray-900'}>
      <input 
        className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
        placeholder="Enter text"
      />
      <button 
        style={{ backgroundColor: isDark ? '#4f46e5' : '#4f46e5' }}
        className="text-white px-4 py-2 rounded"
      >
        Submit
      </button>
    </div>
  );
};
```

---

## 🔐 Permission Guard

```tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard';

<PermissionGuard permissions={['bookings.edit']}>
  <Button>Edit Booking</Button>
</PermissionGuard>
```

---

## 🌐 API Calls

### Frontend
```tsx
import { projectId, publicAnonKey } from './utils/supabase/info';

// GET
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-84a71643/endpoint`,
  {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  }
);
const data = await response.json();

// POST
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-84a71643/endpoint`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: 'value' }),
  }
);
```

### Backend Route
```tsx
// In /supabase/functions/server/index.tsx
import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

app.get('/make-server-84a71643/endpoint', async (c) => {
  try {
    const data = await kv.getByPrefix('prefix:');
    return c.json(data);
  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-84a71643/endpoint', async (c) => {
  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    await kv.set(`prefix:${id}`, body);
    return c.json({ id }, 201);
  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: error.message }, 500);
  }
});
```

---

## 🔒 Protected Route

```tsx
// Server side
app.get('/make-server-84a71643/protected', async (c) => {
  const authHeader = c.req.header('Authorization');
  const accessToken = authHeader?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  // User authenticated - proceed
  const data = await kv.get(`user:${user.id}`);
  return c.json(data);
});
```

---

## 🎯 Page Template

```tsx
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTheme } from '@/components/layout/ThemeContext';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

const MyPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      // Fetch logic
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  return (
    <AdminLayout>
      <PageHeader title="Page Title" />
      
      <div className={`p-6 ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <Card className={`p-6 ${isDark ? 'bg-[#161616]' : 'bg-white'}`}>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>{/* Content */}</div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default MyPage;
```

---

## ✅ Pre-Build Checklist

- [ ] Dark mode implemented (ThemeContext)
- [ ] Mobile-responsive (mobile-first)
- [ ] Colors: vibrant blue (#4f46e5)
- [ ] Inputs: bg-gray-100 border-gray-300
- [ ] Cards: bg-white border-gray-200 shadow-sm
- [ ] Labels: text-gray-700
- [ ] Permissions checked (PermissionGuard)
- [ ] Error handling added
- [ ] Loading states included

---

## 🚫 Common Mistakes

### ❌ Don't Do
```tsx
// No dark mode
<div className="bg-white">

// Exposing service key in frontend
const key = 'service_role_key_123';

// No error handling
const data = await fetch('/api');

// Custom table creation
await supabase.from('new_table').insert();
```

### ✅ Do This
```tsx
// With dark mode
const { theme } = useTheme();
const isDark = theme === 'dark';
<div className={isDark ? 'bg-[#161616]' : 'bg-white'}>

// Use public key in frontend
import { publicAnonKey } from './utils/supabase/info';

// With error handling
try {
  const response = await fetch('/api');
  if (!response.ok) throw new Error();
  const data = await response.json();
} catch (error) {
  console.error('Error:', error);
  toast.error('Failed');
}

// Use KV store
import * as kv from './kv_store.tsx';
await kv.set('key', value);
```

---

## 📚 Quick Links

**Must Read:**
- `/guidelines/Guidelines.md` → Main guide (AI Builder section)
- `/guidelines/AI_AGENT_QUICK_START.md` → Fast patterns
- `/guidelines/DESIGN_SYSTEM.md` → Design rules

**Reference:**
- `/SUPABASE_QUICK_START.md` → Database setup
- `/lib/auth/README.md` → RBAC permissions
- `/backend/README.md` → Backend architecture

**Examples:**
- `/pages/Dashboard.tsx` → Admin page
- `/pages/Bookings.tsx` → Data table
- `/supabase/functions/server/index.tsx` → API routes

---

## 🎨 Color Quick Reference

### Light Mode
- **Inputs**: `bg-gray-100 border-gray-300`
- **Cards**: `bg-white border-gray-200 shadow-sm`
- **Labels**: `text-gray-700`
- **Secondary**: `text-gray-600`
- **Placeholder**: `placeholder:text-gray-500`

### Dark Mode
- **Background (main)**: `bg-[#0a0a0a]`
- **Cards**: `bg-[#161616]`
- **Elevated**: `bg-[#1e1e1e]`
- **Primary**: `#4f46e5` (vibrant blue)
- **Text**: `text-white`

---

## 🔥 Speed Commands

**Create new admin page:**
```
Create [PageName] page with [features]. Follow Dashboard.tsx pattern. 
Include dark mode, mobile-responsive, and PermissionGuard for [permission].
```

**Add API endpoint:**
```
Add /make-server-84a71643/[endpoint] route that [action]. 
Use KV store with prefix "[prefix]:". Include error handling.
```

**Fix dark mode:**
```
Fix dark mode on [component]. Should use 3-tier backgrounds:
#0a0a0a (main), #161616 (cards), #1e1e1e (modals).
```

**Add form:**
```
Create form for [purpose] with fields: [fields]. 
Use react-hook-form@7.55.0 with Zod validation.
Style: bg-gray-100 inputs, text-gray-700 labels.
```

---

## 💡 Pro Tips

1. **Always reference existing code**: "Like Dashboard.tsx but for [feature]"
2. **Test incrementally**: Build → Dark mode → Mobile → Test
3. **Use KV store**: Don't create custom tables unless absolutely needed
4. **Never expose service key**: Only in backend, never frontend
5. **Permission everything**: Wrap protected features in PermissionGuard
6. **Error handling**: Every API call needs try/catch
7. **Loading states**: Every async operation needs loading UI

---

## 🆘 Troubleshooting

**Dark mode not working?**
→ Check if `useTheme()` is imported and `isDark` is defined

**API call failing?**
→ Check authorization header has Bearer token
→ Check route prefix: `/make-server-84a71643/`

**Permission issue?**
→ Verify user has required permission in `/lib/auth/permissions.ts`
→ Check PermissionGuard is wrapping component

**Styling looks wrong?**
→ Explicitly set classes: `bg-gray-100 border-gray-300`
→ Don't rely on component defaults

**Build error?**
→ Check imports use correct paths
→ Verify all dependencies are imported

---

**Version**: 3.3  
**Last Updated**: November 4, 2025  
**For full details**: See `/guidelines/Guidelines.md` → 🤖 Trae AI Builder Development Guide
