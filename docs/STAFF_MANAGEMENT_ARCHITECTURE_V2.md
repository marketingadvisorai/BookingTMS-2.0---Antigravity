# Staff Management Architecture v2.0

## Enterprise Design Patterns (Monday.com / Asana / Slack)

### Overview
This document outlines the enhanced staff management system with:
- **Role-based staff creation permissions**
- **Activity/time slot/day assignments**
- **Dynamic scheduling system**
- **Real-time availability tracking**

---

## Entity Relationship Diagram (ERD)

```
┌─────────────────────┐          ┌─────────────────────┐
│   organizations     │          │       users         │
│─────────────────────│          │─────────────────────│
│ id (PK)             │←─────────│ id (PK)             │
│ name                │          │ email               │
│ ...                 │          │ full_name           │
└─────────────────────┘          │ role                │
         │                       │ organization_id (FK)│
         │                       │ is_active           │
         ↓                       └─────────────────────┘
┌─────────────────────┐                    │
│   staff_profiles    │←───────────────────┘
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ organization_id (FK)│
│ department          │
│ job_title           │
│ hire_date           │
│ work_schedule       │
│ hourly_rate         │
│ skills[]            │
│ permissions         │  ←── NEW: Granular permissions JSONB
│ can_create_staff    │  ←── NEW: Boolean
│ max_role_can_assign │  ←── NEW: Role hierarchy limit
└─────────────────────┘
         │
         │ 1:N
         ↓
┌──────────────────────────┐
│   staff_assignments      │  ←── NEW TABLE
│──────────────────────────│
│ id (PK)                  │
│ staff_profile_id (FK)    │
│ organization_id (FK)     │
│ assignment_type          │  ←── 'activity' | 'venue' | 'schedule'
│ activity_id (FK)         │
│ venue_id (FK)            │
│ schedule_pattern         │  ←── JSONB: days, time ranges
│ start_date               │
│ end_date                 │
│ is_primary               │
│ priority                 │
│ created_by (FK)          │
│ created_at               │
└──────────────────────────┘
         │
         ↓
┌──────────────────────────┐
│   staff_shifts           │  ←── NEW TABLE
│──────────────────────────│
│ id (PK)                  │
│ staff_profile_id (FK)    │
│ organization_id (FK)     │
│ assignment_id (FK)       │
│ shift_date               │
│ start_time               │
│ end_time                 │
│ break_minutes            │
│ status                   │  ←── 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
│ notes                    │
│ swap_requested           │
│ swap_approved_by         │
└──────────────────────────┘
         │
         ↓
┌──────────────────────────┐
│   staff_availability     │  ←── NEW TABLE
│──────────────────────────│
│ id (PK)                  │
│ staff_profile_id (FK)    │
│ day_of_week              │  ←── 0-6 (Sun-Sat)
│ start_time               │
│ end_time                 │
│ is_available             │
│ preference               │  ←── 'preferred' | 'available' | 'unavailable'
│ effective_from           │
│ effective_until          │
└──────────────────────────┘
```

---

## Role Hierarchy & Permissions

### Role Levels (Highest to Lowest)
| Level | Role | Can Create Staff | Can Assign Roles | Staff Assignment |
|-------|------|------------------|------------------|------------------|
| 1 | system-admin | ✅ All | All roles | All orgs |
| 2 | super-admin | ✅ All in org | org-admin and below | Own org |
| 3 | org-admin | ✅ Limited | admin and below | Own org |
| 4 | admin | ✅ Limited | manager, staff | Own org |
| 5 | manager | ❌ | None | View only |
| 6 | staff | ❌ | None | Self only |

### Permission Matrix
```typescript
const ROLE_PERMISSIONS = {
  'system-admin': {
    canCreateStaff: true,
    canDeleteStaff: true,
    canAssignRoles: ['system-admin', 'super-admin', 'org-admin', 'admin', 'manager', 'staff'],
    canManageSchedules: true,
    canApproveSwaps: true,
    canViewAllOrgs: true,
  },
  'super-admin': {
    canCreateStaff: true,
    canDeleteStaff: true,
    canAssignRoles: ['org-admin', 'admin', 'manager', 'staff'],
    canManageSchedules: true,
    canApproveSwaps: true,
    canViewAllOrgs: false,
  },
  'org-admin': {
    canCreateStaff: true,
    canDeleteStaff: true,
    canAssignRoles: ['admin', 'manager', 'staff'],
    canManageSchedules: true,
    canApproveSwaps: true,
    canViewAllOrgs: false,
  },
  'admin': {
    canCreateStaff: true,
    canDeleteStaff: false,
    canAssignRoles: ['manager', 'staff'],
    canManageSchedules: true,
    canApproveSwaps: false,
    canViewAllOrgs: false,
  },
  'manager': {
    canCreateStaff: false,
    canDeleteStaff: false,
    canAssignRoles: [],
    canManageSchedules: false,
    canApproveSwaps: false,
    canViewAllOrgs: false,
  },
  'staff': {
    canCreateStaff: false,
    canDeleteStaff: false,
    canAssignRoles: [],
    canManageSchedules: false,
    canApproveSwaps: false,
    canViewAllOrgs: false,
  },
};
```

---

## Module Structure (All files < 150 lines)

```
/src/modules/staff/
├── index.ts                          # Barrel export (30 lines)
├── constants/
│   ├── index.ts                      # Constants barrel (15 lines)
│   ├── roles.ts                      # Role definitions (45 lines)
│   └── permissions.ts                # Permission matrix (50 lines)
├── types/
│   ├── index.ts                      # Types barrel (20 lines)
│   ├── staff.types.ts                # Staff member types (80 lines)
│   ├── assignment.types.ts           # Assignment types (70 lines)
│   ├── schedule.types.ts             # Schedule types (60 lines)
│   └── permission.types.ts           # Permission types (50 lines)
├── utils/
│   ├── index.ts                      # Utils barrel (15 lines)
│   ├── mappers.ts                    # DB ↔ UI mappers (100 lines)
│   ├── validators.ts                 # Form validation (80 lines)
│   └── formatters.ts                 # Display formatters (70 lines)
├── services/
│   ├── index.ts                      # Services barrel (20 lines)
│   ├── staff.service.ts              # Staff CRUD (120 lines)
│   ├── assignment.service.ts         # Assignment CRUD (110 lines)
│   ├── schedule.service.ts           # Schedule management (100 lines)
│   ├── availability.service.ts       # Availability CRUD (90 lines)
│   └── permission.service.ts         # Permission checks (80 lines)
├── hooks/
│   ├── index.ts                      # Hooks barrel (15 lines)
│   ├── useStaff.ts                   # Main staff hook (120 lines)
│   ├── useStaffAssignments.ts        # Assignment hook (100 lines)
│   ├── useStaffSchedule.ts           # Schedule hook (100 lines)
│   └── useStaffPermissions.ts        # Permission hook (80 lines)
├── components/
│   ├── index.ts                      # Components barrel (25 lines)
│   ├── stats/
│   │   └── StaffStatsCards.tsx       # Stats display (75 lines)
│   ├── table/
│   │   ├── StaffTable.tsx            # Table container (100 lines)
│   │   ├── StaffTableRow.tsx         # Single row (80 lines)
│   │   └── StaffTableSkeleton.tsx    # Loading state (50 lines)
│   ├── filters/
│   │   └── StaffFilters.tsx          # Filter controls (100 lines)
│   ├── dialogs/
│   │   ├── AddStaffDialog.tsx        # Create staff (140 lines)
│   │   ├── EditStaffDialog.tsx       # Edit staff (130 lines)
│   │   ├── ViewStaffDialog.tsx       # View details (100 lines)
│   │   └── DeleteStaffDialog.tsx     # Delete confirm (65 lines)
│   ├── assignments/
│   │   ├── ActivityAssignment.tsx    # Activity picker (120 lines)
│   │   ├── ScheduleAssignment.tsx    # Schedule picker (130 lines)
│   │   └── AssignmentList.tsx        # List assignments (100 lines)
│   └── schedule/
│       ├── WeeklySchedule.tsx        # Week view (140 lines)
│       ├── ShiftCard.tsx             # Shift display (60 lines)
│       └── AvailabilityEditor.tsx    # Edit availability (120 lines)
└── pages/
    └── StaffPage.tsx                 # Main page (140 lines)
```

---

## Database Migration (089)

### New Tables
1. **staff_assignments** - Links staff to activities/venues/schedules
2. **staff_shifts** - Individual shift records
3. **staff_availability** - Staff availability preferences

### New Columns on staff_profiles
- `permissions` (JSONB) - Granular permissions
- `can_create_staff` (BOOLEAN) - Staff creation permission
- `max_role_can_assign` (VARCHAR) - Highest role they can assign

---

## API Contracts

### Staff Assignment
```typescript
// Create assignment
POST /api/staff/:staffId/assignments
Body: {
  type: 'activity' | 'venue' | 'schedule',
  activityId?: string,
  venueId?: string,
  schedulePattern?: SchedulePattern,
  startDate: string,
  endDate?: string,
  isPrimary?: boolean,
}

// List assignments
GET /api/staff/:staffId/assignments
Query: { type?, activityId?, venueId? }
```

### Staff Schedule
```typescript
// Get weekly schedule
GET /api/staff/:staffId/schedule
Query: { weekStart: string }

// Create shift
POST /api/staff/:staffId/shifts
Body: {
  assignmentId: string,
  shiftDate: string,
  startTime: string,
  endTime: string,
  breakMinutes?: number,
}
```

---

## Feature Workflows

### 1. Org Admin Creates Staff
```
1. Org Admin opens "Add Staff" dialog
2. System checks: org-admin can assign ['admin', 'manager', 'staff']
3. Role dropdown shows only allowed roles
4. On submit: Edge Function creates auth user + profile
5. Staff receives welcome email
6. Real-time update shows new staff in list
```

### 2. Staff Activity Assignment
```
1. Admin opens staff profile → "Assignments" tab
2. Clicks "Add Assignment"
3. Selects type: Activity
4. Multi-select dropdown shows org activities
5. Sets schedule pattern (days/times)
6. Saves → Creates staff_assignment record
7. Staff appears in activity schedule view
```

### 3. Staff Schedule View
```
1. Manager opens "Scheduling" view
2. Calendar shows week/month view
3. Shifts color-coded by staff
4. Click date → See all staff assigned
5. Drag-drop to reassign (if permission)
6. Conflicts auto-detected and highlighted
```

---

## Real-Time Sync

### Subscribed Tables
- `staff_profiles` - Staff changes
- `staff_assignments` - Assignment changes
- `staff_shifts` - Shift changes
- `staff_availability` - Availability updates

### Debounce Strategy
- 500ms debounce on real-time updates
- Optimistic UI updates for user actions
- Rollback on server rejection

---

## Security Considerations

1. **RLS Policies** - All tables have organization isolation
2. **Edge Function Auth** - Staff creation requires server-side auth
3. **Permission Checks** - Client + server validation
4. **Audit Logging** - All staff changes logged
5. **Role Hierarchy** - Cannot assign higher role than own

---

## Version History
- **v2.0** - Enhanced staff management with assignments (Dec 2025)
- **v1.0** - Initial staff module (Dec 2025)
