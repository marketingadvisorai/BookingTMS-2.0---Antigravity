/**
 * Shared Cache Utilities for Edge Functions
 * Uses Upstash Redis for serverless caching
 * 
 * @module supabase/functions/_shared/cache
 * @version 1.0.0
 */

// Upstash Redis REST API client (no external dependencies)
class UpstashRedis {
  private url: string
  private token: string

  constructor(url: string, token: string) {
    this.url = url
    this.token = token
  }

  private async command(...args: (string | number)[]): Promise<any> {
    const response = await fetch(`${this.url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    })
    const data = await response.json()
    if (data.error) throw new Error(data.error)
    return data.result
  }

  async get(key: string): Promise<string | null> {
    return this.command('GET', key)
  }

  async set(key: string, value: string, options?: { ex?: number }): Promise<void> {
    if (options?.ex) {
      await this.command('SET', key, value, 'EX', options.ex)
    } else {
      await this.command('SET', key, value)
    }
  }

  async del(...keys: string[]): Promise<number> {
    return this.command('DEL', ...keys)
  }

  async keys(pattern: string): Promise<string[]> {
    return this.command('KEYS', pattern) || []
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    return this.command('ZADD', key, score, member)
  }

  async zremrangebyscore(key: string, min: number, max: number): Promise<number> {
    return this.command('ZREMRANGEBYSCORE', key, min, max)
  }

  async zcard(key: string): Promise<number> {
    return this.command('ZCARD', key)
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.command('EXPIRE', key, seconds)
  }
}

// Initialize Redis client (lazy initialization)
let redisClient: UpstashRedis | null = null

function getRedis(): UpstashRedis | null {
  if (redisClient) return redisClient

  const url = Deno.env.get('UPSTASH_REDIS_REST_URL')
  const token = Deno.env.get('UPSTASH_REDIS_REST_TOKEN')

  if (!url || !token) {
    console.warn('Upstash Redis not configured - caching disabled')
    return null
  }

  redisClient = new UpstashRedis(url, token)
  return redisClient
}

// TTL constants (in seconds)
export const TTL = {
  SHORT: 30,      // 30 seconds - availability checks
  MEDIUM: 300,    // 5 minutes - activity data
  LONG: 900,      // 15 minutes - static configs
  HOUR: 3600,     // 1 hour
  DAY: 86400,     // 24 hours
}

/**
 * Get cached value
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  if (!redis) return null

  try {
    const value = await redis.get(key)
    if (value === null) return null
    return typeof value === 'string' ? JSON.parse(value) : value as T
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

/**
 * Set cached value with TTL
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = TTL.MEDIUM
): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false

  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds })
    return true
  } catch (error) {
    console.error('Cache set error:', error)
    return false
  }
}

/**
 * Delete cached value
 */
export async function cacheDelete(key: string): Promise<boolean> {
  const redis = getRedis()
  if (!redis) return false

  try {
    await redis.del(key)
    return true
  } catch (error) {
    console.error('Cache delete error:', error)
    return false
  }
}

/**
 * Delete multiple keys by pattern
 */
export async function cacheDeletePattern(pattern: string): Promise<number> {
  const redis = getRedis()
  if (!redis) return 0

  try {
    const keys = await redis.keys(pattern)
    if (keys.length === 0) return 0
    
    await redis.del(...keys)
    return keys.length
  } catch (error) {
    console.error('Cache delete pattern error:', error)
    return 0
  }
}

/**
 * Cache-through pattern - get from cache or fetch and cache
 */
export async function cacheThrough<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = TTL.MEDIUM
): Promise<T> {
  // Try cache first
  const cached = await cacheGet<T>(key)
  if (cached !== null) {
    console.log(`Cache HIT: ${key}`)
    return cached
  }

  console.log(`Cache MISS: ${key}`)
  
  // Fetch and cache
  const data = await fetchFn()
  if (data !== null && data !== undefined) {
    await cacheSet(key, data, ttlSeconds)
  }

  return data
}

// ============================================================================
// RATE LIMITING
// ============================================================================

interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset: number
}

/**
 * Simple sliding window rate limiter
 * @param key - Unique identifier (e.g., IP, user ID)
 * @param limit - Max requests allowed
 * @param windowSeconds - Time window in seconds
 */
export async function rateLimit(
  key: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const redis = getRedis()
  
  // If Redis not available, allow all requests
  if (!redis) {
    return { allowed: true, remaining: limit, reset: 0 }
  }

  const rateLimitKey = `ratelimit:${key}`
  const now = Date.now()
  const windowMs = windowSeconds * 1000

  try {
    // Use a sorted set with timestamps
    // Remove old entries outside the window
    await redis.zremrangebyscore(rateLimitKey, 0, now - windowMs)

    // Count current entries
    const count = await redis.zcard(rateLimitKey)

    if (count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        reset: windowSeconds,
      }
    }

    // Add current request
    await redis.zadd(rateLimitKey, now, `${now}:${Math.random()}`)
    
    // Set expiry on the key
    await redis.expire(rateLimitKey, windowSeconds)

    return {
      allowed: true,
      remaining: limit - count - 1,
      reset: windowSeconds,
    }
  } catch (error) {
    console.error('Rate limit error:', error)
    // On error, allow the request
    return { allowed: true, remaining: limit, reset: 0 }
  }
}

// ============================================================================
// CACHE KEY BUILDERS
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
  
  // Rate limiting
  rateLimitApi: (ip: string) => `api:${ip}`,
  rateLimitCheckout: (ip: string) => `checkout:${ip}`,
  rateLimitWidget: (embedKey: string) => `widget:load:${embedKey}`,
}
