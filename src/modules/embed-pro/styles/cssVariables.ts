/**
 * CSS Variable Injection System
 * @module embed-pro/styles/cssVariables
 * 
 * Generates CSS custom properties from widget style config.
 * Enables seamless website integration and dynamic theming.
 */

import type { WidgetStyleConfig } from './types';

// =====================================================
// CSS VARIABLE GENERATION
// =====================================================

/**
 * Generates CSS custom properties from a widget style config.
 * Uses a configurable prefix to prevent conflicts with host website.
 */
export function generateCSSVariables(
  config: WidgetStyleConfig,
  prefix = '--bw'
): string {
  const vars: string[] = [];

  // Colors - Primary
  vars.push(`${prefix}-color-primary: ${config.colors.primary};`);
  vars.push(`${prefix}-color-primary-hover: ${config.colors.primaryHover};`);
  vars.push(`${prefix}-color-primary-light: ${config.colors.primaryLight};`);
  vars.push(`${prefix}-color-secondary: ${config.colors.secondary};`);
  vars.push(`${prefix}-color-accent: ${config.colors.accent};`);

  // Colors - Semantic
  vars.push(`${prefix}-color-success: ${config.colors.success};`);
  vars.push(`${prefix}-color-warning: ${config.colors.warning};`);
  vars.push(`${prefix}-color-error: ${config.colors.error};`);
  vars.push(`${prefix}-color-info: ${config.colors.info};`);

  // Background colors
  vars.push(`${prefix}-bg-base: ${config.background.base};`);
  vars.push(`${prefix}-bg-card: ${config.background.card};`);
  vars.push(`${prefix}-bg-input: ${config.background.input};`);
  vars.push(`${prefix}-bg-hover: ${config.background.hover};`);
  vars.push(`${prefix}-bg-overlay: ${config.background.overlay};`);

  // Text colors
  vars.push(`${prefix}-text-primary: ${config.text.primary};`);
  vars.push(`${prefix}-text-secondary: ${config.text.secondary};`);
  vars.push(`${prefix}-text-muted: ${config.text.muted};`);
  vars.push(`${prefix}-text-inverted: ${config.text.inverted};`);
  vars.push(`${prefix}-text-link: ${config.text.link};`);

  // Border colors
  vars.push(`${prefix}-border-default: ${config.border.default};`);
  vars.push(`${prefix}-border-focus: ${config.border.focus};`);
  vars.push(`${prefix}-border-error: ${config.border.error};`);
  vars.push(`${prefix}-border-success: ${config.border.success};`);

  // Typography
  vars.push(`${prefix}-font-family: ${config.typography.fontFamily};`);
  if (config.typography.headingFontFamily) {
    vars.push(`${prefix}-font-heading: ${config.typography.headingFontFamily};`);
  }

  // Typography scale
  Object.entries(config.typography.scale).forEach(([key, value]) => {
    vars.push(`${prefix}-text-${key}: ${value};`);
  });

  // Spacing
  Object.entries(config.spacing.scale).forEach(([key, value]) => {
    vars.push(`${prefix}-space-${key}: ${value};`);
  });
  vars.push(`${prefix}-container-padding: ${config.spacing.containerPadding};`);
  vars.push(`${prefix}-card-padding: ${config.spacing.cardPadding};`);

  // Border radius
  vars.push(`${prefix}-radius-button: ${config.button.borderRadius};`);
  vars.push(`${prefix}-radius-input: ${config.input.borderRadius};`);
  vars.push(`${prefix}-radius-card: ${config.card.borderRadius};`);
  vars.push(`${prefix}-radius-calendar-day: ${config.calendar.dayBorderRadius};`);

  // Animation
  vars.push(`${prefix}-transition-default: ${config.animation.transitions.default};`);
  vars.push(`${prefix}-transition-fast: ${config.animation.transitions.fast};`);
  vars.push(`${prefix}-transition-slow: ${config.animation.transitions.slow};`);
  vars.push(`${prefix}-easing: ${config.animation.easing};`);

  // Effects
  if (config.effects.glassmorphism) {
    vars.push(`${prefix}-blur: ${config.effects.blur};`);
    vars.push(`${prefix}-backdrop: blur(${config.effects.blur});`);
  }

  // Calendar
  vars.push(`${prefix}-calendar-available: ${config.calendar.availableColor};`);
  vars.push(`${prefix}-calendar-unavailable: ${config.calendar.unavailableColor};`);

  // Layout
  vars.push(`${prefix}-max-width: ${config.layout.maxWidth};`);
  vars.push(`${prefix}-container-width: ${config.layout.containerWidth};`);

  return vars.join('\n');
}

/**
 * Generates a complete CSS style block with variables.
 */
export function generateStyleBlock(
  config: WidgetStyleConfig,
  selector = '.bookflow-widget',
  prefix = '--bw'
): string {
  const variables = generateCSSVariables(config, prefix);

  return `
${selector} {
  ${variables}
}
`.trim();
}

/**
 * Injects CSS variables into the document head.
 */
export function injectCSSVariables(
  config: WidgetStyleConfig,
  selector = '.bookflow-widget',
  prefix = '--bw'
): HTMLStyleElement {
  const styleBlock = generateStyleBlock(config, selector, prefix);
  
  const styleElement = document.createElement('style');
  styleElement.id = 'bookflow-widget-variables';
  styleElement.textContent = styleBlock;
  
  // Remove existing style if present
  const existing = document.getElementById('bookflow-widget-variables');
  if (existing) {
    existing.remove();
  }
  
  document.head.appendChild(styleElement);
  return styleElement;
}

/**
 * Generates inline style object for React components.
 */
export function generateInlineStyles(
  config: WidgetStyleConfig,
  prefix = '--bw'
): React.CSSProperties {
  const styles: Record<string, string> = {};

  // Colors
  styles[`${prefix}-color-primary`] = config.colors.primary;
  styles[`${prefix}-color-primary-hover`] = config.colors.primaryHover;
  styles[`${prefix}-bg-base`] = config.background.base;
  styles[`${prefix}-bg-card`] = config.background.card;
  styles[`${prefix}-text-primary`] = config.text.primary;
  styles[`${prefix}-text-secondary`] = config.text.secondary;
  styles[`${prefix}-border-default`] = config.border.default;
  styles[`${prefix}-font-family`] = config.typography.fontFamily;

  return styles as React.CSSProperties;
}

/**
 * Creates a CSS variable reference string.
 */
export function cssVar(name: string, prefix = '--bw'): string {
  return `var(${prefix}-${name})`;
}
