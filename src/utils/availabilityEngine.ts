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
}

export interface BlockedDate {
  date: string; // ISO date string 'YYYY-MM-DD'
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
  
  // Already in 24-hour format
  if (time.match(/^\d{1,2}:\d{2}$/)) {
    return time;
  }
  
  // Convert from 12-hour format
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
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
 * Check if a date is blocked
 */
export function isDateBlocked(date: Date, blockedDates: BlockedDate[]): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return blockedDates.some(blocked => blocked.date === dateStr);
}

/**
 * Check if a day of week is in operating days
 */
export function isDayOperating(date: Date, operatingDays?: string[]): boolean {
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
  blockedDates: BlockedDate[],
  existingBookings: Array<{ date: string; time: string }> = []
): Array<{ time: string; available: boolean; spots: number; reason?: string }> {
  // Check if date is blocked
  if (isDateBlocked(date, blockedDates)) {
    return [];
  }
  
  // Check if day is operating
  if (!isDayOperating(date, gameSchedule.operatingDays)) {
    return [];
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
  
  const startTime = convertTo24Hour(gameSchedule.startTime || '10:00');
  const endTime = convertTo24Hour(gameSchedule.endTime || '22:00');
  const interval = gameSchedule.slotInterval || 90;
  
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
    
    slots.push({
      time: displayTime,
      available: !isBooked,
      spots: isBooked ? 0 : 8, // Default 8 spots, can be made dynamic
      reason: isBooked ? 'Fully booked' : undefined
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
