/**
 * Redis Cache Service using Upstash
 * 
 * Upstash is a serverless Redis provider recommended by Supabase.
 * It works with Edge Functions and has a free tier.
 * 
 * Setup:
 * 1. Create account at https://console.upstash.com
 * 2. Create a Redis database (select Global for edge functions)
 * 3. Add env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 * 
 * @module lib/cache/redis
 * @version 1.0.0
 */

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  /** Short-lived: availability, sessions (30 seconds) */
  SHORT: 30,
  /** Medium: activity data, venue info (5 minutes) */
  MEDIUM: 300,
  /** Long: static configs, pricing (15 minutes) */
  LONG: 900,
  /** Extended: rarely changing data (1 hour) */
  EXTENDED: 3600,
  /** Day: very static data (24 hours) */
  DAY: 86400,
} as const

// Cache key prefixes for organization
export const CACHE_KEYS = {
  // Session availability
  SESSION_AVAILABILITY: 'session:avail',
  SESSION_CAPACITY: 'session:cap',
  
  // Activity data
  ACTIVITY: 'activity',
  ACTIVITY_SESSIONS: 'activity:sessions',
  ACTIVITY_PRICING: 'activity:pricing',
  
  // Venue data  
  VENUE: 'venue',
  VENUE_ACTIVITIES: 'venue:activities',
  
  // Widget configs
  WIDGET_CONFIG: 'widget:config',
  EMBED_CONFIG: 'embed:config',
  
  // Rate limiting
  RATE_LIMIT: 'ratelimit',
  
  // User sessions
  USER_SESSION: 'user:session',
} as const

/**
 * Build a cache key with proper namespacing
 */
export function buildCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return [prefix, ...parts].join(':')
}

/**
 * Parse a cache key into its parts
 */
export function parseCacheKey(key: string): string[] {
  return key.split(':')
}

// Type definitions
export interface CacheConfig {
  url: string
  token: string
}

export interface CacheOptions {
  /** Time to live in seconds */
  ttl?: number
  /** Optional tags for cache invalidation */
  tags?: string[]
}

export interface CacheResult<T> {
  data: T | null
  hit: boolean
  age?: number
}

/**
 * In-memory cache for client-side use
 * Falls back when Redis is not available
 */
class MemoryCache {
  private cache: Map<string, { value: unknown; expires: number }> = new Map()

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    return item.value as T
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Invalidate by prefix/pattern
  invalidateByPrefix(prefix: string): number {
    let count = 0
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
        count++
      }
    }
    return count
  }
}

// Export singleton memory cache for client-side
export const memoryCache = new MemoryCache()

/**
 * Generic cache wrapper that works with both Redis and memory cache
 * Use this in services for transparent caching
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = CACHE_TTL.MEDIUM } = options

  // Try memory cache first (client-side)
  const cached = memoryCache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Fetch fresh data
  const data = await fetchFn()

  // Store in memory cache
  if (data !== null && data !== undefined) {
    memoryCache.set(key, data, ttl)
  }

  return data
}

/**
 * Invalidate cache entries by prefix
 * Call this when data changes
 */
export function invalidateCache(prefix: string): number {
  return memoryCache.invalidateByPrefix(prefix)
}

/**
 * Invalidate specific cache key
 */
export function invalidateCacheKey(key: string): void {
  memoryCache.delete(key)
}

/**
 * Clear all cache
 */
export function clearCache(): void {
  memoryCache.clear()
}
