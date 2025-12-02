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

export type CustomFieldType = 'text' | 'email' | 'phone' | 'number' | 'select' | 'checkbox' | 'textarea';

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

// Social media links configuration
export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

// Custom form field configuration
export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[]; // For select type
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

// Scheduling rules configuration
export interface SchedulingConfig {
  minAdvanceDays?: number;      // Minimum days in advance to book
  maxAdvanceDays?: number;      // Maximum days in advance to book
  blockedDates?: string[];      // Specific dates that are blocked
  bufferMinutes?: number;       // Buffer time between bookings
  allowSameDay?: boolean;       // Allow same-day bookings
  cutoffHours?: number;         // Hours before start time cutoff
}

// Display options configuration
export interface DisplayOptions {
  showCapacityWarning?: boolean;      // Show "Only X spots left"
  capacityWarningThreshold?: number;  // When to show warning (e.g., 3)
  showWaitlist?: boolean;             // Allow waitlist signup
  showPromoField?: boolean;           // Show promo code input
  showSocialProof?: boolean;          // Show "X people booked today"
  showActivityImages?: boolean;       // Show activity images in widget
  compactMode?: boolean;              // Compact layout for small spaces
  autoSelectTime?: boolean;           // Auto-select first available time
  showPoweredBy?: boolean;            // Show "Powered by BookingTMS"
}

// Conversion tracking configuration
export interface ConversionTracking {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  googleTagManagerId?: string;
  customScripts?: string[];      // Custom tracking scripts
}

// Venue layout configuration
export type VenueDisplayMode = 'grid' | 'list' | 'carousel';
export type VenueCardStyle = 'default' | 'compact' | 'detailed' | 'horizontal';
export type VenueSortBy = 'name' | 'price' | 'duration' | 'popularity';

export interface VenueLayoutConfig {
  displayMode?: VenueDisplayMode;        // grid, list, or carousel
  gridColumns?: 1 | 2 | 3 | 4;           // Number of columns for grid mode
  cardStyle?: VenueCardStyle;            // Card appearance style
  showActivityImage?: boolean;           // Show activity cover images
  showActivityPrice?: boolean;           // Show price on cards
  showActivityDuration?: boolean;        // Show duration on cards
  showActivityCapacity?: boolean;        // Show min-max players
  showActivityDescription?: boolean;     // Show description snippet
  sortBy?: VenueSortBy;                  // Sort activities by
  sortOrder?: 'asc' | 'desc';            // Sort direction
  maxActivities?: number;                // Limit number shown (0 = all)
  filterCategories?: string[];           // Filter by category tags
  enableSearch?: boolean;                // Show search box
  enableFilters?: boolean;               // Show filter dropdowns
  compactOnMobile?: boolean;             // Use compact style on mobile
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
  // Advanced customization fields
  custom_css?: string | null;
  custom_logo_url?: string | null;
  custom_header?: string | null;
  custom_footer?: string | null;
  terms_conditions?: string | null;
  terms_required?: boolean;
  social_links?: SocialLinks;
  custom_fields?: CustomField[];
  scheduling_config?: SchedulingConfig;
  display_options?: DisplayOptions;
  allowed_domains?: string[];
  conversion_tracking?: ConversionTracking;
  // Venue layout configuration
  venue_layout?: VenueLayoutConfig;
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
  // Advanced customization updates
  custom_css?: string | null;
  custom_logo_url?: string | null;
  custom_header?: string | null;
  custom_footer?: string | null;
  terms_conditions?: string | null;
  terms_required?: boolean;
  social_links?: Partial<SocialLinks>;
  custom_fields?: CustomField[];
  scheduling_config?: Partial<SchedulingConfig>;
  display_options?: Partial<DisplayOptions>;
  allowed_domains?: string[];
  conversion_tracking?: Partial<ConversionTracking>;
  // Venue layout updates
  venue_layout?: Partial<VenueLayoutConfig>;
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
