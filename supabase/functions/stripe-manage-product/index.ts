import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();

    let result;

    switch (action) {
      case 'create_product':
        result = await createProduct(params);
        break;

      case 'create_price':
        result = await createPrice(params);
        break;

      case 'update_product':
        result = await updateProduct(params);
        break;

      case 'archive_product':
        result = await archiveProduct(params);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function createProduct(params: {
  name: string;
  description: string;
  metadata?: Record<string, string>;
}) {
  const product = await stripe.products.create({
    name: params.name,
    description: params.description,
    metadata: params.metadata || {},
  });

  return { productId: product.id };
}

async function createPrice(params: {
  product: string;
  unit_amount: number;
  currency: string;
  metadata?: Record<string, string>;
}) {
  const price = await stripe.prices.create({
    product: params.product,
    unit_amount: params.unit_amount,
    currency: params.currency,
    metadata: params.metadata || {},
  });

  return { priceId: price.id };
}

async function updateProduct(params: {
  productId: string;
  name?: string;
  description?: string;
  metadata?: Record<string, string>;
}) {
  const { productId, ...updates } = params;

  const product = await stripe.products.update(productId, updates);

  return { productId: product.id };
}

async function archiveProduct(params: { productId: string }) {
  const product = await stripe.products.update(params.productId, {
    active: false,
  });

  return { productId: product.id, archived: true };
}
