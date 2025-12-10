/**
 * Cached Staff Hook
 * React Query-powered staff data with edge caching
 * @module staff/hooks/useStaffCached
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/AuthContext';
import { queryKeys, invalidationPatterns } from '@/lib/cache/queryConfig';
import { staffService } from '../services';
import { StaffMember, StaffFormData, StaffUpdateData, StaffFilters, StaffStats } from '../types';

// Cache configuration - 5 minutes stale time for staff data
const STAFF_CACHE_CONFIG = {
  staleTime: 5 * 60 * 1000,    // 5 minutes
  gcTime: 30 * 60 * 1000,      // 30 minutes
  refetchOnMount: false,
  refetchOnWindowFocus: false,
};

export interface UseStaffCachedOptions {
  organizationId?: string;
  filters?: StaffFilters;
  enabled?: boolean;
}

export function useStaffCached(options: UseStaffCachedOptions = {}) {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const orgId = options.organizationId || currentUser?.organizationId;
  const enabled = options.enabled !== false && !!orgId;

  // Fetch staff list with caching
  const staffQuery = useQuery({
    queryKey: queryKeys.staff.byOrg(orgId || ''),
    queryFn: () => staffService.list({ organizationId: orgId!, filters: options.filters }),
    enabled,
    ...STAFF_CACHE_CONFIG,
  });

  // Fetch staff stats with caching
  const statsQuery = useQuery({
    queryKey: queryKeys.staff.stats(orgId || ''),
    queryFn: () => staffService.getStats(orgId!),
    enabled,
    ...STAFF_CACHE_CONFIG,
  });

  // Create staff mutation with optimistic updates
  const createMutation = useMutation({
    mutationFn: ({ data, password }: { data: StaffFormData; password: string }) =>
      staffService.create(data, orgId!, password),
    onSuccess: () => {
      if (orgId) invalidationPatterns.afterStaffCreate(queryClient, orgId);
      toast.success('Staff member created');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create staff');
    },
  });

  // Update staff profile mutation
  const updateMutation = useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: StaffUpdateData }) =>
      staffService.updateProfile(staffId, data),
    onMutate: async ({ staffId, data }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.staff.byOrg(orgId || '') });
      const previous = queryClient.getQueryData<StaffMember[]>(queryKeys.staff.byOrg(orgId || ''));
      
      if (previous) {
        queryClient.setQueryData(queryKeys.staff.byOrg(orgId || ''), (old: StaffMember[]) =>
          old.map(s => s.id === staffId ? { ...s, ...data } : s)
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.staff.byOrg(orgId || ''), context.previous);
      }
      toast.error('Failed to update staff');
    },
    onSuccess: (_data, { staffId }) => {
      if (orgId) invalidationPatterns.afterStaffUpdate(queryClient, orgId, staffId);
      toast.success('Staff member updated');
    },
  });

  // Delete staff mutation (soft delete via userId)
  const deleteMutation = useMutation({
    mutationFn: (userId: string) => staffService.delete(userId),
    onSuccess: () => {
      if (orgId) invalidationPatterns.afterStaffCreate(queryClient, orgId);
      toast.success('Staff member removed');
    },
    onError: () => {
      toast.error('Failed to delete staff');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) =>
      staffService.toggleStatus(userId, isActive),
    onSuccess: (_data, { userId }) => {
      if (orgId) {
        // Find staff by userId to get staffId for invalidation
        const staff = staffQuery.data?.find(s => s.userId === userId);
        if (staff) invalidationPatterns.afterStaffUpdate(queryClient, orgId, staff.id);
      }
    },
  });

  return {
    // Data
    staff: staffQuery.data || [],
    stats: statsQuery.data || { total: 0, active: 0, byRole: {}, byDepartment: {}, avgHoursThisMonth: 0 },
    
    // Loading states
    loading: staffQuery.isLoading,
    statsLoading: statsQuery.isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Error states
    error: staffQuery.error?.message || null,
    
    // Actions
    createStaff: (data: StaffFormData, password: string) => createMutation.mutateAsync({ data, password }),
    updateStaff: (staffId: string, data: StaffUpdateData) =>
      updateMutation.mutateAsync({ staffId, data }),
    deleteStaff: (userId: string) => deleteMutation.mutateAsync(userId),
    toggleStatus: (userId: string, isActive: boolean) =>
      toggleStatusMutation.mutateAsync({ userId, isActive }),
    
    // Refresh
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.byOrg(orgId || '') });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.stats(orgId || '') });
    },
  };
}
