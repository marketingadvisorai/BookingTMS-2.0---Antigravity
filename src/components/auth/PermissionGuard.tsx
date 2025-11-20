/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 */

import { ReactNode } from 'react';
import { useAuth } from '../../lib/auth/AuthContext';
import { Permission, UserRole } from '../../types/auth';

interface PermissionGuardProps {
  children: ReactNode;
  /** Require all of these permissions */
  permissions?: Permission[];
  /** Require any of these permissions */
  anyPermissions?: Permission[];
  /** Require specific role */
  role?: UserRole | UserRole[];
  /** Content to show when permission is denied */
  fallback?: ReactNode;
  /** Hide content when permission denied (default: true) */
  hide?: boolean;
}

export const PermissionGuard = ({
  children,
  permissions,
  anyPermissions,
  role,
  fallback = null,
  hide = true,
}: PermissionGuardProps) => {
  const { hasAllPermissions, hasAnyPermission, isRole, currentUser } = useAuth();

  // Check role requirement
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!currentUser || !roles.includes(currentUser.role)) {
      return hide ? <>{fallback}</> : null;
    }
  }

  // Check all permissions requirement
  if (permissions && !hasAllPermissions(permissions)) {
    return hide ? <>{fallback}</> : null;
  }

  // Check any permissions requirement
  if (anyPermissions && !hasAnyPermission(anyPermissions)) {
    return hide ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

/**
 * Hook for inline permission checks
 */
export const useCanAccess = (
  permissions?: Permission[],
  anyPermissions?: Permission[],
  role?: UserRole | UserRole[]
): boolean => {
  const { hasAllPermissions, hasAnyPermission, isRole, currentUser } = useAuth();

  // Check role
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!currentUser || !roles.includes(currentUser.role)) {
      return false;
    }
  }

  // Check permissions
  if (permissions && !hasAllPermissions(permissions)) {
    return false;
  }

  if (anyPermissions && !hasAnyPermission(anyPermissions)) {
    return false;
  }

  return true;
};
