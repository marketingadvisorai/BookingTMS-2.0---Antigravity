/**
 * Backend Dashboard Types
 * @module components/backend/dashboard/types
 */

export interface ConnectionStatus {
  name: string;
  status: 'connected' | 'disconnected' | 'checking' | 'error';
  message: string;
  latency?: number;
  details?: any;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime?: number;
  message: string;
  timestamp: string;
}

export interface ApiTestResult {
  name: string;
  url: string;
  method: string;
  status: 'success' | 'error' | 'mock';
  statusCode: number;
  latency: number;
  message: string;
}

export interface DashboardTheme {
  isDark: boolean;
  bgPrimary: string;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
}

export function getThemeClasses(isDark: boolean): DashboardTheme {
  return {
    isDark,
    bgPrimary: isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50',
    bgCard: isDark ? 'bg-[#161616]' : 'bg-white',
    textPrimary: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
    borderColor: isDark ? 'border-gray-800' : 'border-gray-200',
  };
}

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  connected: 'bg-green-500/10 text-green-500 border-green-500/20',
  healthy: 'bg-green-500/10 text-green-500 border-green-500/20',
  disconnected: 'bg-red-500/10 text-red-500 border-red-500/20',
  unhealthy: 'bg-red-500/10 text-red-500 border-red-500/20',
  checking: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  unknown: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  degraded: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
  mock: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  success: 'bg-green-500/10 text-green-500 border-green-500/20',
};
