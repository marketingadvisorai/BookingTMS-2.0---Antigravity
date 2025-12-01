/**
 * API Key Service
 * 
 * Manages API keys for organization integrations with scoping support.
 * Provides CRUD operations, validation, and usage statistics.
 * 
 * @module services/apiKey.service
 * @version 1.0.0
 */

import { supabase } from '@/lib/supabase';

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

export type ApiKeyEnvironment = 'production' | 'test' | 'development';

export interface ApiKey {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  key_prefix: string;
  scopes: ApiKeyScope[];
  environment: ApiKeyEnvironment;
  rate_limit_per_minute: number;
  rate_limit_per_hour: number;
  allowed_ips: string[] | null;
  allowed_origins: string[] | null;
  allowed_endpoints: string[] | null;
  expires_at: string | null;
  last_used_at: string | null;
  last_used_ip: string | null;
  usage_count: number;
  created_by: string | null;
  revoked_at: string | null;
  revoked_by: string | null;
  revoke_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
  scopes: ApiKeyScope[];
  environment?: ApiKeyEnvironment;
  rate_limit_per_minute?: number;
  expires_in_days?: number;
  allowed_ips?: string[];
  allowed_origins?: string[];
}

export interface CreateApiKeyResponse {
  api_key: string;
  key_id: string;
  key_prefix: string;
}

export interface ApiKeyUsageLog {
  id: string;
  api_key_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  ip_address: string | null;
  user_agent: string | null;
  origin: string | null;
  error_message: string | null;
  created_at: string;
}

export interface ApiKeyStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  avg_response_time_ms: number;
  requests_by_endpoint: Record<string, number>;
  requests_by_day: Record<string, number>;
}

// ============================================================================
// Scope Definitions
// ============================================================================

export const API_KEY_SCOPES: Record<ApiKeyScope, { label: string; description: string; category: string }> = {
  'read:bookings': {
    label: 'Read Bookings',
    description: 'View booking information',
    category: 'Bookings',
  },
  'write:bookings': {
    label: 'Write Bookings',
    description: 'Create and modify bookings',
    category: 'Bookings',
  },
  'read:customers': {
    label: 'Read Customers',
    description: 'View customer information',
    category: 'Customers',
  },
  'write:customers': {
    label: 'Write Customers',
    description: 'Create and modify customers',
    category: 'Customers',
  },
  'read:activities': {
    label: 'Read Activities',
    description: 'View activity information',
    category: 'Activities',
  },
  'write:activities': {
    label: 'Write Activities',
    description: 'Create and modify activities',
    category: 'Activities',
  },
  'read:venues': {
    label: 'Read Venues',
    description: 'View venue information',
    category: 'Venues',
  },
  'write:venues': {
    label: 'Write Venues',
    description: 'Create and modify venues',
    category: 'Venues',
  },
  'read:analytics': {
    label: 'Read Analytics',
    description: 'View analytics and reports',
    category: 'Analytics',
  },
  'write:settings': {
    label: 'Write Settings',
    description: 'Modify organization settings',
    category: 'Settings',
  },
  'admin:full': {
    label: 'Full Admin Access',
    description: 'Complete access to all resources',
    category: 'Admin',
  },
};

export const SCOPE_PRESETS = {
  readonly: ['read:bookings', 'read:customers', 'read:activities', 'read:venues', 'read:analytics'] as ApiKeyScope[],
  booking_management: ['read:bookings', 'write:bookings', 'read:customers', 'write:customers', 'read:activities'] as ApiKeyScope[],
  full_access: ['admin:full'] as ApiKeyScope[],
};

// ============================================================================
// Service Implementation
// ============================================================================

class ApiKeyService {
  /**
   * List all API keys for an organization
   */
  async listKeys(organizationId: string, includeRevoked = false): Promise<ApiKey[]> {
    let query = supabase
      .from('api_keys')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (!includeRevoked) {
      query = query.is('revoked_at', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[ApiKeyService] Error listing keys:', error);
      throw new Error(`Failed to list API keys: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a single API key by ID
   */
  async getKey(keyId: string): Promise<ApiKey | null> {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('id', keyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[ApiKeyService] Error getting key:', error);
      throw new Error(`Failed to get API key: ${error.message}`);
    }

    return data;
  }

  /**
   * Create a new API key
   */
  async createKey(organizationId: string, request: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('generate_api_key', {
      p_organization_id: organizationId,
      p_name: request.name,
      p_scopes: request.scopes,
      p_environment: request.environment || 'production',
      p_description: request.description || null,
      p_rate_limit_per_minute: request.rate_limit_per_minute || 1000,
      p_expires_in_days: request.expires_in_days || null,
    });

    if (error) {
      console.error('[ApiKeyService] Error creating key:', error);
      throw new Error(`Failed to create API key: ${error.message}`);
    }

    const resultArray = data as { api_key: string; key_id: string; key_prefix: string }[] | null;
    if (!resultArray || resultArray.length === 0) {
      throw new Error('Failed to create API key: No response from database');
    }

    const result = resultArray[0];

    // Update allowed IPs and origins if provided
    if (request.allowed_ips || request.allowed_origins) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('api_keys') as any)
        .update({
          allowed_ips: request.allowed_ips || null,
          allowed_origins: request.allowed_origins || null,
        })
        .eq('id', result.key_id);
    }

    return {
      api_key: result.api_key,
      key_id: result.key_id,
      key_prefix: result.key_prefix,
    };
  }

  /**
   * Update an API key's settings (not the key itself)
   */
  async updateKey(
    keyId: string,
    updates: {
      name?: string;
      description?: string;
      scopes?: ApiKeyScope[];
      rate_limit_per_minute?: number;
      rate_limit_per_hour?: number;
      allowed_ips?: string[] | null;
      allowed_origins?: string[] | null;
      allowed_endpoints?: string[] | null;
      expires_at?: string | null;
    }
  ): Promise<ApiKey> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('api_keys') as any)
      .update(updates)
      .eq('id', keyId)
      .select()
      .single();

    if (error) {
      console.error('[ApiKeyService] Error updating key:', error);
      throw new Error(`Failed to update API key: ${error.message}`);
    }

    return data as ApiKey;
  }

  /**
   * Revoke an API key
   */
  async revokeKey(keyId: string, reason?: string): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('revoke_api_key', {
      p_key_id: keyId,
      p_reason: reason || null,
    });

    if (error) {
      console.error('[ApiKeyService] Error revoking key:', error);
      throw new Error(`Failed to revoke API key: ${error.message}`);
    }

    return data === true;
  }

  /**
   * Get usage statistics for an API key
   */
  async getKeyStats(keyId: string, days = 7): Promise<ApiKeyStats> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('get_api_key_stats', {
      p_key_id: keyId,
      p_days: days,
    });

    if (error) {
      console.error('[ApiKeyService] Error getting stats:', error);
      throw new Error(`Failed to get API key stats: ${error.message}`);
    }

    const resultArray = data as ApiKeyStats[] | null;
    if (!resultArray || resultArray.length === 0) {
      return {
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        avg_response_time_ms: 0,
        requests_by_endpoint: {},
        requests_by_day: {},
      };
    }

    return resultArray[0];
  }

  /**
   * Get usage logs for an API key
   */
  async getUsageLogs(
    keyId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<ApiKeyUsageLog[]> {
    const { limit = 100, offset = 0 } = options;

    const { data, error } = await supabase
      .from('api_key_usage_logs')
      .select('*')
      .eq('api_key_id', keyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('[ApiKeyService] Error getting usage logs:', error);
      throw new Error(`Failed to get usage logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Check if a key has a specific scope
   */
  hasScope(key: ApiKey, requiredScope: ApiKeyScope): boolean {
    if (key.scopes.includes('admin:full')) return true;
    return key.scopes.includes(requiredScope);
  }

  /**
   * Check if a key is valid (not expired, not revoked)
   */
  isKeyValid(key: ApiKey): boolean {
    if (key.revoked_at) return false;
    if (key.expires_at && new Date(key.expires_at) < new Date()) return false;
    return true;
  }

  /**
   * Format key for display (mask sensitive parts)
   */
  formatKeyForDisplay(keyPrefix: string): string {
    return `${keyPrefix}...`;
  }

  /**
   * Get scope categories for grouping in UI
   */
  getScopesByCategory(): Record<string, { scope: ApiKeyScope; label: string; description: string }[]> {
    const categories: Record<string, { scope: ApiKeyScope; label: string; description: string }[]> = {};

    for (const [scope, info] of Object.entries(API_KEY_SCOPES)) {
      if (!categories[info.category]) {
        categories[info.category] = [];
      }
      categories[info.category].push({
        scope: scope as ApiKeyScope,
        label: info.label,
        description: info.description,
      });
    }

    return categories;
  }
}

export const apiKeyService = new ApiKeyService();
export default apiKeyService;
