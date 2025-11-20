import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bookingId, amount, currency = 'usd', customerId } = await req.json()

    if (!bookingId || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: bookingId, amount' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get booking with customer details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        game:games(*)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create or get Stripe customer
    let stripeCustomerId = booking.customer.stripe_customer_id

    if (!stripeCustomerId) {
      console.log('Creating new Stripe customer...')
      const customer = await stripe.customers.create({
        email: booking.customer.email,
        name: `${booking.customer.first_name} ${booking.customer.last_name}`,
        phone: booking.customer.phone,
        metadata: {
          supabase_customer_id: booking.customer.id,
          booking_id: bookingId
        }
      })

      stripeCustomerId = customer.id

      // Update customer with Stripe ID
      await supabase
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', booking.customer.id)
    }

    // Create payment intent
    console.log('Creating payment intent...', { amount, currency, customer: stripeCustomerId })
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: stripeCustomerId,
      metadata: {
        booking_id: bookingId,
        customer_id: booking.customer.id,
        game_name: booking.game?.name || 'Unknown',
        booking_date: booking.booking_date,
        start_time: booking.start_time
      },
      automatic_payment_methods: {
        enabled: true,
      },
      description: `Booking for ${booking.game?.name || 'Game'} on ${booking.booking_date}`
    })

    // Create payment record
    await supabase.from('payments').insert({
      booking_id: bookingId,
      customer_id: booking.customer.id,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_customer_id: stripeCustomerId,
      amount: amount,
      currency: currency.toUpperCase(),
      status: 'pending',
      description: `Payment for booking ${bookingId}`,
      metadata: {
        game_id: booking.game_id,
        game_name: booking.game?.name
      }
    })

    // Update booking with payment info
    await supabase
      .from('bookings')
      .update({
        payment_amount: amount,
        payment_currency: currency.toUpperCase(),
        payment_status: 'pending'
      })
      .eq('id', bookingId)

    console.log('Payment intent created successfully:', paymentIntent.id)

    return new Response(
      JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        currency: currency
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create payment intent',
        details: error.toString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})
