/**
 * Venue Constants
 * Static configuration and constant values for venues
 */

import { VenueTypeOption } from '../../types/venue';

export const VENUE_TYPES: VenueTypeOption[] = [
  { value: 'escape-room', label: 'Escape Room', icon: '🔐' },
  { value: 'smash-room', label: 'Smash Room', icon: '💥' },
  { value: 'axe-throwing', label: 'Axe Throwing', icon: '🪓' },
  { value: 'laser-tag', label: 'Laser Tag', icon: '🔫' },
  { value: 'vr-experience', label: 'VR Experience', icon: '🥽' },
  { value: 'arcade', label: 'Arcade', icon: '🎮' },
  { value: 'other', label: 'Other', icon: '🏢' },
];

export const DEFAULT_VENUE_COLOR = '#2563eb';

export const DEFAULT_FORM_DATA = {
  organizationId: '',
  name: '',
  type: 'escape-room',
  description: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  primaryColor: DEFAULT_VENUE_COLOR,
};
