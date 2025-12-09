/**
 * Widget Styling Hook
 * @module embed-pro/hooks/useWidgetStyling
 * 
 * React hook for managing widget styling with theme presets,
 * custom CSS injection, and responsive design support.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { 
  WidgetStyleConfig, 
  ColorMode,
  EmbedIntegrationOptions 
} from '../styles/types';
import { LIQUID_GLASS_LIGHT, LIQUID_GLASS_DARK, getThemePreset } from '../styles/presets';
import { injectCSSVariables, generateStyleBlock } from '../styles/cssVariables';
import { injectAnimationCSS } from '../styles/animations';
import { 
  mergeStyleConfigs, 
  resolveColorMode, 
  detectSystemColorMode 
} from '../styles/utils';

// =====================================================
// HOOK OPTIONS
// =====================================================

interface UseWidgetStylingOptions {
  /** Initial theme ID or custom config */
  theme?: string | Partial<WidgetStyleConfig>;
  /** Color mode preference */
  colorMode?: ColorMode;
  /** Custom CSS to inject */
  customCSS?: string;
  /** Integration options */
  integration?: Partial<EmbedIntegrationOptions>;
  /** Auto-inject CSS variables */
  autoInject?: boolean;
  /** CSS selector for scoping */
  selector?: string;
}

interface UseWidgetStylingReturn {
  /** Current resolved style config */
  styles: WidgetStyleConfig;
  /** Current color mode (resolved) */
  colorMode: 'light' | 'dark';
  /** Whether system prefers dark mode */
  systemPrefersDark: boolean;
  /** CSS variables string */
  cssVariables: string;
  
  // Actions
  setTheme: (themeId: string) => void;
  setColorMode: (mode: ColorMode) => void;
  updateStyles: (updates: Partial<WidgetStyleConfig>) => void;
  setPrimaryColor: (color: string) => void;
  setFontFamily: (font: string) => void;
  setBorderRadius: (radius: string) => void;
  toggleDarkMode: () => void;
  resetStyles: () => void;
  exportCSS: () => string;
}

// =====================================================
// HOOK IMPLEMENTATION
// =====================================================

export function useWidgetStyling(
  options: UseWidgetStylingOptions = {}
): UseWidgetStylingReturn {
  const {
    theme = 'liquid-glass-light',
    colorMode: initialColorMode = 'light',
    customCSS = '',
    integration = {},
    autoInject = true,
    selector = '.bookflow-widget',
  } = options;

  // Initialize with theme preset or custom config
  const getInitialConfig = (): WidgetStyleConfig => {
    if (typeof theme === 'string') {
      return getThemePreset(theme) || LIQUID_GLASS_LIGHT;
    }
    return mergeStyleConfigs(LIQUID_GLASS_LIGHT, theme);
  };

  const [config, setConfig] = useState<WidgetStyleConfig>(getInitialConfig);
  const [colorModeState, setColorModeState] = useState<ColorMode>(initialColorMode);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Detect system color preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Resolve actual color mode
  const resolvedColorMode = useMemo(
    () => resolveColorMode(colorModeState),
    [colorModeState, systemPrefersDark]
  );

  // Get appropriate theme based on color mode
  const resolvedStyles = useMemo((): WidgetStyleConfig => {
    // If user provided a custom config, use it with color mode adjustments
    if (config.colorMode !== resolvedColorMode) {
      // Switch to appropriate theme variant
      const isDark = resolvedColorMode === 'dark';
      const baseTheme = isDark ? LIQUID_GLASS_DARK : LIQUID_GLASS_LIGHT;
      
      // Keep user customizations, but apply dark/light backgrounds
      return mergeStyleConfigs(baseTheme, {
        ...config,
        colorMode: resolvedColorMode,
        colors: config.colors, // Keep user's colors
      });
    }
    return config;
  }, [config, resolvedColorMode]);

  // Generate CSS variables
  const cssVariables = useMemo(() => {
    const prefix = integration.cssVariablePrefix || '--bw';
    return generateStyleBlock(resolvedStyles, selector, prefix);
  }, [resolvedStyles, selector, integration.cssVariablePrefix]);

  // Auto-inject CSS variables and animations
  useEffect(() => {
    if (!autoInject || typeof document === 'undefined') return;

    const prefix = integration.cssVariablePrefix || '--bw';
    injectCSSVariables(resolvedStyles, selector, prefix);
    injectAnimationCSS();

    // Inject custom CSS if provided
    if (customCSS) {
      const customStyleId = 'bookflow-widget-custom';
      let customStyle = document.getElementById(customStyleId) as HTMLStyleElement;
      if (!customStyle) {
        customStyle = document.createElement('style');
        customStyle.id = customStyleId;
        document.head.appendChild(customStyle);
      }
      customStyle.textContent = customCSS;
    }
  }, [resolvedStyles, autoInject, customCSS, selector, integration.cssVariablePrefix]);

  // =====================================================
  // ACTIONS
  // =====================================================

  const setTheme = useCallback((themeId: string) => {
    const preset = getThemePreset(themeId);
    if (preset) {
      setConfig(preset);
    }
  }, []);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
  }, []);

  const updateStyles = useCallback((updates: Partial<WidgetStyleConfig>) => {
    setConfig((prev) => mergeStyleConfigs(prev, updates));
  }, []);

  const setPrimaryColor = useCallback((color: string) => {
    setConfig((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        primary: color,
      },
    }));
  }, []);

  const setFontFamily = useCallback((font: string) => {
    setConfig((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        fontFamily: font,
      },
    }));
  }, []);

  const setBorderRadius = useCallback((radius: string) => {
    setConfig((prev) => ({
      ...prev,
      button: { ...prev.button, borderRadius: radius },
      input: { ...prev.input, borderRadius: radius },
      card: { ...prev.card, borderRadius: radius },
    }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setColorModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const resetStyles = useCallback(() => {
    setConfig(getInitialConfig());
    setColorModeState(initialColorMode);
  }, [theme, initialColorMode]);

  const exportCSS = useCallback((): string => {
    return cssVariables + (customCSS ? `\n\n/* Custom CSS */\n${customCSS}` : '');
  }, [cssVariables, customCSS]);

  return {
    styles: resolvedStyles,
    colorMode: resolvedColorMode,
    systemPrefersDark,
    cssVariables,
    setTheme,
    setColorMode,
    updateStyles,
    setPrimaryColor,
    setFontFamily,
    setBorderRadius,
    toggleDarkMode,
    resetStyles,
    exportCSS,
  };
}

export default useWidgetStyling;
