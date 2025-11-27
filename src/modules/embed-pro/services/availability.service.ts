/**
 * Embed Pro 2.0 - Availability Service
 * @module embed-pro/services/availability
 * 
 * Enterprise-grade availability checking with:
 * - Real-time session capacity validation
 * - Cross-browser date handling
 * - Graceful error fallbacks
 * - Retry logic for network failures
 */

import { supabase } from '../../../lib/supabase';

// =====================================================
// TYPES
// =====================================================

export interface TimeSlotAvailability {
  time: string;
  sessionId: string;
  available: boolean;
  spotsRemaining: number;
  price: number;
}

export interface AvailabilityCheckResult {
  available: boolean;
  spotsRemaining: number;
  message?: string;
}

export interface DateAvailability {
  date: string;
  hasSlots: boolean;
  slotsCount: number;
}

// =====================================================
// CONSTANTS
// =====================================================

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

// =====================================================
// HELPERS (Cross-browser compatible)
// =====================================================

/**
 * Format date to ISO string without timezone issues
 * Works consistently across all browsers
 */
const formatDateForQuery = (date: Date): { start: string; end: string } => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  
  return {
    start: `${dateStr}T00:00:00`,
    end: `${dateStr}T23:59:59`,
  };
};

/**
 * Extract time string from ISO datetime
 */
const extractTimeFromISO = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, '0');
    const mins = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  } catch {
    return '00:00';
  }
};

/**
 * Simple retry wrapper for network requests
 */
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
};

// =====================================================
// AVAILABILITY SERVICE CLASS
// =====================================================

class AvailabilityService {
  /**
   * Get available time slots for a specific date
   * Returns slots from activity_sessions table with capacity info
   */
  async getAvailableSlots(
    activityId: string,
    date: Date,
    partySize: number = 1
  ): Promise<TimeSlotAvailability[]> {
    const { start, end } = formatDateForQuery(date);

    try {
      const result = await withRetry(async () => {
        const { data, error } = await (supabase
          .from('activity_sessions') as any)
          .select('id, start_time, capacity_remaining, price_at_generation')
          .eq('activity_id', activityId)
          .gte('start_time', start)
          .lte('start_time', end)
          .order('start_time', { ascending: true });

        if (error) throw error;
        return data || [];
      });

      return result.map((session: any) => ({
        time: extractTimeFromISO(session.start_time),
        sessionId: session.id,
        available: (session.capacity_remaining || 0) >= partySize,
        spotsRemaining: session.capacity_remaining || 0,
        price: session.price_at_generation || 0,
      }));
    } catch (error) {
      console.error('[Availability] Failed to fetch slots:', error);
      return []; // Graceful fallback - empty slots
    }
  }

  /**
   * Check if a specific session is available for booking
   * Used as pre-checkout validation
   */
  async checkSessionAvailability(
    sessionId: string,
    partySize: number
  ): Promise<AvailabilityCheckResult> {
    try {
      const { data, error } = await (supabase
        .from('activity_sessions') as any)
        .select('capacity_remaining')
        .eq('id', sessionId)
        .single();

      if (error || !data) {
        return { 
          available: false, 
          spotsRemaining: 0, 
          message: 'Session not found or expired' 
        };
      }

      const remaining = data.capacity_remaining || 0;
      const available = remaining >= partySize;

      return {
        available,
        spotsRemaining: remaining,
        message: available 
          ? undefined 
          : `Only ${remaining} spot${remaining !== 1 ? 's' : ''} remaining`,
      };
    } catch (error) {
      console.error('[Availability] Check failed:', error);
      return { 
        available: false, 
        spotsRemaining: 0, 
        message: 'Unable to verify availability' 
      };
    }
  }

  /**
   * Get availability summary for a date range (for calendar)
   * Returns which dates have available slots
   */
  async getDateRangeAvailability(
    activityId: string,
    startDate: Date,
    endDate: Date,
    partySize: number = 1
  ): Promise<DateAvailability[]> {
    const startStr = formatDateForQuery(startDate).start;
    const endStr = formatDateForQuery(endDate).end;

    try {
      const { data, error } = await (supabase
        .from('activity_sessions') as any)
        .select('start_time, capacity_remaining')
        .eq('activity_id', activityId)
        .gte('start_time', startStr)
        .lte('start_time', endStr)
        .gte('capacity_remaining', partySize);

      if (error) throw error;

      // Group by date
      const dateMap = new Map<string, number>();
      (data || []).forEach((session: any) => {
        const dateKey = session.start_time.split('T')[0];
        dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
      });

      return Array.from(dateMap.entries()).map(([date, count]) => ({
        date,
        hasSlots: count > 0,
        slotsCount: count,
      }));
    } catch (error) {
      console.error('[Availability] Date range check failed:', error);
      return [];
    }
  }
}

// Export singleton instance
export const availabilityService = new AvailabilityService();
