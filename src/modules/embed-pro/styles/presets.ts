/**
 * Widget Theme Presets
 * @module embed-pro/styles/presets
 * 
 * Pre-built theme configurations for common use cases.
 * Developers can use these as starting points or directly.
 */

import type { WidgetStyleConfig } from './types';
import { DEFAULT_SPACING_SCALE, DEFAULT_TYPOGRAPHY_SCALE } from './constants';

// =====================================================
// BASE CONFIGURATION (shared across all themes)
// =====================================================

const baseConfig: Partial<WidgetStyleConfig> = {
  spacing: {
    scale: DEFAULT_SPACING_SCALE,
    containerPadding: '16px',
    cardPadding: '20px',
    sectionGap: '24px',
    inputPadding: '12px',
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    scale: DEFAULT_TYPOGRAPHY_SCALE,
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
    weight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  animation: {
    enabled: true,
    speed: 'normal',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitions: {
      default: '300ms ease',
      fast: '150ms ease',
      slow: '500ms ease',
    },
    keyframes: {
      fadeIn: true,
      slideUp: true,
      scaleIn: true,
      pulse: true,
    },
  },
  input: {
    borderRadius: '12px',
    borderWidth: '1px',
    padding: '12px 16px',
    focusRing: true,
    focusRingColor: '#2563eb',
    focusRingWidth: '2px',
  },
  layout: {
    density: 'normal',
    maxWidth: '480px',
    containerWidth: '100%',
  },
};

// =====================================================
// LIQUID GLASS THEME (Modern Glassmorphism)
// =====================================================

export const LIQUID_GLASS_LIGHT: WidgetStyleConfig = {
  ...baseConfig as WidgetStyleConfig,
  themeId: 'liquid-glass-light',
  themeName: 'Liquid Glass',
  colorMode: 'light',
  colors: {
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    primaryLight: '#dbeafe',
    secondary: '#6366f1',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  background: {
    base: 'rgba(255, 255, 255, 0.8)',
    card: 'rgba(255, 255, 255, 0.7)',
    input: 'rgba(255, 255, 255, 0.9)',
    hover: 'rgba(249, 250, 251, 0.9)',
    overlay: 'rgba(0, 0, 0, 0.4)',
  },
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    muted: '#9ca3af',
    inverted: '#ffffff',
    link: '#2563eb',
  },
  border: {
    default: 'rgba(229, 231, 235, 0.8)',
    focus: '#2563eb',
    error: '#ef4444',
    success: '#10b981',
  },
  button: {
    variant: 'solid',
    borderRadius: '16px',
    padding: '14px 24px',
    fontWeight: 'semibold',
    uppercase: false,
    shadow: 'md',
    hoverScale: true,
  },
  card: {
    borderRadius: '24px',
    shadow: 'lg',
    border: true,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdrop: true,
    backdropBlur: '20px',
  },
  calendar: {
    dayBorderRadius: '12px',
    selectedDayStyle: 'solid',
    availableColor: '#dcfce7',
    unavailableColor: '#fee2e2',
    todayIndicator: true,
    weekStartsOn: 1,
  },
  effects: {
    glassmorphism: true,
    gradients: true,
    shadows: true,
    blur: '20px',
  },
};

export const LIQUID_GLASS_DARK: WidgetStyleConfig = {
  ...LIQUID_GLASS_LIGHT,
  themeId: 'liquid-glass-dark',
  colorMode: 'dark',
  background: {
    base: 'rgba(18, 18, 18, 0.96)', // Deep charcoal/black, high opacity
    card: 'rgba(40, 40, 40, 0.6)',  // Lighter, glassy card
    input: 'rgba(60, 60, 60, 0.4)', // Subtle input background
    hover: 'rgba(255, 255, 255, 0.1)', // Light hover overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  text: {
    primary: '#ffffff',     // Pure white for readability
    secondary: '#e5e7eb',   // Light gray for secondary
    muted: '#9ca3af',       // Muted gray
    inverted: '#000000',    // Black on white
    link: '#4ade80',        // Vibrant green link (Spotify-esque)
  },
  border: {
    default: 'rgba(255, 255, 255, 0.1)', // Very subtle white border
    focus: '#4ade80',       // Green focus ring
    error: '#f87171',
    success: '#34d399',
  },
  card: {
    ...LIQUID_GLASS_LIGHT.card,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Fixed: Explicit border color for dark mode
    shadow: 'xl',
  }
};

// =====================================================
// MINIMAL THEME (Clean & Simple)
// =====================================================

export const MINIMAL_LIGHT: WidgetStyleConfig = {
  ...baseConfig as WidgetStyleConfig,
  themeId: 'minimal-light',
  themeName: 'Minimal',
  colorMode: 'light',
  colors: {
    primary: '#000000',
    primaryHover: '#1f2937',
    primaryLight: '#f3f4f6',
    secondary: '#374151',
    accent: '#6b7280',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2563eb',
  },
  background: {
    base: '#ffffff',
    card: '#ffffff',
    input: '#f9fafb',
    hover: '#f3f4f6',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    muted: '#9ca3af',
    inverted: '#ffffff',
    link: '#111827',
  },
  border: {
    default: '#e5e7eb',
    focus: '#111827',
    error: '#dc2626',
    success: '#059669',
  },
  button: {
    variant: 'solid',
    borderRadius: '8px',
    padding: '12px 20px',
    fontWeight: 'medium',
    uppercase: false,
    shadow: 'none',
    hoverScale: false,
  },
  card: {
    borderRadius: '8px',
    shadow: 'sm',
    border: true,
    borderColor: '#e5e7eb',
    backdrop: false,
    backdropBlur: '0px',
  },
  calendar: {
    dayBorderRadius: '6px',
    selectedDayStyle: 'solid',
    availableColor: '#f3f4f6',
    unavailableColor: '#fef2f2',
    todayIndicator: true,
    weekStartsOn: 0,
  },
  effects: {
    glassmorphism: false,
    gradients: false,
    shadows: true,
    blur: '0px',
  },
};

// =====================================================
// THEME REGISTRY
// =====================================================

export const THEME_PRESETS: Record<string, WidgetStyleConfig> = {
  'liquid-glass-light': LIQUID_GLASS_LIGHT,
  'liquid-glass-dark': LIQUID_GLASS_DARK,
  'minimal-light': MINIMAL_LIGHT,
};

export const getThemePreset = (themeId: string): WidgetStyleConfig | null => {
  return THEME_PRESETS[themeId] || null;
};
