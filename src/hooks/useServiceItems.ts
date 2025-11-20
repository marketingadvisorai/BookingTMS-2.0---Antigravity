import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceItemManager, ServiceItem } from '../services/ServiceItemManager';
import { toast } from 'sonner';

export const useServiceItems = (venueId?: string) => {
    const queryClient = useQueryClient();
    const queryKey = ['service-items', venueId];

    // Fetch Service Items
    const { data: serviceItems = [], isLoading, error } = useQuery({
        queryKey,
        queryFn: () => ServiceItemManager.getServiceItems(venueId),
        enabled: !!venueId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Create Service Item
    const createServiceItemMutation = useMutation({
        mutationFn: (newItem: Omit<ServiceItem, 'id' | 'created_at' | 'updated_at' | 'created_by'>) =>
            ServiceItemManager.createServiceItem(newItem),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success('Service item created successfully');
        },
        onError: (error: any) => {
            toast.error(`Failed to create service item: ${error.message}`);
        }
    });

    // Update Service Item
    const updateServiceItemMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<ServiceItem> }) =>
            ServiceItemManager.updateServiceItem(id, updates),
        onMutate: async ({ id, updates }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey });

            // Snapshot the previous value
            const previousItems = queryClient.getQueryData<ServiceItem[]>(queryKey);

            // Optimistically update to the new value
            if (previousItems) {
                queryClient.setQueryData<ServiceItem[]>(queryKey, (old) =>
                    (old || []).map((item) =>
                        item.id === id ? { ...item, ...updates } : item
                    )
                );
            }

            return { previousItems };
        },
        onError: (err, newTodo, context) => {
            // Rollback on error
            if (context?.previousItems) {
                queryClient.setQueryData(queryKey, context.previousItems);
            }
            toast.error(`Failed to update service item: ${err.message}`);
        },
        onSettled: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey });
        }
    });

    // Delete Service Item
    const deleteServiceItemMutation = useMutation({
        mutationFn: (id: string) => ServiceItemManager.deleteServiceItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success('Service item deleted successfully');
        },
        onError: (error: any) => {
            toast.error(`Failed to delete service item: ${error.message}`);
        }
    });

    return {
        serviceItems,
        loading: isLoading,
        error,
        createServiceItem: createServiceItemMutation.mutateAsync,
        updateServiceItem: updateServiceItemMutation.mutateAsync,
        deleteServiceItem: deleteServiceItemMutation.mutateAsync,
        isCreating: createServiceItemMutation.isPending,
        isUpdating: updateServiceItemMutation.isPending,
        isDeleting: deleteServiceItemMutation.isPending
    };
};
