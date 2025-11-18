/**
 * useAvailability Hook
 * 
 * Fetches available time slots for a game on a specific date from Supabase.
 * Uses React Query for caching, refetching, and optimistic updates.
 * 
 * For AI Agents:
 * - Uses @tanstack/react-query for data fetching
 * - Automatically refetches every 30 seconds to keep availability fresh
 * - Handles loading, error, and empty states
 * - Returns typed data matching TimeSlot interface
 * 
 * Usage:
 * ```typescript
 * const { slots, isLoading, error } = useAvailability({
 *   gameId: 'game-123',
 *   date: new Date('2025-11-20'),
 *   organizationId: 'org-456'
 * });
 * ```
 * 
 * @module components/booking/hooks
 */

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { generateMockTimeSlots } from '@/lib/mock/mockDataService';
import type { TimeSlot, AvailableSlotResponse } from '../types';

// =============================================================================
// TYPES
// =============================================================================

interface UseAvailabilityParams {
  gameId: string | null;
  date: Date | null;
  organizationId: string;
  enabled?: boolean;  // Optional: control when query runs
}

interface UseAvailabilityReturn {
  slots: TimeSlot[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isRefetching: boolean;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Transform Supabase response to TimeSlot format
 * Converts snake_case to camelCase and ensures type safety
 */
function transformSlotResponse(response: AvailableSlotResponse): TimeSlot {
  return {
    time: response.time_slot,
    endTime: response.end_time,
    availableSpots: response.available_spots,
    totalCapacity: response.total_capacity,
    isAvailable: response.is_available,
    price: response.price,
  };
}

/**
 * Fetch available slots
 * Currently using mock data - replace with Supabase RPC when ready
 */
async function fetchAvailableSlots(
  gameId: string,
  date: Date,
  organizationId: string
): Promise<TimeSlot[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate mock time slots
  const mockSlots = generateMockTimeSlots(date);
  
  // Transform to TimeSlot format
  const slots: TimeSlot[] = mockSlots.map(slot => ({
    time: slot.time,
    endTime: slot.endTime,
    availableSpots: slot.availableSpots,
    totalCapacity: slot.totalCapacity,
    isAvailable: slot.isAvailable,
    price: slot.price,
  }));
  
  // Filter out past time slots if date is today
  const now = new Date();
  const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
  
  if (isToday) {
    const currentTime = format(now, 'HH:mm');
    return slots.filter(slot => slot.time >= currentTime);
  }
  
  return slots;
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * useAvailability Hook
 * 
 * Fetches and manages available time slots for booking
 * 
 * @param {UseAvailabilityParams} params - Game ID, date, and organization
 * @returns {UseAvailabilityReturn} Slots data and query state
 */
export function useAvailability({
  gameId,
  date,
  organizationId,
  enabled = true,
}: UseAvailabilityParams): UseAvailabilityReturn {
  
  const query = useQuery({
    // Query key for caching (changes when gameId or date changes)
    queryKey: ['availability', gameId, date ? format(date, 'yyyy-MM-dd') : null],
    
    // Query function
    queryFn: () => {
      if (!gameId || !date) {
        throw new Error('Game ID and date are required');
      }
      return fetchAvailableSlots(gameId, date, organizationId);
    },
    
    // Only run query if we have gameId and date
    enabled: enabled && !!gameId && !!date,
    
    // Refetch every 30 seconds to keep availability fresh
    refetchInterval: 30000,
    
    // Refetch when window regains focus (user comes back to tab)
    refetchOnWindowFocus: true,
    
    // Don't retry on error (availability might not exist)
    retry: false,
    
    // Keep data fresh for 30 seconds before considering stale
    staleTime: 30000,
    
    // Keep data in cache for 5 minutes even when unused
    gcTime: 5 * 60 * 1000,
  });
  
  return {
    slots: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  };
}

// =============================================================================
// ADDITIONAL HOOKS
// =============================================================================

/**
 * useAvailableDates Hook
 * 
 * Fetches which dates in a month have availability
 * Useful for calendar view to highlight available dates
 * 
 * @param {string} gameId - Game ID
 * @param {Date} month - Month to check (any date in the month)
 * @param {string} organizationId - Organization ID
 */
export function useAvailableDates(
  gameId: string | null,
  month: Date,
  organizationId: string
) {
  return useQuery({
    queryKey: ['availableDates', gameId, format(month, 'yyyy-MM')],
    queryFn: async () => {
      if (!gameId) return [];
      
      // Get first and last day of month
      const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
      const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      // TODO: Implement RPC function to get available dates for month
      // For now, return empty array
      // This should call: get_available_dates(gameId, firstDay, lastDay, organizationId)
      
      return [];
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000, // 5 minutes (dates don't change as often)
  });
}

/**
 * useSlotCapacity Hook
 * 
 * Gets real-time capacity for a specific time slot
 * Useful for showing "X spots left" indicator
 * 
 * @param {string} gameId - Game ID
 * @param {Date} date - Booking date
 * @param {string} time - Time slot (HH:mm format)
 * @param {string} organizationId - Organization ID
 */
export function useSlotCapacity(
  gameId: string | null,
  date: Date | null,
  time: string | null,
  organizationId: string
) {
  return useQuery({
    queryKey: ['slotCapacity', gameId, date ? format(date, 'yyyy-MM-dd') : null, time],
    queryFn: async () => {
      if (!gameId || !date || !time) return null;
      
      // Fetch single slot capacity
      const slots = await fetchAvailableSlots(gameId, date, organizationId);
      return slots.find(slot => slot.time === time) || null;
    },
    enabled: !!gameId && !!date && !!time,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    staleTime: 10000,
  });
}
