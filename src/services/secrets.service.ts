/**
 * Secure Secrets Service
 * SECURITY: Communicates with Edge Function for secret management
 * Never stores secrets on the frontend
 * 
 * @module services/secrets
 */

import { supabase } from '@/lib/supabase/client';

// ============================================================================
// Types
// ============================================================================

export interface SecretInfo {
  secret_key: string;
  secret_category: string;
  description: string;
  is_configured: boolean;
  is_required: boolean;
  validation_status: 'valid' | 'invalid' | 'unknown';
  masked_value?: string;
  updated_at: string;
}

export interface SecretValidation {
  valid: boolean;
  message: string;
}

export interface SecretsServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * List all secrets (returns masked values only)
 * SECURITY: Only system-admin can access
 */
export async function listSecrets(
  category?: string
): Promise<SecretsServiceResponse<SecretInfo[]>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await supabase.functions.invoke('system-secrets', {
      body: { action: 'list', category },
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    return response.data as SecretsServiceResponse<SecretInfo[]>;
  } catch (error: any) {
    console.error('[secrets.service] listSecrets error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a specific secret info (masked)
 * SECURITY: Only system-admin can access
 */
export async function getSecret(
  secretKey: string
): Promise<SecretsServiceResponse<SecretInfo>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await supabase.functions.invoke('system-secrets', {
      body: { action: 'get', secretKey },
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    return response.data as SecretsServiceResponse<SecretInfo>;
  } catch (error: any) {
    console.error('[secrets.service] getSecret error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Set a secret value
 * SECURITY: Only system-admin can access. Value is encrypted server-side.
 */
export async function setSecret(
  secretKey: string,
  secretValue: string,
  category?: string,
  description?: string
): Promise<SecretsServiceResponse<{ secret_key: string; masked_value: string }>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await supabase.functions.invoke('system-secrets', {
      body: { action: 'set', secretKey, secretValue, category, description },
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    return response.data as SecretsServiceResponse<{ secret_key: string; masked_value: string }>;
  } catch (error: any) {
    console.error('[secrets.service] setSecret error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete/clear a secret
 * SECURITY: Only system-admin can access
 */
export async function deleteSecret(
  secretKey: string
): Promise<SecretsServiceResponse<{ secret_key: string; cleared: boolean }>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await supabase.functions.invoke('system-secrets', {
      body: { action: 'delete', secretKey },
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    return response.data as SecretsServiceResponse<{ secret_key: string; cleared: boolean }>;
  } catch (error: any) {
    console.error('[secrets.service] deleteSecret error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Validate a secret (test API key)
 * SECURITY: Only system-admin can access
 */
export async function validateSecret(
  secretKey: string
): Promise<SecretsServiceResponse<SecretValidation>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      return { success: false, error: 'Not authenticated' };
    }

    const response = await supabase.functions.invoke('system-secrets', {
      body: { action: 'validate', secretKey },
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    return response.data as SecretsServiceResponse<SecretValidation>;
  } catch (error: any) {
    console.error('[secrets.service] validateSecret error:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// Secret Categories
// ============================================================================

export const SECRET_CATEGORIES = {
  stripe: {
    name: 'Stripe',
    description: 'Payment processing secrets',
    secrets: ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOK_SECRET'],
  },
  llm: {
    name: 'LLM Providers',
    description: 'AI/LLM API keys',
    secrets: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GOOGLE_AI_API_KEY'],
  },
  email: {
    name: 'Email',
    description: 'Email service API keys',
    secrets: ['SENDGRID_API_KEY'],
  },
  sms: {
    name: 'SMS',
    description: 'SMS service credentials',
    secrets: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'],
  },
} as const;
