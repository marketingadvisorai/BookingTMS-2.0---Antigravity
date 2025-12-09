/**
 * Error Monitoring Module
 * Enterprise error tracking, system health monitoring, and AI-powered analysis
 * 
 * Features:
 * - Automated error capture (JS errors, API errors, network errors)
 * - System health monitoring (API, Database, Stripe, Webhooks, Embeds)
 * - User error reporting (from org owners and customers)
 * - AI-powered error analysis (Claude, GPT)
 * - Real-time dashboards and alerts
 * 
 * Usage:
 * 
 * // Initialize error capture (in App.tsx)
 * import { errorCaptureService } from '@/modules/error-monitoring';
 * errorCaptureService.initialize(userId, organizationId);
 * 
 * // Use the monitoring page
 * import { ErrorMonitoringPage } from '@/modules/error-monitoring';
 * 
 * // Use hooks for custom UI
 * import { useErrorMonitoring, useHealthStatus } from '@/modules/error-monitoring';
 * 
 * // Submit user reports
 * import { userReportsService } from '@/modules/error-monitoring';
 * await userReportsService.submitReport({ ... });
 */

// Types
export * from './types';

// Constants
export * from './constants';

// Utils
export * from './utils';

// Services
export * from './services';

// Hooks
export * from './hooks';

// Components
export * from './components';

// Pages
export * from './pages';
