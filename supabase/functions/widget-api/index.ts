// @ts-nocheck - Deno types
/**
 * Widget API - Enterprise-grade endpoint with Edge caching
 * 
 * Supports both Activity and Venue embeds with:
 * - Edge caching (5 min for activities, 2 min for venues)
 * - Real-time availability data
 * - Stripe metadata pass-through (no per-slot products)
 * 
 * @endpoints
 * GET /widget-api?activityId={id} - Single activity embed
 * GET /widget-api?embedKey={key} - Venue embed (all activities)
 * GET /widget-api?activityId={id}&date={YYYY-MM-DD} - With availability
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// CORS headers with aggressive caching
const getCorsHeaders = (cacheSeconds: number = 300) => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=60`,
  'CDN-Cache-Control': `public, max-age=${cacheSeconds}`,
  'Vary': 'Accept-Encoding',
});

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(86400) });
  }

  try {
    const url = new URL(req.url);
    const activityId = url.searchParams.get('activityId');
    const embedKey = url.searchParams.get('embedKey') || url.searchParams.get('key');
    const date = url.searchParams.get('date'); // Optional: for availability
    const primaryColor = url.searchParams.get('color') || '2563eb';
    const theme = url.searchParams.get('theme') || 'light';

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Route: Single Activity Embed
    if (activityId) {
      return await handleActivityEmbed(supabase, activityId, date, primaryColor, theme);
    }

    // Route: Venue Embed (all activities)
    if (embedKey) {
      return await handleVenueEmbed(supabase, embedKey, date, primaryColor, theme);
    }

    return new Response(
      JSON.stringify({ error: 'Either activityId or embedKey is required' }),
      { status: 400, headers: { ...getCorsHeaders(60), 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Widget API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...getCorsHeaders(10), 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Handle single activity embed request
 */
async function handleActivityEmbed(
  supabase: any,
  activityId: string,
  date: string | null,
  primaryColor: string,
  theme: string
) {
  // Fetch activity with all needed data in single query
  const { data: activity, error } = await supabase
    .from('activities')
    .select(`
      id, name, slug, tagline, description, category, duration,
      price, child_price, min_players, max_players,
      image_url, settings, schedule,
      stripe_product_id, stripe_price_id,
      venue_id, organization_id,
      venues!inner(id, name, slug, address, city, state, timezone, primary_color, embed_key),
      organizations!inner(id, name, logo_url, stripe_publishable_key)
    `)
    .eq('id', activityId)
    .eq('is_active', true)
    .single();

  if (error || !activity) {
    return new Response(
      JSON.stringify({ error: 'Activity not found', details: error?.message }),
      { status: 404, headers: { ...getCorsHeaders(60), 'Content-Type': 'application/json' } }
    );
  }

  // Fetch availability if date provided
  let availability = null;
  if (date) {
    availability = await fetchAvailability(supabase, activityId, date);
  }

  const response = buildActivityResponse(activity, availability, primaryColor, theme);

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { ...getCorsHeaders(300), 'Content-Type': 'application/json' },
  });
}

/**
 * Handle venue embed request (multi-activity)
 */
async function handleVenueEmbed(
  supabase: any,
  embedKey: string,
  date: string | null,
  primaryColor: string,
  theme: string
) {
  // Fetch venue with all activities
  const { data: venue, error: venueError } = await supabase
    .from('venues')
    .select(`
      id, name, slug, address, city, state, zip, timezone,
      primary_color, embed_key, settings, organization_id,
      organizations!inner(id, name, logo_url, stripe_publishable_key)
    `)
    .eq('embed_key', embedKey)
    .eq('status', 'active')
    .single();

  if (venueError || !venue) {
    return new Response(
      JSON.stringify({ error: 'Venue not found', details: venueError?.message }),
      { status: 404, headers: { ...getCorsHeaders(60), 'Content-Type': 'application/json' } }
    );
  }

  // Fetch all active activities for venue
  const { data: activities } = await supabase
    .from('activities')
    .select(`
      id, name, slug, tagline, description, category, duration,
      price, child_price, min_players, max_players,
      image_url, settings, schedule,
      stripe_product_id, stripe_price_id
    `)
    .eq('venue_id', venue.id)
    .eq('is_active', true)
    .order('name');

  // Fetch availability for all activities if date provided
  let availabilityMap: Record<string, any> = {};
  if (date && activities?.length) {
    const activityIds = activities.map((a: any) => a.id);
    availabilityMap = await fetchBulkAvailability(supabase, activityIds, date);
  }

  const response = buildVenueResponse(venue, activities || [], availabilityMap, primaryColor, theme);

  return new Response(JSON.stringify(response), {
    status: 200,
    headers: { ...getCorsHeaders(120), 'Content-Type': 'application/json' },
  });
}

/**
 * Fetch availability for single activity
 */
async function fetchAvailability(supabase: any, activityId: string, date: string) {
  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;

  const { data: sessions } = await supabase
    .from('activity_sessions')
    .select('id, start_time, end_time, capacity_total, capacity_remaining, status')
    .eq('activity_id', activityId)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .eq('status', 'available')
    .order('start_time');

  return (sessions || []).map((s: any) => ({
    sessionId: s.id,
    time: new Date(s.start_time).toISOString(),
    available: s.capacity_remaining > 0,
    spotsLeft: s.capacity_remaining,
    totalSpots: s.capacity_total,
  }));
}

/**
 * Fetch availability for multiple activities
 */
async function fetchBulkAvailability(supabase: any, activityIds: string[], date: string) {
  const startOfDay = `${date}T00:00:00Z`;
  const endOfDay = `${date}T23:59:59Z`;

  const { data: sessions } = await supabase
    .from('activity_sessions')
    .select('id, activity_id, start_time, end_time, capacity_total, capacity_remaining, status')
    .in('activity_id', activityIds)
    .gte('start_time', startOfDay)
    .lte('start_time', endOfDay)
    .eq('status', 'available')
    .order('start_time');

  const result: Record<string, any[]> = {};
  for (const s of sessions || []) {
    if (!result[s.activity_id]) result[s.activity_id] = [];
    result[s.activity_id].push({
      sessionId: s.id,
      time: new Date(s.start_time).toISOString(),
      available: s.capacity_remaining > 0,
      spotsLeft: s.capacity_remaining,
    });
  }
  return result;
}

/**
 * Build response for single activity embed
 */
function buildActivityResponse(activity: any, availability: any, primaryColor: string, theme: string) {
  const venue = activity.venues;
  const org = activity.organizations;
  const schedule = activity.schedule || activity.settings?.schedule || {};

  return {
    type: 'activity',
    activity: {
      id: activity.id,
      name: activity.name,
      slug: activity.slug,
      tagline: activity.tagline,
      description: activity.description,
      category: activity.category,
      duration: activity.duration || 60,
      price: activity.price || 0,
      childPrice: activity.child_price,
      minPlayers: activity.min_players || 2,
      maxPlayers: activity.max_players || 8,
      coverImage: activity.image_url,
      galleryImages: activity.settings?.galleryImages || [],
    },
    venue: {
      id: venue.id,
      name: venue.name,
      address: [venue.address, venue.city, venue.state].filter(Boolean).join(', '),
      timezone: venue.timezone || 'UTC',
      embedKey: venue.embed_key,
    },
    organization: {
      id: org.id,
      name: org.name,
      logo: org.logo_url,
    },
    schedule: {
      operatingDays: schedule.operatingDays || ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      startTime: schedule.startTime || '09:00',
      endTime: schedule.endTime || '21:00',
      slotInterval: schedule.slotInterval || 60,
    },
    stripe: {
      publishableKey: org.stripe_publishable_key,
      priceId: activity.stripe_price_id,
      productId: activity.stripe_product_id,
    },
    theme: {
      primaryColor: venue.primary_color || `#${primaryColor}`,
      mode: theme,
    },
    availability,
  };
}

/**
 * Build response for venue embed (multi-activity)
 */
function buildVenueResponse(
  venue: any,
  activities: any[],
  availabilityMap: Record<string, any>,
  primaryColor: string,
  theme: string
) {
  const org = venue.organizations;

  return {
    type: 'venue',
    venue: {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      address: [venue.address, venue.city, venue.state, venue.zip].filter(Boolean).join(', '),
      timezone: venue.timezone || 'UTC',
      embedKey: venue.embed_key,
    },
    organization: {
      id: org.id,
      name: org.name,
      logo: org.logo_url,
    },
    activities: activities.map((a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      tagline: a.tagline,
      description: a.description,
      category: a.category,
      duration: a.duration || 60,
      price: a.price || 0,
      childPrice: a.child_price,
      minPlayers: a.min_players || 2,
      maxPlayers: a.max_players || 8,
      coverImage: a.image_url,
      stripe: {
        priceId: a.stripe_price_id,
        productId: a.stripe_product_id,
      },
      availability: availabilityMap[a.id] || null,
    })),
    stripe: {
      publishableKey: org.stripe_publishable_key,
    },
    theme: {
      primaryColor: venue.primary_color || `#${primaryColor}`,
      mode: theme,
    },
  };
}
