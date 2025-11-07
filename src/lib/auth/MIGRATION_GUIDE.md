# RBAC System Migration Guide

## 🎯 Overview

This guide helps you integrate the new Role-Based Access Control (RBAC) system into existing components.

## ✅ Quick Checklist

- [ ] Wrap App with `AuthProvider`
- [ ] Import and use `useAuth` hook in components
- [ ] Add permission checks to buttons/actions
- [ ] Update sidebar with permission filtering
- [ ] Protect sensitive routes
- [ ] Test all user roles

## 📝 Step-by-Step Migration

### Step 1: Wrap Application with AuthProvider

Already done in `/App.tsx`:
```tsx
import { AuthProvider } from './lib/auth/AuthContext';

return (
  <ThemeProvider>
    <AuthProvider>  {/* ✅ Added */}
      <AdminLayout>
        {renderPage()}
      </AdminLayout>
    </AuthProvider>
  </ThemeProvider>
);
```

### Step 2: Update Sidebar Navigation

Already done in `/components/layout/Sidebar.tsx`:
```tsx
import { useAuth } from '@/lib/auth/AuthContext';

export function Sidebar() {
  const { hasPermission, isRole } = useAuth();

  // Add permissions to nav items
  const navItems = [
    { id: 'dashboard', permission: 'dashboard.view' as Permission },
    { id: 'bookings', permission: 'bookings.view' as Permission },
    // ...
  ];

  // Filter based on permissions
  const visibleNavItems = navItems.filter(item => 
    hasPermission(item.permission)
  );

  // Add Account Settings for super-admin
  if (isRole('super-admin')) {
    navItems.push({
      id: 'account-settings',
      label: 'Account Settings',
      icon: Shield,
      permission: 'accounts.view' as Permission
    });
  }

  return <nav>{/* render visibleNavItems */}</nav>;
}
```

### Step 3: Protect Page Content

#### Example: Bookings Page

```tsx
import { useAuth } from '@/lib/auth/AuthContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

function BookingsPage() {
  const { hasPermission, currentUser } = useAuth();

  const canCreate = hasPermission('bookings.create');
  const canEdit = hasPermission('bookings.edit');
  const canDelete = hasPermission('bookings.delete');

  return (
    <div>
      {/* View permission required to see page */}
      <PermissionGuard permissions={['bookings.view']}>
        <BookingsList />
      </PermissionGuard>

      {/* Create button - only for users with create permission */}
      {canCreate && (
        <Button>Create Booking</Button>
      )}

      {/* Edit/Delete - only for users with edit/delete permissions */}
      <PermissionGuard anyPermissions={['bookings.edit', 'bookings.delete']}>
        <BookingActions />
      </PermissionGuard>
    </div>
  );
}
```

### Step 4: Protect Individual Actions

#### Example: Delete Button

```tsx
import { usePermission } from '@/lib/auth/AuthContext';

function BookingRow({ booking }) {
  const canDelete = usePermission('bookings.delete');

  return (
    <tr>
      <td>{booking.name}</td>
      <td>
        {canDelete && (
          <Button onClick={() => handleDelete(booking.id)}>
            Delete
          </Button>
        )}
      </td>
    </tr>
  );
}
```

### Step 5: Protect Form Fields

#### Example: Booking Form

```tsx
import { useAuth } from '@/lib/auth/AuthContext';

function BookingForm() {
  const { hasPermission } = useAuth();
  
  const canEdit = hasPermission('bookings.edit');
  const isViewOnly = !canEdit;

  return (
    <form>
      <Input 
        disabled={isViewOnly}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
      {canEdit && (
        <Button type="submit">Save Changes</Button>
      )}
    </form>
  );
}
```

### Step 6: Add Role-Specific Features

#### Example: Admin-Only Features

```tsx
import { useRole } from '@/lib/auth/AuthContext';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

function AdvancedSettings() {
  return (
    <PermissionGuard role={['super-admin', 'admin']}>
      <div>
        <h2>Advanced Settings</h2>
        <p>Only admins can see this</p>
      </div>
    </PermissionGuard>
  );
}
```

## 🔧 Common Patterns

### Pattern 1: Conditional Rendering

```tsx
const { hasPermission } = useAuth();
const canEdit = hasPermission('bookings.edit');

return (
  <div>
    {canEdit ? (
      <EditForm />
    ) : (
      <ViewOnly />
    )}
  </div>
);
```

### Pattern 2: Multiple Permissions

```tsx
const { hasAllPermissions } = useAuth();

const canManage = hasAllPermissions([
  'bookings.edit',
  'bookings.delete'
]);

return canManage && <ManagementPanel />;
```

### Pattern 3: Any Permission

```tsx
const { hasAnyPermission } = useAuth();

const canInteract = hasAnyPermission([
  'bookings.create',
  'bookings.edit'
]);

return canInteract && <ActionButtons />;
```

### Pattern 4: Role Check

```tsx
const { isRole } = useAuth();
const isSuperAdmin = isRole('super-admin');

return isSuperAdmin && <UserManagement />;
```

### Pattern 5: Current User Info

```tsx
const { currentUser } = useAuth();

return (
  <div>
    <p>Logged in as: {currentUser?.name}</p>
    <p>Role: {currentUser?.role}</p>
    <Badge>{currentUser?.status}</Badge>
  </div>
);
```

## 📊 Page Migration Examples

### Dashboard Page

```tsx
function Dashboard() {
  const { hasPermission } = useAuth();

  return (
    <AdminLayout>
      {/* Everyone can see basic stats */}
      <KPICards />

      {/* Only users with reports permission can see detailed analytics */}
      <PermissionGuard permissions={['reports.view']}>
        <DetailedAnalytics />
      </PermissionGuard>

      {/* Only admins can see admin dashboard */}
      <PermissionGuard role={['super-admin', 'admin']}>
        <AdminDashboard />
      </PermissionGuard>
    </AdminLayout>
  );
}
```

### Games/Events Page

```tsx
function GamesPage() {
  const { hasPermission } = useAuth();
  
  const canCreate = hasPermission('games.create');
  const canEdit = hasPermission('games.edit');
  const canDelete = hasPermission('games.delete');

  return (
    <AdminLayout>
      <PageHeader 
        title="Events / Rooms"
        action={
          canCreate && (
            <Button>Add New Game</Button>
          )
        }
      />

      <GamesList
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </AdminLayout>
  );
}
```

### Widgets Page

```tsx
function WidgetsPage() {
  return (
    <PermissionGuard 
      permissions={['widgets.view']}
      fallback={<AccessDenied />}
    >
      <AdminLayout>
        <WidgetsList />
        
        <PermissionGuard permissions={['widgets.edit']}>
          <WidgetEditor />
        </PermissionGuard>
      </AdminLayout>
    </PermissionGuard>
  );
}
```

## 🚨 Common Pitfalls

### ❌ Don't: Check permissions inline

```tsx
// Bad - repetitive and hard to maintain
{currentUser?.role === 'admin' && <Button>Delete</Button>}
{currentUser?.role === 'super-admin' && <Button>Delete</Button>}
```

### ✅ Do: Use permission hooks

```tsx
// Good - clean and maintainable
const canDelete = usePermission('bookings.delete');
{canDelete && <Button>Delete</Button>}
```

### ❌ Don't: Forget server-side validation

```tsx
// Bad - only client-side check
const handleDelete = () => {
  if (hasPermission('bookings.delete')) {
    deleteBooking(); // API call has no auth check
  }
};
```

### ✅ Do: Always validate on server

```tsx
// Good - server validates permissions
const handleDelete = async () => {
  try {
    await deleteBooking(); // API validates user permissions
  } catch (error) {
    if (error.status === 403) {
      toast.error('You do not have permission to delete');
    }
  }
};
```

## 🧪 Testing Checklist

Test each role can access only their permitted features:

### Super Admin
- [ ] Can access Account Settings
- [ ] Can create/edit/delete users
- [ ] Can access all features
- [ ] Can see all menu items

### Admin
- [ ] Can access all features except Account Settings
- [ ] Can edit bookings, games, widgets
- [ ] Can manage marketing, campaigns
- [ ] Cannot see Account Settings menu item

### Manager
- [ ] Can view and create bookings
- [ ] Can view games/events
- [ ] Cannot access widgets, marketing, campaigns
- [ ] Cannot edit games
- [ ] Cannot delete anything

### Staff
- [ ] Can only view basic features
- [ ] Cannot create or edit anything
- [ ] Limited menu items visible
- [ ] Cannot access advanced features

## 📚 Next Steps

1. Review all pages and add appropriate permission checks
2. Test with different user roles
3. Add server-side validation to API routes
4. Implement audit logging for sensitive actions
5. Consider adding custom permissions for specific users

---

**Need Help?** Check `/lib/auth/README.md` for detailed documentation.
