/**
 * Process Webhook Retries Edge Function
 * 
 * Processes failed webhook events that are due for retry.
 * Should be triggered by a cron job (every 5 minutes recommended).
 * 
 * @endpoint POST /functions/v1/process-webhook-retries
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client with service role
function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

interface WebhookEvent {
  id: string;
  event_type: string;
  event_id: string;
  payload: Record<string, any>;
  retry_count: number;
  organization_id: string | null;
}

interface ProcessResult {
  eventId: string;
  eventType: string;
  status: 'succeeded' | 'failed';
  error?: string;
}

/**
 * Process a checkout.session.completed event
 */
async function processCheckoutCompleted(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  payload: Record<string, any>
): Promise<void> {
  const session = payload.data?.object;
  if (!session) {
    throw new Error('No session data in payload');
  }

  const metadata = session.metadata || {};
  const customerEmail = session.customer_details?.email || metadata.customerEmail;
  const customerName = session.customer_details?.name || metadata.customerName;

  // Check if booking already exists
  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .single();

  if (existingBooking) {
    console.log('Booking already exists for session:', session.id);
    return;
  }

  // Find or create customer
  let customerId: string | null = null;
  if (customerEmail) {
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customerEmail)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          email: customerEmail,
          name: customerName,
          phone: metadata.customerPhone,
          organization_id: metadata.organizationId,
        })
        .select('id')
        .single();

      if (customerError) throw customerError;
      customerId = newCustomer?.id;
    }
  }

  // Create booking
  const bookingNumber = `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  
  const { error: bookingError } = await supabase
    .from('bookings')
    .insert({
      booking_number: bookingNumber,
      customer_id: customerId,
      activity_id: metadata.activityId,
      venue_id: metadata.venueId,
      organization_id: metadata.organizationId,
      session_id: metadata.sessionId,
      booking_date: metadata.bookingDate,
      start_time: metadata.startTime,
      party_size: parseInt(metadata.partySize || '1'),
      total_amount: session.amount_total ? session.amount_total / 100 : 0,
      status: 'confirmed',
      payment_status: 'paid',
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
    });

  if (bookingError) throw bookingError;

  console.log('Booking created successfully:', bookingNumber);
}

/**
 * Process a payment_intent.succeeded event
 */
async function processPaymentSucceeded(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  payload: Record<string, any>
): Promise<void> {
  const paymentIntent = payload.data?.object;
  if (!paymentIntent) {
    throw new Error('No payment intent data in payload');
  }

  // Update booking payment status if exists
  const { error } = await supabase
    .from('bookings')
    .update({
      payment_status: 'paid',
      stripe_payment_intent_id: paymentIntent.id,
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  if (error) {
    console.warn('No booking found to update for payment intent:', paymentIntent.id);
  }
}

/**
 * Process a single webhook event
 */
async function processWebhookEvent(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  event: WebhookEvent
): Promise<ProcessResult> {
  const result: ProcessResult = {
    eventId: event.id,
    eventType: event.event_type,
    status: 'failed',
  };

  try {
    console.log(`Processing retry for ${event.event_type} (attempt ${event.retry_count + 1})`);

    switch (event.event_type) {
      case 'checkout.session.completed':
        await processCheckoutCompleted(supabase, event.payload);
        break;

      case 'payment_intent.succeeded':
        await processPaymentSucceeded(supabase, event.payload);
        break;

      case 'payment_intent.payment_failed':
        // Log but don't fail - this is informational
        console.log('Payment failed event processed');
        break;

      default:
        console.log(`Unknown event type: ${event.event_type}`);
    }

    // Mark as succeeded
    await supabase.rpc('mark_webhook_succeeded', { p_event_id: event.id });
    result.status = 'succeeded';
    console.log(`Successfully processed ${event.event_type}`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.error = errorMessage;

    // Mark as failed with error
    await supabase.rpc('mark_webhook_retry_failed', {
      p_event_id: event.id,
      p_error_message: errorMessage,
    });

    console.error(`Failed to process ${event.event_type}:`, errorMessage);
  }

  return result;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Get events due for retry
    const { data: events, error: fetchError } = await supabase
      .rpc('get_webhook_events_for_retry', { p_limit: 10 });

    if (fetchError) {
      throw new Error(`Failed to fetch events: ${fetchError.message}`);
    }

    if (!events || events.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No events to process',
          processed: 0,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Processing ${events.length} webhook retry events`);

    // Process events
    const results: ProcessResult[] = [];
    for (const event of events) {
      const result = await processWebhookEvent(supabase, event as WebhookEvent);
      results.push(result);
    }

    const succeeded = results.filter((r) => r.status === 'succeeded').length;
    const failed = results.filter((r) => r.status === 'failed').length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${events.length} events`,
        processed: events.length,
        succeeded,
        failed,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Webhook retry processing error:', error);

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
