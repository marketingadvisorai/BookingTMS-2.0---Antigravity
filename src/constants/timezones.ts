/**
 * USA Time Zones - Centralized Constants
 * 
 * All IANA timezone identifiers for United States regions.
 * This is the single source of truth for timezone options across the platform.
 * 
 * @module constants/timezones
 */

export interface TimezoneOption {
  value: string;
  label: string;
  abbreviation?: string;
  utcOffset?: string;
}

/**
 * Complete list of USA time zones with IANA identifiers
 * Ordered from East to West (most common first)
 */
export const USA_TIMEZONES: TimezoneOption[] = [
  // Eastern Time Zone
  { value: 'America/New_York', label: 'Eastern Time (ET)', abbreviation: 'ET', utcOffset: 'UTC-5/UTC-4' },
  { value: 'America/Detroit', label: 'Eastern Time (Detroit)', abbreviation: 'ET', utcOffset: 'UTC-5/UTC-4' },
  { value: 'America/Indiana/Indianapolis', label: 'Eastern Time (Indiana)', abbreviation: 'ET', utcOffset: 'UTC-5/UTC-4' },
  
  // Central Time Zone
  { value: 'America/Chicago', label: 'Central Time (CT)', abbreviation: 'CT', utcOffset: 'UTC-6/UTC-5' },
  
  // Mountain Time Zone
  { value: 'America/Denver', label: 'Mountain Time (MT)', abbreviation: 'MT', utcOffset: 'UTC-7/UTC-6' },
  { value: 'America/Boise', label: 'Mountain Time (Boise)', abbreviation: 'MT', utcOffset: 'UTC-7/UTC-6' },
  { value: 'America/Phoenix', label: 'Arizona (No DST)', abbreviation: 'MST', utcOffset: 'UTC-7' },
  
  // Pacific Time Zone
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', abbreviation: 'PT', utcOffset: 'UTC-8/UTC-7' },
  
  // Alaska Time Zone
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', abbreviation: 'AKT', utcOffset: 'UTC-9/UTC-8' },
  
  // Hawaii-Aleutian Time Zone
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', abbreviation: 'HST', utcOffset: 'UTC-10' },
  { value: 'America/Adak', label: 'Hawaii-Aleutian (HST)', abbreviation: 'HST', utcOffset: 'UTC-10/UTC-9' },
];

/**
 * Simplified list of main USA time zones (most commonly used)
 * Use this for simpler UIs where full list isn't needed
 */
export const USA_TIMEZONES_SIMPLE: TimezoneOption[] = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona (No DST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
];

/**
 * Default timezone for new organizations/venues
 */
export const DEFAULT_TIMEZONE = 'America/New_York';

/**
 * Get timezone label by IANA value
 */
export function getTimezoneLabel(value: string): string {
  const tz = USA_TIMEZONES.find(t => t.value === value);
  return tz?.label || value;
}

/**
 * Get timezone abbreviation by IANA value
 */
export function getTimezoneAbbreviation(value: string): string {
  const tz = USA_TIMEZONES.find(t => t.value === value);
  return tz?.abbreviation || '';
}

/**
 * Check if a timezone value is valid USA timezone
 */
export function isValidUSATimezone(value: string): boolean {
  return USA_TIMEZONES.some(t => t.value === value);
}

// Legacy export for backward compatibility
export const TIMEZONES = USA_TIMEZONES;
