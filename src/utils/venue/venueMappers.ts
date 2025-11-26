/**
 * Venue Data Mappers
 * Transforms data between database format and UI format
 * 
 * @see /docs/VENUES_MODULE_ARCHITECTURE.md for schema details
 */

import { Venue, VenueInput, DBVenue, VenueSettings } from '../../types/venue';
import { normalizeVenueWidgetConfig } from '../../types/venueWidget';
import { DEFAULT_VENUE_COLOR } from './venueConstants';

/**
 * Generate a URL-safe slug from a name
 */
export function generateVenueSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
}

/**
 * Maps database venue object to UI venue format
 * Handles all field transformations and defaults
 */
export const mapDBVenueToUI = (dbVenue: DBVenue | any): Venue => ({
  id: dbVenue.id,
  organizationId: dbVenue.organization_id,
  name: dbVenue.name,
  slug: dbVenue.slug,
  embedKey: dbVenue.embed_key || '',
  
  // Type & Description (from settings JSONB)
  type: dbVenue.settings?.type || 'other',
  description: dbVenue.settings?.description || dbVenue.description || '',
  website: dbVenue.settings?.website || '',
  
  // Location
  address: dbVenue.address || '',
  city: dbVenue.city || '',
  state: dbVenue.state || '',
  zip: dbVenue.zip || '',
  country: dbVenue.country || 'United States',
  
  // Contact
  phone: dbVenue.phone || '',
  email: dbVenue.email || '',
  
  // Configuration
  capacity: dbVenue.capacity || 100,
  timezone: dbVenue.timezone || 'America/New_York',
  status: (dbVenue.status || 'active') as 'active' | 'inactive' | 'maintenance',
  primaryColor: dbVenue.primary_color || DEFAULT_VENUE_COLOR,
  baseUrl: dbVenue.base_url || '',
  
  // Extended Data
  widgetConfig: normalizeVenueWidgetConfig(dbVenue.settings?.widgetConfig),
  operatingHours: dbVenue.operating_hours,
  settings: dbVenue.settings,
  
  // Media
  images: dbVenue.images || [],
  amenities: dbVenue.amenities || [],
  
  // Denormalized
  organizationName: dbVenue.organization_name,
  companyName: dbVenue.company_name,
  staffCount: dbVenue.staff_count || 0,
  
  // Computed
  isActive: dbVenue.status === 'active',
  
  // Timestamps
  createdAt: dbVenue.created_at,
  updatedAt: dbVenue.updated_at,
});

/**
 * Maps UI venue object to database format
 * Prepares data for Supabase insert/update operations
 */
export const mapUIVenueToDB = (uiVenue: Partial<VenueInput>): Partial<DBVenue> => {
  const settings: VenueSettings = {
    type: uiVenue.type || 'other',
    description: uiVenue.description,
    website: uiVenue.website,
    widgetConfig: normalizeVenueWidgetConfig(uiVenue.widgetConfig),
  };

  return {
    organization_id: uiVenue.organizationId,
    name: uiVenue.name,
    slug: uiVenue.name ? generateVenueSlug(uiVenue.name) : undefined,
    
    // Location
    address: uiVenue.address || '',
    city: uiVenue.city || '',
    state: uiVenue.state || '',
    zip: uiVenue.zip || '',
    country: uiVenue.country || 'United States',
    
    // Contact
    phone: uiVenue.phone || '',
    email: uiVenue.email || '',
    
    // Configuration
    capacity: uiVenue.capacity || 100,
    timezone: uiVenue.timezone || 'America/New_York',
    status: uiVenue.isActive === false ? 'inactive' : 'active',
    primary_color: uiVenue.primaryColor || DEFAULT_VENUE_COLOR,
    
    // Settings JSONB - DO NOT include embed_key, it's auto-generated
    settings,
  } as any;
};
