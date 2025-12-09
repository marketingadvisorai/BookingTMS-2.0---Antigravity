/**
 * Edge Cache Headers Utility
 * 
 * Provides standardized cache headers for Edge Functions.
 * Uses Supabase's built-in CDN caching via Cache-Control headers.
 * 
 * NOTE: Replaces Upstash Redis caching for simpler architecture.
 * 
 * @module supabase/functions/_shared/edgeCacheHeaders
 * @version 1.0.0
 */

// ============================================================================
// TTL CONSTANTS
// ============================================================================

export const CACHE_TTL = {
  /** No caching - mutations, payments, sensitive data */
  NONE: 0,
  /** 1 minute - availability, sessions, dynamic content */
  SHORT: 60,
  /** 5 minutes - activity/venue data, widget configs */
  MEDIUM: 300,
  /** 15 minutes - static configs, rarely changing data */
  LONG: 900,
  /** 1 hour - version info */
  HOUR: 3600,
  /** 24 hours - static assets */
  DAY: 86400,
} as const;

export type CacheTTL = typeof CACHE_TTL[keyof typeof CACHE_TTL];

// ============================================================================
// TYPES
// ============================================================================

export interface CacheOptions {
  /** Make cache private (user-specific data) */
  private?: boolean;
  /** stale-while-revalidate duration (default: min(ttl, 60)) */
  staleWhileRevalidate?: number;
  /** Additional Vary headers */
  vary?: string[];
}

// ============================================================================
// FUNCTIONS
// ============================================================================

/**
 * Get standardized cache headers for a given TTL
 * 
 * @param ttlSeconds - Time to live in seconds (use CACHE_TTL constants)
 * @param options - Cache options
 * @returns Headers object to spread into response
 * 
 * @example
 * ```typescript
 * return new Response(data, {
 *   headers: { ...corsHeaders, ...getCacheHeaders(CACHE_TTL.MEDIUM) }
 * });
 * ```
 */
export function getCacheHeaders(
  ttlSeconds: CacheTTL | number,
  options: CacheOptions = {}
): Record<string, string> {
  // No caching
  if (ttlSeconds === 0) {
    return getNoCacheHeaders();
  }

  const swr = options.staleWhileRevalidate ?? Math.min(ttlSeconds, 60);
  const scope = options.private ? 'private' : 'public';
  const vary = ['Accept-Encoding', ...(options.vary || [])].join(', ');

  return {
    'Cache-Control': `${scope}, max-age=${ttlSeconds}, s-maxage=${ttlSeconds}, stale-while-revalidate=${swr}`,
    'CDN-Cache-Control': `max-age=${ttlSeconds}`,
    'Vary': vary,
  };
}

/**
 * Get no-cache headers for mutations/sensitive data
 * Use for: payments, bookings, auth, webhooks
 */
export function getNoCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

/**
 * Check if client requested cache bypass
 * Respects Cache-Control: no-cache from client
 */
export function shouldBypassCache(request: Request): boolean {
  const cacheControl = request.headers.get('Cache-Control') || '';
  const pragma = request.headers.get('Pragma') || '';
  
  return (
    cacheControl.includes('no-cache') ||
    cacheControl.includes('no-store') ||
    pragma.includes('no-cache')
  );
}

// ============================================================================
// PRESETS
// ============================================================================

/**
 * Predefined cache presets for common use cases
 */
export const CACHE_PRESETS = {
  /** No caching - for mutations, payments, sensitive data */
  NONE: getNoCacheHeaders(),
  /** 1 minute - for availability, sessions */
  SHORT: getCacheHeaders(CACHE_TTL.SHORT),
  /** 5 minutes - for activity/venue data */
  MEDIUM: getCacheHeaders(CACHE_TTL.MEDIUM),
  /** 15 minutes - for static configs */
  LONG: getCacheHeaders(CACHE_TTL.LONG),
  /** Private short cache - for user-specific dynamic data */
  PRIVATE_SHORT: getCacheHeaders(CACHE_TTL.SHORT, { private: true }),
} as const;
