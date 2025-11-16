# 🏗️ BookingTMS Role Architecture - CORRECTED
## Multi-Tenant SaaS with Proper Role Separation

**Version:** 3.0 (CORRECTED)  
**Date:** November 16, 2025  
**Status:** Architecture Analysis & Implementation Plan

---

## ✅ CORRECT ROLE HIERARCHY

### Platform Team (Us - System Owners)
```
┌─────────────────────────────────────────────────────────┐
│              PLATFORM TEAM (Our Team)                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  system-admin (Platform Owner)              │        │
│  │  - Full platform control                    │        │
│  │  - Manage all organizations                 │        │
│  │  - Create/manage organization owners        │        │
│  │  - Control feature flags & plans            │        │
│  │  - Access system admin dashboard            │        │
│  │  - Access backend dashboard                 │        │
│  │  - Access database management               │        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  super-admin (Platform Team Members)        │        │
│  │  - Work on specific tenant functions        │        │
│  │  - Implement features for organizations     │        │
│  │  - Same access as system-admin              │        │
│  │  - Part of platform team                    │        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Organization Owners (Customers)
```
┌─────────────────────────────────────────────────────────┐
│         ORGANIZATION OWNERS (Customers/Clients)          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  admin (Organization Owner)                 │        │
│  │  - Created by system-admin/super-admin      │        │
│  │  - Full access to THEIR organization        │        │
│  │  - Manage venues, games, bookings           │        │
│  │  - Create/manage staff (manager, staff)     │        │
│  │  - Access all features provided by platform │        │
│  │  - ❌ NO access to system-admin dashboard   │        │
│  │  - ❌ NO access to backend dashboard        │        │
│  │  - ❌ NO access to database management      │        │
│  │  - Features based on subscription plan      │        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  manager (Organization Staff)               │        │
│  │  - Created by admin                         │        │
│  │  - Limited management access                │        │
│  │  - Manage bookings, customers               │        │
│  │  - View reports                             │        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │  staff (Organization Staff)                 │        │
│  │  - Created by admin                         │        │
│  │  - Basic operational access                 │        │
│  │  - View bookings, customers                 │        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 CURRENT SYSTEM ANALYSIS

### Database Schema (Existing)

From `/src/supabase/migrations/001_initial_schema.sql`:

```sql
-- CURRENT ROLES IN DATABASE
CREATE TYPE user_role AS ENUM (
  'super-admin',  -- Currently: org owner (WRONG)
  'admin',        -- Currently: full access (SHOULD BE org owner)
  'manager',      -- Currently: limited management
  'staff'         -- Currently: basic access
);

-- CURRENT USERS TABLE
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'staff',
  organization_id UUID NOT NULL REFERENCES organizations(id),
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**ISSUE:** Database only has 4 roles, but code has 'system-admin' too!

### Frontend Roles (Existing)

From `/src/lib/auth/permissions.ts`:

```typescript
// CURRENT ROLES IN CODE
const ROLES = [
  'system-admin',  // Platform owner (✅ CORRECT)
  'super-admin',   // Org owner (❌ WRONG - should be platform team)
  'admin',         // Full access (❌ WRONG - should be org owner)  
  'manager',       // Limited management (✅ CORRECT)
  'staff',         // Basic access (✅ CORRECT)
  'customer',      // End user (✅ CORRECT)
  'beta-owner',    // Testing role (temporary)
];
```

**ISSUE:** Role definitions don't match database schema!

### Current Pages/Components

**Existing UI Pages:**
- ✅ SystemAdminDashboard.tsx (for platform team)
- ✅ BackendDashboard.tsx (for platform team)
- ✅ Dashboard.tsx (main dashboard)
- ✅ Bookings.tsx, Games.tsx, Customers.tsx
- ✅ Staff.tsx (manage team)
- ✅ Settings.tsx, Billing.tsx
- ✅ Marketing.tsx, Campaigns.tsx, AIAgents.tsx
- ✅ Reports.tsx, PaymentHistory.tsx

**Component Structure:** All exist and working!

---

## 🔧 REQUIRED CHANGES

### 1. Database Migration

**Add 'system-admin' to user_role enum:**

```sql
-- Migration: 024_add_system_admin_role.sql

-- Step 1: Add system-admin to enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'system-admin';

-- Step 2: Update existing super-admins who are platform team
-- (Manual step - identify which users are platform team vs org owners)

-- Step 3: Create platform_team table to track platform members
CREATE TABLE platform_team (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL CHECK (role IN ('system-admin', 'super-admin')),
  department VARCHAR(100), -- 'engineering', 'support', 'management'
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Add is_platform_team flag to users table
ALTER TABLE users ADD COLUMN is_platform_team BOOLEAN DEFAULT false;

-- Step 5: Update RLS policies
-- Allow platform team to see all organizations
CREATE POLICY "Platform team can view all organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND is_platform_team = true
    )
  );

-- Step 6: Add indexes
CREATE INDEX idx_users_is_platform_team ON users(is_platform_team);
CREATE INDEX idx_platform_team_role ON platform_team(role);
```

### 2. Frontend Role Updates

**Update `/src/lib/auth/permissions.ts`:**

```typescript
// CORRECTED ROLE DEFINITIONS

/**
 * System Admin - Platform owner (us)
 * Full control over the entire platform
 */
const SYSTEM_ADMIN_PERMISSIONS: Permission[] = [
  'platform.*', // All platform-level permissions
  'system.*',   // System admin dashboard
  'backend.*',  // Backend dashboard
  'database.*', // Database management
  'organizations.*', // Manage all organizations
  'plans.*',    // Manage subscription plans
  'features.*', // Feature flags
  // ... + all operational permissions
];

/**
 * Super Admin - Platform team member (us)
 * Works on specific tenant functions and features
 * Same access as system-admin
 */
const SUPER_ADMIN_PERMISSIONS: Permission[] = SYSTEM_ADMIN_PERMISSIONS;

/**
 * Admin - Organization Owner (customer)
 * Full access to THEIR organization only
 * ❌ NO platform-level access
 */
const ADMIN_PERMISSIONS: Permission[] = [
  // Organization management
  'dashboard.view',
  'dashboard.stats',
  
  // Full CRUD for their org
  'venues.*',
  'games.*',
  'bookings.*',
  'customers.*',
  'staff.create',  // Can create managers and staff
  'staff.edit',
  'staff.delete',
  'staff.view',
  
  // Business features (plan-based)
  'marketing.*',
  'campaigns.*',
  'reports.*',
  'payments.*',
  'widgets.*',
  'waivers.*',
  'media.*',
  
  // Settings
  'settings.view',
  'settings.edit',
  'billing.view',  // View their billing
  'billing.manage', // Manage their subscription
  
  // ❌ EXCLUDED
  // 'system.*',      // NO system admin dashboard
  // 'backend.*',     // NO backend dashboard  
  // 'database.*',    // NO database access
  // 'organizations.create', // NO create other orgs
  // 'platform.*',    // NO platform features
];

/**
 * Manager - Organization Staff
 */
const MANAGER_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'bookings.*',
  'customers.view',
  'customers.edit',
  'games.view',
  'games.edit',
  'reports.view',
  'payments.view',
  // NO staff management
  // NO settings access
];

/**
 * Staff - Organization Staff
 */
const STAFF_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'bookings.view',
  'bookings.create',
  'customers.view',
  'games.view',
];
```

### 3. Sidebar Menu Access

**Update `/src/components/layout/Sidebar.tsx`:**

```typescript
// Platform Team Menus (system-admin & super-admin ONLY)
if (isRole(['system-admin', 'super-admin']) && currentUser?.is_platform_team) {
  navItems.push({
    id: 'system-admin',
    label: 'System Admin',
    icon: Crown,
    permission: 'system.view'
  });
  
  navItems.push({
    id: 'backend-dashboard',
    label: 'Backend Dashboard',
    icon: Server,
    permission: 'backend.view'
  });
  
  navItems.push({
    id: 'database',
    label: 'Database',
    icon: Database,
    permission: 'database.view'
  });
}

// Organization Owner Menus (admin ONLY)
if (isRole('admin')) {
  navItems.push({
    id: 'billing',
    label: 'Billing & Subscription',
    icon: CreditCard,
    permission: 'billing.view'
  });
  
  navItems.push({
    id: 'staff',
    label: 'Staff Management',
    icon: Users,
    permission: 'staff.view'
  });
}

// All other menus based on permissions
// (bookings, games, customers, etc.)
```

---

## 📋 IMPLEMENTATION PLAN

### Phase 1: Database Updates (Week 1)

**Tasks:**
- [ ] Create migration 024_add_system_admin_role.sql
- [ ] Add 'system-admin' to user_role enum
- [ ] Create platform_team table
- [ ] Add is_platform_team flag to users table
- [ ] Update RLS policies for platform team access
- [ ] Test on staging environment

**Migration Script:**
```bash
# Apply migration
supabase migration up --db-url <staging-url>

# Verify
psql <staging-url> -c "SELECT unnest(enum_range(NULL::user_role));"
psql <staging-url> -c "SELECT * FROM platform_team;"
```

### Phase 2: Update Role Permissions (Week 2)

**Tasks:**
- [ ] Update permissions.ts with correct role definitions
- [ ] Update AuthContext.tsx role checks
- [ ] Update Sidebar.tsx menu visibility
- [ ] Add is_platform_team check in all components
- [ ] Test role-based access on all pages

**Testing Checklist:**
```
Platform Team (system-admin, super-admin):
✓ Can access System Admin Dashboard
✓ Can access Backend Dashboard
✓ Can access Database Management
✓ Can see all organizations
✓ Can create organization owners

Organization Owner (admin):
✓ Can access their dashboard
✓ Can manage venues, games, bookings
✓ Can create staff (manager, staff)
✓ Can view/manage billing
✗ Cannot access System Admin Dashboard
✗ Cannot access Backend Dashboard
✗ Cannot see other organizations

Manager:
✓ Can view/edit bookings
✓ Can view customers
✗ Cannot manage staff
✗ Cannot access billing

Staff:
✓ Can view bookings
✓ Can create bookings
✗ Cannot edit settings
```

### Phase 3: UI Component Updates (Week 3)

**Tasks:**
- [ ] Update Login.tsx role selection
- [ ] Update Header.tsx role badges
- [ ] Add platform team indicators
- [ ] Update Settings pages for admin role
- [ ] Add Staff Management page for admins
- [ ] Test all UI flows

### Phase 4: Plan-Based Access (Week 4)

**Tasks:**
- [ ] Create plans table (Basic/Growth/Pro)
- [ ] Link organizations to plans
- [ ] Implement usePlanFeatures hook
- [ ] Add feature gates to components
- [ ] Add upgrade prompts
- [ ] Test plan-based access

### Phase 5: Stripe Integration (Week 5)

**Tasks:**
- [ ] Set up Stripe products
- [ ] Create subscription management
- [ ] Implement webhooks
- [ ] Add billing page for admins
- [ ] Test payment flows

---

## 🎯 CRITICAL RULES

### ✅ DO

1. **Platform Team Access**
   - system-admin & super-admin = platform team ONLY
   - Both have FULL access to everything
   - Check `is_platform_team` flag in code

2. **Organization Owner Access**
   - admin = organization owner (customer)
   - Full access to THEIR organization
   - Can create/manage staff
   - Access based on subscription plan

3. **Menu Visibility**
   - System Admin Dashboard → platform team ONLY
   - Backend Dashboard → platform team ONLY
   - Database Management → platform team ONLY
   - Billing → organization admin ONLY
   - Staff Management → organization admin ONLY

### ❌ DON'T

1. **Never** give organization owners (admin) access to:
   - System Admin Dashboard
   - Backend Dashboard
   - Database Management
   - Other organizations' data

2. **Never** allow admin to:
   - Create other organizations
   - Modify platform settings
   - Access platform-level features

3. **Never** confuse:
   - super-admin (platform team) with admin (org owner)
   - Platform team permissions with org permissions

---

## 📊 DATABASE SCHEMA (FINAL)

```sql
-- CORRECTED user_role enum
CREATE TYPE user_role AS ENUM (
  'system-admin',  -- Platform owner
  'super-admin',   -- Platform team member
  'admin',         -- Organization owner (customer)
  'manager',       -- Organization staff
  'staff'          -- Organization staff
);

-- users table with platform team flag
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  is_platform_team BOOLEAN DEFAULT false, -- 🔑 KEY FLAG
  phone VARCHAR(20),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- platform_team table (optional but recommended)
CREATE TABLE platform_team (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  role user_role CHECK (role IN ('system-admin', 'super-admin')),
  department VARCHAR(100),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  plan_id UUID REFERENCES plans(id), -- 🔑 SUBSCRIPTION PLAN
  owner_id UUID REFERENCES users(id), -- 🔑 PRIMARY ADMIN
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  subscription_status VARCHAR(50),
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- plans table (new)
CREATE TABLE plans (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- 'Basic', 'Growth', 'Pro'
  slug VARCHAR(100) UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2),
  stripe_price_id_monthly VARCHAR(255),
  max_venues INT, -- NULL = unlimited
  max_staff INT,
  max_bookings_per_month INT,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🚀 NEXT STEPS

1. **Review this document** with your team
2. **Approve the architecture** and role definitions
3. **Start Phase 1** - Database migration
4. **Test thoroughly** at each phase
5. **Deploy incrementally** to minimize risk

---

**Status:** ✅ Architecture Clarified  
**Ready For:** Implementation Phase 1  
**ETA:** 5 weeks to full implementation  

---

**This architecture properly separates:**
- Platform team (system-admin, super-admin) = US
- Organization owners (admin) = CUSTOMERS
- Staff (manager, staff) = CUSTOMER'S EMPLOYEES
