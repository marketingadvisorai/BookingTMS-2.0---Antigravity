/**
 * Schedule Utilities
 * 
 * Pure functions for schedule availability logic.
 * Used by ActivityPreviewCard, CalendarWidget, and booking flows.
 * 
 * @module schedule/utils
 */

// Day name to index mapping (0 = Sunday)
export const DAY_MAP: Record<string, number> = {
  'Sunday': 0,
  'Monday': 1,
  'Tuesday': 2,
  'Wednesday': 3,
  'Thursday': 4,
  'Friday': 5,
  'Saturday': 6,
};

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export interface ScheduleConfig {
  operatingDays: string[];
  startTime: string;
  endTime: string;
  slotInterval: number;
  customHours?: Record<string, { start: string; end: string; enabled: boolean }>;
  blockedDates?: Array<{ date: string; reason?: string }>;
  specificDates?: Array<{ date: string; start: string; end: string }>;
  advanceBookingDays?: number;
}

export type DayStatus = 'available' | 'unavailable' | 'blocked' | 'special' | 'past';

/**
 * Check if a specific date is an operating day
 */
export function isOperatingDay(date: Date, operatingDays: string[]): boolean {
  const dayName = DAY_NAMES[date.getDay()];
  return operatingDays.includes(dayName);
}

/**
 * Check if a date is blocked
 */
export function isBlockedDate(date: Date, blockedDates: Array<{ date: string }>): boolean {
  const dateStr = formatDateISO(date);
  return blockedDates.some(b => b.date === dateStr);
}

/**
 * Check if a date has special hours (specific date override)
 */
export function isSpecialDate(date: Date, specificDates: Array<{ date: string }>): boolean {
  const dateStr = formatDateISO(date);
  return specificDates.some(s => s.date === dateStr);
}

/**
 * Get the status of a specific date
 */
export function getDateStatus(date: Date, config: ScheduleConfig): DayStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if past date
  if (date < today) {
    return 'past';
  }
  
  // Check if blocked
  if (config.blockedDates && isBlockedDate(date, config.blockedDates)) {
    return 'blocked';
  }
  
  // Check if special date (overrides operating days)
  if (config.specificDates && isSpecialDate(date, config.specificDates)) {
    return 'special';
  }
  
  // Check advance booking limit
  if (config.advanceBookingDays) {
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + config.advanceBookingDays);
    if (date > maxDate) {
      return 'unavailable';
    }
  }
  
  // Check operating day
  if (!isOperatingDay(date, config.operatingDays)) {
    return 'unavailable';
  }
  
  return 'available';
}

/**
 * Get operating hours for a specific date
 */
export function getHoursForDate(
  date: Date,
  config: ScheduleConfig
): { start: string; end: string } | null {
  const dateStr = formatDateISO(date);
  const dayName = DAY_NAMES[date.getDay()];
  
  // Check specific date override first
  const specificDate = config.specificDates?.find(s => s.date === dateStr);
  if (specificDate) {
    return { start: specificDate.start, end: specificDate.end };
  }
  
  // Check custom hours for this day
  if (config.customHours?.[dayName]?.enabled) {
    const custom = config.customHours[dayName];
    return { start: custom.start, end: custom.end };
  }
  
  // Use default hours if operating day
  if (isOperatingDay(date, config.operatingDays)) {
    return { start: config.startTime, end: config.endTime };
  }
  
  return null;
}

/**
 * Generate time slots for a specific date
 */
export function generateTimeSlotsForDate(
  date: Date,
  config: ScheduleConfig
): Array<{ time: string; display: string; available: boolean }> {
  const hours = getHoursForDate(date, config);
  if (!hours) return [];
  
  const slots: Array<{ time: string; display: string; available: boolean }> = [];
  const [startH, startM] = hours.start.split(':').map(Number);
  const [endH, endM] = hours.end.split(':').map(Number);
  
  const startMinutes = startH * 60 + (startM || 0);
  const endMinutes = endH * 60 + (endM || 0);
  const interval = config.slotInterval || 60;
  
  for (let mins = startMinutes; mins < endMinutes; mins += interval) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const display = `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
    
    slots.push({ time, display, available: true });
  }
  
  return slots;
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get CSS classes for calendar day based on status
 */
export function getDateStatusClasses(status: DayStatus, isSelected: boolean, primaryColor: string): {
  bg: string;
  text: string;
  border: string;
  cursor: string;
} {
  const base = {
    bg: '',
    text: '',
    border: '',
    cursor: 'cursor-pointer',
  };
  
  switch (status) {
    case 'available':
      return {
        ...base,
        bg: isSelected ? primaryColor : 'bg-green-50 hover:bg-green-100',
        text: isSelected ? 'text-white' : 'text-gray-900',
        border: isSelected ? `border-2` : 'border border-green-200',
      };
    case 'special':
      return {
        ...base,
        bg: isSelected ? primaryColor : 'bg-blue-50 hover:bg-blue-100',
        text: isSelected ? 'text-white' : 'text-blue-900',
        border: isSelected ? 'border-2' : 'border border-blue-200',
      };
    case 'blocked':
      return {
        bg: 'bg-red-50',
        text: 'text-red-400',
        border: 'border border-red-200',
        cursor: 'cursor-not-allowed',
      };
    case 'unavailable':
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-300',
        border: 'border border-gray-100',
        cursor: 'cursor-not-allowed',
      };
    case 'past':
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-300',
        border: 'border border-gray-100',
        cursor: 'cursor-not-allowed',
      };
    default:
      return base;
  }
}
