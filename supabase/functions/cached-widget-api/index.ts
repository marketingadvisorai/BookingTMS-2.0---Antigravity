/**
 * Cached Widget API Edge Function
 * 
 * VERSION 2.0.0 - Now using HTTP Cache-Control headers instead of Redis
 * 
 * High-performance endpoint for widget data with:
 * - Edge caching via Cache-Control headers (CDN-level)
 * - No external dependencies (Redis removed)
 * 
 * @module supabase/functions/cached-widget-api
 * @version 2.0.0
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { getCacheHeaders, CACHE_TTL } from '../_shared/edgeCacheHeaders.ts'

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

// Rate limits - now rely on Supabase platform limits (500 req/sec)
// Custom rate limiting removed with Redis

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const embedKey = url.searchParams.get('key')
  const activityId = url.searchParams.get('activityId')
  const action = url.searchParams.get('action') || 'config'

  try {
    // Route to appropriate handler (rate limiting now handled by Supabase platform)
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

  // Fetch from database (HTTP caching handled via Cache-Control headers in response)
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

  // Return with cache headers (CDN will cache this response)
  return jsonResponse(data, 200, TTL.WIDGET_CONFIG)
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

  // Fetch from database (HTTP caching via Cache-Control headers)
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

  // Return with short cache (sessions are dynamic)
  return jsonResponse(sessions || [], 200, TTL.SESSION_AVAIL)
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

/**
 * Create JSON response with optional edge cache headers
 * @param data - Response data
 * @param status - HTTP status code
 * @param cacheTtl - Cache TTL in seconds (0 = no cache)
 */
function jsonResponse(data: any, status = 200, cacheTtl = 0) {
  const headers: Record<string, string> = {
    ...corsHeaders,
    'Content-Type': 'application/json',
  }
  
  if (cacheTtl > 0) {
    // Add edge cache headers for CDN caching
    const swr = Math.min(cacheTtl, 60); // stale-while-revalidate
    headers['Cache-Control'] = `public, max-age=${cacheTtl}, s-maxage=${cacheTtl}, stale-while-revalidate=${swr}`;
    headers['CDN-Cache-Control'] = `max-age=${cacheTtl}`;
    headers['Vary'] = 'Accept-Encoding';
  }

  return new Response(JSON.stringify(data), { status, headers })
}
