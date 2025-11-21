
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

interface BookingRequest {
    session_id: string;
    activity_id: string;
    organization_id: string;
    party_size: number;
    customer_id?: string; // Optional, if user is already logged in
    customer_details?: {
        email: string;
        name: string;
        phone?: string;
    };
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Parse Request
        const {
            session_id,
            activity_id,
            organization_id,
            party_size,
            customer_id,
            customer_details,
        }: BookingRequest = await req.json();

        if (!session_id || !activity_id || !organization_id || !party_size) {
            throw new Error("Missing required fields");
        }

        // 2. Fetch Session to Validate Price & Capacity
        const { data: session, error: sessionError } = await supabase
            .from("activity_sessions")
            .select("price_at_generation, capacity_remaining, is_closed")
            .eq("id", session_id)
            .single();

        if (sessionError || !session) {
            throw new Error("Session not found");
        }

        if (session.is_closed) {
            throw new Error("Session is closed");
        }

        if (session.capacity_remaining < party_size) {
            throw new Error("Insufficient capacity");
        }

        // 3. Calculate Total Amount
        const pricePerPerson = Number(session.price_at_generation) || 0;
        const totalAmount = pricePerPerson * party_size;
        const amountInCents = Math.round(totalAmount * 100);

        // 4. Handle Customer (Find or Create)
        let finalCustomerId = customer_id;
        let stripeCustomerId: string | undefined;

        if (!finalCustomerId && customer_details) {
            // Check if customer exists by email in this org
            const { data: existingCustomer } = await supabase
                .from("customers")
                .select("id, stripe_customer_id")
                .eq("email", customer_details.email)
                .eq("organization_id", organization_id)
                .single();

            if (existingCustomer) {
                finalCustomerId = existingCustomer.id;
                stripeCustomerId = existingCustomer.stripe_customer_id;
            } else {
                // Create new customer in DB
                const { data: newCustomer, error: createError } = await supabase
                    .from("customers")
                    .insert({
                        organization_id,
                        email: customer_details.email,
                        first_name: customer_details.name.split(" ")[0],
                        last_name: customer_details.name.split(" ").slice(1).join(" ") || "",
                        phone: customer_details.phone,
                        created_via: "booking_widget",
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                finalCustomerId = newCustomer.id;
            }
        }

        // 5. Create Stripe Payment Intent
        // We need the organization's Stripe Account ID to create the payment on their behalf (Connect)
        // For now, assuming standard account or platform account. 
        // If Connect, we'd pass { stripeAccount: org.stripe_account_id }

        // Fetch Org Stripe Account ID
        const { data: org } = await supabase
            .from('organizations')
            .select('stripe_account_id')
            .eq('id', organization_id)
            .single();

        const stripeOptions = org?.stripe_account_id ? { stripeAccount: org.stripe_account_id } : {};

        // Create Stripe Customer if needed (optional for PaymentIntent but good for records)
        if (!stripeCustomerId && customer_details && stripeOptions.stripeAccount) {
            const stripeCustomer = await stripe.customers.create({
                email: customer_details.email,
                name: customer_details.name,
                metadata: { supabase_id: finalCustomerId }
            }, stripeOptions);
            stripeCustomerId = stripeCustomer.id;

            // Update DB with Stripe ID
            if (finalCustomerId) {
                await supabase.from('customers').update({ stripe_customer_id: stripeCustomerId }).eq('id', finalCustomerId);
            }
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "usd",
            customer: stripeCustomerId,
            automatic_payment_methods: { enabled: true },
            metadata: {
                session_id,
                activity_id,
                organization_id,
                party_size: party_size.toString(),
                customer_id: finalCustomerId || "",
                // Important: We don't have a booking ID yet. 
                // We will create the booking AFTER payment success via webhook, 
                // OR we create a 'pending' booking now.
                // Best practice: Create 'pending' booking now to reserve the slot temporarily?
                // Actually, the RPC `create_booking_transaction` does the reservation.
                // Let's create a PENDING booking now to track it.
            },
        }, stripeOptions);

        // 6. Create Pending Booking (Optional but recommended for tracking)
        // We use the RPC to ensure capacity is reserved? 
        // If we use RPC now, we reserve capacity. If payment fails, we must release it.
        // Alternatively, we just return the PaymentIntent and let the Webhook call the RPC.
        // BUT, if we wait for webhook, capacity might be taken by someone else in the meantime.
        // BETTER APPROACH: Reserve capacity now (create booking with status 'pending_payment').

        // Let's call the RPC to create the booking with 'pending_payment' status.
        // Note: The RPC currently sets status to 'confirmed'. We might need to adjust it or update it immediately.

        const { data: bookingId, error: rpcError } = await supabase.rpc('create_booking_transaction', {
            p_session_id: session_id,
            p_customer_id: finalCustomerId,
            p_organization_id: organization_id,
            p_party_size: party_size
        });

        if (rpcError) {
            // Cancel payment intent if booking fails
            await stripe.paymentIntents.cancel(paymentIntent.id, stripeOptions);
            throw new Error(`Booking failed: ${rpcError.message}`);
        }

        // Update booking with Payment Intent ID and set status to pending_payment
        await supabase
            .from('bookings')
            .update({
                stripe_payment_intent_id: paymentIntent.id,
                status: 'pending_payment',
                payment_status: 'unpaid'
            })
            .eq('id', bookingId);

        // Update Payment Intent with Booking ID for Webhook tracking
        await stripe.paymentIntents.update(paymentIntent.id, {
            metadata: { booking_id: bookingId }
        }, stripeOptions);

        return new Response(
            JSON.stringify({
                clientSecret: paymentIntent.client_secret,
                bookingId: bookingId,
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );

    } catch (error) {
        console.error("Error creating booking:", error);
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});
