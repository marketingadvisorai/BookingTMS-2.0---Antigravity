/**
 * Calendar Widget Pro - Module Index
 * @module embed-pro/widgets/calendar-widget
 * 
 * Enterprise-grade modular calendar booking widget.
 * 
 * Architecture:
 * - CalendarWidgetPro: Main orchestrator component
 * - components/: UI sub-components (step indicator, activity info, legend)
 * - hooks/: Booking logic (checkout handling)
 * - styles/: Glassmorphism styles
 * - types: TypeScript definitions
 */

// Main component
export { CalendarWidgetPro } from './CalendarWidgetPro';
export { default } from './CalendarWidgetPro';

// Sub-components (for potential customization)
export { CalendarStepIndicator } from './components/CalendarStepIndicator';
export { CalendarActivityInfo } from './components/CalendarActivityInfo';
export { CalendarLegend } from './components/CalendarLegend';

// Hooks
export { useCalendarBooking } from './hooks/useCalendarBooking';

// Types
export type {
  CalendarWidgetProProps,
  CalendarDisplayOptions,
  CalendarStep,
  StepConfig,
  CalendarBookingState,
  StepIndicatorProps,
  ActivityInfoProps,
  LegendProps,
} from './types';
