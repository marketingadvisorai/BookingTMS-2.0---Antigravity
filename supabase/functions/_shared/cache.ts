/**
 * Shared Cache Utilities for Edge Functions
 * 
 * VERSION 2.0.0 - Upstash Redis REMOVED
 * 
 * Now using HTTP Cache-Control headers for CDN caching instead.
 * This provides simpler architecture with better performance
 * (CDN cache hits don't even invoke the edge function).
 * 
 * For rate limiting: Rely on Supabase platform limits (500 req/sec).
 * 
 * @module supabase/functions/_shared/cache
 * @version 2.0.0
 * @deprecated Use edgeCacheHeaders.ts instead for new code
 */

// Re-export edge cache headers for new code
export * from './edgeCacheHeaders.ts';

// ============================================================================
// LEGACY TTL CONSTANTS (for backward compatibility)
// ============================================================================

export const TTL = {
  SHORT: 30,      // 30 seconds - availability checks
  MEDIUM: 300,    // 5 minutes - activity data
  LONG: 900,      // 15 minutes - static configs
  HOUR: 3600,     // 1 hour
  DAY: 86400,     // 24 hours
}

// ============================================================================
// LEGACY CACHE KEY BUILDERS (for reference)
// ============================================================================

export const CacheKeys = {
  // Widget configs
  widgetConfig: (embedKey: string) => `widget:${embedKey}`,
  activityWidget: (activityId: string) => `activity:widget:${activityId}`,
  
  // Session availability
  sessionAvailability: (sessionId: string) => `session:avail:${sessionId}`,
  activitySessions: (activityId: string, date: string) => 
    `activity:sessions:${activityId}:${date}`,
  
  // Organization data
  orgActivities: (orgId: string) => `org:activities:${orgId}`,
  orgVenues: (orgId: string) => `org:venues:${orgId}`,
  
  // Rate limiting (no longer functional without Redis)
  rateLimitApi: (ip: string) => `api:${ip}`,
  rateLimitCheckout: (ip: string) => `checkout:${ip}`,
  rateLimitWidget: (embedKey: string) => `widget:load:${embedKey}`,
}

// ============================================================================
// NO-OP FUNCTIONS (for backward compatibility)
// These functions are stubs - caching is now done via HTTP headers
// ============================================================================

/**
 * @deprecated Redis removed - using HTTP cache headers instead
 */
export async function cacheGet<T>(_key: string): Promise<T | null> {
  // No-op: Redis removed, caching handled by HTTP headers
  return null;
}

/**
 * @deprecated Redis removed - using HTTP cache headers instead
 */
export async function cacheSet<T>(
  _key: string,
  _value: T,
  _ttlSeconds: number = TTL.MEDIUM
): Promise<boolean> {
  // No-op: Redis removed, caching handled by HTTP headers
  return false;
}

/**
 * @deprecated Redis removed - using HTTP cache headers instead
 */
export async function cacheDelete(_key: string): Promise<boolean> {
  // No-op: Redis removed
  return false;
}

/**
 * @deprecated Redis removed - using HTTP cache headers instead
 */
export async function cacheDeletePattern(_pattern: string): Promise<number> {
  // No-op: Redis removed
  return 0;
}

/**
 * @deprecated Redis removed - using HTTP cache headers instead
 */
export async function cacheThrough<T>(
  _key: string,
  fetchFn: () => Promise<T>,
  _ttlSeconds: number = TTL.MEDIUM
): Promise<T> {
  // Just execute the fetch function directly (no caching layer)
  return fetchFn();
}

// ============================================================================
// RATE LIMITING (simplified - relies on Supabase platform limits)
// ============================================================================

interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number
}

/**
 * Rate limiting stub - always allows requests
 * Relies on Supabase platform-level rate limiting instead
 * 
 * @deprecated Custom rate limiting removed with Redis
 */
export async function rateLimit(
  _key: string,
  _limit: number = 100,
  _windowSeconds: number = 60
): Promise<RateLimitResult> {
  // Always allow - rely on Supabase platform rate limits
  return { allowed: true, remaining: 100, reset: 0 };
}
