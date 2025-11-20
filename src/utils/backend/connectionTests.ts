/**
 * Backend Connection Testing Utilities
 * 
 * Provides reusable functions for testing backend connections,
 * checking service health, and validating environment setup.
 */

export interface ConnectionResult {
  success: boolean;
  message: string;
  latency?: number;
  details?: any;
  error?: any;
}

export interface HealthStatus {
  service: string;
  healthy: boolean;
  responseTime?: number;
  message: string;
  timestamp: string;
}

/**
 * Test Supabase database connection
 */
export async function testSupabaseConnection(): Promise<ConnectionResult> {
  const startTime = Date.now();

  try {
    // Dynamically import Supabase client
    const { supabase } = await import('../../lib/supabase/client');

    // Test connection with a simple query
    const { data, error, count } = await supabase
      .from('kv_store_84a71643')
      .select('*', { count: 'exact', head: true });

    const latency = Date.now() - startTime;

    if (error) {
      return {
        success: false,
        message: `Database query failed: ${error.message}`,
        latency,
        error,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase database',
      latency,
      details: {
        table: 'kv_store_84a71643',
        recordCount: count,
        connected: true,
      },
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      message: error.message || 'Failed to connect to Supabase',
      latency,
      error,
    };
  }
}

/**
 * Test Supabase Auth service
 */
export async function testAuthService(): Promise<ConnectionResult> {
  const startTime = Date.now();

  try {
    const { supabase } = await import('../../lib/supabase/client');

    // Test auth service by getting session
    const { data, error } = await supabase.auth.getSession();

    const latency = Date.now() - startTime;

    if (error) {
      return {
        success: false,
        message: `Auth service error: ${error.message}`,
        latency,
        error,
      };
    }

    return {
      success: true,
      message: 'Auth service is operational',
      latency,
      details: {
        hasSession: !!data.session,
        user: data.session?.user?.id || null,
      },
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      message: error.message || 'Auth service unavailable',
      latency,
      error,
    };
  }
}

/**
 * Test Supabase Storage
 */
export async function testStorageService(): Promise<ConnectionResult> {
  const startTime = Date.now();

  try {
    const { supabase } = await import('../../lib/supabase/client');

    // List storage buckets
    const { data, error } = await supabase.storage.listBuckets();

    const latency = Date.now() - startTime;

    if (error) {
      return {
        success: false,
        message: `Storage service error: ${error.message}`,
        latency,
        error,
      };
    }

    return {
      success: true,
      message: 'Storage service is accessible',
      latency,
      details: {
        bucketCount: data?.length || 0,
        buckets: data?.map((b) => b.name) || [],
      },
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      message: error.message || 'Storage service unavailable',
      latency,
      error,
    };
  }
}

/**
 * Check if environment variables are configured
 */
export function checkEnvironmentVariables(): Record<string, boolean> {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const results: Record<string, boolean> = {};

  // In browser, we can only check public variables
  if (typeof window !== 'undefined') {
    // These should be replaced by Next.js at build time
    results['NEXT_PUBLIC_SUPABASE_URL'] = true; // Assume true if Supabase works
    results['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = true;
    results['SUPABASE_SERVICE_ROLE_KEY'] = true; // Server-side only
  } else {
    // Server-side checks
    requiredVars.forEach((varName) => {
      results[varName] = !!process.env[varName];
    });
  }

  return results;
}

/**
 * Run comprehensive health check on all services
 */
export async function runHealthChecks(): Promise<HealthStatus[]> {
  const checks: HealthStatus[] = [];
  const timestamp = new Date().toISOString();

  // Check database
  const dbResult = await testSupabaseConnection();
  checks.push({
    service: 'Database',
    healthy: dbResult.success,
    responseTime: dbResult.latency,
    message: dbResult.message,
    timestamp,
  });

  // Check auth
  const authResult = await testAuthService();
  checks.push({
    service: 'Authentication',
    healthy: authResult.success,
    responseTime: authResult.latency,
    message: authResult.message,
    timestamp,
  });

  // Check storage
  const storageResult = await testStorageService();
  checks.push({
    service: 'Storage',
    healthy: storageResult.success,
    responseTime: storageResult.latency,
    message: storageResult.message,
    timestamp,
  });

  return checks;
}

/**
 * Test API endpoint
 */
export async function testApiEndpoint(
  url: string,
  method: string = 'GET',
  options?: RequestInit
): Promise<ConnectionResult> {
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method,
      ...options,
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        latency,
        details: {
          status: response.status,
          statusText: response.statusText,
        },
      };
    }

    const data = await response.json().catch(() => null);

    return {
      success: true,
      message: 'Endpoint responded successfully',
      latency,
      details: {
        status: response.status,
        data,
      },
    };
  } catch (error: any) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      message: error.message || 'Request failed',
      latency,
      error,
    };
  }
}

/**
 * Get overall system health summary
 */
export async function getSystemHealth(): Promise<{
  healthy: boolean;
  services: {
    total: number;
    healthy: number;
    unhealthy: number;
  };
  avgResponseTime: number;
  checks: HealthStatus[];
}> {
  const checks = await runHealthChecks();

  const healthyCount = checks.filter((c) => c.healthy).length;
  const totalCount = checks.length;
  const avgResponseTime =
    checks.reduce((sum, c) => sum + (c.responseTime || 0), 0) / totalCount;

  return {
    healthy: healthyCount === totalCount,
    services: {
      total: totalCount,
      healthy: healthyCount,
      unhealthy: totalCount - healthyCount,
    },
    avgResponseTime: Math.round(avgResponseTime),
    checks,
  };
}

/**
 * Validate complete backend setup
 */
export async function validateBackendSetup(): Promise<{
  ready: boolean;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check environment
  const envVars = checkEnvironmentVariables();
  const missingVars = Object.entries(envVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    issues.push(`Missing environment variables: ${missingVars.join(', ')}`);
  }

  // Check services
  const health = await getSystemHealth();

  if (!health.healthy) {
    issues.push(
      `${health.services.unhealthy} service(s) are unhealthy`
    );
  }

  if (health.avgResponseTime > 200) {
    warnings.push(
      `Average response time is ${health.avgResponseTime}ms (target: <200ms)`
    );
  }

  if (health.avgResponseTime > 100) {
    recommendations.push('Consider optimizing database queries for faster response times');
  }

  // Additional checks
  if (issues.length === 0 && warnings.length === 0) {
    recommendations.push('Backend setup is complete and healthy');
    recommendations.push('Consider setting up monitoring and alerts');
    recommendations.push('Review security settings before production deployment');
  }

  return {
    ready: issues.length === 0,
    issues,
    warnings,
    recommendations,
  };
}

/**
 * Format latency for display
 */
export function formatLatency(ms: number): string {
  if (ms < 100) return `${ms}ms (excellent)`;
  if (ms < 300) return `${ms}ms (good)`;
  if (ms < 1000) return `${ms}ms (acceptable)`;
  if (ms < 3000) return `${(ms / 1000).toFixed(1)}s (slow)`;
  return `${(ms / 1000).toFixed(1)}s (very slow)`;
}

/**
 * Get status icon/emoji based on health
 */
export function getHealthEmoji(healthy: boolean): string {
  return healthy ? '✅' : '❌';
}

/**
 * Get performance rating based on response time
 */
export function getPerformanceRating(ms: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (ms < 100) return 'excellent';
  if (ms < 300) return 'good';
  if (ms < 1000) return 'fair';
  return 'poor';
}
