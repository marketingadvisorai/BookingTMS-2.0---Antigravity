/**
 * Cached Widget API Edge Function
 * 
 * High-performance endpoint for widget data with:
 * - Redis caching (Upstash)
 * - Rate limiting
 * - Edge-optimized responses
 * 
 * @module supabase/functions/cached-widget-api
 * @version 1.0.0
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { Redis } from 'https://deno.land/x/upstash_redis@v1.19.3/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// TTL constants
const TTL = {
  WIDGET_CONFIG: 300,    // 5 minutes
  ACTIVITY_DATA: 300,    // 5 minutes  
  SESSION_AVAIL: 30,     // 30 seconds (more dynamic)
}

// Rate limits
const RATE_LIMITS = {
  WIDGET_LOAD: { limit: 60, window: 60 },    // 60 req/min per widget
  API_CALL: { limit: 100, window: 60 },       // 100 req/min per IP
}

// Initialize Redis (lazy)
let redis: Redis | null = null
function getRedis(): Redis | null {
  if (redis) return redis
  const url = Deno.env.get('UPSTASH_REDIS_REST_URL')
  const token = Deno.env.get('UPSTASH_REDIS_REST_TOKEN')
  if (!url || !token) return null
  redis = new Redis({ url, token })
  return redis
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const embedKey = url.searchParams.get('key')
  const activityId = url.searchParams.get('activityId')
  const action = url.searchParams.get('action') || 'config'

  // Get client IP for rate limiting
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                   req.headers.get('cf-connecting-ip') || 
                   'unknown'

  try {
    // Rate limit check
    const rateLimitResult = await checkRateLimit(clientIP, 'api')
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.reset 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.reset),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          } 
        }
      )
    }

    // Route to appropriate handler
    switch (action) {
      case 'config':
        return await handleGetConfig(embedKey, activityId)
      case 'sessions':
        return await handleGetSessions(activityId, url.searchParams.get('date'))
      case 'availability':
        return await handleCheckAvailability(
          url.searchParams.get('sessionId'),
          parseInt(url.searchParams.get('spots') || '1')
        )
      default:
        return jsonResponse({ error: 'Invalid action' }, 400)
    }
  } catch (error) {
    console.error('Widget API error:', error)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
})

// ============================================================================
// HANDLERS
// ============================================================================

async function handleGetConfig(embedKey: string | null, activityId: string | null) {
  if (!embedKey && !activityId) {
    return jsonResponse({ error: 'embedKey or activityId required' }, 400)
  }

  const cacheKey = embedKey 
    ? `widget:config:${embedKey}` 
    : `activity:config:${activityId}`

  // Try cache first
  const redis = getRedis()
  if (redis) {
    const cached = await redis.get(cacheKey)
    if (cached) {
      console.log(`Cache HIT: ${cacheKey}`)
      return jsonResponse(typeof cached === 'string' ? JSON.parse(cached) : cached, 200, true)
    }
  }

  console.log(`Cache MISS: ${cacheKey}`)

  // Fetch from database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  let data: any = null

  if (embedKey) {
    // Get venue widget config
    const { data: config, error } = await supabase
      .from('embed_configs')
      .select(`
        *,
        venues!inner (
          id, name, slug, address, city, state, timezone, primary_color,
          activities!inner (
            id, name, description, price, duration, min_players, max_players,
            image_url, is_active, schedule, stripe_product_id, stripe_price_id
          )
        )
      `)
      .eq('embed_key', embedKey)
      .eq('is_active', true)
      .single()

    if (error || !config) {
      return jsonResponse({ error: 'Widget not found' }, 404)
    }
    data = config
  } else if (activityId) {
    // Get single activity config
    const { data: activity, error } = await supabase
      .from('activities')
      .select(`
        id, name, description, price, duration, min_players, max_players,
        image_url, is_active, schedule, stripe_product_id, stripe_price_id,
        venues!inner (id, name, address, city, state, timezone, primary_color)
      `)
      .eq('id', activityId)
      .eq('is_active', true)
      .single()

    if (error || !activity) {
      return jsonResponse({ error: 'Activity not found' }, 404)
    }
    data = activity
  }

  // Cache the result
  if (redis && data) {
    await redis.set(cacheKey, JSON.stringify(data), { ex: TTL.WIDGET_CONFIG })
  }

  return jsonResponse(data)
}

async function handleGetSessions(
  activityId: string | null, 
  date: string | null
) {
  if (!activityId) {
    return jsonResponse({ error: 'activityId required' }, 400)
  }

  // Default to today
  const targetDate = date || new Date().toISOString().split('T')[0]
  const cacheKey = `sessions:${activityId}:${targetDate}`

  // Try cache
  const redis = getRedis()
  if (redis) {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return jsonResponse(typeof cached === 'string' ? JSON.parse(cached) : cached, 200, true)
    }
  }

  // Fetch from database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const startOfDay = `${targetDate}T00:00:00`
  const endOfDay = `${targetDate}T23:59:59`

  const { data: sessions, error } = await supabase
    .from('activity_sessions')
    .select('id, start_time, end_time, capacity_total, capacity_remaining, is_closed, version')
    .eq('activity_id', activityId)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .eq('is_closed', false)
    .gt('capacity_remaining', 0)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Sessions fetch error:', error)
    return jsonResponse({ error: 'Failed to fetch sessions' }, 500)
  }

  // Cache with shorter TTL (sessions are more dynamic)
  if (redis && sessions) {
    await redis.set(cacheKey, JSON.stringify(sessions), { ex: TTL.SESSION_AVAIL })
  }

  return jsonResponse(sessions || [])
}

async function handleCheckAvailability(sessionId: string | null, spots: number) {
  if (!sessionId) {
    return jsonResponse({ error: 'sessionId required' }, 400)
  }

  // Don't cache availability checks - always fresh
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: session, error } = await supabase
    .from('activity_sessions')
    .select('id, capacity_remaining, is_closed, version')
    .eq('id', sessionId)
    .single()

  if (error || !session) {
    return jsonResponse({ available: false, reason: 'Session not found' })
  }

  if (session.is_closed) {
    return jsonResponse({ available: false, reason: 'Session is closed' })
  }

  if (session.capacity_remaining < spots) {
    return jsonResponse({ 
      available: false, 
      reason: 'Not enough capacity',
      remaining: session.capacity_remaining 
    })
  }

  return jsonResponse({ 
    available: true, 
    remaining: session.capacity_remaining,
    version: session.version 
  })
}

// ============================================================================
// UTILITIES
// ============================================================================

function jsonResponse(data: any, status = 200, cached = false) {
  const headers: Record<string, string> = {
    ...corsHeaders,
    'Content-Type': 'application/json',
  }
  
  if (cached) {
    headers['X-Cache'] = 'HIT'
    headers['Cache-Control'] = 'public, max-age=30'
  } else {
    headers['X-Cache'] = 'MISS'
  }

  return new Response(JSON.stringify(data), { status, headers })
}

async function checkRateLimit(
  key: string, 
  type: 'api' | 'widget' = 'api'
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const redis = getRedis()
  if (!redis) {
    return { allowed: true, remaining: 100, reset: 0 }
  }

  const limits = type === 'widget' ? RATE_LIMITS.WIDGET_LOAD : RATE_LIMITS.API_CALL
  const rateLimitKey = `ratelimit:${type}:${key}`
  const now = Date.now()
  const windowMs = limits.window * 1000

  try {
    // Remove old entries
    await redis.zremrangebyscore(rateLimitKey, 0, now - windowMs)
    
    // Count current
    const count = await redis.zcard(rateLimitKey)
    
    if (count >= limits.limit) {
      return { allowed: false, remaining: 0, reset: limits.window }
    }

    // Add current request
    await redis.zadd(rateLimitKey, { score: now, member: `${now}:${Math.random()}` })
    await redis.expire(rateLimitKey, limits.window)

    return { allowed: true, remaining: limits.limit - count - 1, reset: limits.window }
  } catch (error) {
    console.error('Rate limit error:', error)
    return { allowed: true, remaining: limits.limit, reset: 0 }
  }
}
