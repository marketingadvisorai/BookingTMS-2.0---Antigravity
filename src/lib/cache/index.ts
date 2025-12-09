/**
 * Cache Module - Barrel Export
 * 
 * Centralized caching utilities for BookingTMS.
 * @see /docs/EDGE_CACHING_ARCHITECTURE.md
 */

export {
  queryClient,
  queryKeys,
  CACHE_TIMES,
  invalidateDomain,
  invalidateUserData,
  clearAllCache,
  prefetchCriticalData,
} from './queryConfig';
