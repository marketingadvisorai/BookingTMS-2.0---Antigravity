# Staff Module Architecture

## Overview

The Staff Module provides enterprise-grade staff management for multi-tenant organizations. It follows the same modular architecture as the Waivers module with all files under 200 lines.

## Module Location

```
/src/modules/staff/
```

## Directory Structure

```
/src/modules/staff/
├── index.ts                          - Main barrel export (45 lines)
├── types/index.ts                    - TypeScript interfaces (180 lines)
├── utils/mappers.ts                  - DB ↔ UI mappers (165 lines)
├── services/
│   ├── index.ts                      - Service barrel export
│   └── staff.service.ts              - Staff CRUD operations (195 lines)
├── hooks/useStaff.ts                 - Main React hook (195 lines)
├── components/
│   ├── index.ts                      - Component barrel export
│   ├── StaffStatsCards.tsx           - Stats display (75 lines)
│   ├── StaffFilters.tsx              - Search & filter controls (100 lines)
│   ├── StaffTable.tsx                - Table/card views (280 lines)
│   ├── AddStaffDialog.tsx            - Create dialog (185 lines)
│   ├── ViewStaffDialog.tsx           - View details dialog (140 lines)
│   └── DeleteStaffDialog.tsx         - Delete confirmation (65 lines)
└── pages/StaffPage.tsx               - Main page component (145 lines)
```

## Database Schema

### Migration: `079_staff_module_schema.sql`

### Tables

#### `staff_profiles`
Extended profile data for staff members (linked to `users` table).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | FK to users.id |
| organization_id | UUID | FK to organizations.id |
| employee_id | VARCHAR | Optional employee ID |
| department | VARCHAR | Department name |
| job_title | VARCHAR | Job title |
| hire_date | DATE | Hire date |
| phone | VARCHAR | Contact phone |
| emergency_contact_name | VARCHAR | Emergency contact |
| emergency_contact_phone | VARCHAR | Emergency phone |
| work_schedule | JSONB | Weekly schedule config |
| hourly_rate | DECIMAL | Pay rate |
| skills | TEXT[] | Array of skills |
| certifications | JSONB | Certifications array |
| assigned_activities | UUID[] | Activity assignments |
| assigned_venues | UUID[] | Venue assignments |
| avatar_url | TEXT | Profile image |
| metadata | JSONB | Additional data |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Updated timestamp |

#### `staff_time_entries`
Time tracking for staff members.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| staff_profile_id | UUID | FK to staff_profiles.id |
| organization_id | UUID | FK to organizations.id |
| clock_in | TIMESTAMPTZ | Clock in time |
| clock_out | TIMESTAMPTZ | Clock out time |
| break_minutes | INT | Break duration |
| activity_id | UUID | Optional activity FK |
| booking_id | UUID | Optional booking FK |
| notes | TEXT | Entry notes |
| status | VARCHAR | active/completed/void |

#### `staff_activity_log`
Audit trail for staff actions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| staff_profile_id | UUID | FK to staff_profiles.id |
| organization_id | UUID | FK to organizations.id |
| action_type | VARCHAR | Type of action |
| action_description | TEXT | Description |
| entity_type | VARCHAR | Entity affected |
| entity_id | UUID | Entity ID |
| ip_address | INET | IP address |
| user_agent | TEXT | Browser info |
| metadata | JSONB | Additional data |
| created_at | TIMESTAMPTZ | Timestamp |

## RLS Policies

### staff_profiles
- Platform admins: Full access to all
- Org admins: Full access within their org
- Org members: View access within their org
- Users: View their own profile

### staff_time_entries
- Platform admins: Full access
- Org admins: Full access within org
- Staff: Manage their own entries

### staff_activity_log
- Platform admins: View all
- Org admins: View within org

## Helper Functions

### `get_staff_stats(p_organization_id UUID)`
Returns staff statistics including:
- Total staff count
- Active staff count
- By role breakdown
- By department breakdown
- Average hours this month

### `get_staff_members(p_organization_id UUID)`
Returns full staff list with joined user data.

## Key Types

```typescript
interface StaffMember {
  id: string;
  userId: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: StaffRole;
  isActive: boolean;
  department?: string;
  jobTitle?: string;
  phone?: string;
  hireDate?: string;
  employeeId?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  assignedActivities: string[];
  assignedVenues: string[];
  skills: string[];
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

type StaffRole = 'super-admin' | 'org-admin' | 'admin' | 'manager' | 'staff';

interface StaffStats {
  total: number;
  active: number;
  byRole: Record<string, number>;
  byDepartment: Record<string, number>;
  avgHoursThisMonth: number;
}

interface StaffFilters {
  search: string;
  role: 'all' | StaffRole;
  status: 'all' | 'active' | 'inactive';
  department?: string;
}
```

## Hook Usage

```typescript
import { useStaff } from '@/modules/staff';

const {
  staff,
  stats,
  departments,
  loading,
  error,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleStatus,
  refreshStaff,
  refreshStats,
  filters,
  setFilters,
  clearFilters,
} = useStaff({ organizationId });
```

## Service Usage

```typescript
import { staffService } from '@/modules/staff';

// List staff
const staffList = await staffService.list({ 
  organizationId,
  filters: { role: 'manager', status: 'active' }
});

// Get single staff
const staff = await staffService.getById(staffId);

// Create staff (requires Edge Function)
const newStaff = await staffService.create(formData, organizationId, password);

// Update profile
await staffService.updateProfile(staffId, { department: 'Operations' });

// Toggle status
await staffService.toggleStatus(userId, true);

// Get stats
const stats = await staffService.getStats(organizationId);
```

## Components

### StaffStatsCards
Displays staff statistics in a 4-card grid:
- Total Staff
- Active
- Managers
- Staff Members

### StaffFilters
Search and filter controls:
- Text search (name/email)
- Role filter
- Status filter (active/inactive)
- Export button

### StaffTable
Responsive table with:
- Mobile card view
- Desktop table view
- Status toggle switch
- Action dropdown (view/edit/delete)

### AddStaffDialog
Form for creating new staff:
- Name, email, password
- Role selection
- Department selection
- Job title, hire date
- Creates auth user via Edge Function

### ViewStaffDialog
Read-only details view:
- Profile info
- Contact info
- Work info
- Skills
- Emergency contact

### DeleteStaffDialog
Confirmation dialog for deactivation (soft delete).

## Route

- **Route**: `case 'staff'` in App.tsx
- **Nav**: Sidebar.tsx under "Team"

## Real-Time Updates

The hook subscribes to `postgres_changes` on:
- `staff_profiles` table
- `users` table

Updates are debounced at 500ms.

## Multi-Tenant Support

- All queries filter by `organization_id`
- System admins can access all organizations
- RLS policies enforce tenant isolation
- Helper functions use `SECURITY DEFINER`

## Edge Function Required

Creating staff requires an Edge Function `create-staff-member` that:
1. Creates Supabase Auth user
2. Creates user profile in `users` table
3. Creates staff profile in `staff_profiles` table
4. Adds to `organization_members` table

## Migration

Apply the migration:
```bash
supabase db push
```

Or manually:
```sql
-- Run 079_staff_module_schema.sql
```

---

**Version**: 1.0.0  
**Date**: December 4, 2025  
**Author**: BookingTMS Team
