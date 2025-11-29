# Organizations Module Architecture

> Version: v0.1.57
> Date: 2025-11-30

## Overview

The Organizations module manages all organization (tenant) operations for System Admins and Super Admins. It follows a modular architecture with each component under 250 lines.

## Directory Structure

```
src/features/organizations/
├── ARCHITECTURE.md              # This file
└── components/
    ├── index.ts                 # Barrel export (28 lines)
    ├── statusConfig.tsx         # Shared status configuration (36 lines)
    ├── StatCard.tsx             # Statistics card (39 lines)
    ├── OrganizationsHeader.tsx  # Page header with actions (44 lines)
    ├── OrganizationsEmptyState.tsx    # Empty state display (34 lines)
    ├── OrganizationsErrorCard.tsx     # Error display (33 lines)
    ├── OrganizationsLoadingSkeleton.tsx # Loading skeleton (76 lines)
    ├── OrganizationsFilters.tsx       # Search & filter controls (99 lines)
    ├── OrganizationCard.tsx           # Grid view card (149 lines)
    └── OrganizationsTable.tsx         # Table view (208 lines)

Main page: src/pages/OrganizationsNew.tsx (253 lines)
```

## Component Responsibilities

### Page-Level Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `OrganizationsHeader` | Title, description, action buttons | `onAdd` |
| `OrganizationsFilters` | Search, status filter, view mode | search, filter, viewMode state handlers |

### Data Display Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `StatCard` | Single statistic with icon | `title`, `value`, `icon`, `color` |
| `OrganizationCard` | Grid view card for one org | `organization`, `onEdit/Delete/Settings/ResetPassword` |
| `OrganizationsTable` | Table view with all orgs | Same as OrganizationCard, but `organizations[]` |

### State Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `OrganizationsLoadingSkeleton` | Loading state | `viewMode` |
| `OrganizationsEmptyState` | No data state | `onAdd` |
| `OrganizationsErrorCard` | Error state | `error`, `onRetry` |

### Shared Configuration

| File | Purpose |
|------|---------|
| `statusConfig.tsx` | Badge styles for org status (active, pending, suspended, inactive) |
| `index.ts` | Barrel export for clean imports |

## Usage

```tsx
// Import all needed components
import {
  StatCard,
  OrganizationCard,
  OrganizationsTable,
  OrganizationsLoadingSkeleton,
  OrganizationsHeader,
  OrganizationsFilters,
  OrganizationsEmptyState,
  OrganizationsErrorCard,
} from '../features/organizations/components';

// Use in your page
<OrganizationsHeader onAdd={handleAdd} />
<OrganizationsFilters {...filterProps} />
{isLoading ? (
  <OrganizationsLoadingSkeleton viewMode={viewMode} />
) : (
  <OrganizationsTable organizations={data} {...handlers} />
)}
```

## Data Flow

```
App.tsx (route: 'organizations')
    ↓
OrganizationsNew.tsx (main page)
    ↓
useOrganizations() hook → OrganizationService → Supabase
    ↓
Render: Header → Stats → Filters → Content (Table/Grid)
    ↓
Modals: OrganizationModal, OrganizationSettingsModal, UserPasswordResetModal
```

## Dependencies

- `../features/system-admin/hooks` - Data fetching hooks
- `../features/system-admin/services` - API services
- `../components/organizations` - Settings modal
- `../components/admin` - Password reset modal
- `../components/ui/*` - shadcn/ui components

## Permissions

- **Visible to**: `system-admin`, `super-admin`
- **Hidden from**: `org-admin`, `beta-owner`, `manager`, `staff`

## Future Improvements

1. Add pagination component
2. Add bulk actions (select multiple orgs)
3. Add org switching for super-admin
4. Add export functionality
