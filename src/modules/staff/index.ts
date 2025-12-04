/**
 * Staff Module
 * Enterprise-grade staff management system
 * 
 * @module staff
 * @version 1.0.0
 * 
 * @example
 * ```typescript
 * import { useStaff, StaffPage, staffService } from '@/modules/staff';
 * 
 * // Use the hook
 * const { staff, stats, createStaff } = useStaff();
 * 
 * // Or use services directly
 * const staffList = await staffService.list({ organizationId });
 * ```
 */

// Types
export * from './types';

// Utils
export * from './utils/mappers';

// Services
export { staffService } from './services';
export type { ListStaffOptions } from './services';

// Hooks
export { useStaff } from './hooks/useStaff';
export type { UseStaffOptions, UseStaffReturn } from './hooks/useStaff';

// Components
export {
  StaffStatsCards,
  StaffFilters,
  StaffTable,
  AddStaffDialog,
  ViewStaffDialog,
  DeleteStaffDialog,
} from './components';

// Pages
export { StaffPage } from './pages/StaffPage';
