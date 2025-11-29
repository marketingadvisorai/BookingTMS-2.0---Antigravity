
/**
 * Stripe Webhook Handler
 * Handles payment events from Stripe for booking confirmation
 * 
 * Events handled:
 * - checkout.session.completed (Stripe Checkout flow)
 * - payment_intent.succeeded (PaymentIntent flow)
 * - payment_intent.payment_failed
 * - payment_intent.canceled
 * 
 * Updated: 2025-11-29 (v0.1.53)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response(
      JSON.stringify({ error: 'Webhook signature verification failed' }),
      { status: 400 }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  console.log('Received webhook event:', event.type)

  try {
    switch (event.type) {
      // Stripe Checkout flow (primary for widget bookings)
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase)
        break

      // PaymentIntent flow (for direct payments)
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent, supabase)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, supabase)
        break

      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as Stripe.PaymentIntent, supabase)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500 }
    )
  }
})

/**
 * Handle Stripe Checkout session completion
 * This is the primary handler for widget bookings
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log('Processing checkout session:', session.id)

  // Skip if payment not completed
  if (session.payment_status !== 'paid') {
    console.log('Checkout session not paid yet:', session.payment_status)
    return
  }

  const metadata = session.metadata || {}
  const activityId = metadata.activity_id
  const bookingDate = metadata.booking_date
  const bookingTime = metadata.booking_time
  const partySize = parseInt(metadata.party_size || '1')
  const customerName = metadata.customer_name || session.customer_details?.name || ''
  const customerEmail = session.customer_email || session.customer_details?.email || ''
  const customerPhone = metadata.customer_phone || session.customer_details?.phone || ''

  // Check if booking already exists for this session
  const { data: existingBooking } = await supabase
    .from('bookings')
    .select('id')
    .eq('stripe_checkout_session_id', session.id)
    .single()

  if (existingBooking) {
    console.log('Booking already exists for session:', session.id)
    // Just update status
    await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingBooking.id)
    return
  }

  // Generate booking number
  const bookingNumber = `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

  // Find or create customer
  let customerId = null
  if (customerEmail) {
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customerEmail.toLowerCase())
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id
      // Update customer stats
      await supabase.rpc('increment_customer_stats', {
        p_customer_id: customerId,
        p_booking_amount: (session.amount_total || 0) / 100
      }).catch(() => {}) // Ignore if RPC doesn't exist
    } else {
      // Create new customer
      const nameParts = customerName.split(' ')
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          email: customerEmail.toLowerCase(),
          phone: customerPhone,
          status: 'active',
          total_bookings: 1,
          total_spent: (session.amount_total || 0) / 100,
          created_via: 'booking_widget'
        })
        .select('id')
        .single()

      customerId = newCustomer?.id
    }
  }

  // Create booking record
  const { error: bookingError } = await supabase
    .from('bookings')
    .insert({
      booking_number: bookingNumber,
      activity_id: activityId,
      customer_id: customerId,
      booking_date: bookingDate,
      start_time: bookingTime,
      party_size: partySize,
      total_amount: (session.amount_total || 0) / 100,
      status: 'confirmed',
      payment_status: 'paid',
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id,
      source: 'widget',
      promo_code: metadata.promo_code || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (bookingError) {
    console.error('Failed to create booking:', bookingError)
    throw bookingError
  }

  console.log('Booking created from checkout session:', bookingNumber)
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Processing successful payment:', paymentIntent.id)

  const bookingId = paymentIntent.metadata.booking_id

  if (!bookingId) {
    console.error('No booking_id in metadata for payment intent:', paymentIntent.id);
    return;
  }

  // Update booking status
  const { error } = await supabase
    .from('bookings')
    .update({
      payment_status: 'paid',
      status: 'confirmed', // Confirm the booking now that payment is secured
      stripe_payment_intent_id: paymentIntent.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)

  if (error) {
    console.error('Failed to update booking status:', error);
    throw error;
  }

  console.log('Payment successful, booking confirmed:', bookingId)
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Processing failed payment:', paymentIntent.id)

  const bookingId = paymentIntent.metadata.booking_id
  if (!bookingId) return;

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'failed',
      status: 'payment_failed', // Or 'cancelled' depending on business logic
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)

  // Note: If we reserved capacity, we might want to release it here.
  // However, 'payment_failed' status should be treated as "not counting towards capacity" 
  // in availability queries if we filter by status.
  // The current availability check usually counts 'confirmed' and 'pending_payment'.
  // We should ensure 'payment_failed' bookings don't block slots.

  console.log('Payment failed for booking:', bookingId)
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Processing canceled payment:', paymentIntent.id)

  const bookingId = paymentIntent.metadata.booking_id
  if (!bookingId) return;

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'canceled',
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)

  console.log('Payment canceled for booking:', bookingId)
}
