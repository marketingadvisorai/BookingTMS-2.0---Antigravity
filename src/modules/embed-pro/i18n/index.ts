/**
 * Embed Pro 2.0 - i18n Module Exports
 * @module embed-pro/i18n
 * 
 * Internationalization system for widget localization.
 * Supports multiple languages with automatic browser detection.
 */

// Types
export * from './types';

// Provider & Hook
export { I18nProvider, useI18n } from './I18nProvider';

// Translations
export { translations, en, es, fr } from './locales';
