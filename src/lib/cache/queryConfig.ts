/**
 * React Query Configuration
 * 
 * Centralized QueryClient configuration for optimal caching and performance.
 * Part of the Edge Caching Architecture v1.0.0
 * 
 * @see /docs/EDGE_CACHING_ARCHITECTURE.md
 */

import { QueryClient, QueryClientConfig } from '@tanstack/react-query';

// ============================================================================
// CACHE TIME CONSTANTS
// ============================================================================

export const CACHE_TIMES = {
  /** No caching - always fresh */
  NONE: 0,
  /** 30 seconds - rapidly changing data */
  VERY_SHORT: 30 * 1000,
  /** 1 minute - user-specific data */
  SHORT: 1 * 60 * 1000,
  /** 5 minutes - organization data */
  MEDIUM: 5 * 60 * 1000,
  /** 15 minutes - configuration data */
  LONG: 15 * 60 * 1000,
  /** 1 hour - static reference data */
  VERY_LONG: 60 * 60 * 1000,
  /** 24 hours - rarely changing data */
  DAY: 24 * 60 * 60 * 1000,
} as const;

// ============================================================================
// QUERY KEY FACTORY
// ============================================================================

/**
 * Centralized query keys to ensure consistency and easy invalidation.
 * Follow the pattern: ['domain', 'entity', ...params]
 */
export const queryKeys = {
  // Auth & User
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    profile: (userId: string) => [...queryKeys.auth.all, 'profile', userId] as const,
  },

  // Organizations
  organizations: {
    all: ['organizations'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.organizations.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.organizations.all, 'detail', id] as const,
    settings: (id: string) => [...queryKeys.organizations.all, 'settings', id] as const,
    stripeStatus: (id: string) => [...queryKeys.organizations.all, 'stripe', id] as const,
  },

  // Venues
  venues: {
    all: ['venues'] as const,
    list: (orgId?: string) => [...queryKeys.venues.all, 'list', orgId] as const,
    detail: (id: string) => [...queryKeys.venues.all, 'detail', id] as const,
    byEmbed: (embedKey: string) => [...queryKeys.venues.all, 'embed', embedKey] as const,
  },

  // Activities
  activities: {
    all: ['activities'] as const,
    list: (params?: Record<string, unknown>) => 
      [...queryKeys.activities.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.activities.all, 'detail', id] as const,
    schedule: (id: string) => [...queryKeys.activities.all, 'schedule', id] as const,
    sessions: (id: string, date?: string) => 
      [...queryKeys.activities.all, 'sessions', id, date] as const,
  },

  // Bookings
  bookings: {
    all: ['bookings'] as const,
    list: (params?: Record<string, unknown>) => 
      [...queryKeys.bookings.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.bookings.all, 'detail', id] as const,
    customer: (customerId: string) => 
      [...queryKeys.bookings.all, 'customer', customerId] as const,
  },

  // Plans & Billing
  plans: {
    all: ['plans'] as const,
    list: () => [...queryKeys.plans.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.plans.all, 'detail', id] as const,
  },

  // Staff
  staff: {
    all: ['staff'] as const,
    list: (orgId: string) => [...queryKeys.staff.all, 'list', orgId] as const,
    detail: (id: string) => [...queryKeys.staff.all, 'detail', id] as const,
  },

  // Customers
  customers: {
    all: ['customers'] as const,
    list: (params?: Record<string, unknown>) => 
      [...queryKeys.customers.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.customers.all, 'detail', id] as const,
    metrics: (orgId: string) => [...queryKeys.customers.all, 'metrics', orgId] as const,
  },

  // Embed Configs
  embedConfigs: {
    all: ['embedConfigs'] as const,
    list: (orgId: string) => [...queryKeys.embedConfigs.all, 'list', orgId] as const,
    detail: (id: string) => [...queryKeys.embedConfigs.all, 'detail', id] as const,
    byKey: (key: string) => [...queryKeys.embedConfigs.all, 'byKey', key] as const,
  },
} as const;

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Data considered fresh for 5 minutes - no refetch during this time
      staleTime: CACHE_TIMES.MEDIUM,
      
      // Keep unused data in cache for 30 minutes
      gcTime: CACHE_TIMES.VERY_LONG * 2,
      
      // Don't refetch on window focus - reduces unnecessary requests
      refetchOnWindowFocus: false,
      
      // Don't refetch on mount if data exists and is not stale
      refetchOnMount: false,
      
      // Don't refetch on reconnect automatically
      refetchOnReconnect: 'always',
      
      // Retry once on failure with exponential backoff
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Network mode: always try to fetch (handle offline gracefully)
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
};

// ============================================================================
// QUERY CLIENT INSTANCE
// ============================================================================

/**
 * Singleton QueryClient instance with optimized caching configuration.
 * 
 * Features:
 * - 5 minute stale time for most queries
 * - 30 minute garbage collection
 * - Disabled refetch on window focus (reduces API calls)
 * - Offline-first network mode
 * - Single retry with exponential backoff
 */
export const queryClient = new QueryClient(queryClientConfig);

// ============================================================================
// CACHE INVALIDATION HELPERS
// ============================================================================

/**
 * Invalidate all queries for a specific domain.
 * Use after mutations that affect multiple entities.
 */
export const invalidateDomain = (domain: keyof typeof queryKeys) => {
  const keys = queryKeys[domain];
  if ('all' in keys) {
    // Cast to readonly array since we know all keys have 'all' property
    queryClient.invalidateQueries({ queryKey: keys.all as readonly string[] });
  }
};

/**
 * Invalidate all user-specific data.
 * Use on logout or user switch.
 */
export const invalidateUserData = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
};

/**
 * Clear entire cache.
 * Use on logout or critical errors.
 */
export const clearAllCache = () => {
  queryClient.clear();
};

/**
 * Prefetch critical data for faster navigation.
 * Call after successful authentication.
 */
export const prefetchCriticalData = async (
  orgId: string,
  fetchers: {
    fetchVenues?: () => Promise<unknown>;
    fetchActivities?: () => Promise<unknown>;
    fetchSettings?: () => Promise<unknown>;
  }
) => {
  const promises: Promise<void>[] = [];

  if (fetchers.fetchVenues) {
    promises.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.venues.list(orgId),
        queryFn: fetchers.fetchVenues,
        staleTime: CACHE_TIMES.LONG,
      })
    );
  }

  if (fetchers.fetchActivities) {
    promises.push(
      queryClient.prefetchQuery({
        queryKey: queryKeys.activities.list({ organizationId: orgId }),
        queryFn: fetchers.fetchActivities,
        staleTime: CACHE_TIMES.MEDIUM,
      })
    );
  }

  await Promise.allSettled(promises);
};

export default queryClient;
