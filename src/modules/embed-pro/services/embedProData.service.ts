/**
 * Embed Pro 2.0 - Data Service
 * @module embed-pro/services/embedProData
 * 
 * Handles all Supabase data fetching for the embed widget system.
 * Transforms raw database data into normalized widget-ready format.
 */

import { supabase } from '../../../lib/supabase';
import type { EmbedConfigEntity } from '../types';
import type {
  WidgetData,
  WidgetActivity,
  WidgetVenue,
  WidgetStyle,
  WidgetConfig,
  ActivitySchedule,
  DEFAULT_WIDGET_STYLE,
  DEFAULT_WIDGET_CONFIG,
} from '../types/widget.types';

// =====================================================
// RAW DATABASE TYPES
// =====================================================

interface RawActivity {
  id: string;
  organization_id: string;
  venue_id: string | null;
  name: string;
  description: string | null;
  tagline?: string | null;
  image_url: string | null;  // DB column is image_url, not cover_image
  duration: number;
  difficulty: string | null;
  min_players: number;
  max_players: number;
  price: number;
  child_price?: number | null;
  currency?: string;
  settings: Record<string, any> | null;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  stripe_prices?: Record<string, any> | null;
  // Joined venue name (optional)
  venue?: { name: string } | null;
}

interface RawVenue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  timezone: string | null;
  primary_color: string | null;
  phone: string | null;
  email: string | null;
}

// =====================================================
// DATA SERVICE CLASS
// =====================================================

class EmbedProDataService {
  /**
   * Get complete widget data by embed key
   */
  async getWidgetData(embedKey: string, isPreview = false): Promise<WidgetData | null> {
    // Step 1: Get embed config
    const config = await this.getConfigByKey(embedKey);
    if (!config) return null;

    // Step 2: Fetch target data based on target_type
    let activity: WidgetActivity | null = null;
    let activities: WidgetActivity[] = [];
    let venue: WidgetVenue | null = null;

    if (config.target_type === 'activity' && config.target_id) {
      const result = await this.getActivityWithVenue(config.target_id);
      if (result) {
        activity = result.activity;
        venue = result.venue;
        activities = [activity];
      }
    } else if (config.target_type === 'venue' && config.target_id) {
      const result = await this.getVenueWithActivities(config.target_id);
      if (result) {
        venue = result.venue;
        activities = result.activities;
        activity = activities[0] || null;
      }
    } else if (config.target_type === 'multi-activity' && config.target_ids?.length) {
      activities = await this.getMultipleActivities(config.target_ids);
      activity = activities[0] || null;
    }

    // Step 3: Normalize style and config
    const style = this.normalizeStyle(config.style);
    const widgetConfig = this.normalizeConfig(config.config);

    return {
      embedKey,
      type: config.type,
      targetType: config.target_type as 'activity' | 'venue' | 'multi-activity',
      activity,
      activities,
      venue,
      style,
      config: widgetConfig,
      isPreview,
    };
  }

  /**
   * Get embed config by embed_key
   */
  async getConfigByKey(embedKey: string): Promise<EmbedConfigEntity | null> {
    const { data, error } = await supabase
      .from('embed_configs')
      .select('*')
      .eq('embed_key', embedKey)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('[EmbedProData] Config not found:', embedKey, error);
      return null;
    }

    return data as unknown as EmbedConfigEntity;
  }

  /**
   * Get single activity with its parent venue
   */
  async getActivityWithVenue(activityId: string): Promise<{
    activity: WidgetActivity;
    venue: WidgetVenue | null;
  } | null> {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        venue:venues(*)
      `)
      .eq('id', activityId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('[EmbedProData] Activity not found:', activityId, error);
      return null;
    }

    const raw = data as RawActivity & { venue: RawVenue | null };
    return {
      activity: this.normalizeActivity(raw),
      venue: raw.venue ? this.normalizeVenue(raw.venue) : null,
    };
  }

  /**
   * Get venue with all active activities
   */
  async getVenueWithActivities(venueId: string): Promise<{
    venue: WidgetVenue;
    activities: WidgetActivity[];
  } | null> {
    const { data, error } = await supabase
      .from('venues')
      .select(`
        *,
        activities(*)
      `)
      .eq('id', venueId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      console.error('[EmbedProData] Venue not found:', venueId, error);
      return null;
    }

    const raw = data as RawVenue & { activities: RawActivity[] };
    const activeActivities = (raw.activities || []).filter(
      (a: any) => a.is_active === true
    );

    // Add venue reference to each activity for venueName
    const activitiesWithVenue = activeActivities.map(a => ({
      ...a,
      venue: { name: raw.name },
    }));

    return {
      venue: this.normalizeVenue(raw),
      activities: activitiesWithVenue.map((a) => this.normalizeActivity(a)),
    };
  }

  /**
   * Get multiple activities by IDs
   */
  async getMultipleActivities(activityIds: string[]): Promise<WidgetActivity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .in('id', activityIds)
      .eq('is_active', true);

    if (error || !data) {
      console.error('[EmbedProData] Activities not found:', activityIds, error);
      return [];
    }

    return data.map((a) => this.normalizeActivity(a as RawActivity));
  }

  // =====================================================
  // NORMALIZERS
  // =====================================================

  private normalizeActivity(raw: RawActivity): WidgetActivity {
    const schedule = this.extractSchedule(raw.settings);
    const pricingTiers = this.extractPricingTiers(raw);

    return {
      id: raw.id,
      organizationId: raw.organization_id,
      venueId: raw.venue_id,
      venueName: raw.venue?.name || null,
      name: raw.name,
      description: raw.description,
      tagline: raw.tagline || null,
      coverImage: raw.image_url,  // Map image_url to coverImage
      duration: raw.duration || 60,
      difficulty: raw.difficulty,
      minPlayers: raw.min_players || 2,
      maxPlayers: raw.max_players || 8,
      price: raw.price || 0,
      childPrice: raw.child_price ?? null,
      currency: raw.currency || 'USD',
      schedule,
      stripePriceId: raw.stripe_price_id,
      stripeProductId: raw.stripe_product_id,
      pricingTiers,
    };
  }

  private normalizeVenue(raw: RawVenue): WidgetVenue {
    return {
      id: raw.id,
      name: raw.name,
      address: raw.address,
      city: raw.city,
      state: raw.state,
      timezone: raw.timezone || 'UTC',
      primaryColor: raw.primary_color || '#2563eb',
      phone: raw.phone,
      email: raw.email,
    };
  }

  private extractSchedule(settings: Record<string, any> | null): ActivitySchedule {
    if (!settings) {
      return {
        operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startTime: '10:00',
        endTime: '22:00',
        slotInterval: 60,
      };
    }

    return {
      operatingDays: settings.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: settings.startTime || '10:00',
      endTime: settings.endTime || '22:00',
      slotInterval: settings.slotInterval || settings.slotDuration || 60,
      blockedDates: settings.blockedDates || [],
      customAvailableDates: settings.customAvailableDates || [],
      advanceBookingDays: settings.advanceBookingDays || 30,
    };
  }

  private extractPricingTiers(raw: RawActivity): { id: string; name: string; price: number; stripePriceId?: string }[] {
    const tiers: { id: string; name: string; price: number; stripePriceId?: string }[] = [];
    
    // Add adult tier
    tiers.push({
      id: 'adult',
      name: 'Adult',
      price: raw.price || 0,
      stripePriceId: raw.stripe_prices?.adult?.price_id || raw.stripe_price_id || undefined,
    });

    // Add child tier if exists
    if (raw.child_price !== null && raw.child_price !== undefined) {
      tiers.push({
        id: 'child',
        name: 'Child',
        price: raw.child_price,
        stripePriceId: raw.stripe_prices?.child?.price_id,
      });
    }

    return tiers;
  }

  private normalizeStyle(style: any): WidgetStyle {
    return {
      primaryColor: style?.primaryColor || '#2563eb',
      secondaryColor: style?.secondaryColor || '#1e40af',
      backgroundColor: style?.backgroundColor || '#ffffff',
      textColor: style?.textColor || '#1f2937',
      borderRadius: style?.borderRadius || '8px',
      fontFamily: style?.fontFamily || 'Inter, system-ui, sans-serif',
      theme: style?.theme === 'dark' ? 'dark' : 'light',
    };
  }

  private normalizeConfig(config: any): WidgetConfig {
    return {
      showPricing: config?.showPricing !== false,
      showCalendar: config?.showCalendar !== false,
      showTimeSlots: config?.showTimeSlots !== false,
      showDescription: config?.showDescription !== false,
      buttonText: config?.buttonText || 'Book Now',
      successMessage: config?.successMessage || 'Your booking is confirmed!',
      redirectUrl: config?.redirectAfterBooking || null,
      timezone: config?.timezone || 'UTC',
    };
  }

  // =====================================================
  // AVAILABILITY METHODS
  // =====================================================

  /**
   * Get available time slots from activity_sessions for a specific date
   */
  async getAvailableSlots(
    activityId: string,
    date: Date,
    partySize: number = 1
  ): Promise<{
    time: string;
    sessionId: string;
    available: boolean;
    spotsRemaining: number;
    price: number;
  }[]> {
    // Format date for query (YYYY-MM-DD)
    const dateStr = date.toISOString().split('T')[0];
    const startOfDay = `${dateStr}T00:00:00`;
    const endOfDay = `${dateStr}T23:59:59`;

    const { data, error } = await (supabase
      .from('activity_sessions') as any)
      .select('id, start_time, capacity_remaining, price_at_generation')
      .eq('activity_id', activityId)
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('[EmbedProData] Error fetching sessions:', error);
      return [];
    }

    // Transform to time slots
    return (data || []).map((session: any) => {
      const startTime = new Date(session.start_time);
      const time = startTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      return {
        time,
        sessionId: session.id,
        available: session.capacity_remaining >= partySize,
        spotsRemaining: session.capacity_remaining || 0,
        price: session.price_at_generation || 0,
      };
    });
  }

  /**
   * Check if a specific session is still available for booking
   */
  async checkSessionAvailability(
    sessionId: string,
    partySize: number
  ): Promise<{ available: boolean; spotsRemaining: number; message?: string }> {
    const { data, error } = await (supabase
      .from('activity_sessions') as any)
      .select('capacity_remaining')
      .eq('id', sessionId)
      .single();

    if (error || !data) {
      return { available: false, spotsRemaining: 0, message: 'Session not found' };
    }

    const available = (data as any).capacity_remaining >= partySize;
    return {
      available,
      spotsRemaining: (data as any).capacity_remaining,
      message: available ? undefined : `Only ${(data as any).capacity_remaining} spots remaining`,
    };
  }
}

// Export singleton instance
export const embedProDataService = new EmbedProDataService();
