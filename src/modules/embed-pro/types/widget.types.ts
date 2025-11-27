/**
 * Embed Pro 2.0 - Widget Type Definitions
 * @module embed-pro/types/widget
 * 
 * Contains all types used by the widget rendering system.
 * Kept separate from embed-config.types.ts for clarity.
 */

// =====================================================
// ACTIVITY DATA TYPES
// =====================================================

/** Schedule configuration for an activity */
export interface ActivitySchedule {
  operatingDays: string[];
  startTime: string;
  endTime: string;
  slotInterval: number;
  blockedDates?: string[];
  customAvailableDates?: string[];
  advanceBookingDays?: number;
}

/** Pricing tier for multi-tier pricing */
export interface PricingTier {
  id: string;
  name: string;
  price: number;
  stripePriceId?: string;
}

/** Activity data normalized for widget consumption */
export interface WidgetActivity {
  id: string;
  organizationId: string;
  venueId: string | null;
  venueName: string | null;
  name: string;
  description: string | null;
  tagline: string | null;
  coverImage: string | null;
  duration: number;
  difficulty: string | null;
  minPlayers: number;
  maxPlayers: number;
  price: number;
  childPrice: number | null;
  currency: string;
  schedule: ActivitySchedule;
  stripePriceId: string | null;
  stripeProductId: string | null;
  pricingTiers: PricingTier[];
}

// =====================================================
// VENUE DATA TYPES
// =====================================================

/** Venue data normalized for widget consumption */
export interface WidgetVenue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  timezone: string;
  primaryColor: string;
  phone: string | null;
  email: string | null;
}

// =====================================================
// WIDGET DATA TYPES
// =====================================================

/** Combined widget data passed to widget components */
export interface WidgetData {
  embedKey: string;
  type: string;
  targetType: 'activity' | 'venue' | 'multi-activity';
  activity: WidgetActivity | null;
  activities: WidgetActivity[];
  venue: WidgetVenue | null;
  style: WidgetStyle;
  config: WidgetConfig;
  isPreview: boolean;
}

/** Widget style configuration */
export interface WidgetStyle {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
  theme: 'light' | 'dark';
}

/** Widget behavior configuration */
export interface WidgetConfig {
  showPricing: boolean;
  showCalendar: boolean;
  showTimeSlots: boolean;
  showDescription: boolean;
  buttonText: string;
  successMessage: string;
  redirectUrl: string | null;
  timezone: string;
}

// =====================================================
// BOOKING FLOW TYPES
// =====================================================

/** Steps in the booking flow */
export type BookingStep = 
  | 'select-activity'
  | 'select-date'
  | 'select-time'
  | 'select-party'
  | 'checkout'
  | 'success';

/** Current booking state */
export interface BookingState {
  step: BookingStep;
  selectedActivity: WidgetActivity | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  partySize: number;
  childCount: number;
  customerInfo: CustomerInfo | null;
  bookingId: string | null;
  error: string | null;
}

/** Customer information for booking */
export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
}

// =====================================================
// TIME SLOT TYPES
// =====================================================

/** A single time slot */
export interface TimeSlot {
  time: string;
  available: boolean;
  spotsRemaining: number;
  price: number;
}

/** Date availability status */
export interface DateAvailability {
  date: string;
  status: 'available' | 'limited' | 'unavailable' | 'blocked' | 'past';
  spotsRemaining: number;
}

// =====================================================
// DEFAULT VALUES
// =====================================================

export const DEFAULT_WIDGET_STYLE: WidgetStyle = {
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: '8px',
  fontFamily: 'Inter, system-ui, sans-serif',
  theme: 'light',
};

export const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  showPricing: true,
  showCalendar: true,
  showTimeSlots: true,
  showDescription: true,
  buttonText: 'Book Now',
  successMessage: 'Your booking is confirmed!',
  redirectUrl: null,
  timezone: 'UTC',
};

export const INITIAL_BOOKING_STATE: BookingState = {
  step: 'select-date',
  selectedActivity: null,
  selectedDate: null,
  selectedTime: null,
  partySize: 2,
  childCount: 0,
  customerInfo: null,
  bookingId: null,
  error: null,
};
