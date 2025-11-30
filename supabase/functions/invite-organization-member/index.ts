/**
 * Invite Organization Member Edge Function
 * 
 * Creates a new user, adds them to an organization, and sends welcome email.
 * Handles both new user creation and existing user invitation.
 * 
 * Features:
 * - Creates Supabase Auth user with password
 * - Creates user profile in public.users
 * - Adds user to organization_members
 * - Sends welcome email with credentials via Resend
 * - Generates password reset link
 * 
 * @module supabase/functions/invite-organization-member
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteMemberRequest {
  organization_id: string
  email: string
  name: string
  role?: 'owner' | 'admin' | 'manager' | 'staff'
  phone?: string
  password?: string // If not provided, will be auto-generated
  send_email?: boolean
}

interface InviteMemberResponse {
  success: boolean
  user_id?: string
  temp_password?: string
  reset_link?: string
  email_sent?: boolean
  method?: 'resend' | 'fallback'
  error?: string
  message?: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401)
    }

    // Create admin client with service role
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Verify the calling user has permission
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !caller) {
      return jsonResponse({ error: 'Unauthorized', details: authError?.message }, 401)
    }

    // Check if caller is admin
    const { data: callerProfile } = await supabaseAdmin
      .from('users')
      .select('role, organization_id')
      .eq('id', caller.id)
      .single()

    const allowedRoles = ['system-admin', 'super-admin', 'org-admin']
    if (!callerProfile || !allowedRoles.includes(callerProfile.role)) {
      return jsonResponse({ error: 'Forbidden: Admin access required' }, 403)
    }

    // 2. Parse request body
    const body: InviteMemberRequest = await req.json()
    const { 
      organization_id, 
      email, 
      name, 
      role = 'staff',
      phone,
      password,
      send_email = true 
    } = body

    if (!organization_id || !email || !name) {
      return jsonResponse({ error: 'Missing required fields: organization_id, email, name' }, 400)
    }

    // Verify org-admin can only invite to their own organization
    if (callerProfile.role === 'org-admin' && callerProfile.organization_id !== organization_id) {
      return jsonResponse({ error: 'Forbidden: Cannot invite to other organizations' }, 403)
    }

    // 3. Get organization details
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('name, slug')
      .eq('id', organization_id)
      .single()

    if (orgError || !org) {
      return jsonResponse({ error: 'Organization not found' }, 404)
    }

    // 4. Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      u => u.email?.toLowerCase() === email.toLowerCase()
    )

    let userId: string
    let tempPassword = password || generateSecurePassword()
    let resetLink: string | null = null
    let isNewUser = false

    if (existingUser) {
      // User exists - just add to organization
      userId = existingUser.id
      console.log('[InviteMember] Existing user found:', userId)

      // Check if already member of this org
      const { data: existingMember } = await supabaseAdmin
        .from('organization_members')
        .select('id')
        .eq('organization_id', organization_id)
        .eq('user_id', userId)
        .single()

      if (existingMember) {
        return jsonResponse({ 
          error: 'User is already a member of this organization' 
        }, 400)
      }
    } else {
      // Create new user
      isNewUser = true
      console.log('[InviteMember] Creating new user...')

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          organization_id,
          role,
        }
      })

      if (createError || !newUser.user) {
        console.error('[InviteMember] User creation failed:', createError)
        return jsonResponse({ 
          error: 'Failed to create user', 
          details: createError?.message 
        }, 500)
      }

      userId = newUser.user.id

      // Generate reset link for new users
      const origin = req.headers.get('origin') || 'https://booking-tms-antigravity.netlify.app'
      const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: {
          redirectTo: `${origin}/reset-password`
        }
      })
      resetLink = linkData?.properties?.action_link || null
    }

    // 5. Create or update user profile
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email,
        full_name: name,
        role: role === 'owner' ? 'org-admin' : role,
        organization_id,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('[InviteMember] Profile creation failed:', profileError)
      // Don't fail - user is created, just log the error
    }

    // 6. Add to organization members
    const { error: memberError } = await supabaseAdmin
      .from('organization_members')
      .upsert({
        organization_id,
        user_id: userId,
        role: role === 'owner' ? 'owner' : role,
        permissions: getDefaultPermissions(role),
        joined_at: new Date().toISOString(),
      }, { onConflict: 'organization_id,user_id' })

    if (memberError) {
      console.error('[InviteMember] Member creation failed:', memberError)
      // If this fails, clean up the user if new
      if (isNewUser) {
        await supabaseAdmin.auth.admin.deleteUser(userId)
        await supabaseAdmin.from('users').delete().eq('id', userId)
      }
      return jsonResponse({ 
        error: 'Failed to add member to organization', 
        details: memberError.message 
      }, 500)
    }

    // 7. Send welcome email
    let emailSent = false
    let emailMethod: 'resend' | 'fallback' = 'fallback'

    if (send_email && isNewUser && RESEND_API_KEY && RESEND_API_KEY.length > 10) {
      try {
        const emailHtml = generateWelcomeEmail({
          userName: name,
          orgName: org.name,
          email,
          tempPassword,
          resetLink: resetLink || '#',
        })

        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'BookingFlow AI <onboarding@resend.dev>',
            to: [email],
            subject: `Welcome to ${org.name} - BookingFlow AI`,
            html: emailHtml,
          }),
        })

        if (resendResponse.ok) {
          emailSent = true
          emailMethod = 'resend'
          console.log('[InviteMember] Welcome email sent via Resend')
        } else {
          console.warn('[InviteMember] Resend failed:', await resendResponse.text())
        }
      } catch (emailErr) {
        console.error('[InviteMember] Email error:', emailErr)
      }
    }

    // 8. Log the action
    await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'invite_organization_member',
        entity_type: 'user',
        entity_id: userId,
        user_id: caller.id,
        details: {
          organization_id,
          email,
          role,
          is_new_user: isNewUser,
          email_sent: emailSent,
        },
      })
      .catch((err: any) => console.warn('Audit log failed:', err))

    // 9. Return response
    const response: InviteMemberResponse = {
      success: true,
      user_id: userId,
      message: isNewUser 
        ? `User created and added to ${org.name}` 
        : `Existing user added to ${org.name}`,
    }

    if (isNewUser) {
      response.temp_password = tempPassword
      response.reset_link = resetLink || undefined
      response.email_sent = emailSent
      response.method = emailMethod
    }

    return jsonResponse(response)

  } catch (error: any) {
    console.error('[InviteMember] Error:', error)
    return jsonResponse({ 
      error: 'Internal server error', 
      message: error?.message || 'Unknown error' 
    }, 500)
  }
})

// Helper: JSON response
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Helper: Generate secure password
function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lowercase = 'abcdefghjkmnpqrstuvwxyz'
  const numbers = '23456789'
  const special = '!@#$%'
  
  let password = ''
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
  password += numbers.charAt(Math.floor(Math.random() * numbers.length))
  password += special.charAt(Math.floor(Math.random() * special.length))
  
  const allChars = uppercase + lowercase + numbers + special
  for (let i = 0; i < 8; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length))
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Helper: Get default permissions by role
function getDefaultPermissions(role: string): Record<string, boolean> {
  switch (role) {
    case 'owner':
      return { all: true, bookings: true, activities: true, staff: true, reports: true, billing: true, settings: true }
    case 'admin':
      return { bookings: true, activities: true, staff: true, reports: true, settings: true }
    case 'manager':
      return { bookings: true, activities: true, reports: true }
    case 'staff':
    default:
      return { bookings: true }
  }
}

// Helper: Generate welcome email HTML
function generateWelcomeEmail(params: {
  userName: string
  orgName: string
  email: string
  tempPassword: string
  resetLink: string
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${params.orgName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Welcome to BookingFlow AI</h1>
        <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 14px;">${params.orgName}</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px;">Hello ${params.userName}!</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
          Your account has been created for <strong>${params.orgName}</strong> on BookingFlow AI.
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="color: #1f2937; font-size: 14px; margin: 0 0 10px 0; font-weight: 600;">Your Login Credentials:</p>
          <p style="color: #4b5563; font-size: 14px; margin: 0 0 5px 0;">
            <strong>Email:</strong> ${params.email}
          </p>
          <p style="color: #4b5563; font-size: 14px; margin: 0;">
            <strong>Temporary Password:</strong> ${params.tempPassword}
          </p>
        </div>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0;">
          For security, we recommend changing your password immediately:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${params.resetLink}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);">
            Set New Password
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
          You can also log in directly with the temporary password above and change it from your account settings.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
          If you didn't expect this email, please contact your administrator.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          © 2025 BookingFlow AI. All rights reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
