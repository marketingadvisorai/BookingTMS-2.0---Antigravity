import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
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

      case 'charge.refunded':
        await handleRefund(event.data.object as Stripe.Charge, supabase)
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
  const customerId = paymentIntent.metadata.customer_id

  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      stripe_charge_id: paymentIntent.latest_charge,
      payment_method_type: paymentIntent.payment_method_types?.[0],
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'paid',
      status: 'confirmed',
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)

  console.log('Payment successful, booking confirmed:', bookingId)

  // TODO: Send confirmation email with QR code
  // You can call the send-email Edge Function here
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Processing failed payment:', paymentIntent.id)

  const bookingId = paymentIntent.metadata.booking_id

  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

  // Update booking status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'failed',
      status: 'payment_failed',
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)

  console.log('Payment failed for booking:', bookingId)
}

async function handleRefund(charge: Stripe.Charge, supabase: any) {
  console.log('Processing refund for charge:', charge.id)

  const paymentIntentId = charge.payment_intent as string

  // Get payment record
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (!payment) {
    console.error('Payment not found for refund')
    return
  }

  // Calculate refund status
  const refundedAmount = charge.amount_refunded / 100
  const totalAmount = charge.amount / 100
  const isFullRefund = refundedAmount >= totalAmount

  // Update payment status
  await supabase
    .from('payments')
    .update({
      status: isFullRefund ? 'refunded' : 'partially_refunded',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntentId)

  // Create refund record
  await supabase
    .from('refunds')
    .insert({
      payment_id: payment.id,
      booking_id: payment.booking_id,
      stripe_refund_id: charge.refunds?.data[0]?.id,
      stripe_payment_intent_id: paymentIntentId,
      amount: refundedAmount,
      currency: charge.currency.toUpperCase(),
      status: 'succeeded',
      reason: 'requested_by_customer'
    })

  // Update booking if full refund
  if (isFullRefund) {
    await supabase
      .from('bookings')
      .update({
        payment_status: 'refunded',
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('id', payment.booking_id)
  }

  console.log('Refund processed:', { amount: refundedAmount, isFullRefund })
}

async function handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log('Processing canceled payment:', paymentIntent.id)

  const bookingId = paymentIntent.metadata.booking_id

  // Update payment record
  await supabase
    .from('payments')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)

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
