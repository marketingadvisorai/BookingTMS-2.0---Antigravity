/**
 * Embed Pro 2.0 - Locale Exports
 * @module embed-pro/i18n/locales
 */

import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import type { SupportedLocale, WidgetTranslations } from '../types';

export const translations: Record<SupportedLocale, WidgetTranslations> = {
  en,
  es,
  fr,
  // Additional locales - using English as fallback for now
  de: en, // German - TODO
  pt: en, // Portuguese - TODO
  it: en, // Italian - TODO
  ja: en, // Japanese - TODO
  zh: en, // Chinese - TODO
};

export { en, es, fr };
export default translations;
