/**
 * System Admin Dashboard
 * 
 * Central export for the System Admin feature
 * 
 * Usage:
 * ```tsx
 * import { SystemAdminProvider, SystemAdminDashboard } from '@/features/system-admin';
 * ```
 */

// Context & Providers
export {
  SystemAdminProvider,
  useSystemAdmin,
  getQueryClient,
} from './context';

// Pages
export * from './pages';

// Components
export * from './components';

// Hooks
export {
  useOrganizations,
  useOrganization,
  useOrganizationMetrics,
  usePlans,
  usePlan,
  usePlanStats,
  usePlatformMetrics,
  useRevenueMetrics,
  useUsageMetrics,
  useGrowthMetrics,
} from './hooks';

// Services
export {
  OrganizationService,
  PlanService,
  MetricsService,
} from './services';

// Types
export type {
  Organization,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  OrganizationFilters,
  OrganizationSortOptions,
  OrganizationMetrics,
  OrganizationListResponse,
  Plan,
  CreatePlanDTO,
  UpdatePlanDTO,
  PlanStats,
  PlatformMetrics,
  TrendData,
  RevenueMetrics,
  UsageMetrics,
  GrowthMetrics,
  MetricsTimeRange,
  MetricsFilters,
} from './types';

// Utils
export {
  // Validators
  isValidEmail,
  isValidUrl,
  isValidPhone,
  isValidOrganizationName,
  isValidPlanName,
  isValidPrice,
  isValidPercentage,
  validateOrganization,
  validatePlan,
  hasValidationErrors,
  
  // Formatters
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatDate,
  formatRelativeTime,
  formatFileSize,
  truncate,
  formatStatus,
  getInitials,
  formatPhoneNumber,
  
  // Constants
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  ORGANIZATION_STATUSES,
  STRIPE_ONBOARDING_STATUSES,
  BILLING_PERIODS,
  METRICS_TIME_RANGES,
  STALE_TIME,
  REFETCH_INTERVAL,
  DEFAULT_APPLICATION_FEE_PERCENTAGE,
  SUPPORTED_CURRENCIES,
  DEFAULT_PLAN_LIMITS,
  ORGANIZATION_SORT_OPTIONS,
  SORT_DIRECTIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from './utils';
