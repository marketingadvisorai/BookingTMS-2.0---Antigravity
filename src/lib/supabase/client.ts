/**
 * Supabase Client Configuration
 * 
 * This file provides client-side Supabase instances for:
 * - Browser usage (with auth context)
 * - Server-side usage (with service role)
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// Get Supabase configuration
// First try Vite environment variables, then Next.js env vars, then fall back to info.tsx
const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  `https://${projectId}.supabase.co`;

const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  publicAnonKey;

/**
 * Browser Client
 * Use this in client components and pages
 * Automatically handles auth state
 */
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

/**
 * Create an authenticated Supabase client
 * Use this when you need to make authenticated requests
 */
export const createAuthenticatedClient = (accessToken: string) => {
  return createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
};

/**
 * Server Client (Service Role)
 * Use this ONLY on the server side for admin operations
 * NEVER expose service role key to the client
 */
export const createServiceRoleClient = () => {
  const serviceRoleKey = (typeof process !== 'undefined' && process.env)
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : undefined;

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY. This should only be used server-side.'
    );
  }

  return createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
};

/**
 * Get current session
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  return session;
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
};

/**
 * Sign out
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Helper function to handle Supabase errors
 */
export const handleSupabaseError = (error: any) => {
  if (error?.code === 'PGRST116') {
    return 'No data found';
  }
  if (error?.code === '23505') {
    return 'A record with this information already exists';
  }
  if (error?.code === '23503') {
    return 'Related record not found';
  }
  if (error?.code === '42501') {
    return 'You do not have permission to perform this action';
  }

  return error?.message || 'An unexpected error occurred';
};

export default supabase;
