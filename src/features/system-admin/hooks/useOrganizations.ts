/**
 * useOrganizations Hook
 * 
 * Custom hook for managing organization data
 * Uses React Query for data fetching and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { OrganizationService } from '../services';
import type {
  OrganizationFilters,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
} from '../types';

export const useOrganizations = (
  filters?: OrganizationFilters,
  page: number = 1,
  perPage: number = 10
) => {
  const queryClient = useQueryClient();

  // Fetch organizations with filters and pagination
  const {
    data: response,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['organizations', filters, page, perPage],
    queryFn: async () => {
      try {
        return await OrganizationService.getAll(filters, page, perPage);
      } catch (err: any) {
        console.warn('Organizations query failed:', err?.message || 'Database not configured');
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on database errors
  });

  // Create organization mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateOrganizationDTO) => OrganizationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast.success('Organization created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create organization: ${error.message}`);
    },
  });

  // Update organization mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationDTO }) =>
      OrganizationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast.success('Organization updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update organization: ${error.message}`);
    },
  });

  // Delete organization mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => OrganizationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
      toast.success('Organization deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete organization: ${error.message}`);
    },
  });

  return {
    // Data
    organizations: response?.data || [],
    total: response?.total || 0,
    page: response?.page || 1,
    perPage: response?.per_page || 10,
    totalPages: response?.total_pages || 0,
    
    // Loading states
    isLoading,
    isFetching,
    error,
    
    // Actions
    refetch,
    createOrganization: createMutation.mutate,
    updateOrganization: updateMutation.mutate,
    deleteOrganization: deleteMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * useOrganization Hook
 * 
 * Hook for fetching a single organization by ID
 */
export const useOrganization = (id?: string) => {
  const {
    data: organization,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['organization', id],
    queryFn: () => OrganizationService.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  return {
    organization,
    isLoading,
    error,
    refetch,
  };
};

/**
 * useOrganizationMetrics Hook
 * 
 * Hook for fetching organization-specific metrics
 */
export const useOrganizationMetrics = (id?: string) => {
  const {
    data: metrics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['organization-metrics', id],
    queryFn: () => OrganizationService.getMetrics(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    metrics,
    isLoading,
    error,
    refetch,
  };
};
