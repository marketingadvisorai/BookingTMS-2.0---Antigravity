/**
 * Staff Module - Services Barrel Export
 * @module staff/services
 */

// Core staff service (facade)
export { staffService } from './staff.service';
export type { ListStaffOptions } from './staff.service';

// Modular services (for direct access if needed)
export { staffCrudService } from './staffCrud.service';
export { staffQueryService } from './staffQuery.service';

// Assignment service
export { assignmentService } from './assignment.service';

// Schedule service
export { scheduleService } from './schedule.service';

// Availability service
export { availabilityService } from './availability.service';

// Permission service
export { permissionService } from './permission.service';
