import { supabase } from '../../../lib/supabase';
import { StripeIntegrationService } from '../../../services/stripe-integration.service';
import { toast } from 'sonner';

// Define the Schedule Rules interface (formerly ServiceItemSchedule)
// This acts as the template for generating sessions
export interface ActivityScheduleRules {
    operatingDays: string[];
    startTime: string;
    endTime: string;
    slotInterval: number;
    advanceBooking: number;
    customHoursEnabled: boolean;
    customHours: Record<string, { enabled: boolean; startTime: string; endTime: string }>;
    customDates: Array<{ id: string; date: string; startTime: string; endTime: string }>;
    blockedDates: Array<string | { date: string; startTime: string; endTime: string; reason?: string }>;
}

export interface Activity {
    id: string;
    organization_id: string;
    venue_id: string;
    name: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
    duration: number; // in minutes

    capacity: number; // formerly min_players/max_players, now unified capacity per session
    min_players: number;
    max_players: number;
    price: number;
    child_price?: number;
    min_age?: number;

    image_url?: string;
    status: 'active' | 'inactive' | 'maintenance';
    settings: Record<string, any>;
    created_by: string;
    created_at: string;
    updated_at: string;

    // Stripe integration fields
    stripe_product_id?: string;
    stripe_price_id?: string;
    stripe_checkout_url?: string;
    stripe_sync_status?: string;
    stripe_last_sync?: string;
    stripe_metadata?: Record<string, any>;
    price_lookup_key?: string;
    active_price_id?: string;

    // Schedule Rules (Template)
    schedule?: ActivityScheduleRules;
}

export type CreateActivityInput = Omit<Activity, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'schedule' | 'organization_id'> & {
    schedule?: ActivityScheduleRules;
    organization_id?: string; // Optional in input, derived from venue
};

export class ActivityService {
    /**
     * Fetch all activities for a specific venue
     */
    static async listActivities(venueId: string): Promise<Activity[]> {
        try {
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('venue_id', venueId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return (data || []).map(item => ({
                ...item,
                // Map legacy fields if necessary, or just pass through
                capacity: item.max_players || item.capacity || 1, // Fallback
                min_players: item.min_players || 1,
                max_players: item.max_players || item.capacity || 10,

                child_price: item.settings?.child_price || 0,
                min_age: item.settings?.min_age || 0,
                status: item.is_active ? 'active' : 'inactive', // Map is_active to status
            }));
        } catch (error: any) {
            console.error('Error fetching activities:', error);
            throw new Error(error.message || 'Failed to fetch activities');
        }
    }

    /**
     * Get a single activity by ID
     */
    static async getActivity(id: string): Promise<Activity | null> {
        try {
            const { data, error } = await supabase
                .from('activities')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) return null;

            return {
                ...data,
                capacity: data.max_players || data.capacity || 1,
                min_players: data.min_players || 1,
                max_players: data.max_players || data.capacity || 10,

                child_price: data.settings?.child_price || 0,
                min_age: data.settings?.min_age || 0,
                status: data.is_active ? 'active' : 'inactive', // Map is_active to status
            };
        } catch (error: any) {
            console.error('Error fetching activity:', error);
            throw new Error(error.message || 'Failed to fetch activity');
        }
    }

    /**
     * Create a new activity
     */
    static async createActivity(input: CreateActivityInput): Promise<Activity> {
        console.log('ActivityService.createActivity called with:', input);
        try {
            if (!input.venue_id) throw new Error('Venue ID is required');

            // 1. Fetch venue to get organization_id
            const { data: fetchedVenueData, error: venueError } = await supabase
                .from('venues')
                .select('organization_id, name, id')
                .eq('id', input.venue_id)
                .single();

            if (venueError || !fetchedVenueData) {
                console.error('Error fetching venue:', venueError);
                throw new Error('Venue not found or invalid');
            }

            const orgId = fetchedVenueData.organization_id;
            if (!orgId) throw new Error('Venue must belong to an organization');

            // 2. Prepare Insert Data
            const { data: { session } } = await supabase.auth.getSession();

            const { capacity, child_price, min_age, slug, tagline, success_rate, status, ...restInput } = input as any;

            // Construct the insert object matching the 'activities' table schema
            const insertData = {
                ...restInput,
                organization_id: orgId,
                created_by: session?.user?.id,
                stripe_product_id: input.stripe_product_id || null,
                stripe_price_id: input.stripe_price_id || null,
                active_price_id: input.stripe_price_id || null,
                stripe_sync_status: input.stripe_product_id ? 'synced' : 'pending',
                stripe_last_sync: input.stripe_product_id ? new Date().toISOString() : null,
                // Map capacity to legacy columns if they still exist or use new ones
                min_players: input.min_players || 1,
                max_players: input.max_players || capacity,
                is_active: status === 'active', // Map status to is_active
                settings: {
                    ...input.settings,
                    child_price: input.child_price,
                    min_age: input.min_age,
                    slug: (input as any).slug,
                    tagline: (input as any).tagline,
                    success_rate: (input as any).success_rate
                }
            };

            console.log('Attempting to insert activity with data:', insertData);

            // 3. Insert into DB
            const { data: createdActivity, error } = await supabase
                .from('activities')
                .insert([insertData])
                .select()
                .single();

            if (error) {
                console.error('Supabase insert error:', error);
                throw error;
            }

            console.log('Activity created successfully:', createdActivity);

            // 4. Sync with Stripe (if not already synced)
            // We use the created activity which has the ID
            const stripeUpdates = await StripeIntegrationService.syncNewActivity(createdActivity as Activity);

            // 5. Update DB with Stripe details if any
            if (Object.keys(stripeUpdates).length > 0) {
                const { data: updatedActivity, error: updateError } = await supabase
                    .from('activities')
                    .update(stripeUpdates)
                    .eq('id', createdActivity.id)
                    .select()
                    .single();

                if (updateError) {
                    console.warn('Failed to update activity with Stripe details:', updateError);
                    // We don't throw here to avoid failing the whole creation, but we log it.
                    return createdActivity as Activity;
                }
                return updatedActivity as Activity;
            }

            // 6. Create Default Pricing Tiers
            if (input.price || input.child_price) {
                const { error: rpcError } = await supabase.rpc('create_default_pricing_tiers', {
                    p_game_id: createdActivity.id,
                    p_organization_id: orgId,
                    p_adult_price: input.price || 0,
                    p_child_price: input.child_price || 0
                });

                if (rpcError) {
                    console.warn('Failed to create default pricing tiers:', rpcError);
                }
            }

            return {
                ...createdActivity,
                status: createdActivity.is_active ? 'active' : 'inactive'
            } as Activity;
        } catch (error: any) {
            console.error('Error creating activity:', error);
            throw new Error(error.message || 'Failed to create activity');
        }
    }

    /**
     * Update an activity
     */
    static async updateActivity(id: string, updates: Partial<CreateActivityInput>): Promise<Activity> {
        try {
            // 1. Get current activity
            const currentActivity = await this.getActivity(id);
            if (!currentActivity) throw new Error('Activity not found');

            // 2. Sync with Stripe
            // We merge updates into current activity to check what needs syncing
            // But syncActivityUpdate expects current activity and updates separately
            const stripeUpdates = await StripeIntegrationService.syncActivityUpdate(currentActivity, updates as Partial<Activity>);

            // 3. Merge Stripe updates with regular updates
            const finalUpdates = {
                ...updates,
                ...stripeUpdates
            };

            // Map capacity if needed
            if (finalUpdates.capacity) {
                (finalUpdates as any).max_players = finalUpdates.capacity;
                delete (finalUpdates as any).capacity;
            }
            if (finalUpdates.min_players) {
                (finalUpdates as any).min_players = finalUpdates.min_players;
            }
            if (finalUpdates.child_price !== undefined) {
                finalUpdates.settings = {
                    ...currentActivity.settings,
                    ...finalUpdates.settings,
                    child_price: finalUpdates.child_price
                };
                delete (finalUpdates as any).child_price;
            }
            if (finalUpdates.min_age !== undefined) {
                finalUpdates.settings = {
                    ...currentActivity.settings,
                    ...finalUpdates.settings,
                    min_age: finalUpdates.min_age
                };
                delete (finalUpdates as any).min_age;
            }
            if ((finalUpdates as any).status) {
                (finalUpdates as any).is_active = (finalUpdates as any).status === 'active';
                delete (finalUpdates as any).status;
            }

            // 4. Update DB
            const { data, error } = await supabase
                .from('activities')
                .update(finalUpdates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return {
                ...data,
                status: data.is_active ? 'active' : 'inactive'
            } as Activity;
        } catch (error: any) {
            console.error('Error updating activity:', error);
            throw new Error(error.message || 'Failed to update activity');
        }
    }

    /**
     * Delete an activity
     */
    static async deleteActivity(id: string): Promise<void> {
        const { error } = await supabase
            .from('activities')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
