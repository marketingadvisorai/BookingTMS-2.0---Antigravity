import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  templateId?: string;
  campaignId?: string;
  customerId?: string;
  recipientName?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const emailData: EmailRequest = await req.json()
    
    // Validate required fields
    if (!emailData.to || !emailData.subject) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Default from address (use Resend's onboarding domain for testing)
    const fromEmail = emailData.from || 'BookingFlow AI <onboarding@resend.dev>'

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: Array.isArray(emailData.to) ? emailData.to : [emailData.to],
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        reply_to: emailData.replyTo,
      }),
    })

    const resendData = await resendResponse.json()

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Log email to database
    const emailLog = {
      campaign_id: emailData.campaignId || null,
      template_id: emailData.templateId || null,
      recipient_email: Array.isArray(emailData.to) ? emailData.to[0] : emailData.to,
      recipient_name: emailData.recipientName || null,
      customer_id: emailData.customerId || null,
      subject: emailData.subject,
      body: emailData.text || emailData.html?.substring(0, 1000) || null,
      status: resendResponse.ok ? 'sent' : 'failed',
      provider_message_id: resendData.id || null,
      sent_at: resendResponse.ok ? new Date().toISOString() : null,
    }

    const { error: logError } = await supabase
      .from('email_logs')
      .insert(emailLog)

    if (logError) {
      console.error('Failed to log email:', logError)
    }

    // Update template usage count if templateId provided
    if (emailData.templateId && resendResponse.ok) {
      await supabase.rpc('increment_template_usage', {
        template_id: emailData.templateId
      })
    }

    // Return response
    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Failed to send email',
          details: resendData 
        }),
        { 
          status: resendResponse.status,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: resendData.id,
        data: resendData 
      }),
      {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      }
    )

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
      }
    )
  }
})
