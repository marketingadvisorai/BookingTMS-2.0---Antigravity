/**
 * Widget Module - Enterprise Booking Widget System
 * 
 * Modular components for embeddable booking widgets:
 * - WidgetApiClient: API client for widget data with caching
 * - useWidgetRealtime: Real-time subscription hook
 * 
 * @architecture
 * - Activity Embed: Single activity booking page
 * - Venue Embed: Multi-activity booking page (all games at venue)
 * - Both use the same Stripe product (metadata for session-specific data)
 */

export { WidgetApiClient } from './WidgetApiClient';
export type {
  ActivityConfig,
  VenueConfig,
  OrganizationConfig,
  ScheduleConfig,
  StripeConfig,
  ThemeConfig,
  AvailabilitySlot,
  ActivityWidgetData,
  VenueWidgetData,
  WidgetData,
} from './WidgetApiClient';

export { useWidgetRealtime } from './useWidgetRealtime';
export type { default as UseWidgetRealtimeResult } from './useWidgetRealtime';
