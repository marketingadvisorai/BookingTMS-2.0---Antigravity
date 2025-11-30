/**
 * Create Org Admin - Supabase Edge Function
 * 
 * Creates a new organization admin user and sends a welcome email via Resend.
 * 
 * Features:
 * - Creates Supabase Auth user
 * - Creates user profile in public.users
 * - Adds user to organization_members
 * - Sends welcome email with password reset link using Resend
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface CreateOrgAdminRequest {
  organization_id: string;
  email: string;
  name: string;
  phone?: string;
  send_welcome_email?: boolean;
  set_password?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Verify Admin Permissions
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Check if called with service role key (bypass user auth check)
    const isServiceRole = token === SUPABASE_SERVICE_ROLE_KEY;
    
    if (!isServiceRole) {
      // Verify user token
      const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !caller) {
        throw new Error('Invalid authentication');
      }

      // Check caller role
      const { data: callerProfile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', caller.id)
        .single();

      if (!callerProfile || !['system-admin', 'super-admin'].includes(callerProfile.role)) {
        throw new Error('Insufficient permissions');
      }
    }
    // If service role, we trust it completely

    // 2. Parse Request
    const body: CreateOrgAdminRequest = await req.json();
    const { organization_id, email, name, phone, send_welcome_email = true, set_password } = body;

    if (!organization_id || !email || !name) {
      throw new Error('Missing required fields: organization_id, email, name');
    }

    // 3. Get Organization Details
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('name')
      .eq('id', organization_id)
      .single();

    if (!org) throw new Error('Organization not found');

    // 4. Create/Get User
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;
    let tempPassword = set_password || generateTempPassword();
    let resetLink: string | null = null;

    if (existingUser) {
      userId = existingUser.id;
      console.log('User exists, updating roles...');
    } else {
      // Create new user with proper metadata for trigger
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { 
          full_name: name, 
          role: 'org-admin', 
          organization_id: organization_id 
        }
      });

      if (createError) throw createError;
      userId = newUser.user.id;

      // Generate reset link for welcome email
      // Use origin from request or fallback to production URL
      const origin = req.headers.get('origin') || 'https://app.bookingtms.com';
      
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: `${origin}/reset-password`
        }
      });
      resetLink = linkData?.properties?.action_link || null;
    }

    // 5. Update Database Records
    // Update public.users (only use columns that exist in the table)
    await supabaseAdmin.from('users').upsert({
      id: userId,
      email,
      full_name: name,
      role: 'org-admin',
      organization_id,
      is_active: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    // Add to organization_members
    await supabaseAdmin.from('organization_members').upsert({
      organization_id,
      user_id: userId,
      role: 'owner',
      permissions: { all: true },
      joined_at: new Date().toISOString()
    }, { onConflict: 'organization_id,user_id' });

    // Set as organization owner
    await supabaseAdmin.from('organizations')
      .update({ owner_user_id: userId })
      .eq('id', organization_id);

    // 6. Send Welcome Email
    if (send_welcome_email && !existingUser && RESEND_API_KEY) {
      await sendWelcomeEmail({
        to: email,
        name,
        orgName: org.name,
        resetLink: resetLink || '#', // Fallback if link generation failed
        tempPassword
      });
    } else if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping email');
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        temp_password: tempPassword,
        reset_link: resetLink
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Create org admin error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
  return password;
}

async function sendWelcomeEmail(params: { to: string; name: string; orgName: string; resetLink: string; tempPassword: string }) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .credentials { background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to BookingFlow AI</h1>
        </div>
        <div class="content">
          <p>Hello ${params.name},</p>
          <p>Your organization account for <strong>${params.orgName}</strong> has been successfully created.</p>
          
          <p>You have been assigned as the <strong>Organization Owner</strong>. You can now access your dashboard to manage bookings, activities, and settings.</p>

          <div class="credentials">
            <p><strong>Your Temporary Credentials:</strong></p>
            <p>Email: ${params.to}</p>
            <p>Password: ${params.tempPassword}</p>
          </div>

          <p>We strongly recommend setting a new password immediately:</p>
          
          <center>
            <a href="${params.resetLink}" class="button">Set New Password</a>
          </center>

          <p>If the button doesn't work, copy this link:</p>
          <p style="word-break: break-all; color: #4f46e5;">${params.resetLink}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} BookingFlow AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'BookingFlow AI <onboarding@resend.dev>',
      to: params.to,
      subject: `Welcome to BookingFlow AI - ${params.orgName}`,
      html
    })
  });
}
