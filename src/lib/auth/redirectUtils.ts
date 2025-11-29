/**
 * Role-Based Redirect Utility
 * 
 * Determines the correct portal/dashboard URL based on user role.
 * Supports multi-tenant architecture where each organization has
 * its own isolated admin portal.
 */

import type { UserRole } from '../../types/auth';

/**
 * Get the redirect URL based on user role
 * 
 * Multi-Tenant Architecture:
 * - system-admin / super-admin → Full System Dashboard
 * - org-admin / beta-owner → Organization-specific portal
 * - manager / staff → Limited dashboard
 * - customer → Customer portal
 */
export function getRedirectUrlForRole(role: UserRole | undefined): string {
  switch (role) {
    case 'system-admin':
    case 'super-admin':
      return '/dashboard'; // Full system dashboard
    
    case 'org-admin':
    case 'beta-owner':
    case 'admin':
      return '/dashboard'; // Org dashboard (sidebar is filtered by role)
    
    case 'manager':
    case 'staff':
      return '/bookings'; // Start at bookings view
    
    case 'customer':
      return '/my-bookings'; // Customer portal
    
    default:
      return '/dashboard';
  }
}

/**
 * Check if user should see system-level menu items
 */
export function isSystemLevelRole(role: UserRole | undefined): boolean {
  return role === 'system-admin' || role === 'super-admin';
}

/**
 * Check if user is an organization-level admin
 */
export function isOrgLevelAdmin(role: UserRole | undefined): boolean {
  return role === 'org-admin' || role === 'beta-owner' || role === 'admin';
}

/**
 * Get the sidebar menu items that should be visible for a role
 */
export function getVisibleMenuItemsForRole(role: UserRole | undefined): string[] {
  const baseItems = ['dashboard', 'bookings', 'activities', 'customers'];
  
  if (isSystemLevelRole(role)) {
    return [
      ...baseItems,
      'venues',
      'organizations',
      'booking-widgets',
      'embed-pro',
      'campaigns',
      'marketing',
      'ai-agents',
      'staff',
      'reports',
      'media',
      'waivers',
      'settings',
    ];
  }
  
  if (isOrgLevelAdmin(role)) {
    return [
      ...baseItems,
      'venues', // Only their organization's venues
      'booking-widgets',
      'embed-pro',
      'customers',
      'reports',
      'waivers',
      'settings',
    ];
  }
  
  // Staff/Manager - limited view
  return ['dashboard', 'bookings', 'customers'];
}
