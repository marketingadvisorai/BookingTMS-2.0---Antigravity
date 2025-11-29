/**
 * Booking Utilities
 * 
 * Helper functions for booking operations.
 */

import type { Booking } from '../types';

/**
 * Adapts a Supabase booking record to the Booking interface.
 */
export function adaptBookingFromSupabase(sb: any): Booking {
  return {
    id: sb.id || '',
    customer: sb.customer_name || `${sb.first_name || ''} ${sb.last_name || ''}`.trim() || 'Unknown',
    email: sb.customer_email || sb.email || '',
    phone: sb.customer_phone || sb.phone || '',
    game: sb.activity?.name || sb.game || 'Unknown Activity',
    gameId: sb.activity_id || sb.gameId || '',
    date: sb.booking_date || sb.date || '',
    time: sb.start_time || sb.time || '',
    groupSize: (sb.adult_count || 0) + (sb.child_count || 0) || sb.groupSize || 1,
    adults: sb.adult_count || sb.adults || 1,
    children: sb.child_count || sb.children || 0,
    amount: sb.total_amount || sb.amount || 0,
    status: sb.status || 'pending',
    paymentMethod: sb.payment_method || sb.paymentMethod || 'card',
    notes: sb.special_requests || sb.notes || '',
    assignedStaffId: sb.assigned_staff_id || sb.assignedStaffId,
    checkInTime: sb.check_in_time || sb.checkInTime,
    checkOutTime: sb.check_out_time || sb.checkOutTime,
    venueId: sb.venue_id || sb.venueId,
    venueName: sb.venue?.name || sb.venueName,
  };
}

/**
 * Adds minutes to a time string (HH:MM format).
 */
export function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}

/**
 * Formats a number as currency.
 */
export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Formats a date string for display.
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

/**
 * Formats a time string for display.
 */
export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Gets status badge variant based on booking status.
 */
export function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'confirmed':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'cancelled':
    case 'no-show':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Gets status color class based on booking status.
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'completed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'no-show':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  }
}
