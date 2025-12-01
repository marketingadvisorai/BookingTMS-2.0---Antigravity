/**
 * Send SMS Edge Function (Twilio)
 * 
 * Sends SMS messages via Twilio API.
 * Supports booking confirmations, reminders, and notifications.
 * 
 * @endpoint POST /functions/v1/send-sms
 * 
 * Required env vars:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Twilio credentials from env
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

interface SendSMSRequest {
  to: string;
  message: string;
  bookingId?: string;
  type?: 'confirmation' | 'reminder' | 'cancellation' | 'notification';
  organizationId?: string;
}

interface TwilioResponse {
  sid: string;
  status: string;
  error_code?: number;
  error_message?: string;
}

/**
 * Send SMS via Twilio REST API
 */
async function sendTwilioSMS(to: string, body: string): Promise<TwilioResponse> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  
  const formData = new URLSearchParams();
  formData.append('To', to);
  formData.append('From', TWILIO_PHONE_NUMBER || '');
  formData.append('Body', body);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  return response.json();
}

/**
 * Format phone number for Twilio (E.164 format)
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // If no country code, assume US (+1)
  if (!cleaned.startsWith('+')) {
    const digits = cleaned.replace(/\D/g, '');
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
  }
  
  return cleaned;
}

/**
 * Log SMS to database for tracking
 */
async function logSMS(
  supabase: ReturnType<typeof createClient>,
  data: {
    to: string;
    message: string;
    type?: string;
    bookingId?: string;
    organizationId?: string;
    twilioSid?: string;
    status: 'sent' | 'failed';
    error?: string;
  }
) {
  try {
    await supabase.from('sms_logs').insert({
      phone_number: data.to,
      message: data.message,
      type: data.type || 'notification',
      booking_id: data.bookingId,
      organization_id: data.organizationId,
      twilio_sid: data.twilioSid,
      status: data.status,
      error_message: data.error,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    // Log but don't fail if logging fails
    console.warn('[send-sms] Failed to log SMS:', err);
  }
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Twilio credentials
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error('[send-sms] Missing Twilio credentials');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'SMS service not configured',
          details: 'Twilio credentials missing',
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request
    const body: SendSMSRequest = await req.json();
    const { to, message, bookingId, type, organizationId } = body;

    // Validate required fields
    if (!to || !message) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: to, message',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(to);
    
    // Validate phone format
    if (!formattedPhone.match(/^\+\d{10,15}$/)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid phone number format',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`[send-sms] Sending ${type || 'notification'} SMS to ${formattedPhone.slice(-4)}`);

    // Send via Twilio
    const twilioResponse = await sendTwilioSMS(formattedPhone, message);

    // Initialize Supabase for logging
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );

    // Check response
    if (twilioResponse.error_code) {
      console.error('[send-sms] Twilio error:', twilioResponse.error_message);
      
      await logSMS(supabase, {
        to: formattedPhone,
        message,
        type,
        bookingId,
        organizationId,
        status: 'failed',
        error: twilioResponse.error_message,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: twilioResponse.error_message,
          code: twilioResponse.error_code,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Log successful send
    await logSMS(supabase, {
      to: formattedPhone,
      message,
      type,
      bookingId,
      organizationId,
      twilioSid: twilioResponse.sid,
      status: 'sent',
    });

    console.log(`[send-sms] SMS sent successfully. SID: ${twilioResponse.sid}`);

    return new Response(
      JSON.stringify({
        success: true,
        messageId: twilioResponse.sid,
        status: twilioResponse.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[send-sms] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
