/**
 * Staff Service - Facade
 * Re-exports from modular services for backward compatibility
 * @module staff/services/staff.service
 */

import { staffCrudService } from './staffCrud.service';
import { staffQueryService, ListStaffOptions } from './staffQuery.service';
import { StaffMember, StaffFormData, StaffUpdateData, StaffStats } from '../types';

/**
 * Unified Staff Service
 * Combines query and CRUD operations into a single interface
 */
class StaffService {
  // Query operations
  list = (options: ListStaffOptions) => staffQueryService.list(options);
  getStats = (orgId: string) => staffQueryService.getStats(orgId);
  getDepartments = (orgId: string) => staffQueryService.getDepartments(orgId);

  // CRUD operations
  getById = (id: string) => staffCrudService.getById(id);
  create = (data: StaffFormData, orgId: string, password: string) => 
    staffCrudService.create(data, orgId, password);
  updateProfile = (id: string, updates: StaffUpdateData) => 
    staffCrudService.updateProfile(id, updates);
  updateUser = (userId: string, updates: { role?: string; isActive?: boolean }) =>
    staffCrudService.updateUser(userId, updates);
  toggleStatus = (userId: string, currentlyActive: boolean) =>
    staffCrudService.toggleStatus(userId, currentlyActive);
  delete = (userId: string) => staffCrudService.delete(userId);
}

export const staffService = new StaffService();
export type { ListStaffOptions } from './staffQuery.service';
