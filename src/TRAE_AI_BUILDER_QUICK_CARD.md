# 🤖 Trae AI Builder Quick Reference Card
**Claude Sonnet 4 Development for BookingTMS**

---

## 🎯 **MVP-FIRST APPROACH** ⭐ **READ THIS FIRST!**

```
┌──────────────────────────────────────────────────────────┐
│  ⚠️ CRITICAL: PHASED IMPLEMENTATION STRATEGY             │
│                                                           │
│  Phase 1: MVP - Make basic functions work FIRST (85%)    │
│  ├─ Use localStorage for data                            │
│  ├─ Use mock data for testing                            │
│  ├─ Focus on core workflows                              │
│  └─ Get app fully functional                             │
│                                                           │
│  Phase 2: Database (DO NOT START until Phase 1 = 100%)   │
│  ├─ Connect to Supabase                                  │
│  ├─ Real API endpoints                                   │
│  └─ Replace localStorage                                 │
│                                                           │
│  Phase 3+: Advanced Features (DO NOT START YET)          │
│  ├─ Payments, Email, SMS                                 │
│  └─ Real-time, Analytics                                 │
│                                                           │
│  👉 GOLDEN RULE: "Make it work, then make it better"     │
└──────────────────────────────────────────────────────────┘
```

**📋 Full MVP Checklist**: `/MVP_PHASE_1_CHECKLIST.md`  
**📖 Full Roadmap**: `/PRD_BOOKINGTMS_ENTERPRISE.md` Section 4.2

---

## 📖 Essential Documentation

```
┌─────────────────────────────────────────────────────────┐
│  PRIMARY GUIDE (Start Here)                             │
│  /TRAE_AI_BUILDER_MASTER_GUIDE.md                       │
│  ├─ Complete development workflow                       │
│  ├─ Database patterns & setup                           │
│  ├─ API development                                     │
│  └─ Debugging guide                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  QUICK REFERENCE                                         │
│  /AI_BUILDER_QUICK_REFERENCE.md                         │
│  ├─ Code snippets                                       │
│  ├─ Common patterns                                     │
│  └─ Speed commands                                      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  DATABASE GUIDE                                          │
│  /DATABASE_CONNECTION_GUIDE.md                          │
│  ├─ KV Store patterns                                   │
│  ├─ Connection testing                                  │
│  └─ Auth flows                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ⚡ 30-Second Quick Start

### 1. Verify Database Connection
```
Navigate to: /backend-dashboard (Super Admin only)
Click: "Test Database Connection"
Expected: ✅ Connection Successful
```

### 2. Create New Feature
```tsx
// File: /pages/MyPage.tsx
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useTheme } from '@/components/layout/ThemeContext';

const MyPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <AdminLayout>
      <div className={isDark ? 'bg-[#161616]' : 'bg-white'}>
        Content
      </div>
    </AdminLayout>
  );
};

export default MyPage;
```

### 3. Add API Endpoint
```tsx
// File: /supabase/functions/server/index.tsx
import * as kv from './kv_store.tsx';

app.get('/make-server-84a71643/data', async (c) => {
  const data = await kv.getByPrefix('key:');
  return c.json({ data });
});
```

---

## 🎯 The 8 Golden Rules

```
1. ✅ DARK MODE IS MANDATORY
   → Every component must support dark mode with ThemeContext

2. ✅ MOBILE-FIRST DESIGN
   → Build for mobile, enhance for desktop

3. ✅ EXPLICIT STYLING
   → Always override: bg-gray-100 border-gray-300 placeholder:text-gray-500

4. ✅ USE KV STORE
   → Default to KV store, avoid custom tables

5. ✅ NEVER EXPOSE SERVICE KEYS
   → Service keys ONLY in backend, never frontend

6. ✅ PERMISSION GUARDS EVERYWHERE
   → Wrap sensitive features in <PermissionGuard>

7. ✅ ERROR HANDLING ALWAYS
   → Every async operation needs try/catch

8. ✅ LOADING STATES ALWAYS
   → Every data fetch needs loading UI
```

---

## 🎨 Color System (Must Use)

### Light Mode
```tsx
// Input fields
className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"

// Cards
className="bg-white border border-gray-200 shadow-sm"

// Labels
className="text-gray-700"

// Secondary text
className="text-gray-600"
```

### Dark Mode (3-Tier System)
```tsx
// Main background
className="bg-[#0a0a0a]"

// Cards & containers
className="bg-[#161616]"

// Modals & elevated
className="bg-[#1e1e1e]"

// Primary color (ALWAYS)
style={{ backgroundColor: '#4f46e5' }}
```

---

## 🗄️ KV Store Cheat Sheet

```tsx
import * as kv from './kv_store.tsx';

// CREATE
await kv.set('booking:123', { name: 'John', date: '2025-11-05' });

// READ (single)
const booking = await kv.get('booking:123');

// READ (all with prefix)
const bookings = await kv.getByPrefix('booking:');

// READ (multiple)
const items = await kv.mget(['booking:123', 'booking:456']);

// UPDATE (merge pattern)
const existing = await kv.get('booking:123');
await kv.set('booking:123', { ...existing, status: 'confirmed' });

// DELETE
await kv.del('booking:123');
```

### Key Naming Prefixes
```
booking:       → Bookings
game:          → Games/Rooms
customer:      → Customers
staff:         → Staff members
config:        → Configuration
notification:  → Notifications
payment:       → Payments
```

---

## 📡 API Pattern

### Server (Backend)
```tsx
// /supabase/functions/server/index.tsx
import { Hono } from 'npm:hono@4';
import * as kv from './kv_store.tsx';

app.post('/make-server-84a71643/bookings', async (c) => {
  try {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    await kv.set(`booking:${id}`, { id, ...body });
    return c.json({ id }, 201);
  } catch (error) {
    return c.json({ error: error.message }, 500);
  }
});
```

### Frontend
```tsx
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-84a71643/bookings`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }
);
```

---

## 🔐 Authentication

### Frontend (Login)
```tsx
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '@/utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

localStorage.setItem('supabase_access_token', data.session.access_token);
```

### Backend (Protected Route)
```tsx
app.get('/make-server-84a71643/protected', async (c) => {
  const token = c.req.header('Authorization')?.split(' ')[1];
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (!user) return c.json({ error: 'Unauthorized' }, 401);
  
  // ✅ User authenticated
  return c.json({ data: 'protected data' });
});
```

---

## 🛡️ Permissions

```tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { useAuth } from '@/lib/auth/AuthContext';

const MyComponent = () => {
  const { hasPermission } = useAuth();
  
  return (
    <div>
      {/* Method 1: Component guard */}
      <PermissionGuard permissions={['bookings.edit']}>
        <Button>Edit</Button>
      </PermissionGuard>
      
      {/* Method 2: Programmatic check */}
      {hasPermission('bookings.delete') && (
        <Button>Delete</Button>
      )}
    </div>
  );
};
```

**Common Permissions:**
- `bookings.view` / `create` / `edit` / `delete`
- `customers.view` / `create` / `edit` / `delete`
- `games.view` / `create` / `edit` / `delete`
- `settings.view` / `edit`
- `users.manage` (Super Admin only)

---

## 🐛 Quick Troubleshooting

### Dark Mode Not Working?
```tsx
// ❌ Missing ThemeContext
<div className="bg-white">

// ✅ Using ThemeContext
const { theme } = useTheme();
const isDark = theme === 'dark';
<div className={isDark ? 'bg-[#161616]' : 'bg-white'}>
```

### API Failing?
```tsx
// ✅ Checklist
1. URL: https://${projectId}.supabase.co/functions/v1/make-server-84a71643/...
2. Header: Authorization: Bearer ${publicAnonKey}
3. Prefix: All routes start with /make-server-84a71643/
4. Error handling: try/catch block
```

### KV Store Returns Null?
```tsx
// ❌ Inconsistent keys
await kv.set('booking123', data);
await kv.get('booking:123'); // Won't find!

// ✅ Consistent keys
await kv.set('booking:123', data);
await kv.get('booking:123'); // ✅ Found!
```

---

## ✅ Pre-Build Checklist

```
Design:
□ Dark mode with ThemeContext
□ Mobile-responsive (mobile-first)
□ Explicit styling (bg-gray-100, etc.)
□ Vibrant blue (#4f46e5) for primary

Functionality:
□ API endpoints work
□ KV store data persists
□ Error handling everywhere
□ Loading states everywhere

Security:
□ No service keys in frontend
□ Protected routes use auth
□ Permission guards applied

Testing:
□ Test both themes
□ Test mobile & desktop
□ Test all CRUD operations
□ Test error scenarios
```

---

## 📚 Reference Files

**Examples to Copy:**
```
/pages/Dashboard.tsx           → Admin page pattern
/pages/Bookings.tsx            → Data table pattern
/pages/Notifications.tsx       → Full-featured page
/components/customers/AddCustomerDialog.tsx → Form pattern
/supabase/functions/server/index.tsx → API server
```

**Documentation:**
```
/TRAE_AI_BUILDER_MASTER_GUIDE.md → Complete guide
/AI_BUILDER_QUICK_REFERENCE.md   → Quick commands
/DATABASE_CONNECTION_GUIDE.md    → Database patterns
/guidelines/Guidelines.md         → Main guidelines
/lib/auth/README.md               → Auth & permissions
```

---

## 🚀 Speed Commands

### Create Admin Page
```
Create [PageName] page with [features].
Follow Dashboard.tsx pattern.
Include dark mode, mobile-responsive, PermissionGuard for [permission].
```

### Add API Endpoint
```
Add /make-server-84a71643/[endpoint] that [action].
Use KV store prefix "[prefix]:".
Include error handling.
```

### Fix Dark Mode
```
Fix dark mode on [component].
3-tier backgrounds: #0a0a0a (main), #161616 (cards), #1e1e1e (modals).
```

### Create Form
```
Create form for [purpose] with fields: [list].
Use react-hook-form@7.55.0.
Style: bg-gray-100 inputs, text-gray-700 labels.
Include validation and dark mode.
```

---

## 📊 Architecture Quick View

```
┌─────────────────────────────────────────┐
│         FRONTEND (React)                │
│  • Pages (/pages)                       │
│  • Components (/components)             │
│  • Use: publicAnonKey                   │
└────────────┬────────────────────────────┘
             │
             │ HTTPS
             │
┌────────────┴────────────────────────────┐
│         BACKEND (Hono/Deno)             │
│  • API routes                           │
│  • KV Store operations                  │
│  • Use: serviceRoleKey                  │
└────────────┬────────────────────────────┘
             │
             │ PostgreSQL
             │
┌────────────┴────────────────────────────┐
│       SUPABASE DATABASE                 │
│  • kv_store_84a71643 table              │
│  • auth.users table                     │
└─────────────────────────────────────────┘
```

---

## 💡 Pro Tips

1. **Always reference existing code**: "Like Dashboard.tsx but for [feature]"
2. **Test incrementally**: Build → Dark mode → Mobile → Test
3. **Use KV store**: Don't create custom tables unless absolutely needed
4. **Never expose service key**: Only in backend (/supabase/functions/server/)
5. **Permission everything**: Wrap protected features in PermissionGuard
6. **Error handling**: Every API call needs try/catch
7. **Loading states**: Every async operation needs loading UI
8. **Explicit styling**: Always set bg-gray-100, border-gray-300, etc.

---

**Version**: 4.0  
**Last Updated**: November 4, 2025  
**For Full Guide**: `/TRAE_AI_BUILDER_MASTER_GUIDE.md`

**Remember: Dark Mode + Mobile-First + KV Store + Error Handling = Success! 🚀**
