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
  viewAllOrgs?: boolean; // System admin flag to view all organizations
}

export interface UseStaffReturn {
  staff: StaffMember[];
  stats: StaffStats;
  departments: string[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations - organizationId optional for system admins who pass it from form
  createStaff: (data: StaffFormData, password: string, orgId?: string) => Promise<StaffMember>;
  updateStaff: (id: string, userId: string, updates: StaffUpdateData) => Promise<void>;
  deleteStaff: (userId: string) => Promise<void>;
  deleteStaffPermanent: (userId: string) => Promise<void>;
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
  const { autoFetch = true, enableRealTime = true, viewAllOrgs = false } = options;
  const { currentUser } = useAuth();
  const organizationId = options.organizationId || currentUser?.organizationId;
  const isSystemAdmin = currentUser?.role === 'system-admin';

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
    // System admin with viewAllOrgs can fetch without org ID
    const shouldFetch = viewAllOrgs || organizationId;
    if (!shouldFetch || !mountedRef.current) return;

    setLoading(true);
    setError(null);

    try {
      const data = await staffService.list({ 
        organizationId, 
        filters, 
        viewAllOrgs: viewAllOrgs && isSystemAdmin 
      });
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
  }, [organizationId, filters, viewAllOrgs, isSystemAdmin]);

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

  // Create staff - accepts orgId for system admin flow
  const createStaff = useCallback(
    async (data: StaffFormData, password: string, orgId?: string) => {
      const targetOrgId = orgId || organizationId;
      if (!targetOrgId) throw new Error('Organization ID required');

      const result = await staffService.create(data, targetOrgId, password);
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

  // Delete staff (Soft Delete / Deactivate)
  const deleteStaff = useCallback(
    async (userId: string) => {
      await staffService.delete(userId);
      toast.success('Staff member deactivated');
      await Promise.all([refreshStaff(), refreshStats()]);
    },
    [refreshStaff, refreshStats]
  );

  // Permanently delete staff
  const deleteStaffPermanent = useCallback(
    async (userId: string) => {
      await staffService.deletePermanent(userId);
      toast.success('Staff member permanently deleted');
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

  // Initial fetch and refetch when organizationId changes
  useEffect(() => {
    mountedRef.current = true;
    
    const fetchData = async () => {
      // System admin with viewAllOrgs can fetch without org ID
      const shouldFetch = viewAllOrgs || organizationId;
      
      console.log('[useStaff] fetchData called:', { 
        viewAllOrgs, 
        organizationId, 
        isSystemAdmin, 
        shouldFetch 
      });
      
      if (!shouldFetch) {
        console.log('[useStaff] No fetch needed, clearing data');
        setStaff([]);
        setStats({ total: 0, active: 0, byRole: {}, byDepartment: {}, avgHoursThisMonth: 0 });
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch staff (supports viewAllOrgs for system admins)
        console.log('[useStaff] Calling staffService.list with:', { 
          organizationId, 
          viewAllOrgs: viewAllOrgs && isSystemAdmin 
        });
        const staffData = await staffService.list({ 
          organizationId, 
          filters, 
          viewAllOrgs: viewAllOrgs && isSystemAdmin 
        });
        console.log('[useStaff] Got staff data:', staffData.length, 'members');
        
        // Stats and departments only work with org ID
        let statsData = { total: 0, active: 0, byRole: {}, byDepartment: {}, avgHoursThisMonth: 0 };
        let deptData: string[] = [];
        
        if (organizationId) {
          [statsData, deptData] = await Promise.all([
            staffService.getStats(organizationId),
            staffService.getDepartments(organizationId),
          ]);
        } else if (viewAllOrgs && staffData.length > 0) {
          // Calculate stats from fetched data for system admin
          statsData = {
            total: staffData.length,
            active: staffData.filter(s => s.isActive).length,
            byRole: staffData.reduce((acc, s) => {
              acc[s.role] = (acc[s.role] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            byDepartment: staffData.reduce((acc, s) => {
              const dept = s.department || 'Unassigned';
              acc[dept] = (acc[dept] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
            avgHoursThisMonth: 0,
          };
          deptData = [...new Set(staffData.map(s => s.department).filter(Boolean))] as string[];
        }
        
        if (mountedRef.current) {
          setStaff(staffData);
          setStats(statsData);
          setDepartments(deptData);
        }
      } catch (err: any) {
        console.error('Error fetching staff data:', err);
        if (mountedRef.current) {
          setError(err.message);
          toast.error('Failed to load staff data');
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    
    if (autoFetch) {
      fetchData();
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [autoFetch, organizationId, filters, viewAllOrgs, isSystemAdmin]); // Depend on organizationId, filters, and viewAllOrgs

  return {
    staff,
    stats,
    departments,
    loading,
    error,
    createStaff,
    updateStaff,
    deleteStaff,
    deleteStaffPermanent,
    toggleStatus,
    refreshStaff,
    refreshStats,
    filters,
    setFilters,
    clearFilters,
  };
}
