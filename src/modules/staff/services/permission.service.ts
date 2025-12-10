/**
 * Staff Permission Service
 * Role-based permission checking
 * @module staff/services/permission
 */

import { supabase } from '@/lib/supabase/client';
import { StaffRole, getRoleLevel, getAssignableRoles, canAssignRole } from '../constants/roles';
import { getPermissions, RolePermissions, hasPermission } from '../constants/permissions';

class PermissionService {
  /**
   * Get all permissions for a role
   */
  getPermissions(role: StaffRole): RolePermissions {
    return getPermissions(role);
  }

  /**
   * Check if a role has a specific permission
   */
  hasPermission(role: StaffRole, permission: keyof RolePermissions): boolean {
    return hasPermission(role, permission);
  }

  /**
   * Get roles that a user can assign to new staff
   */
  getAssignableRoles(userRole: StaffRole): StaffRole[] {
    return getAssignableRoles(userRole);
  }

  /**
   * Check if user can assign a specific role
   */
  canAssignRole(userRole: StaffRole, targetRole: StaffRole): boolean {
    return canAssignRole(userRole, targetRole);
  }

  /**
   * Check if user can create staff members
   */
  canCreateStaff(userRole: StaffRole): boolean {
    return getPermissions(userRole).canCreateStaff;
  }

  /**
   * Check if user can delete staff members
   */
  canDeleteStaff(userRole: StaffRole): boolean {
    return getPermissions(userRole).canDeleteStaff;
  }

  /**
   * Check if user can manage schedules
   */
  canManageSchedules(userRole: StaffRole): boolean {
    return getPermissions(userRole).canManageSchedules;
  }

  /**
   * Check if user can manage staff assignments
   */
  canManageAssignments(userRole: StaffRole): boolean {
    return getPermissions(userRole).canManageAssignments;
  }

  /**
   * Server-side permission check using Supabase RPC
   */
  async canCreateStaffServer(userId: string, targetRole: StaffRole): Promise<boolean> {
    const { data, error } = await (supabase.rpc as any)('can_create_staff', {
      p_user_id: userId,
      p_target_role: targetRole,
    });

    if (error) {
      console.error('Permission check error:', error);
      return false;
    }

    return data === true;
  }

  /**
   * Get role hierarchy level
   */
  getRoleLevel(role: StaffRole): number {
    return getRoleLevel(role);
  }

  /**
   * Check if user role is higher than target role
   */
  isHigherRole(userRole: StaffRole, targetRole: StaffRole): boolean {
    return getRoleLevel(userRole) < getRoleLevel(targetRole);
  }

  /**
   * Get filtered role list based on user permissions
   */
  getFilteredRoleOptions(userRole: StaffRole, includeOwn: boolean = false): StaffRole[] {
    const assignable = this.getAssignableRoles(userRole);
    if (includeOwn) {
      return [userRole, ...assignable];
    }
    return assignable;
  }
}

export const permissionService = new PermissionService();
