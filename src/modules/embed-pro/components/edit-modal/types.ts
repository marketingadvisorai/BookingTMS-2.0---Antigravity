/**
 * Edit Embed Modal - Type Definitions
 * @module embed-pro/components/edit-modal/types
 */

import type {
  EmbedTheme,
  WidgetTheme,
  LayoutOrientation,
  VenueDisplayMode,
  VenueCardStyle,
} from '../../types/embed-config.types';

export interface EditFormData {
  name: string;
  description: string;
  // Theme
  widgetTheme: WidgetTheme;
  colorTheme: EmbedTheme;
  primaryColor: string;
  borderRadius: string;
  fontFamily: string;
  // Layout
  layoutOrientation: LayoutOrientation;
  displayMode: VenueDisplayMode;
  cardStyle: VenueCardStyle;
  gridColumns: 1 | 2 | 3 | 4;
  // Display options
  showPricing: boolean;
  showDescription: boolean;
  showActivityImage: boolean;
  showActivityDuration: boolean;
  showActivityCapacity: boolean;
  enableSearch: boolean;
  compactOnMobile: boolean;
}

export const DEFAULT_FORM_DATA: EditFormData = {
  name: '',
  description: '',
  widgetTheme: 'liquid-glass',
  colorTheme: 'light',
  primaryColor: '#2563eb',
  borderRadius: '12px',
  fontFamily: 'Inter, system-ui, sans-serif',
  layoutOrientation: 'vertical',
  displayMode: 'grid',
  cardStyle: 'default',
  gridColumns: 2,
  showPricing: true,
  showDescription: true,
  showActivityImage: true,
  showActivityDuration: true,
  showActivityCapacity: true,
  enableSearch: false,
  compactOnMobile: true,
};
