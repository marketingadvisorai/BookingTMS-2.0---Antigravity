# Customers/Guests RBAC Configuration Update

**Date**: November 3, 2025  
**Version**: 3.2.1

## Overview
Updated the Role-Based Access Control (RBAC) system to provide proper permissions for the Customers/Guests management section according to the following requirements:
- **Super Admin**: Full access to all customer management features
- **Staff**: Read-only access to customer profiles and segments

## Changes Made

### 1. Updated Staff Permissions (`/lib/auth/permissions.ts`)
Added `customers.view` permission to the Staff role, allowing read-only access to customer data.

**Before:**
```typescript
const STAFF_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'bookings.view',
  'games.view',
  'waivers.view',
];
```

**After:**
```typescript
const STAFF_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'bookings.view',
  'games.view',
  'customers.view',  // ← NEW: Read-only access to customers
  'waivers.view',
];
```

### 2. Protected Export Button (`/pages/Customers.tsx`)
Wrapped the Export button with `PermissionGuard` to ensure only users with `customers.export` permission can export customer data.

**Before:**
```tsx
<Button 
  variant="outline"
  onClick={handleExport}
  className={`h-12 ...`}
>
  <Download className="w-4 h-4 mr-2" />
  Export
</Button>
```

**After:**
```tsx
<PermissionGuard permissions={['customers.export']}>
  <Button 
    variant="outline"
    onClick={handleExport}
    className={`h-12 ...`}
  >
    <Download className="w-4 h-4 mr-2" />
    Export
  </Button>
</PermissionGuard>
```

### 3. Updated Guidelines (`/guidelines/Guidelines.md`)
Added comprehensive documentation for Customers/Guests RBAC permissions:
- Updated role descriptions to include customer management capabilities
- Added permissions table showing what each role can do
- Added implementation details section
- Updated version history to v3.2.1
- Updated "Last Updated" timestamp

## Permission Matrix

| Role | View Customers | Add Customer | Edit Customer | Delete Customer | Export Data |
|------|---------------|--------------|---------------|-----------------|-------------|
| **Super Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manager** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Staff** | ✅ | ❌ | ❌ | ❌ | ❌ |

## Permission Breakdown

### Super Admin
- `customers.view` - View customer profiles and segments
- `customers.create` - Add new customers
- `customers.edit` - Edit customer information
- `customers.delete` - Delete customer records
- `customers.export` - Export customer data

### Admin
- `customers.view` - View customer profiles and segments
- `customers.create` - Add new customers
- `customers.edit` - Edit customer information
- `customers.delete` - Delete customer records
- `customers.export` - Export customer data

### Manager
- `customers.view` - View customer profiles and segments (read-only)

### Staff
- `customers.view` - View customer profiles and segments (read-only)

## UI Elements Protected

1. **Add Customer Button** - Protected with `customers.create` permission
   - Visible only to Super Admin and Admin
   
2. **Export Button** - Protected with `customers.export` permission
   - Visible only to Super Admin and Admin
   
3. **Edit Customer Action** - Protected with `customers.edit` permission
   - Visible only to Super Admin and Admin in dropdown menu

4. **View Customer Profile** - Available to all roles with `customers.view` permission
   - All roles can view customer profiles in read-only mode

## Testing Checklist

- [x] Super Admin can view, create, edit, delete, and export customers
- [x] Admin can view, create, edit, delete, and export customers
- [x] Manager can only view customers (no add, edit, delete, or export buttons)
- [x] Staff can only view customers (no add, edit, delete, or export buttons)
- [x] Export button is hidden for Manager and Staff roles
- [x] Add Customer button is hidden for Manager and Staff roles
- [x] Edit action in dropdown is hidden for Manager and Staff roles
- [x] View action in dropdown is visible for all roles

## Files Modified

1. `/lib/auth/permissions.ts` - Added `customers.view` to Staff permissions
2. `/pages/Customers.tsx` - Added `PermissionGuard` to Export button
3. `/guidelines/Guidelines.md` - Updated RBAC documentation

## Notes

- Super Admin already had full customer permissions before this update
- Admin already had full customer permissions before this update
- Manager already had `customers.view` permission before this update
- **Staff** is the only role that received a new permission in this update
- The Customers page was already properly implementing permission checks for edit actions
- Customer segments (Marketing tab) is view-only for all roles that can access it

## Related Documentation

- Full RBAC guide: `/lib/auth/README.md`
- Permission configuration: `/lib/auth/permissions.ts`
- Type definitions: `/types/auth.ts`
- Guidelines: `/guidelines/Guidelines.md`
