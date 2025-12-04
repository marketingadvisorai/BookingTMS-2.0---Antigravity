/**
 * Staff Module - Main Hook
 * Provides unified access to staff management with real-time updates
 * @module staff/hooks/useStaff
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
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
  const organizationId = options.organizationId || currentUser?.organizationId;

  // State
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [stats, setStats] = useState<StaffStats>({
    total: 0,
    active: 0,
    byRole: {},
    byDepartment: {},
    avgHoursThisMonth: 0,
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StaffFilters>(DEFAULT_STAFF_FILTERS);

  // Refs for cleanup
  const mountedRef = useRef(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch staff members
  const refreshStaff = useCallback(async () => {
    if (!organizationId || !mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const data = await staffService.list({ organizationId, filters });
      if (mountedRef.current) {
        setStaff(data);
      }
    } catch (err: any) {
      console.error('Error fetching staff:', err);
      if (mountedRef.current) {
        setError(err.message);
        toast.error('Failed to load staff members');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [organizationId, filters]);

  // Fetch stats
  const refreshStats = useCallback(async () => {
    if (!organizationId || !mountedRef.current) return;

    try {
      const [statsData, deptData] = await Promise.all([
        staffService.getStats(organizationId),
        staffService.getDepartments(organizationId),
      ]);

      if (mountedRef.current) {
        setStats(statsData);
        setDepartments(deptData);
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  }, [organizationId]);

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

  // Real-time subscription
  useEffect(() => {
    if (!enableRealTime || !organizationId) return;

    const channel = supabase.channel('staff-changes');

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_profiles' }, () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (mountedRef.current) {
            refreshStaff();
            refreshStats();
          }
        }, 500);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          if (mountedRef.current) {
            refreshStaff();
            refreshStats();
          }
        }, 500);
      })
      .subscribe();

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      channel.unsubscribe();
    };
  }, [enableRealTime, organizationId, refreshStaff, refreshStats]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    if (autoFetch && organizationId) {
      refreshStaff();
      refreshStats();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [autoFetch, organizationId, refreshStaff, refreshStats]);

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
