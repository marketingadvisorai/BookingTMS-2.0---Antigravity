# BookingTMS Development Guidelines

## 📚 Documentation Index

This is the main entry point for all development guidelines. For detailed information, refer to the comprehensive guides below:

---

## 🎯 **MVP-FIRST DEVELOPMENT APPROACH** ⭐ **READ THIS FIRST!**

**⚠️ CRITICAL FOR ALL AI BUILDERS:**

This project follows a **PHASED IMPLEMENTATION** strategy:

### **Phase 1: MVP - Core Functionality (CURRENT PRIORITY - 85% COMPLETE)**
✅ **Make basic functions work FIRST**  
✅ Use localStorage for data persistence  
✅ Use mock data and demo features  
✅ Focus on core user workflows  
✅ Get the app fully functional before adding complexity  

**What to Build in Phase 1:**
- ✅ Basic CRUD operations (Create, Read, Update, Delete)
- ✅ Forms that save to localStorage
- ✅ Navigation and routing
- ✅ Dark mode support
- ✅ RBAC permissions
- ⏳ Complete all remaining basic functionality

**What NOT to Build in Phase 1:**
- ❌ Real database connections
- ❌ Real API calls to external services
- ❌ Payment processing
- ❌ Email/SMS sending
- ❌ Advanced analytics
- ❌ Production deployment

### **Phase 2+: Enhancement (DO NOT START UNTIL PHASE 1 IS 100% COMPLETE)**
⏸️ Database integration  
⏸️ Real API endpoints  
⏸️ Payment processing  
⏸️ Advanced features  

**👉 GOLDEN RULE: "Make it work, then make it better"**

**📖 Full Roadmap**: See `/PRD_BOOKINGTMS_ENTERPRISE.md` Section 4.2

---

## 🤖 TRAE AI BUILDER (Claude Sonnet 4) - START HERE!

**For AI-assisted development using Claude Sonnet 4**, use these comprehensive guides:

### **📖 [TRAE AI BUILDER INDEX](/TRAE_AI_BUILDER_INDEX.md)** ⭐ **MAIN ENTRY POINT**
Complete documentation system with learning paths, quick references, and comprehensive guides for building features with AI.

**Quick Links:**
- **[Master Guide](/TRAE_AI_BUILDER_MASTER_GUIDE.md)** - Complete development & database guide
- **[Quick Card](/TRAE_AI_BUILDER_QUICK_CARD.md)** - 30-second quick start & code snippets
- **[Workflow](/TRAE_AI_BUILDER_WORKFLOW.md)** - Visual process diagrams & checklists
- **[Quick Reference](/AI_BUILDER_QUICK_REFERENCE.md)** - Fast commands & patterns
- **[Database Guide](/DATABASE_CONNECTION_GUIDE.md)** - Supabase & KV Store patterns
- **[Database Setup](/SUPABASE_DATABASE_SETUP_GUIDE.md)** 🆕 - Complete setup with demo data

**Recommended Path**: Start with [Quick Card](/TRAE_AI_BUILDER_QUICK_CARD.md) → Read [Master Guide](/TRAE_AI_BUILDER_MASTER_GUIDE.md) → Reference [Index](/TRAE_AI_BUILDER_INDEX.md) as needed

---

## 🔐 Demo Login Credentials

**IMPORTANT:** All demo accounts use the password `demo123` (NOT `admin123`)

| Role | Username | Email | Password |
|------|----------|-------|----------|
| **Super Admin** | `superadmin` | superadmin@bookingtms.com | `demo123` |
| **Admin** | `admin` | admin@bookingtms.com | `demo123` |
| **Manager** | `manager` | manager@bookingtms.com | `demo123` |
| **Staff** | `staff` | staff@bookingtms.com | `demo123` |

**Usage:**
- Login with either **username** OR **email**
- Password is the same for all roles: `demo123`
- DEV_MODE auto-login uses: `superadmin` / `demo123`

---

### Core Documentation
1. **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** ⭐ **START HERE**
   - Complete design system and branding guidelines
   - Color palette (light & dark mode)
   - Typography standards
   - Component patterns
   - Accessibility requirements
   - Code conventions

2. **[COMPONENT_LIBRARY.md](./COMPONENT_LIBRARY.md)**
   - All available UI components
   - Layout components
   - Widget components
   - Usage examples and patterns
   - Props and API reference

3. **[AI_AGENT_QUICK_START.md](./AI_AGENT_QUICK_START.md)** 🚀 **QUICK REFERENCE**
   - Fast onboarding for AI agents
   - Common patterns and templates
   - Dark mode cheat sheet
   - Testing checklist
   - Common mistakes & fixes

### Specialized Guides
- `/DARK_MODE_COLOR_GUIDE.md` - Detailed dark mode color reference
- `/DASHBOARD_DESIGN_GUIDE.md` - Admin portal specifics
- `/components/widgets/WidgetEnhancements.md` - Widget improvements
- `/components/ui/ICONS_GUIDE.md` - 🎨 **Icon Library & Usage Guide**

### 🤖 AI Builder Guides (Trae AI Builder with Sonnet 4)
4. **[/TRAE_AI_BUILDER_MASTER_GUIDE.md](/TRAE_AI_BUILDER_MASTER_GUIDE.md)** 🤖 **COMPLETE AI BUILDER GUIDE**
   - Complete development workflow for AI assistants
   - Database creation & connection patterns
   - Step-by-step feature building
   - API development guide
   - Debugging & troubleshooting
   - Pre-deployment checklist
   - **USE THIS for Trae AI Builder (Claude Sonnet 4) development**

5. **[/AI_BUILDER_QUICK_REFERENCE.md](/AI_BUILDER_QUICK_REFERENCE.md)** ⚡ **QUICK COMMANDS**
   - Fast command reference
   - Code snippets & templates
   - Common patterns
   - Speed commands

6. **[/DATABASE_CONNECTION_GUIDE.md](/DATABASE_CONNECTION_GUIDE.md)** 🗄️ **DATABASE GUIDE**
   - Supabase integration
   - KV Store patterns
   - Connection testing
   - Authentication flows

7. **[/LOCALSTORAGE_IMPLEMENTATION_CARD.md](/LOCALSTORAGE_IMPLEMENTATION_CARD.md)** 💾 **PHASE 1 MVP CRITICAL** ⚠️
   - Complete localStorage persistence guide
   - Copy-paste code templates
   - Testing procedures
   - **REQUIRED to complete Phase 1 MVP (87% → 100%)**

---

## 🎯 Critical Rules (TL;DR)

### **0. MVP-FIRST: Focus on Basic Functionality** ⭐ **HIGHEST PRIORITY**

**BEFORE building ANY new feature, ask:**
1. ✅ "Is this needed for the MVP?"
2. ✅ "Does it use localStorage or mock data?"
3. ❌ "Am I trying to connect to a real database?" (Phase 2 only)
4. ❌ "Am I adding advanced features?" (Phase 3+ only)

**Current Phase 1 Priorities:**
1. **Make all forms save data** ⚠️ **CRITICAL GAP - 13% REMAINING**
   - **Status**: 7 widgets + admin forms missing localStorage persistence
   - **Impact**: Data disappears on page refresh
   - **Fix**: Implement `localStorage.setItem()` and `localStorage.getItem()`
   - **Time**: 8-10 hours to complete
   - **See**: `/LOCALSTORAGE_IMPLEMENTATION_CARD.md` for complete guide
   - Example: Save booking → `localStorage.setItem('bookings', JSON.stringify(bookings))`
   - Load on mount → `const saved = localStorage.getItem('bookings'); setSaved(JSON.parse(saved))`

2. **Complete CRUD operations**
   - Create: Add new items (bookings, games, customers)
   - Read: Display lists and details
   - Update: Edit existing items
   - Delete: Remove items with confirmation

3. **Test core workflows**
   - User can login → navigate → create booking → view booking → edit booking → delete booking
   - All actions save to localStorage
   - Data persists after page refresh

4. **Fix broken functionality**
   - Ensure all buttons work
   - Verify all forms submit
   - Check all links navigate correctly
   - Confirm dark mode works everywhere

**What NOT to Do in Phase 1:**
- ❌ Don't connect to Supabase database (wait for Phase 2)
- ❌ Don't build real API endpoints (wait for Phase 2)
- ❌ Don't implement Stripe payments (wait for Phase 3)
- ❌ Don't add real email/SMS sending (wait for Phase 3)
- ❌ Don't optimize performance (wait for Phase 4)
- ❌ Don't deploy to production (wait for Phase 4)

**localStorage Pattern for MVP:**
```tsx
// Save data
const handleSave = () => {
  const data = { name, email, phone };
  localStorage.setItem('userData', JSON.stringify(data));
  toast.success('Saved successfully');
};

// Load data on mount
useEffect(() => {
  const saved = localStorage.getItem('userData');
  if (saved) {
    const data = JSON.parse(saved);
    setName(data.name);
    setEmail(data.email);
    setPhone(data.phone);
  }
}, []);
```

---

### **⚠️ CRITICAL: Base Component Styling Override**

**IMPORTANT:** Some base UI components (Input, Label, Card, Select, etc.) may have default styling (gap, typography, colors) baked in. You MUST explicitly override these defaults with our design system values.

**Why This Matters:**
- Base components may have conflicting default styles
- Design system consistency requires explicit overrides
- Light mode colors must match across all components

**Always Explicitly Set:**
```tsx
// ❌ WRONG - Relies on component defaults (may be inconsistent)
<Input placeholder="Email" />
<Label>Name</Label>
<Card>Content</Card>

// ✅ CORRECT - Explicitly overrides with design system
<Input 
  className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
  placeholder="Email" 
/>
<Label className="text-gray-700">Name</Label>
<Card className="bg-white border border-gray-200 shadow-sm">
  Content
</Card>
```

**Required Overrides:**
- **Inputs**: `h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500`
- **Labels**: `text-gray-700`
- **Cards**: `bg-white border border-gray-200 shadow-sm`
- **Secondary Text**: `text-gray-600`
- **Buttons**: Explicitly set colors with `style={{ backgroundColor }}` or Tailwind classes

---

### **1. Dark Mode is Mandatory**
Every component MUST support dark mode using ThemeContext:
```tsx
const { theme } = useTheme();
const isDark = theme === 'dark';
const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
```

### **2. Consistent Light Mode Colors (Professional Styling)**
**IMPORTANT:** Always explicitly set light mode colors to ensure consistency:

**Input Fields:**
```tsx
className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
```

**Cards & Containers:**
```tsx
className="bg-white border border-gray-200 shadow-sm"
```

**Labels:**
```tsx
className="text-gray-700"
```

**Secondary Text:**
```tsx
className="text-gray-600"
```

**Summary/Total Boxes:**
```tsx
className="bg-white border border-gray-200 rounded-lg shadow-sm"
```

> **Note:** Base components may have default styling. Always explicitly override with design system colors to maintain consistency.

### **3. Mobile-First Responsive Design**
Always design for mobile first, then enhance:
```tsx
// ✅ Correct
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// ❌ Wrong
<div className="grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
```

### **4. Use Vibrant Blue (#4f46e5) for Primary Actions**
In dark mode, ALWAYS use vibrant blue instead of custom colors:
```tsx
const buttonColor = isDark ? '#4f46e5' : primaryColor;
```

### **5. Never Override Typography (unless requested)**
Let `globals.css` handle default typography:
```tsx
// ❌ Wrong
<h1 className="text-2xl font-bold">Title</h1>

// ✅ Right
<h1>Title</h1>
```

### **6. 3-Tier Background System in Dark Mode**
```
#0a0a0a  → Main background (deepest)
#161616  → Cards, containers
#1e1e1e  → Modals, elevated elements
```

### **7. Accessibility is Required**
- Minimum 4.5:1 contrast ratio
- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators visible
- Touch targets minimum 44x44px

---

## 🏗️ Project Structure

```
BookingTMS/
├── pages/                  # Admin portal pages
│   ├── Dashboard.tsx       # Main dashboard
│   ├── Bookings.tsx        # Bookings management
│   ├── Games.tsx           # Games/rooms management
│   ├── AccountSettings.tsx # User management (Super Admin only)
│   └── ...
├── components/
│   ├── ui/                 # Shadcn reusable components
│   ├── layout/             # AdminLayout, Header, Sidebar
│   │   └── ThemeContext.tsx  # ⭐ Dark mode context
│   ├── auth/               # Authentication components
│   │   └── PermissionGuard.tsx  # Permission-based rendering
│   ├── widgets/            # Customer-facing widgets
│   │   └── WidgetThemeContext.tsx  # Widget theme
│   ├── dashboard/          # Dashboard components
│   ├── games/              # Game components
│   └── waivers/            # Waiver components
├── lib/
│   └── auth/               # 🔐 RBAC System
│       ├── AuthContext.tsx      # Auth context provider
│       ├── permissions.ts       # Role & permission config
│       ├── README.md           # RBAC documentation
│       └── MIGRATION_GUIDE.md  # Integration guide
├── types/
│   └── auth.ts            # Auth type definitions
├── styles/
│   └── globals.css         # Global styles, typography
└── guidelines/             # 📚 This directory
    ├── DESIGN_SYSTEM.md
    ├── COMPONENT_LIBRARY.md
    └── AI_AGENT_QUICK_START.md
```

---

## 🎨 Design Philosophy

### Inspired By
- **Shopify Admin** - Clean layouts, efficient workflows
- **Stripe Dashboard** - Data visualization, clear hierarchy
- **Linear** - Modern aesthetics, excellent dark mode

### Brand Values
- **Professional** - Enterprise-grade reliability
- **Modern** - Contemporary, clean interfaces
- **Efficient** - Task-focused, minimal clicks
- **Accessible** - WCAG 2.1 Level AA compliant

### Visual Hierarchy
1. **Primary**: Vibrant Blue (#4f46e5/#6366f1) - Actions, active states
2. **Success**: Emerald/Green - Confirmations, positive metrics
3. **Warning**: Amber - Cautions, pending states
4. **Error**: Red - Errors, destructive actions
5. **Neutral**: Grayscale - Content, backgrounds, text

---

## 🎨 Light Mode Color System (v3.1)

### Standard Component Colors

#### Input Fields
```tsx
className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
```
- **Background**: `bg-gray-100` - Soft, non-intrusive
- **Border**: `border-gray-300` - Clear definition
- **Placeholder**: `placeholder:text-gray-500` - Subtle hint text
- **Text**: Default (black) via globals.css

#### Cards & Containers
```tsx
className="bg-white border border-gray-200 shadow-sm rounded-lg"
```
- **Background**: `bg-white` - Clean, professional
- **Border**: `border-gray-200` - Subtle separation
- **Shadow**: `shadow-sm` - Gentle elevation
- **Radius**: `rounded-lg` - Modern, friendly

#### Labels
```tsx
className="text-gray-700"
```
- **Color**: `text-gray-700` - Strong but not harsh
- Excellent readability on white backgrounds

#### Secondary Text
```tsx
className="text-gray-600"
```
- **Color**: `text-gray-600` - Clear hierarchy
- Used for descriptions, metadata, helper text

#### Icons
```tsx
className="text-gray-400"
```
- **Color**: `text-gray-400` - Subtle, non-distracting
- Used for decorative icons in inputs and labels

#### Summary/Total Boxes
```tsx
className="bg-white border border-gray-200 rounded-lg shadow-sm p-4"
```
- Same as cards for consistency
- **Never** use `bg-gray-50` - Breaks visual hierarchy

#### Separators
```tsx
className="bg-gray-200"
```
- **Color**: `bg-gray-200` - Subtle division

### Complete Form Example
```tsx
<div className="space-y-4">
  <div className="space-y-2">
    <Label className="text-gray-700">Email Address</Label>
    <Input
      type="email"
      placeholder="john@example.com"
      className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
    />
  </div>
  
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
    <div className="flex justify-between">
      <span className="text-gray-600">Total:</span>
      <span className="text-gray-900">$120.00</span>
    </div>
  </div>
</div>
```

### Why This System?

1. **Consistency**: Same colors across all widgets and admin portal
2. **Professional**: Matches modern SaaS platforms (Shopify, Stripe)
3. **Accessibility**: Meets WCAG 2.1 AA contrast requirements
4. **Visual Hierarchy**: Clear distinction between primary/secondary content
5. **Predictable**: Developers know exactly which classes to use

### Migration Checklist
When updating existing components:
- [ ] Replace `bg-gray-50` inputs with `bg-gray-100`
- [ ] Replace `bg-gray-50` summary boxes with `bg-white border border-gray-200`
- [ ] Add `text-gray-700` to all labels
- [ ] Add `text-gray-600` to secondary text
- [ ] Add `placeholder:text-gray-500` to all inputs
- [ ] Ensure all cards have `border border-gray-200 shadow-sm`

---

## 🚀 Quick Start for New Components

### 1. Admin Portal Page
```tsx
'use client';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTheme } from '@/components/layout/ThemeContext';
import { Card } from '@/components/ui/card';

const MyPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <AdminLayout>
      <PageHeader title="Page Title" />
      {/* Content */}
    </AdminLayout>
  );
};

export default MyPage;
```

### 2. Widget Component
```tsx
import { useWidgetTheme } from '@/components/widgets/WidgetThemeContext';

const Widget = ({ primaryColor = '#4f46e5' }) => {
  const { widgetTheme } = useWidgetTheme();
  const isDark = widgetTheme === 'dark';
  
  // Override with vibrant blue in dark mode
  const btnColor = isDark ? '#4f46e5' : primaryColor;
  
  return (
    <div>
      {/* Input with explicit light mode styling */}
      <input 
        className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
        placeholder="Enter name"
      />
      <button style={{ backgroundColor: btnColor }}>Book</button>
    </div>
  );
};
```

### 3. Reusable Component
```tsx
import { useTheme } from '@/components/layout/ThemeContext';

interface Props {
  title: string;
  children: React.ReactNode;
}

export const MyComponent = ({ title, children }: Props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  
  return (
    <div className={`${bgClass} ${textClass} p-6 rounded-lg`}>
      <h3>{title}</h3>
      {children}
    </div>
  );
};
```

### 4. Using Brand Icons
```tsx
import { BookingTMSIcon, BookingTMSIconStatic } from '@/components/ui/icons';

// Animated icon (loading screens, splash screens)
<BookingTMSIcon size={80} animated={true} />

// Static icon (logos, navigation, avatars)
<BookingTMSIconStatic size={40} className="text-indigo-600" />

// With dark mode support
<BookingTMSIconStatic 
  size={40} 
  className="text-indigo-600 dark:text-white" 
/>
```

**Icon Usage Guidelines:**
- **Animated**: Loading screens, splash screens, waiting states
- **Static**: Logos, navigation bars, avatars, repeated instances
- **Sizes**: 
  - Loading: 80-120px
  - Hero: 120-200px  
  - Navigation: 32-48px
  - Buttons: 20-24px
  - Favicon: 16-32px

**Full Documentation**: See `/components/ui/ICONS_GUIDE.md`

---

## ✅ Pre-Flight Checklist

Before creating or modifying any component, verify:

### Design
- [ ] Reviewed DESIGN_SYSTEM.md for patterns
- [ ] Checked COMPONENT_LIBRARY.md for existing components
- [ ] Understood dark mode requirements
- [ ] Confirmed color usage (vibrant blue for primary)

### Implementation
- [ ] Added dark mode support with ThemeContext
- [ ] Made responsive (mobile-first)
- [ ] Used semantic class variables
- [ ] Followed 3-tier background system
- [ ] Maintained proper contrast ratios

### Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels added where needed
- [ ] Focus indicators visible
- [ ] Touch targets ≥ 44x44px
- [ ] Color contrast ≥ 4.5:1

### Testing
- [ ] Tested in both light and dark modes
- [ ] Tested at 375px, 768px, 1024px widths
- [ ] Verified keyboard navigation
- [ ] Checked all interactive states
- [ ] Validated loading/error states

---

## 🎯 Common Use Cases

### Adding a New Page
1. Copy template from AI_AGENT_QUICK_START.md
2. Use AdminLayout wrapper
3. Add PageHeader component
4. Implement dark mode
5. Make responsive
6. Test thoroughly

### Creating a Widget
1. Use WidgetThemeContext
2. Support custom primaryColor
3. Override with vibrant blue in dark mode
4. Implement full-height layout
5. Add all booking flow states
6. Test theme switching

### Building a Form
1. Use Shadcn form components
2. **Explicitly set light mode colors** (bg-gray-100 for inputs)
3. Add proper labels with text-gray-700
4. Add validation with clear error states
5. Include loading states
6. Make keyboard accessible
7. Support dark mode with proper color overrides

### Adding a Table
1. Use Shadcn Table component
2. Make responsive (scroll on mobile)
3. Add proper headers
4. Support sorting/filtering
5. Include empty states
6. Support dark mode

---

## 🐛 Debugging Guide

### Dark Mode Not Working
1. Check if ThemeContext is imported
2. Verify `isDark` variable is defined
3. Ensure semantic classes are used
4. Test theme toggle functionality

### Component Looks Wrong on Mobile
1. Check breakpoint usage (mobile-first)
2. Verify touch targets are large enough
3. Test at multiple screen sizes
4. Check overflow handling

### Accessibility Issues
1. Run keyboard navigation test
2. Check contrast with browser tools
3. Verify ARIA labels exist
4. Test with screen reader

### Colors Not Consistent
1. **Check explicit class overrides** - Are you explicitly setting bg-gray-100, border-gray-300?
2. **Verify component defaults** - Base components may have conflicting defaults
3. **Check dark mode color overrides** - Ensure proper dark mode classes
4. **Ensure vibrant blue in dark mode** - Primary actions should use #4f46e5
5. **Validate semantic color usage** - Labels should be text-gray-700, secondary text text-gray-600
6. **Review summary boxes** - Should be bg-white border border-gray-200, not bg-gray-50

### Component Styling Issues
1. **Input looks wrong** - Ensure: `bg-gray-100 border-gray-300 placeholder:text-gray-500`
2. **Card looks wrong** - Ensure: `bg-white border border-gray-200 shadow-sm`
3. **Label too light** - Ensure: `text-gray-700`
4. **Text hierarchy unclear** - Primary: text-gray-900, Secondary: text-gray-600, Tertiary: text-gray-500

---

## 📖 Best Practices

### Code Organization
```tsx
// 1. Imports (grouped logically)
import React from 'react';
import { useTheme } from '@/components/layout/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Component
export const Component = ({ title }: Props) => {
  // 4. Hooks
  const { theme } = useTheme();
  
  // 5. Derived state
  const isDark = theme === 'dark';
  
  // 6. Semantic variables
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  
  // 7. Event handlers
  const handleClick = () => {};
  
  // 8. Render
  return (
    <div className={bgClass}>
      <h3>{title}</h3>
      {/* ALWAYS explicitly set input styling */}
      <Label className="text-gray-700">Name</Label>
      <Input 
        className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
        placeholder="Enter name"
      />
    </div>
  );
};
```

### Explicit Styling Override
**CRITICAL:** Base components (Input, Label, Card, etc.) may have default styling that conflicts with our design system. **Always explicitly override** with design system colors:

```tsx
// ❌ WRONG - Relies on component defaults
<Input placeholder="Email" />
<Label>Name</Label>

// ✅ CORRECT - Explicitly sets design system colors
<Input 
  className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
  placeholder="Email" 
/>
<Label className="text-gray-700">Name</Label>
```

### Naming Conventions
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: Match component name
- CSS classes: Use Tailwind utilities

### Performance
- Use React.memo for expensive components
- Implement code splitting for large pages
- Lazy load images with proper loading states
- Minimize re-renders with proper dependencies
- Use proper key props in lists

---

## 🔐 Authentication & Authorization (NEW)

### RBAC System
A comprehensive Role-Based Access Control system has been implemented for managing users and permissions.

**User Roles:**
1. **Super Admin** - Full system access + user management + full customer/guest management
2. **Admin** - Full operational access (no user management) + full customer/guest management
3. **Manager** - View and limited edit access + view customer/guest profiles
4. **Staff** - Basic view-only access + read-only customer/guest access

**Quick Usage:**
```tsx
import { useAuth } from '@/lib/auth/AuthContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

function MyComponent() {
  const { hasPermission, currentUser, isRole } = useAuth();
  
  const canEdit = hasPermission('bookings.edit');
  const isSuperAdmin = isRole('super-admin');

  return (
    <div>
      {/* Permission-based rendering */}
      <PermissionGuard permissions={['bookings.edit']}>
        <EditButton />
      </PermissionGuard>

      {/* Role-based rendering */}
      {isSuperAdmin && <AdminPanel />}
    </div>
  );
}
```

**Documentation:**
- Full guide: `/lib/auth/README.md`
- Migration guide: `/lib/auth/MIGRATION_GUIDE.md`
- Type definitions: `/types/auth.ts`

**Account Settings Page:**
- Accessible only to Super Admin
- Manage users (create, edit, delete)
- View and manage roles and permissions
- Located at `/pages/AccountSettings.tsx`

**Customers/Guests Management Permissions:**
| Role | View Customers | Add Customer | Edit Customer | Delete Customer | Export Data |
|------|---------------|--------------|---------------|-----------------|-------------|
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manager** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Staff** | ✅ | ❌ | ❌ | ❌ | ❌ |

**Implementation Details:**
- The Customers page uses `PermissionGuard` for conditional rendering
- View access: `customers.view` permission
- Add customer: `customers.create` permission
- Edit customer: `customers.edit` permission
- Delete customer: `customers.delete` permission
- Export data: `customers.export` permission

---

## 🔔 Notification System (NEW)

### Overview
A comprehensive notification system has been implemented to alert users about important events in real-time.

**Components:**
1. **NotificationCenter** - Bell icon dropdown in header (unread badge)
2. **Notifications Page** - Full page with filtering, search, and management
3. **NotificationSettings** - User preferences in Account Settings

**Quick Usage:**
```tsx
import { useNotifications } from '@/lib/notifications/NotificationContext';

function MyComponent() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    settings,
    playNotificationSound 
  } = useNotifications();
  
  return (
    <div>
      <Badge>{unreadCount}</Badge>
      {/* Notifications will automatically appear as toast */}
    </div>
  );
}
```

**Notification Types (12 total):**
- 📅 **Bookings**: New bookings, modifications, check-ins
- 💳 **Payments**: Received, failed, refund processed
- ❌ **Cancellations**: Booking cancelled
- 💬 **Messages**: Customer inquiry, chat message
- 👥 **Staff**: Shift reminder
- ⚠️ **System**: Maintenance, alert, updates

**User Controls:**
- **Sound Alerts**: Enable/disable, volume control, test button
- **Desktop Notifications**: Per-type control (bookings, payments, cancellations, messages)
- **Email Notifications**: Global toggle
- **SMS Notifications**: Global toggle with phone number
- **Quiet Hours**: Schedule (e.g., 22:00 to 08:00)
- **In-App Toasts**: Show/hide toast notifications

**Settings Architecture:**
```tsx
// Staged Save Workflow
1. User makes changes → pendingSettings state updates
2. Changes held locally → hasChanges = true
3. Buttons enable → Cancel (revert) | Save (apply)
4. Click Save → updateSettings(pendingSettings)
5. Settings saved to localStorage → useEffect syncs global state
6. Buttons disable → Ready for new changes
```

**Dark Mode Compliance:**
- ✅ NotificationCenter dropdown
- ✅ Notifications page (all states)
- ✅ NotificationSettings panel
- ✅ Toast notifications (sonner)
- ✅ All buttons and controls

**Documentation:**
- Complete guide: `/NOTIFICATION_SYSTEM_COMPLETE.md`
- Bug fixes: `/NOTIFICATION_SETTINGS_WORKING_FIX.md`
- Router setup: `/NOTIFICATION_SYSTEM_ROUTER_FIX.md`

**Storage:**
- Settings: `localStorage.getItem('notificationSettings')`
- Demo mode: New notification every 2 minutes

---

## 🔄 Version History

### Version 3.2.12 (November 5, 2025) ⭐ **LATEST**
- **Authentication Services Backend Dashboard** 🔐
  - Added comprehensive auth services management to Backend Dashboard
  - New `AuthServicesTab` component with full OAuth configuration
  - Supabase Auth configuration and testing
  - Google OAuth setup with Client ID/Secret management
  - Facebook and GitHub OAuth support
  - Real-time status monitoring for all auth services
  - Environment variable verification
  - Connection testing for each provider
  - Copy-to-clipboard for credentials and redirect URIs
  - Full dark mode support with 3-tier background system
  - Mobile-responsive design
  - localStorage persistence for all configurations
  - **Components**: `/components/backend/AuthServicesTab.tsx`
  - **Integration**: Updated `/pages/BackendDashboard.tsx` with Auth Services tab
- **Documentation**:
  - `/AUTH_SERVICES_BACKEND_DASHBOARD.md` - Complete implementation guide
  - `/AUTH_SERVICES_QUICK_CARD.md` - Quick reference for setup & usage

### Version 3.2.11 (November 5, 2025)
- **localStorage Implementation Guide Added to PRD** 📚
  - Added comprehensive Section 13.6 to PRD for localStorage persistence
  - Complete guide for AI dev agents to implement data persistence
  - Addresses critical Phase 1 MVP blocker (13% remaining)
  - Created 3 new implementation documents:
    - `/LOCALSTORAGE_IMPLEMENTATION_CARD.md` - Quick reference with copy-paste code
    - `/LOCALSTORAGE_VISUAL_GUIDE.md` - Visual flowcharts and diagrams
    - `/PRD_UPDATE_NOV_5_LOCALSTORAGE.md` - Update summary
  - Updated Guidelines.md with localStorage documentation links
  - Added 2 code patterns (Pattern 4 & Pattern 5) for widgets and admin forms
  - Includes testing procedures, success criteria, and time estimates
  - **Impact**: Provides clear path to Phase 1 MVP 100% completion
- **Documentation Updates**:
  - `/PRD_BOOKINGTMS_ENTERPRISE.md` - Added Section 13.6 (localStorage Implementation)
  - `/guidelines/Guidelines.md` - Added localStorage priority warning
  - Version bumped to 3.2.11 (PRD) and 3.2.11 (Guidelines)

### Version 3.2.10 (November 5, 2025)
- **Widget Theme Auto-Sync Implementation** 🎨
  - Widget previews now automatically match admin dashboard theme
  - When dark mode is active in admin, widget previews show in dark mode
  - Added `theme` URL parameter to embed URLs
  - Updated `WidgetThemeProvider` to accept `initialTheme` prop
  - Added visual indicator showing current theme sync status
  - Seamless integration with existing theme system
  - Zero configuration required - works automatically
- **Files Modified**:
  - `/components/widgets/EmbedPreview.tsx` - Added theme sync
  - `/components/widgets/WidgetThemeContext.tsx` - Added initialTheme prop
  - `/pages/Embed.tsx` - Parse and apply theme parameter
- **Documentation**:
  - `/WIDGET_THEME_AUTO_SYNC.md` - Complete implementation guide

### Version 3.2.9 (November 5, 2025)
- **Critical Gap Analysis - localStorage Persistence Missing**
  - ⚠️ Identified missing localStorage implementation across all booking widgets
  - 📊 Comprehensive analysis: 7 widgets + admin forms don't save data
  - 🎯 Impact: All UI/UX complete (87%) but data lost on page refresh
  - ⏱️ Fix required: 8-10 hours to implement localStorage persistence
  - 📝 Created 3 analysis documents:
    - `/INCOMPLETE_FEATURES_ANALYSIS.md` - Complete technical breakdown
    - `/INCOMPLETE_FEATURES_QUICK_CARD.md` - Quick reference card
    - `/NOVEMBER_5_INCOMPLETE_FEATURES_SUMMARY.md` - Executive summary
  - 📈 Updated PRD to v3.2.9 with gap analysis section
  - 🎯 Action plan: Implement `localStorage.setItem()` in all widgets and forms
  - ✅ Result: Will complete Phase 1 MVP to 100%
- **Widgets Affected** (UI complete, localStorage missing):
  - FareBookWidget, CalendarWidget, ListWidget, QuickBookWidget
  - MultiStepWidget, ResolvexWidget, GiftVoucherWidget
- **Admin Forms** (Need verification):
  - Bookings, Games, Customers, Staff, Waivers pages

### Version 3.2.8 (November 4, 2025)
- **OpenAI Model Selector Implementation**
  - Added comprehensive model selection feature in API Configuration dialog
  - Users can now choose from 6 different OpenAI models:
    - GPT-4o (Most capable, multimodal)
    - GPT-4o Mini (Affordable & intelligent) - **NEW DEFAULT**
    - GPT-4 Turbo (Previous generation)
    - GPT-3.5 Turbo (Fast & cost-effective)
    - O1 Preview (Advanced reasoning)
    - O1 Mini (Faster reasoning)
  - Changed default model from `gpt-5-nano-2025-08-07` to `gpt-4o-mini`
  - Model selection persists via localStorage
  - Selected model displays throughout UI (AI Config section, API Details, etc.)
  - Both BookingChatAssistant instances use selected model dynamically
  - Full dark mode support for Select dropdown
  - Backend updated to use selected model
- **Documentation**:
  - `/OPENAI_MODEL_SELECTOR_IMPLEMENTATION.md` - Complete technical guide
  - `/OPENAI_MODEL_SELECTOR_QUICK_GUIDE.md` - Quick reference & user guide

### Version 3.2.7 (November 4, 2025)
- **OpenAI API Configuration UI Simplification**
  - Removed Z.ai options from AI Agents page
  - Simplified API configuration dialog to show OpenAI as text-only provider
  - Added Provider display (non-editable text): "OpenAI"
  - Added Model display (non-editable text): "gpt-3.5-turbo"
  - Updated API key input to handle OpenAI only
  - Simplified save handler to always use OpenAI
  - Updated main configuration section with OpenAI-specific text
  - Updated both BookingChatAssistant instances to use OpenAI
  - Full dark mode support maintained
  - Backend integration verified and working
- **Documentation**:
  - `/OPENAI_SIMPLIFIED_UI_UPDATE.md` - Complete technical documentation
  - `/OPENAI_UI_QUICK_REFERENCE.md` - Quick reference guide
  - `/NOVEMBER_4_OPENAI_UI_SIMPLIFIED.md` - Executive summary

### Version 3.2.6 (November 4, 2025)
- **Icon Library Implementation**
  - Created comprehensive icon library (`/components/ui/icons.tsx`)
  - Added `BookingTMSIcon` component (animated brand icon)
  - Added `BookingTMSIconStatic` component (static version for logos/navigation)
  - Custom animated calendar icon with booking dots
  - Smooth Motion (Framer Motion) animations
  - Customizable size, color, and animation properties
  - Dark mode support with automatic color inheritance
  - Integrated into LoadingScreen component
  - Complete documentation: `/components/ui/ICONS_GUIDE.md`
- **Documentation Updates**
  - Added icon library to Guidelines.md documentation index
  - Added icon usage examples to Quick Start section
  - Included size recommendations and use case guidelines
  - Added performance and accessibility considerations

### Version 3.2.5 (November 4, 2025)
- **Backend Dashboard Reorganization**
  - Moved Database management from standalone page to Backend Dashboard
  - Database now accessible as a tab within Backend Dashboard
  - Created reusable `DatabaseTab` component (`/components/backend/DatabaseTab.tsx`)
  - Removed standalone Database page from main navigation
  - Database features now organized under Backend section (Super Admin only)
  - Improved navigation structure: Backend Dashboard → Database tab
  - All database testing, Supabase connection, and KV Store management now centralized
- **Bug Fix**
  - Fixed `borderClass` reference error in BackendDashboard.tsx (changed to `borderColor`)
  - Backend Dashboard now loads without console errors

### Version 3.2.4 (November 4, 2025)
- **Database Management Page**
  - Renamed "Supabase Test" to "Database" for better clarity
  - Comprehensive database administration interface
  - Includes Supabase connection testing, KV Store management, and settings
  - Tab-based interface: Overview, Connection Test, KV Store, Settings
  - Enhanced UI with database status cards and quick actions
  - Updated navigation and routing to use `/database` instead of `/supabase-test`
- **Guidelines Enhancement**
  - Added critical section on base component styling overrides
  - Emphasized importance of explicitly setting design system values
  - Detailed examples of required overrides for all base components
  - Clear warnings about potential default style conflicts

### Version 3.2.3 (November 4, 2025)
- **Enhanced Notification Settings** 
  - Completely redesigned settings UI with card-based categories
  - **Email Notifications**: Booking Notifications, Reports & Analytics, Marketing & Updates
  - **Push Notifications**: New Bookings, Staff Updates
  - **SMS Notifications**: Critical Alerts with phone number input
  - Improved visual hierarchy with icons, titles, and descriptions
  - Enhanced save/cancel workflow with clear visual feedback
  - "Your offline changes were synced" confirmation message
  - All settings fully functional and saveable to localStorage
  - New settings: `emailForReports`, `emailForMarketing`, `desktopForStaffUpdates`
- **Documentation**:
  - `/NOTIFICATION_SETTINGS_ENHANCED.md` - Complete enhancement guide

### Version 3.2.2 (November 3, 2025)
- **Comprehensive Notification System**
  - Complete notification infrastructure with 12 notification types
  - NotificationContext for global state management
  - NotificationCenter component (bell icon dropdown in header)
  - Dedicated Notifications page with filtering, search, and bulk actions
  - NotificationSettings in Account Settings with staged save workflow
  - Sound alerts with Web Audio API (adjustable volume, test button)
  - Email and SMS notification controls
  - Quiet hours scheduling (overnight support)
  - Desktop notifications with browser API integration
  - Priority-based display (high/medium/low)
  - Real-time notification simulation (demo mode)
  - Full dark mode compliance across all notification components
  - LocalStorage persistence for user settings
  - **Critical Bug Fixes**:
    - Fixed settings sync issue (useEffect dependency from `[]` to `[settings]`)
    - Removed duplicate toast notifications
    - Implemented pending changes system with Cancel/Save buttons
    - Enhanced button styling with clear disabled states
- **Components Added**:
  - `/components/notifications/NotificationCenter.tsx` - Bell icon dropdown
  - `/components/notifications/NotificationSettings.tsx` - Settings panel
  - `/pages/Notifications.tsx` - Full notifications page
  - `/lib/notifications/NotificationContext.tsx` - State management
  - `/lib/notifications/mockData.ts` - Demo data
  - `/types/notifications.ts` - Type definitions
- **Documentation**:
  - `/NOTIFICATION_SYSTEM_COMPLETE.md` - Complete system overview
  - `/NOTIFICATION_SYSTEM_ROUTER_FIX.md` - Router integration
  - `/NOTIFICATION_SETTINGS_WORKING_FIX.md` - Bug fix documentation

### Version 3.2.1 (November 3, 2025)
- **Customers/Guests RBAC Integration**
  - Super Admin: Full access to all customer management features (view, create, edit, delete, export)
  - Admin: Full access to all customer management features (view, create, edit, delete, export)
  - Manager: Read-only access to customer profiles and segments
  - Staff: Read-only access to customer profiles and segments
  - Protected Export button with `customers.export` permission
  - Protected Add Customer button with `customers.create` permission
  - Protected Edit actions with `customers.edit` permission
- **Documentation**
  - Added Customers/Guests permissions table to Guidelines
  - Updated RBAC section with customer management details

### Version 3.2 (November 3, 2025)
- **RBAC System Implementation**
  - Comprehensive Role-Based Access Control system
  - 4 user roles: Super Admin, Admin, Manager, Staff
  - Granular permission system (35+ permissions)
  - Account Settings page for user management
  - Permission-based sidebar filtering
  - PermissionGuard component for conditional rendering
  - Complete TypeScript type safety
  - Extensible architecture for custom permissions
- **Documentation**
  - Complete RBAC documentation in `/lib/auth/README.md`
  - Migration guide for integrating RBAC
  - Usage examples and best practices

### Version 3.1 (November 3, 2025)
- **Light Mode Color Consistency Update**
  - Implemented consistent Tailwind gray palette across all widgets
  - Standardized input styling: `bg-gray-100 border-gray-300`
  - Standardized card styling: `bg-white border border-gray-200 shadow-sm`
  - Standardized label styling: `text-gray-700`
  - Updated all 6 booking widgets: FareBookWidget, CalendarWidget, ListWidget, QuickBookWidget, MultiStepWidget, ResolvexWidget
  - Added explicit styling override guidelines to prevent default component conflicts
- **Documentation Improvements**
  - Added light mode color system reference
  - Added explicit styling override best practices
  - Updated code examples with proper color usage

### Version 3.0 (November 2, 2025)
- Created comprehensive design system documentation
- Added component library reference
- Created AI agent quick start guide
- Consolidated all design guidelines

### Version 2.0 (October 2025)
- Implemented vibrant blue (#4f46e5) as primary color
- Completed dark mode system across all widgets
- Established 3-tier background hierarchy

### Version 1.0 (Initial)
- Basic admin portal structure
- Initial component library
- Shadcn UI integration

---

## 🆘 Need Help?

### Where to Look
1. **Quick answer?** → AI_AGENT_QUICK_START.md
2. **Design question?** → DESIGN_SYSTEM.md
3. **Component usage?** → COMPONENT_LIBRARY.md
4. **Dark mode issue?** → DARK_MODE_COLOR_GUIDE.md
5. **Still stuck?** → Check existing implementations in `/pages` and `/components`

### Reference Implementations
- **Admin Page**: `/pages/Dashboard.tsx`
- **Widget**: `/components/widgets/FareBookWidget.tsx`
- **Layout**: `/components/layout/AdminLayout.tsx`
- **Form**: `/components/games/AddGameWizard.tsx`
- **Table**: See any page with data display
- **Notifications**: `/components/notifications/NotificationCenter.tsx`
- **Settings Panel**: `/components/notifications/NotificationSettings.tsx`
- **Full Page**: `/pages/Notifications.tsx`

---

## 🎓 Learning Path for AI Agents

### Day 1: Understanding the System
1. Read AI_AGENT_QUICK_START.md (10 min)
2. Review DESIGN_SYSTEM.md color section (10 min)
3. Examine Dashboard.tsx implementation (10 min)
4. Test dark mode toggle in browser

### Day 2: Building Components
1. Create a simple admin page
2. Add dark mode support
3. Make it responsive
4. Test accessibility

### Day 3: Advanced Patterns
1. Build a form with validation
2. Create a data table
3. Implement a modal dialog
4. Add loading states

### Week 2: Widget Development
1. Understand WidgetThemeContext
2. Build a simple booking widget
3. Add theme switching
4. Implement full booking flow

---

## 📊 Widget Status (v3.1)

All booking widgets have been updated with **consistent light mode colors**:

### ✅ Fully Updated Widgets
1. **FareBookWidget** - Dark mode ✓ | Light mode colors ✓
2. **CalendarWidget** - Light mode colors ✓ (no dark mode)
3. **ListWidget** - Light mode colors ✓ (no dark mode)
4. **QuickBookWidget** - Light mode colors ✓ (no dark mode)
5. **MultiStepWidget** - Light mode colors ✓ (no dark mode)
6. **ResolvexWidget** - Light mode colors ✓ (no dark mode)

### Color Updates Applied
- ✅ Input fields: `bg-gray-100 border-gray-300`
- ✅ Cards: `bg-white border border-gray-200 shadow-sm`
- ✅ Labels: `text-gray-700`
- ✅ Secondary text: `text-gray-600`
- ✅ Summary boxes: `bg-white border border-gray-200`
- ✅ Placeholders: `placeholder:text-gray-500`

### Next Steps (Future Development)
- [ ] Add dark mode support to CalendarWidget
- [ ] Add dark mode support to ListWidget
- [ ] Add dark mode support to QuickBookWidget
- [ ] Add dark mode support to MultiStepWidget
- [ ] Add dark mode support to ResolvexWidget

---

**Remember:**
- **ALWAYS** implement dark mode
- **ALWAYS** make responsive
- **ALWAYS** prioritize accessibility
- **ALWAYS** use vibrant blue (#4f46e5) in dark mode
- **ALWAYS** follow the 3-tier background system
- **ALWAYS** explicitly set light mode colors (bg-gray-100 for inputs, bg-white for cards)
- **ALWAYS** override base component defaults with design system colors

For detailed information on any topic, refer to the specialized documentation files linked above.

---

**Last Updated**: November 5, 2025 (v3.2.12 - Auth Services Backend Dashboard)  
**Maintained By**: BookingTMS Development Team  
**Current Priority**: ⚠️ Implement localStorage persistence (13% to Phase 1 completion)  
**Latest Feature**: 🔐 Authentication services management with Supabase & Google OAuth  
**Questions?** Check the documentation or review existing implementations
