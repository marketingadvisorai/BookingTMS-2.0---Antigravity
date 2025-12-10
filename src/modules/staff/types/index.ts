/**
 * Staff Module - Types Barrel Export
 * @module staff/types
 * @version 2.0.0
 */

// Re-export role types from constants
export type { StaffRole } from '../constants/roles';
export { STAFF_ROLES, DEPARTMENTS, getRoleLabel, getRoleLevel } from '../constants/roles';

// Core staff types
export * from './staff.types';

// Assignment types
export * from './assignment.types';

// Schedule and shift types
export * from './schedule.types';
