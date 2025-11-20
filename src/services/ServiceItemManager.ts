/**
 * Service Item Manager
 * Handles all database interactions for Service Items (formerly Games)
 * Follows the Service Layer pattern to decouple UI from Data
 * Implements the "Polymorphic Strategy" for multi-niche support
 */

import { supabase } from '../lib/supabase';
import { StripeProductService } from '../lib/stripe/stripeProductService';
import { toast } from 'sonner';

export interface ServiceItem {
    id: string;
    organization_id?: string;
    organization_name?: string;
    venue_id: string;
    venue_name?: string;
    calendar_id?: string;
    name: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert'; // Kept for backward compatibility, can be used as "Complexity"
    duration: number; // in minutes
    min_players: number; // Can be interpreted as "min_participants"
    max_players: number; // Can be interpreted as "max_participants"
    price: number;
    image_url?: string;
    status: 'active' | 'inactive' | 'maintenance';
    settings: Record<string, any>;
    created_by: string;
    created_at: string;
    updated_at: string;
    // Stripe integration fields
    stripe_product_id?: string;
    stripe_price_id?: string;
    stripe_prices?: any[];
    stripe_checkout_url?: string;
    stripe_sync_status?: string;
    stripe_last_sync?: string;
    stripe_metadata?: Record<string, any>;
    price_lookup_key?: string;
    active_price_id?: string;
    price_history?: any[];
    // Pricing tiers (will be fetched separately)
    pricing_tiers?: any[];
    child_price?: number; // Backwards compatibility
    // Schedule fields (stored in schedule JSONB column)
    schedule?: {
        operatingDays: string[];
        startTime: string;
        endTime: string;
        slotInterval: number;
        advanceBooking: number;
        customHoursEnabled: boolean;
        customHours: Record<string, { enabled: boolean; startTime: string; endTime: string }>;
        customDates: Array<{ id: string; date: string; startTime: string; endTime: string }>;
        blockedDates: Array<string | { date: string; startTime: string; endTime: string; reason?: string }>;
    };
    // Flattened schedule fields for easier access (UI convenience)
    operatingDays?: string[];
    startTime?: string;
    endTime?: string;
    slotInterval?: number;
    advanceBooking?: number;
    customHoursEnabled?: boolean;
    customHours?: Record<string, { enabled: boolean; startTime: string; endTime: string }>;
    customDates?: Array<{ id: string; date: string; startTime: string; endTime: string }>;
    blockedDates?: Array<string | { date: string; startTime: string; endTime: string; reason?: string }>;
}

export class ServiceItemManager {
    /**
     * Fetch all service items for a specific venue
     */
    static async getServiceItems(venueId?: string): Promise<ServiceItem[]> {
        try {
            let query = supabase
                .from('games') // Mapping to 'games' table
                .select('*')
                .order('created_at', { ascending: false });

            if (venueId) {
                query = query.eq('venue_id', venueId);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Unpack schedule data from JSONB column to flat structure for UI consumption
            return (data || []).map(item => ({
                ...item,
                operatingDays: item.schedule?.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                startTime: item.schedule?.startTime || '10:00',
                endTime: item.schedule?.endTime || '22:00',
                slotInterval: item.schedule?.slotInterval || 60,
                advanceBooking: item.schedule?.advanceBooking || 30,
                customHoursEnabled: item.schedule?.customHoursEnabled || false,
                customHours: item.schedule?.customHours || {},
                customDates: item.schedule?.customDates || [],
                blockedDates: item.schedule?.blockedDates || []
            }));
        } catch (error: any) {
            console.error('Error fetching service items:', error);
            throw new Error(error.message || 'Failed to fetch service items');
        }
    }

    /**
     * Get a single service item by ID
     */
    static async getServiceItemById(id: string): Promise<ServiceItem | null> {
        try {
            const { data, error } = await supabase
                .from('games')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (!data) return null;

            // Unpack schedule
            return {
                ...data,
                operatingDays: data.schedule?.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                startTime: data.schedule?.startTime || '10:00',
                endTime: data.schedule?.endTime || '22:00',
                slotInterval: data.schedule?.slotInterval || 60,
                advanceBooking: data.schedule?.advanceBooking || 30,
                customHoursEnabled: data.schedule?.customHoursEnabled || false,
                customHours: data.schedule?.customHours || {},
                customDates: data.schedule?.customDates || [],
                blockedDates: data.schedule?.blockedDates || []
            };
        } catch (error: any) {
            console.error('Error fetching service item:', error);
            throw new Error(error.message || 'Failed to fetch service item');
        }
    }

    /**
     * Create a new service item
     */
    static async createServiceItem(itemData: Omit<ServiceItem, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<ServiceItem> {
        let stripeProductId: string | null = null;
        let stripePriceId: string | null = null;
        let venueData: any = null;

        try {
            // 1. Validate venue_id
            if (!itemData.venue_id) {
                throw new Error('Venue ID is required to create a service item');
            }

            // 2. Fetch venue data (needed for Stripe metadata)
            const { data: fetchedVenueData } = await supabase
                .from('venues')
                .select('organization_id, organization_name, name, id')
                .eq('id', itemData.venue_id)
                .single();

            venueData = fetchedVenueData;

            // 3. Handle Stripe Product Creation
            if (itemData.stripe_product_id && itemData.stripe_price_id) {
                // Already created in wizard
                stripeProductId = itemData.stripe_product_id;
                stripePriceId = itemData.stripe_price_id;
            } else if (itemData.price && itemData.price > 0) {
                // Auto-create if not already present
                try {
                    const lookupKey = `${venueData?.organization_id || 'org'}_${itemData.venue_id}_${Date.now()}_default`
                        .toLowerCase()
                        .replace(/[^a-z0-9_-]/g, '_')
                        .substring(0, 250);

                    const { productId, priceId } = await StripeProductService.createProductAndPrice({
                        name: itemData.name,
                        description: itemData.description || `${itemData.name} - ${itemData.duration} minutes`,
                        price: itemData.price,
                        currency: 'usd',
                        metadata: {
                            service_name: itemData.name, // Changed from game_name
                            venue_id: itemData.venue_id,
                            venue_name: venueData?.name || '',
                            organization_id: venueData?.organization_id || '',
                            organization_name: venueData?.organization_name || '',
                            duration: itemData.duration.toString(),
                            difficulty: itemData.difficulty,
                            image_url: itemData.image_url || '',
                            lookup_key: lookupKey,
                        },
                    });

                    stripeProductId = productId;
                    stripePriceId = priceId;
                } catch (stripeError) {
                    console.warn('Stripe product creation failed (non-blocking):', stripeError);
                    // Continue without Stripe
                }
            }

            // 4. Get Current User
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id || null;

            // 5. Prepare Schedule Data
            const schedule = {
                operatingDays: (itemData as any).operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                startTime: (itemData as any).startTime || '10:00',
                endTime: (itemData as any).endTime || '22:00',
                slotInterval: (itemData as any).slotInterval || 60,
                advanceBooking: (itemData as any).advanceBooking || 30,
                customHoursEnabled: (itemData as any).customHoursEnabled || false,
                customHours: (itemData as any).customHours || {},
                customDates: (itemData as any).customDates || [],
                blockedDates: (itemData as any).blockedDates || []
            };

            // 6. Clean Data for Insert
            const {
                operatingDays, startTime, endTime, slotInterval, advanceBooking,
                customHoursEnabled, customHours, customDates, blockedDates,
                ...cleanedItemData
            } = itemData as any;

            const insertData = {
                ...cleanedItemData,
                schedule,
                created_by: userId,
                stripe_product_id: stripeProductId,
                stripe_price_id: stripePriceId,
                active_price_id: stripePriceId,
                stripe_sync_status: stripeProductId ? 'synced' : 'pending',
                stripe_last_sync: stripeProductId ? new Date().toISOString() : null,
            };

            // 7. Insert into Supabase
            const { data, error: insertError } = await supabase
                .from('games')
                .insert([insertData])
                .select()
                .single();

            if (insertError) throw insertError;

            // 8. Create Default Pricing Tiers (Optional)
            try {
                const childPrice = (itemData as any).child_price || (itemData as any).childPrice;
                if (childPrice && childPrice > 0) {
                    await supabase.rpc('create_default_pricing_tiers', {
                        p_game_id: data.id, // keeping p_game_id as RPC parameter name likely hasn't changed
                        p_organization_id: venueData?.organization_id,
                        p_adult_price: itemData.price,
                        p_child_price: childPrice
                    });
                }
            } catch (e) {
                console.warn('Pricing tiers creation failed', e);
            }

            // 9. Update Stripe Metadata with Item ID
            if (stripeProductId) {
                try {
                    await StripeProductService.updateProductMetadata(stripeProductId, {
                        service_item_id: data.id, // Changed from game_id, but we might want to keep game_id for backward compat if needed, or add both
                        game_id: data.id, // Keeping for backward compatibility
                    });
                } catch (e) {
                    console.warn('Stripe metadata update failed', e);
                }
            }

            return data;
        } catch (error: any) {
            console.error('Error creating service item:', error);
            // Rollback Stripe if needed
            if (stripeProductId) {
                await StripeProductService.archiveProduct(stripeProductId).catch(console.error);
            }
            throw new Error(error.message || 'Failed to create service item');
        }
    }

    /**
     * Update an existing service item
     */
    static async updateServiceItem(id: string, updates: Partial<ServiceItem>): Promise<ServiceItem> {
        try {
            // 1. Get current item to check for Stripe updates
            const currentItem = await this.getServiceItemById(id);
            if (!currentItem) throw new Error('Service item not found');

            // 2. Handle Stripe Updates
            const needsStripeUpdate = updates.name || updates.description || updates.price;
            if (needsStripeUpdate && currentItem.stripe_product_id) {
                try {
                    if (updates.name || updates.description) {
                        await StripeProductService.updateProduct(currentItem.stripe_product_id, {
                            name: updates.name,
                            description: updates.description,
                        });
                    }

                    if (updates.price && StripeProductService.priceHasChanged(currentItem.price, updates.price)) {
                        // Logic for price update (lookup key vs new price)
                        if (currentItem.price_lookup_key) {
                            const newPriceId = await StripeProductService.updatePriceByLookupKey(
                                currentItem.price_lookup_key,
                                updates.price,
                                currentItem.stripe_product_id
                            );
                            updates.stripe_price_id = newPriceId;
                            updates.active_price_id = newPriceId;
                        } else {
                            const newPriceId = await StripeProductService.createPrice(
                                currentItem.stripe_product_id,
                                { amount: updates.price, currency: 'usd' }
                            );
                            updates.stripe_price_id = newPriceId;
                            updates.active_price_id = newPriceId;
                        }
                    }
                    updates.stripe_sync_status = 'synced';
                    updates.stripe_last_sync = new Date().toISOString();
                } catch (e) {
                    console.warn('Stripe update failed', e);
                    toast.error('Failed to sync with Stripe, but local changes will be saved.');
                }
            }

            // 3. Handle Schedule Updates
            const scheduleFields = ['operatingDays', 'startTime', 'endTime', 'slotInterval', 'advanceBooking', 'customHoursEnabled', 'customHours', 'customDates', 'blockedDates'];
            const hasScheduleUpdate = scheduleFields.some(field => (updates as any)[field] !== undefined);

            if (hasScheduleUpdate) {
                const updatedSchedule = {
                    operatingDays: (updates as any).operatingDays || currentItem.schedule?.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                    startTime: (updates as any).startTime || currentItem.schedule?.startTime || '10:00',
                    endTime: (updates as any).endTime || currentItem.schedule?.endTime || '22:00',
                    slotInterval: (updates as any).slotInterval || currentItem.schedule?.slotInterval || 60,
                    advanceBooking: (updates as any).advanceBooking || currentItem.schedule?.advanceBooking || 30,
                    customHoursEnabled: (updates as any).customHoursEnabled !== undefined ? (updates as any).customHoursEnabled : currentItem.schedule?.customHoursEnabled || false,
                    customHours: (updates as any).customHours || currentItem.schedule?.customHours || {},
                    customDates: (updates as any).customDates || currentItem.schedule?.customDates || [],
                    blockedDates: (updates as any).blockedDates || currentItem.schedule?.blockedDates || []
                };

                // Clean up flat fields
                scheduleFields.forEach(field => delete (updates as any)[field]);
                (updates as any).schedule = updatedSchedule;
            }

            // 4. Update Supabase
            const { data, error } = await supabase
                .from('games')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error: any) {
            console.error('Error updating service item:', error);
            throw new Error(error.message || 'Failed to update service item');
        }
    }

    /**
     * Delete a service item
     */
    static async deleteServiceItem(id: string): Promise<void> {
        try {
            // 1. Check for bookings
            const { data: bookings } = await supabase
                .from('bookings')
                .select('id')
                .eq('game_id', id) // keeping game_id as column name likely hasn't changed
                .limit(1);

            if (bookings && bookings.length > 0) {
                throw new Error('Service item has existing bookings. Archive it instead.');
            }

            // 2. Delete from Supabase
            const { error } = await supabase
                .from('games')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error: any) {
            console.error('Error deleting service item:', error);
            throw new Error(error.message || 'Failed to delete service item');
        }
    }
}
