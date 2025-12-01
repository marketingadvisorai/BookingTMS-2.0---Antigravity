/**
 * API Key Authentication Module
 * 
 * Shared module for validating API keys in edge functions.
 * Supports scoped permissions, rate limiting, and usage logging.
 * 
 * @module _shared/apiKeyAuth
 * @version 1.0.0
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============================================================================
// Types
// ============================================================================

export type ApiKeyScope =
  | 'read:bookings'
  | 'write:bookings'
  | 'read:customers'
  | 'write:customers'
  | 'read:activities'
  | 'write:activities'
  | 'read:venues'
  | 'write:venues'
  | 'read:analytics'
  | 'write:settings'
  | 'admin:full';

export interface ApiKeyValidationResult {
  valid: boolean;
  organizationId: string | null;
  keyId: string | null;
  errorMessage: string | null;
  scopes: ApiKeyScope[];
}

export interface ApiKeyAuthConfig {
  requiredScope?: ApiKeyScope;
  endpoint?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a SHA-256 hash of a string
 */
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Get client IP from request headers
 */
function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

// ============================================================================
// Main Authentication Function
// ============================================================================

/**
 * Validate an API key from request headers
 * 
 * Extracts API key from Authorization header (Bearer token format)
 * or X-API-Key header and validates it against the database.
 * 
 * @param request - The incoming HTTP request
 * @param config - Optional configuration for validation
 * @returns Validation result with organization context
 */
export async function validateApiKey(
  request: Request,
  config: ApiKeyAuthConfig = {}
): Promise<ApiKeyValidationResult> {
  // Extract API key from headers
  const authHeader = request.headers.get('authorization');
  const apiKeyHeader = request.headers.get('x-api-key');
  
  let apiKey: string | null = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    apiKey = authHeader.substring(7);
  } else if (apiKeyHeader) {
    apiKey = apiKeyHeader;
  }
  
  if (!apiKey) {
    return {
      valid: false,
      organizationId: null,
      keyId: null,
      errorMessage: 'API key required. Provide via Authorization header (Bearer) or X-API-Key header.',
      scopes: [],
    };
  }
  
  // Check key format
  if (!apiKey.startsWith('bk_')) {
    return {
      valid: false,
      organizationId: null,
      keyId: null,
      errorMessage: 'Invalid API key format',
      scopes: [],
    };
  }
  
  // Create Supabase admin client
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  try {
    // Hash the key for comparison
    const keyHash = await hashKey(apiKey);
    
    // Look up the key
    const { data: keyRecord, error: lookupError } = await supabase
      .from('api_keys')
      .select('*')
      .eq('key_hash', keyHash)
      .single();
    
    if (lookupError || !keyRecord) {
      return {
        valid: false,
        organizationId: null,
        keyId: null,
        errorMessage: 'Invalid API key',
        scopes: [],
      };
    }
    
    // Check if revoked
    if (keyRecord.revoked_at) {
      return {
        valid: false,
        organizationId: keyRecord.organization_id,
        keyId: keyRecord.id,
        errorMessage: 'API key has been revoked',
        scopes: [],
      };
    }
    
    // Check if expired
    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      return {
        valid: false,
        organizationId: keyRecord.organization_id,
        keyId: keyRecord.id,
        errorMessage: 'API key has expired',
        scopes: [],
      };
    }
    
    // Check IP restriction
    const clientIP = getClientIP(request);
    if (keyRecord.allowed_ips && keyRecord.allowed_ips.length > 0) {
      if (!keyRecord.allowed_ips.includes(clientIP)) {
        return {
          valid: false,
          organizationId: keyRecord.organization_id,
          keyId: keyRecord.id,
          errorMessage: 'IP address not allowed',
          scopes: [],
        };
      }
    }
    
    // Check origin restriction
    const origin = request.headers.get('origin');
    if (keyRecord.allowed_origins && keyRecord.allowed_origins.length > 0 && origin) {
      if (!keyRecord.allowed_origins.includes(origin)) {
        return {
          valid: false,
          organizationId: keyRecord.organization_id,
          keyId: keyRecord.id,
          errorMessage: 'Origin not allowed',
          scopes: [],
        };
      }
    }
    
    // Check scope requirement
    const scopes = keyRecord.scopes as ApiKeyScope[];
    if (config.requiredScope) {
      const hasScope = scopes.includes(config.requiredScope) || scopes.includes('admin:full');
      if (!hasScope) {
        return {
          valid: false,
          organizationId: keyRecord.organization_id,
          keyId: keyRecord.id,
          errorMessage: `Insufficient permissions. Required scope: ${config.requiredScope}`,
          scopes,
        };
      }
    }
    
    // Update last used timestamp
    await supabase
      .from('api_keys')
      .update({
        last_used_at: new Date().toISOString(),
        last_used_ip: clientIP,
        usage_count: (keyRecord.usage_count || 0) + 1,
      })
      .eq('id', keyRecord.id);
    
    // Log usage if endpoint provided
    if (config.endpoint) {
      await supabase.from('api_key_usage_logs').insert({
        api_key_id: keyRecord.id,
        endpoint: config.endpoint,
        method: request.method,
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent'),
        origin: origin,
        status_code: 200,
        response_time_ms: 0, // Will be updated by caller if needed
      });
    }
    
    return {
      valid: true,
      organizationId: keyRecord.organization_id,
      keyId: keyRecord.id,
      errorMessage: null,
      scopes,
    };
  } catch (error) {
    console.error('[ApiKeyAuth] Validation error:', error);
    return {
      valid: false,
      organizationId: null,
      keyId: null,
      errorMessage: 'Internal error validating API key',
      scopes: [],
    };
  }
}

/**
 * Middleware-style wrapper for API key authentication
 * 
 * Returns an error response if validation fails,
 * or null if validation succeeds.
 */
export async function requireApiKey(
  request: Request,
  config: ApiKeyAuthConfig = {}
): Promise<Response | null> {
  const result = await validateApiKey(request, config);
  
  if (!result.valid) {
    return new Response(
      JSON.stringify({
        error: result.errorMessage,
        code: 'INVALID_API_KEY',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer realm="api"',
        },
      }
    );
  }
  
  return null;
}

/**
 * Log API request completion with response time
 */
export async function logApiRequestCompletion(
  keyId: string,
  endpoint: string,
  method: string,
  statusCode: number,
  responseTimeMs: number,
  request: Request,
  errorMessage?: string
): Promise<void> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  await supabase.from('api_key_usage_logs').insert({
    api_key_id: keyId,
    endpoint,
    method,
    status_code: statusCode,
    response_time_ms: responseTimeMs,
    ip_address: getClientIP(request),
    user_agent: request.headers.get('user-agent'),
    origin: request.headers.get('origin'),
    error_message: errorMessage,
  });
}
