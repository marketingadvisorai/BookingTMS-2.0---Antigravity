/**
 * Error Categories - Error type definitions and metadata
 * @module error-monitoring/constants/errorCategories
 */

import type { ErrorType, Severity } from '../types';

export interface ErrorCategory {
  type: ErrorType;
  label: string;
  description: string;
  defaultSeverity: Severity;
  autoCapture: boolean;
  icon: string;
  color: string;
}

export const ERROR_CATEGORIES: Record<ErrorType, ErrorCategory> = {
  javascript: {
    type: 'javascript',
    label: 'JavaScript Error',
    description: 'Unhandled exceptions in browser JavaScript',
    defaultSeverity: 'error',
    autoCapture: true,
    icon: 'Code',
    color: '#f59e0b',
  },
  network: {
    type: 'network',
    label: 'Network Error',
    description: 'Failed HTTP requests and network timeouts',
    defaultSeverity: 'warning',
    autoCapture: true,
    icon: 'Wifi',
    color: '#3b82f6',
  },
  api: {
    type: 'api',
    label: 'API Error',
    description: 'Edge Function and REST API errors',
    defaultSeverity: 'error',
    autoCapture: true,
    icon: 'Server',
    color: '#ef4444',
  },
  database: {
    type: 'database',
    label: 'Database Error',
    description: 'Supabase and PostgreSQL errors',
    defaultSeverity: 'critical',
    autoCapture: true,
    icon: 'Database',
    color: '#dc2626',
  },
  stripe: {
    type: 'stripe',
    label: 'Stripe Error',
    description: 'Payment processing failures',
    defaultSeverity: 'critical',
    autoCapture: true,
    icon: 'CreditCard',
    color: '#6366f1',
  },
  webhook: {
    type: 'webhook',
    label: 'Webhook Error',
    description: 'Webhook delivery failures',
    defaultSeverity: 'error',
    autoCapture: true,
    icon: 'Webhook',
    color: '#8b5cf6',
  },
  embed: {
    type: 'embed',
    label: 'Embed Error',
    description: 'Widget loading and rendering errors',
    defaultSeverity: 'warning',
    autoCapture: true,
    icon: 'LayoutGrid',
    color: '#10b981',
  },
  auth: {
    type: 'auth',
    label: 'Auth Error',
    description: 'Authentication and authorization failures',
    defaultSeverity: 'error',
    autoCapture: true,
    icon: 'Shield',
    color: '#f43f5e',
  },
  validation: {
    type: 'validation',
    label: 'Validation Error',
    description: 'Data validation and schema errors',
    defaultSeverity: 'info',
    autoCapture: true,
    icon: 'AlertCircle',
    color: '#eab308',
  },
  runtime: {
    type: 'runtime',
    label: 'Runtime Error',
    description: 'TypeErrors, ReferenceErrors, etc.',
    defaultSeverity: 'error',
    autoCapture: true,
    icon: 'Zap',
    color: '#f97316',
  },
  crash: {
    type: 'crash',
    label: 'App Crash',
    description: 'Application crashes and blank screens',
    defaultSeverity: 'critical',
    autoCapture: true,
    icon: 'XCircle',
    color: '#b91c1c',
  },
  unknown: {
    type: 'unknown',
    label: 'Unknown Error',
    description: 'Uncategorized errors',
    defaultSeverity: 'warning',
    autoCapture: true,
    icon: 'HelpCircle',
    color: '#6b7280',
  },
};

// Error type detection patterns
export const ERROR_TYPE_PATTERNS: Array<{ pattern: RegExp; type: ErrorType }> = [
  { pattern: /TypeError|ReferenceError|SyntaxError/i, type: 'runtime' },
  { pattern: /fetch|network|cors|timeout/i, type: 'network' },
  { pattern: /supabase|postgres|database|query/i, type: 'database' },
  { pattern: /stripe|payment|charge|card/i, type: 'stripe' },
  { pattern: /webhook|delivery/i, type: 'webhook' },
  { pattern: /embed|widget|iframe/i, type: 'embed' },
  { pattern: /auth|login|session|token/i, type: 'auth' },
  { pattern: /validation|invalid|schema/i, type: 'validation' },
  { pattern: /api|endpoint|function/i, type: 'api' },
];

// Detect error type from message
export function detectErrorType(message: string): ErrorType {
  const lowerMessage = message.toLowerCase();
  for (const { pattern, type } of ERROR_TYPE_PATTERNS) {
    if (pattern.test(lowerMessage)) {
      return type;
    }
  }
  return 'unknown';
}
