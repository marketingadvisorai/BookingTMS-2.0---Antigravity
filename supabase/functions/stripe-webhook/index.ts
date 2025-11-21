
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
