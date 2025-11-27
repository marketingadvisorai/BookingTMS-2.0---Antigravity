/**
 * Calendar Availability Hook
 * 
 * Calculates date availability status for calendar display based on:
 * - Operating days (schedule settings)
 * - Blocked dates
 * - Custom available dates
 * - Custom hours per day
 * - Advance booking limits
 * 
 * @module useCalendarAvailability
 * @version 1.0.0
 */

import { useMemo } from 'react';
import { 
  isDateBlocked, 
  isDayOperating, 
  isCustomAvailableDate,
  BlockedDate,
  CustomAvailableDate,
  GameSchedule
} from '../utils/availabilityEngine';

// ============================================================================
// TYPES
// ============================================================================

export type DateAvailabilityStatus = 'available' | 'unavailable' | 'past' | 'blocked' | 'outside-advance';

export interface DateAvailability {
  status: DateAvailabilityStatus;
  isClickable: boolean;
  reason: string;
  hasCustomHours: boolean;
}

export interface CalendarAvailabilityConfig {
  operatingDays: string[];
  blockedDates: BlockedDate[];
  customAvailableDates: CustomAvailableDate[];
  advanceBookingDays: number;
  customHours?: GameSchedule['customHours'];
  customHoursEnabled?: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

export function useCalendarAvailability(
  config: CalendarAvailabilityConfig,
  currentMonth: number,
  currentYear: number
) {
  const { 
    operatingDays, 
    blockedDates, 
    customAvailableDates, 
    advanceBookingDays,
    customHours,
    customHoursEnabled
  } = config;

  // Calculate availability for all days in the month
  const monthAvailability = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxBookingDate = new Date(today);
    maxBookingDate.setDate(maxBookingDate.getDate() + advanceBookingDays);

    const availability: Record<number, DateAvailability> = {};
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(currentYear, currentMonth, day);
      const dayName = dayNames[dateObj.getDay()];
      
      // Check if past date
      if (dateObj < today) {
        availability[day] = {
          status: 'past',
          isClickable: false,
          reason: 'Past date',
          hasCustomHours: false
        };
        continue;
      }

      // Check if blocked by admin
      if (isDateBlocked(dateObj, blockedDates)) {
        availability[day] = {
          status: 'blocked',
          isClickable: false,
          reason: 'Date blocked by admin',
          hasCustomHours: false
        };
        continue;
      }

      // Check if outside advance booking window
      if (dateObj > maxBookingDate) {
        availability[day] = {
          status: 'outside-advance',
          isClickable: false,
          reason: `Cannot book more than ${advanceBookingDays} days in advance`,
          hasCustomHours: false
        };
        continue;
      }

      // Check for custom available date (overrides operating days)
      const customDate = isCustomAvailableDate(dateObj, customAvailableDates);
      if (customDate) {
        availability[day] = {
          status: 'available',
          isClickable: true,
          reason: `Custom availability: ${customDate.startTime} - ${customDate.endTime}`,
          hasCustomHours: true
        };
        continue;
      }

      // Check if operating day
      const isOperating = isDayOperating(dateObj, operatingDays, customAvailableDates);
      if (!isOperating) {
        availability[day] = {
          status: 'unavailable',
          isClickable: false,
          reason: 'Not operating on this day',
          hasCustomHours: false
        };
        continue;
      }

      // Check for custom hours on this day
      const hasCustomHrs = customHoursEnabled && customHours?.[dayName]?.enabled;

      availability[day] = {
        status: 'available',
        isClickable: true,
        reason: hasCustomHrs 
          ? `Custom hours: ${customHours![dayName].startTime} - ${customHours![dayName].endTime}`
          : 'Available for booking',
        hasCustomHours: !!hasCustomHrs
      };
    }

    return availability;
  }, [
    currentMonth, 
    currentYear, 
    operatingDays, 
    blockedDates, 
    customAvailableDates, 
    advanceBookingDays,
    customHours,
    customHoursEnabled
  ]);

  // Get availability for a specific day
  const getDateAvailability = (day: number): DateAvailability => {
    return monthAvailability[day] || {
      status: 'unavailable',
      isClickable: false,
      reason: 'Unknown',
      hasCustomHours: false
    };
  };

  // Count available and unavailable days
  const stats = useMemo(() => {
    const values = Object.values(monthAvailability);
    return {
      available: values.filter(d => d.status === 'available').length,
      unavailable: values.filter(d => d.status !== 'available').length,
      blocked: values.filter(d => d.status === 'blocked').length,
      customDates: values.filter(d => d.hasCustomHours).length
    };
  }, [monthAvailability]);

  return {
    monthAvailability,
    getDateAvailability,
    stats
  };
}

export default useCalendarAvailability;
