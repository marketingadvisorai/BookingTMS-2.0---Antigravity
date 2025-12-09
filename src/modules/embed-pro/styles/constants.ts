/**
 * Widget Styling Constants
 * @module embed-pro/styles/constants
 * 
 * Predefined values for widget styling.
 * Provides consistent options for developers.
 */

import type { 
  ShadowLevel, 
  RadiusPreset, 
  AnimationSpeed,
  SpacingScale,
  TypographyScale 
} from './types';

// =====================================================
// SHADOW PRESETS
// =====================================================

export const SHADOW_VALUES: Record<ShadowLevel, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};

export const SHADOW_OPTIONS = Object.keys(SHADOW_VALUES) as ShadowLevel[];

// =====================================================
// BORDER RADIUS PRESETS
// =====================================================

export const RADIUS_VALUES: Record<RadiusPreset, string> = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  full: '9999px',
};

export const RADIUS_OPTIONS: { value: string; label: string }[] = [
  { value: '0px', label: 'Square' },
  { value: '4px', label: 'Slight' },
  { value: '8px', label: 'Small' },
  { value: '12px', label: 'Medium' },
  { value: '16px', label: 'Large' },
  { value: '24px', label: 'Extra Large' },
  { value: '9999px', label: 'Pill' },
];

// =====================================================
// ANIMATION PRESETS
// =====================================================

export const ANIMATION_DURATIONS: Record<AnimationSpeed, string> = {
  none: '0ms',
  slow: '500ms',
  normal: '300ms',
  fast: '150ms',
};

export const EASING_PRESETS = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

// =====================================================
// SPACING SCALE
// =====================================================

export const DEFAULT_SPACING_SCALE: SpacingScale = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};

// =====================================================
// TYPOGRAPHY SCALE
// =====================================================

export const DEFAULT_TYPOGRAPHY_SCALE: TypographyScale = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
};

// =====================================================
// FONT FAMILY OPTIONS
// =====================================================

export const FONT_FAMILIES = [
  { value: 'Inter, system-ui, sans-serif', label: 'Inter', category: 'sans-serif' },
  { value: 'system-ui, -apple-system, sans-serif', label: 'System UI', category: 'system' },
  { value: '"SF Pro Display", system-ui, sans-serif', label: 'SF Pro', category: 'sans-serif' },
  { value: 'Roboto, sans-serif', label: 'Roboto', category: 'sans-serif' },
  { value: 'Poppins, sans-serif', label: 'Poppins', category: 'sans-serif' },
  { value: '"Open Sans", sans-serif', label: 'Open Sans', category: 'sans-serif' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat', category: 'sans-serif' },
  { value: 'Lato, sans-serif', label: 'Lato', category: 'sans-serif' },
  { value: '"Source Sans Pro", sans-serif', label: 'Source Sans', category: 'sans-serif' },
  { value: 'Georgia, serif', label: 'Georgia', category: 'serif' },
  { value: '"Playfair Display", serif', label: 'Playfair Display', category: 'serif' },
  { value: 'Merriweather, serif', label: 'Merriweather', category: 'serif' },
];

// =====================================================
// COLOR PRESETS
// =====================================================

export const BRAND_COLORS = [
  { value: '#2563eb', label: 'Blue', category: 'primary' },
  { value: '#7c3aed', label: 'Violet', category: 'primary' },
  { value: '#059669', label: 'Emerald', category: 'primary' },
  { value: '#dc2626', label: 'Red', category: 'primary' },
  { value: '#ea580c', label: 'Orange', category: 'primary' },
  { value: '#0891b2', label: 'Cyan', category: 'primary' },
  { value: '#be185d', label: 'Pink', category: 'primary' },
  { value: '#6366f1', label: 'Indigo', category: 'primary' },
  { value: '#f59e0b', label: 'Amber', category: 'primary' },
  { value: '#10b981', label: 'Green', category: 'primary' },
  { value: '#8b5cf6', label: 'Purple', category: 'primary' },
  { value: '#ec4899', label: 'Fuchsia', category: 'primary' },
  { value: '#14b8a6', label: 'Teal', category: 'primary' },
  { value: '#000000', label: 'Black', category: 'neutral' },
  { value: '#374151', label: 'Gray', category: 'neutral' },
  { value: '#64748b', label: 'Slate', category: 'neutral' },
];

// =====================================================
// BREAKPOINTS
// =====================================================

export const DEFAULT_BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// =====================================================
// Z-INDEX SCALE
// =====================================================

export const DEFAULT_Z_INDEX = {
  base: 1,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  overlay: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
};
