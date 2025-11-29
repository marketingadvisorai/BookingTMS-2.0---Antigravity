/**
 * Booking Types
 * 
 * Shared types for the bookings feature module.
 */

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export interface Booking {
  id: string;
  customer: string;
  email: string;
  phone: string;
  game: string;
  gameId?: string;
  date: string;
  time: string;
  groupSize: number;
  adults: number;
  children: number;
  amount: number;
  status: BookingStatus;
  paymentMethod: string;
  notes: string;
  assignedStaffId?: string;
  checkInTime?: string;
  checkOutTime?: string;
  venueId?: string;
  venueName?: string;
}

export interface AddBookingFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  venueId: string;
  gameId: string;
  date: Date | undefined;
  time: string;
  adults: number;
  children: number;
  notes: string;
  paymentMethod: string;
}

export interface GameOption {
  id: string;
  name: string;
  price: number;
  childPrice?: number;
  duration: number;
  minPlayers?: number;
  maxPlayers?: number;
  venueId?: string;
  color?: string;
}

export interface AddBookingSubmission extends AddBookingFormValues {
  source: 'admin';
  status: BookingStatus;
  totalAmount: number;
}

export interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (booking: AddBookingSubmission) => Promise<void>;
  bookings: Booking[];
  gamesData: GameOption[];
  venues: Array<{ id: string; name: string }>;
  isSubmitting: boolean;
}

export interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  onRefund: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  staffList: Array<{ id: string; name: string }>;
  onAssignStaff: (bookingId: string, staffId: string) => void;
  onUpdateStatus: (bookingId: string, status: BookingStatus) => void;
  onCheckIn: (bookingId: string) => void;
  onCheckOut: (bookingId: string) => void;
  onSendConfirmation: (bookingId: string) => void;
  onSave: (booking: Partial<Booking>) => void;
}

export interface CalendarViewProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  onShowAttendees: (date: Date) => void;
  calendarMonth: Date;
  setCalendarMonth: (date: Date) => void;
  gamesData: GameOption[];
}

export interface DayViewProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  gamesData: GameOption[];
}
