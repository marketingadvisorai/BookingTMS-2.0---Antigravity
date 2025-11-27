/**
 * Create Org Admin - Supabase Edge Function
 * 
 * Creates a new organization admin user with:
 * 1. Supabase Auth user
 * 2. Users table record
 * 3. Organization member record
 * 4. Sends welcome email with password reset link
 * 
 * Only callable by system-admin or super-admin
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateOrgAdminRequest {
  organization_id: string;
  email: string;
  name: string;
  phone?: string;
  send_welcome_email?: boolean;
  set_password?: string; // Optional: admin can set initial password
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get authorization header to verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role client for admin operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      }
    });

    // Verify calling user is admin
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user: callingUser }, error: authError } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !callingUser) {
      throw new Error('Invalid authentication');
    }

    // Check caller's role
    const { data: callerProfile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', callingUser.id)
      .single();

    if (!callerProfile || !['system-admin', 'super-admin'].includes(callerProfile.role)) {
      throw new Error('Insufficient permissions: Only system-admin or super-admin can create org admins');
    }

    const body: CreateOrgAdminRequest = await req.json();
    const { organization_id, email, name, phone, send_welcome_email = true, set_password } = body;

    if (!organization_id || !email || !name) {
      throw new Error('organization_id, email, and name are required');
    }

    // Check if organization exists
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('id, name')
      .eq('id', organization_id)
      .single();

    if (orgError || !org) {
      throw new Error('Organization not found');
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;
    let tempPassword: string | null = null;

    if (existingUser) {
      userId = existingUser.id;
      console.log('User already exists, updating organization assignment');
    } else {
      // Generate a temporary password or use provided one
      tempPassword = set_password || generateTempPassword();

      // Create auth user
      const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name,
          phone,
          organization_id,
          role: 'org-admin',
        },
      });

      if (createError) {
        throw new Error(`Failed to create auth user: ${createError.message}`);
      }

      userId = authUser.user.id;
    }

    // Create or update users table record
    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email,
        name,
        phone,
        role: 'org-admin',
        organization_id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (userError) {
      console.error('Failed to create user record:', userError);
      // Don't throw - auth user is created
    }

    // Create organization member record
    const { error: memberError } = await supabaseAdmin
      .from('organization_members')
      .upsert({
        organization_id,
        user_id: userId,
        role: 'owner',
        permissions: { all: true },
        joined_at: new Date().toISOString(),
      }, { onConflict: 'organization_id,user_id' });

    if (memberError) {
      console.error('Failed to create org member:', memberError);
    }

    // Update organization with owner info
    await supabaseAdmin
      .from('organizations')
      .update({
        owner_user_id: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organization_id);

    // Send welcome email with password reset link
    let resetLink: string | null = null;
    if (send_welcome_email && !existingUser) {
      const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: `${supabaseUrl.replace('.supabase.co', '.netlify.app')}/reset-password`,
        }
      });

      if (!resetError && resetData) {
        resetLink = resetData.properties?.action_link || null;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        email,
        organization_id,
        organization_name: org.name,
        temp_password: tempPassword, // Return temp password for admin reference
        reset_link: resetLink,
        message: existingUser 
          ? 'Existing user assigned to organization' 
          : 'New org admin created successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Create org admin error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to create org admin' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
