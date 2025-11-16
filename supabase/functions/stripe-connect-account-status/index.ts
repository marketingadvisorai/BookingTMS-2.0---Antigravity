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

interface AccountStatusRequest {
  organization_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) throw new Error("Unauthorized");

    const { organization_id }: AccountStatusRequest = await req.json();

    // Verify user belongs to organization
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organization_id)
      .eq("user_id", user.id)
      .single();

    if (!orgMember) {
      throw new Error("You do not belong to this organization");
    }

    // Get organization's Stripe account ID
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("stripe_account_id")
      .eq("id", organization_id)
      .single();

    if (orgError) throw orgError;
    if (!org.stripe_account_id) {
      throw new Error("Organization does not have a Stripe account");
    }

    // Fetch account details from Stripe
    const account = await stripe.accounts.retrieve(org.stripe_account_id);

    // Determine onboarding status
    let onboarding_status = "not_started";
    if (account.details_submitted) {
      onboarding_status = "complete";
    } else if (account.requirements?.currently_due && account.requirements.currently_due.length > 0) {
      onboarding_status = "pending";
    }

    if (account.requirements?.disabled_reason) {
      onboarding_status = "disabled";
    }

    // Update organization with latest account status
    const { error: updateError } = await supabase
      .from("organizations")
      .update({
        stripe_charges_enabled: account.charges_enabled,
        stripe_payouts_enabled: account.payouts_enabled,
        stripe_details_submitted: account.details_submitted,
        stripe_requirements_currently_due: account.requirements?.currently_due || [],
        stripe_requirements_eventually_due: account.requirements?.eventually_due || [],
        stripe_onboarding_status: onboarding_status,
        stripe_disabled_reason: account.requirements?.disabled_reason || null,
        stripe_verification_status: account.requirements?.disabled_reason ? "failed" : "verified",
        stripe_account_updated_at: new Date().toISOString(),
      })
      .eq("id", organization_id);

    if (updateError) {
      console.error("Failed to update organization:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        account_id: account.id,
        account_type: account.type,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
        onboarding_status: onboarding_status,
        requirements: {
          currently_due: account.requirements?.currently_due || [],
          eventually_due: account.requirements?.eventually_due || [],
          past_due: account.requirements?.past_due || [],
          disabled_reason: account.requirements?.disabled_reason,
        },
        capabilities: {
          card_payments: account.capabilities?.card_payments,
          transfers: account.capabilities?.transfers,
        },
        business_profile: {
          name: account.business_profile?.name,
          url: account.business_profile?.url,
          support_email: account.business_profile?.support_email,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching account status:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to fetch account status",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
