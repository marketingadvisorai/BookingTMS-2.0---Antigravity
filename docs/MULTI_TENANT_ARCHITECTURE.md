# Multi-Tenant Architecture

> Version: v0.1.56
> Last Updated: 2025-11-30

## Overview

BookingTMS implements a **multi-tenant architecture** where each organization (tenant) has:
- **Isolated data** - All data is scoped by `organization_id`
- **Dedicated admin portal** - Clean UI showing only their organization's data
- **Customizable branding** - Colors, logos, and settings per organization
- **Separate user management** - Each org has its own users

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           MULTI-TENANT DATA MODEL                               │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│   ORGANIZATIONS  │         │      PLANS       │
├──────────────────┤         ├──────────────────┤
│ id (PK)          │───┐     │ id (PK)          │
│ name             │   │     │ name             │
│ slug             │   │     │ price            │
│ owner_email      │   │     │ features (JSONB) │
│ owner_user_id (FK)│   │     │ limits (JSONB)   │
│ plan_id (FK)     │───┼─────│                  │
│ stripe_account_id│   │     └──────────────────┘
│ status           │   │
│ primary_color    │   │
│ trial_ends_at    │   │
└──────────────────┘   │
         │             │
         │ 1:N         │
         ▼             │
┌──────────────────┐   │     ┌──────────────────┐
│      USERS       │   │     │      VENUES      │
├──────────────────┤   │     ├──────────────────┤
│ id (PK)          │   │     │ id (PK)          │
│ organization_id  │◄──┼─────│ organization_id  │◄──┐
│ email            │   │     │ name             │   │
│ role             │   │     │ slug             │   │
│ full_name        │   │     │ address          │   │
│ is_active        │   │     │ timezone         │   │
└──────────────────┘   │     │ status           │   │
         │             │     └──────────────────┘   │
         │             │              │             │
         │             │              │ 1:N         │
         │             │              ▼             │
         │             │     ┌──────────────────┐   │
         │             │     │    ACTIVITIES    │   │
         │             │     ├──────────────────┤   │
         │             │     │ id (PK)          │   │
         │             └────►│ organization_id  │◄──┤
         │                   │ venue_id (FK)    │   │
         │                   │ name             │   │
         │                   │ price            │   │
         │                   │ stripe_product_id│   │
         │                   │ settings (JSONB) │   │
         │                   └──────────────────┘   │
         │                            │             │
         │                            │ 1:N         │
         │                            ▼             │
         │                   ┌──────────────────┐   │
         │                   │    BOOKINGS      │   │
         │                   ├──────────────────┤   │
         │                   │ id (PK)          │   │
         │                   │ organization_id  │◄──┤
         │                   │ activity_id (FK) │   │
         │                   │ customer_id (FK) │   │
         │                   │ booking_date     │   │
         │                   │ status           │   │
         │                   │ payment_status   │   │
         │                   │ total_amount     │   │
         │                   └──────────────────┘   │
         │                            │             │
         │                            │ N:1         │
         │                            ▼             │
         │                   ┌──────────────────┐   │
         │                   │    CUSTOMERS     │   │
         │                   ├──────────────────┤   │
         │                   │ id (PK)          │   │
         └──────────────────►│ organization_id  │◄──┤
                             │ email            │   │
                             │ name             │   │
                             │ phone            │   │
                             └──────────────────┘   │
                                                    │
                             ┌──────────────────┐   │
                             │  EMBED_CONFIGS   │   │
                             ├──────────────────┤   │
                             │ id (PK)          │   │
                             │ organization_id  │◄──┘
                             │ name             │
                             │ embed_key        │
                             │ type             │
                             │ config (JSONB)   │
                             │ style (JSONB)    │
                             └──────────────────┘
```

---

## Role Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ROLE HIERARCHY                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  SYSTEM ADMIN   │  ← Platform owner (BookingTMS team)
                    │  (God Mode)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  SUPER ADMIN    │  ← Platform support team
                    │  (Multi-Org)    │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
    ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
    │  ORG ADMIN  │   │  ORG ADMIN  │   │  ORG ADMIN  │  ← Organization owners
    │  (Org A)    │   │  (Org B)    │   │  (Org C)    │
    └──────┬──────┘   └──────┬──────┘   └──────┬──────┘
           │                 │                 │
     ┌─────┴─────┐     ┌─────┴─────┐     ┌─────┴─────┐
     │           │     │           │     │           │
  ┌──▼──┐    ┌──▼──┐  ...        ...    ...        ...
  │MANGR│    │STAFF│
  └─────┘    └─────┘
```

---

## Portal Access Matrix

| Portal | URL | Roles | Access |
|--------|-----|-------|--------|
| System Admin | `/dashboard` | system-admin, super-admin | All organizations |
| Org Admin | `/dashboard` | org-admin, beta-owner | Single organization |
| Staff | `/bookings` | manager, staff | Limited views |
| Customer | `/my-bookings` | customer | Own bookings only |
| Beta Login | `/beta-login` | All | Demo + Supabase auth |
| Org Login | `/org-login` | org-admin | Supabase auth only |

---

## Data Isolation Rules

### 1. Database Level (RLS Policies)

```sql
-- Example: Venues table RLS
CREATE POLICY "Tenant Isolation: Venues"
ON venues FOR ALL
TO authenticated
USING (
  -- User can only access venues in their organization
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
);
```

### 2. Application Level (Hooks)

```typescript
// Example: useVenues hook filters by organizationId
const { venues } = useVenues({
  organizationId: currentUser?.organizationId,
  fetchAll: isSystemAdmin, // Only system-admin can fetch all
});
```

### 3. UI Level (Sidebar)

```typescript
// Example: Sidebar hides system-level items for org admins
const navItems = allNavItems.filter(item => {
  if (isOrgAdmin) {
    return !['organizations', 'staff', 'campaigns'].includes(item.id);
  }
  return true;
});
```

---

## User Flows

### Flow 1: Organization Onboarding

```
1. System Admin creates organization
   ↓
2. System auto-creates default venue
   ↓
3. System creates org-admin user (optional)
   ↓
4. Password reset email sent to owner
   ↓
5. Owner logs in via /org-login or /beta-login
   ↓
6. Owner sees clean dashboard (only their org's data)
```

### Flow 2: Org Admin Daily Operations

```
1. Login at /beta-login or /org-login
   ↓
2. Dashboard shows:
   - Today's bookings (filtered by org)
   - Revenue stats (filtered by org)
   - Recent activity (filtered by org)
   ↓
3. Manage Activities → All activities scoped to org
   ↓
4. Manage Bookings → All bookings scoped to org
   ↓
5. Create Embed Widget → Automatically assigned to org
```

### Flow 3: Password Reset

```
1. User clicks "Forgot Password"
   ↓
2. Enters email → Supabase sends reset email
   ↓
3. Clicks link → /reset-password
   ↓
4. Sets new password
   ↓
5. Redirected to login → Login with new password
   ↓
6. Redirected to correct portal based on role
```

---

## Technical Implementation

### Key Files

| Component | Location | Purpose |
|-----------|----------|---------|
| Auth Context | `/src/lib/auth/AuthContext.tsx` | User state management |
| Redirect Utils | `/src/lib/auth/redirectUtils.ts` | Role-based redirects |
| Sidebar | `/src/components/layout/Sidebar.tsx` | Role-filtered navigation |
| Organizations Page | `/src/pages/Organizations.tsx` | Org management (system-admin) |
| Password Service | `/src/services/password.service.ts` | Password reset operations |

### Database Tables

| Table | Multi-Tenant | Key Columns |
|-------|--------------|-------------|
| `organizations` | Root entity | `id`, `name`, `owner_user_id` |
| `users` | Scoped | `organization_id`, `role` |
| `venues` | Scoped | `organization_id` |
| `activities` | Scoped | `organization_id`, `venue_id` |
| `bookings` | Scoped | `organization_id`, `activity_id` |
| `customers` | Scoped | `organization_id` |
| `embed_configs` | Scoped | `organization_id` |

---

## Best Practices

### 1. Always Filter by Organization

```typescript
// ❌ BAD - fetches all data
const { data } = await supabase.from('venues').select('*');

// ✅ GOOD - filtered by organization
const { data } = await supabase
  .from('venues')
  .select('*')
  .eq('organization_id', currentUser.organizationId);
```

### 2. Use RLS as Defense in Depth

Even if application code forgets to filter, RLS policies prevent data leakage.

### 3. Audit Trail

All mutations should log `organization_id` for compliance and debugging.

### 4. Test Data Isolation

Write tests that verify users from Org A cannot access Org B's data.

---

## Security Considerations

1. **Row Level Security (RLS)** - All tables have RLS enabled
2. **JWT Claims** - User's `organization_id` stored in token
3. **API Validation** - Server-side checks before mutations
4. **Audit Logs** - Track who accessed what data
5. **Session Management** - Proper logout clears all session data

---

## Future Enhancements

1. **Organization Switching** - Allow super-admins to switch context
2. **Sub-Organizations** - Support for franchises
3. **Custom Domains** - Each org gets `[slug].bookingtms.com`
4. **White-Label Mode** - Complete branding customization
5. **Data Export** - Per-organization data export for compliance
