/**
 * Permission Configuration and Utilities
 * Central definition of all roles and their permissions
 */

import { RoleConfig, Permission, RoutePermission } from '../../types/auth';

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * Super Admin - Full system access
 */
const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'dashboard.stats',
  'bookings.view',
  'bookings.create',
  'bookings.edit',
  'bookings.delete',
  'bookings.export',
  'games.view',
  'games.create',
  'games.edit',
  'games.delete',
  'widgets.view',
  'widgets.edit',
  'widgets.create',
  'widgets.delete',
  'customers.view',
  'customers.create',
  'customers.edit',
  'customers.delete',
  'customers.export',
  'marketing.view',
  'marketing.edit',
  'campaigns.view',
  'campaigns.edit',
  'ai-agents.view',
  'ai-agents.edit',
  'reports.view',
  'reports.export',
  'staff.view',
  'staff.edit',
  'waivers.view',
  'waivers.edit',
  'media.view',
  'media.upload',
  'media.delete',
  'settings.view',
  'settings.edit',
  'accounts.view',
  'accounts.manage',
  'accounts.roles',
  'payments.view',
  'payments.refund',
  'payments.export',
  'payments.reconcile',
];

/**
 * Admin - Full operational access (no user management)
 */
const ADMIN_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'dashboard.stats',
  'bookings.view',
  'bookings.create',
  'bookings.edit',
  'bookings.delete',
  'bookings.export',
  'games.view',
  'games.create',
  'games.edit',
  'games.delete',
  'widgets.view',
  'widgets.edit',
  'widgets.create',
  'widgets.delete',
  'customers.view',
  'customers.create',
  'customers.edit',
  'customers.delete',
  'customers.export',
  'marketing.view',
  'marketing.edit',
  'campaigns.view',
  'campaigns.edit',
  'ai-agents.view',
  'ai-agents.edit',
  'reports.view',
  'reports.export',
  'staff.view',
  'staff.edit',
  'waivers.view',
  'waivers.edit',
  'media.view',
  'media.upload',
  'media.delete',
  'settings.view',
  'payments.view',
  'payments.refund',
  'payments.export',
  'payments.reconcile',
];

/**
 * Manager - View and limited edit access
 */
const MANAGER_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'bookings.view',
  'bookings.create',
  'bookings.export',
  'games.view',
  'games.create',
  'games.edit',
  'games.delete',
  'customers.view',
  'customers.edit',
  'customers.export',
  'reports.view',
  'reports.export',
  'waivers.view',
  'media.view',
  'staff.view',
  'payments.view',
  'payments.export',
  'payments.refund',
  'payments.reconcile',
];

/**
 * Staff - Basic view access
 */
const STAFF_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'bookings.view',
  'games.view',
  'customers.view',
  'waivers.view',
];

// ============================================================================
// ROLE CONFIGURATIONS
// ============================================================================

export const ROLES: RoleConfig[] = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    description: 'Full system access including user management and account settings',
    permissions: SUPER_ADMIN_PERMISSIONS,
    color: '#ef4444', // Red
    icon: 'Shield',
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full operational access to bookings, events, widgets, and all features',
    permissions: ADMIN_PERMISSIONS,
    color: '#4f46e5', // Vibrant Blue
    icon: 'UserCog',
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'View and manage bookings, events, and rooms',
    permissions: MANAGER_PERMISSIONS,
    color: '#10b981', // Green
    icon: 'Users',
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Basic view access for operational tasks',
    permissions: STAFF_PERMISSIONS,
    color: '#6b7280', // Gray
    icon: 'Briefcase',
  },
];

// ============================================================================
// ROUTE PERMISSIONS
// ============================================================================

/**
 * Define which routes require which permissions
 */
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Dashboard
  { path: '/dashboard', requiredPermissions: ['dashboard.view'] },
  
  // Bookings
  { path: '/bookings', requiredPermissions: ['bookings.view'] },
  
  // Games/Events
  { path: '/games', requiredPermissions: ['games.view'] },
  
  // Booking Widgets
  { path: '/booking-widgets', requiredPermissions: ['widgets.view'] },
  
  // Marketing
  { path: '/marketing', requiredPermissions: ['marketing.view'] },
  
  // Campaigns
  { path: '/campaigns', requiredPermissions: ['campaigns.view'] },
  
  // Customers
  { path: '/customers', requiredPermissions: ['customers.view'] },
  
  // AI Agents
  { path: '/ai-agents', requiredPermissions: ['ai-agents.view'] },
  
  // Reports
  { path: '/reports', requiredPermissions: ['reports.view'] },
  
  // Staff/Team
  { path: '/staff', requiredPermissions: ['staff.view'] },
  { path: '/team', requiredPermissions: ['staff.view'] },
  
  // Waivers
  { path: '/waivers', requiredPermissions: ['waivers.view'] },
  
  // Media
  { path: '/media', requiredPermissions: ['media.view'] },
  
  // Settings
  { path: '/settings', requiredPermissions: ['settings.view'] },
  
  // Payments
  { path: '/payment-history', requiredPermissions: ['payments.view'] },
  
  // Account Settings (Super Admin only)
  { 
    path: '/account-settings', 
    requiredPermissions: ['accounts.view'],
    requiredRole: ['super-admin'],
    redirectTo: '/dashboard'
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get role configuration by role ID
 */
export function getRoleConfig(roleId: string): RoleConfig | undefined {
  return ROLES.find(role => role.id === roleId);
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(roleId: string): Permission[] {
  const role = getRoleConfig(roleId);
  return role?.permissions || [];
}

/**
 * Check if a role has a specific permission
 */
export function roleHasPermission(roleId: string, permission: Permission): boolean {
  const permissions = getRolePermissions(roleId);
  return permissions.includes(permission);
}

/**
 * Get route permission config
 */
export function getRoutePermission(path: string): RoutePermission | undefined {
  return ROUTE_PERMISSIONS.find(route => route.path === path);
}

/**
 * Check if permissions array includes a specific permission
 */
export function hasPermission(permissions: Permission[], permission: Permission): boolean {
  return permissions.includes(permission);
}

/**
 * Check if permissions array includes any of the specified permissions
 */
export function hasAnyPermission(permissions: Permission[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some(permission => permissions.includes(permission));
}

/**
 * Check if permissions array includes all of the specified permissions
 */
export function hasAllPermissions(permissions: Permission[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(permission => permissions.includes(permission));
}
