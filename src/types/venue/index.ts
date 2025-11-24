/**
 * Venue Type Definitions
 * Centralized type definitions for venue-related data structures
 */

import { VenueWidgetConfig } from '../venueWidget';

export interface Venue {
  id: string;
  organizationId?: string;
  name: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
  widgetConfig: VenueWidgetConfig;
  embedKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VenueInput = Pick<
  Venue,
  'name' | 'type' | 'description' | 'address' | 'phone' | 'email' | 'website' | 'primaryColor' | 'widgetConfig' | 'isActive'
>;

export interface VenueFormData {
  name: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
}

export interface VenueTypeOption {
  value: string;
  label: string;
  icon: string;
}
