/**
 * Embed Pro 2.0 - i18n Provider
 * @module embed-pro/i18n/I18nProvider
 * 
 * Context provider for internationalization.
 * Handles locale detection, translation, and formatting.
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { SupportedLocale, I18nContextValue, TranslationFunction } from './types';
import { translations } from './locales';

// =====================================================
// CONTEXT
// =====================================================

const I18nContext = createContext<I18nContextValue | null>(null);

// =====================================================
// PROVIDER PROPS
// =====================================================

interface I18nProviderProps {
  children: React.ReactNode;
  /** Initial locale (default: auto-detect or 'en') */
  initialLocale?: SupportedLocale;
  /** Currency for formatting (default: 'USD') */
  currency?: string;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Detect user's preferred locale from browser
 */
function detectLocale(): SupportedLocale {
  if (typeof navigator === 'undefined') return 'en';
  
  const browserLang = navigator.language?.split('-')[0]?.toLowerCase();
  const supportedLocales: SupportedLocale[] = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ja', 'zh'];
  
  if (browserLang && supportedLocales.includes(browserLang as SupportedLocale)) {
    return browserLang as SupportedLocale;
  }
  
  return 'en';
}

/**
 * Get nested value from object by dot path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' ? current : undefined;
}

/**
 * Replace template variables in string
 * e.g., "Hello {{name}}" with { name: "World" } => "Hello World"
 */
function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return params[key]?.toString() ?? `{{${key}}}`;
  });
}

// =====================================================
// PROVIDER COMPONENT
// =====================================================

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  initialLocale,
  currency = 'USD',
}) => {
  const [locale, setLocale] = useState<SupportedLocale>(
    initialLocale || detectLocale()
  );

  // Translation function
  const t: TranslationFunction = useCallback((key: string, params?: Record<string, string | number>) => {
    const currentTranslations = translations[locale];
    const value = getNestedValue(currentTranslations as unknown as Record<string, unknown>, key);
    
    if (value) {
      return interpolate(value, params);
    }
    
    // Fallback to English
    if (locale !== 'en') {
      const fallbackValue = getNestedValue(translations.en as unknown as Record<string, unknown>, key);
      if (fallbackValue) {
        return interpolate(fallbackValue, params);
      }
    }
    
    // Return key as last resort
    console.warn(`[i18n] Missing translation: ${key}`);
    return key;
  }, [locale]);

  // Date formatting
  const formatDate = useCallback((date: Date, format: 'short' | 'long' | 'full' = 'long') => {
    const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
      short: { month: 'short' as const, day: 'numeric' as const },
      long: { weekday: 'short' as const, month: 'long' as const, day: 'numeric' as const },
      full: { weekday: 'long' as const, year: 'numeric' as const, month: 'long' as const, day: 'numeric' as const },
    };
    
    return new Intl.DateTimeFormat(locale, formatOptions[format]).format(date);
  }, [locale]);

  // Time formatting
  const formatTime = useCallback((date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: locale === 'en',
    }).format(date);
  }, [locale]);

  // Currency formatting
  const formatCurrency = useCallback((amount: number, curr: string = currency) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
    }).format(amount / 100); // Assuming amount is in cents
  }, [locale, currency]);

  // Number formatting
  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat(locale).format(num);
  }, [locale]);

  // Context value
  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t,
    formatDate,
    formatTime,
    formatCurrency,
    formatNumber,
  }), [locale, t, formatDate, formatTime, formatCurrency, formatNumber]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

// =====================================================
// HOOK
// =====================================================

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  
  return context;
}

export default I18nProvider;
