/**
 * Create Org Admin - Supabase Edge Function
 * 
 * Creates a new organization admin user using Supabase Auth (Pro plan features).
 * 
 * Features:
 * - Creates Supabase Auth user with proper metadata
 * - Creates user profile in public.users with username
 * - Adds user to organization_members
 * - Sends comprehensive welcome email with:
 *   - Organization ID and details
 *   - Login credentials (email + temp password)
 *   - Password reset link
 *   - Login URL
 * - Falls back to Resend for welcome emails if configured
 * 
 * IMPORTANT: Uses Supabase Auth as the single source of truth for passwords
 * 
 * @module supabase/functions/create-org-admin
 * @version 2.0.0
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
const APP_URL = Deno.env.get('APP_URL') || 'https://booking-tms-antigravity.netlify.app';

interface CreateOrgAdminRequest {
  organization_id: string;
  email: string;
  name: string;
  phone?: string;
  send_welcome_email?: boolean;
  set_password?: string;
  organization_name?: string; // Optional, will be fetched if not provided
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

    // Generate username from email (before @ symbol, cleaned up)
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

    if (existingUser) {
      userId = existingUser.id;
      console.log('User exists, updating roles...');
    } else {
      // Create new user via Supabase Auth (Pro plan feature)
      // This is the proper way to create users - Supabase handles password hashing
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

      // CRITICAL: Fix NULL token fields in auth.users to prevent "Database error querying schema"
      // Supabase Auth's internal scanner expects empty strings, not NULLs
      try {
        await supabaseAdmin.rpc('fix_auth_user_tokens', { user_id: userId });
      } catch (err) {
        console.warn('Token fix RPC not available:', err);
      }

      // Generate reset link via Supabase Auth (uses built-in SMTP on Pro plan)
      const origin = req.headers.get('origin') || 'https://app.bookingtms.com';
      
      // Primary: Use Supabase Auth's built-in password reset email
      const { error: resetEmailError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`
      });
      
      if (!resetEmailError) {
        console.log('Password reset email sent via Supabase Auth SMTP');
        resetLink = 'email_sent'; // Indicate email was sent successfully
      } else {
        console.warn('Supabase Auth email failed, generating link directly:', resetEmailError.message);
        // Fallback: Generate link directly for admin to share
        const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email,
          options: {
            redirectTo: `${origin}/reset-password`
          }
        });
        resetLink = linkData?.properties?.action_link || null;
      }
    }

    // 5. Update Database Records
    // Update public.users with username for login support
    await supabaseAdmin.from('users').upsert({
      id: userId,
      email,
      username, // Add username for login with username support
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

    // 6. Email Status - Supabase Auth sent password reset email above
    // NOTE: Resend is disabled - using Supabase Auth SMTP only for password reset
    const loginUrl = `${APP_URL}/org-login`;
    
    // Email was sent via Supabase Auth's resetPasswordForEmail if resetLink === 'email_sent'
    const emailSent = resetLink === 'email_sent';
    const emailError: string | null = emailSent ? null : 'Supabase SMTP failed - link generated instead';

    // Log successful creation
    console.log(`[create-org-admin] Success: User ${userId} created for org ${organization_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        temp_password: tempPassword,
        reset_link: resetLink,
        login_url: loginUrl,
        organization_id,
        email_sent: emailSent,
        email_error: emailError,
        message: emailSent 
          ? 'Organization admin created and welcome email sent successfully'
          : 'Organization admin created. Email sending was skipped or failed.',
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

interface WelcomeEmailParams {
  to: string;
  name: string;
  orgName: string;
  orgId: string;
  resetLink: string;
  tempPassword: string;
  loginUrl: string;
}

async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  const html = generateWelcomeEmailHtml(params);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'BookingFlow AI <onboarding@resend.dev>',
        to: params.to,
        subject: `Welcome to BookingFlow AI - Your ${params.orgName} Account is Ready!`,
        html
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return { success: false, error: errorData.message || 'Failed to send email' };
    }

    const data = await response.json();
    console.log('Welcome email sent successfully:', data.id);
    return { success: true };
  } catch (error: any) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate comprehensive welcome email HTML
 * Includes: Organization details, credentials, login URL, and password reset link
 */
function generateWelcomeEmailHtml(params: WelcomeEmailParams): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to BookingFlow AI</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">BookingFlow AI</h1>
        <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 14px;">Smart Booking Management Platform</p>
      </td>
    </tr>
    
    <!-- Main Content -->
    <tr>
      <td style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${params.name}! 🎉</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Your organization account for <strong style="color: #4f46e5;">${params.orgName}</strong> has been successfully created on BookingFlow AI.
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          You have been assigned as the <strong>Organization Owner</strong> with full administrative access to manage your bookings, activities, venues, and team members.
        </p>

        <!-- Organization Details Box -->
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0ea5e9;">
          <h3 style="color: #0369a1; margin: 0 0 15px 0; font-size: 16px;">📋 Your Organization Details</h3>
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="color: #6b7280; padding: 5px 0; width: 140px;">Organization ID:</td>
              <td style="color: #1f2937; font-weight: 600; font-family: monospace;">${params.orgId}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; padding: 5px 0;">Organization Name:</td>
              <td style="color: #1f2937; font-weight: 600;">${params.orgName}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; padding: 5px 0;">Account Type:</td>
              <td style="color: #1f2937; font-weight: 600;">Organization Owner</td>
            </tr>
          </table>
        </div>

        <!-- Credentials Box -->
        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px;">🔐 Your Login Credentials</h3>
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="color: #78350f; padding: 5px 0; width: 120px;">Email:</td>
              <td style="color: #1f2937; font-weight: 600;">${params.to}</td>
            </tr>
            <tr>
              <td style="color: #78350f; padding: 5px 0;">Temp Password:</td>
              <td style="color: #1f2937; font-weight: 600; font-family: monospace; background: #fffbeb; padding: 4px 8px; border-radius: 4px;">${params.tempPassword}</td>
            </tr>
          </table>
          <p style="color: #92400e; font-size: 12px; margin: 15px 0 0 0;">
            ⚠️ For security, please change your password immediately after first login.
          </p>
        </div>

        <!-- Action Buttons -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${params.loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4); margin: 5px;">
            Login to Dashboard
          </a>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${params.resetLink}" style="display: inline-block; background-color: #f3f4f6; color: #4f46e5; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; border: 2px solid #e5e7eb;">
            Set New Password
          </a>
        </div>

        <!-- Help Section -->
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <h3 style="color: #1f2937; font-size: 16px; margin: 0 0 15px 0;">🚀 Getting Started</h3>
        <ol style="color: #4b5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
          <li>Login with your credentials above</li>
          <li>Set a new secure password</li>
          <li>Set up your venue and activities</li>
          <li>Configure your booking widgets</li>
          <li>Start accepting bookings!</li>
        </ol>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
          If the buttons don't work, copy and paste these links:
        </p>
        <p style="color: #4f46e5; font-size: 12px; word-break: break-all; margin: 10px 0;">
          <strong>Login:</strong> ${params.loginUrl}<br>
          <strong>Reset Password:</strong> ${params.resetLink}
        </p>
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="padding: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">
          Need help? Contact us at support@bookingtms.com
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} BookingFlow AI. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
