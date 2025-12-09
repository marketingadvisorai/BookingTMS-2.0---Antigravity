/**
 * Health Endpoints - Health check configuration
 * @module error-monitoring/constants/healthEndpoints
 */

import type { HealthCheckConfig, HealthCheckType } from '../types';

export const HEALTH_CHECK_CONFIGS: HealthCheckConfig[] = [
  {
    serviceName: 'api',
    checkType: 'api',
    endpoint: '/functions/v1/health',
    intervalMs: 5 * 60 * 1000, // 5 minutes
    timeoutMs: 10 * 1000,
    enabled: true,
  },
  {
    serviceName: 'database',
    checkType: 'database',
    intervalMs: 5 * 60 * 1000,
    timeoutMs: 5 * 1000,
    enabled: true,
  },
  {
    serviceName: 'stripe',
    checkType: 'stripe',
    intervalMs: 15 * 60 * 1000, // 15 minutes
    timeoutMs: 10 * 1000,
    enabled: true,
  },
  {
    serviceName: 'webhooks',
    checkType: 'webhook',
    intervalMs: 15 * 60 * 1000,
    timeoutMs: 10 * 1000,
    enabled: true,
  },
  {
    serviceName: 'embed-widgets',
    checkType: 'embed',
    intervalMs: 30 * 60 * 1000, // 30 minutes
    timeoutMs: 30 * 1000,
    enabled: true,
  },
  {
    serviceName: 'email',
    checkType: 'email',
    intervalMs: 15 * 60 * 1000,
    timeoutMs: 10 * 1000,
    enabled: true,
  },
];

// Service display info
export interface ServiceInfo {
  name: string;
  label: string;
  description: string;
  icon: string;
  checkType: HealthCheckType;
}

export const SERVICE_INFO: Record<string, ServiceInfo> = {
  api: {
    name: 'api',
    label: 'API Endpoints',
    description: 'REST API and Edge Functions',
    icon: 'Server',
    checkType: 'api',
  },
  database: {
    name: 'database',
    label: 'Database',
    description: 'Supabase PostgreSQL',
    icon: 'Database',
    checkType: 'database',
  },
  stripe: {
    name: 'stripe',
    label: 'Payment Processing',
    description: 'Stripe Connect',
    icon: 'CreditCard',
    checkType: 'stripe',
  },
  webhooks: {
    name: 'webhooks',
    label: 'Webhooks',
    description: 'Webhook Deliveries',
    icon: 'Webhook',
    checkType: 'webhook',
  },
  'embed-widgets': {
    name: 'embed-widgets',
    label: 'Booking Widgets',
    description: 'Embeddable Booking UI',
    icon: 'LayoutGrid',
    checkType: 'embed',
  },
  email: {
    name: 'email',
    label: 'Email Service',
    description: 'Transactional Emails',
    icon: 'Mail',
    checkType: 'email',
  },
};

// Status colors
export const STATUS_COLORS = {
  healthy: { bg: '#dcfce7', text: '#166534', border: '#22c55e' },
  degraded: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
  unhealthy: { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' },
  unknown: { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' },
};
