/**
 * Edge Cache Headers Utility
 * 
 * Provides standardized cache headers for Supabase Edge Functions.
 * Uses Supabase Pro plan edge caching (250 GB included).
 * 
 * @see /docs/EDGE_CACHING_ARCHITECTURE.md
 */

// ============================================================================
// CACHE DURATION CONSTANTS (in seconds)
// ============================================================================

export const CACHE_DURATIONS = {
  /** No caching - real-time data */
  NONE: 0,
  /** 30 seconds - rapidly changing data */
  VERY_SHORT: 30,
  /** 1 minute - user-specific data that can be slightly stale */
  SHORT: 60,
  /** 5 minutes - organization data */
  MEDIUM: 300,
  /** 15 minutes - configuration data */
  LONG: 900,
  /** 1 hour - static reference data */
  VERY_LONG: 3600,
  /** 24 hours - rarely changing data */
  DAY: 86400,
} as const;

// ============================================================================
// CACHE HEADER GENERATORS
// ============================================================================

/**
 * Generate cache headers for public, cacheable responses.
 * Use for: venue data, activity listings, plan configurations, etc.
 * 
 * @param maxAge - Browser cache duration in seconds
 * @param sMaxAge - CDN cache duration in seconds (default: 2x maxAge)
 * @param staleWhileRevalidate - Serve stale while revalidating (default: 60s)
 */
export function getCacheHeaders(
  maxAge: number,
  sMaxAge?: number,
  staleWhileRevalidate: number = 60
): Record<string, string> {
  const cdnMaxAge = sMaxAge ?? maxAge * 2;
  
  return {
    'Cache-Control': `public, max-age=${maxAge}, s-maxage=${cdnMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
    'CDN-Cache-Control': `max-age=${cdnMaxAge}`,
    'Surrogate-Control': `max-age=${cdnMaxAge * 2}`,
    'Vary': 'Accept-Encoding',
  };
}

/**
 * Generate no-cache headers for private/dynamic responses.
 * Use for: user-specific data, mutations, real-time data, etc.
 */
export function getNoCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'private, no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };
}

/**
 * Generate headers for immutable content.
 * Use for: versioned assets, generated files with unique IDs, etc.
 */
export function getImmutableHeaders(maxAge: number = CACHE_DURATIONS.DAY): Record<string, string> {
  return {
    'Cache-Control': `public, max-age=${maxAge}, immutable`,
    'CDN-Cache-Control': `max-age=${maxAge}`,
  };
}

// ============================================================================
// PRESET CACHE CONFIGURATIONS
// ============================================================================

export const CACHE_PRESETS = {
  /** No caching - mutations, auth, real-time */
  NONE: getNoCacheHeaders(),
  
  /** Very short (30s) - rapidly changing data */
  VERY_SHORT: getCacheHeaders(CACHE_DURATIONS.VERY_SHORT),
  
  /** Short (1 min) - user session data */
  SHORT: getCacheHeaders(CACHE_DURATIONS.SHORT),
  
  /** Medium (5 min) - organization/venue data */
  MEDIUM: getCacheHeaders(CACHE_DURATIONS.MEDIUM),
  
  /** Long (15 min) - configuration data */
  LONG: getCacheHeaders(CACHE_DURATIONS.LONG),
  
  /** Very long (1 hour) - static reference data */
  VERY_LONG: getCacheHeaders(CACHE_DURATIONS.VERY_LONG),
  
  /** Day (24 hours) - rarely changing data */
  DAY: getCacheHeaders(CACHE_DURATIONS.DAY),
} as const;

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

/**
 * Create a cached JSON response.
 * 
 * @param data - Response data
 * @param cachePreset - Cache preset key or custom headers
 * @param status - HTTP status code
 */
export function cachedJsonResponse(
  data: unknown,
  cachePreset: keyof typeof CACHE_PRESETS | Record<string, string> = 'NONE',
  status: number = 200
): Response {
  const cacheHeaders = typeof cachePreset === 'string' 
    ? CACHE_PRESETS[cachePreset] 
    : cachePreset;

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...cacheHeaders,
    },
  });
}

/**
 * Create an error response (never cached).
 */
export function errorResponse(
  error: string,
  status: number = 400
): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CACHE_PRESETS.NONE,
    },
  });
}

/**
 * Merge cache headers with CORS headers.
 * Use when you need both caching and CORS.
 */
export function withCorsHeaders(
  cacheHeaders: Record<string, string>,
  origin: string = '*'
): Record<string, string> {
  return {
    ...cacheHeaders,
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };
}

// ============================================================================
// FUNCTION-SPECIFIC RECOMMENDATIONS
// ============================================================================

/**
 * Recommended cache settings by function type.
 * Reference this when updating Edge Functions.
 */
export const FUNCTION_CACHE_RECOMMENDATIONS = {
  // Mutations - Never cache
  'stripe-manage-product': 'NONE',
  'create-checkout-session': 'NONE',
  'create-booking': 'NONE',
  'create-org-admin': 'NONE',
  'ai-agent-chat': 'NONE',
  'send-marketing-email': 'NONE',
  
  // Read-heavy with infrequent changes - Medium cache
  'verify-checkout-session': 'SHORT', // 1 min - session verification
  'stripe-billing': 'MEDIUM', // 5 min for reads
  
  // Static-ish data - Long cache
  'get-plans': 'LONG', // 15 min
  'get-timezones': 'DAY', // 24 hours
} as const;
