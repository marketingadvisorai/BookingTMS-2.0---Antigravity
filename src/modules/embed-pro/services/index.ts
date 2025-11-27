/**
 * Embed Pro 2.0 - Service Exports
 * @module embed-pro/services
 */

// Admin Dashboard Services
export { embedConfigService } from './embedConfig.service';
export { codeGeneratorService } from './codeGenerator.service';
export { previewService } from './preview.service';
export type { PreviewData, PreviewActivityData, PreviewVenueData } from './preview.service';
export { analyticsService } from './analytics.service';

// Customer Widget Services (Embed Pro 2.0)
export { embedProDataService, availabilityService, widgetDataNormalizer } from './embedProData.service';
export { checkoutProService } from './checkoutPro.service';
export { bookingVerificationService } from './bookingVerification.service';
export { promoService } from './promo.service';

// Type exports for external use (renamed to avoid conflicts with types module)
export type { 
  TimeSlotAvailability as AvailabilitySlot, 
  AvailabilityCheckResult,
  DateAvailability as SessionDateAvailability 
} from './availability.service';
export type { RawActivity, RawVenue } from './widgetData.normalizer';
