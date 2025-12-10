/**
 * Staff Module v2.0
 * Enterprise-grade staff management system with scheduling and assignments
 * 
 * @module staff
 * @version 2.0.0
 * 
 * @example
 * ```typescript
 * import { useStaff, useStaffAssignments, useStaffPermissions } from '@/modules/staff';
 * 
 * // Staff management
 * const { staff, stats, createStaff } = useStaff();
 * 
 * // Assignment management
 * const { assignments, createAssignment } = useStaffAssignments({ staffProfileId });
 * 
 * // Permission checking
 * const { canCreateStaff, getAssignableRoles } = useStaffPermissions();
 * ```
 */

// Constants
export * from './constants';

// Types
export * from './types';

// Utils
export * from './utils/mappers';

// Services
export {
  staffService,
  assignmentService,
  scheduleService,
  availabilityService,
  permissionService,
} from './services';
export type { ListStaffOptions } from './services';

// Hooks
export { useStaff } from './hooks/useStaff';
export type { UseStaffOptions, UseStaffReturn } from './hooks/useStaff';

export { useStaffCached } from './hooks/useStaffCached';
export type { UseStaffCachedOptions } from './hooks/useStaffCached';

export { useStaffAssignments } from './hooks/useStaffAssignments';
export type { UseStaffAssignmentsOptions, UseStaffAssignmentsReturn } from './hooks/useStaffAssignments';

export { useStaffPermissions } from './hooks/useStaffPermissions';
export type { UseStaffPermissionsReturn } from './hooks/useStaffPermissions';

// Components
export {
  StaffStatsCards,
  StaffFilters,
  StaffTable,
  AddStaffDialog,
  ViewStaffDialog,
  DeleteStaffDialog,
  StaffDetailPanel,
  AssignmentList,
  ActivityAssignmentDialog,
} from './components';

// Pages
export { StaffPage } from './pages/StaffPage';
