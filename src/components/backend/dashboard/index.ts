/**
 * Backend Dashboard Module Exports
 * @module components/backend/dashboard
 */

export { QuickStats } from './QuickStats';
export { ConnectionsTab } from './ConnectionsTab';
export { HealthChecksTab } from './HealthChecksTab';
export { ApiTestsTab } from './ApiTestsTab';
export { EnvVarsTab } from './EnvVarsTab';
export { MonitoringTab } from './MonitoringTab';
export { LLMTab } from './LLMTab';

export { useBackendConnections } from './useBackendConnections';

export { getThemeClasses, STATUS_BADGE_CLASSES } from './types';
export type {
  ConnectionStatus,
  HealthCheck,
  ApiTestResult,
  DashboardTheme,
} from './types';
