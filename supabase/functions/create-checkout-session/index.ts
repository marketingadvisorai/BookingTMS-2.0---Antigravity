/**
 * Create Checkout Session - Enterprise Booking Integration
 * 
 * Uses ONE Stripe price per activity, passes session-specific data via metadata.
 * This avoids creating separate products for each time slot.
 * 
 * @metadata Session info stored in checkout.metadata and payment_intent.metadata:
 * - booking_id, activity_id, venue_id, organization_id
 * - session_id (activity_session DB row)
 * - booking_date, start_time, end_time
 * - party_size, customer_name, customer_phone
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const body = await req.json();
    const {
      priceId,
      quantity = 1,
      line_items,
      customerEmail,
      customerName,
      customerPhone,
      successUrl,
      cancelUrl,
      metadata = {},
      // Session-specific booking data (passed via metadata, not separate products)
      sessionId,
      bookingDate,
      startTime,
      endTime,
    } = body;

    if (!priceId && !line_items) {
      throw new Error('Price ID or line items are required');
    }

    if (!successUrl || !cancelUrl) {
      throw new Error('Success URL and Cancel URL are required');
    }

    // Build comprehensive metadata for webhook processing
    const bookingMetadata: Record<string, string> = {
      ...metadata,
      customer_name: customerName || '',
      customer_phone: customerPhone || '',
      party_size: String(quantity),
      created_at: new Date().toISOString(),
    };

    // Add session-specific data if provided
    if (sessionId) bookingMetadata.session_id = sessionId;
    if (bookingDate) bookingMetadata.booking_date = bookingDate;
    if (startTime) bookingMetadata.start_time = startTime;
    if (endTime) bookingMetadata.end_time = endTime;

    // Determine line items
    const finalLineItems = line_items || [
      {
        price: priceId,
        quantity: quantity,
      },
    ];

    // Create Checkout Session with all metadata
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: finalLineItems,
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 min expiry
      metadata: bookingMetadata,
      payment_intent_data: {
        metadata: bookingMetadata,
        description: `Booking: ${metadata.activity_name || 'Activity'} - ${bookingDate || 'Date TBD'} ${startTime || ''}`,
      },
      payment_method_types: ['card'],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: true,
      },
      custom_text: {
        submit: {
          message: `Complete your booking for ${quantity} ${quantity > 1 ? 'people' : 'person'}`,
        },
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        clientSecret: session.client_secret,
        expiresAt: session.expires_at,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create checkout session'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
