/**
 * Venue Data Mappers
 * Transforms data between database format and UI format
 */

import { Venue, VenueInput } from '../../types/venue';
import { normalizeVenueWidgetConfig } from '../../types/venueWidget';
import { DEFAULT_VENUE_COLOR } from './venueConstants';

/**
 * Generate a URL-safe slug from a name
 */
function generateVenueSlug(name: string): string {
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
export const mapDBVenueToUI = (dbVenue: any): Venue => ({
  id: dbVenue.id,
  organizationId: dbVenue.organization_id,
  name: dbVenue.name,
  type: dbVenue.settings?.type || 'other',
  description: dbVenue.settings?.description || '',
  address: dbVenue.address || '',
  phone: dbVenue.phone || '',
  email: dbVenue.email || '',
  website: dbVenue.settings?.website || '',
  primaryColor: dbVenue.primary_color || dbVenue.settings?.primaryColor || DEFAULT_VENUE_COLOR,
  widgetConfig: normalizeVenueWidgetConfig(dbVenue.settings?.widgetConfig),
  // IMPORTANT: Use database column embed_key, NOT settings.embedKey
  embedKey: dbVenue.embed_key || '',
  isActive: dbVenue.status === 'active',
  createdAt: dbVenue.created_at,
  updatedAt: dbVenue.updated_at,
});

/**
 * Maps UI venue object to database format
 * Prepares data for Supabase insert/update operations
 */
export const mapUIVenueToDB = (uiVenue: VenueInput): any => ({
  organization_id: uiVenue.organizationId,
  name: uiVenue.name,
  slug: generateVenueSlug(uiVenue.name),
  address: uiVenue.address || '',
  city: '', // Extract from address if needed
  state: '',
  zip: '',
  country: 'United States',
  phone: uiVenue.phone || '',
  email: uiVenue.email || '',
  capacity: 100,
  timezone: 'America/New_York',
  status: (uiVenue.isActive ? 'active' : 'inactive') as 'active' | 'inactive' | 'maintenance',
  primary_color: uiVenue.primaryColor || DEFAULT_VENUE_COLOR,
  // DO NOT set embed_key here - database trigger handles it automatically
  settings: {
    type: uiVenue.type,
    description: uiVenue.description,
    website: uiVenue.website,
    widgetConfig: normalizeVenueWidgetConfig(uiVenue.widgetConfig),
    // Remove embedKey from settings - it's a database column now
  },
});
