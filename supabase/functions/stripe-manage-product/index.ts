// @ts-nocheck - Deno types
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check for Stripe secret key
  const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!stripeSecretKey) {
    console.error('STRIPE_SECRET_KEY is not set in environment');
    return new Response(
      JSON.stringify({ 
        error: 'Stripe API key not configured. Please set STRIPE_SECRET_KEY in Supabase secrets.',
        help: 'Run: supabase secrets set STRIPE_SECRET_KEY=sk_...'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }

  // Initialize Stripe with the key
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-06-20',
    httpClient: Stripe.createFetchHttpClient(),
  });

  try {
    const body = await req.json();
    const { action, ...params } = body;
    console.log(`Stripe action: ${action}`, JSON.stringify(params).slice(0, 200));

    let result;

    switch (action) {
      case 'get_product':
        result = { product: await stripe.products.retrieve(params.productId) };
        break;

      case 'get_prices':
        const pricesList = await stripe.prices.list({
          product: params.productId,
          active: true,
          limit: 100,
        });
        result = { prices: pricesList.data };
        break;

      case 'get_price_by_lookup_key':
        const lookupPrices = await stripe.prices.list({
          lookup_keys: [params.lookupKey],
          active: true,
          limit: 1,
        });
        result = { price: lookupPrices.data[0] || null };
        break;

      case 'create_product':
        const newProduct = await stripe.products.create({
          name: params.name,
          description: params.description || '',
          metadata: params.metadata || {},
        });
        result = { productId: newProduct.id };
        break;

      case 'create_price':
        const newPrice = await stripe.prices.create({
          product: params.product,
          unit_amount: params.unit_amount,
          currency: params.currency || 'usd',
          metadata: params.metadata || {},
        });
        result = { priceId: newPrice.id };
        break;

      case 'update_product':
        const { productId, ...updates } = params;
        const updatedProduct = await stripe.products.update(productId, updates);
        result = { productId: updatedProduct.id };
        break;

      case 'archive_product':
        const archivedProduct = await stripe.products.update(params.productId, { active: false });
        result = { productId: archivedProduct.id, archived: true };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Stripe action ${action} completed:`, JSON.stringify(result).slice(0, 200));
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Stripe error:', error.message || error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Stripe operation failed',
        type: error.type || 'unknown'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
