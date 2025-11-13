/**
 * Calendar Types
 * Multi-tenant calendar system for venues and games
 */

/**
 * Venue Calendar - Master calendar for a venue
 */
export interface VenueCalendar {
  id: string;
  organization_id: string;
  organization_name?: string;
  venue_id: string;
  venue_name?: string;
  name: string;
  slug: string;
  description?: string;
  
  // Settings
  timezone: string;
  default_slot_duration: number; // minutes
  booking_buffer_minutes: number;
  advance_booking_days: number;
  cancellation_hours: number;
  
  // Operating hours
  operating_hours: OperatingHours;
  
  // Status
  is_active: boolean;
  is_default: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * Game Calendar - Specific schedule for a game
 */
export interface GameCalendar {
  id: string;
  organization_id: string;
  organization_name?: string;
  venue_id: string;
  venue_name?: string;
  venue_calendar_id?: string;
  game_id: string;
  game_name?: string;
  name: string;
  slug: string;
  description?: string;
  
  // Game-specific settings
  slot_duration?: number; // Override venue default
  max_bookings_per_slot: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  
  // Availability
  custom_hours?: OperatingHours; // Override venue hours
  blocked_dates: BlockedDate[];
  
  // Pricing
  pricing_rules: PricingRule[];
  
  // Status
  is_active: boolean;
  
  // Metadata
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

/**
 * Operating Hours Structure
 */
export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string; // HH:MM format
  close: string; // HH:MM format
  closed: boolean;
}

/**
 * Blocked Date
 */
export interface BlockedDate {
  date: string; // YYYY-MM-DD format
  reason?: string;
  all_day: boolean;
  start_time?: string; // HH:MM format
  end_time?: string; // HH:MM format
}

/**
 * Pricing Rule - Time-based dynamic pricing
 */
export interface PricingRule {
  id: string;
  name: string;
  priority: number; // Higher priority rules apply first
  
  // Conditions
  days_of_week?: number[]; // 0-6, Sunday to Saturday
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  start_time?: string; // HH:MM
  end_time?: string; // HH:MM
  
  // Pricing adjustment
  type: 'fixed' | 'percentage' | 'multiplier';
  value: number; // Fixed amount, percentage, or multiplier
  
  // Status
  is_active: boolean;
}

/**
 * Calendar Slot - Available time slot
 */
export interface CalendarSlot {
  slot_time: string; // HH:MM:SS
  slot_end_time: string; // HH:MM:SS
  is_available: boolean;
  bookings_count: number;
  max_bookings: number;
  price?: number; // Calculated price based on pricing rules
}

/**
 * Calendar Availability Query
 */
export interface CalendarAvailabilityQuery {
  calendar_id: string;
  date: string; // YYYY-MM-DD
  include_pricing?: boolean;
}

/**
 * Create Venue Calendar DTO
 */
export interface CreateVenueCalendarDTO {
  organization_id: string;
  venue_id: string;
  name: string;
  slug?: string;
  description?: string;
  timezone?: string;
  default_slot_duration?: number;
  booking_buffer_minutes?: number;
  advance_booking_days?: number;
  cancellation_hours?: number;
  operating_hours?: OperatingHours;
  is_default?: boolean;
}

/**
 * Create Game Calendar DTO
 */
export interface CreateGameCalendarDTO {
  organization_id: string;
  venue_id: string;
  venue_calendar_id?: string;
  game_id: string;
  name: string;
  slug?: string;
  description?: string;
  slot_duration?: number;
  max_bookings_per_slot?: number;
  buffer_before_minutes?: number;
  buffer_after_minutes?: number;
  custom_hours?: OperatingHours;
  pricing_rules?: PricingRule[];
}

/**
 * Update Calendar DTO
 */
export interface UpdateCalendarDTO {
  name?: string;
  description?: string;
  operating_hours?: OperatingHours;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Calendar Filter
 */
export interface CalendarFilter {
  organization_id: string;
  venue_id?: string;
  game_id?: string;
  is_active?: boolean;
  is_default?: boolean;
}

/**
 * Type guards
 */
export function isVenueCalendar(calendar: any): calendar is VenueCalendar {
  return calendar && typeof calendar.venue_id === 'string' && !calendar.game_id;
}

export function isGameCalendar(calendar: any): calendar is GameCalendar {
  return calendar && typeof calendar.game_id === 'string';
}

