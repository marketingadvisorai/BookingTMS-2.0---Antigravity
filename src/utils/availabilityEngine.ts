/**
 * Availability Engine
 * Calculates available booking slots based on game schedules and blocked dates
 */

export interface GameSchedule {
  operatingDays?: string[]; // e.g., ['Monday', 'Friday', 'Saturday']
  startTime?: string; // e.g., '18:00' or '6:00 PM'
  endTime?: string; // e.g., '23:00' or '11:00 PM'
  slotInterval?: number; // minutes between slots
  duration?: number; // game duration in minutes
  advanceBooking?: number; // days in advance bookings allowed
  customHoursEnabled?: boolean;
  customHours?: {
    [key: string]: {
      enabled: boolean;
      startTime: string;
      endTime: string;
    };
  };
}

export interface BlockedDate {
  date: string; // ISO date string 'YYYY-MM-DD'
  startTime?: string | null; // Optional start time for blocking specific slot
  endTime?: string | null; // Optional end time for blocking specific slot
  blockType?: 'full-day' | 'time-slot';
  reason?: string;
}

export interface CustomAvailableDate {
  date: string; // ISO date string 'YYYY-MM-DD'
  startTime: string; // Start time for custom availability
  endTime: string; // End time for custom availability
  reason?: string;
}

export interface AvailabilityConfig {
  gameSchedule: GameSchedule;
  blockedDates: BlockedDate[];
  existingBookings?: Array<{ date: string; time: string }>;
}

/**
 * Convert 12-hour time to 24-hour format
 */
function convertTo24Hour(time: string): string {
  if (!time) return '00:00';

  // Clean up time string - remove extra spaces and colons
  const cleanedTime = time.trim().replace(/\s+/g, ' ');

  // Already in 24-hour format
  if (cleanedTime.match(/^\d{1,2}:\d{2}$/)) {
    return cleanedTime;
  }

  // Convert from 12-hour format - strict regex to avoid malformed times
  const match = cleanedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return '00:00';

  let [, hours, minutes, period] = match;
  let hour = parseInt(hours, 10);

  if (period.toUpperCase() === 'PM' && hour !== 12) {
    hour += 12;
  } else if (period.toUpperCase() === 'AM' && hour === 12) {
    hour = 0;
  }

  return `${hour.toString().padStart(2, '0')}:${minutes}`;
}

/**
 * Check if a date is blocked (full day only)
 */
export function isDateBlocked(date: Date, blockedDates: BlockedDate[]): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return blockedDates.some(blocked =>
    blocked.date === dateStr && blocked.blockType === 'full-day'
  );
}

/**
 * Check if a specific time slot is blocked
 */
export function isTimeSlotBlocked(date: Date, time: string, blockedDates: BlockedDate[]): boolean {
  const dateStr = date.toISOString().split('T')[0];
  const time24 = convertTo24Hour(time);

  return blockedDates.some(blocked => {
    if (blocked.date !== dateStr) return false;

    // If it's a full day block, all slots are blocked
    if (blocked.blockType === 'full-day' || (!blocked.startTime && !blocked.endTime)) {
      return true;
    }

    // Check if time falls within blocked time slot
    if (blocked.startTime && blocked.endTime) {
      const blockStart = convertTo24Hour(blocked.startTime);
      const blockEnd = convertTo24Hour(blocked.endTime);
      return time24 >= blockStart && time24 <= blockEnd;
    }

    return false;
  });
}

/**
 * Check if a date is a custom available date
 */
export function isCustomAvailableDate(date: Date, customDates?: CustomAvailableDate[]): CustomAvailableDate | null {
  if (!customDates || customDates.length === 0) return null;

  const dateStr = date.toISOString().split('T')[0];
  const customDate = customDates.find(cd => cd.date === dateStr);
  return customDate || null;
}

/**
 * Check if a day of week is in operating days
 * Returns true if date is in operating days OR is a custom available date
 */
export function isDayOperating(date: Date, operatingDays?: string[], customDates?: CustomAvailableDate[]): boolean {
  // Check if it's a custom available date first (overrides schedule)
  if (isCustomAvailableDate(date, customDates)) {
    return true;
  }

  if (!operatingDays || operatingDays.length === 0) {
    return true; // If no operating days specified, assume all days are available
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[date.getDay()];

  return operatingDays.some(day =>
    day.toLowerCase() === dayName.toLowerCase() ||
    day.toLowerCase() === dayName.substring(0, 3).toLowerCase()
  );
}

/**
 * Generate time slots for a specific date
 */
export function generateTimeSlots(
  date: Date,
  gameSchedule: GameSchedule,
  blockedDates: BlockedDate[] = [],
  existingBookings: Array<{ date: string; time: string }> = [],
  customAvailableDates: CustomAvailableDate[] = []
): Array<{ time: string; available: boolean; spots: number; reason?: string }> {
  // Check if date is blocked entirely
  if (isDateBlocked(date, blockedDates)) {
    return []; // Return empty array for blocked dates
  }

  // Check if this is a custom available date (overrides schedule)
  const customDate = isCustomAvailableDate(date, customAvailableDates);

  // Check if day is in operating days (or is custom available)
  if (!isDayOperating(date, gameSchedule.operatingDays, customAvailableDates)) {
    return []; // Return empty array for non-operating days
  }

  // Check advance booking limit
  if (gameSchedule.advanceBooking) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + gameSchedule.advanceBooking);

    if (date > maxDate) {
      return [];
    }
  }

  // Determine start and end times
  let scheduleStartTime = gameSchedule.startTime || '10:00';
  let scheduleEndTime = gameSchedule.endTime || '22:00';

  // Check for custom hours per day
  if (gameSchedule.customHoursEnabled && gameSchedule.customHours) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];
    const customDay = gameSchedule.customHours[dayName];

    if (customDay && customDay.enabled) {
      scheduleStartTime = customDay.startTime;
      scheduleEndTime = customDay.endTime;
    }
  }

  // Use custom date times if available, otherwise use schedule/custom hours times
  const startTime = customDate
    ? convertTo24Hour(customDate.startTime)
    : convertTo24Hour(scheduleStartTime);
  const endTime = customDate
    ? convertTo24Hour(customDate.endTime)
    : convertTo24Hour(scheduleEndTime);

  // CRITICAL FIX: Use game duration as interval to prevent overlaps
  // For a 90-min game, slots must be 90 minutes apart, not 60!
  const gameDuration = gameSchedule.duration || 90;
  const slotInterval = gameSchedule.slotInterval || gameDuration;

  // Ensure interval is at least as long as game duration to prevent overlaps
  const interval = Math.max(slotInterval, gameDuration);

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const slots: Array<{ time: string; available: boolean; spots: number; reason?: string }> = [];
  const dateStr = date.toISOString().split('T')[0];

  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

    // Convert to 12-hour format for display
    const displayHour = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;
    const period = currentHour >= 12 ? 'PM' : 'AM';
    const displayTime = `${displayHour}:${currentMin.toString().padStart(2, '0')} ${period}`;

    // Check if this slot is already booked
    const isBooked = existingBookings.some(
      booking => booking.date === dateStr && booking.time === timeStr
    );

    // Check if this specific time slot is blocked
    const isBlocked = isTimeSlotBlocked(date, displayTime, blockedDates);

    slots.push({
      time: timeStr, // Use 24-hour format (HH:mm)
      available: !isBooked && !isBlocked,
      spots: (isBooked || isBlocked) ? 0 : 8, // Default 8 spots, can be made dynamic
      reason: isBlocked ? 'Time slot blocked' : (isBooked ? 'Fully booked' : undefined)
    });

    // Add interval
    currentMin += interval;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
}

/**
 * Get available dates for a month
 */
export function getAvailableDatesForMonth(
  year: number,
  month: number,
  config: AvailabilityConfig
): Array<{ date: Date; available: boolean; reason?: string }> {
  const dates: Array<{ date: Date; available: boolean; reason?: string }> = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);

    // Check if blocked
    if (isDateBlocked(date, config.blockedDates)) {
      dates.push({
        date,
        available: false,
        reason: 'Date blocked by admin'
      });
      continue;
    }

    // Check if operating
    if (!isDayOperating(date, config.gameSchedule.operatingDays)) {
      dates.push({
        date,
        available: false,
        reason: 'Not operating on this day'
      });
      continue;
    }

    // Check advance booking
    if (config.gameSchedule.advanceBooking) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date(today);
      maxDate.setDate(maxDate.getDate() + config.gameSchedule.advanceBooking);

      if (date > maxDate) {
        dates.push({
          date,
          available: false,
          reason: 'Beyond advance booking window'
        });
        continue;
      }
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      dates.push({
        date,
        available: false,
        reason: 'Past date'
      });
      continue;
    }

    dates.push({
      date,
      available: true
    });
  }

  return dates;
}

/**
 * Check if any time slots are available for a specific date
 */
export function hasAvailableSlots(
  date: Date,
  config: AvailabilityConfig
): boolean {
  const slots = generateTimeSlots(
    date,
    config.gameSchedule,
    config.blockedDates,
    config.existingBookings
  );

  return slots.some(slot => slot.available);
}
