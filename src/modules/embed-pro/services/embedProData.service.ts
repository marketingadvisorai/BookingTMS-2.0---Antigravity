/**
 * Embed Pro 2.0 - Data Service (Orchestrator)
 * @module embed-pro/services/embedProData
 * 
 * Main orchestrator for widget data fetching.
 * Delegates to specialized services for modular architecture.
 * 
 * Architecture:
 * - embedProData.service.ts (this file) - Orchestration & public API
 * - availability.service.ts - Real-time slot availability
 * - widgetData.normalizer.ts - Data transformation
 */

import { supabase } from '../../../lib/supabase';
import type { EmbedConfigEntity } from '../types';
import type { WidgetData, WidgetActivity, WidgetVenue } from '../types/widget.types';
import { widgetDataNormalizer, RawActivity, RawVenue } from './widgetData.normalizer';
import { availabilityService } from './availability.service';

// Re-export for convenience
export { availabilityService } from './availability.service';
export { widgetDataNormalizer } from './widgetData.normalizer';

// =====================================================
// DATA SERVICE CLASS
// =====================================================

class EmbedProDataService {
  /**
   * Get complete widget data by embed key
   * Main entry point for widget initialization
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
    const style = widgetDataNormalizer.normalizeStyle(config.style);
    const widgetConfig = widgetDataNormalizer.normalizeConfig(config.config);
    const venueLayout = widgetDataNormalizer.normalizeVenueLayout((config as any).venue_layout);

    return {
      embedKey,
      type: config.type,
      targetType: config.target_type as 'activity' | 'venue' | 'multi-activity',
      activity,
      activities,
      venue,
      style,
      config: widgetConfig,
      venueLayout,
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
        id, organization_id, venue_id, name, description, tagline, image_url,
        duration, difficulty, min_players, max_players, price, child_price,
        settings, schedule, stripe_price_id, stripe_product_id, stripe_prices,
        is_active, created_at,
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
    console.log('[EmbedProData] Activity loaded:', raw.name, 'Schedule:', !!raw.schedule, 'Settings schedule:', !!raw.settings?.operatingDays);
    
    return {
      activity: widgetDataNormalizer.normalizeActivity(raw),
      venue: raw.venue ? widgetDataNormalizer.normalizeVenue(raw.venue) : null,
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
        activities(
          id, organization_id, venue_id, name, description, tagline, image_url,
          duration, difficulty, min_players, max_players, price, child_price,
          settings, schedule, stripe_price_id, stripe_product_id, stripe_prices,
          is_active, created_at
        )
      `)
      .eq('id', venueId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      console.error('[EmbedProData] Venue not found:', venueId, error);
      return null;
    }

    const raw = data as RawVenue & { activities: RawActivity[] };
    const activeActivities = (raw.activities || [])
      .filter((a: any) => a.is_active === true)
      .map(a => ({ ...a, venue: { name: raw.name } }));

    console.log('[EmbedProData] Venue activities loaded:', activeActivities.length, 
      'Schedule present:', activeActivities.map(a => !!a.schedule || !!a.settings?.operatingDays));

    return {
      venue: widgetDataNormalizer.normalizeVenue(raw),
      activities: activeActivities.map(a => widgetDataNormalizer.normalizeActivity(a)),
    };
  }

  /**
   * Get multiple activities by IDs
   */
  async getMultipleActivities(activityIds: string[]): Promise<WidgetActivity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        id, organization_id, venue_id, name, description, tagline, image_url,
        duration, difficulty, min_players, max_players, price, child_price,
        settings, schedule, stripe_price_id, stripe_product_id, stripe_prices,
        is_active, created_at
      `)
      .in('id', activityIds)
      .eq('is_active', true);

    if (error || !data) {
      console.error('[EmbedProData] Activities not found:', activityIds, error);
      return [];
    }

    return data.map(a => widgetDataNormalizer.normalizeActivity(a as RawActivity));
  }

  /**
   * Convenience method: Get available slots for activity
   * Delegates to availability service
   */
  async getAvailableSlots(activityId: string, date: Date, partySize = 1) {
    return availabilityService.getAvailableSlots(activityId, date, partySize);
  }

  /**
   * Convenience method: Check session availability
   * Delegates to availability service
   */
  async checkSessionAvailability(sessionId: string, partySize: number) {
    return availabilityService.checkSessionAvailability(sessionId, partySize);
  }
}

// Export singleton instance
export const embedProDataService = new EmbedProDataService();
