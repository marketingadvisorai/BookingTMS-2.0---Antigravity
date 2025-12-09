/**
 * Health Check Edge Function
 * 
 * Monitors the health of all system components:
 * - Database connectivity and latency
 * - Redis cache status
 * - Stripe API availability
 * 
 * @module supabase/functions/health
 * @version 1.0.0
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency: number
  message?: string
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  version: string
  timestamp: string
  uptime: number
  checks: {
    database: ComponentHealth
    redis: ComponentHealth
    stripe: ComponentHealth
  }
}

const startTime = Date.now()

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const checks: HealthResponse['checks'] = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    stripe: await checkStripe(),
  }

  // Determine overall status
  const statuses = Object.values(checks).map(c => c.status)
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  
  if (statuses.includes('unhealthy')) {
    overallStatus = 'unhealthy'
  } else if (statuses.includes('degraded')) {
    overallStatus = 'degraded'
  }

  const response: HealthResponse = {
    status: overallStatus,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
  }

  const httpStatus = overallStatus === 'healthy' ? 200 : 
                     overallStatus === 'degraded' ? 200 : 503

  return new Response(JSON.stringify(response, null, 2), {
    status: httpStatus,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  })
})

async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now()
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Simple query to check connectivity
    const { error } = await supabase.from('organizations').select('id').limit(1)
    
    const latency = Date.now() - start

    if (error) {
      return {
        status: 'unhealthy',
        latency,
        message: error.message,
      }
    }

    // Consider degraded if latency > 500ms
    if (latency > 500) {
      return {
        status: 'degraded',
        latency,
        message: 'High latency detected',
      }
    }

    return {
      status: 'healthy',
      latency,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Database connection failed',
    }
  }
}

async function checkRedis(): Promise<ComponentHealth> {
  // Redis/Upstash has been removed - using HTTP edge caching instead
  // This stub is kept for backward compatibility with health check consumers
  return {
    status: 'healthy',
    latency: 0,
    message: 'Redis removed - using HTTP edge caching (Cache-Control headers)',
  }

  // OLD IMPLEMENTATION REMOVED:
  // const url = Deno.env.get('UPSTASH_REDIS_REST_URL')
  // const token = Deno.env.get('UPSTASH_REDIS_REST_TOKEN')
  // ... Redis ping logic removed ...
}


async function checkStripe(): Promise<ComponentHealth> {
  const start = Date.now()
  
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
  
  if (!stripeKey) {
    return {
      status: 'degraded',
      latency: 0,
      message: 'Stripe not configured',
    }
  }

  try {
    // Simple API call to check Stripe connectivity
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        Authorization: `Bearer ${stripeKey}`,
      },
    })

    const latency = Date.now() - start

    if (response.ok) {
      if (latency > 1000) {
        return {
          status: 'degraded',
          latency,
          message: 'High latency detected',
        }
      }
      return {
        status: 'healthy',
        latency,
      }
    }

    return {
      status: 'unhealthy',
      latency,
      message: `Stripe API returned ${response.status}`,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : 'Stripe connection failed',
    }
  }
}
