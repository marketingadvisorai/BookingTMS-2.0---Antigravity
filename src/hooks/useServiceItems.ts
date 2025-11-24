import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActivityService, Activity, CreateActivityInput, ActivityScheduleRules } from '../modules/inventory/services/activity.service';
import { toast } from 'sonner';

// Adapter interface to match what the UI expects (flattened schedule)
export interface ServiceItem extends Omit<Activity, 'schedule' | 'min_players' | 'max_players'> {
    schedule?: ActivityScheduleRules;
    // Flattened fields for UI compatibility
    operatingDays?: string[];
    startTime?: string;
    endTime?: string;
    slotInterval?: number;
    advanceBooking?: number;
    customHoursEnabled?: boolean;
    customHours?: Record<string, { enabled: boolean; startTime: string; endTime: string }>;
    customDates?: Array<{ id: string; date: string; startTime: string; endTime: string }>;
    blockedDates?: Array<string | { date: string; startTime: string; endTime: string; reason?: string }>;
    // Legacy fields
    min_players?: number;
    max_players?: number;

    child_price?: number;
    minAge?: number;
}

export const useServiceItems = (venueId?: string) => {
    const queryClient = useQueryClient();
    const queryKey = ['service-items', venueId];

    // Helper to flatten activity for UI
    const flattenActivity = (activity: Activity): ServiceItem => {
        const schedule = activity.schedule;
        return {
            ...activity,
            min_players: activity.min_players || 1,
            max_players: activity.max_players || activity.capacity,
            child_price: activity.child_price || 0,
            minAge: activity.min_age || 0,
            operatingDays: schedule?.operatingDays,
            startTime: schedule?.startTime,
            endTime: schedule?.endTime,
            slotInterval: schedule?.slotInterval,
            advanceBooking: schedule?.advanceBooking,
            customHoursEnabled: schedule?.customHoursEnabled,
            customHours: schedule?.customHours,
            customDates: schedule?.customDates,
            blockedDates: schedule?.blockedDates
        };
    };

    // Helper to unflatten input for Service
    const unflattenInput = (item: any): CreateActivityInput => {
        const schedule: ActivityScheduleRules = {
            operatingDays: item.operatingDays || [],
            startTime: item.startTime || '09:00',
            endTime: item.endTime || '17:00',
            slotInterval: item.slotInterval || 60,
            advanceBooking: item.advanceBooking || 0,
            customHoursEnabled: item.customHoursEnabled || false,
            customHours: item.customHours || {},
            customDates: item.customDates || [],
            blockedDates: item.blockedDates || []
        };

        const {
            operatingDays, startTime, endTime, slotInterval, advanceBooking,
            customHoursEnabled, customHours, customDates, blockedDates,
            min_players, max_players, child_price, minAge,
            ...rest
        } = item;

        return {
            ...rest,
            capacity: max_players || item.capacity || 10,
            min_players: min_players || 1,
            max_players: max_players || item.capacity || 10,
            child_price: child_price || 0,
            min_age: minAge || 0,
            schedule
        };
    };

    // Fetch Service Items
    const { data: serviceItems = [], isLoading, error, refetch } = useQuery({
        queryKey,
        queryFn: async () => {
            if (!venueId) return [];
            const activities = await ActivityService.listActivities(venueId);
            return activities.map(flattenActivity);
        },
        enabled: !!venueId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Create Service Item
    const createServiceItemMutation = useMutation({
        mutationFn: (newItem: any) =>
            ActivityService.createActivity(unflattenInput(newItem)),
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
        mutationFn: ({ id, updates }: { id: string; updates: any }) => {
            // We need to handle partial updates carefully with the adapter
            // For now, we assume updates might contain flattened fields
            // But ActivityService.updateActivity expects Partial<CreateActivityInput>
            // which has nested schedule.

            // If updates contain any schedule fields, we might need to merge with existing?
            // Or just pass what we have if the service handles it.
            // The unflattenInput creates a full schedule object.
            // We might need a partial unflatten.

            // Simplified: Just pass it through unflatten logic but allow partials
            // This is tricky. For now, let's assume the UI sends enough data or we accept that 
            // updating one schedule field might require sending the whole schedule object 
            // if we use the simple unflatten.

            // Better approach for updates:
            // If the update has schedule fields, construct the schedule object.

            const scheduleFields = ['operatingDays', 'startTime', 'endTime', 'slotInterval', 'advanceBooking', 'customHoursEnabled', 'customHours', 'customDates', 'blockedDates'];
            const hasScheduleUpdate = scheduleFields.some(f => f in updates);

            let cleanUpdates = { ...updates };

            if (hasScheduleUpdate) {
                // We need the current object to merge? 
                // Or we assume the UI sends the whole schedule state.
                // AddServiceItemWizard usually sends the whole state on save.

                const schedule = {
                    operatingDays: updates.operatingDays,
                    startTime: updates.startTime,
                    endTime: updates.endTime,
                    slotInterval: updates.slotInterval,
                    advanceBooking: updates.advanceBooking,
                    customHoursEnabled: updates.customHoursEnabled,
                    customHours: updates.customHours,
                    customDates: updates.customDates,
                    blockedDates: updates.blockedDates
                };

                // Remove flat fields
                scheduleFields.forEach(f => delete cleanUpdates[f]);
                cleanUpdates.schedule = schedule;
            }

            if (updates.max_players) {
                cleanUpdates.capacity = updates.max_players;
                delete cleanUpdates.max_players;
            }

            return ActivityService.updateActivity(id, cleanUpdates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
            toast.success('Service item updated successfully');
        },
        onError: (error: any) => {
            toast.error(`Failed to update service item: ${error.message}`);
        }
    });

    // Delete Service Item
    const deleteServiceItemMutation = useMutation({
        mutationFn: (id: string) => ActivityService.deleteActivity(id),
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
        isDeleting: deleteServiceItemMutation.isPending,
        refreshServiceItems: refetch
    };
};
