/**
 * Stripe Payments Data Edge Function
 * Fetches real payment data from Stripe for connected accounts
 * 
 * Actions:
 * - list_payments: Get payment intents for org
 * - list_refunds: Get refunds for org
 * - get_balance: Get balance for connected account
 * - get_payouts: Get payouts for connected account
 */

import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.5.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { action, organizationId, limit = 50, startingAfter, createdAfter, createdBefore } = body;

    if (!organizationId) {
      return new Response(JSON.stringify({ error: 'Organization ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get organization's Stripe account
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('stripe_account_id, stripe_customer_id')
      .eq('id', organizationId)
      .single();

    if (orgError || !org?.stripe_account_id) {
      return new Response(JSON.stringify({ 
        error: 'Stripe account not connected',
        data: [],
        hasMore: false,
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let result: any;

    switch (action) {
      case 'list_payments': {
        const params: Stripe.PaymentIntentListParams = {
          limit: Math.min(limit, 100),
        };

        if (startingAfter) params.starting_after = startingAfter;
        if (createdAfter) params.created = { gte: createdAfter };
        if (createdBefore) params.created = { ...params.created as any, lte: createdBefore };

        const payments = await stripe.paymentIntents.list(params, {
          stripeAccount: org.stripe_account_id,
        });

        result = {
          data: payments.data.map((pi) => ({
            id: pi.id,
            amount: pi.amount,
            currency: pi.currency,
            status: pi.status,
            created: pi.created,
            description: pi.description,
            metadata: pi.metadata,
            customer: pi.customer,
            receiptEmail: pi.receipt_email,
            paymentMethod: pi.payment_method,
          })),
          hasMore: payments.has_more,
        };
        break;
      }

      case 'list_charges': {
        const params: Stripe.ChargeListParams = {
          limit: Math.min(limit, 100),
        };

        if (startingAfter) params.starting_after = startingAfter;
        if (createdAfter) params.created = { gte: createdAfter };

        const charges = await stripe.charges.list(params, {
          stripeAccount: org.stripe_account_id,
        });

        result = {
          data: charges.data.map((ch) => ({
            id: ch.id,
            amount: ch.amount,
            amountRefunded: ch.amount_refunded,
            currency: ch.currency,
            status: ch.status,
            created: ch.created,
            description: ch.description,
            metadata: ch.metadata,
            customer: ch.customer,
            receiptEmail: ch.receipt_email,
            refunded: ch.refunded,
            paymentIntent: ch.payment_intent,
            paymentMethodDetails: {
              type: ch.payment_method_details?.type,
              card: ch.payment_method_details?.card ? {
                brand: ch.payment_method_details.card.brand,
                last4: ch.payment_method_details.card.last4,
                expMonth: ch.payment_method_details.card.exp_month,
                expYear: ch.payment_method_details.card.exp_year,
              } : null,
            },
          })),
          hasMore: charges.has_more,
        };
        break;
      }

      case 'list_refunds': {
        const params: Stripe.RefundListParams = {
          limit: Math.min(limit, 100),
        };

        if (startingAfter) params.starting_after = startingAfter;

        const refunds = await stripe.refunds.list(params, {
          stripeAccount: org.stripe_account_id,
        });

        result = {
          data: refunds.data.map((rf) => ({
            id: rf.id,
            amount: rf.amount,
            currency: rf.currency,
            status: rf.status,
            created: rf.created,
            reason: rf.reason,
            chargeId: rf.charge,
            paymentIntentId: rf.payment_intent,
          })),
          hasMore: refunds.has_more,
        };
        break;
      }

      case 'get_balance': {
        const balance = await stripe.balance.retrieve({
          stripeAccount: org.stripe_account_id,
        });

        result = {
          available: balance.available,
          pending: balance.pending,
        };
        break;
      }

      case 'list_payouts': {
        const params: Stripe.PayoutListParams = {
          limit: Math.min(limit, 100),
        };

        if (startingAfter) params.starting_after = startingAfter;

        const payouts = await stripe.payouts.list(params, {
          stripeAccount: org.stripe_account_id,
        });

        result = {
          data: payouts.data.map((po) => ({
            id: po.id,
            amount: po.amount,
            currency: po.currency,
            status: po.status,
            created: po.created,
            arrivalDate: po.arrival_date,
            method: po.method,
            type: po.type,
          })),
          hasMore: payouts.has_more,
        };
        break;
      }

      case 'get_revenue_summary': {
        // Get charges for summary
        const now = Math.floor(Date.now() / 1000);
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60);

        const [charges, refunds] = await Promise.all([
          stripe.charges.list(
            { created: { gte: thirtyDaysAgo }, limit: 100 },
            { stripeAccount: org.stripe_account_id }
          ),
          stripe.refunds.list(
            { created: { gte: thirtyDaysAgo }, limit: 100 },
            { stripeAccount: org.stripe_account_id }
          ),
        ]);

        const totalRevenue = charges.data
          .filter(c => c.status === 'succeeded')
          .reduce((sum, c) => sum + c.amount, 0);

        const totalRefunds = refunds.data
          .filter(r => r.status === 'succeeded')
          .reduce((sum, r) => sum + r.amount, 0);

        const successfulCharges = charges.data.filter(c => c.status === 'succeeded').length;
        const failedCharges = charges.data.filter(c => c.status === 'failed').length;

        result = {
          totalRevenue: totalRevenue / 100,
          totalRefunds: totalRefunds / 100,
          netRevenue: (totalRevenue - totalRefunds) / 100,
          transactionCount: charges.data.length,
          successRate: charges.data.length > 0 
            ? Math.round((successfulCharges / charges.data.length) * 100) 
            : 0,
          failedCount: failedCharges,
          currency: 'usd',
        };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Stripe payments data error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
