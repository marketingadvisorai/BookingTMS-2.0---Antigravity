/**
 * Staff Module - Main Hook
 * Provides unified access to staff management with real-time updates
 * Uses React Query for caching and smooth loading
 * @module staff/hooks/useStaff
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import { queryKeys, CACHE_TIMES } from '@/lib/cache';
import {
  StaffMember,
  StaffStats,
  StaffFilters,
  StaffFormData,
  StaffUpdateData,
  DEFAULT_STAFF_FILTERS,
} from '../types';
import { staffService } from '../services';

export interface UseStaffOptions {
  organizationId?: string;
  autoFetch?: boolean;
  enableRealTime?: boolean;
}

export interface UseStaffReturn {
  staff: StaffMember[];
  stats: StaffStats;
  departments: string[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  createStaff: (data: StaffFormData, password: string) => Promise<StaffMember>;
  updateStaff: (id: string, userId: string, updates: StaffUpdateData) => Promise<void>;
  deleteStaff: (userId: string) => Promise<void>;
  toggleStatus: (userId: string, currentlyActive: boolean) => Promise<void>;
  
  // Data fetching
  refreshStaff: () => Promise<void>;
  refreshStats: () => Promise<void>;
  
  // Filters
  filters: StaffFilters;
  setFilters: (filters: StaffFilters) => void;
  clearFilters: () => void;
}

export function useStaff(options: UseStaffOptions = {}): UseStaffReturn {
  const { autoFetch = true, enableRealTime = true } = options;
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const organizationId = options.organizationId || currentUser?.organizationId;

  // Filter state (local)
  const [filters, setFilters] = useState<StaffFilters>(DEFAULT_STAFF_FILTERS);

  // Refs for real-time debouncing
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // React Query for staff list
  const staffQuery = useQuery({
    queryKey: queryKeys.staff.list(organizationId || ''),
    queryFn: () => staffService.list({ organizationId: organizationId!, filters }),
    enabled: !!organizationId && autoFetch,
    staleTime: CACHE_TIMES.MEDIUM, // 5 minutes
  });

  // React Query for stats
  const statsQuery = useQuery({
    queryKey: [...queryKeys.staff.all, 'stats', organizationId],
    queryFn: async () => {
      const [statsData, deptData] = await Promise.all([
        staffService.getStats(organizationId!),
        staffService.getDepartments(organizationId!),
      ]);
      return { stats: statsData, departments: deptData };
    },
    enabled: !!organizationId && autoFetch,
    staleTime: CACHE_TIMES.MEDIUM,
  });

  // Derived state with defaults
  const staff = staffQuery.data || [];
  const stats: StaffStats = statsQuery.data?.stats || {
    total: 0,
    active: 0,
    byRole: {},
    byDepartment: {},
    avgHoursThisMonth: 0,
  };
  const departments = statsQuery.data?.departments || [];
  const loading = staffQuery.isLoading || statsQuery.isLoading;
  const error = staffQuery.error?.message || statsQuery.error?.message || null;

  // Refresh functions (invalidate cache)
  const refreshStaff = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.staff.list(organizationId || '') });
  }, [queryClient, organizationId]);

  const refreshStats = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: [...queryKeys.staff.all, 'stats', organizationId] });
  }, [queryClient, organizationId]);

  // Create staff
  const createStaff = useCallback(
    async (data: StaffFormData, password: string) => {
      if (!organizationId) throw new Error('Organization ID required');

      const result = await staffService.create(data, organizationId, password);
      toast.success('Staff member created successfully');
      await Promise.all([refreshStaff(), refreshStats()]);
      return result;
    },
    [organizationId, refreshStaff, refreshStats]
  );

  // Update staff
  const updateStaff = useCallback(
    async (id: string, userId: string, updates: StaffUpdateData) => {
      // Update profile fields
      if (Object.keys(updates).some((k) => !['role', 'isActive'].includes(k))) {
        await staffService.updateProfile(id, updates);
      }

      // Update user fields (role, status)
      if (updates.role !== undefined || updates.isActive !== undefined) {
        await staffService.updateUser(userId, {
          role: updates.role,
          isActive: updates.isActive,
        });
      }

      toast.success('Staff member updated successfully');
      await Promise.all([refreshStaff(), refreshStats()]);
    },
    [refreshStaff, refreshStats]
  );

  // Delete staff
  const deleteStaff = useCallback(
    async (userId: string) => {
      await staffService.delete(userId);
      toast.success('Staff member deactivated');
      await Promise.all([refreshStaff(), refreshStats()]);
    },
    [refreshStaff, refreshStats]
  );

  // Toggle status
  const toggleStatus = useCallback(
    async (userId: string, currentlyActive: boolean) => {
      await staffService.toggleStatus(userId, currentlyActive);
      toast.success(`Staff member ${currentlyActive ? 'deactivated' : 'activated'}`);
      await Promise.all([refreshStaff(), refreshStats()]);
    },
    [refreshStaff, refreshStats]
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_STAFF_FILTERS);
  }, []);

  // Real-time subscription for live updates
  useEffect(() => {
    if (!enableRealTime || !organizationId) return;

    const channel = supabase.channel('staff-changes');

    const handleChange = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        // Invalidate React Query cache to trigger refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.staff.all });
      }, 500);
    };

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_profiles' }, handleChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, handleChange)
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      channel.unsubscribe();
    };
  }, [enableRealTime, organizationId, queryClient]);

  // Refetch when filters change
  useEffect(() => {
    if (organizationId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.list(organizationId) });
    }
  }, [filters, organizationId, queryClient]);

  return {
    staff,
    stats,
    departments,
    loading,
    error,
    createStaff,
    updateStaff,
    deleteStaff,
    toggleStatus,
    refreshStaff,
    refreshStats,
    filters,
    setFilters,
    clearFilters,
  };
}
