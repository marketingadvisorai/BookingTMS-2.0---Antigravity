/**
 * Embed Pro 1.1 - Type Definitions
 * @module embed-pro/types
 */

// =====================================================
// ENUMS
// =====================================================

export type EmbedType = 
  | 'booking-widget'
  | 'calendar-widget'
  | 'button-widget'
  | 'inline-widget'
  | 'popup-widget';

export type TargetType = 
  | 'activity'
  | 'venue'
  | 'multi-activity';

export type EmbedTheme = 'light' | 'dark' | 'auto';

export type ButtonStyle = 'filled' | 'outline' | 'ghost';

export type ShadowSize = 'none' | 'sm' | 'md' | 'lg' | 'xl';

// =====================================================
// CONFIGURATION INTERFACES
// =====================================================

export interface EmbedConfig {
  showPricing: boolean;
  showCalendar: boolean;
  showTimeSlots: boolean;
  showDescription: boolean;
  allowMultipleBookings: boolean;
  redirectAfterBooking: string | null;
  language: string;
  timezone: string;
  buttonText: string;
  successMessage: string;
}

export interface EmbedStyle {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
  buttonStyle: ButtonStyle;
  theme: EmbedTheme;
  shadow: ShadowSize;
  padding: string;
}

// =====================================================
// MAIN ENTITY INTERFACES
// =====================================================

export interface EmbedConfigEntity {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  type: EmbedType;
  target_type: TargetType;
  target_id: string | null;
  target_ids: string[];
  embed_key: string;
  config: EmbedConfig;
  style: EmbedStyle;
  is_active: boolean;
  analytics_enabled: boolean;
  view_count: number;
  booking_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// UI-friendly version with resolved relationships
export interface EmbedConfigWithRelations extends EmbedConfigEntity {
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  activity?: {
    id: string;
    name: string;
    cover_image: string | null;
  };
  venue?: {
    id: string;
    name: string;
    city: string | null;
  };
}

// =====================================================
// FORM INTERFACES
// =====================================================

export interface CreateEmbedConfigInput {
  organization_id: string;
  name: string;
  description?: string;
  type: EmbedType;
  target_type: TargetType;
  target_id?: string;
  target_ids?: string[];
  config?: Partial<EmbedConfig>;
  style?: Partial<EmbedStyle>;
}

export interface UpdateEmbedConfigInput {
  name?: string;
  description?: string | null;
  type?: EmbedType;
  target_type?: TargetType;
  target_id?: string | null;
  target_ids?: string[];
  config?: Partial<EmbedConfig>;
  style?: Partial<EmbedStyle>;
  is_active?: boolean;
  analytics_enabled?: boolean;
}

// =====================================================
// CODE GENERATION
// =====================================================

export type CodeFormat = 'html' | 'react' | 'nextjs' | 'wordpress' | 'iframe';

export interface GeneratedCode {
  format: CodeFormat;
  code: string;
  instructions: string;
}

export interface CodeGeneratorOptions {
  embedKey: string;
  format: CodeFormat;
  domain?: string;
  includeStyles?: boolean;
}

// =====================================================
// DEFAULTS
// =====================================================

export const DEFAULT_EMBED_CONFIG: EmbedConfig = {
  showPricing: true,
  showCalendar: true,
  showTimeSlots: true,
  showDescription: true,
  allowMultipleBookings: false,
  redirectAfterBooking: null,
  language: 'en',
  timezone: 'UTC',
  buttonText: 'Book Now',
  successMessage: 'Booking confirmed!',
};

export const DEFAULT_EMBED_STYLE: EmbedStyle = {
  primaryColor: '#2563eb',
  secondaryColor: '#1e40af',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  borderRadius: '8px',
  fontFamily: 'Inter, system-ui, sans-serif',
  buttonStyle: 'filled',
  theme: 'light',
  shadow: 'md',
  padding: '16px',
};

// =====================================================
// WIDGET TYPE METADATA
// =====================================================

export interface EmbedTypeInfo {
  value: EmbedType;
  label: string;
  description: string;
  icon: string;
  bestFor: string[];
}

export const EMBED_TYPES: EmbedTypeInfo[] = [
  {
    value: 'booking-widget',
    label: 'Booking Widget',
    description: 'Complete booking experience with calendar, time slots, and checkout',
    icon: 'Calendar',
    bestFor: ['Landing pages', 'Dedicated booking pages', 'Service pages'],
  },
  {
    value: 'calendar-widget',
    label: 'Calendar Widget',
    description: 'Calendar view showing availability at a glance',
    icon: 'CalendarDays',
    bestFor: ['Informational pages', 'Sidebars', 'Quick availability check'],
  },
  {
    value: 'button-widget',
    label: 'Button Widget',
    description: '"Book Now" button that opens a popup with full booking flow',
    icon: 'MousePointerClick',
    bestFor: ['Headers', 'CTAs', 'Limited space areas'],
  },
  {
    value: 'inline-widget',
    label: 'Inline Widget',
    description: 'Embedded inline with page content, responsive design',
    icon: 'LayoutTemplate',
    bestFor: ['Blog posts', 'Service descriptions', 'Content pages'],
  },
  {
    value: 'popup-widget',
    label: 'Popup Widget',
    description: 'Modal/popup triggered by click, hover, or scroll',
    icon: 'Maximize2',
    bestFor: ['Exit intent', 'Promotional offers', 'Lead capture'],
  },
];

export const TARGET_TYPES = [
  { value: 'activity' as TargetType, label: 'Single Activity' },
  { value: 'venue' as TargetType, label: 'Venue (All Activities)' },
  { value: 'multi-activity' as TargetType, label: 'Multiple Activities' },
];
