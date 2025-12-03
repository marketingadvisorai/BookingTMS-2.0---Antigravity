/**
 * Guest/Customer Hook
 * Multi-tenant customer management with real-time subscriptions
 * Enterprise-level state management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import {
  customerService,
  metricsService,
} from '../services';
import type {
  Customer,
  CustomerCreateInput,
  CustomerUpdateInput,
  CustomerFilters,
  CustomerMetrics,
  CustomerInsights,
  ActivitySegment,
  VenueSegment,
  PaginatedResponse,
} from '../types';

// =============================================================================
// HOOK OPTIONS
// =============================================================================

interface UseGuestsOptions {
  autoLoad?: boolean;
  initialFilters?: CustomerFilters;
  realtimeEnabled?: boolean;
  debounceMs?: number;
}

// =============================================================================
// HOOK RETURN TYPE
// =============================================================================

interface UseGuestsReturn {
  // Data
  customers: Customer[];
  total: number;
  metrics: CustomerMetrics | null;
  loading: boolean;
  error: string | null;
  
  // Pagination
  page: number;
  hasMore: boolean;
  
  // Actions
  loadCustomers: (filters?: CustomerFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  
  // CRUD
  createCustomer: (input: CustomerCreateInput) => Promise<Customer | null>;
  updateCustomer: (input: CustomerUpdateInput) => Promise<Customer | null>;
  deleteCustomer: (id: string) => Promise<boolean>;
  
  // Search
  searchCustomers: (term: string) => Promise<Customer[]>;
  
  // Insights
  getCustomerInsights: (customerId: string) => Promise<CustomerInsights | null>;
  
  // Segments
  getActivitySegments: () => Promise<ActivitySegment[]>;
  getVenueSegments: () => Promise<VenueSegment[]>;
  
  // Metrics
  loadMetrics: () => Promise<void>;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useGuests(options: UseGuestsOptions = {}): UseGuestsReturn {
  const {
    autoLoad = true,
    initialFilters = {},
    realtimeEnabled = true,
    debounceMs = 500,
  } = options;

  const { currentUser } = useAuth();
  const organizationId = currentUser?.organizationId || null;
  
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CustomerFilters>(initialFilters);

  // Refs for debouncing
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const isFetchingRef = useRef(false);

  // ==========================================================================
  // LOAD CUSTOMERS
  // ==========================================================================

  const loadCustomers = useCallback(async (newFilters?: CustomerFilters) => {
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const appliedFilters = newFilters || filters;
      setFilters(appliedFilters);

      const result: PaginatedResponse<Customer> = await customerService.list(
        { ...appliedFilters, page: 1 },
        organizationId || undefined
      );

      if (mountedRef.current) {
        setCustomers(result.data);
        setTotal(result.total);
        setPage(1);
        setHasMore(result.hasMore);
      }
    } catch (err: any) {
      console.error('Error loading customers:', err);
      if (mountedRef.current) {
        setError(err.message || 'Failed to load customers');
        toast.error('Failed to load customers');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [filters, organizationId]);

  // ==========================================================================
  // LOAD MORE (PAGINATION)
  // ==========================================================================

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const nextPage = page + 1;
      const result = await customerService.list(
        { ...filters, page: nextPage },
        organizationId || undefined
      );

      if (mountedRef.current) {
        setCustomers(prev => [...prev, ...result.data]);
        setPage(nextPage);
        setHasMore(result.hasMore);
      }
    } catch (err: any) {
      console.error('Error loading more customers:', err);
      toast.error('Failed to load more customers');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      isFetchingRef.current = false;
    }
  }, [filters, page, hasMore, organizationId]);

  // ==========================================================================
  // REFRESH
  // ==========================================================================

  const refreshCustomers = useCallback(async () => {
    await loadCustomers(filters);
  }, [loadCustomers, filters]);

  // ==========================================================================
  // CRUD OPERATIONS
  // ==========================================================================

  const createCustomer = useCallback(async (
    input: CustomerCreateInput
  ): Promise<Customer | null> => {
    try {
      const result = await customerService.create(input, organizationId || undefined);
      
      if (result.success && result.data) {
        toast.success('Customer created successfully');
        await refreshCustomers();
        return result.data;
      } else {
        toast.error(result.error || 'Failed to create customer');
        return null;
      }
    } catch (err: any) {
      console.error('Error creating customer:', err);
      toast.error(err.message || 'Failed to create customer');
      return null;
    }
  }, [organizationId, refreshCustomers]);

  const updateCustomer = useCallback(async (
    input: CustomerUpdateInput
  ): Promise<Customer | null> => {
    try {
      const result = await customerService.update(input, organizationId || undefined);
      
      if (result.success && result.data) {
        toast.success('Customer updated successfully');
        await refreshCustomers();
        return result.data;
      } else {
        toast.error(result.error || 'Failed to update customer');
        return null;
      }
    } catch (err: any) {
      console.error('Error updating customer:', err);
      toast.error(err.message || 'Failed to update customer');
      return null;
    }
  }, [organizationId, refreshCustomers]);

  const deleteCustomer = useCallback(async (id: string): Promise<boolean> => {
    try {
      const result = await customerService.delete(id, organizationId || undefined);
      
      if (result.success) {
        toast.success('Customer deleted successfully');
        await refreshCustomers();
        return true;
      } else {
        toast.error(result.error || 'Failed to delete customer');
        return false;
      }
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      toast.error(err.message || 'Failed to delete customer');
      return false;
    }
  }, [organizationId, refreshCustomers]);

  // ==========================================================================
  // SEARCH
  // ==========================================================================

  const searchCustomers = useCallback(async (term: string): Promise<Customer[]> => {
    try {
      return await customerService.search(term, organizationId || undefined);
    } catch (err) {
      console.error('Error searching customers:', err);
      return [];
    }
  }, [organizationId]);

  // ==========================================================================
  // METRICS & INSIGHTS
  // ==========================================================================

  const loadMetrics = useCallback(async () => {
    try {
      const data = await metricsService.getMetrics(organizationId || undefined);
      if (mountedRef.current) {
        setMetrics(data);
      }
    } catch (err) {
      console.error('Error loading metrics:', err);
    }
  }, [organizationId]);

  const getCustomerInsights = useCallback(async (
    customerId: string
  ): Promise<CustomerInsights | null> => {
    try {
      return await metricsService.getInsights(customerId, organizationId || undefined);
    } catch (err) {
      console.error('Error getting customer insights:', err);
      return null;
    }
  }, [organizationId]);

  // ==========================================================================
  // SEGMENTS
  // ==========================================================================

  const getActivitySegments = useCallback(async (): Promise<ActivitySegment[]> => {
    try {
      return await metricsService.getActivitySegments(organizationId || undefined);
    } catch (err) {
      console.error('Error getting activity segments:', err);
      return [];
    }
  }, [organizationId]);

  const getVenueSegments = useCallback(async (): Promise<VenueSegment[]> => {
    try {
      return await metricsService.getVenueSegments(organizationId || undefined);
    } catch (err) {
      console.error('Error getting venue segments:', err);
      return [];
    }
  }, [organizationId]);

  // ==========================================================================
  // REAL-TIME SUBSCRIPTION
  // ==========================================================================

  useEffect(() => {
    mountedRef.current = true;

    if (autoLoad && currentUser) {
      loadCustomers();
      loadMetrics();
    }

    // Set up real-time subscription
    if (realtimeEnabled && currentUser) {
      const subscription = supabase
        .channel('guests-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'customers' },
          () => {
            // Debounce real-time updates
            if (debounceRef.current) {
              clearTimeout(debounceRef.current);
            }
            debounceRef.current = setTimeout(() => {
              if (mountedRef.current) {
                refreshCustomers();
                loadMetrics();
              }
            }, debounceMs);
          }
        )
        .subscribe();

      return () => {
        mountedRef.current = false;
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
        subscription.unsubscribe();
      };
    }

    return () => {
      mountedRef.current = false;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [currentUser, autoLoad, realtimeEnabled, debounceMs]);

  return {
    // Data
    customers,
    total,
    metrics,
    loading,
    error,
    
    // Pagination
    page,
    hasMore,
    
    // Actions
    loadCustomers,
    loadMore,
    refreshCustomers,
    
    // CRUD
    createCustomer,
    updateCustomer,
    deleteCustomer,
    
    // Search
    searchCustomers,
    
    // Insights
    getCustomerInsights,
    
    // Segments
    getActivitySegments,
    getVenueSegments,
    
    // Metrics
    loadMetrics,
  };
}
