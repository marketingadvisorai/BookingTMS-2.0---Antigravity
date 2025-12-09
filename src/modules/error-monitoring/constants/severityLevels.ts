/**
 * Severity Levels - Severity definitions and configuration
 * @module error-monitoring/constants/severityLevels
 */

import type { Severity } from '../types';

export interface SeverityLevel {
  level: Severity;
  label: string;
  description: string;
  responseTime: string;
  color: string;
  bgColor: string;
  priority: number;
}

export const SEVERITY_LEVELS: Record<Severity, SeverityLevel> = {
  critical: {
    level: 'critical',
    label: 'Critical',
    description: 'System down, data loss risk',
    responseTime: '< 15 min',
    color: '#dc2626',
    bgColor: '#fef2f2',
    priority: 5,
  },
  error: {
    level: 'error',
    label: 'Error',
    description: 'Feature broken, blocking users',
    responseTime: '< 1 hour',
    color: '#f97316',
    bgColor: '#fff7ed',
    priority: 4,
  },
  warning: {
    level: 'warning',
    label: 'Warning',
    description: 'Degraded, workaround exists',
    responseTime: '< 4 hours',
    color: '#eab308',
    bgColor: '#fefce8',
    priority: 3,
  },
  info: {
    level: 'info',
    label: 'Info',
    description: 'Minor issue, cosmetic',
    responseTime: '< 24 hours',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    priority: 2,
  },
  debug: {
    level: 'debug',
    label: 'Debug',
    description: 'Development only',
    responseTime: 'N/A',
    color: '#6b7280',
    bgColor: '#f9fafb',
    priority: 1,
  },
};

// Get severity from error
export function getSeverityFromError(error: Error): Severity {
  const message = error.message.toLowerCase();
  
  if (message.includes('critical') || message.includes('fatal')) {
    return 'critical';
  }
  if (message.includes('crash') || message.includes('failure')) {
    return 'critical';
  }
  if (error.name === 'TypeError' || error.name === 'ReferenceError') {
    return 'error';
  }
  if (message.includes('warning') || message.includes('deprecated')) {
    return 'warning';
  }
  return 'error';
}

// Compare severities
export function compareSeverity(a: Severity, b: Severity): number {
  return SEVERITY_LEVELS[b].priority - SEVERITY_LEVELS[a].priority;
}

// Is severity critical or higher
export function isCriticalSeverity(severity: Severity): boolean {
  return severity === 'critical';
}
