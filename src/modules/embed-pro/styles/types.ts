/**
 * Widget Styling Types
 * @module embed-pro/styles/types
 * 
 * Comprehensive type definitions for widget styling.
 * Covers all aspects developers need for website integration.
 */

// =====================================================
// CORE STYLE TYPES
// =====================================================

/** Color mode for widget */
export type ColorMode = 'light' | 'dark' | 'auto' | 'inherit';

/** Shadow intensity levels */
export type ShadowLevel = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Border radius presets */
export type RadiusPreset = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

/** Animation speed */
export type AnimationSpeed = 'none' | 'slow' | 'normal' | 'fast';

/** Font weight options */
export type FontWeight = 'normal' | 'medium' | 'semibold' | 'bold';

/** Button styles */
export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'gradient';

/** Layout density */
export type LayoutDensity = 'compact' | 'normal' | 'comfortable';

// =====================================================
// COLOR CONFIGURATION
// =====================================================

export interface ColorPalette {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface BackgroundColors {
  base: string;
  card: string;
  input: string;
  hover: string;
  overlay: string;
}

export interface TextColors {
  primary: string;
  secondary: string;
  muted: string;
  inverted: string;
  link: string;
}

export interface BorderColors {
  default: string;
  focus: string;
  error: string;
  success: string;
}

// =====================================================
// TYPOGRAPHY CONFIGURATION
// =====================================================

export interface TypographyScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export interface TypographyConfig {
  fontFamily: string;
  headingFontFamily?: string;
  scale: TypographyScale;
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };
  weight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

// =====================================================
// SPACING CONFIGURATION
// =====================================================

export interface SpacingScale {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
}

export interface SpacingConfig {
  scale: SpacingScale;
  containerPadding: string;
  cardPadding: string;
  sectionGap: string;
  inputPadding: string;
}

// =====================================================
// ANIMATION CONFIGURATION
// =====================================================

export interface AnimationConfig {
  enabled: boolean;
  speed: AnimationSpeed;
  easing: string;
  transitions: {
    default: string;
    fast: string;
    slow: string;
  };
  keyframes: {
    fadeIn: boolean;
    slideUp: boolean;
    scaleIn: boolean;
    pulse: boolean;
  };
}

// =====================================================
// COMPONENT-SPECIFIC STYLES
// =====================================================

export interface ButtonStyles {
  variant: ButtonVariant;
  borderRadius: string;
  padding: string;
  fontWeight: FontWeight;
  uppercase: boolean;
  shadow: ShadowLevel;
  hoverScale: boolean;
  gradient?: {
    from: string;
    to: string;
    direction: string;
  };
}

export interface InputStyles {
  borderRadius: string;
  borderWidth: string;
  padding: string;
  focusRing: boolean;
  focusRingColor: string;
  focusRingWidth: string;
}

export interface CardStyles {
  borderRadius: string;
  shadow: ShadowLevel;
  border: boolean;
  borderColor: string;
  backdrop: boolean;
  backdropBlur: string;
}

export interface CalendarStyles {
  dayBorderRadius: string;
  selectedDayStyle: 'solid' | 'ring' | 'gradient';
  availableColor: string;
  unavailableColor: string;
  todayIndicator: boolean;
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
}

// =====================================================
// COMPLETE WIDGET STYLE CONFIG
// =====================================================

export interface WidgetStyleConfig {
  // Theme identification
  themeId: string;
  themeName: string;
  
  // Color mode
  colorMode: ColorMode;
  
  // Color palettes
  colors: ColorPalette;
  background: BackgroundColors;
  text: TextColors;
  border: BorderColors;
  
  // Typography
  typography: TypographyConfig;
  
  // Spacing
  spacing: SpacingConfig;
  
  // Animations
  animation: AnimationConfig;
  
  // Component-specific
  button: ButtonStyles;
  input: InputStyles;
  card: CardStyles;
  calendar: CalendarStyles;
  
  // Layout
  layout: {
    density: LayoutDensity;
    maxWidth: string;
    containerWidth: string;
  };
  
  // Effects
  effects: {
    glassmorphism: boolean;
    gradients: boolean;
    shadows: boolean;
    blur: string;
  };
  
  // Custom CSS
  customCSS?: string;
}

// =====================================================
// DEVELOPER INTEGRATION OPTIONS
// =====================================================

export interface EmbedIntegrationOptions {
  // Inherit styles from parent website
  inheritParentStyles: boolean;
  
  // CSS variable prefix for conflict prevention
  cssVariablePrefix: string;
  
  // Isolation level
  styleIsolation: 'none' | 'scoped' | 'shadow-dom';
  
  // Responsive breakpoints
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Z-index for overlays
  zIndex: {
    base: number;
    dropdown: number;
    modal: number;
    tooltip: number;
  };
}
