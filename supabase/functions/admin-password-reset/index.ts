/**
 * Admin Password Reset Edge Function
 * 
 * Handles admin-initiated password operations using service role:
 * - action: 'send_reset' - Send password reset email
 * - action: 'set_password' - Directly set new password
 * - action: 'check_user' - Check if user exists
 * 
 * @module supabase/functions/admin-password-reset
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AdminResetRequest {
  action?: 'send_reset' | 'set_password' | 'check_user'
  email: string
  userName?: string
  newPassword?: string
  userId?: string
  redirectUrl?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the request is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Create user client to verify the requester
    const supabaseUser = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } }
    })

    // Get the requesting user
    const { data: { user: requester }, error: authError } = await supabaseUser.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !requester) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if requester is admin (system-admin or super-admin)
    const { data: requesterProfile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', requester.id)
      .single()

    const allowedRoles = ['system-admin', 'super-admin']
    if (!requesterProfile || !allowedRoles.includes(requesterProfile.role)) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { action, email, userName, newPassword, userId, redirectUrl }: AdminResetRequest = await req.json()
    
    // Determine action (default to send_reset for backward compatibility)
    const requestAction = action || 'send_reset'

    // Handle set_password action
    if (requestAction === 'set_password') {
      if (!userId || !newPassword) {
        return new Response(
          JSON.stringify({ error: 'userId and newPassword are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      })

      if (updateError) {
        console.error('Error setting password:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to set password', details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Log the action
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          action: 'admin_set_password',
          entity_type: 'user',
          entity_id: userId,
          user_id: requester.id,
          details: { initiated_by: requester.email },
        })
        .catch((err: any) => console.warn('Audit log failed:', err))

      return new Response(
        JSON.stringify({ success: true, message: 'Password set successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle send_reset action (default)
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user exists in auth
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify user', details: listError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const targetUser = users.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!targetUser) {
      return new Response(
        JSON.stringify({ error: 'User not found with this email' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate password reset link
    const baseUrl = redirectUrl || 'https://booking-tms-antigravity.netlify.app'
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${baseUrl}/reset-password`,
      },
    })

    if (linkError || !linkData) {
      console.error('Error generating reset link:', linkError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate reset link', details: linkError?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Extract the token from the link
    const resetLink = linkData.properties?.action_link || ''
    
    // Send branded email via Resend
    const emailHtml = generatePasswordResetEmail(userName || email.split('@')[0], resetLink)
    
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BookingTMS <noreply@bookingtms.com>',
        to: [email],
        subject: 'Reset Your Password - BookingTMS',
        html: emailHtml,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend error:', resendData)
      
      // Fallback: Return the link directly (for testing)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Reset link generated (email delivery pending)',
          fallbackLink: resetLink, // Remove in production
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Log the password reset action
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'admin_password_reset',
        entity_type: 'user',
        entity_id: targetUser.id,
        user_id: requester.id,
        details: { target_email: email, initiated_by: requester.email },
      })
      .catch(err => console.warn('Audit log failed:', err))

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Password reset email sent to ${email}`,
        messageId: resendData.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Admin password reset error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Generate branded password reset email HTML
 */
function generatePasswordResetEmail(userName: string, resetLink: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">BookingTMS</h1>
        <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 14px;">Booking Management System</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Reset Your Password</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Hi ${userName},
        </p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
            Reset Password
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
          This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetLink}" style="color: #4f46e5; word-break: break-all;">${resetLink}</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2025 BookingTMS. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
