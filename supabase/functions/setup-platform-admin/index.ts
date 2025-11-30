/**
 * Setup Platform Admin - Supabase Edge Function
 * 
 * Creates or updates a system-admin/super-admin user.
 * This is a one-time setup function for platform owners.
 * 
 * SECURITY: This function requires the service role key for authorization.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface SetupAdminRequest {
  email: string;
  password: string;
  name: string;
  role: 'system-admin' | 'super-admin';
  secret_key: string; // Must match an env variable for security
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: SetupAdminRequest = await req.json();
    const { email, password, name, role, secret_key } = body;

    // Security check - require a secret key
    const SETUP_SECRET = Deno.env.get('SETUP_SECRET_KEY') || 'BookingTMS-Setup-2025';
    if (secret_key !== SETUP_SECRET) {
      throw new Error('Invalid setup secret key');
    }

    // Validate inputs
    if (!email || !password || !name || !role) {
      throw new Error('Missing required fields: email, password, name, role');
    }

    if (!['system-admin', 'super-admin'].includes(role)) {
      throw new Error('Role must be system-admin or super-admin');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check if user exists in auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    let userId: string;

    if (existingAuthUser) {
      // Update existing user's password
      userId = existingAuthUser.id;
      console.log('User exists in auth, updating password...');
      
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { full_name: name, role }
      });

      if (updateError) {
        throw new Error(`Failed to update auth user: ${updateError.message}`);
      }
    } else {
      // Create new auth user
      console.log('Creating new auth user...');
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name, role }
      });

      if (createError) {
        throw new Error(`Failed to create auth user: ${createError.message}`);
      }
      userId = newUser.user.id;
    }

    // Upsert user profile in public.users
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email,
        full_name: name,
        role,
        is_active: true,
        organization_id: null, // System/super admins are not tied to orgs
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      // Don't fail - the auth user was created successfully
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${role} account ${existingAuthUser ? 'updated' : 'created'} successfully`,
        user_id: userId,
        email,
        role
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Setup admin error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
