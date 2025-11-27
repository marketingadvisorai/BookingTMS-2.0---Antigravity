/**
 * BookFlow Widget - Main Index
 * @module widgets/bookflow
 * 
 * BookFlow is a modern, embeddable booking widget system.
 * 
 * Usage:
 * ```tsx
 * import { BookFlowWidget } from '@/components/widgets/bookflow';
 * 
 * <BookFlowWidget
 *   embedKey="emb_xxx"
 *   targetType="activity"
 *   targetId="activity-uuid"
 *   config={{ showCalendar: true }}
 *   style={{ primaryColor: '#3B82F6' }}
 * />
 * ```
 */

// Main widget
export { BookFlowWidget } from './BookFlowWidget';
export { BookFlowSingle } from './BookFlowSingle';
export { BookFlowVenue } from './BookFlowVenue';

// Types
export type {
  BookFlowWidgetProps,
  BookFlowConfig,
  BookFlowStyle,
  BookFlowActivity,
  BookFlowVenue as BookFlowVenueType,
  BookFlowSchedule,
  BookFlowState,
  CustomerInfo,
  TimeSlot,
  BookingResult,
} from './types';

export { DEFAULT_CONFIG, DEFAULT_STYLE } from './types';

// Hooks
export { useBookFlowActivity, useBookFlowVenue, useBookFlowSlots } from './hooks';

// Components (for custom implementations)
export {
  BookFlowCalendar,
  BookFlowTimeSlots,
  BookFlowPlayerCount,
  BookFlowHeader,
  BookFlowPricing,
} from './components';

// Service
export { bookflowService } from './services/bookflow.service';
