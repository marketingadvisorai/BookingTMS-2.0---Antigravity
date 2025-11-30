# Multi-Tenant Authentication Architecture

## Overview

BookingTMS is a multi-tenant SaaS platform with three distinct user tiers:

1. **Platform Level** - System administrators who manage the entire platform
2. **Organization Level** - Organization owners who manage their business
3. **Staff Level** - Employees who operate within an organization

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PLATFORM LAYER                                      │
│  ┌─────────────────┐                                                            │
│  │   auth.users    │◄─────── Supabase Auth (handles login/sessions)             │
│  │   (Supabase)    │                                                            │
│  └────────┬────────┘                                                            │
│           │ 1:1                                                                  │
│           ▼                                                                     │
│  ┌─────────────────┐                                                            │
│  │  public.users   │◄─────── Profile data + Role                                │
│  │                 │                                                            │
│  │  - id (PK, FK)  │                                                            │
│  │  - email        │                                                            │
│  │  - full_name    │                                                            │
│  │  - role         │ ◄── 'system-admin' = NULL org_id (platform access)         │
│  │  - org_id (FK)  │ ◄── NULL for system-admin, required for others            │
│  │  - is_active    │                                                            │
│  │  - is_platform  │ ◄── TRUE for platform team members                         │
│  └────────┬────────┘                                                            │
└───────────┼─────────────────────────────────────────────────────────────────────┘
            │
            │ organization_id (nullable)
            ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ORGANIZATION LAYER                                     │
│  ┌─────────────────┐                                                            │
│  │  organizations  │◄─────── Tenant/Business Account                            │
│  │                 │                                                            │
│  │  - id (PK)      │                                                            │
│  │  - name         │                                                            │
│  │  - slug         │                                                            │
│  │  - status       │                                                            │
│  │  - plan_id (FK) │                                                            │
│  │  - stripe_id    │                                                            │
│  └────────┬────────┘                                                            │
│           │ 1:N                                                                  │
│           ▼                                                                     │
│  ┌─────────────────┐       ┌─────────────────┐                                  │
│  │     venues      │──────▶│   activities    │                                  │
│  │                 │  1:N  │                 │                                  │
│  │  - id (PK)      │       │  - id (PK)      │                                  │
│  │  - org_id (FK)  │       │  - venue_id(FK) │                                  │
│  │  - name         │       │  - org_id (FK)  │                                  │
│  │  - embed_key    │       │  - name         │                                  │
│  └─────────────────┘       │  - schedule     │                                  │
│                            └────────┬────────┘                                  │
│                                     │ 1:N                                       │
│                                     ▼                                           │
│                            ┌─────────────────┐       ┌─────────────────┐        │
│                            │activity_sessions│──────▶│    bookings     │        │
│                            │                 │  1:N  │                 │        │
│                            │  - id (PK)      │       │  - id (PK)      │        │
│                            │  - activity_id  │       │  - session_id   │        │
│                            │  - start_time   │       │  - customer_id  │        │
│                            │  - capacity     │       │  - status       │        │
│                            └─────────────────┘       │  - org_id (FK)  │        │
│                                                      └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        ROLE HIERARCHY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                            │
│  │  SYSTEM-ADMIN   │  Platform Owner                            │
│  │  (Platform)     │  • No organization_id (NULL)               │
│  │                 │  • Access ALL organizations                │
│  │                 │  • Manages plans, billing, features        │
│  │                 │  • Creates organizations & super-admins    │
│  └────────┬────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │  SUPER-ADMIN    │  Organization Owner                        │
│  │  (Org Level)    │  • Has organization_id                     │
│  │                 │  • Full access to own organization         │
│  │                 │  • Can view Organizations tab              │
│  │                 │  • Creates venues, activities, staff       │
│  └────────┬────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │   ORG-ADMIN     │  Organization Manager                      │
│  │  (Org Level)    │  • Has organization_id                     │
│  │                 │  • Simplified org management               │
│  │                 │  • No multi-venue complexity               │
│  └────────┬────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │     ADMIN       │  Full Operational Access                   │
│  │  (Org Level)    │  • Has organization_id                     │
│  │                 │  • Manages daily operations                │
│  │                 │  • No user management                      │
│  └────────┬────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │   MANAGER       │  Limited Management                        │
│  │  (Org Level)    │  • Has organization_id                     │
│  │                 │  • View + limited edit                     │
│  └────────┬────────┘                                            │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────┐                                            │
│  │    STAFF        │  Basic Operations                          │
│  │  (Org Level)    │  • Has organization_id                     │
│  │                 │  • View only                               │
│  └─────────────────┘                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

### Login Flow
```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Browser    │    │   Supabase   │    │  AuthContext │    │   App.tsx    │
│   (User)     │    │    Auth      │    │              │    │              │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │                   │
       │ 1. Login Form     │                   │                   │
       │──────────────────▶│                   │                   │
       │                   │                   │                   │
       │ 2. signInWithPassword                 │                   │
       │                   │──────────────────▶│                   │
       │                   │                   │                   │
       │ 3. Session Created│                   │                   │
       │◀──────────────────│                   │                   │
       │                   │                   │                   │
       │ 4. onAuthStateChange('SIGNED_IN')     │                   │
       │                   │──────────────────▶│                   │
       │                   │                   │                   │
       │                   │ 5. loadUserProfile│                   │
       │                   │     (users table) │                   │
       │                   │◀──────────────────│                   │
       │                   │                   │                   │
       │                   │ 6. setCurrentUser │                   │
       │                   │                   │──────────────────▶│
       │                   │                   │                   │
       │ 7. Render Dashboard (based on role)   │                   │
       │◀──────────────────────────────────────────────────────────│
       │                   │                   │                   │
```

### Profile Loading Issue (Current Bug)
```
┌──────────────────────────────────────────────────────────────────┐
│                     CURRENT BUG FLOW                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User logs in via Supabase Auth ✓                             │
│  2. Session created, hasSupabaseSession = true ✓                 │
│  3. loadUserProfile(userId) called                               │
│                                                                  │
│  4. Query: SELECT * FROM users WHERE id = userId                 │
│     │                                                            │
│     ▼                                                            │
│  ┌────────────────────────────────────────────┐                  │
│  │ RLS Policy: "Org members can view others"  │                  │
│  │                                            │                  │
│  │ USING (                                    │                  │
│  │   auth.uid() = id                   ✓ PASS │                  │
│  │   OR org_id = get_my_org_id()       ✗ FAIL │◄── Returns NULL  │
│  │   OR role() = 'service_role'        ✗ N/A  │    for sys-admin │
│  │ )                                          │                  │
│  └────────────────────────────────────────────┘                  │
│                                                                  │
│  5. Query returns NULL (no profile found)                        │
│  6. currentUser stays NULL                                       │
│  7. App shows "Loading your profile..." forever                  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Key Tables)

### public.users
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL DEFAULT 'staff',
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_platform_team BOOLEAN DEFAULT FALSE,  -- TRUE for platform staff
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_role CHECK (role IN (
    'system-admin', 'super-admin', 'org-admin', 
    'admin', 'beta-owner', 'manager', 'staff', 'customer'
  )),
  -- System admins must have NULL org_id
  CONSTRAINT system_admin_no_org CHECK (
    role != 'system-admin' OR organization_id IS NULL
  ),
  -- Non-system roles must have org_id
  CONSTRAINT non_system_requires_org CHECK (
    role = 'system-admin' OR organization_id IS NOT NULL
  )
);
```

### RLS Policies (Fixed)
```sql
-- Allow users to read their own profile (no org check needed)
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Allow system admins to read ALL users
CREATE POLICY "System admins can read all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u 
      WHERE u.id = auth.uid() 
      AND u.role = 'system-admin'
    )
  );

-- Allow org members to read users in same org
CREATE POLICY "Org members can view same org users" ON public.users
  FOR SELECT USING (
    organization_id = get_my_organization_id_raw()
    AND get_my_organization_id_raw() IS NOT NULL
  );

-- Service role bypass
CREATE POLICY "Service role bypass" ON public.users
  FOR ALL USING (auth.role() = 'service_role');
```

---

## Route Access Matrix

| Route | system-admin | super-admin | org-admin | admin | manager | staff |
|-------|-------------|-------------|-----------|-------|---------|-------|
| `/system-admin` | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `/dashboard` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/organizations` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `/venues` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| `/events` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/bookings` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/staff` | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| `/settings` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |

---

## Login Endpoints

| Endpoint | Target Users | Redirect After Login |
|----------|-------------|---------------------|
| `/system-admin-login` | Platform team | `/system-admin` |
| `/admin-login` | Alias for system-admin-login | `/system-admin` |
| `/org-login` | Organization owners/admins | `/dashboard` |
| `/beta-login` | Beta testers | `/dashboard` |
| `/demo-login` | Demo users | `/dashboard` |

---

## Implementation Checklist

1. [ ] Fix RLS policies to allow system-admin self-lookup
2. [ ] Add error handling in loadUserProfile for silent failures
3. [ ] Add timeout for profile loading with proper error message
4. [ ] Verify auth.users trigger creates public.users entry
5. [ ] Ensure system-admin user exists in public.users
6. [ ] Test login flow for all role types
