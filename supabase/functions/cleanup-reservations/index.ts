// Cleanup Expired Reservations Edge Function
// 
// This function should be called by a cron job every 1-2 minutes
// to clean up expired slot reservations and restore capacity.
// 
// Cron setup: Use pg_cron extension in Supabase Dashboard
// Or call this edge function via external cron service
// POST https://<project>.supabase.co/functions/v1/cleanup-reservations
// 
// @module supabase/functions/cleanup-reservations
// @version 1.0.0

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the cleanup function
    const { data, error } = await supabase.rpc('cleanup_expired_reservations');

    if (error) {
      console.error('Cleanup error:', error);
      throw error;
    }

    // data is an array with one row containing cleaned_count and capacity_released
    const result = Array.isArray(data) ? data[0] : data;
    const cleanedCount = result?.cleaned_count ?? 0;
    const capacityReleased = result?.capacity_released ?? 0;

    console.log(`Cleanup completed: ${cleanedCount} reservations, ${capacityReleased} spots released`);

    return new Response(
      JSON.stringify({
        success: true,
        cleaned_count: cleanedCount,
        capacity_released: capacityReleased,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in cleanup-reservations:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
