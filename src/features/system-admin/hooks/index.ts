/**
 * System Admin Hooks
 * 
 * Export all custom hooks for the system admin dashboard
 */

// Context Hook
export { useSystemAdmin } from '../context';

// Organization Hooks
export {
  useOrganizations,
  useOrganization,
  useOrganizationMetrics,
} from './useOrganizations';

// Plan Hooks
export {
  usePlans,
  usePlan,
  usePlanStats,
} from './usePlans';

// Metrics Hooks
export {
  usePlatformMetrics,
  useRevenueMetrics,
  useUsageMetrics,
  useGrowthMetrics,
} from './useMetrics';
