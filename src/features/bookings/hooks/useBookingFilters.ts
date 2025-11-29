/**
 * useBookingFilters Hook
 * 
 * Manages filtering state and logic for the Bookings page.
 * Handles date range presets, custom ranges, search, status, and game filters.
 * @module features/bookings/hooks/useBookingFilters
 */
import { useState, useMemo, useCallback } from 'react';
import type { Booking } from '../types';

export type DateRangePreset = 
  | 'all' 
  | 'today' 
  | 'yesterday' 
  | 'last7days' 
  | 'last30days'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'thisYear'
  | 'custom';

export interface BookingFiltersState {
  searchTerm: string;
  statusFilter: string;
  gameFilter: string;
  dateRangePreset: DateRangePreset;
  customStartDate: Date | undefined;
  customEndDate: Date | undefined;
  showDateRangePicker: boolean;
}

export interface UseBookingFiltersReturn {
  // State
  filters: BookingFiltersState;
  // Setters
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  setGameFilter: (game: string) => void;
  setDateRangePreset: (preset: DateRangePreset) => void;
  setCustomStartDate: (date: Date | undefined) => void;
  setCustomEndDate: (date: Date | undefined) => void;
  setShowDateRangePicker: (show: boolean) => void;
  // Helpers
  getDateRangeLabel: () => string;
  filterBookings: (bookings: Booking[]) => Booking[];
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Check if a date string is within the selected date range
 */
const isDateInRange = (
  dateStr: string,
  preset: DateRangePreset,
  customStartDate?: Date,
  customEndDate?: Date
): boolean => {
  if (preset === 'all') return true;

  const bookingDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case 'today':
      return dateStr === today.toISOString().split('T')[0];

    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return dateStr === yesterday.toISOString().split('T')[0];
    }

    case 'last7days': {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return bookingDate >= sevenDaysAgo && bookingDate <= today;
    }

    case 'last30days': {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return bookingDate >= thirtyDaysAgo && bookingDate <= today;
    }

    case 'thisWeek': {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
    }

    case 'lastWeek': {
      const startOfLastWeek = new Date(today);
      startOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
      return bookingDate >= startOfLastWeek && bookingDate <= endOfLastWeek;
    }

    case 'thisMonth':
      return bookingDate.getMonth() === today.getMonth() && 
             bookingDate.getFullYear() === today.getFullYear();

    case 'lastMonth': {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return bookingDate.getMonth() === lastMonth.getMonth() && 
             bookingDate.getFullYear() === lastMonth.getFullYear();
    }

    case 'thisQuarter': {
      const quarter = Math.floor(today.getMonth() / 3);
      const bookingQuarter = Math.floor(bookingDate.getMonth() / 3);
      return bookingQuarter === quarter && bookingDate.getFullYear() === today.getFullYear();
    }

    case 'thisYear':
      return bookingDate.getFullYear() === today.getFullYear();

    case 'custom':
      if (customStartDate && customEndDate) {
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return bookingDate >= start && bookingDate <= end;
      }
      return true;

    default:
      return true;
  }
};

/**
 * Hook for managing booking filters state and filtering logic.
 */
export function useBookingFilters(): UseBookingFiltersReturn {
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all-games');
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('all');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  // Get human-readable date range label
  const getDateRangeLabel = useCallback((): string => {
    switch (dateRangePreset) {
      case 'all': return 'All Time';
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'last7days': return 'Last 7 Days';
      case 'last30days': return 'Last 30 Days';
      case 'thisWeek': return 'This Week';
      case 'lastWeek': return 'Last Week';
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'thisQuarter': return 'This Quarter';
      case 'thisYear': return 'This Year';
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = customStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const end = customEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return `${start} - ${end}`;
        }
        return 'Select Date Range';
      default:
        return 'All Time';
    }
  }, [dateRangePreset, customStartDate, customEndDate]);

  // Filter bookings based on all filter criteria
  const filterBookings = useCallback((bookings: Booking[]): Booking[] => {
    return bookings.filter(booking => {
      // Search filter
      const matchesSearch = searchTerm === '' ||
        booking.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      // Game filter
      const matchesGame = gameFilter === 'all-games' || booking.game === gameFilter;

      // Date range filter
      const matchesDateRange = isDateInRange(
        booking.date, 
        dateRangePreset, 
        customStartDate, 
        customEndDate
      );

      return matchesSearch && matchesStatus && matchesGame && matchesDateRange;
    });
  }, [searchTerm, statusFilter, gameFilter, dateRangePreset, customStartDate, customEndDate]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setGameFilter('all-games');
    setDateRangePreset('all');
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
  }, []);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return searchTerm !== '' || 
           statusFilter !== 'all' || 
           gameFilter !== 'all-games' || 
           dateRangePreset !== 'all';
  }, [searchTerm, statusFilter, gameFilter, dateRangePreset]);

  // Combined filters state
  const filters: BookingFiltersState = useMemo(() => ({
    searchTerm,
    statusFilter,
    gameFilter,
    dateRangePreset,
    customStartDate,
    customEndDate,
    showDateRangePicker,
  }), [searchTerm, statusFilter, gameFilter, dateRangePreset, customStartDate, customEndDate, showDateRangePicker]);

  return {
    filters,
    setSearchTerm,
    setStatusFilter,
    setGameFilter,
    setDateRangePreset,
    setCustomStartDate,
    setCustomEndDate,
    setShowDateRangePicker,
    getDateRangeLabel,
    filterBookings,
    clearAllFilters,
    hasActiveFilters,
  };
}
