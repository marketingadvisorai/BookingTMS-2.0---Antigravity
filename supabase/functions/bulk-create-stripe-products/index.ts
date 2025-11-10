import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching games without Stripe pricing...');

    // Get all games without Stripe pricing
    const { data: games, error: fetchError } = await supabase
      .from('games')
      .select('id, name, description, price, duration, difficulty, venue_id')
      .or('stripe_product_id.is.null,stripe_price_id.is.null');

    if (fetchError) {
      throw new Error(`Failed to fetch games: ${fetchError.message}`);
    }

    if (!games || games.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'All games already have Stripe pricing configured',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${games.length} games without Stripe pricing`);

    const results = [];
    const errors = [];

    // Process each game
    for (const game of games) {
      try {
        console.log(`Processing game: ${game.name} (${game.id})`);

        // Create Stripe Product
        const product = await stripe.products.create({
          name: game.name,
          description: game.description || `${game.name} - ${game.duration} minutes`,
          metadata: {
            game_id: game.id,
            venue_id: game.venue_id,
            duration: String(game.duration || '60'),
            difficulty: game.difficulty || 'medium',
          },
        });

        console.log(`Created Stripe product: ${product.id}`);

        // Create Stripe Price
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(parseFloat(game.price) * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            game_id: game.id,
            venue_id: game.venue_id,
          },
        });

        console.log(`Created Stripe price: ${price.id}`);

        // Update game in database
        const { error: updateError } = await supabase
          .from('games')
          .update({
            stripe_product_id: product.id,
            stripe_price_id: price.id,
            stripe_sync_status: 'synced',
            stripe_last_sync: new Date().toISOString(),
          })
          .eq('id', game.id);

        if (updateError) {
          throw updateError;
        }

        console.log(`Updated game ${game.id} with Stripe IDs`);

        results.push({
          gameId: game.id,
          gameName: game.name,
          productId: product.id,
          priceId: price.id,
          status: 'success',
        });
      } catch (error: any) {
        console.error(`Error processing game ${game.id}:`, error);
        errors.push({
          gameId: game.id,
          gameName: game.name,
          error: error.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: `Processed ${games.length} games`,
        successful: results.length,
        failed: errors.length,
        results,
        errors,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Bulk create error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
