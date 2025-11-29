/**
 * create-refund Edge Function
 * 
 * Creates a Stripe refund for a booking payment.
 * Supports full or partial refunds with reason documentation.
 * 
 * @param bookingId - The booking ID to refund
 * @param amount - Refund amount (optional, defaults to full refund)
 * @param reason - Reason for refund (optional)
 * 
 * @returns { success, refundId, amount, bookingId }
 */
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
    const { bookingId, amount, reason } = await req.json()

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: bookingId' }),
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

    // Get booking with payment info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        activity:activities(name)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError)
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get payment record for this booking
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (paymentError || !payment) {
      console.error('Payment not found for booking:', paymentError)
      return new Response(
        JSON.stringify({ error: 'No payment found for this booking' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the payment intent ID
    const paymentIntentId = payment.stripe_payment_intent_id

    if (!paymentIntentId) {
      return new Response(
        JSON.stringify({ error: 'No Stripe payment intent found for this payment' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calculate refund amount (in cents for Stripe)
    // If no amount specified, refund the full payment
    const refundAmountCents = amount 
      ? Math.round(amount * 100) 
      : Math.round(payment.amount * 100)

    // Validate refund amount doesn't exceed original payment
    if (refundAmountCents > Math.round(payment.amount * 100)) {
      return new Response(
        JSON.stringify({ 
          error: 'Refund amount cannot exceed original payment amount',
          originalAmount: payment.amount,
          requestedRefund: amount || payment.amount
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Creating refund...', { 
      paymentIntentId, 
      amount: refundAmountCents / 100,
      reason,
      bookingId 
    })

    // Create the Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: refundAmountCents,
      reason: reason ? 'requested_by_customer' : undefined,
      metadata: {
        booking_id: bookingId,
        customer_id: booking.customer?.id,
        reason: reason || 'Admin initiated refund',
        activity_name: booking.activity?.name || 'Unknown',
        refunded_by: 'admin'
      }
    })

    const refundAmount = refundAmountCents / 100
    const isFullRefund = refundAmount >= payment.amount

    // Update payment record
    await supabase
      .from('payments')
      .update({
        status: isFullRefund ? 'refunded' : 'partially_refunded',
        refund_amount: refundAmount,
        refund_date: new Date().toISOString(),
        refund_reason: reason || 'Admin initiated refund',
        stripe_refund_id: refund.id
      })
      .eq('id', payment.id)

    // Update booking status
    await supabase
      .from('bookings')
      .update({
        status: isFullRefund ? 'cancelled' : 'confirmed',
        payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
        metadata: {
          ...booking.metadata,
          refund_id: refund.id,
          refund_amount: refundAmount,
          refund_reason: reason || 'Admin initiated refund',
          refund_date: new Date().toISOString()
        }
      })
      .eq('id', bookingId)

    console.log('Refund created successfully:', refund.id)

    return new Response(
      JSON.stringify({
        success: true,
        refundId: refund.id,
        amount: refundAmount,
        originalAmount: payment.amount,
        isFullRefund,
        bookingId,
        status: refund.status
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error creating refund:', error)
    
    // Handle specific Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return new Response(
        JSON.stringify({ 
          error: 'Stripe error: ' + error.message,
          code: error.code
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to create refund',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
