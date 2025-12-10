# Staff Management System - Complete Architecture

## Version: 3.0.0 (Dec 10, 2025)

## Overview

Multi-tenant staff management system with role-based access control, organization selection for system admins, and proper database profile creation.

---

## ERD Diagram

```
┌─────────────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
│   auth.users        │       │     organizations   │       │ organization_members│
├─────────────────────┤       ├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │──────▶│ id (PK)             │◀──────│ organization_id (FK)│
│ email               │       │ name                │       │ user_id (FK)        │
│ encrypted_password  │       │ status              │       │ role                │
│ created_at          │       │ owner_id (FK)       │       │ status              │
│ user_metadata       │       │ ...                 │       │ created_at          │
└─────────────────────┘       └─────────────────────┘       └─────────────────────┘
         │                             │
         │                             │
         ▼                             │
┌─────────────────────┐                │
│      users          │                │
├─────────────────────┤                │
│ id (PK, FK auth)    │                │
│ email               │                │
│ full_name           │                │
│ role                │                │
│ organization_id (FK)│◀───────────────┘
│ is_active           │
│ is_platform_team    │
│ avatar_url          │
│ created_at          │
└─────────────────────┘
         │
         │ 1:1 per org
         ▼
┌─────────────────────┐       ┌─────────────────────┐
│   staff_profiles    │       │ staff_assignments   │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │◀──────│ staff_profile_id FK │
│ user_id (FK)        │       │ organization_id (FK)│
│ organization_id (FK)│       │ assignment_type     │
│ department          │       │ activity_id (FK)    │
│ job_title           │       │ venue_id (FK)       │
│ phone               │       │ schedule_pattern    │
│ hire_date           │       │ start_date          │
│ skills[]            │       │ end_date            │
│ assigned_activities │       │ is_primary          │
│ assigned_venues     │       └─────────────────────┘
│ work_schedule       │
│ hourly_rate         │
│ created_at          │
└─────────────────────┘
         │
         │
         ▼
┌─────────────────────┐       ┌─────────────────────┐
│ staff_time_entries  │       │  staff_availability │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │       │ id (PK)             │
│ staff_profile_id FK │       │ staff_profile_id FK │
│ organization_id FK  │       │ organization_id FK  │
│ clock_in            │       │ day_of_week         │
│ clock_out           │       │ start_time          │
│ break_minutes       │       │ end_time            │
│ activity_id FK      │       │ is_available        │
│ booking_id FK       │       │ preference          │
│ notes               │       │ effective_from      │
│ status              │       │ effective_until     │
└─────────────────────┘       └─────────────────────┘
```

---

## Module Structure

```
/src/modules/staff/
├── index.ts                          # Main barrel export
├── constants/
│   ├── index.ts                      # Constants barrel
│   ├── roles.ts                      # Role definitions (55 lines)
│   └── permissions.ts                # Permission matrix (85 lines)
├── types/
│   ├── index.ts                      # Types barrel
│   ├── staff.types.ts                # Staff member types (135 lines)
│   ├── assignment.types.ts           # Assignment types (70 lines)
│   └── schedule.types.ts             # Schedule types (90 lines)
├── utils/
│   └── mappers.ts                    # DB ↔ UI mappers (140 lines)
├── services/
│   ├── index.ts                      # Services barrel
│   ├── staff.service.ts              # Facade service (35 lines)
│   ├── staffCrud.service.ts          # CRUD operations (115 lines)
│   ├── staffQuery.service.ts         # List/stats queries (95 lines)
│   ├── assignment.service.ts         # Assignment CRUD (125 lines)
│   ├── schedule.service.ts           # Schedule management (130 lines)
│   ├── availability.service.ts       # Availability CRUD (130 lines)
│   └── permission.service.ts         # Permission checks (95 lines)
├── hooks/
│   ├── index.ts                      # Hooks barrel
│   ├── useStaff.ts                   # Main staff hook (237 lines)
│   ├── useStaffAssignments.ts        # Assignments hook (120 lines)
│   └── useStaffPermissions.ts        # Permission hook (75 lines)
├── components/
│   ├── index.ts                      # Components barrel
│   ├── StaffStatsCards.tsx           # Stats display (75 lines)
│   ├── StaffFilters.tsx              # Filter controls (100 lines)
│   ├── StaffTable.tsx                # Table view (145 lines)
│   ├── AddStaffDialog.tsx            # Create dialog (182 lines)
│   ├── OrganizationSelector.tsx      # Org dropdown (72 lines)
│   ├── ViewStaffDialog.tsx           # View details (142 lines)
│   ├── DeleteStaffDialog.tsx         # Delete confirm (65 lines)
│   └── StaffDetailPanel.tsx          # Detail + assignments
└── pages/
    └── StaffPage.tsx                 # Main page (214 lines)
```

---

## Data Flow: Adding Staff

### System Admin Flow
```
1. System Admin clicks "Add Staff Member"
   │
   ▼
2. AddStaffDialog opens with OrganizationSelector
   │
   ▼
3. Admin selects Organization from dropdown
   │
   ▼
4. Admin fills form (name, email, password, role, department)
   │
   ▼
5. Click "Add Staff Member" → handleAddStaff(data, password, orgId)
   │
   ▼
6. useStaff.createStaff(data, password, orgId)
   │
   ▼
7. staffService.create() → Edge Function 'create-staff-member'
   │
   ▼
8. Edge Function:
   a. Create auth.users entry
   b. Call RPC create_staff_member_profile()
      - Upsert users table
      - Insert organization_members
      - Insert staff_profiles
   c. Return staff_profile_id
   │
   ▼
9. Success toast + Refresh staff list
```

### Org Admin Flow
```
1. Org Admin clicks "Add Staff Member"
   │
   ▼
2. AddStaffDialog opens (NO OrganizationSelector - org auto-selected)
   │
   ▼
3. Admin fills form (name, email, password, role, department)
   │
   ▼
4. Click "Add Staff Member"
   │ organizationId from currentUser.organizationId
   ▼
5-9. Same as System Admin flow
```

---

## Role Hierarchy & Permissions

| Level | Role         | Can Create Staff | Can Assign Roles          |
|-------|--------------|------------------|---------------------------|
| 0     | system-admin | ✅ Any org       | All roles                 |
| 1     | super-admin  | ✅ Own org       | org-admin and below       |
| 2     | org-admin    | ✅ Own org       | admin and below           |
| 3     | admin        | ✅ Own org       | manager, staff            |
| 4     | manager      | ❌               | None                      |
| 5     | staff        | ❌               | None                      |

---

## Database Functions

### create_staff_member_profile()
Creates all related records in one transaction:
- `users` table entry
- `organization_members` entry (for org-level roles)
- `staff_profiles` entry

```sql
CREATE FUNCTION create_staff_member_profile(
  p_user_id UUID,
  p_email VARCHAR,
  p_full_name VARCHAR,
  p_role VARCHAR,
  p_organization_id UUID,
  p_department VARCHAR DEFAULT NULL,
  p_job_title VARCHAR DEFAULT NULL,
  p_phone VARCHAR DEFAULT NULL,
  p_hire_date DATE DEFAULT NULL,
  p_skills TEXT[] DEFAULT '{}'
) RETURNS TABLE (user_id UUID, staff_profile_id UUID, organization_id UUID)
```

### get_staff_members()
Returns staff list with joined user data.

### get_staff_stats()
Returns aggregate statistics by role and department.

---

## Edge Function: create-staff-member

**Version:** 2.0.0

**Request:**
```typescript
{
  email: string;
  password: string;
  full_name: string;
  role: string;
  organization_id: string;
  department?: string;
  job_title?: string;
  phone?: string;
  hire_date?: string;
  skills?: string[];
}
```

**Response:**
```typescript
{
  success: boolean;
  user_id: string;
  staff_profile_id: string;
  organization_id: string;
  message: string;
}
```

---

## Usage Examples

### Using the Staff Hook
```typescript
import { useStaff } from '@/modules/staff';

const {
  staff,
  stats,
  loading,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleStatus,
  refreshStaff,
} = useStaff();

// Create staff (org admin - org ID from context)
await createStaff(formData, password);

// Create staff (system admin - explicit org ID)
await createStaff(formData, password, selectedOrgId);
```

### Using Services Directly
```typescript
import { staffService, staffCrudService, staffQueryService } from '@/modules/staff/services';

// Via facade
const staffList = await staffService.list({ organizationId });
const stats = await staffService.getStats(organizationId);
const created = await staffService.create(data, orgId, password);

// Direct access (if needed)
const member = await staffCrudService.getById(id);
const depts = await staffQueryService.getDepartments(orgId);
```

---

## Migrations

| Migration | Purpose |
|-----------|---------|
| 079_staff_module_schema.sql | Base staff tables, RLS, functions |
| 089_enhanced_staff_management.sql | Assignments, shifts, availability |
| 090_staff_creation_fix.sql | create_staff_member_profile function |

---

## RLS Policies

- **Platform admins**: Full access to all staff data
- **Org admins**: Full access within their organization
- **Staff members**: Can view own profile and org colleagues

---

## Related Documentation

- `/docs/MULTI_TENANT_AUTH_ARCHITECTURE.md` - Auth system
- `/docs/STAFF_MANAGEMENT_ARCHITECTURE_V2.md` - Previous version
