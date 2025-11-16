// Supabase Edge Function: cleanup-deleted-records
// Automatically deletes soft-deleted games and venues after 7 days
// Should be triggered via cron job or scheduled task

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CleanupResult {
  deleted_games: number;
  deleted_venues: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Validate authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get days parameter (default 7)
    const url = new URL(req.url);
    const daysParam = url.searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 7;

    if (isNaN(days) || days < 1) {
      return new Response(
        JSON.stringify({ error: 'Invalid days parameter. Must be a positive integer.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`🗑️ Starting cleanup of records deleted more than ${days} days ago...`);

    // Call the database function to cleanup old deleted records
    const { data, error } = await supabase.rpc('cleanup_deleted_records', {
      days_old: days,
    });

    if (error) {
      console.error('❌ Cleanup error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Cleanup failed', 
          details: error.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = data[0] as CleanupResult;
    
    console.log(`✅ Cleanup complete:`, result);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: `Cleanup completed successfully`,
        deleted_games: result.deleted_games,
        deleted_venues: result.deleted_venues,
        days_threshold: days,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
