/**
 * Widget Styling Utilities
 * @module embed-pro/styles/utils
 * 
 * Helper functions for color manipulation, style merging,
 * and developer-friendly style utilities.
 */

import type { WidgetStyleConfig, ColorMode } from './types';

// =====================================================
// COLOR UTILITIES
// =====================================================

/**
 * Converts hex color to RGB values.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB values to hex color.
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/**
 * Creates an RGBA color string from hex and alpha.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Lightens a color by a percentage.
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const lighten = (value: number) =>
    Math.min(255, Math.round(value + (255 - value) * (percent / 100)));

  return rgbToHex(lighten(rgb.r), lighten(rgb.g), lighten(rgb.b));
}

/**
 * Darkens a color by a percentage.
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const darken = (value: number) =>
    Math.max(0, Math.round(value * (1 - percent / 100)));

  return rgbToHex(darken(rgb.r), darken(rgb.g), darken(rgb.b));
}

/**
 * Calculates contrast ratio between two colors.
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
      const normalized = v / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determines if text should be light or dark based on background.
 */
export function getContrastTextColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return '#000000';

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// =====================================================
// STYLE MERGE UTILITIES
// =====================================================

/**
 * Deep merges two style configs, with overrides taking precedence.
 */
export function mergeStyleConfigs(
  base: WidgetStyleConfig,
  overrides: Partial<WidgetStyleConfig>
): WidgetStyleConfig {
  return {
    ...base,
    ...overrides,
    colors: { ...base.colors, ...overrides.colors },
    background: { ...base.background, ...overrides.background },
    text: { ...base.text, ...overrides.text },
    border: { ...base.border, ...overrides.border },
    typography: { 
      ...base.typography, 
      ...overrides.typography,
      scale: { ...base.typography.scale, ...overrides.typography?.scale },
      lineHeight: { ...base.typography.lineHeight, ...overrides.typography?.lineHeight },
      weight: { ...base.typography.weight, ...overrides.typography?.weight },
    },
    spacing: { 
      ...base.spacing, 
      ...overrides.spacing,
      scale: { ...base.spacing.scale, ...overrides.spacing?.scale },
    },
    animation: { 
      ...base.animation, 
      ...overrides.animation,
      transitions: { ...base.animation.transitions, ...overrides.animation?.transitions },
      keyframes: { ...base.animation.keyframes, ...overrides.animation?.keyframes },
    },
    button: { ...base.button, ...overrides.button },
    input: { ...base.input, ...overrides.input },
    card: { ...base.card, ...overrides.card },
    calendar: { ...base.calendar, ...overrides.calendar },
    layout: { ...base.layout, ...overrides.layout },
    effects: { ...base.effects, ...overrides.effects },
  };
}

// =====================================================
// COLOR MODE DETECTION
// =====================================================

/**
 * Detects system color preference.
 */
export function detectSystemColorMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resolves 'auto' color mode to actual mode.
 */
export function resolveColorMode(mode: ColorMode): 'light' | 'dark' {
  if (mode === 'auto') {
    return detectSystemColorMode();
  }
  if (mode === 'inherit') {
    // Check parent element for dark mode indicators
    if (typeof document !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') ||
                     document.body.classList.contains('dark');
      return isDark ? 'dark' : 'light';
    }
    return 'light';
  }
  return mode;
}

// =====================================================
// CLASS NAME UTILITIES
// =====================================================

/**
 * Generates BEM-style class names.
 */
export function bem(block: string, element?: string, modifier?: string): string {
  let className = block;
  if (element) className += `__${element}`;
  if (modifier) className += `--${modifier}`;
  return className;
}

/**
 * Conditionally joins class names.
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
