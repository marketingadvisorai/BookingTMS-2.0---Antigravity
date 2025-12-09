/**
 * Error Monitoring Module Exports
 * @module components/backend/error-monitoring
 */

export { StatsCard } from './StatsCard';
export { ErrorRow } from './ErrorRow';
export { FixApprovalRow } from './FixApprovalRow';
export { ErrorMonitoringTabRefactored as ErrorMonitoringTab } from './ErrorMonitoringTabRefactored';
export { useErrorMonitoring } from './useErrorMonitoring';

export {
  getErrorMonitoringTheme,
  getSeverityColor,
  getStatusColor,
} from './types';

export type {
  SystemError,
  FixRequest,
  ErrorStats,
  ErrorMonitoringTheme,
} from './types';
