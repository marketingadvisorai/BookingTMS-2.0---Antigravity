/**
 * Activity Wizard Configuration - Default Values
 * Single source of truth for all wizard defaults
 */

import { ActivityData } from '../types';

/**
 * Default custom hours configuration for all days
 */
export const DEFAULT_CUSTOM_HOURS: ActivityData['customHours'] = {
  Monday: { enabled: true, startTime: '10:00', endTime: '22:00' },
  Tuesday: { enabled: true, startTime: '10:00', endTime: '22:00' },
  Wednesday: { enabled: true, startTime: '10:00', endTime: '22:00' },
  Thursday: { enabled: true, startTime: '10:00', endTime: '22:00' },
  Friday: { enabled: true, startTime: '10:00', endTime: '22:00' },
  Saturday: { enabled: true, startTime: '10:00', endTime: '22:00' },
  Sunday: { enabled: true, startTime: '10:00', endTime: '22:00' },
};

/**
 * Default peak pricing configuration
 */
export const DEFAULT_PEAK_PRICING: ActivityData['peakPricing'] = {
  enabled: false,
  weekdayPeakPrice: 0,
  weekendPeakPrice: 0,
  peakStartTime: '',
  peakEndTime: '',
};

/**
 * Default accessibility options
 */
export const DEFAULT_ACCESSIBILITY: ActivityData['accessibility'] = {
  strollerAccessible: false,
  wheelchairAccessible: false,
};

/**
 * All operating days
 */
export const ALL_OPERATING_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

/**
 * Default wizard form values - Single source of truth
 */
export const DEFAULT_ACTIVITY_DATA: Partial<ActivityData> = {
  // Step 1: Basic Info
  name: '',
  description: '',
  category: '',
  tagline: '',
  eventType: 'public',
  activityType: 'physical',
  timezone: '',

  // Step 2: Capacity & Pricing
  minAdults: 2,
  maxAdults: 8,
  minChildren: 0,
  maxChildren: 4,
  adultPrice: 30,
  childPrice: 20,
  customCapacityFields: [],
  groupDiscount: false,
  groupTiers: [],
  dynamicPricing: false,
  peakPricing: DEFAULT_PEAK_PRICING,

  // Step 3: Activity Details
  duration: 60,
  difficulty: 3,
  minAge: 12,
  language: ['English'],
  successRate: 75,
  activityDetails: '',
  additionalInformation: '',
  faqs: [],
  cancellationPolicies: [],
  accessibility: DEFAULT_ACCESSIBILITY,
  location: '',

  // Step 4: Media
  coverImage: '',
  galleryImages: [],
  videos: [],

  // Step 5: Schedule
  operatingDays: ALL_OPERATING_DAYS,
  startTime: '10:00',
  endTime: '22:00',
  slotInterval: 60,
  advanceBooking: 30,
  customHoursEnabled: false,
  customHours: DEFAULT_CUSTOM_HOURS,
  customDates: [],
  blockedDates: [],

  // Step 6: Payment (populated by Stripe)
  stripeProductId: undefined,
  stripePriceId: undefined,
  stripeSyncStatus: undefined,

  // Step 7: Widget - Default to Calendar Single Event
  selectedWidget: 'calendar-single-event',

  // Step 8: Additional Settings
  requiresWaiver: true,
  selectedWaiver: null,
  cancellationWindow: 24,
  specialInstructions: '',
  slug: '',
};

/**
 * Generate URL-safe slug from activity name
 */
export function generateSlug(name: string | undefined): string {
  if (!name) return 'activity';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Convert existing activity/service item data to wizard format
 */
export function convertToWizardData(activity: any): Partial<ActivityData> {
  if (!activity) return {};

  return {
    name: activity.name,
    description: activity.description,
    category: activity.category || 'escape-room',
    tagline: activity.tagline,
    eventType: activity.eventType || 'public',
    activityType: activity.activityType || 'physical',
    minAdults: activity.minAdults || activity.min_players || 2,
    maxAdults: activity.maxAdults || activity.max_players || 8,
    minChildren: activity.minChildren || 0,
    maxChildren: activity.maxChildren || 4,
    adultPrice: activity.adultPrice || activity.price || 30,
    childPrice: activity.childPrice || 25,
    duration: typeof activity.duration === 'number' 
      ? activity.duration 
      : parseInt(activity.duration, 10) || 60,
    difficulty: typeof activity.difficulty === 'number' 
      ? activity.difficulty 
      : 3,
    minAge: parseInt(activity.ageRange || activity.minAge, 10) || 12,
    language: Array.isArray(activity.language) ? activity.language : ['English'],
    successRate: activity.successRate || 75,
    activityDetails: activity.activityDetails || '',
    additionalInformation: activity.additionalInformation || '',
    faqs: Array.isArray(activity.faqs) ? activity.faqs : [],
    cancellationPolicies: Array.isArray(activity.cancellationPolicies) 
      ? activity.cancellationPolicies 
      : [],
    accessibility: activity.accessibility || DEFAULT_ACCESSIBILITY,
    location: activity.location || '',
    coverImage: activity.coverImage || activity.imageUrl || activity.image_url || '',
    galleryImages: Array.isArray(activity.galleryImages) ? activity.galleryImages : [],
    videos: Array.isArray(activity.videos) ? activity.videos : [],
    selectedWidget: 'calendar-single-event', // Always use calendar single
    operatingDays: Array.isArray(activity.operatingDays) 
      ? activity.operatingDays 
      : ALL_OPERATING_DAYS,
    startTime: activity.startTime || '10:00',
    endTime: activity.endTime || '22:00',
    slotInterval: activity.slotInterval || 60,
    advanceBooking: activity.advanceBooking || 30,
    customHoursEnabled: Boolean(activity.customHoursEnabled),
    customHours: typeof activity.customHours === 'object' && activity.customHours 
      ? activity.customHours 
      : DEFAULT_CUSTOM_HOURS,
    customCapacityFields: Array.isArray(activity.customCapacityFields) 
      ? activity.customCapacityFields 
      : [],
    groupDiscount: Boolean(activity.groupDiscount),
    groupTiers: Array.isArray(activity.groupTiers) ? activity.groupTiers : [],
    dynamicPricing: Boolean(activity.dynamicPricing),
    peakPricing: activity.peakPricing || DEFAULT_PEAK_PRICING,
    customDates: Array.isArray(activity.customDates) ? activity.customDates : [],
    blockedDates: Array.isArray(activity.blockedDates) ? activity.blockedDates : [],
    requiresWaiver: Boolean(activity.requiresWaiver),
    selectedWaiver: activity.selectedWaiver || null,
    cancellationWindow: activity.cancellationWindow || 24,
    specialInstructions: activity.specialInstructions || '',
    slug: activity.slug || generateSlug(activity.name),
    // Preserve Stripe fields
    stripeProductId: activity.stripeProductId || activity.stripe_product_id,
    stripePriceId: activity.stripePriceId || activity.stripe_price_id,
    stripePrices: activity.stripePrices || activity.stripe_prices,
    stripeCheckoutUrl: activity.stripeCheckoutUrl || activity.stripe_checkout_url,
    stripeSyncStatus: activity.stripeSyncStatus || activity.stripe_sync_status,
    stripeLastSync: activity.stripeLastSync || activity.stripe_last_sync,
  };
}
