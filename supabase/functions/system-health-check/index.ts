/**
 * System Health Check Edge Function
 * Runs health checks on various system components
 * @version 1.0.0
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.14.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type HealthCheckType = 'api' | 'database' | 'stripe' | 'webhook' | 'embed' | 'all';
type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

interface HealthCheckResult {
  serviceName: string;
  checkType: string;
  status: HealthStatus;
  responseTimeMs: number;
  statusCode?: number;
  errorMessage?: string;
  details: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { checks = ['all'] } = await req.json() as { checks: HealthCheckType[] };

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: HealthCheckResult[] = [];
    const runAll = checks.includes('all');

    // Database check
    if (runAll || checks.includes('database')) {
      results.push(await checkDatabase(supabase));
    }

    // API check
    if (runAll || checks.includes('api')) {
      results.push(await checkApi(supabaseUrl));
    }

    // Stripe check
    if (runAll || checks.includes('stripe')) {
      results.push(await checkStripe());
    }

    // Store results
    for (const result of results) {
      await supabase.from('health_checks').insert({
        check_type: result.checkType,
        service_name: result.serviceName,
        status: result.status,
        response_time_ms: result.responseTimeMs,
        status_code: result.statusCode,
        error_message: result.errorMessage,
        details: result.details,
      });
    }

    // Calculate overall status
    const hasUnhealthy = results.some(r => r.status === 'unhealthy');
    const hasDegraded = results.some(r => r.status === 'degraded');
    const overallStatus: HealthStatus = hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';

    return new Response(
      JSON.stringify({
        results,
        overallStatus,
        checkedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Health check error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Health check failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function checkDatabase(supabase: ReturnType<typeof createClient>): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    const { data, error } = await supabase.from('organizations').select('id').limit(1);
    const responseTimeMs = Date.now() - startTime;

    if (error) {
      return {
        serviceName: 'database',
        checkType: 'database',
        status: 'unhealthy',
        responseTimeMs,
        errorMessage: error.message,
        details: { error: error.code },
      };
    }

    const status: HealthStatus = responseTimeMs > 5000 ? 'degraded' : 'healthy';
    return {
      serviceName: 'database',
      checkType: 'database',
      status,
      responseTimeMs,
      details: { query: 'SELECT 1' },
    };
  } catch (err) {
    return {
      serviceName: 'database',
      checkType: 'database',
      status: 'unhealthy',
      responseTimeMs: Date.now() - startTime,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      details: {},
    };
  }
}

async function checkApi(supabaseUrl: string): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const responseTimeMs = Date.now() - startTime;

    const status: HealthStatus = response.ok
      ? responseTimeMs > 3000 ? 'degraded' : 'healthy'
      : 'unhealthy';

    return {
      serviceName: 'api',
      checkType: 'api',
      status,
      responseTimeMs,
      statusCode: response.status,
      details: { endpoint: '/functions/v1/health' },
    };
  } catch (err) {
    return {
      serviceName: 'api',
      checkType: 'api',
      status: 'unhealthy',
      responseTimeMs: Date.now() - startTime,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      details: {},
    };
  }
}

async function checkStripe(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

  if (!stripeKey) {
    return {
      serviceName: 'stripe',
      checkType: 'stripe',
      status: 'unknown',
      responseTimeMs: 0,
      errorMessage: 'Stripe API key not configured',
      details: {},
    };
  }

  try {
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    await stripe.paymentIntents.list({ limit: 1 });
    const responseTimeMs = Date.now() - startTime;

    const status: HealthStatus = responseTimeMs > 5000 ? 'degraded' : 'healthy';
    return {
      serviceName: 'stripe',
      checkType: 'stripe',
      status,
      responseTimeMs,
      details: { api: 'payment_intents.list' },
    };
  } catch (err) {
    return {
      serviceName: 'stripe',
      checkType: 'stripe',
      status: 'unhealthy',
      responseTimeMs: Date.now() - startTime,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      details: {},
    };
  }
}
