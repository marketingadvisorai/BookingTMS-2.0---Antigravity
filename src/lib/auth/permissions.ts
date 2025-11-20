/**
 * Permission Configuration and Utilities
 * Central definition of all roles and their permissions
 */

import { RoleConfig, Permission, RoutePermission } from '../../types/auth';

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * System Admin - Platform owner with full control over all owners, venues, plans, and features
 */
const SYSTEM_ADMIN_PERMISSIONS: Permission[] = [
  'system.view',
  'system.manage',
  'owners.view',
  'owners.create',
  'owners.edit',
  'owners.delete',
  'venues.view',
  'venues.manage',
  'plans.view',
  'plans.edit',
  'features.view',
  'features.toggle',
  'billing.view',
  'billing.manage',
  'platform.analytics',
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
  'widgets.calendar.view',
  'widgets.calendar.edit',
  'widgets.calendar.create',
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
  'staff.create',
  'staff.delete',
  'waivers.view',
  'waivers.edit',
  'waivers.create',
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
 * Super Admin - Full system access (organization owner)
 */
const SUPER_ADMIN_PERMISSIONS: Permission[] = [
  'dashboard.view',
  'dashboard.stats',
  'bookings.view',
  'bookings.create',
  'bookings.edit',
  'bookings.delete',
  'bookings.export',
  'venues.view',
  'venues.create',
  'venues.edit',
  'venues.delete',
  'venues.configure',
  'games.view',
  'games.create',
  'games.edit',
  'games.delete',
  'widgets.view',
  'widgets.edit',
  'widgets.create',
  'widgets.delete',
  'widgets.calendar.view',
  'widgets.calendar.edit',
  'widgets.calendar.create',
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
  'staff.create',
  'staff.delete',
  'waivers.view',
  'waivers.edit',
  'waivers.create',
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
  'venues.view',
  'venues.create',
  'venues.edit',
  'venues.delete',
  'venues.configure',
  'games.view',
  'games.create',
  'games.edit',
  'games.delete',
  'widgets.view',
  'widgets.edit',
  'widgets.create',
  'widgets.delete',
  'widgets.calendar.view',
  'widgets.calendar.edit',
  'widgets.calendar.create',
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
  'staff.create',
  'staff.delete',
  'waivers.view',
  'waivers.edit',
  'waivers.create',
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

/**
 * Customer - End user with minimal permissions
 */
const CUSTOMER_PERMISSIONS: Permission[] = [
  'bookings.view',
  'payments.view',
];

/**
 * Beta Owner - MVP Testing Role for Escape Room Owner
 * Full access to core features for 3 venue management
 * Limited to Calendar widgets only, no staff management
 * AI Agents: view status only (no settings)
 */
const BETA_OWNER_PERMISSIONS: Permission[] = [
  // Dashboard
  'dashboard.view',
  'dashboard.stats',
  
  // Bookings - Full access
  'bookings.view',
  'bookings.create',
  'bookings.edit',
  'bookings.delete',
  'bookings.export',
  
  // Venues - CRITICAL for multi-venue management
  'venues.view',
  'venues.create',
  'venues.edit',
  'venues.delete',
  'venues.configure',
  
  // Games/Events - Manage escape room experiences
  'games.view',
  'games.create',
  'games.edit',
  'games.delete',
  
  // Booking Widgets - LIMITED to Calendar widgets only
  'widgets.view',
  'widgets.calendar.view',
  'widgets.calendar.edit',
  'widgets.calendar.create',
  
  // Customers - Customer management
  'customers.view',
  'customers.create',
  'customers.edit',
  'customers.export',
  
  // Waivers - CRITICAL for liability (escape rooms)
  'waivers.view',
  'waivers.edit',
  'waivers.create',
  
  // Reports - Business insights
  'reports.view',
  'reports.export',
  
  // Payments - Financial tracking
  'payments.view',
  'payments.export',
  
  // AI Agents - View status only (NO settings access)
  'ai-agents.view',
  
  // Settings - Basic configuration
  'settings.view',
  'settings.edit',
];

// ============================================================================
// ROLE CONFIGURATIONS
// ============================================================================

export const ROLES: RoleConfig[] = [
  {
    id: 'system-admin',
    name: 'System Admin',
    description: 'Platform owner with full control over all organizations, owners, venues, and features',
    permissions: SYSTEM_ADMIN_PERMISSIONS,
    color: '#dc2626', // Bright Red
    icon: 'Crown',
  },
  {
    id: 'super-admin',
    name: 'Super Admin',
    description: 'Organization owner with full access to their venues and settings',
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
    id: 'beta-owner',
    name: 'Beta Owner',
    description: 'MVP Testing - Escape room owner with calendar widgets only, no staff access',
    permissions: BETA_OWNER_PERMISSIONS,
    color: '#f59e0b', // Amber/Orange
    icon: 'Building2',
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
  {
    id: 'customer',
    name: 'Customer',
    description: 'End user with booking and payment view access',
    permissions: CUSTOMER_PERMISSIONS,
    color: '#94a3b8', // Light Gray
    icon: 'User',
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
  
  // System Admin Dashboard (System Admin only)
  { 
    path: '/system-admin', 
    requiredPermissions: ['system.view'],
    requiredRole: ['system-admin'],
    redirectTo: '/dashboard'
  },
  
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
