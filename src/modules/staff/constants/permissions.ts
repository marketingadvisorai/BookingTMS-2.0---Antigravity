/**
 * Staff Module - Permission Matrix
 * @module staff/constants/permissions
 */

import { StaffRole } from './roles';

export interface RolePermissions {
  canCreateStaff: boolean;
  canDeleteStaff: boolean;
  canAssignRoles: StaffRole[];
  canManageSchedules: boolean;
  canApproveSwaps: boolean;
  canViewAllOrgs: boolean;
  canManageAssignments: boolean;
  canViewReports: boolean;
}

export const ROLE_PERMISSIONS: Record<StaffRole, RolePermissions> = {
  'system-admin': {
    canCreateStaff: true,
    canDeleteStaff: true,
    canAssignRoles: ['system-admin', 'super-admin', 'org-admin', 'admin', 'manager', 'staff'],
    canManageSchedules: true,
    canApproveSwaps: true,
    canViewAllOrgs: true,
    canManageAssignments: true,
    canViewReports: true,
  },
  'super-admin': {
    canCreateStaff: true,
    canDeleteStaff: true,
    canAssignRoles: ['org-admin', 'admin', 'manager', 'staff'],
    canManageSchedules: true,
    canApproveSwaps: true,
    canViewAllOrgs: false,
    canManageAssignments: true,
    canViewReports: true,
  },
  'org-admin': {
    canCreateStaff: true,
    canDeleteStaff: true,
    canAssignRoles: ['admin', 'manager', 'staff'],
    canManageSchedules: true,
    canApproveSwaps: true,
    canViewAllOrgs: false,
    canManageAssignments: true,
    canViewReports: true,
  },
  'admin': {
    canCreateStaff: true,
    canDeleteStaff: false,
    canAssignRoles: ['manager', 'staff'],
    canManageSchedules: true,
    canApproveSwaps: false,
    canViewAllOrgs: false,
    canManageAssignments: true,
    canViewReports: false,
  },
  'manager': {
    canCreateStaff: false,
    canDeleteStaff: false,
    canAssignRoles: [],
    canManageSchedules: false,
    canApproveSwaps: false,
    canViewAllOrgs: false,
    canManageAssignments: false,
    canViewReports: false,
  },
  'staff': {
    canCreateStaff: false,
    canDeleteStaff: false,
    canAssignRoles: [],
    canManageSchedules: false,
    canApproveSwaps: false,
    canViewAllOrgs: false,
    canManageAssignments: false,
    canViewReports: false,
  },
};

export function getPermissions(role: StaffRole): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.staff;
}

export function hasPermission(role: StaffRole, permission: keyof RolePermissions): boolean {
  const perms = getPermissions(role);
  const value = perms[permission];
  return Array.isArray(value) ? value.length > 0 : !!value;
}
