/**
 * Embed Pro 2.0 - i18n Types
 * @module embed-pro/i18n/types
 * 
 * Type definitions for the internationalization system.
 */

// =====================================================
// SUPPORTED LOCALES
// =====================================================

export type SupportedLocale = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it' | 'ja' | 'zh';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'es', 'fr', 'de', 'pt', 'it', 'ja', 'zh'];

export const LOCALE_NAMES: Record<SupportedLocale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
  ja: '日本語',
  zh: '中文',
};

// =====================================================
// TRANSLATION KEYS
// =====================================================

export interface WidgetTranslations {
  // Common
  common: {
    loading: string;
    error: string;
    retry: string;
    back: string;
    next: string;
    continue: string;
    confirm: string;
    cancel: string;
    close: string;
    save: string;
    search: string;
    select: string;
    selected: string;
    required: string;
    optional: string;
  };

  // Calendar
  calendar: {
    title: string;
    selectDate: string;
    previousMonth: string;
    nextMonth: string;
    today: string;
    noAvailability: string;
    available: string;
    unavailable: string;
    spotsLeft: string;
    weekdays: {
      sun: string;
      mon: string;
      tue: string;
      wed: string;
      thu: string;
      fri: string;
      sat: string;
    };
    months: {
      january: string;
      february: string;
      march: string;
      april: string;
      may: string;
      june: string;
      july: string;
      august: string;
      september: string;
      october: string;
      november: string;
      december: string;
    };
  };

  // Time Slots
  timeSlots: {
    title: string;
    selectTime: string;
    morning: string;
    afternoon: string;
    evening: string;
    noSlots: string;
    spotsRemaining: string;
    lastSpot: string;
    fullyBooked: string;
  };

  // Party Size
  partySize: {
    title: string;
    selectParty: string;
    adults: string;
    children: string;
    infants: string;
    guests: string;
    player: string;
    players: string;
    person: string;
    people: string;
    minimum: string;
    maximum: string;
  };

  // Checkout
  checkout: {
    title: string;
    customerInfo: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes: string;
    notesPlaceholder: string;
    terms: string;
    termsLink: string;
    privacyLink: string;
    securePayment: string;
    completeBooking: string;
    processing: string;
  };

  // Promo Code
  promo: {
    haveCode: string;
    enterCode: string;
    apply: string;
    applied: string;
    remove: string;
    invalid: string;
    expired: string;
    discount: string;
    savings: string;
  };

  // Summary
  summary: {
    title: string;
    bookingSummary: string;
    activity: string;
    date: string;
    time: string;
    duration: string;
    guests: string;
    subtotal: string;
    discount: string;
    total: string;
    perPerson: string;
  };

  // Success
  success: {
    title: string;
    confirmed: string;
    bookingRef: string;
    emailSent: string;
    whatNext: string;
    addToCalendar: string;
    printConfirmation: string;
    bookAnother: string;
    contactUs: string;
  };

  // Errors
  errors: {
    generic: string;
    network: string;
    notFound: string;
    sessionExpired: string;
    paymentFailed: string;
    invalidEmail: string;
    invalidPhone: string;
    requiredField: string;
    minGuests: string;
    maxGuests: string;
    slotUnavailable: string;
  };
}

// =====================================================
// TRANSLATION CONTEXT
// =====================================================

export interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: TranslationFunction;
  formatDate: (date: Date, format?: 'short' | 'long' | 'full') => string;
  formatTime: (date: Date) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatNumber: (num: number) => string;
}

export type TranslationFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;
