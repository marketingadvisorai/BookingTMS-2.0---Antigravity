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

interface CreateAccountRequest {
  organization_id: string;
  email: string;
  business_name?: string;
  business_url?: string;
  country?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { organization_id, email, business_name, business_url, country = "US" }: CreateAccountRequest = 
      await req.json();

    // Verify user belongs to this organization
    const { data: orgMember, error: memberError } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organization_id)
      .eq("user_id", user.id)
      .single();

    if (memberError || !orgMember || orgMember.role !== "admin") {
      throw new Error("Only organization admins can create Stripe accounts");
    }

    // Check if organization already has Stripe account
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("stripe_account_id, name, stripe_onboarding_status")
      .eq("id", organization_id)
      .single();

    if (orgError) throw orgError;

    if (org.stripe_account_id) {
      return new Response(
        JSON.stringify({
          error: "Organization already has a Stripe account",
          account_id: org.stripe_account_id,
          onboarding_status: org.stripe_onboarding_status,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Stripe Connect account (Standard type)
    const account = await stripe.accounts.create({
      type: "standard",
      country: country,
      email: email,
      business_type: "company",
      company: {
        name: business_name || org.name,
      },
      business_profile: {
        url: business_url,
        name: business_name || org.name,
        support_email: email,
      },
      metadata: {
        organization_id: organization_id,
        platform: "BookingTMS",
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Update organization with Stripe account info
    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        stripe_account_id: account.id,
        stripe_account_type: account.type,
        stripe_charges_enabled: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled,
        stripe_details_submitted: account.details_submitted,
        stripe_onboarding_status: account.details_submitted ? "complete" : "pending",
        stripe_business_name: business_name || org.name,
        stripe_business_url: business_url,
        stripe_support_email: email,
        stripe_account_created_at: new Date().toISOString(),
        stripe_account_updated_at: new Date().toISOString(),
      })
      .eq("id", organization_id);

    if (updateError) {
      console.error("Failed to update organization:", updateError);
      // Still return success since Stripe account was created
    }

    return new Response(
      JSON.stringify({
        success: true,
        account_id: account.id,
        account_type: account.type,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        onboarding_required: !account.details_submitted,
        message: account.details_submitted 
          ? "Stripe account created and activated!"
          : "Stripe account created. Onboarding required.",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create Stripe account",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
