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

interface AccountLinkRequest {
  organization_id: string;
  refresh_url?: string;
  return_url?: string;
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

    const { 
      organization_id, 
      refresh_url = `${Deno.env.get("APP_URL")}/dashboard/settings/payments`,
      return_url = `${Deno.env.get("APP_URL")}/dashboard/settings/payments?onboarding=complete`
    }: AccountLinkRequest = await req.json();

    // Verify user is admin
    const { data: orgMember } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organization_id)
      .eq("user_id", user.id)
      .single();

    if (!orgMember || orgMember.role !== "admin") {
      throw new Error("Only organization admins can access this");
    }

    // Get organization's Stripe account ID
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("stripe_account_id, stripe_onboarding_status")
      .eq("id", organization_id)
      .single();

    if (orgError) throw orgError;
    if (!org.stripe_account_id) {
      throw new Error("Organization does not have a Stripe account. Create one first.");
    }

    // Create account link
    const accountLink = await stripe.accountLinks.create({
      account: org.stripe_account_id,
      refresh_url: refresh_url,
      return_url: return_url,
      type: "account_onboarding",
    });

    // Update organization with link expiration
    await supabase
      .from("organizations")
      .update({
        stripe_onboarding_link_expires_at: new Date(accountLink.expires_at * 1000).toISOString(),
      })
      .eq("id", organization_id);

    return new Response(
      JSON.stringify({
        success: true,
        url: accountLink.url,
        expires_at: accountLink.expires_at,
        onboarding_status: org.stripe_onboarding_status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating account link:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create onboarding link",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
