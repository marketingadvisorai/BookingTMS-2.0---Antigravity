/**
 * usePlans Hook
 * 
 * Custom hook for managing subscription plans
 * Uses React Query for data fetching and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PlanService } from '../services';
import type {
  CreatePlanDTO,
  UpdatePlanDTO,
} from '../types';

export const usePlans = (activeOnly: boolean = false) => {
  const queryClient = useQueryClient();

  // Fetch all plans
  const {
    data: plans,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['plans', activeOnly],
    queryFn: () => PlanService.getAll(activeOnly),
    staleTime: 10 * 60 * 1000, // 10 minutes (plans don't change often)
  });

  // Create plan mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePlanDTO) => PlanService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create plan: ${error.message}`);
    },
  });

  // Update plan mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlanDTO }) =>
      PlanService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update plan: ${error.message}`);
    },
  });

  // Delete plan mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => PlanService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      toast.success('Plan deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete plan: ${error.message}`);
    },
  });

  return {
    // Data
    plans: plans || [],
    
    // Loading states
    isLoading,
    error,
    
    // Actions
    refetch,
    createPlan: createMutation.mutate,
    updatePlan: updateMutation.mutate,
    deletePlan: deleteMutation.mutate,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

/**
 * usePlan Hook
 * 
 * Hook for fetching a single plan by ID
 */
export const usePlan = (id?: string) => {
  const {
    data: plan,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['plan', id],
    queryFn: () => PlanService.getById(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  return {
    plan,
    isLoading,
    error,
    refetch,
  };
};

/**
 * usePlanStats Hook
 * 
 * Hook for fetching plan statistics
 */
export const usePlanStats = (id?: string) => {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['plan-stats', id],
    queryFn: () => PlanService.getStats(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
};
