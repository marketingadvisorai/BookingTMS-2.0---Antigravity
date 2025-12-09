/**
 * Stripe Billing Edge Function
 * Handles subscription management and credit purchases
 * 
 * @version 2.0.0
 * @date December 10, 2025
 * 
 * Cache Strategy:
 * - GET operations (get_billing_data, get_invoices): SHORT cache (1 min)
 * - Mutations (create_*, buy_*, sync_*): No cache
 */

import { createClient } from 'npm:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.5.0';
import { 
  CACHE_PRESETS, 
  withCorsHeaders 
} from '../_shared/edgeCacheHeaders.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache headers for read operations (1 minute)
const readCacheHeaders = withCorsHeaders(CACHE_PRESETS.SHORT);
// No cache headers for mutations
const mutationHeaders = withCorsHeaders(CACHE_PRESETS.NONE);

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, ...params } = await req.json();

    switch (action) {
      case 'get_billing_data':
        return await getBillingData(supabase, params);
      
      case 'create_checkout_session':
        return await createCheckoutSession(supabase, params);
      
      case 'create_portal_session':
        return await createPortalSession(supabase, params);
      
      case 'buy_credits':
        return await buyCredits(supabase, params);
      
      case 'get_invoices':
        return await getInvoices(supabase, params);
      
      case 'sync_subscription':
        return await syncSubscription(supabase, params);
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error: any) {
    console.error('Billing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Get complete billing data for an organization
 */
async function getBillingData(supabase: any, params: { organization_id: string }) {
  const { organization_id } = params;

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, subscription_plans(*)')
    .eq('organization_id', organization_id)
    .single();

  // Get credit balance
  const { data: creditBalance } = await supabase
    .from('credit_balances')
    .select('*')
    .eq('organization_id', organization_id)
    .single();

  // Get recent transactions
  const { data: transactions } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('organization_id', organization_id)
    .order('created_at', { ascending: false })
    .limit(10);

  // Get payment methods
  const { data: paymentMethods } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('organization_id', organization_id)
    .order('is_default', { ascending: false });

  // Get all plans
  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  // Get credit packages
  const { data: creditPackages } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  // Get recent invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('organization_id', organization_id)
    .order('created_at', { ascending: false })
    .limit(12);

  // Use read cache headers (1 min) for billing data
  return new Response(
    JSON.stringify({
      subscription,
      creditBalance,
      transactions,
      paymentMethods,
      plans,
      creditPackages,
      invoices,
    }),
    { headers: { ...readCacheHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Create Stripe Checkout session for subscription upgrade
 */
async function createCheckoutSession(supabase: any, params: {
  organization_id: string;
  price_id: string;
  success_url: string;
  cancel_url: string;
}) {
  const { organization_id, price_id, success_url, cancel_url } = params;

  // Get organization
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id, owner_email, name')
    .eq('id', organization_id)
    .single();

  let customerId = org?.stripe_customer_id;

  // Create customer if needed
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: org?.owner_email,
      name: org?.name,
      metadata: { organization_id },
    });
    customerId = customer.id;

    // Save customer ID
    await supabase
      .from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', organization_id);
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: price_id, quantity: 1 }],
    success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url,
    metadata: { organization_id },
    subscription_data: {
      metadata: { organization_id },
    },
    billing_address_collection: 'required',
    payment_method_types: ['card'],
  });

  return new Response(
    JSON.stringify({ url: session.url, session_id: session.id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Create Stripe Customer Portal session
 */
async function createPortalSession(supabase: any, params: {
  organization_id: string;
  return_url: string;
}) {
  const { organization_id, return_url } = params;

  // Get organization's Stripe customer ID
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', organization_id)
    .single();

  if (!org?.stripe_customer_id) {
    throw new Error('No Stripe customer found for this organization');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url,
  });

  return new Response(
    JSON.stringify({ url: session.url }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Create checkout session for credit purchase
 */
async function buyCredits(supabase: any, params: {
  organization_id: string;
  package_id: string;
  success_url: string;
  cancel_url: string;
}) {
  const { organization_id, package_id, success_url, cancel_url } = params;

  // Get credit package
  const { data: pkg } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('id', package_id)
    .single();

  if (!pkg) throw new Error('Credit package not found');

  // Get organization
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id, owner_email, name')
    .eq('id', organization_id)
    .single();

  let customerId = org?.stripe_customer_id;

  // Create customer if needed
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: org?.owner_email,
      name: org?.name,
      metadata: { organization_id },
    });
    customerId = customer.id;

    await supabase
      .from('organizations')
      .update({ stripe_customer_id: customerId })
      .eq('id', organization_id);
  }

  // Create checkout session for one-time payment
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    line_items: [{
      price: pkg.stripe_price_id,
      quantity: 1,
    }],
    success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}&credits=${pkg.credits}`,
    cancel_url,
    metadata: {
      organization_id,
      package_id,
      credits: String(pkg.credits),
      type: 'credit_purchase',
    },
    payment_method_types: ['card'],
  });

  return new Response(
    JSON.stringify({ url: session.url, session_id: session.id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Get invoices from Stripe
 */
async function getInvoices(supabase: any, params: {
  organization_id: string;
  limit?: number;
}) {
  const { organization_id, limit = 12 } = params;

  // Get organization's Stripe customer ID
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', organization_id)
    .single();

  if (!org?.stripe_customer_id) {
    return new Response(
      JSON.stringify({ invoices: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Fetch from Stripe
  const invoices = await stripe.invoices.list({
    customer: org.stripe_customer_id,
    limit,
  });

  // Sync to database
  for (const inv of invoices.data) {
    await supabase
      .from('invoices')
      .upsert({
        stripe_invoice_id: inv.id,
        organization_id,
        stripe_customer_id: inv.customer as string,
        stripe_subscription_id: inv.subscription as string,
        invoice_number: inv.number,
        status: inv.status,
        amount_due: inv.amount_due,
        amount_paid: inv.amount_paid,
        amount_remaining: inv.amount_remaining,
        subtotal: inv.subtotal,
        tax: inv.tax || 0,
        total: inv.total,
        currency: inv.currency,
        period_start: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
        period_end: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
        hosted_invoice_url: inv.hosted_invoice_url,
        invoice_pdf: inv.invoice_pdf,
        due_date: inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null,
        paid_at: inv.status_transitions?.paid_at 
          ? new Date(inv.status_transitions.paid_at * 1000).toISOString() 
          : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_invoice_id' });
  }

  return new Response(
    JSON.stringify({
      invoices: invoices.data.map(inv => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        amount_due: inv.amount_due / 100,
        amount_paid: inv.amount_paid / 100,
        currency: inv.currency,
        period_start: inv.period_start,
        period_end: inv.period_end,
        hosted_invoice_url: inv.hosted_invoice_url,
        invoice_pdf: inv.invoice_pdf,
        created: inv.created,
      })),
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

/**
 * Sync subscription data from Stripe
 */
async function syncSubscription(supabase: any, params: {
  organization_id: string;
}) {
  const { organization_id } = params;

  // Get organization's Stripe customer ID
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', organization_id)
    .single();

  if (!org?.stripe_customer_id) {
    return new Response(
      JSON.stringify({ synced: false, message: 'No Stripe customer' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get active subscription from Stripe
  const subscriptions = await stripe.subscriptions.list({
    customer: org.stripe_customer_id,
    status: 'all',
    limit: 1,
  });

  if (subscriptions.data.length === 0) {
    return new Response(
      JSON.stringify({ synced: false, message: 'No subscription found' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const sub = subscriptions.data[0];
  const priceId = sub.items.data[0]?.price.id;

  // Find matching plan
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('id')
    .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
    .single();

  // Update subscription in database
  await supabase
    .from('subscriptions')
    .upsert({
      organization_id,
      stripe_subscription_id: sub.id,
      stripe_customer_id: sub.customer as string,
      stripe_price_id: priceId,
      plan_id: plan?.id,
      status: sub.status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      canceled_at: sub.canceled_at 
        ? new Date(sub.canceled_at * 1000).toISOString() 
        : null,
      billing_cycle: sub.items.data[0]?.price.recurring?.interval === 'year' 
        ? 'yearly' 
        : 'monthly',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id' });

  return new Response(
    JSON.stringify({ synced: true, subscription: sub }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
