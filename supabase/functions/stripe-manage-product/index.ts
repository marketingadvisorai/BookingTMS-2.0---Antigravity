// @ts-nocheck - Deno types
/**
 * Stripe Product & Price Management Edge Function
 * 
 * Supports multi-tier pricing with lookup keys for real-time updates:
 * - Adult pricing (required)
 * - Child pricing (optional)
 * - Custom capacity pricing (e.g., VIP, Equipment Rental)
 * 
 * Uses Stripe lookup_keys for seamless price updates without changing price IDs
 * 
 * @version 2.0.0
 * @date 2025-11-27
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper: Convert amount to cents
const toCents = (amount: number): number => Math.round(amount * 100);

// Helper: Generate lookup key for price tier
const generateLookupKey = (activityId: string, tierType: string): string => {
  const cleanId = activityId.replace(/-/g, '_');
  return `activity_${cleanId}_${tierType.toLowerCase()}`;
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
          ...(params.lookup_key && { lookup_key: params.lookup_key }),
        });
        result = { priceId: newPrice.id, lookupKey: params.lookup_key };
        break;

      /**
       * CREATE MULTI-TIER PRICES
       * Creates adult, child, and custom prices with lookup keys
       */
      case 'create_multi_tier_prices': {
        const { productId, activityId, adultPrice, childPrice, customPrices, currency = 'usd' } = params;
        
        const createdPrices: any = { adult: null, child: null, custom: [] };
        
        // Create adult price (required)
        if (adultPrice && adultPrice > 0) {
          const adultLookupKey = generateLookupKey(activityId, 'adult');
          const adultPriceObj = await stripe.prices.create({
            product: productId,
            unit_amount: toCents(adultPrice),
            currency,
            lookup_key: adultLookupKey,
            transfer_lookup_key: true, // Transfer key from existing price
            metadata: {
              tier_type: 'adult',
              activity_id: activityId,
              display_name: 'Adult',
            },
          });
          createdPrices.adult = {
            price_id: adultPriceObj.id,
            lookup_key: adultLookupKey,
            amount: adultPrice,
            currency,
          };
        }
        
        // Create child price (optional)
        if (childPrice && childPrice > 0) {
          const childLookupKey = generateLookupKey(activityId, 'child');
          const childPriceObj = await stripe.prices.create({
            product: productId,
            unit_amount: toCents(childPrice),
            currency,
            lookup_key: childLookupKey,
            transfer_lookup_key: true,
            metadata: {
              tier_type: 'child',
              activity_id: activityId,
              display_name: 'Child',
            },
          });
          createdPrices.child = {
            price_id: childPriceObj.id,
            lookup_key: childLookupKey,
            amount: childPrice,
            currency,
          };
        }
        
        // Create custom prices (e.g., VIP, Equipment)
        if (customPrices && Array.isArray(customPrices)) {
          for (const custom of customPrices) {
            if (custom.price && custom.price > 0 && custom.name) {
              const customLookupKey = generateLookupKey(activityId, `custom_${custom.id || custom.name.toLowerCase().replace(/\s+/g, '_')}`);
              const customPriceObj = await stripe.prices.create({
                product: productId,
                unit_amount: toCents(custom.price),
                currency,
                lookup_key: customLookupKey,
                transfer_lookup_key: true,
                metadata: {
                  tier_type: 'custom',
                  custom_id: custom.id || '',
                  activity_id: activityId,
                  display_name: custom.name,
                  min_quantity: String(custom.min || 0),
                  max_quantity: String(custom.max || 10),
                },
              });
              createdPrices.custom.push({
                id: custom.id,
                name: custom.name,
                price_id: customPriceObj.id,
                lookup_key: customLookupKey,
                amount: custom.price,
                min: custom.min || 0,
                max: custom.max || 10,
                currency,
              });
            }
          }
        }
        
        result = { 
          success: true, 
          prices: createdPrices,
          primaryPriceId: createdPrices.adult?.price_id || createdPrices.custom[0]?.price_id,
        };
        break;
      }

      /**
       * UPDATE PRICE BY LOOKUP KEY
       * Creates new price with same lookup key (Stripe transfers the key)
       * Old price is automatically deactivated
       */
      case 'update_price_by_lookup_key': {
        const { lookupKey, productId, newAmount, currency = 'usd', metadata = {} } = params;
        
        // Create new price with the lookup key - Stripe will transfer it from old price
        const updatedPrice = await stripe.prices.create({
          product: productId,
          unit_amount: toCents(newAmount),
          currency,
          lookup_key: lookupKey,
          transfer_lookup_key: true, // This transfers the lookup key from existing price
          metadata: {
            ...metadata,
            updated_at: new Date().toISOString(),
          },
        });
        
        result = { 
          success: true, 
          priceId: updatedPrice.id, 
          lookupKey,
          amount: newAmount,
        };
        break;
      }

      /**
       * SYNC ALL ACTIVITY PRICES
       * Updates all pricing tiers for an activity
       */
      case 'sync_activity_prices': {
        const { productId, activityId, adultPrice, childPrice, customPrices, currency = 'usd' } = params;
        
        const syncedPrices: any = { adult: null, child: null, custom: [] };
        
        // Sync adult price
        if (adultPrice && adultPrice > 0) {
          const adultLookupKey = generateLookupKey(activityId, 'adult');
          const adultPriceObj = await stripe.prices.create({
            product: productId,
            unit_amount: toCents(adultPrice),
            currency,
            lookup_key: adultLookupKey,
            transfer_lookup_key: true,
            metadata: {
              tier_type: 'adult',
              activity_id: activityId,
              display_name: 'Adult',
              synced_at: new Date().toISOString(),
            },
          });
          syncedPrices.adult = {
            price_id: adultPriceObj.id,
            lookup_key: adultLookupKey,
            amount: adultPrice,
            currency,
          };
        }
        
        // Sync child price
        if (childPrice && childPrice > 0) {
          const childLookupKey = generateLookupKey(activityId, 'child');
          const childPriceObj = await stripe.prices.create({
            product: productId,
            unit_amount: toCents(childPrice),
            currency,
            lookup_key: childLookupKey,
            transfer_lookup_key: true,
            metadata: {
              tier_type: 'child',
              activity_id: activityId,
              display_name: 'Child',
              synced_at: new Date().toISOString(),
            },
          });
          syncedPrices.child = {
            price_id: childPriceObj.id,
            lookup_key: childLookupKey,
            amount: childPrice,
            currency,
          };
        }
        
        // Sync custom prices
        if (customPrices && Array.isArray(customPrices)) {
          for (const custom of customPrices) {
            if (custom.price && custom.price > 0 && custom.name) {
              const customLookupKey = generateLookupKey(activityId, `custom_${custom.id || custom.name.toLowerCase().replace(/\s+/g, '_')}`);
              const customPriceObj = await stripe.prices.create({
                product: productId,
                unit_amount: toCents(custom.price),
                currency,
                lookup_key: customLookupKey,
                transfer_lookup_key: true,
                metadata: {
                  tier_type: 'custom',
                  custom_id: custom.id || '',
                  activity_id: activityId,
                  display_name: custom.name,
                  min_quantity: String(custom.min || 0),
                  max_quantity: String(custom.max || 10),
                  synced_at: new Date().toISOString(),
                },
              });
              syncedPrices.custom.push({
                id: custom.id,
                name: custom.name,
                price_id: customPriceObj.id,
                lookup_key: customLookupKey,
                amount: custom.price,
                min: custom.min || 0,
                max: custom.max || 10,
                currency,
              });
            }
          }
        }
        
        result = { 
          success: true, 
          prices: syncedPrices,
          primaryPriceId: syncedPrices.adult?.price_id || syncedPrices.custom[0]?.price_id,
          syncedAt: new Date().toISOString(),
        };
        break;
      }

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
