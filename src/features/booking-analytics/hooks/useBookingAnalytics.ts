/**
 * Booking Analytics Hook
 * 
 * React hook for fetching and managing booking analytics data.
 */

import { useState, useEffect, useCallback } from 'react';
import { bookingAnalyticsService } from '../services/analytics.service';
import { useAuth } from '@/lib/auth/AuthContext';
import type {
  AnalyticsDashboardData,
  AnalyticsFilters,
  AnalyticsState,
  DateRange,
  MetricGranularity,
} from '../types';

const DEFAULT_FILTERS: AnalyticsFilters = {
  dateRange: '30d',
  granularity: 'day',
};

export function useBookingAnalytics(initialFilters?: Partial<AnalyticsFilters>) {
  const { currentUser } = useAuth();
  
  const [state, setState] = useState<AnalyticsState>({
    data: null,
    isLoading: true,
    error: null,
    filters: {
      ...DEFAULT_FILTERS,
      ...initialFilters,
      organizationId: currentUser?.organizationId || undefined,
    },
  });

  const fetchAnalytics = useCallback(async (filters: AnalyticsFilters) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const data = await bookingAnalyticsService.getDashboardData(filters);
      setState((prev) => ({ ...prev, data, isLoading: false }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setState((prev) => ({ ...prev, error: message, isLoading: false }));
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const filters = {
      ...state.filters,
      organizationId: currentUser?.organizationId || state.filters.organizationId,
    };
    fetchAnalytics(filters);
  }, [currentUser?.organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set date range
  const setDateRange = useCallback((dateRange: DateRange) => {
    setState((prev) => {
      const newFilters = { ...prev.filters, dateRange };
      fetchAnalytics(newFilters);
      return { ...prev, filters: newFilters };
    });
  }, [fetchAnalytics]);

  // Set granularity
  const setGranularity = useCallback((granularity: MetricGranularity) => {
    setState((prev) => {
      const newFilters = { ...prev.filters, granularity };
      fetchAnalytics(newFilters);
      return { ...prev, filters: newFilters };
    });
  }, [fetchAnalytics]);

  // Set venue filter
  const setVenueFilter = useCallback((venueId: string | undefined) => {
    setState((prev) => {
      const newFilters = { ...prev.filters, venueId };
      fetchAnalytics(newFilters);
      return { ...prev, filters: newFilters };
    });
  }, [fetchAnalytics]);

  // Set activity filter
  const setActivityFilter = useCallback((activityId: string | undefined) => {
    setState((prev) => {
      const newFilters = { ...prev.filters, activityId };
      fetchAnalytics(newFilters);
      return { ...prev, filters: newFilters };
    });
  }, [fetchAnalytics]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchAnalytics(state.filters);
  }, [fetchAnalytics, state.filters]);

  return {
    ...state,
    setDateRange,
    setGranularity,
    setVenueFilter,
    setActivityFilter,
    refresh,
  };
}

export default useBookingAnalytics;
