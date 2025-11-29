/**
 * Bookings Components - Barrel Export
 * 
 * @example
 * import { MonthCalendarView, WeekView, DayView, AddBookingDialog } from '../features/bookings/components';
 */

// Calendar Views
export { MonthCalendarView } from './MonthCalendarView';
export { WeekView } from './WeekView';
export { DayView } from './DayView';
export { ScheduleView } from './ScheduleView';

// Dialog Components
export { AddBookingDialog } from './AddBookingDialog';
export type { AddBookingDialogProps, AddBookingFormValues, AddBookingSubmission } from './AddBookingDialog';
export { BookingDetailsDialog } from './BookingDetailsDialog';
export type { BookingDetailsDialogProps } from './BookingDetailsDialog';
export { RefundDialog } from './RefundDialog';
export type { RefundDialogProps } from './RefundDialog';
export { RescheduleDialog } from './RescheduleDialog';
export type { RescheduleDialogProps } from './RescheduleDialog';
export { CancelDialog } from './CancelDialog';
export type { CancelDialogProps } from './CancelDialog';
export { AttendeeListDialog } from './AttendeeListDialog';
export type { AttendeeListDialogProps } from './AttendeeListDialog';
export { QRScannerDialog } from './QRScannerDialog';
export type { QRScannerDialogProps } from './QRScannerDialog';

// TODO: Future extractions
// export { BookingTable } from './BookingTable';
// export { BookingFilters } from './BookingFilters';
// export { BookingStats } from './BookingStats';
