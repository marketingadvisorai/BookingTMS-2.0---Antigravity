/**
 * Staff Permissions Hook
 * Role-based permission checking for staff operations
 * @module staff/hooks/useStaffPermissions
 */

import { useMemo } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { StaffRole } from '../constants/roles';
import { permissionService } from '../services';

export interface UseStaffPermissionsReturn {
  userRole: StaffRole;
  canCreateStaff: boolean;
  canDeleteStaff: boolean;
  canManageSchedules: boolean;
  canManageAssignments: boolean;
  canApproveSwaps: boolean;
  canViewReports: boolean;
  getAssignableRoles: () => StaffRole[];
  canAssignRole: (targetRole: StaffRole) => boolean;
  isHigherRole: (targetRole: StaffRole) => boolean;
}

export function useStaffPermissions(): UseStaffPermissionsReturn {
  const { currentUser } = useAuth();
  const userRole = (currentUser?.role as StaffRole) || 'staff';

  const permissions = useMemo(() => {
    return permissionService.getPermissions(userRole);
  }, [userRole]);

  const canCreateStaff = useMemo(() => {
    return permissionService.canCreateStaff(userRole);
  }, [userRole]);

  const canDeleteStaff = useMemo(() => {
    return permissionService.canDeleteStaff(userRole);
  }, [userRole]);

  const canManageSchedules = useMemo(() => {
    return permissionService.canManageSchedules(userRole);
  }, [userRole]);

  const canManageAssignments = useMemo(() => {
    return permissionService.canManageAssignments(userRole);
  }, [userRole]);

  const getAssignableRoles = useMemo(() => {
    return () => permissionService.getAssignableRoles(userRole);
  }, [userRole]);

  const canAssignRole = useMemo(() => {
    return (targetRole: StaffRole) => permissionService.canAssignRole(userRole, targetRole);
  }, [userRole]);

  const isHigherRole = useMemo(() => {
    return (targetRole: StaffRole) => permissionService.isHigherRole(userRole, targetRole);
  }, [userRole]);

  return {
    userRole,
    canCreateStaff,
    canDeleteStaff,
    canManageSchedules,
    canManageAssignments,
    canApproveSwaps: permissions.canApproveSwaps,
    canViewReports: permissions.canViewReports,
    getAssignableRoles,
    canAssignRole,
    isHigherRole,
  };
}
