import { StripeProductService } from '../lib/stripe/stripeProductService';
import { Activity } from '../modules/inventory/services/activity.service';
import { supabase } from '../lib/supabase';

export class StripeIntegrationService {
    /**
     * Syncs a newly created activity to Stripe.
     * Creates a product and price if they don't exist, or updates metadata if they do.
     * Returns the fields to update on the activity record.
     */
    static async syncNewActivity(activity: Activity): Promise<Partial<Activity>> {
        const updates: Partial<Activity> = {};

        try {
            // If already has stripe IDs (e.g. from wizard), just update metadata
            if (activity.stripe_product_id && activity.stripe_price_id) {
                await this.updateStripeMetadata(activity);
                updates.stripe_sync_status = 'synced';
                updates.stripe_last_sync = new Date().toISOString();
                return updates;
            }

            // If no price, we might skip Stripe creation? 
            // Or create a free product? 
            // ServiceItemManager skipped if price <= 0.
            if (!activity.price || activity.price <= 0) {
                return {};
            }

            // Fetch venue data for metadata
            const { data: venueData } = await (supabase as any)
                .from('venues')
                .select('organization_id, organization_name, name')
                .eq('id', activity.venue_id)
                .single();

            const lookupKey = `${venueData?.organization_id || 'org'}_${activity.venue_id}_${Date.now()}_default`
                .toLowerCase()
                .replace(/[^a-z0-9_-]/g, '_')
                .substring(0, 250);

            const { productId, priceId } = await StripeProductService.createProductAndPrice({
                name: activity.name,
                description: activity.description || `${activity.name} - ${activity.duration} minutes`,
                price: activity.price,
                currency: 'usd',
                metadata: {
                    service_name: activity.name,
                    service_item_id: activity.id, // New ID
                    game_id: activity.id, // Legacy ID
                    venue_id: activity.venue_id,
                    venue_name: venueData?.name || '',
                    organization_id: venueData?.organization_id || '',
                    organization_name: venueData?.organization_name || '',
                    duration: activity.duration.toString(),
                    difficulty: activity.difficulty || '',
                    image_url: activity.image_url || '',
                    lookup_key: lookupKey,
                },
            });

            updates.stripe_product_id = productId;
            updates.stripe_price_id = priceId;
            updates.stripe_sync_status = 'synced';
            updates.stripe_last_sync = new Date().toISOString();

            // Also set active_price_id if your schema uses it
            // updates.active_price_id = priceId; 

            return updates;

        } catch (error) {
            console.error('Stripe sync failed for new activity:', error);
            // We return what we have, maybe set status to error
            updates.stripe_sync_status = 'error';
            return updates;
        }
    }

    /**
     * Syncs updates to an existing activity to Stripe.
     */
    static async syncActivityUpdate(
        currentActivity: Activity,
        updates: Partial<Activity>
    ): Promise<Partial<Activity>> {
        const resultUpdates: Partial<Activity> = {};

        if (!currentActivity.stripe_product_id) {
            // If it doesn't have a product yet, maybe we should create one if price is added?
            // For now, we follow ServiceItemManager logic: only update if exists.
            return {};
        }

        const needsUpdate = updates.name || updates.description || updates.price;
        if (!needsUpdate) return {};

        try {
            if (updates.name || updates.description) {
                await StripeProductService.updateProduct(currentActivity.stripe_product_id, {
                    name: updates.name,
                    description: updates.description,
                });
            }

            if (updates.price !== undefined && StripeProductService.priceHasChanged(currentActivity.price, updates.price)) {
                // Logic for price update
                // We check if there is a lookup key to update, or create a new price
                // Since we don't have price_lookup_key in Activity interface yet (maybe?), 
                // we'll assume we might need to fetch it or just create a new price.

                // ServiceItemManager used currentItem.price_lookup_key.
                // If Activity doesn't store it, we might need to create a new price.

                const newPriceId = await StripeProductService.createPrice(
                    currentActivity.stripe_product_id,
                    { amount: updates.price, currency: 'usd' }
                );

                resultUpdates.stripe_price_id = newPriceId;
            }

            resultUpdates.stripe_sync_status = 'synced';
            resultUpdates.stripe_last_sync = new Date().toISOString();

        } catch (error) {
            console.error('Stripe sync failed for update:', error);
            // Non-blocking error
        }

        return resultUpdates;
    }

    private static async updateStripeMetadata(activity: Activity) {
        if (!activity.stripe_product_id) return;

        try {
            await StripeProductService.updateProductMetadata(activity.stripe_product_id, {
                service_item_id: activity.id,
                game_id: activity.id,
            });
        } catch (e) {
            console.warn('Stripe metadata update failed', e);
        }
    }
}
