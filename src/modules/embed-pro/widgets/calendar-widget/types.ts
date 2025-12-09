/**
 * Calendar Widget Pro - Type Definitions
 * @module embed-pro/widgets/calendar-widget/types
 */

import type { WidgetData, WidgetStyle, WidgetActivity, CustomerInfo } from '../../types/widget.types';

// =====================================================
// CALENDAR WIDGET PROPS
// =====================================================

export interface CalendarWidgetProProps {
  /** Widget data from embed config */
  data: WidgetData;
  /** Calendar display options */
  calendarOptions?: CalendarDisplayOptions;
  /** Callback when date is selected */
  onDateSelect?: (date: Date) => void;
  /** Callback when booking flow starts */
  onBookClick?: (date: Date, time?: string) => void;
  /** Callback when booking completes */
  onBookingComplete?: (bookingId: string) => void;
}

export interface CalendarDisplayOptions {
  displayMode?: 'month' | 'week' | 'list';
  showAvailabilityIndicator?: boolean;
  showPricing?: boolean;
  highlightToday?: boolean;
  showLegend?: boolean;
}

// =====================================================
// STEP CONFIGURATION
// =====================================================

export type CalendarStep = 'select-date' | 'select-time' | 'select-party' | 'checkout' | 'success';

export interface StepConfig {
  id: CalendarStep;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// =====================================================
// BOOKING STATE
// =====================================================

export interface CalendarBookingState {
  selectedDate: Date | null;
  selectedTime: string | null;
  sessionId?: string;
  partySize: number;
  childCount: number;
  customerInfo: CustomerInfo | null;
  bookingId: string | null;
  error: string | null;
}

// =====================================================
// COMPONENT PROPS
// =====================================================

export interface StepIndicatorProps {
  steps: StepConfig[];
  currentStep: CalendarStep;
  style: WidgetStyle;
  isDarkMode: boolean;
}

export interface ActivityInfoProps {
  activity: WidgetActivity;
  style: WidgetStyle;
  isDarkMode: boolean;
  showPricing?: boolean;
}

export interface LegendProps {
  isDarkMode: boolean;
}

export interface CheckoutHandlerParams {
  activity: WidgetActivity;
  selectedDate: Date;
  selectedTime: string;
  partySize: number;
  childCount: number;
  customerInfo: CustomerInfo;
  embedKey?: string;
  isPreview?: boolean;
}
