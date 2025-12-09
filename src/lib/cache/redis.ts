/**
 * Cache Utilities (Client-Side)
 * 
 * VERSION 2.0.0 - Redis/Upstash REMOVED
 * 
 * Using React Query for primary client-side caching instead.
 * This module provides a simple in-memory cache for edge cases.
 * 
 * @module lib/cache/redis
 * @version 2.0.0
 */

// ============================================================================
// TTL CONSTANTS (kept for compatibility)
// ============================================================================

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
} as const;

// ============================================================================
// CACHE KEYS (kept for reference)
// ============================================================================

export const CACHE_KEYS = {
  SESSION_AVAILABILITY: 'session:avail',
  SESSION_CAPACITY: 'session:cap',
  ACTIVITY: 'activity',
  ACTIVITY_SESSIONS: 'activity:sessions',
  ACTIVITY_PRICING: 'activity:pricing',
  VENUE: 'venue',
  VENUE_ACTIVITIES: 'venue:activities',
  WIDGET_CONFIG: 'widget:config',
  EMBED_CONFIG: 'embed:config',
} as const;

// ============================================================================
// SIMPLE MEMORY CACHE (for edge cases)
// ============================================================================

/**
 * Simple in-memory cache for client-side use
 * Primary caching should use React Query instead
 */
class MemoryCache {
  private cache: Map<string, { value: unknown; expires: number }> = new Map();

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  invalidateByPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }
}

// Export singleton memory cache
export const memoryCache = new MemoryCache();
