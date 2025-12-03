# Guests Module Architecture

**Version:** 2.0.0  
**Date:** December 4, 2025  
**Location:** `/src/modules/guests/`

## Overview

Enterprise-level guest/customer management module with multi-tenant architecture, real-time subscriptions, and proper separation of concerns.

## Key Features

- **Multi-Tenant**: All data scoped by `organization_id`
- **Real-Time**: Supabase subscriptions for live updates (500ms debounce)
- **Type-Safe**: Full TypeScript coverage
- **Modular**: Clean separation (types → services → hooks → components → pages)
- **Enterprise-Grade**: Follows SOLID, DRY principles

## Module Structure

```
/src/modules/guests/
├── index.ts                    # Main barrel export
├── types/
│   └── index.ts                # All TypeScript interfaces
├── services/
│   ├── index.ts                # Service exports
│   ├── customer.service.ts     # CRUD operations (multi-tenant)
│   └── metrics.service.ts      # Analytics & insights
├── hooks/
│   ├── index.ts                # Hook exports
│   └── useGuests.ts            # Main hook with real-time
├── utils/
│   ├── index.ts                # Utility exports
│   └── mappers.ts              # DB ↔ UI mappers
├── components/
│   ├── index.ts                # Component exports
│   ├── GuestStats.tsx          # Dashboard metrics cards
│   ├── GuestTable.tsx          # Data table with actions
│   ├── GuestFilters.tsx        # Search & filter bar
│   └── AddGuestDialog.tsx      # Add/edit form dialog
└── pages/
    ├── index.ts                # Page exports
    └── GuestsPage.tsx          # Main page component
```

## Database Schema

### `customers` Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `organization_id` | UUID | **Multi-tenant key** |
| `first_name` | VARCHAR(255) | First name |
| `last_name` | VARCHAR(255) | Last name |
| `email` | VARCHAR(255) | Email address |
| `phone` | VARCHAR(255) | Phone number |
| `total_bookings` | INTEGER | Booking count |
| `total_spent` | NUMERIC | Lifetime value |
| `status` | VARCHAR | active/inactive/blocked |
| `metadata` | JSONB | Lifecycle, tiers, preferences |
| `created_by` | UUID | Creator user ID |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### Metadata JSONB Structure

```typescript
interface CustomerMetadata {
  lifecycle_stage: 'new' | 'active' | 'at-risk' | 'churned';
  spending_tier: 'vip' | 'high' | 'medium' | 'low';
  frequency_tier: 'frequent' | 'regular' | 'occasional' | 'one-time';
  is_new: boolean;
  favorite_game_id?: string;
  preferred_venue_id?: string;
  marketing_consent: boolean;
  tags: string[];
}
```

## Multi-Tenant Architecture

### Data Isolation

1. **Service Layer**: All queries filter by `organization_id`
2. **RLS Policies**: Database-level enforcement
3. **Hook Layer**: Auto-injects org ID from auth context

### RLS Policies (Migration 076)

| Policy | Role | Access |
|--------|------|--------|
| Platform admins | system-admin | Full access to ALL |
| Org members SELECT | org users | View own org only |
| Org members INSERT | org users | Create in own org |
| Org members UPDATE | org users | Update own org |
| Org members DELETE | org users | Delete own org |

### Helper Functions

```sql
-- Get current user's organization
get_my_organization_id_safe() → UUID

-- Check if platform admin
is_platform_admin_safe() → BOOLEAN

-- Get customer metrics
get_customer_metrics_v2(org_id?) → TABLE
```

## Usage

### Import the Module

```typescript
import { 
  useGuests,
  customerService,
  metricsService,
  GuestsPage,
} from '@/modules/guests';
```

### Use the Hook

```typescript
const {
  customers,
  metrics,
  loading,
  createCustomer,
  updateCustomer,
  refreshCustomers,
  getCustomerInsights,
} = useGuests({
  autoLoad: true,
  realtimeEnabled: true,
  debounceMs: 500,
});
```

### Direct Service Calls

```typescript
// List with filters
const result = await customerService.list({
  search: 'john',
  status: 'active',
  page: 1,
  limit: 25,
});

// Create customer
await customerService.create({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
});
```

## Real-Time Updates

The module subscribes to Supabase real-time changes:

```typescript
supabase
  .channel('guests-realtime')
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'customers' 
  }, callback)
  .subscribe();
```

Changes are debounced at 500ms to prevent excessive updates.

## Segmentation

### Lifecycle Stages

- **New**: Created in last 30 days
- **Active**: Booked in last 30 days
- **At-Risk**: No booking in 30-90 days
- **Churned**: No booking in 90+ days

### Spending Tiers

- **VIP**: $1,000+ lifetime value
- **High**: $500-999
- **Medium**: $100-499
- **Low**: <$100

### Frequency Tiers

- **Frequent**: 2+ bookings/month
- **Regular**: 0.5-2 bookings/month
- **Occasional**: 2+ bookings total
- **One-Time**: Single booking

## File Size Compliance

| File | Lines | Status |
|------|-------|--------|
| types/index.ts | 238 | ✅ |
| services/customer.service.ts | 230 | ✅ |
| services/metrics.service.ts | 206 | ✅ |
| hooks/useGuests.ts | 248 | ✅ |
| components/GuestStats.tsx | 121 | ✅ |
| components/GuestTable.tsx | 186 | ✅ |
| components/GuestFilters.tsx | 135 | ✅ |
| components/AddGuestDialog.tsx | 229 | ✅ |
| pages/GuestsPage.tsx | 248 | ✅ |

All files under 250 lines ✅

## Migration

Apply migration 076 to enable RLS:

```bash
supabase db push
# or
supabase migration up
```

## Related Modules

- **Customer Portal** (`/src/modules/customer-portal/`): Public-facing customer booking management
- **Marketing Pro** (`/src/modules/marketing-pro/`): Email campaigns, segments
- **Bookings** (`/src/pages/Bookings.tsx`): Admin booking management
