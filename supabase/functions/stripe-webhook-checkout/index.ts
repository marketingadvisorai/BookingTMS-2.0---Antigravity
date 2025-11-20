import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    // Get the raw body
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Webhook signature verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Received event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session, supabase);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent, supabase);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent, supabase);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge, supabase);
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeCreated(dispute, supabase);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Handle successful checkout completion
async function handleCheckoutCompleted(session: Stripe.Checkout.Session, supabase: any) {
  const booking_id = session.metadata?.booking_id;
  
  if (!booking_id) {
    console.error("No booking_id in session metadata");
    return;
  }

  console.log(`Processing checkout completion for booking: ${booking_id}`);

  // Get booking details
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("*, organizations(stripe_account_id, application_fee_percentage)")
    .eq("id", booking_id)
    .single();

  if (bookingError || !booking) {
    console.error("Booking not found:", bookingError);
    return;
  }

  // Get payment intent details
  const payment_intent_id = session.payment_intent as string;
  const stripe_account_id = booking.organizations.stripe_account_id;

  const paymentIntent = await stripe.paymentIntents.retrieve(
    payment_intent_id,
    { stripeAccount: stripe_account_id }
  );

  // Calculate amounts
  const amount = paymentIntent.amount / 100; // Convert cents to dollars
  const application_fee = (paymentIntent.application_fee_amount || 0) / 100;
  const stripe_fee = ((paymentIntent.charges.data[0]?.balance_transaction as any)?.fee || 0) / 100;
  const net_to_merchant = amount - application_fee - stripe_fee;

  // Update booking status
  await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      payment_status: "paid",
      payment_intent_id: payment_intent_id,
      stripe_customer_id: session.customer as string,
      confirmation_code: `BK-${booking_id.slice(0, 8).toUpperCase()}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", booking_id);

  // Create payment record
  const { error: paymentError } = await supabase
    .from("payments")
    .insert({
      booking_id,
      customer_id: booking.customer_id,
      organization_id: booking.organization_id,
      venue_id: booking.venue_id,
      game_id: booking.game_id,
      amount,
      payment_method: "card",
      payment_method_type: paymentIntent.charges.data[0]?.payment_method_details?.type || "card",
      status: "succeeded",
      transaction_id: paymentIntent.id,
      stripe_payment_intent_id: payment_intent_id,
      stripe_charge_id: paymentIntent.charges.data[0]?.id,
      stripe_customer_id: session.customer as string,
      stripe_account_id,
      currency: paymentIntent.currency.toUpperCase(),
      application_fee_amount: application_fee,
      platform_earning: application_fee,
      net_to_merchant,
      stripe_fee,
      description: `Payment for booking ${booking_id}`,
      paid_at: new Date().toISOString(),
      payment_date: new Date().toISOString(),
      metadata: {
        session_id: session.id,
        checkout_completed_at: new Date().toISOString(),
      },
    });

  if (paymentError) {
    console.error("Failed to create payment record:", paymentError);
  }

  // Track platform revenue
  await supabase.rpc("track_platform_revenue", {
    p_organization_id: booking.organization_id,
    p_booking_id: booking_id,
    p_payment_id: null, // We don't have payment ID yet
    p_amount: application_fee,
    p_revenue_type: "application_fee",
    p_stripe_account_id: stripe_account_id,
    p_stripe_transfer_id: null,
  });

  console.log(`Booking ${booking_id} confirmed successfully`);
}

// Handle successful payment (redundant with checkout.session.completed but good for validation)
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  const booking_id = paymentIntent.metadata?.booking_id;
  
  if (!booking_id) {
    console.log("No booking_id in payment intent metadata");
    return;
  }

  console.log(`Payment succeeded for booking: ${booking_id}`);

  // Update booking payment status if not already updated
  await supabase
    .from("bookings")
    .update({
      payment_status: "paid",
      payment_intent_id: paymentIntent.id,
    })
    .eq("id", booking_id)
    .eq("payment_status", "pending"); // Only update if still pending
}

// Handle failed payment
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  const booking_id = paymentIntent.metadata?.booking_id;
  
  if (!booking_id) {
    console.log("No booking_id in payment intent metadata");
    return;
  }

  console.log(`Payment failed for booking: ${booking_id}`);

  // Update booking status
  await supabase
    .from("bookings")
    .update({
      status: "payment_failed",
      payment_status: "failed",
      payment_intent_id: paymentIntent.id,
      internal_notes: `Payment failed: ${paymentIntent.last_payment_error?.message || "Unknown error"}`,
    })
    .eq("id", booking_id);
}

// Handle refunds
async function handleChargeRefunded(charge: Stripe.Charge, supabase: any) {
  const payment_intent_id = charge.payment_intent as string;
  
  console.log(`Charge refunded: ${charge.id}`);

  // Find payment by payment_intent_id
  const { data: payment } = await supabase
    .from("payments")
    .select("id, booking_id, amount")
    .eq("stripe_payment_intent_id", payment_intent_id)
    .single();

  if (!payment) {
    console.error("Payment not found for refunded charge");
    return;
  }

  const refund_amount = charge.amount_refunded / 100;

  // Update payment status
  await supabase
    .from("payments")
    .update({
      status: "refunded",
      refund_amount,
      refund_date: new Date().toISOString(),
    })
    .eq("id", payment.id);

  // Update booking status
  await supabase
    .from("bookings")
    .update({
      status: "refunded",
      payment_status: "refunded",
    })
    .eq("id", payment.booking_id);

  console.log(`Refund processed for booking: ${payment.booking_id}`);
}

// Handle disputes
async function handleDisputeCreated(dispute: Stripe.Dispute, supabase: any) {
  const charge_id = dispute.charge as string;
  
  console.log(`Dispute created for charge: ${charge_id}`);

  // Find payment by charge_id
  const { data: payment } = await supabase
    .from("payments")
    .select("id, booking_id")
    .eq("stripe_charge_id", charge_id)
    .single();

  if (!payment) {
    console.error("Payment not found for disputed charge");
    return;
  }

  // Update payment status
  await supabase
    .from("payments")
    .update({
      status: "disputed",
      metadata: {
        dispute_id: dispute.id,
        dispute_reason: dispute.reason,
        dispute_amount: dispute.amount / 100,
      },
    })
    .eq("id", payment.id);

  // Update booking with dispute flag
  await supabase
    .from("bookings")
    .update({
      internal_notes: `Payment disputed: ${dispute.reason}`,
      metadata: {
        dispute_id: dispute.id,
        dispute_status: dispute.status,
      },
    })
    .eq("id", payment.booking_id);

  console.log(`Dispute recorded for booking: ${payment.booking_id}`);
}
