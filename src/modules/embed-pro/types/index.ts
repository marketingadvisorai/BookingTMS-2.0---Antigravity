/**
 * Embed Pro 2.0 - Type Exports
 * @module embed-pro/types
 */

// Admin Config Types
export * from './embed-config.types';
export * from './embed-analytics.types';

// Customer Widget Types (Embed Pro 2.0)
// Note: VenueLayoutConfig is exported from embed-config.types, not widget.types to avoid conflict
export type {
  ActivitySchedule,
  PricingTier,
  WidgetActivity,
  WidgetVenue,
  WidgetData,
  WidgetStyle,
  WidgetConfig,
  BookingStep,
  BookingState,
  CustomerInfo,
  TimeSlot,
  DateAvailability,
} from './widget.types';
export {
  DEFAULT_WIDGET_STYLE,
  DEFAULT_WIDGET_CONFIG,
  INITIAL_BOOKING_STATE,
} from './widget.types';
export * from './promo.types';
export * from './waitlist.types';
export * from './giftcard.types';
export * from './groupbooking.types';
export * from './calendar-sync.types';
export * from './sms-reminder.types';
