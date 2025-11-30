
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
  
  // Promo and gift card metadata
  const promoCode = metadata.promo_code || null
  const promoDiscount = parseFloat(metadata.promo_discount || '0')
  const giftCardId = metadata.gift_card_id || null
  const giftCardAmount = parseFloat(metadata.gift_card_amount || '0')
  const subtotal = parseFloat(metadata.subtotal || '0')
  const organizationId = metadata.organization_id || null

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

  // Create booking record with promo/gift card fields
  const { data: bookingData, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      booking_number: bookingNumber,
      activity_id: activityId,
      customer_id: customerId,
      booking_date: bookingDate,
      start_time: bookingTime,
      party_size: partySize,
      total_amount: (session.amount_total || 0) / 100,
      subtotal: subtotal || (session.amount_total || 0) / 100,
      status: 'confirmed',
      payment_status: 'paid',
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: typeof session.payment_intent === 'string' 
        ? session.payment_intent 
        : session.payment_intent?.id,
      source: 'widget',
      promo_code: promoCode,
      promo_discount: promoDiscount,
      gift_card_id: giftCardId,
      gift_card_amount: giftCardAmount,
      discount_total: promoDiscount + giftCardAmount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id')
    .single()

  if (bookingError) {
    console.error('Failed to create booking:', bookingError)
    throw bookingError
  }

  const bookingId = bookingData?.id
  console.log('Booking created from checkout session:', bookingNumber)

  // ============================================================================
  // FINALIZE PROMO CODE USAGE
  // ============================================================================
  if (promoCode && organizationId) {
    try {
      // Increment the usage count
      const { error: promoError } = await supabase.rpc('increment_promo_usage', {
        p_promo_code: promoCode,
        p_organization_id: organizationId
      })
      
      if (promoError) {
        // Fallback: manual increment
        await supabase
          .from('promotions')
          .update({ 
            current_uses: supabase.sql`current_uses + 1`,
            updated_at: new Date().toISOString() 
          })
          .eq('code', promoCode)
          .eq('organization_id', organizationId)
      }
      
      console.log('Promo code usage incremented:', promoCode)
    } catch (err) {
      console.error('Failed to increment promo usage:', err)
      // Don't throw - this shouldn't fail the booking
    }
  }

  // ============================================================================
  // FINALIZE GIFT CARD DEDUCTION
  // ============================================================================
  if (giftCardId && giftCardAmount > 0) {
    try {
      // Get current gift card balance
      const { data: giftCard, error: gcFetchError } = await supabase
        .from('gift_cards')
        .select('id, current_balance')
        .eq('id', giftCardId)
        .single()

      if (!gcFetchError && giftCard) {
        const newBalance = Math.max(0, giftCard.current_balance - giftCardAmount)
        
        // Update gift card balance
        await supabase
          .from('gift_cards')
          .update({
            current_balance: newBalance,
            redeemed_at: newBalance === 0 ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', giftCardId)

        // Record the transaction
        await supabase.from('gift_card_transactions').insert({
          gift_card_id: giftCardId,
          booking_id: bookingId,
          amount: -giftCardAmount,
          balance_after: newBalance,
          transaction_type: 'redemption',
          notes: `Booking ${bookingNumber}`,
          created_at: new Date().toISOString()
        })

        console.log('Gift card balance deducted:', giftCardId, 'Amount:', giftCardAmount)

        // Send gift card redemption notification
        await sendGiftCardRedemptionEmail({
          giftCardId,
          amount: giftCardAmount,
          newBalance,
          bookingNumber,
          customerEmail,
          customerName
        }, supabase)
      }
    } catch (err) {
      console.error('Failed to deduct gift card balance:', err)
      // Don't throw - this shouldn't fail the booking
    }
  }

  // Send admin notification
  await sendAdminNotification({
    customerEmail,
    customerName,
    bookingNumber,
    activityId,
    bookingDate,
    bookingTime,
    partySize,
    totalAmount: (session.amount_total || 0) / 100
  }, supabase)

  // Send confirmation email
  await sendBookingConfirmationEmail({
    customerEmail,
    customerName,
    bookingNumber,
    activityId,
    bookingDate,
    bookingTime,
    partySize,
    totalAmount: (session.amount_total || 0) / 100
  }, supabase)
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

/**
 * Send booking confirmation email via Resend
 */
interface BookingEmailData {
  customerEmail: string;
  customerName: string;
  bookingNumber: string;
  activityId: string;
  bookingDate: string;
  bookingTime: string;
  partySize: number;
  totalAmount: number;
}

async function sendBookingConfirmationEmail(data: BookingEmailData, supabase: any) {
  try {
    // Fetch activity details for email
    const { data: activity } = await supabase
      .from('activities')
      .select('name, venue_id, venues(name, address, city, state)')
      .eq('id', data.activityId)
      .single()

    const activityName = activity?.name || 'Your Activity'
    const venueName = activity?.venues?.name || ''
    const venueAddress = activity?.venues?.address || ''
    const venueCity = activity?.venues?.city || ''
    const venueState = activity?.venues?.state || ''

    // Format date for display
    const formattedDate = new Date(data.bookingDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed! 🎉</h1>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
    <p style="font-size: 18px; margin-bottom: 20px;">Hi ${data.customerName || 'there'},</p>
    
    <p>Your booking has been confirmed. Here are your details:</p>
    
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea;">
      <h2 style="margin: 0 0 15px 0; color: #667eea; font-size: 20px;">${activityName}</h2>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Booking Reference</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.bookingNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Date</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Time</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.bookingTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Party Size</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.partySize} ${data.partySize === 1 ? 'person' : 'people'}</td>
        </tr>
        <tr style="border-top: 1px solid #eee;">
          <td style="padding: 12px 0 8px 0; color: #666; font-size: 18px;">Total Paid</td>
          <td style="padding: 12px 0 8px 0; font-weight: bold; text-align: right; font-size: 18px; color: #667eea;">$${data.totalAmount.toFixed(2)}</td>
        </tr>
      </table>
    </div>
    
    ${venueName ? `
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; color: #333;">📍 Location</h3>
      <p style="margin: 0; color: #666;">
        <strong>${venueName}</strong><br>
        ${venueAddress}${venueCity ? `, ${venueCity}` : ''}${venueState ? `, ${venueState}` : ''}
      </p>
    </div>
    ` : ''}
    
    <div style="background: #fff3cd; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #856404;">
        <strong>⏰ Please arrive 10-15 minutes early</strong> to check in and complete any required waivers.
      </p>
    </div>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      Need to make changes? Contact us or visit your booking portal with your reference number.
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      This email was sent to ${data.customerEmail}.<br>
      Thank you for your booking!
    </p>
  </div>
</body>
</html>
    `.trim()

    // Call send-email edge function
    const emailResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          to: data.customerEmail,
          subject: `Booking Confirmed - ${activityName} on ${formattedDate}`,
          html: emailHtml,
          recipientName: data.customerName
        })
      }
    )

    if (emailResponse.ok) {
      console.log('Confirmation email sent to:', data.customerEmail)
    } else {
      const errorData = await emailResponse.json()
      console.error('Failed to send confirmation email:', errorData)
    }
  } catch (error) {
    console.error('Error sending confirmation email:', error)
    // Don't throw - email failure shouldn't fail the webhook
  }
}

/**
 * Send admin notification email for new bookings
 */
async function sendAdminNotification(data: BookingEmailData, supabase: any) {
  try {
    // Fetch activity and organization details
    const { data: activity } = await supabase
      .from('activities')
      .select('name, organization_id, venue_id, venues(name)')
      .eq('id', data.activityId)
      .single()

    if (!activity?.organization_id) {
      console.log('No organization found for activity:', data.activityId)
      return
    }

    // Get organization admin emails
    const { data: orgMembers } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', activity.organization_id)
      .in('role', ['admin', 'owner'])

    if (!orgMembers?.length) {
      console.log('No admins found for organization:', activity.organization_id)
      return
    }

    // Get user emails
    const userIds = orgMembers.map((m: any) => m.user_id)
    const { data: users } = await supabase
      .from('users')
      .select('email')
      .in('id', userIds)

    const adminEmails = users?.map((u: any) => u.email).filter(Boolean) || []
    
    if (!adminEmails.length) {
      console.log('No admin emails found')
      return
    }

    const activityName = activity?.name || 'Activity'
    const venueName = activity?.venues?.name || ''

    // Format date
    const formattedDate = new Date(data.bookingDate).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })

    // Build admin notification email
    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: #2563eb; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">🎉 New Booking!</h1>
  </div>
  <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; color: #666;">Reference</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.bookingNumber}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Customer</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.customerName}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0; text-align: right;">${data.customerEmail}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Activity</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${activityName}</td></tr>
      ${venueName ? `<tr><td style="padding: 8px 0; color: #666;">Venue</td><td style="padding: 8px 0; text-align: right;">${venueName}</td></tr>` : ''}
      <tr><td style="padding: 8px 0; color: #666;">Date & Time</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${formattedDate} at ${data.bookingTime}</td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Party Size</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.partySize} people</td></tr>
      <tr style="border-top: 2px solid #2563eb;"><td style="padding: 12px 0; color: #666; font-size: 18px;">Amount</td><td style="padding: 12px 0; font-weight: bold; text-align: right; font-size: 18px; color: #2563eb;">$${data.totalAmount.toFixed(2)}</td></tr>
    </table>
    <p style="margin-top: 20px; color: #666; font-size: 14px; text-align: center;">
      View this booking in your admin dashboard.
    </p>
  </div>
</body>
</html>`.trim()

    // Send to all admins
    await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: JSON.stringify({
          to: adminEmails,
          subject: `🎉 New Booking: ${activityName} - ${data.bookingNumber}`,
          html: emailHtml
        })
      }
    )

    console.log('Admin notification sent to:', adminEmails.join(', '))
  } catch (error) {
    console.error('Error sending admin notification:', error)
    // Don't throw - notification failure shouldn't fail the webhook
  }
}

/**
 * Send gift card redemption notification email
 */
interface GiftCardRedemptionEmailData {
  giftCardId: string;
  amount: number;
  newBalance: number;
  bookingNumber: string;
  customerEmail: string;
  customerName: string;
}

async function sendGiftCardRedemptionEmail(data: GiftCardRedemptionEmailData, supabase: any) {
  try {
    // Fetch gift card details including recipient email
    const { data: giftCard } = await supabase
      .from('gift_cards')
      .select('code, initial_value, recipient_email, recipient_name, purchaser_email')
      .eq('id', data.giftCardId)
      .single()

    if (!giftCard) return

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0;">🎁 Gift Card Used</h1>
  </div>
  <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Your gift card was used for a booking!</p>
    
    <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Gift Card Code</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${giftCard.code}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Amount Used</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #ef4444;">-$${data.amount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Remaining Balance</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right; color: #22c55e;">$${data.newBalance.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Booking Reference</td>
          <td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.bookingNumber}</td>
        </tr>
      </table>
    </div>
    
    ${data.newBalance > 0 ? `
    <div style="background: #ecfdf5; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #065f46;">
        <strong>💰 You still have $${data.newBalance.toFixed(2)} remaining!</strong><br>
        Use it on your next booking.
      </p>
    </div>
    ` : `
    <div style="background: #fef2f2; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; color: #991b1b;">
        <strong>Your gift card balance has been fully used.</strong>
      </p>
    </div>
    `}
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
      If you didn't make this purchase, please contact us immediately.
    </p>
  </div>
</body>
</html>`.trim()

    // Send to the customer who made the booking
    if (data.customerEmail) {
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            to: data.customerEmail,
            subject: `Gift Card Used - $${data.amount.toFixed(2)} for Booking ${data.bookingNumber}`,
            html: emailHtml,
            recipientName: data.customerName
          })
        }
      )
      console.log('Gift card redemption email sent to:', data.customerEmail)
    }

    // Also notify the gift card recipient/purchaser if different
    const recipientEmail = giftCard.recipient_email || giftCard.purchaser_email
    if (recipientEmail && recipientEmail !== data.customerEmail) {
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            to: recipientEmail,
            subject: `Gift Card Balance Update - ${giftCard.code}`,
            html: emailHtml,
            recipientName: giftCard.recipient_name
          })
        }
      )
      console.log('Gift card balance update sent to recipient:', recipientEmail)
    }
  } catch (error) {
    console.error('Error sending gift card redemption email:', error)
    // Don't throw - email failure shouldn't fail the webhook
  }
}
