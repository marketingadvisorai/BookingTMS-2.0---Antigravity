/**
 * Stripe Connect OAuth Edge Function
 * 
 * Handles OAuth flow for connecting existing Stripe accounts:
 * - Generate OAuth URL with proper state
 * - Exchange authorization code for account ID
 * - Update organization with connected account
 * 
 * @endpoint POST /functions/v1/stripe-connect-oauth
 * @version 1.0.0
 * @date Dec 08, 2025
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Stripe with platform secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

function getSupabaseAdmin() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

interface OAuthState {
  organization_id: string;
  user_id: string;
  email: string;
  return_url: string;
  timestamp: number;
}

interface RequestBody {
  action: 'generate_oauth_url' | 'exchange_code' | 'get_account_status';
  organizationId?: string;
  userId?: string;
  email?: string;
  returnUrl?: string;
  code?: string;
  state?: string;
  accountId?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { action } = body;

    console.log(`[stripe-connect-oauth] Action: ${action}`);

    switch (action) {
      // ============================================================
      // GENERATE OAUTH URL
      // ============================================================
      case 'generate_oauth_url': {
        const { organizationId, userId, email, returnUrl } = body;

        if (!organizationId) {
          return new Response(
            JSON.stringify({ error: 'organizationId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const clientId = Deno.env.get('STRIPE_CONNECT_CLIENT_ID');
        if (!clientId) {
          return new Response(
            JSON.stringify({ error: 'STRIPE_CONNECT_CLIENT_ID not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create state with organization info (expires in 10 minutes)
        const stateData: OAuthState = {
          organization_id: organizationId,
          user_id: userId || '',
          email: email || '',
          return_url: returnUrl || '',
          timestamp: Date.now(),
        };

        const state = btoa(JSON.stringify(stateData));

        // Get app URL from Supabase URL
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const appUrl = supabaseUrl.replace('.supabase.co', '.app.bookingtms.com')
          .replace('https://qftjyjpitnoapqxlrvfs.supabase.co', 'https://app.bookingtms.com');
        
        // Use a proper redirect URI that will work with your app
        const redirectUri = `${returnUrl?.split('/settings')[0] || 'https://app.bookingtms.com'}/stripe/oauth/callback`;

        // Build OAuth URL
        const params = new URLSearchParams({
          response_type: 'code',
          client_id: clientId,
          scope: 'read_write',
          redirect_uri: redirectUri,
          state: state,
        });

        // Pre-fill user info if available
        if (email) {
          params.append('stripe_user[email]', email);
        }

        const oauthUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`;

        return new Response(
          JSON.stringify({
            oauthUrl,
            state,
            expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================================
      // EXCHANGE CODE FOR ACCOUNT ID
      // ============================================================
      case 'exchange_code': {
        const { code, state } = body;

        if (!code || !state) {
          return new Response(
            JSON.stringify({ error: 'code and state are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Decode and validate state
        let stateData: OAuthState;
        try {
          stateData = JSON.parse(atob(state));
        } catch {
          return new Response(
            JSON.stringify({ error: 'Invalid state parameter' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check state expiration (10 minutes)
        if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
          return new Response(
            JSON.stringify({ error: 'OAuth state expired. Please try again.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Exchange code for Stripe account ID
        const response = await stripe.oauth.token({
          grant_type: 'authorization_code',
          code,
        });

        if (!response.stripe_user_id) {
          return new Response(
            JSON.stringify({ error: 'Failed to get Stripe account ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const accountId = response.stripe_user_id;

        // Get account details
        const account = await stripe.accounts.retrieve(accountId);

        // Update organization with connected account
        const supabaseAdmin = getSupabaseAdmin();
        const { error: updateError } = await supabaseAdmin
          .from('organizations')
          .update({
            stripe_account_id: accountId,
            stripe_connect_enabled: true,
            stripe_charges_enabled: account.charges_enabled,
            stripe_payouts_enabled: account.payouts_enabled,
            stripe_details_submitted: account.details_submitted,
            stripe_business_name: account.business_profile?.name || null,
            stripe_verification_status: account.requirements?.disabled_reason || 'verified',
            stripe_onboarding_completed_at: account.details_submitted ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', stateData.organization_id);

        if (updateError) {
          console.error('[stripe-connect-oauth] Update error:', updateError);
          return new Response(
            JSON.stringify({ error: 'Failed to update organization' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[stripe-connect-oauth] Account linked: ${accountId} → org ${stateData.organization_id}`);

        return new Response(
          JSON.stringify({
            success: true,
            accountId,
            organizationId: stateData.organization_id,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            detailsSubmitted: account.details_submitted,
            returnUrl: stateData.return_url,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================================
      // GET ACCOUNT STATUS
      // ============================================================
      case 'get_account_status': {
        const { accountId, organizationId } = body;

        if (!accountId && !organizationId) {
          return new Response(
            JSON.stringify({ error: 'accountId or organizationId required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        let stripeAccountId = accountId;

        // If organizationId provided, look up the account
        if (!stripeAccountId && organizationId) {
          const supabaseAdmin = getSupabaseAdmin();
          const { data: org } = await supabaseAdmin
            .from('organizations')
            .select('stripe_account_id')
            .eq('id', organizationId)
            .single();

          if (!org?.stripe_account_id) {
            return new Response(
              JSON.stringify({ 
                connected: false, 
                message: 'No Stripe account linked' 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          stripeAccountId = org.stripe_account_id;
        }

        // Get account from Stripe
        const account = await stripe.accounts.retrieve(stripeAccountId);

        // Sync status to database
        const supabaseAdmin = getSupabaseAdmin();
        if (organizationId) {
          await supabaseAdmin
            .from('organizations')
            .update({
              stripe_charges_enabled: account.charges_enabled,
              stripe_payouts_enabled: account.payouts_enabled,
              stripe_details_submitted: account.details_submitted,
              stripe_verification_status: account.requirements?.disabled_reason || 'verified',
              stripe_disabled_reason: account.requirements?.disabled_reason || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', organizationId);
        }

        return new Response(
          JSON.stringify({
            connected: true,
            accountId: account.id,
            type: account.type,
            email: account.email,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            detailsSubmitted: account.details_submitted,
            country: account.country,
            defaultCurrency: account.default_currency,
            businessName: account.business_profile?.name,
            requirements: {
              currentlyDue: account.requirements?.currently_due || [],
              eventuallyDue: account.requirements?.eventually_due || [],
              pastDue: account.requirements?.past_due || [],
              disabledReason: account.requirements?.disabled_reason,
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error) {
    console.error('[stripe-connect-oauth] Error:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
