import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  venue_id: string;
  game_id: string;
  booking_date: string;
  booking_time: string;
  num_players: number;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  add_ons?: Array<{ id: string; quantity: number }>;
  promo_code?: string;
  success_url: string;
  cancel_url: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) throw new Error("Unauthorized");

    const {
      venue_id,
      game_id,
      booking_date,
      booking_time,
      num_players,
      customer_email,
      customer_name,
      customer_phone,
      success_url,
      cancel_url,
    }: CheckoutRequest = await req.json();

    // Validate required fields
    if (!venue_id || !game_id || !booking_date || !num_players || !customer_email) {
      throw new Error("Missing required fields");
    }

    // Get venue details
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("id, name, organization_id, pricing")
      .eq("id", venue_id)
      .single();

    if (venueError || !venue) throw new Error("Venue not found");

    // Get game details
    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, name, base_price, organization_id")
      .eq("id", game_id)
      .single();

    if (gameError || !game) throw new Error("Game not found");

    // Verify both belong to same organization
    if (venue.organization_id !== game.organization_id) {
      throw new Error("Venue and game belong to different organizations");
    }

    const organization_id = venue.organization_id;

    // Get organization with Stripe details
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, stripe_account_id, stripe_charges_enabled, application_fee_percentage")
      .eq("id", organization_id)
      .single();

    if (orgError || !org) throw new Error("Organization not found");

    // Verify organization has Stripe connected and active
    if (!org.stripe_account_id) {
      throw new Error("Organization has not connected Stripe account");
    }

    if (!org.stripe_charges_enabled) {
      throw new Error("Organization's Stripe account is not active");
    }

    // Calculate pricing
    const base_price = parseFloat(game.base_price) || 0;
    const total_amount = base_price * num_players; // Simplified - add logic for add-ons later
    const amount_in_cents = Math.round(total_amount * 100);

    // Calculate application fee (0.75% or from organization settings)
    const fee_percentage = org.application_fee_percentage || 0.0075;
    const application_fee_cents = Math.round(amount_in_cents * fee_percentage);

    // Create idempotency key
    const idempotency_key = `${organization_id}_${venue_id}_${game_id}_${Date.now()}`;

    // Get or create Stripe customer
    let stripe_customer_id: string;

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("email", customer_email)
      .eq("organization_id", organization_id)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      stripe_customer_id = existingCustomer.stripe_customer_id;
    } else {
      // Create new Stripe customer on connected account
      const customer = await stripe.customers.create({
        email: customer_email,
        name: customer_name,
        phone: customer_phone,
        metadata: {
          organization_id,
          venue_id,
          game_id,
        },
      }, {
        stripeAccount: org.stripe_account_id,
      });

      stripe_customer_id = customer.id;

      // Save customer to database
      await supabase.from("customers").insert({
        email: customer_email,
        first_name: customer_name.split(" ")[0],
        last_name: customer_name.split(" ").slice(1).join(" "),
        phone: customer_phone,
        organization_id,
        stripe_customer_id,
        stripe_account_id: org.stripe_account_id,
        created_via: "checkout",
      });
    }

    // Get Time Slot ID
    const { data: timeSlot, error: slotError } = await supabase
      .from("time_slots")
      .select("id, is_available, current_bookings, max_bookings")
      .eq("game_id", game_id)
      .eq("slot_date", booking_date)
      .eq("start_time", booking_time)
      .single();

    if (slotError || !timeSlot) {
      throw new Error("Time slot not found or invalid");
    }

    if (!timeSlot.is_available) {
      throw new Error("Time slot is no longer available");
    }

    // Create pending booking in database
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        venue_id,
        game_id,
        time_slot_id: timeSlot.id, // Link to time slot
        organization_id,
        booking_date,
        booking_time,
        start_time: booking_time,
        players: num_players,
        party_size: num_players,
        customer_email,
        customer_name,
        customer_phone,
        total_amount,
        total_price: total_amount,
        payment_amount: total_amount,
        payment_status: "pending",
        status: "pending_payment",
        source: "widget",
        metadata: {
          application_fee_cents,
          fee_percentage,
          created_via: "checkout_api",
        },
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);
      throw new Error("Failed to create booking");
    }

    // Create Stripe Checkout Session on connected account
    const session = await stripe.checkout.sessions.create({
      customer: stripe_customer_id,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${game.name} at ${venue.name}`,
              description: `Booking for ${num_players} players on ${booking_date} at ${booking_time}`,
              metadata: {
                venue_id,
                game_id,
                organization_id,
                booking_id: booking.id,
              },
            },
            unit_amount: amount_in_cents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: application_fee_cents,
        metadata: {
          booking_id: booking.id,
          organization_id,
          venue_id,
          game_id,
          customer_email,
        },
      },
      metadata: {
        booking_id: booking.id,
        organization_id,
        venue_id,
        game_id,
      },
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url,
      expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes
      customer_update: {
        address: "auto",
      },
      phone_number_collection: {
        enabled: true,
      },
    }, {
      stripeAccount: org.stripe_account_id,
      idempotencyKey: idempotency_key,
    });

    // Update booking with session ID
    await supabase
      .from("bookings")
      .update({
        stripe_session_id: session.id,
        payment_link: session.url,
      })
      .eq("id", booking.id);

    // Return checkout URL
    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: session.url,
        session_id: session.id,
        booking_id: booking.id,
        amount: amount_in_cents,
        application_fee: application_fee_cents,
        expires_at: session.expires_at,
        message: "Checkout session created successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Checkout creation error:", error);

    return new Response(
      JSON.stringify({
        error: (error as Error).message || "Failed to create checkout session",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
