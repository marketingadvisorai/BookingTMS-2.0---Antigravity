/**
 * Venue Type Definitions
 * Centralized type definitions for venue-related data structures
 * 
 * @see /docs/VENUES_MODULE_ARCHITECTURE.md for full schema
 */

import { VenueWidgetConfig } from '../venueWidget';

/**
 * Operating hours for a single day
 */
export interface DayOperatingHours {
  open: string;   // "09:00" (24-hour format)
  close: string;  // "17:00" (24-hour format)
  closed: boolean;
}

/**
 * Full week operating hours
 */
export interface OperatingHours {
  monday: DayOperatingHours;
  tuesday: DayOperatingHours;
  wednesday: DayOperatingHours;
  thursday: DayOperatingHours;
  friday: DayOperatingHours;
  saturday: DayOperatingHours;
  sunday: DayOperatingHours;
}

/**
 * Venue settings stored in JSONB
 */
export interface VenueSettings {
  type: string;
  description?: string;
  website?: string;
  widgetConfig?: VenueWidgetConfig;
  bookingRules?: {
    advanceBookingDays?: number;
    minAdvanceHours?: number;
    cancellationHours?: number;
    requireDeposit?: boolean;
    depositPercentage?: number;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

/**
 * Main Venue interface (UI format, camelCase)
 */
export interface Venue {
  id: string;
  organizationId?: string;
  name: string;
  slug?: string;
  embedKey: string;
  
  // Type & Description (from settings)
  type: string;
  description: string;
  website: string;
  
  // Location
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  
  // Contact
  phone: string;
  email: string;
  
  // Configuration
  capacity?: number;
  timezone: string;
  status: 'active' | 'inactive' | 'maintenance';
  primaryColor: string;
  baseUrl?: string;
  
  // Extended Data
  widgetConfig: VenueWidgetConfig;
  operatingHours?: OperatingHours;
  settings?: VenueSettings;
  
  // Media
  images?: string[];
  amenities?: string[];
  
  // Denormalized
  organizationName?: string;
  companyName?: string;
  staffCount?: number;
  
  // Computed
  isActive: boolean;  // derived from status === 'active'
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Input type for creating/updating venues
 */
export type VenueInput = Pick<
  Venue,
  | 'name' | 'type' | 'description' | 'address' | 'phone' | 'email' 
  | 'website' | 'primaryColor' | 'widgetConfig' | 'isActive' | 'organizationId'
  | 'timezone' | 'capacity' | 'city' | 'state' | 'zip' | 'country'
>;

/**
 * Form data for venue create/edit dialogs
 */
export interface VenueFormData {
  organizationId?: string;
  name: string;
  type: string;
  description: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
  timezone?: string;
  capacity?: number;
}

/**
 * Venue type options for dropdown
 */
export interface VenueTypeOption {
  value: string;
  label: string;
  icon: string;
}

/**
 * Database venue format (snake_case)
 */
export interface DBVenue {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  embed_key: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  timezone: string;
  status: string;
  primary_color?: string;
  base_url?: string;
  settings: VenueSettings;
  operating_hours?: OperatingHours;
  images?: string[];
  amenities?: string[];
  organization_name?: string;
  company_name?: string;
  staff_count?: number;
  is_deleted?: boolean;
  deleted_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
