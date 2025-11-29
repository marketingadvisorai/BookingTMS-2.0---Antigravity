/**
 * Verify Checkout Session
 * 
 * Verifies a Stripe checkout session and returns booking details.
 * Called after customer returns from Stripe checkout.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const { sessionId, bookingId } = await req.json();

    if (!sessionId) {
      throw new Error('Session ID is required');
    }

    // Retrieve the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'payment_intent'],
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Payment not completed',
          status: session.payment_status
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Extract booking details from metadata
    const metadata = session.metadata || {};
    const activityId = metadata.activity_id || bookingId;
    const customerName = metadata.customer_name || session.customer_details?.name || '';
    const customerEmail = session.customer_email || session.customer_details?.email || '';
    const customerPhone = metadata.customer_phone || session.customer_details?.phone || '';

    // Generate booking number
    const bookingNumber = `BK-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create or update booking record in database
    let bookingRecord = null;
    
    if (activityId && activityId !== 'PENDING') {
      // Try to fetch existing booking or create new one
      const { data: existingBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .single();

      if (existingBooking) {
        // Update existing booking
        const { data, error } = await supabase
          .from('bookings')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingBooking.id)
          .select()
          .single();

        bookingRecord = data;
      } else {
        // Create new booking
        const { data, error } = await supabase
          .from('bookings')
          .insert({
            booking_number: bookingNumber,
            activity_id: activityId,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            party_size: parseInt(metadata.party_size || '1'),
            booking_date: metadata.booking_date,
            booking_time: metadata.booking_time,
            total_amount: session.amount_total ? session.amount_total / 100 : 0,
            status: 'confirmed',
            payment_status: 'paid',
            stripe_session_id: sessionId,
            stripe_payment_intent: typeof session.payment_intent === 'string' 
              ? session.payment_intent 
              : session.payment_intent?.id,
            promo_code: metadata.promo_code || null,
            gift_card_code: metadata.gift_card || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating booking:', error);
        } else {
          bookingRecord = data;
        }
      }

      // Send admin notification for new/confirmed booking
      if (bookingRecord) {
        try {
          // Get organization admin emails
          const { data: orgData } = await supabase
            .from('organizations')
            .select('notification_email, owner_email, name')
            .eq('id', metadata.organization_id)
            .single();

          const adminEmails: string[] = [];
          if (orgData?.notification_email) adminEmails.push(orgData.notification_email);
          if (orgData?.owner_email && !adminEmails.includes(orgData.owner_email)) {
            adminEmails.push(orgData.owner_email);
          }

          // Send notification via send-email function
          if (adminEmails.length > 0) {
            await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: adminEmails,
                subject: `🎉 New Booking: ${metadata.activity_name || 'Activity'} - $${(session.amount_total || 0) / 100}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                      <h1 style="margin: 0;">🎉 New Booking Received!</h1>
                      <p style="margin: 10px 0 0 0; opacity: 0.9;">${orgData?.name || 'Your Business'}</p>
                    </div>
                    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                      <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; margin: 15px 0;">
                        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Total Revenue</div>
                        <div style="font-size: 24px; color: #10b981; font-weight: bold;">$${((session.amount_total || 0) / 100).toFixed(2)}</div>
                      </div>
                      <table style="width: 100%; border-collapse: collapse;">
                        <tr><td style="padding: 8px 0; color: #6b7280;">Booking ID:</td><td style="padding: 8px 0; font-weight: 500;">${bookingRecord.booking_number || bookingNumber}</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">Activity:</td><td style="padding: 8px 0; font-weight: 500;">${metadata.activity_name || 'Activity'}</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">Date:</td><td style="padding: 8px 0; font-weight: 500;">${metadata.booking_date}</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">Time:</td><td style="padding: 8px 0; font-weight: 500;">${metadata.booking_time}</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">Party Size:</td><td style="padding: 8px 0; font-weight: 500;">${metadata.party_size} people</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">Customer:</td><td style="padding: 8px 0; font-weight: 500;">${customerName}</td></tr>
                        <tr><td style="padding: 8px 0; color: #6b7280;">Email:</td><td style="padding: 8px 0; font-weight: 500;">${customerEmail}</td></tr>
                      </table>
                    </div>
                  </div>
                `,
              }),
            });
            console.log('✅ Admin notification sent to:', adminEmails);
          }
        } catch (notifyError) {
          console.error('Failed to send admin notification:', notifyError);
          // Don't fail the whole request if notification fails
        }
      }
    }

    // Build response
    const booking = {
      id: bookingRecord?.id || bookingId || 'PENDING',
      bookingNumber: bookingRecord?.booking_number || bookingNumber,
      activityName: metadata.activity_name || 'Your Experience',
      venueName: metadata.venue_name || 'Venue',
      date: metadata.booking_date || new Date().toLocaleDateString(),
      time: metadata.booking_time || '',
      partySize: parseInt(metadata.party_size || '0'),
      totalAmount: session.amount_total ? session.amount_total / 100 : 0,
      customerName,
      customerEmail,
      status: 'confirmed',
    };

    return new Response(
      JSON.stringify({
        success: true,
        booking,
        session: {
          id: session.id,
          paymentStatus: session.payment_status,
          amountTotal: session.amount_total,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error verifying checkout session:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to verify checkout session' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
