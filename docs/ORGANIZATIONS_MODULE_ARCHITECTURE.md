# Organizations Module Architecture

> Version: v0.1.60
> Last Updated: 2025-11-30

## Overview

The Organizations module is the **multi-tenant foundation** of BookingTMS. It manages tenant accounts (organizations) and provides the hierarchical structure for all other entities.

## Entity Hierarchy

```
Platform (BookingTMS)
    └── Organizations (Tenants)
            ├── Venues (Physical Locations)
            │       └── Activities (Bookable Experiences)
            │               └── Sessions (Time Slots)
            │                       └── Bookings (Customer Reservations)
            ├── Users (Staff/Admins)
            ├── Customers (End Users)
            └── Marketing (Campaigns, Affiliates, etc.)
```

## ERD (Entity Relationship Diagram)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              ORGANIZATIONS                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ id (PK)           │ uuid        │ Primary key                                │
│ name              │ varchar     │ Organization name                          │
│ slug              │ varchar     │ URL-safe identifier                        │
│ owner_name        │ varchar     │ Owner's full name                          │
│ owner_email       │ varchar     │ Owner's email                              │
│ website           │ varchar     │ Organization website                       │
│ phone             │ varchar     │ Contact phone                              │
│ address           │ text        │ Street address                             │
│ city              │ varchar     │ City                                       │
│ state             │ varchar     │ State/Province                             │
│ zip               │ varchar     │ ZIP/Postal code                            │
│ country           │ varchar     │ Country                                    │
│ plan_id (FK)      │ uuid        │ → plans.id                                 │
│ status            │ varchar     │ active|inactive|suspended|pending          │
│ is_active         │ boolean     │ Legacy active flag                         │
│ stripe_account_id │ varchar     │ Stripe Connect account                     │
│ stripe_customer_id│ varchar     │ Stripe customer for billing                │
│ stripe_charges_enabled │ bool   │ Can accept payments                        │
│ stripe_payouts_enabled │ bool   │ Can receive payouts                        │
│ application_fee_percentage │ decimal │ Platform fee %                        │
│ created_at        │ timestamp   │ Creation timestamp                         │
│ updated_at        │ timestamp   │ Last update                                │
└──────────────────────────────────────────────────────────────────────────────┘
                │
                │ 1:N
                ▼
┌─────────────────────────────────────────┐
│             CHILD TABLES                │
├─────────────────────────────────────────┤
│ venues              │ organization_id   │
│ activities          │ organization_id   │
│ activity_sessions   │ organization_id   │
│ bookings            │ organization_id   │
│ customers           │ organization_id   │
│ users               │ organization_id   │
│ organization_members│ organization_id   │
│ promotions          │ organization_id   │
│ gift_cards          │ organization_id   │
│ email_campaigns     │ organization_id   │
│ email_templates     │ organization_id   │
│ email_workflows     │ organization_id   │
│ affiliates          │ organization_id   │
│ reviews             │ organization_id   │
│ marketing_settings  │ organization_id   │
│ embed_configs       │ organization_id   │
│ notifications       │ organization_id   │
│ organization_usage  │ organization_id   │
│ subscription_history│ organization_id   │
└─────────────────────────────────────────┘
```

## File Structure

```
src/
├── pages/
│   ├── Organizations.tsx           # Main organizations page (legacy)
│   └── OrganizationsNew.tsx        # Refactored page (modular)
│
├── features/
│   ├── system-admin/
│   │   ├── components/
│   │   │   └── organizations/
│   │   │       └── OrganizationModal.tsx  # Add/Edit modal
│   │   │
│   │   ├── services/
│   │   │   └── OrganizationService.ts     # CRUD operations
│   │   │
│   │   ├── hooks/
│   │   │   └── useOrganizations.ts        # React Query hooks
│   │   │
│   │   ├── types/
│   │   │   └── organization.types.ts      # TypeScript interfaces
│   │   │
│   │   └── utils/
│   │       └── validators.ts              # Validation functions
│   │
│   └── organizations/
│       ├── ARCHITECTURE.md               # Module docs
│       └── components/                   # Modular components
│           ├── index.ts
│           ├── StatCard.tsx
│           ├── OrganizationCard.tsx
│           ├── OrganizationsTable.tsx
│           └── ...
│
├── components/
│   └── organizations/
│       └── OrganizationSettingsModal.tsx  # Settings modal
│
└── services/
    └── password.service.ts               # Password reset
```

## Service Layer

### OrganizationService

```typescript
class OrganizationService {
  // Read operations
  static getAll(filters, page, perPage): Promise<OrganizationListResponse>
  static getById(id): Promise<Organization>
  
  // Write operations (use RPC functions)
  static create(dto): Promise<Organization>
  static update(id, dto): Promise<Organization>
  static delete(id): Promise<void>
  
  // User management
  static createOrgAdmin(params): Promise<AdminCredentials>
  static createComplete(dto, password): Promise<CompleteResult>
  
  // Metrics
  static getMetrics(id): Promise<OrganizationMetrics>
}
```

### Database RPC Functions

These functions use `SECURITY DEFINER` to bypass RLS:

```sql
-- Create organization (system-admin only)
admin_create_organization(
  p_name, p_slug, p_owner_name, p_owner_email,
  p_website, p_phone, p_address, p_city, p_state,
  p_zip, p_country, p_plan_id, p_status
) → uuid

-- Update organization (system-admin only)
admin_update_organization(
  p_org_id, p_name, p_owner_name, p_owner_email,
  p_website, p_phone, p_address, p_city, p_state,
  p_zip, p_country, p_plan_id, p_status,
  p_application_fee_percentage
) → boolean

-- Delete organization with cascading (system-admin only)
admin_delete_organization(p_org_id) → boolean
```

## RLS Policies

### Organizations Table

| Policy | Command | Roles | Condition |
|--------|---------|-------|-----------|
| `organizations_admin_full_access` | ALL | authenticated | users.role IN ('system-admin', 'super-admin') |
| `organizations_members_read` | SELECT | authenticated | User is member of org |
| `organizations_public_read` | SELECT | anon | status = 'active' |

### Child Tables Pattern

All child tables follow this RLS pattern:
```sql
CREATE POLICY "{table}_full_access" ON {table}
  FOR ALL TO authenticated
  USING (
    -- System admins get full access
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() 
            AND role IN ('system-admin', 'super-admin'))
    -- OR user belongs to the organization
    OR organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Organizations Page                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   Header + Actions                       │   │
│  │  [Add Organization] [Export] [Refresh]                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Stats Cards                           │   │
│  │  [Total: 4] [Active: 2] [Pending: 1] [Suspended: 1]     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Filters & Search                        │   │
│  │  [🔍 Search...] [Status: All ▾] [View: Table/Grid]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                 Organizations List                       │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │ Org Name │ Owner │ Plan │ Status │ Actions      │    │   │
│  │  ├─────────────────────────────────────────────────┤    │   │
│  │  │ Acme Co  │ John  │ Pro  │ Active │ ⚙️ ✏️ 🔑 🗑️ │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Pagination                            │   │
│  │  [← Prev] Page 1 of 3 [Next →]                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐  ┌────────────────────┐  ┌───────────────────┐
│ Organization  │  │ Organization       │  │ Password Reset    │
│ Modal         │  │ Settings Modal     │  │ Modal             │
├───────────────┤  ├────────────────────┤  ├───────────────────┤
│ • Basic Info  │  │ • General Tab      │  │ • Send Email      │
│ • Owner Info  │  │ • Billing Tab      │  │ • Set Password    │
│ • Location    │  │ • Stripe Connect   │  │                   │
│ • Plan/Status │  │ • Limits Tab       │  │                   │
│ • Password    │  │ • Team Tab         │  │                   │
└───────────────┘  └────────────────────┘  └───────────────────┘
```

## Data Flow

```
User Action → Page Component → Hook (useOrganizations)
                                    │
                                    ▼
                            OrganizationService
                                    │
                                    ▼
                            Supabase RPC Function
                                    │
                                    ▼
                            PostgreSQL Database
                                    │
                                    ▼
                            React Query Cache
                                    │
                                    ▼
                            UI Update
```

## Permissions Matrix

| Role | View | Create | Edit | Delete | Reset Password |
|------|------|--------|------|--------|----------------|
| system-admin | ✅ All | ✅ | ✅ | ✅ | ✅ |
| super-admin | ✅ All | ✅ | ✅ | ✅ | ✅ |
| org-admin | ✅ Own | ❌ | ✅ Own | ❌ | ❌ |
| manager | ✅ Own | ❌ | ❌ | ❌ | ❌ |
| staff | ✅ Own | ❌ | ❌ | ❌ | ❌ |
| anon | ✅ Active | ❌ | ❌ | ❌ | ❌ |

## Tasks & Steps

### Initial Setup

- [x] Create organizations table with all fields
- [x] Create plans table for subscription tiers
- [x] Set up RLS policies for multi-tenancy
- [x] Create TypeScript types and interfaces
- [x] Implement OrganizationService with CRUD
- [x] Create useOrganizations React Query hook
- [x] Build Organizations page with list/grid views
- [x] Build OrganizationModal for add/edit
- [x] Build OrganizationSettingsModal for detailed settings

### RLS & Security

- [x] Create RPC functions for admin operations
- [x] Implement SECURITY DEFINER functions
- [x] Add role checks inside RPC functions
- [x] Test RLS policies for all user roles
- [x] Verify cascading deletes work properly

### Integration Tasks

- [x] Integrate with Stripe Connect for payments
- [x] Integrate with Plans for subscription management
- [x] Connect password reset with edge function
- [x] Add audit logging for admin actions

### Future Improvements

- [ ] Add organization onboarding wizard
- [ ] Implement organization switching for super-admins
- [ ] Add bulk operations (archive, suspend multiple)
- [ ] Create organization analytics dashboard
- [ ] Add organization import/export functionality
- [ ] Implement organization templates

## Validation Rules

### Organization Name
- Required
- Min: 2 characters
- Max: 100 characters

### Owner Email
- Required
- Valid email format

### Owner Name
- Required
- Min: 2 characters

### Website
- Optional
- Accepts: `example.com`, `www.example.com`, `https://example.com`
- Auto-normalized to include `https://`

### Phone
- Optional
- Min: 10 digits
- Allowed: digits, spaces, hyphens, plus, parentheses

### Plan
- Required
- Must be valid plan_id from plans table

## API Reference

### Create Organization

```typescript
const result = await OrganizationService.createComplete({
  name: 'Acme Corp',
  owner_name: 'John Doe',
  owner_email: 'john@acme.com',
  website: 'acme.com',
  phone: '+1 555-123-4567',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  zip: '10001',
  country: 'United States',
  plan_id: 'uuid-of-plan',
  status: 'active',
  create_default_venue: true,
}, 'optional-password');
```

### Update Organization

```typescript
await OrganizationService.update('org-uuid', {
  name: 'Acme Corporation',
  status: 'active',
  application_fee_percentage: 2.5,
});
```

### Delete Organization

```typescript
await OrganizationService.delete('org-uuid');
// Cascades to all child records
```

## Related Documentation

- [Database Schema](/.agent/rules/database-schema.md)
- [Venues Module](./VENUES_MODULE_ARCHITECTURE.md)
- [Activities Module](./ACTIVITIES_MODULE_ARCHITECTURE.md)
- [Coding Standards](/.agent/rules/coding-standards.md)
