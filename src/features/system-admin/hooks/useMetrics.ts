/**
 * useMetrics Hook
 * 
 * Custom hook for platform metrics and analytics
 * Uses React Query for data fetching and caching
 */

import { useQuery } from '@tanstack/react-query';
import { MetricsService } from '../services';
import type { MetricsFilters } from '../types';

/**
 * usePlatformMetrics Hook
 * 
 * Hook for fetching platform-wide metrics
 */
export const usePlatformMetrics = (filters?: MetricsFilters) => {
  const {
    data: metrics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['platform-metrics', filters],
    queryFn: () => MetricsService.getPlatformMetrics(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });

  return {
    metrics,
    isLoading,
    error,
    refetch,
  };
};

/**
 * useRevenueMetrics Hook
 * 
 * Hook for fetching revenue metrics
 */
export const useRevenueMetrics = (filters?: MetricsFilters) => {
  const {
    data: revenue,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['revenue-metrics', filters],
    queryFn: () => MetricsService.getRevenueMetrics(filters),
    staleTime: 2 * 60 * 1000,
  });

  return {
    revenue,
    isLoading,
    error,
    refetch,
  };
};

/**
 * useUsageMetrics Hook
 * 
 * Hook for fetching usage metrics
 */
export const useUsageMetrics = (filters?: MetricsFilters) => {
  const {
    data: usage,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['usage-metrics', filters],
    queryFn: () => MetricsService.getUsageMetrics(filters),
    staleTime: 2 * 60 * 1000,
  });

  return {
    usage,
    isLoading,
    error,
    refetch,
  };
};

/**
 * useGrowthMetrics Hook
 * 
 * Hook for fetching growth metrics
 */
export const useGrowthMetrics = (filters?: MetricsFilters) => {
  const {
    data: growth,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['growth-metrics', filters],
    queryFn: () => MetricsService.getGrowthMetrics(filters),
    staleTime: 2 * 60 * 1000,
  });

  return {
    growth,
    isLoading,
    error,
    refetch,
  };
};
