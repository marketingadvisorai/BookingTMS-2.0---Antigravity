/**
 * Widget API Client
 * 
 * Frontend client for the widget-api Edge Function.
 * Handles both Activity and Venue embeds with automatic caching.
 * 
 * @usage
 * ```ts
 * // Activity embed
 * const data = await WidgetApiClient.getActivityConfig('activity-uuid');
 * 
 * // Venue embed
 * const data = await WidgetApiClient.getVenueConfig('embed-key');
 * 
 * // With availability
 * const data = await WidgetApiClient.getActivityConfig('activity-uuid', { date: '2025-01-15' });
 * ```
 */

import { supabase } from '../supabase';

export interface ActivityConfig {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  category?: string;
  duration: number;
  price: number;
  childPrice?: number;
  minPlayers: number;
  maxPlayers: number;
  coverImage?: string;
  galleryImages?: string[];
}

export interface VenueConfig {
  id: string;
  name: string;
  slug?: string;
  address?: string;
  timezone: string;
  embedKey?: string;
}

export interface OrganizationConfig {
  id: string;
  name: string;
  logo?: string;
}

export interface ScheduleConfig {
  operatingDays: string[];
  startTime: string;
  endTime: string;
  slotInterval: number;
}

export interface StripeConfig {
  publishableKey?: string;
  priceId?: string;
  productId?: string;
}

export interface ThemeConfig {
  primaryColor: string;
  mode: 'light' | 'dark';
}

export interface AvailabilitySlot {
  sessionId: string;
  time: string;
  available: boolean;
  spotsLeft: number;
  totalSpots?: number;
}

export interface ActivityWidgetData {
  type: 'activity';
  activity: ActivityConfig;
  venue: VenueConfig;
  organization: OrganizationConfig;
  schedule: ScheduleConfig;
  stripe: StripeConfig;
  theme: ThemeConfig;
  availability?: AvailabilitySlot[];
}

export interface VenueWidgetData {
  type: 'venue';
  venue: VenueConfig;
  organization: OrganizationConfig;
  activities: (ActivityConfig & { 
    stripe: { priceId?: string; productId?: string };
    availability?: AvailabilitySlot[];
  })[];
  stripe: { publishableKey?: string };
  theme: ThemeConfig;
}

export type WidgetData = ActivityWidgetData | VenueWidgetData;

interface FetchOptions {
  date?: string;  // YYYY-MM-DD for availability
  color?: string; // Hex color without #
  theme?: 'light' | 'dark';
}

// In-memory cache for widget data
const cache = new Map<string, { data: WidgetData; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

export class WidgetApiClient {
  /**
   * Get widget configuration for a single activity
   */
  static async getActivityConfig(
    activityId: string, 
    options: FetchOptions = {}
  ): Promise<ActivityWidgetData | null> {
    const cacheKey = `activity:${activityId}:${options.date || 'nodate'}`;
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as ActivityWidgetData;
    }

    try {
      // Use direct fetch for GET requests (Supabase invoke is for POST)
      const params = new URLSearchParams({ activityId });
      if (options.date) params.append('date', options.date);
      if (options.color) params.append('color', options.color);
      if (options.theme) params.append('theme', options.theme);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget-api?${params}`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      );

      if (!response.ok) {
        console.error('Widget API error:', response.status);
        return null;
      }

      const widgetData = await response.json() as ActivityWidgetData;
      
      // Cache the result
      cache.set(cacheKey, { data: widgetData, timestamp: Date.now() });
      
      return widgetData;
    } catch (error) {
      console.error('Failed to fetch activity config:', error);
      return null;
    }
  }

  /**
   * Get widget configuration for a venue (multi-activity)
   */
  static async getVenueConfig(
    embedKey: string, 
    options: FetchOptions = {}
  ): Promise<VenueWidgetData | null> {
    const cacheKey = `venue:${embedKey}:${options.date || 'nodate'}`;
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as VenueWidgetData;
    }

    try {
      const params = new URLSearchParams({ embedKey });
      if (options.date) params.append('date', options.date);
      if (options.color) params.append('color', options.color);
      if (options.theme) params.append('theme', options.theme);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget-api?${params}`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      );

      if (!response.ok) {
        console.error('Widget API error:', response.status);
        return null;
      }

      const widgetData = await response.json() as VenueWidgetData;
      
      // Cache the result
      cache.set(cacheKey, { data: widgetData, timestamp: Date.now() });
      
      return widgetData;
    } catch (error) {
      console.error('Failed to fetch venue config:', error);
      return null;
    }
  }

  /**
   * Fetch availability for a specific date (bypasses cache)
   */
  static async getAvailability(
    activityId: string,
    date: string
  ): Promise<AvailabilitySlot[]> {
    try {
      const params = new URLSearchParams({ activityId, date });
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/widget-api?${params}`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json() as ActivityWidgetData;
      return data.availability || [];
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      return [];
    }
  }

  /**
   * Clear cache (useful after booking or admin changes)
   */
  static clearCache(key?: string) {
    if (key) {
      // Clear specific key pattern
      for (const k of cache.keys()) {
        if (k.includes(key)) {
          cache.delete(k);
        }
      }
    } else {
      cache.clear();
    }
  }
}

export default WidgetApiClient;
