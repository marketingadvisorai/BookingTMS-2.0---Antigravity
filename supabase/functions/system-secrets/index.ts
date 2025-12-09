/**
 * System Secrets Edge Function
 * SECURITY: Only accessible by system-admin role
 * 
 * Operations:
 * - GET /system-secrets - List all secrets (masked)
 * - GET /system-secrets/:key - Get specific secret status (masked)
 * - POST /system-secrets - Set/update a secret
 * - DELETE /system-secrets/:key - Delete a secret
 * - POST /system-secrets/validate - Validate a secret (test API key)
 * 
 * @module supabase/functions/system-secrets
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// ============================================================================
// Types
// ============================================================================

interface SecretRequest {
  action: 'list' | 'get' | 'set' | 'delete' | 'validate';
  secretKey?: string;
  secretValue?: string;
  category?: string;
  description?: string;
}

interface SecretResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Verify user is system-admin
 */
async function verifySystemAdmin(
  supabase: any,
  userId: string
): Promise<{ isAdmin: boolean; error?: string }> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !profile) {
    return { isAdmin: false, error: 'User profile not found' };
  }

  if (profile.role !== 'system-admin') {
    return { isAdmin: false, error: 'Access denied: system-admin role required' };
  }

  return { isAdmin: true };
}

/**
 * Log secret access for audit trail
 */
async function logSecretAccess(
  supabase: any,
  secretKey: string,
  action: string,
  userId: string,
  request: Request,
  success: boolean,
  errorMessage?: string
): Promise<void> {
  try {
    await supabase.from('secret_access_logs').insert({
      secret_key: secretKey,
      action,
      performed_by: userId,
      ip_address: request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown',
      user_agent: request.headers.get('user-agent'),
      success,
      error_message: errorMessage,
    });
  } catch (err) {
    console.error('[system-secrets] Failed to log access:', err);
  }
}

/**
 * Encrypt secret value (simple encoding - in production use proper encryption)
 * Note: Supabase Edge Functions have access to Deno crypto
 */
async function encryptSecret(value: string): Promise<string> {
  // In production, use proper encryption with a key from env
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Store both hash (for validation) and base64 encoded value
  // In production, use proper AES encryption
  const base64Value = btoa(value);
  return base64Value;
}

/**
 * Decrypt secret value
 */
function decryptSecret(encryptedValue: string): string {
  try {
    return atob(encryptedValue);
  } catch {
    return '';
  }
}

/**
 * Mask secret for display
 */
function maskSecret(value: string): string {
  if (!value || value.length < 8) return '••••••••';
  return '••••••••' + value.slice(-4);
}

// ============================================================================
// Secret Validators
// ============================================================================

/**
 * Validate OpenAI API key
 */
async function validateOpenAI(apiKey: string): Promise<{ valid: boolean; message: string }> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    
    if (response.ok) {
      return { valid: true, message: 'OpenAI API key is valid' };
    }
    return { valid: false, message: `OpenAI validation failed: ${response.status}` };
  } catch (err) {
    return { valid: false, message: `OpenAI validation error: ${err.message}` };
  }
}

/**
 * Validate Stripe API key
 */
async function validateStripe(apiKey: string): Promise<{ valid: boolean; message: string }> {
  try {
    const response = await fetch('https://api.stripe.com/v1/balance', {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    
    if (response.ok) {
      return { valid: true, message: 'Stripe API key is valid' };
    }
    return { valid: false, message: `Stripe validation failed: ${response.status}` };
  } catch (err) {
    return { valid: false, message: `Stripe validation error: ${err.message}` };
  }
}

/**
 * Validate a secret based on its type
 */
async function validateSecret(
  secretKey: string,
  secretValue: string
): Promise<{ valid: boolean; message: string }> {
  switch (secretKey) {
    case 'OPENAI_API_KEY':
      return validateOpenAI(secretValue);
    case 'STRIPE_SECRET_KEY':
      return validateStripe(secretValue);
    case 'STRIPE_PUBLISHABLE_KEY':
      // Publishable keys just need to start with pk_
      return {
        valid: secretValue.startsWith('pk_'),
        message: secretValue.startsWith('pk_') 
          ? 'Stripe publishable key format is valid' 
          : 'Invalid format: should start with pk_'
      };
    default:
      // For unknown keys, just check it's not empty
      return {
        valid: secretValue.length > 0,
        message: secretValue.length > 0 ? 'Value provided' : 'Empty value'
      };
  }
}

// ============================================================================
// Main Handler
// ============================================================================

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Admin client (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Verify system-admin role
    const { isAdmin, error: adminError } = await verifySystemAdmin(supabaseAdmin, user.id);
    if (!isAdmin) {
      await logSecretAccess(supabaseAdmin, 'SYSTEM', 'access_denied', user.id, req, false, adminError);
      return new Response(
        JSON.stringify({ success: false, error: adminError || 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request
    const body: SecretRequest = await req.json();
    const { action, secretKey, secretValue, category, description } = body;

    let response: SecretResponse;

    switch (action) {
      case 'list': {
        // List all secrets (masked)
        const { data, error } = await supabaseAdmin
          .from('system_secrets')
          .select('secret_key, secret_category, description, is_configured, is_required, validation_status, updated_at')
          .order('secret_category')
          .order('secret_key');

        if (error) throw error;

        await logSecretAccess(supabaseAdmin, 'ALL', 'list', user.id, req, true);
        response = { success: true, data };
        break;
      }

      case 'get': {
        if (!secretKey) throw new Error('secretKey required');

        const { data, error } = await supabaseAdmin
          .from('system_secrets')
          .select('*')
          .eq('secret_key', secretKey)
          .single();

        if (error) throw error;

        // Mask the value before returning
        const maskedData = {
          ...data,
          masked_value: data.encrypted_value ? maskSecret(decryptSecret(data.encrypted_value)) : null,
          encrypted_value: undefined, // Never return actual encrypted value
        };

        await logSecretAccess(supabaseAdmin, secretKey, 'get', user.id, req, true);
        response = { success: true, data: maskedData };
        break;
      }

      case 'set': {
        if (!secretKey || !secretValue) throw new Error('secretKey and secretValue required');

        const encryptedValue = await encryptSecret(secretValue);

        const { data, error } = await supabaseAdmin
          .from('system_secrets')
          .upsert({
            secret_key: secretKey,
            secret_category: category || 'general',
            description: description,
            encrypted_value: encryptedValue,
            is_configured: true,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'secret_key',
          })
          .select()
          .single();

        if (error) throw error;

        await logSecretAccess(supabaseAdmin, secretKey, 'set', user.id, req, true);
        response = { 
          success: true, 
          data: { 
            secret_key: secretKey, 
            masked_value: maskSecret(secretValue),
            is_configured: true 
          } 
        };
        break;
      }

      case 'delete': {
        if (!secretKey) throw new Error('secretKey required');

        // Don't delete, just clear the value
        const { error } = await supabaseAdmin
          .from('system_secrets')
          .update({
            encrypted_value: '',
            is_configured: false,
            validation_status: 'unknown',
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('secret_key', secretKey);

        if (error) throw error;

        await logSecretAccess(supabaseAdmin, secretKey, 'delete', user.id, req, true);
        response = { success: true, data: { secret_key: secretKey, cleared: true } };
        break;
      }

      case 'validate': {
        if (!secretKey) throw new Error('secretKey required');

        // Get the secret value
        const { data: secretData, error: fetchError } = await supabaseAdmin
          .from('system_secrets')
          .select('encrypted_value')
          .eq('secret_key', secretKey)
          .single();

        if (fetchError || !secretData?.encrypted_value) {
          throw new Error('Secret not found or not configured');
        }

        const decryptedValue = decryptSecret(secretData.encrypted_value);
        const validation = await validateSecret(secretKey, decryptedValue);

        // Update validation status
        await supabaseAdmin
          .from('system_secrets')
          .update({
            validation_status: validation.valid ? 'valid' : 'invalid',
            last_validated_at: new Date().toISOString(),
          })
          .eq('secret_key', secretKey);

        await logSecretAccess(supabaseAdmin, secretKey, 'validate', user.id, req, validation.valid, validation.message);
        response = { success: true, data: validation };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(
      JSON.stringify(response),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[system-secrets] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
