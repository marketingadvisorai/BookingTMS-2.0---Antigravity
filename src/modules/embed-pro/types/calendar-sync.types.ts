/**
 * Embed Pro 2.0 - Calendar Sync Types
 * @module embed-pro/types/calendar-sync.types
 * 
 * Type definitions for calendar integration.
 * Supports Google Calendar, Apple Calendar, Outlook, and iCal.
 */

// =====================================================
// CALENDAR PROVIDER TYPES
// =====================================================

export type CalendarProvider = 'google' | 'apple' | 'outlook' | 'ical' | 'yahoo';

export interface CalendarProviderInfo {
  id: CalendarProvider;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export const CALENDAR_PROVIDERS: CalendarProviderInfo[] = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: 'google',
    description: 'Add to Google Calendar',
    color: '#4285F4',
  },
  {
    id: 'apple',
    name: 'Apple Calendar',
    icon: 'apple',
    description: 'Download .ics file',
    color: '#000000',
  },
  {
    id: 'outlook',
    name: 'Outlook',
    icon: 'outlook',
    description: 'Add to Outlook Calendar',
    color: '#0078D4',
  },
  {
    id: 'yahoo',
    name: 'Yahoo Calendar',
    icon: 'yahoo',
    description: 'Add to Yahoo Calendar',
    color: '#6001D2',
  },
  {
    id: 'ical',
    name: 'Download .ics',
    icon: 'calendar',
    description: 'Download calendar file',
    color: '#666666',
  },
];

// =====================================================
// CALENDAR EVENT TYPES
// =====================================================

export interface CalendarEvent {
  /** Event title */
  title: string;
  /** Event description */
  description: string;
  /** Location (venue name + address) */
  location: string;
  /** Start date/time (ISO string) */
  startTime: string;
  /** End date/time (ISO string) */
  endTime: string;
  /** Timezone (e.g., "America/New_York") */
  timezone?: string;
  /** Organizer info */
  organizer?: {
    name: string;
    email: string;
  };
  /** URL for more info */
  url?: string;
  /** Unique event ID */
  uid?: string;
  /** Reminder before event (minutes) */
  reminder?: number;
}

export interface BookingCalendarEvent extends CalendarEvent {
  /** Booking reference */
  bookingRef: string;
  /** Activity name */
  activityName: string;
  /** Venue name */
  venueName: string;
  /** Venue address */
  venueAddress: string;
  /** Party size */
  partySize: number;
  /** Customer name */
  customerName: string;
  /** Customer email */
  customerEmail: string;
}

// =====================================================
// CALENDAR LINK TYPES
// =====================================================

export interface CalendarLinks {
  google: string;
  outlook: string;
  yahoo: string;
  icalDownload: string;
  icalContent: string;
}

// =====================================================
// UI TYPES
// =====================================================

export interface AddToCalendarState {
  isOpen: boolean;
  isGenerating: boolean;
  links: CalendarLinks | null;
  error: string | null;
}
