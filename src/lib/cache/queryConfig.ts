/**
 * React Query Configuration
 * 
 * Centralized configuration for React Query with:
 * - Optimized stale/cache times
 * - Query key factories for consistent invalidation
 * - Performance-focused defaults
 * 
 * @module lib/cache/queryConfig
 * @version 1.0.0
 */

import { QueryClient } from '@tanstack/react-query';

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

export const QUERY_CACHE = {
  /** Data considered fresh for 5 minutes */
  STALE_TIME: 5 * 60 * 1000,
  /** Garbage collection after 30 minutes */
  GC_TIME: 30 * 60 * 1000,
  /** Retry failed requests once */
  RETRY_COUNT: 1,
} as const;

// ============================================================================
// QUERY CLIENT FACTORY
// ============================================================================

/**
 * Create a configured QueryClient instance
 * Uses optimized defaults for performance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_CACHE.STALE_TIME,
        gcTime: QUERY_CACHE.GC_TIME,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: QUERY_CACHE.RETRY_COUNT,
        networkMode: 'offlineFirst',
      },
      mutations: {
        retry: 0,
        networkMode: 'online',
      },
    },
  });
}

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Standardized query keys for consistent cache invalidation
 * 
 * @example
 * ```typescript
 * useQuery({
 *   queryKey: queryKeys.activities.byOrg(orgId),
 *   queryFn: () => fetchActivities(orgId),
 * });
 * 
 * // Invalidate after mutation
 * queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
 * ```
 */
export const queryKeys = {
  // Activities
  activities: {
    all: ['activities'] as const,
    byOrg: (orgId: string) => ['activities', 'org', orgId] as const,
    byId: (id: string) => ['activities', 'detail', id] as const,
    byVenue: (venueId: string) => ['activities', 'venue', venueId] as const,
  },
  
  // Venues
  venues: {
    all: ['venues'] as const,
    byOrg: (orgId: string) => ['venues', 'org', orgId] as const,
    byId: (id: string) => ['venues', 'detail', id] as const,
    bySlug: (slug: string) => ['venues', 'slug', slug] as const,
  },
  
  // Bookings
  bookings: {
    all: ['bookings'] as const,
    byOrg: (orgId: string) => ['bookings', 'org', orgId] as const,
    byId: (id: string) => ['bookings', 'detail', id] as const,
    byCustomer: (customerId: string) => ['bookings', 'customer', customerId] as const,
  },
  
  // Customers
  customers: {
    all: ['customers'] as const,
    byOrg: (orgId: string) => ['customers', 'org', orgId] as const,
    byId: (id: string) => ['customers', 'detail', id] as const,
  },
  
  // Organizations
  organizations: {
    all: ['organizations'] as const,
    byId: (id: string) => ['organizations', 'detail', id] as const,
  },
  
  // Widget data (public, highly cacheable)
  widgets: {
    byEmbedKey: (key: string) => ['widgets', 'embed', key] as const,
    byActivityId: (id: string) => ['widgets', 'activity', id] as const,
    byVenueId: (id: string) => ['widgets', 'venue', id] as const,
  },
  
  // Sessions/Availability
  sessions: {
    byActivity: (activityId: string, date: string) => 
      ['sessions', activityId, date] as const,
    availability: (sessionId: string) => 
      ['sessions', 'availability', sessionId] as const,
  },
  
  // Staff (new)
  staff: {
    all: ['staff'] as const,
    byOrg: (orgId: string) => ['staff', 'org', orgId] as const,
    byId: (staffId: string) => ['staff', 'detail', staffId] as const,
    stats: (orgId: string) => ['staff', 'stats', orgId] as const,
    assignments: (staffId: string) => ['staff', 'assignments', staffId] as const,
    shifts: (orgId: string, startDate: string, endDate: string) => 
      ['staff', 'shifts', orgId, startDate, endDate] as const,
    availability: (staffId: string) => ['staff', 'availability', staffId] as const,
  },
} as const;

// ============================================================================
// INVALIDATION HELPERS
// ============================================================================

/**
 * Invalidate all queries matching a key prefix
 */
export function invalidateQueries(
  queryClient: QueryClient,
  keys: readonly string[]
): Promise<void> {
  return queryClient.invalidateQueries({ queryKey: keys });
}

/**
 * Common invalidation patterns after mutations
 */
export const invalidationPatterns = {
  afterBookingCreate: (queryClient: QueryClient, orgId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.byOrg(orgId) });
  },
  
  afterActivityUpdate: (queryClient: QueryClient, orgId: string, activityId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.byOrg(orgId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.activities.byId(activityId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.widgets.byActivityId(activityId) });
  },
  
  afterVenueUpdate: (queryClient: QueryClient, orgId: string, venueId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.venues.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.venues.byOrg(orgId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.venues.byId(venueId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.widgets.byVenueId(venueId) });
  },
  
  afterCustomerUpdate: (queryClient: QueryClient, orgId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.customers.byOrg(orgId) });
  },
  
  // Staff invalidation patterns
  afterStaffCreate: (queryClient: QueryClient, orgId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.staff.byOrg(orgId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.staff.stats(orgId) });
  },
  
  afterStaffUpdate: (queryClient: QueryClient, orgId: string, staffId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.staff.byOrg(orgId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.staff.byId(staffId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.staff.stats(orgId) });
  },
  
  afterStaffAssignmentChange: (queryClient: QueryClient, staffId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.staff.assignments(staffId) });
  },
};
