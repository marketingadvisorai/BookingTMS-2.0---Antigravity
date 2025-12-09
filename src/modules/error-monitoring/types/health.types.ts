/**
 * Health Types - System health monitoring type definitions
 * @module error-monitoring/types/health
 */

// Health check types
export type HealthCheckType =
  | 'api'
  | 'webhook'
  | 'database'
  | 'stripe'
  | 'embed'
  | 'email'
  | 'sms'
  | 'external';

// Health status
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

// Uptime status
export type UptimeStatus =
  | 'operational'
  | 'degraded'
  | 'partial_outage'
  | 'major_outage'
  | 'maintenance';

// Health check result
export interface HealthCheck {
  id: string;
  checkType: HealthCheckType;
  serviceName: string;
  endpoint?: string;
  status: HealthStatus;
  responseTimeMs?: number;
  statusCode?: number;
  errorMessage?: string;
  details: Record<string, unknown>;
  checkedAt: string;
}

// Database model
export interface DBHealthCheck {
  id: string;
  check_type: HealthCheckType;
  service_name: string;
  endpoint?: string;
  status: HealthStatus;
  response_time_ms?: number;
  status_code?: number;
  error_message?: string;
  details: Record<string, unknown>;
  checked_at: string;
}

// Health summary for dashboard
export interface HealthSummary {
  serviceName: string;
  currentStatus: HealthStatus;
  lastCheckTime: string;
  responseTimeMs?: number;
  uptime24h: number;
}

// System uptime record
export interface SystemUptime {
  id: string;
  serviceName: string;
  status: UptimeStatus;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  incidentId?: string;
  notes?: string;
  createdAt: string;
}

// Health check configuration
export interface HealthCheckConfig {
  serviceName: string;
  checkType: HealthCheckType;
  endpoint?: string;
  intervalMs: number;
  timeoutMs: number;
  enabled: boolean;
}

// Overall system status
export interface SystemStatus {
  overallStatus: HealthStatus;
  services: HealthSummary[];
  lastUpdated: string;
  uptime30d: number;
  incidentCount30d: number;
}
