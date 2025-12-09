/**
 * Stripe Connect Organization Edge Function
 * 
 * Handles Stripe Connect operations for organizations:
 * - Create Express accounts
 * - Generate account links
 * - Get account details
 * - Create login links
 * 
 * @endpoint POST /functions/v1/stripe-connect-org
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client
function getSupabaseClient(authHeader: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );
}

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

interface RequestBody {
  action: 'create_account' | 'create_account_link' | 'get_account' | 'create_login_link';
  organizationId?: string;
  email?: string;
  country?: string;
  businessType?: 'individual' | 'company';
  businessName?: string;
  accountId?: string;
  refreshUrl?: string;
  returnUrl?: string;
  type?: 'account_onboarding' | 'account_update';
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: RequestBody = await req.json();
    const { action } = body;

    console.log(`[stripe-connect-org] Action: ${action}`);

    switch (action) {
      // ============================================================
      // CREATE EXPRESS ACCOUNT
      // ============================================================
      case 'create_account': {
        const { organizationId, email, country, businessType, businessName } = body;

        if (!organizationId || !email || !country) {
          return new Response(
            JSON.stringify({ error: 'organizationId, email, and country are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create Express account
        const account = await stripe.accounts.create({
          type: 'express',
          email,
          country,
          business_type: businessType || 'company',
          business_profile: {
            name: businessName,
          },
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          metadata: {
            organization_id: organizationId,
            created_via: 'edge_function',
          },
        });

        console.log(`[stripe-connect-org] Account created: ${account.id}`);

        // Generate onboarding link
        // Use the app URL from environment or default
        const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
        
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${appUrl}/settings?tab=payments&refresh=true`,
          return_url: `${appUrl}/settings?tab=payments&success=true`,
          type: 'account_onboarding',
        });

        // Update organization with account ID
        const supabaseAdmin = getSupabaseAdmin();
        await supabaseAdmin
          .from('organizations')
          .update({
            stripe_account_id: account.id,
            stripe_onboarding_status: 'in_progress',
            updated_at: new Date().toISOString(),
          })
          .eq('id', organizationId);

        return new Response(
          JSON.stringify({
            accountId: account.id,
            onboardingUrl: accountLink.url,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================================
      // CREATE ACCOUNT LINK (for continuing onboarding)
      // ============================================================
      case 'create_account_link': {
        const { accountId, refreshUrl, returnUrl, type } = body;

        if (!accountId) {
          return new Response(
            JSON.stringify({ error: 'accountId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
        
        const accountLink = await stripe.accountLinks.create({
          account: accountId,
          refresh_url: refreshUrl || `${appUrl}/settings?tab=payments&refresh=true`,
          return_url: returnUrl || `${appUrl}/settings?tab=payments&success=true`,
          type: type || 'account_onboarding',
        });

        return new Response(
          JSON.stringify({ url: accountLink.url }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================================
      // GET ACCOUNT DETAILS
      // ============================================================
      case 'get_account': {
        const { accountId } = body;

        if (!accountId) {
          return new Response(
            JSON.stringify({ error: 'accountId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const account = await stripe.accounts.retrieve(accountId);

        return new Response(
          JSON.stringify({
            id: account.id,
            type: account.type,
            email: account.email,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            detailsSubmitted: account.details_submitted,
            country: account.country,
            defaultCurrency: account.default_currency,
            businessProfile: account.business_profile,
            requirements: account.requirements,
            capabilities: {
              cardPayments: account.capabilities?.card_payments,
              transfers: account.capabilities?.transfers,
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // ============================================================
      // CREATE LOGIN LINK (for Stripe Dashboard)
      // ============================================================
      case 'create_login_link': {
        const { accountId } = body;

        if (!accountId) {
          return new Response(
            JSON.stringify({ error: 'accountId is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const loginLink = await stripe.accounts.createLoginLink(accountId);

        return new Response(
          JSON.stringify({ url: loginLink.url }),
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
    console.error('[stripe-connect-org] Error:', error);

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
