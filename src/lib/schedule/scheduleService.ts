/**
 * Schedule Service - Centralizes schedule logic and syncs with widgets
 * Ensures Step 5 Schedule page changes reflect in customer-facing calendar
 */

export interface ScheduleConfig {
  operatingDays: string[];
  startTime: string;
  endTime: string;
  slotInterval: number;
  advanceBooking: number;
  customHoursEnabled: boolean;
  customHours: Record<string, { enabled: boolean; startTime: string; endTime: string }>;
  customDates: Array<{ id: string; date: string; startTime: string; endTime: string }>;
  blockedDates: Array<{ id?: string; date: string; reason?: string }>;
}

export interface DayAvailability {
  isAvailable: boolean;
  isOperatingDay: boolean;
  isBlocked: boolean;
  isCustomDate: boolean;
  hasCustomHours: boolean;
  startTime: string;
  endTime: string;
  reason?: string;
}

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DEFAULT_OPERATING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Normalize schedule from activity settings to widget format
 */
export function normalizeScheduleFromSettings(settings: Record<string, any>): ScheduleConfig {
  return {
    operatingDays: settings.operatingDays || DEFAULT_OPERATING_DAYS,
    startTime: settings.startTime || '09:00',
    endTime: settings.endTime || '21:00',
    slotInterval: settings.slotInterval || 60,
    advanceBooking: settings.advanceBooking || 30,
    customHoursEnabled: settings.customHoursEnabled || false,
    customHours: settings.customHours || {},
    customDates: settings.customDates || [],
    blockedDates: settings.blockedDates || []
  };
}

/**
 * Check if a date is an operating day
 */
export function isOperatingDay(date: Date, operatingDays: string[]): boolean {
  const dayName = DAYS_OF_WEEK[date.getDay()];
  return operatingDays.includes(dayName);
}

/**
 * Check if a date is blocked
 */
export function isDateBlocked(date: Date, blockedDates: Array<{ date: string; reason?: string } | string>): { blocked: boolean; reason?: string } {
  const dateStr = formatDateString(date);
  
  for (const blocked of blockedDates) {
    const blockedDateStr = typeof blocked === 'string' ? blocked : blocked.date;
    if (blockedDateStr === dateStr) {
      return {
        blocked: true,
        reason: typeof blocked === 'object' ? blocked.reason : undefined
      };
    }
  }
  
  return { blocked: false };
}

/**
 * Check if a date has custom availability (special date override)
 */
export function getCustomDateConfig(
  date: Date,
  customDates: Array<{ id: string; date: string; startTime: string; endTime: string }>
): { isCustomDate: boolean; startTime?: string; endTime?: string } {
  const dateStr = formatDateString(date);
  const customDate = customDates.find(cd => cd.date === dateStr);
  
  if (customDate) {
    return {
      isCustomDate: true,
      startTime: customDate.startTime,
      endTime: customDate.endTime
    };
  }
  
  return { isCustomDate: false };
}

/**
 * Get custom hours for a specific day of the week
 */
export function getCustomHoursForDay(
  date: Date,
  customHours: Record<string, { enabled: boolean; startTime: string; endTime: string }>,
  customHoursEnabled: boolean
): { hasCustomHours: boolean; startTime?: string; endTime?: string } {
  if (!customHoursEnabled) {
    return { hasCustomHours: false };
  }
  
  const dayName = DAYS_OF_WEEK[date.getDay()];
  const dayConfig = customHours[dayName];
  
  if (dayConfig?.enabled) {
    return {
      hasCustomHours: true,
      startTime: dayConfig.startTime,
      endTime: dayConfig.endTime
    };
  }
  
  return { hasCustomHours: false };
}

/**
 * Check if date is within advance booking window
 */
export function isWithinAdvanceBooking(date: Date, advanceBookingDays: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + advanceBookingDays);
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate <= maxDate;
}

/**
 * Check if date is in the past
 */
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  
  return checkDate < today;
}

/**
 * Get complete availability info for a specific date
 */
export function getDayAvailability(date: Date, schedule: ScheduleConfig): DayAvailability {
  const { operatingDays, startTime, endTime, blockedDates, customDates, customHours, customHoursEnabled, advanceBooking } = schedule;
  
  // Check if past
  if (isPastDate(date)) {
    return {
      isAvailable: false,
      isOperatingDay: false,
      isBlocked: false,
      isCustomDate: false,
      hasCustomHours: false,
      startTime,
      endTime,
      reason: 'Past date'
    };
  }
  
  // Check advance booking
  if (!isWithinAdvanceBooking(date, advanceBooking)) {
    return {
      isAvailable: false,
      isOperatingDay: isOperatingDay(date, operatingDays),
      isBlocked: false,
      isCustomDate: false,
      hasCustomHours: false,
      startTime,
      endTime,
      reason: `Cannot book more than ${advanceBooking} days in advance`
    };
  }
  
  // Check if blocked
  const blockedInfo = isDateBlocked(date, blockedDates);
  if (blockedInfo.blocked) {
    return {
      isAvailable: false,
      isOperatingDay: isOperatingDay(date, operatingDays),
      isBlocked: true,
      isCustomDate: false,
      hasCustomHours: false,
      startTime,
      endTime,
      reason: blockedInfo.reason || 'Date blocked by admin'
    };
  }
  
  // Check custom date (overrides operating days)
  const customDateInfo = getCustomDateConfig(date, customDates);
  if (customDateInfo.isCustomDate) {
    return {
      isAvailable: true,
      isOperatingDay: true,
      isBlocked: false,
      isCustomDate: true,
      hasCustomHours: true,
      startTime: customDateInfo.startTime || startTime,
      endTime: customDateInfo.endTime || endTime
    };
  }
  
  // Check if operating day
  const isOpDay = isOperatingDay(date, operatingDays);
  if (!isOpDay) {
    return {
      isAvailable: false,
      isOperatingDay: false,
      isBlocked: false,
      isCustomDate: false,
      hasCustomHours: false,
      startTime,
      endTime,
      reason: 'Not an operating day'
    };
  }
  
  // Check custom hours for the day
  const customHoursInfo = getCustomHoursForDay(date, customHours, customHoursEnabled);
  
  return {
    isAvailable: true,
    isOperatingDay: true,
    isBlocked: false,
    isCustomDate: false,
    hasCustomHours: customHoursInfo.hasCustomHours,
    startTime: customHoursInfo.startTime || startTime,
    endTime: customHoursInfo.endTime || endTime
  };
}

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate time slots for a date based on schedule
 */
export function generateTimeSlotsForDate(
  date: Date,
  schedule: ScheduleConfig,
  existingBookings: Array<{ time: string; bookedCount: number }> = [],
  capacity: number = 10
): Array<{ time: string; available: boolean; spots: number }> {
  const availability = getDayAvailability(date, schedule);
  
  if (!availability.isAvailable) {
    return [];
  }
  
  const { startTime, endTime } = availability;
  const { slotInterval } = schedule;
  
  const slots: Array<{ time: string; available: boolean; spots: number }> = [];
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  while (currentMinutes < endMinutes) {
    const hour = Math.floor(currentMinutes / 60);
    const min = currentMinutes % 60;
    const timeStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    
    // Check existing bookings
    const booking = existingBookings.find(b => b.time === timeStr);
    const bookedCount = booking?.bookedCount || 0;
    const spotsLeft = Math.max(0, capacity - bookedCount);
    
    slots.push({
      time: timeStr,
      available: spotsLeft > 0,
      spots: spotsLeft
    });
    
    currentMinutes += slotInterval;
  }
  
  return slots;
}

export default {
  normalizeScheduleFromSettings,
  isOperatingDay,
  isDateBlocked,
  getCustomDateConfig,
  getCustomHoursForDay,
  isWithinAdvanceBooking,
  isPastDate,
  getDayAvailability,
  formatDateString,
  generateTimeSlotsForDate
};
