import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

// Initialize Stripe with secret key from environment
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY not configured in environment');
}

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log request info for audit trail
    const userId = req.headers.get('x-user-id') || 'unknown';
    console.log('📋 Request from user ID:', userId);

    const { action, ...params } = await req.json();
    
    console.log('🎯 Action:', action);
    console.log('📦 Params:', JSON.stringify(params, null, 2));

    let result;

    switch (action) {
      case 'create_product_with_pricing':
        result = await createProductWithPricing(params);
        break;
      case 'get_price_by_lookup_key':
        result = await getPriceByLookupKey(params);
        break;
      case 'update_price_with_lookup_key':
        result = await updatePriceWithLookupKey(params);
        break;
      case 'get_product_prices':
        result = await getProductPrices(params);
        break;
      case 'link_existing_product':
        result = await linkExistingProduct(params);
        break;
      case 'create_checkout_session':
        result = await createCheckoutSession(params);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('❌ Stack:', error.stack);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

/**
 * Create product with multiple pricing options and lookup keys
 */
async function createProductWithPricing(params: any) {
  console.log('🎨 Creating product:', params.name);

  // Create product
  const product = await stripe.products.create({
    name: params.name,
    description: params.description,
    images: params.imageUrl ? [params.imageUrl] : [],
    metadata: params.metadata || {},
  });

  console.log('✅ Product created:', product.id);

  // Create prices for each pricing option
  const prices = [];
  for (const option of params.pricingOptions) {
    console.log(`💰 Creating price for ${option.type}: $${option.amount}`);

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(option.amount * 100), // Convert to cents
      currency: 'usd',
      lookup_key: option.lookupKey,
      metadata: {
        pricing_type: option.type,
        pricing_name: option.name,
      },
    });

    prices.push({
      priceId: price.id,
      type: option.type,
      amount: option.amount,
      lookupKey: price.lookup_key,
    });

    console.log(`✅ Price created: ${price.id} (${option.lookupKey})`);
  }

  return {
    productId: product.id,
    prices,
  };
}

/**
 * Get price by lookup key
 */
async function getPriceByLookupKey(params: any) {
  console.log('🔍 Fetching price by lookup key:', params.lookupKey);

  const prices = await stripe.prices.list({
    lookup_keys: [params.lookupKey],
    limit: 1,
  });

  if (prices.data.length === 0) {
    throw new Error(`No price found with lookup key: ${params.lookupKey}`);
  }

  const price = prices.data[0];
  console.log('✅ Found price:', price.id);

  return {
    priceId: price.id,
    productId: price.product as string,
    unitAmount: price.unit_amount || 0,
    currency: price.currency,
    lookupKey: price.lookup_key,
  };
}

/**
 * Update price and transfer lookup key
 */
async function updatePriceWithLookupKey(params: any) {
  console.log('🔄 Creating new price with lookup key transfer');

  const price = await stripe.prices.create({
    product: params.productId,
    unit_amount: Math.round(params.amount * 100),
    currency: 'usd',
    lookup_key: params.lookupKey,
    transfer_lookup_key: true,
    metadata: {
      pricing_type: params.type,
      updated_at: new Date().toISOString(),
    },
  });

  console.log('✅ Price updated:', price.id);

  return {
    priceId: price.id,
    lookupKey: price.lookup_key,
  };
}

/**
 * Get all prices for a product
 */
async function getProductPrices(params: any) {
  console.log('📋 Fetching prices for product:', params.productId);

  const prices = await stripe.prices.list({
    product: params.productId,
    limit: 100,
  });

  console.log(`✅ Found ${prices.data.length} prices`);

  return {
    prices: prices.data.map((price) => ({
      priceId: price.id,
      unitAmount: price.unit_amount || 0,
      currency: price.currency,
      lookupKey: price.lookup_key,
      metadata: price.metadata,
    })),
  };
}

/**
 * Link existing product
 */
async function linkExistingProduct(params: any) {
  console.log('🔗 Linking existing product:', params.productId);

  // Verify product exists
  const product = await stripe.products.retrieve(params.productId);
  console.log('✅ Product found:', product.name);

  // Get all prices for this product
  const prices = await stripe.prices.list({
    product: params.productId,
    limit: 100,
  });

  console.log(`✅ Found ${prices.data.length} prices`);

  return {
    productId: product.id,
    priceId: params.priceId,
    prices: prices.data.map((price) => ({
      priceId: price.id,
      unitAmount: price.unit_amount || 0,
      currency: price.currency,
      lookupKey: price.lookup_key,
      metadata: price.metadata,
    })),
  };
}

/**
 * Create checkout session
 */
async function createCheckoutSession(params: any) {
  console.log('🛒 Creating checkout session');

  const lineItems: any[] = [];

  if (params.priceId) {
    lineItems.push({
      price: params.priceId,
      quantity: params.quantity || 1,
    });
  } else if (params.lookupKey) {
    // Fetch price by lookup key first
    const prices = await stripe.prices.list({
      lookup_keys: [params.lookupKey],
      limit: 1,
    });

    if (prices.data.length === 0) {
      throw new Error(`No price found with lookup key: ${params.lookupKey}`);
    }

    lineItems.push({
      price: prices.data[0].id,
      quantity: params.quantity || 1,
    });
  } else {
    throw new Error('Either priceId or lookupKey must be provided');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata || {},
  });

  console.log('✅ Checkout session created:', session.id);

  return {
    sessionId: session.id,
    url: session.url,
  };
}
