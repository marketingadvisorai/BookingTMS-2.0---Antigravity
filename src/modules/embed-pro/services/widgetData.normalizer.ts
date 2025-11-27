/**
 * Embed Pro 2.0 - Widget Data Normalizer
 * @module embed-pro/services/widgetData.normalizer
 * 
 * Transforms raw database records into widget-ready formats.
 * Ensures consistent data structure for cross-browser rendering.
 */

import type {
  WidgetActivity,
  WidgetVenue,
  WidgetStyle,
  WidgetConfig,
  ActivitySchedule,
} from '../types/widget.types';

// =====================================================
// RAW DATABASE TYPES
// =====================================================

export interface RawActivity {
  id: string;
  organization_id: string;
  venue_id: string | null;
  name: string;
  description: string | null;
  tagline?: string | null;
  image_url: string | null;
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
  venue?: { name: string } | null;
}

export interface RawVenue {
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
// DEFAULT VALUES (Fail-safe)
// =====================================================

const DEFAULT_SCHEDULE: ActivitySchedule = {
  operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  startTime: '10:00',
  endTime: '22:00',
  slotInterval: 60,
  blockedDates: [],
  customAvailableDates: [],
  advanceBookingDays: 30,
};

const DEFAULT_STYLE: WidgetStyle = {
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: '8px',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  theme: 'light',
};

const DEFAULT_CONFIG: WidgetConfig = {
  showPricing: true,
  showCalendar: true,
  showTimeSlots: true,
  showDescription: true,
  buttonText: 'Book Now',
  successMessage: 'Your booking is confirmed!',
  redirectUrl: null,
  timezone: 'UTC',
};

// =====================================================
// NORMALIZER CLASS
// =====================================================

class WidgetDataNormalizer {
  /**
   * Normalize activity from database to widget format
   */
  normalizeActivity(raw: RawActivity): WidgetActivity {
    const schedule = this.extractSchedule(raw.settings);
    const pricingTiers = this.extractPricingTiers(raw);

    return {
      id: raw.id,
      organizationId: raw.organization_id,
      venueId: raw.venue_id,
      venueName: raw.venue?.name || null,
      name: raw.name || 'Untitled Activity',
      description: raw.description,
      tagline: raw.tagline || null,
      coverImage: raw.image_url,
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

  /**
   * Normalize venue from database to widget format
   */
  normalizeVenue(raw: RawVenue): WidgetVenue {
    return {
      id: raw.id,
      name: raw.name || 'Unnamed Venue',
      address: raw.address,
      city: raw.city,
      state: raw.state,
      timezone: raw.timezone || 'UTC',
      primaryColor: raw.primary_color || DEFAULT_STYLE.primaryColor,
      phone: raw.phone,
      email: raw.email,
    };
  }

  /**
   * Extract schedule configuration from settings JSONB
   */
  extractSchedule(settings: Record<string, any> | null): ActivitySchedule {
    if (!settings) return { ...DEFAULT_SCHEDULE };

    return {
      operatingDays: settings.operatingDays || DEFAULT_SCHEDULE.operatingDays,
      startTime: settings.startTime || DEFAULT_SCHEDULE.startTime,
      endTime: settings.endTime || DEFAULT_SCHEDULE.endTime,
      slotInterval: settings.slotInterval || settings.slotDuration || DEFAULT_SCHEDULE.slotInterval,
      blockedDates: settings.blockedDates || [],
      customAvailableDates: settings.customAvailableDates || [],
      advanceBookingDays: settings.advanceBookingDays || DEFAULT_SCHEDULE.advanceBookingDays,
    };
  }

  /**
   * Extract pricing tiers for multi-tier checkout
   */
  extractPricingTiers(raw: RawActivity): { id: string; name: string; price: number; stripePriceId?: string }[] {
    const tiers: { id: string; name: string; price: number; stripePriceId?: string }[] = [];
    
    // Adult tier (required)
    tiers.push({
      id: 'adult',
      name: 'Adult',
      price: raw.price || 0,
      stripePriceId: raw.stripe_prices?.adult?.price_id || raw.stripe_price_id || undefined,
    });

    // Child tier (optional)
    if (raw.child_price !== null && raw.child_price !== undefined && raw.child_price > 0) {
      tiers.push({
        id: 'child',
        name: 'Child',
        price: raw.child_price,
        stripePriceId: raw.stripe_prices?.child?.price_id,
      });
    }

    return tiers;
  }

  /**
   * Normalize widget style configuration
   */
  normalizeStyle(style: any): WidgetStyle {
    return {
      primaryColor: style?.primaryColor || DEFAULT_STYLE.primaryColor,
      secondaryColor: style?.secondaryColor || DEFAULT_STYLE.secondaryColor,
      backgroundColor: style?.backgroundColor || DEFAULT_STYLE.backgroundColor,
      textColor: style?.textColor || DEFAULT_STYLE.textColor,
      borderRadius: style?.borderRadius || DEFAULT_STYLE.borderRadius,
      fontFamily: style?.fontFamily || DEFAULT_STYLE.fontFamily,
      theme: style?.theme === 'dark' ? 'dark' : 'light',
    };
  }

  /**
   * Normalize widget configuration
   */
  normalizeConfig(config: any): WidgetConfig {
    return {
      showPricing: config?.showPricing !== false,
      showCalendar: config?.showCalendar !== false,
      showTimeSlots: config?.showTimeSlots !== false,
      showDescription: config?.showDescription !== false,
      buttonText: config?.buttonText || DEFAULT_CONFIG.buttonText,
      successMessage: config?.successMessage || DEFAULT_CONFIG.successMessage,
      redirectUrl: config?.redirectAfterBooking || null,
      timezone: config?.timezone || DEFAULT_CONFIG.timezone,
    };
  }
}

// Export singleton
export const widgetDataNormalizer = new WidgetDataNormalizer();
