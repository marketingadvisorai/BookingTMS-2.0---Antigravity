/**
 * Widget Type Default Configurations
 * Default settings for each embed widget type
 * @module embed-pro/components/widget-type-configs/defaults
 */

export interface BookingWidgetOptions {
  showCalendar: boolean;
  showTimeSlots: boolean;
  showPricing: boolean;
  showDescription: boolean;
  showImages: boolean;
  allowMultipleActivities: boolean;
  compactMode: boolean;
}

export interface CalendarWidgetOptions {
  displayMode: 'month' | 'week' | 'list';
  showAvailabilityIndicator: boolean;
  showPricing: boolean;
  highlightToday: boolean;
  showLegend: boolean;
}

export interface ButtonWidgetOptions {
  buttonText: string;
  buttonSize: 'sm' | 'md' | 'lg' | 'xl';
  buttonVariant: 'filled' | 'outline' | 'ghost';
  openMode: 'popup' | 'redirect' | 'slideover';
  showIcon: boolean;
  iconPosition: 'left' | 'right';
  pulseAnimation: boolean;
}

export interface InlineWidgetOptions {
  height: 'auto' | 'fixed';
  fixedHeight: number;
  showBorder: boolean;
  seamlessIntegration: boolean;
  responsiveBreakpoint: number;
}

export interface PopupWidgetOptions {
  trigger: 'click' | 'hover' | 'scroll' | 'exit-intent' | 'timer';
  triggerDelay: number;
  scrollPercentage: number;
  backdropBlur: boolean;
  closeOnOutsideClick: boolean;
  showCloseButton: boolean;
  position: 'center' | 'right' | 'left' | 'bottom';
  size: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const BOOKING_WIDGET_DEFAULTS: BookingWidgetOptions = {
  showCalendar: true,
  showTimeSlots: true,
  showPricing: true,
  showDescription: true,
  showImages: true,
  allowMultipleActivities: false,
  compactMode: false,
};

export const CALENDAR_WIDGET_DEFAULTS: CalendarWidgetOptions = {
  displayMode: 'month',
  showAvailabilityIndicator: true,
  showPricing: true,
  highlightToday: true,
  showLegend: true,
};

export const BUTTON_WIDGET_DEFAULTS: ButtonWidgetOptions = {
  buttonText: 'Book Now',
  buttonSize: 'lg',
  buttonVariant: 'filled',
  openMode: 'popup',
  showIcon: true,
  iconPosition: 'right',
  pulseAnimation: false,
};

export const INLINE_WIDGET_DEFAULTS: InlineWidgetOptions = {
  height: 'auto',
  fixedHeight: 600,
  showBorder: false,
  seamlessIntegration: true,
  responsiveBreakpoint: 768,
};

export const POPUP_WIDGET_DEFAULTS: PopupWidgetOptions = {
  trigger: 'click',
  triggerDelay: 3000,
  scrollPercentage: 50,
  backdropBlur: true,
  closeOnOutsideClick: true,
  showCloseButton: true,
  position: 'center',
  size: 'lg',
};
