/**
 * Constants
 * 
 * Application constants and configuration
 */

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100];

// Status options
export const ORGANIZATION_STATUSES = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
  { value: 'suspended', label: 'Suspended', color: 'red' },
  { value: 'pending', label: 'Pending', color: 'yellow' },
] as const;

export const STRIPE_ONBOARDING_STATUSES = [
  { value: 'not_started', label: 'Not Started', color: 'gray' },
  { value: 'incomplete', label: 'Incomplete', color: 'yellow' },
  { value: 'complete', label: 'Complete', color: 'green' },
] as const;

// Billing periods
export const BILLING_PERIODS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
] as const;

// Time ranges for metrics
export const METRICS_TIME_RANGES = [
  { value: 'day', label: 'Last 24 Hours' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last 90 Days' },
  { value: 'year', label: 'Last 12 Months' },
] as const;

// Query stale times (in milliseconds)
export const STALE_TIME = {
  SHORT: 2 * 60 * 1000, // 2 minutes
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 10 * 60 * 1000, // 10 minutes
};

// Refetch intervals
export const REFETCH_INTERVAL = {
  METRICS: 5 * 60 * 1000, // 5 minutes
  ORGANIZATIONS: 10 * 60 * 1000, // 10 minutes
  PLANS: 15 * 60 * 1000, // 15 minutes
};

// Application fee
export const DEFAULT_APPLICATION_FEE_PERCENTAGE = 0.75;

// Currencies
export const SUPPORTED_CURRENCIES = [
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
  { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
  { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' },
] as const;

// Default plan limits
export const DEFAULT_PLAN_LIMITS = {
  basic: {
    max_venues: 2,
    max_games: 10,
    max_bookings_per_month: 100,
    max_users: 5,
    max_storage_gb: 5,
    max_api_calls_per_day: 1000,
    features_enabled: ['booking_widgets', 'email_support'],
  },
  growth: {
    max_venues: 5,
    max_games: 50,
    max_bookings_per_month: 500,
    max_users: 20,
    max_storage_gb: 25,
    max_api_calls_per_day: 5000,
    features_enabled: ['booking_widgets', 'waivers', 'marketing', 'priority_support'],
  },
  pro: {
    max_venues: -1, // unlimited
    max_games: -1,
    max_bookings_per_month: -1,
    max_users: -1,
    max_storage_gb: 100,
    max_api_calls_per_day: 25000,
    features_enabled: [
      'booking_widgets',
      'waivers',
      'analytics',
      'ai_agents',
      'marketing',
      'custom_branding',
      'dedicated_support',
    ],
  },
};

// Sort options
export const ORGANIZATION_SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'created_at', label: 'Date Created' },
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'status', label: 'Status' },
] as const;

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
] as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  ORGANIZATION_CREATED: 'Organization created successfully',
  ORGANIZATION_UPDATED: 'Organization updated successfully',
  ORGANIZATION_DELETED: 'Organization deleted successfully',
  PLAN_CREATED: 'Plan created successfully',
  PLAN_UPDATED: 'Plan updated successfully',
  PLAN_DELETED: 'Plan deleted successfully',
};
