# BookingTMS Authentication & Authorization System

## 📋 Overview

This directory contains the Role-Based Access Control (RBAC) system for BookingTMS. It provides a comprehensive permission and role management system with type safety and easy extensibility.

## 🏗️ Architecture

```
/lib/auth/
├── AuthContext.tsx          # Main authentication context and provider
├── permissions.ts           # Role and permission definitions
└── README.md               # This file

/types/
└── auth.ts                 # TypeScript types and interfaces

/components/auth/
└── PermissionGuard.tsx     # Component for permission-based rendering

/pages/
└── AccountSettings.tsx     # User management UI (Super Admin only)
```

## 🔐 User Roles

### Super Admin
- **Full system access** including user management
- Can create, edit, and delete users
- Access to Account Settings page
- All permissions granted

### Admin
- **Full operational access** to all features
- Bookings: Full CRUD operations
- Events/Games: Full CRUD operations
- Booking Widgets: Full CRUD operations
- Marketing, Campaigns, AI Agents: Full access
- Reports, Staff, Waivers, Media, Settings: Full access
- **Cannot** manage users or roles

### Manager
- **View and limited edit** access
- Bookings: View and create
- Events/Games: View only
- Reports: View only
- Waivers, Media, Staff: View only
- **Cannot** access widgets, marketing, campaigns, AI agents

### Staff
- **Basic view access** only
- Dashboard: View
- Bookings: View only
- Events/Games: View only
- Waivers: View only
- **Cannot** edit or create anything

## 🎯 Usage Examples

### 1. Using AuthContext in a Component

```tsx
import { useAuth } from '@/lib/auth/AuthContext';

function MyComponent() {
  const { currentUser, hasPermission, isRole } = useAuth();

  // Check single permission
  const canEdit = hasPermission('bookings.edit');

  // Check role
  const isSuperAdmin = isRole('super-admin');

  // Check if user can access a route
  const canAccessWidgets = canAccessRoute('/booking-widgets');

  return (
    <div>
      {canEdit && <button>Edit Booking</button>}
      {isSuperAdmin && <button>Manage Users</button>}
    </div>
  );
}
```

### 2. Using Permission Guards

```tsx
import { PermissionGuard } from '@/components/auth/PermissionGuard';

function BookingsPage() {
  return (
    <div>
      {/* Show only to users with bookings.view permission */}
      <PermissionGuard permissions={['bookings.view']}>
        <BookingsList />
      </PermissionGuard>

      {/* Show only to admins and super-admins */}
      <PermissionGuard role={['admin', 'super-admin']}>
        <DeleteButton />
      </PermissionGuard>

      {/* Show only if user has ANY of these permissions */}
      <PermissionGuard anyPermissions={['bookings.edit', 'bookings.delete']}>
        <EditControls />
      </PermissionGuard>
    </div>
  );
}
```

### 3. Using Permission Hooks

```tsx
import { usePermission, useRole } from '@/lib/auth/AuthContext';

function Toolbar() {
  const canEdit = usePermission('bookings.edit');
  const canDelete = usePermission('bookings.delete');
  const isAdmin = useRole('admin');

  return (
    <div className="flex gap-2">
      {canEdit && <button>Edit</button>}
      {canDelete && <button>Delete</button>}
      {isAdmin && <button>Advanced Settings</button>}
    </div>
  );
}
```

### 4. Conditional Sidebar Menu Items

```tsx
import { useAuth } from '@/lib/auth/AuthContext';

function Sidebar() {
  const { hasPermission } = useAuth();

  const navItems = [
    { id: 'dashboard', permission: 'dashboard.view' },
    { id: 'bookings', permission: 'bookings.view' },
    { id: 'widgets', permission: 'widgets.view' },
  ];

  const visibleItems = navItems.filter(item => hasPermission(item.permission));

  return (
    <nav>
      {visibleItems.map(item => (
        <NavItem key={item.id} {...item} />
      ))}
    </nav>
  );
}
```

## 📝 Permission Types

All available permissions are defined in `/types/auth.ts`:

### Dashboard
- `dashboard.view` - View dashboard
- `dashboard.stats` - View statistics

### Bookings
- `bookings.view` - View bookings
- `bookings.create` - Create new bookings
- `bookings.edit` - Edit bookings
- `bookings.delete` - Delete bookings

### Events/Games
- `games.view` - View games
- `games.create` - Create games
- `games.edit` - Edit games
- `games.delete` - Delete games

### Booking Widgets
- `widgets.view` - View widgets
- `widgets.edit` - Edit widgets
- `widgets.create` - Create widgets
- `widgets.delete` - Delete widgets

### Marketing & Campaigns
- `marketing.view` / `marketing.edit`
- `campaigns.view` / `campaigns.edit`

### AI Agents
- `ai-agents.view` / `ai-agents.edit`

### Reports
- `reports.view` - View reports
- `reports.export` - Export reports

### Staff/Team
- `staff.view` - View staff
- `staff.edit` - Manage staff

### Waivers
- `waivers.view` / `waivers.edit`

### Media
- `media.view` - View media
- `media.upload` - Upload media
- `media.delete` - Delete media

### Settings
- `settings.view` / `settings.edit`

### Account Management (Super Admin Only)
- `accounts.view` - View user accounts
- `accounts.manage` - Manage users
- `accounts.roles` - Manage roles

## 🔧 Extending the System

### Adding a New Permission

1. **Add to type definition** (`/types/auth.ts`):
```typescript
export type Permission =
  | 'existing.permissions'
  | 'new-feature.view'     // Add your new permission
  | 'new-feature.edit';
```

2. **Add to role configuration** (`/lib/auth/permissions.ts`):
```typescript
const ADMIN_PERMISSIONS: Permission[] = [
  // ... existing permissions
  'new-feature.view',
  'new-feature.edit',
];
```

3. **Add route protection** (optional):
```typescript
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // ... existing routes
  { path: '/new-feature', requiredPermissions: ['new-feature.view'] },
];
```

### Adding a New Role

1. **Add to type definition** (`/types/auth.ts`):
```typescript
export type UserRole = 'super-admin' | 'admin' | 'manager' | 'staff' | 'new-role';
```

2. **Define permissions** (`/lib/auth/permissions.ts`):
```typescript
const NEW_ROLE_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'bookings.view',
  // ... other permissions
];
```

3. **Add to ROLES array**:
```typescript
export const ROLES: RoleConfig[] = [
  // ... existing roles
  {
    id: 'new-role',
    name: 'New Role',
    description: 'Description of the new role',
    permissions: NEW_ROLE_PERMISSIONS,
    color: '#10b981',
    icon: 'Users',
  },
];
```

## 🧪 Testing

### Test Permission Checks
```typescript
import { hasPermission, hasAllPermissions, hasAnyPermission } from '@/lib/auth/permissions';

const userPermissions = ['bookings.view', 'bookings.edit'];

// Single permission
const canView = hasPermission(userPermissions, 'bookings.view'); // true

// All permissions
const canManage = hasAllPermissions(userPermissions, [
  'bookings.view',
  'bookings.edit'
]); // true

// Any permission
const canDoSomething = hasAnyPermission(userPermissions, [
  'bookings.delete',
  'bookings.edit'
]); // true (has edit)
```

## 🔄 User Switching (Development)

The system stores the current user ID in localStorage. To switch users:

```javascript
// In browser console
localStorage.setItem('currentUserId', '1'); // Super Admin
localStorage.setItem('currentUserId', '2'); // Admin
localStorage.setItem('currentUserId', '3'); // Manager
window.location.reload();
```

## 📊 Current Users (Mock Data)

| ID | Email | Name | Role | Status |
|----|-------|------|------|--------|
| 1 | superadmin@bookingtms.com | Super Admin | super-admin | active |
| 2 | admin@bookingtms.com | John Admin | admin | active |
| 3 | manager@bookingtms.com | Sarah Manager | manager | active |

## 🚀 Production Considerations

### Replace Mock Data with Real API

1. **Update AuthContext.tsx**:
```typescript
const createUser = async (payload: CreateUserPayload): Promise<User> => {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
};
```

2. **Add Authentication**:
```typescript
useEffect(() => {
  const verifySession = async () => {
    const response = await fetch('/api/auth/session');
    const { user } = await response.json();
    setCurrentUser(user);
  };
  verifySession();
}, []);
```

3. **Implement Logout**:
```typescript
const logout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  setCurrentUser(null);
  localStorage.removeItem('currentUserId');
};
```

## 🔒 Security Best Practices

1. **Server-side validation**: Always validate permissions on the backend
2. **JWT tokens**: Use secure tokens for authentication
3. **Role verification**: Verify roles on every API request
4. **Audit logging**: Log permission changes and user actions
5. **Password policies**: Implement strong password requirements
6. **2FA**: Consider two-factor authentication for admins

## 📚 Additional Resources

- [React Context Documentation](https://react.dev/reference/react/useContext)
- [TypeScript Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [RBAC Best Practices](https://en.wikipedia.org/wiki/Role-based_access_control)

---

**Last Updated**: November 3, 2025  
**Version**: 1.0.0  
**Maintained By**: BookingTMS Development Team
