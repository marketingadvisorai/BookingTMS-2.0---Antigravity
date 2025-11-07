/**
 * Supabase Configuration
 * 
 * Configuration for Supabase client (backend/server-side)
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

/**
 * Server-side Supabase client with service role key
 * 
 * IMPORTANT: This bypasses Row-Level Security (RLS)
 * Only use this for server-side operations that need admin access
 * Never expose the service role key to the client
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Create a client-scoped Supabase instance
 * This respects RLS policies using the provided access token
 */
export const createClientScopedSupabase = (accessToken: string) => {
  if (!supabaseUrl) {
    throw new Error('Missing Supabase URL');
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createClient<Database>(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

/**
 * Verify user token and return user ID
 */
export async function verifyToken(token: string): Promise<string | null> {
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user.id;
}

/**
 * Get user by ID with full profile
 */
export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Check if user has permission
 */
export async function checkPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const user = await getUserById(userId);

  if (!user) {
    return false;
  }

  // Super admin has all permissions
  if (user.role === 'super-admin') {
    return true;
  }

  // Define role permissions
  const rolePermissions: Record<string, string[]> = {
    'admin': [
      'bookings.*',
      'games.*',
      'customers.*',
      'payments.*',
      'reports.*',
      'settings.view',
    ],
    'manager': [
      'bookings.view',
      'bookings.edit',
      'games.view',
      'customers.view',
      'payments.view',
      'reports.view',
    ],
    'staff': [
      'bookings.view',
      'games.view',
      'customers.view',
    ],
  };

  const permissions = rolePermissions[user.role] || [];

  // Check exact match
  if (permissions.includes(permission)) {
    return true;
  }

  // Check wildcard (e.g., 'bookings.*' matches 'bookings.create')
  const parts = permission.split('.');
  if (parts.length === 2) {
    const wildcardPermission = `${parts[0]}.*`;
    if (permissions.includes(wildcardPermission)) {
      return true;
    }
  }

  return false;
}

export default supabase;
