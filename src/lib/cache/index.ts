/**
 * Cache Module Exports
 * 
 * Centralizes all caching utilities:
 * - React Query configuration (primary client-side caching)
 * - Memory cache for simple key-value storage
 * - TTL constants for consistent cache durations
 * 
 * @module lib/cache
 * @version 2.0.0
 */

// React Query configuration (primary caching mechanism)
export {
  createQueryClient,
  queryKeys,
  invalidateQueries,
  invalidationPatterns,
  QUERY_CACHE,
} from './queryConfig';

// Legacy memory cache utilities (for backward compatibility)
export {
  memoryCache,
  CACHE_TTL,
  CACHE_KEYS,
} from './redis';
