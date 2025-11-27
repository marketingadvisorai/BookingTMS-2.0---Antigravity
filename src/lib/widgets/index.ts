/**
 * Widget Services
 * 
 * Services and hooks for customer-facing booking widgets.
 * These are used by embed widgets on external websites.
 * 
 * @module widgets
 * @version 1.0.0
 */

export { WidgetPricingService } from './widgetPricingService';
export type { 
  ActivityPricing, 
  BookingPriceCalculation,
  PriceTier,
  CustomPriceTier,
  StripePrices 
} from './widgetPricingService';

export { useWidgetPricing } from './useWidgetPricing';
