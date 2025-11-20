import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const { 
      priceId,
      quantity = 1,
      customerEmail,
      customerName,
      successUrl,
      cancelUrl,
      metadata = {}
    } = await req.json();

    if (!priceId) {
      throw new Error('Price ID is required');
    }

    if (!successUrl || !cancelUrl) {
      throw new Error('Success URL and Cancel URL are required');
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: quantity,
        },
      ],
      customer_email: customerEmail,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        ...metadata,
        customer_name: customerName || '',
      },
      payment_intent_data: {
        metadata: {
          ...metadata,
        },
      },
      // Enable additional payment methods
      payment_method_types: ['card'],
      // Uncomment to enable more payment methods:
      // payment_method_types: ['card', 'us_bank_account', 'cashapp', 'link'],
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: true,
      },
      custom_text: {
        submit: {
          message: 'Complete your booking payment',
        },
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        clientSecret: session.client_secret,
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
