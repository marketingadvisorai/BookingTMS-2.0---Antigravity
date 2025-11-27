/**
 * Embed Pro 1.1 - Preview Service
 * @module embed-pro/services/preview
 * 
 * Handles widget preview data fetching
 */

import { supabase } from '../../../lib/supabase';
import type { EmbedConfigEntity, EmbedStyle } from '../types';

// =====================================================
// PREVIEW DATA TYPES
// =====================================================

export interface PreviewActivityData {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  price: number;
  currency: string;
  duration: number;
  min_players: number;
  max_players: number;
  difficulty: string | null;
}

export interface PreviewVenueData {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  primary_color: string | null;
  activities: PreviewActivityData[];
}

export interface PreviewData {
  embedConfig: EmbedConfigEntity;
  venue?: PreviewVenueData;
  activity?: PreviewActivityData;
  activities?: PreviewActivityData[];
}

// =====================================================
// PREVIEW SERVICE
// =====================================================

class PreviewService {
  /**
   * Get preview data for an embed config
   */
  async getPreviewData(configId: string): Promise<PreviewData | null> {
    // First get the embed config
    const { data: config, error: configError } = await supabase
      .from('embed_configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (configError || !config) return null;

    const embedConfig = config as unknown as EmbedConfigEntity;

    // Based on target type, fetch related data
    if (embedConfig.target_type === 'activity' && embedConfig.target_id) {
      return this.getActivityPreview(embedConfig);
    }

    if (embedConfig.target_type === 'venue' && embedConfig.target_id) {
      return this.getVenuePreview(embedConfig);
    }

    if (embedConfig.target_type === 'multi-activity' && embedConfig.target_ids?.length) {
      return this.getMultiActivityPreview(embedConfig);
    }

    return { embedConfig };
  }

  /**
   * Get activity preview data
   */
  private async getActivityPreview(config: EmbedConfigEntity): Promise<PreviewData> {
    const { data: activity } = await supabase
      .from('activities')
      .select(`
        id,
        name,
        description,
        cover_image,
        price,
        currency,
        duration,
        min_players,
        max_players,
        difficulty,
        venue:venues(id, name, city, state, primary_color)
      `)
      .eq('id', config.target_id as string)
      .single();

    const activityData = activity as unknown as (PreviewActivityData & { venue?: PreviewVenueData }) | null;

    return {
      embedConfig: config,
      activity: activityData || undefined,
      venue: activityData?.venue,
    };
  }

  /**
   * Get venue preview data
   */
  private async getVenuePreview(config: EmbedConfigEntity): Promise<PreviewData> {
    const { data: venue } = await supabase
      .from('venues')
      .select(`
        id,
        name,
        city,
        state,
        primary_color,
        activities(
          id,
          name,
          description,
          cover_image,
          price,
          currency,
          duration,
          min_players,
          max_players,
          difficulty
        )
      `)
      .eq('id', config.target_id as string)
      .single();

    const venueData = venue as unknown as (PreviewVenueData & { activities?: PreviewActivityData[] }) | null;

    return {
      embedConfig: config,
      venue: venueData || undefined,
      activities: venueData?.activities,
    };
  }

  /**
   * Get multi-activity preview data
   */
  private async getMultiActivityPreview(config: EmbedConfigEntity): Promise<PreviewData> {
    const { data: activities } = await supabase
      .from('activities')
      .select(`
        id,
        name,
        description,
        cover_image,
        price,
        currency,
        duration,
        min_players,
        max_players,
        difficulty
      `)
      .in('id', config.target_ids);

    return {
      embedConfig: config,
      activities: activities as PreviewActivityData[] | undefined,
    };
  }

  /**
   * Map embed type to widget URL parameter
   */
  private mapEmbedTypeToWidget(type: string): string {
    const typeMap: Record<string, string> = {
      'booking-widget': 'booking',
      'calendar-widget': 'calendar',
      'button-widget': 'booking',
      'inline-widget': 'booking',
      'popup-widget': 'booking',
    };
    // Default to 'booking' for the full booking widget experience
    return typeMap[type] || 'booking';
  }

  /**
   * Generate preview URL using the new Embed Pro 2.0 page
   * Route: /embed-pro?key={embedKey}&theme={theme}&preview=true
   */
  getPreviewUrl(embedKey: string, config?: EmbedConfigEntity): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const params = new URLSearchParams();
    
    // Always include embed key and preview flag
    params.set('key', embedKey);
    params.set('preview', 'true');
    
    if (config) {
      // Add theme if specified
      if (config.style?.theme && config.style.theme !== 'auto') {
        params.set('theme', config.style.theme);
      }
    }
    
    // Use new Embed Pro 2.0 route
    return `${baseUrl}/embed-pro?${params.toString()}`;
  }

  /**
   * Apply style overrides to preview
   */
  getStyleVariables(style: EmbedStyle): Record<string, string> {
    return {
      '--bf-primary': style.primaryColor,
      '--bf-secondary': style.secondaryColor,
      '--bf-bg': style.backgroundColor,
      '--bf-text': style.textColor,
      '--bf-radius': style.borderRadius,
      '--bf-font': style.fontFamily,
      '--bf-padding': style.padding,
    };
  }
}

// Export singleton instance
export const previewService = new PreviewService();
