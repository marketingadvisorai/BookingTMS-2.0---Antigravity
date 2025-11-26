// @ts-nocheck - Deno types
/**
 * Widget API - Stripe-style lightweight endpoint
 * 
 * Returns minimal JSON data for the booking widget.
 * Designed for fast loading like Stripe.js
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Cache-Control': 'public, max-age=60', // Cache for 1 minute
};

interface WidgetConfig {
  activity: {
    id: string;
    name: string;
    tagline?: string;
    description?: string;
    category?: string;
    duration?: number;
    price: number;
    childPrice?: number;
    minParticipants: number;
    maxParticipants: number;
    coverImage?: string;
    galleryImages?: string[];
  };
  venue: {
    id: string;
    name: string;
    address?: string;
    timezone?: string;
  };
  organization: {
    id: string;
    name: string;
    logo?: string;
  };
  schedule: {
    operatingDays: number[];
    timeSlots: string[];
  };
  stripe: {
    publishableKey?: string;
    priceId?: string;
    productId?: string;
  };
  theme: {
    primaryColor: string;
    mode: 'light' | 'dark';
  };
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const activityId = url.searchParams.get('activityId');
    const venueId = url.searchParams.get('venueId');
    const primaryColor = url.searchParams.get('color') || '2563eb';
    const theme = url.searchParams.get('theme') || 'light';

    if (!activityId) {
      return new Response(
        JSON.stringify({ error: 'activityId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch activity with related data
    const { data: activity, error: activityError } = await supabase
      .from('activities')
      .select(`
        id,
        name,
        tagline,
        description,
        category,
        duration,
        base_price,
        child_price,
        min_capacity,
        max_capacity,
        cover_image,
        gallery_images,
        schedule,
        stripe_product_id,
        stripe_price_id,
        venue_id,
        organization_id
      `)
      .eq('id', activityId)
      .eq('is_active', true)
      .single();

    if (activityError || !activity) {
      return new Response(
        JSON.stringify({ error: 'Activity not found or inactive', details: activityError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch venue
    const { data: venue } = await supabase
      .from('venues')
      .select('id, name, address, timezone')
      .eq('id', activity.venue_id)
      .single();

    // Fetch organization
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name, logo_url, stripe_publishable_key')
      .eq('id', activity.organization_id)
      .single();

    // Build response
    const config: WidgetConfig = {
      activity: {
        id: activity.id,
        name: activity.name,
        tagline: activity.tagline,
        description: activity.description,
        category: activity.category,
        duration: activity.duration,
        price: activity.base_price || 0,
        childPrice: activity.child_price,
        minParticipants: activity.min_capacity || 1,
        maxParticipants: activity.max_capacity || 10,
        coverImage: activity.cover_image,
        galleryImages: activity.gallery_images || [],
      },
      venue: {
        id: venue?.id || activity.venue_id,
        name: venue?.name || 'Venue',
        address: venue?.address,
        timezone: venue?.timezone || 'UTC',
      },
      organization: {
        id: org?.id || activity.organization_id,
        name: org?.name || 'Organization',
        logo: org?.logo_url,
      },
      schedule: {
        operatingDays: activity.schedule?.operatingDays || [1, 2, 3, 4, 5, 6, 0],
        timeSlots: activity.schedule?.timeSlots || ['10:00', '14:00', '18:00'],
      },
      stripe: {
        publishableKey: org?.stripe_publishable_key,
        priceId: activity.stripe_price_id,
        productId: activity.stripe_product_id,
      },
      theme: {
        primaryColor: `#${primaryColor}`,
        mode: theme as 'light' | 'dark',
      },
    };

    return new Response(JSON.stringify(config), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    console.error('Widget API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
