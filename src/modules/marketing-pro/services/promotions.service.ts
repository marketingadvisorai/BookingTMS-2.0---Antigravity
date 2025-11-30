/**
 * MarketingPro 1.1 - Promotions Service
 * @description CRUD operations for promotions/discount codes with multi-tenant support
 */

import { supabase } from '@/lib/supabase';
import type { Promotion } from '../types';

export interface CreatePromotionInput {
  organization_id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'free_add_on';
  discount_value: number;
  min_purchase?: number;
  max_uses?: number;
  valid_from?: string;
  valid_until?: string;
  applicable_activities?: string[];
  applicable_venues?: string[];
}

export interface UpdatePromotionInput extends Partial<CreatePromotionInput> {
  is_active?: boolean;
}

/**
 * Promotions service with multi-tenant organization scoping
 */
export const PromotionsService = {
  /**
   * List all promotions for an organization
   */
  async listByOrganization(organizationId: string): Promise<Promotion[]> {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch promotions: ${error.message}`);
    return data || [];
  },

  /**
   * Get a single promotion by ID
   */
  async getById(id: string): Promise<Promotion | null> {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch promotion: ${error.message}`);
    return data;
  },

  /**
   * Validate a promo code for an organization
   */
  async validateCode(organizationId: string, code: string): Promise<Promotion | null> {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    // Check if promo is within valid date range
    const now = new Date();
    if (data.valid_from && new Date(data.valid_from) > now) return null;
    if (data.valid_until && new Date(data.valid_until) < now) return null;

    // Check if max uses reached
    if (data.max_uses && data.current_uses >= data.max_uses) return null;

    return data;
  },

  /**
   * Create a new promotion
   */
  async create(input: CreatePromotionInput): Promise<Promotion> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('promotions')
      .insert({
        ...input,
        code: input.code.toUpperCase(),
        created_by: user?.user?.id,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create promotion: ${error.message}`);
    return data;
  },

  /**
   * Update an existing promotion
   */
  async update(id: string, input: UpdatePromotionInput): Promise<Promotion> {
    const updateData: Record<string, unknown> = { ...input, updated_at: new Date().toISOString() };
    if (input.code) updateData.code = input.code.toUpperCase();

    const { data, error } = await supabase
      .from('promotions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update promotion: ${error.message}`);
    return data;
  },

  /**
   * Delete a promotion
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete promotion: ${error.message}`);
  },

  /**
   * Increment usage count when promo is applied
   */
  async incrementUsage(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_promo_usage', { promo_id: id });
    if (error) {
      // Fallback to direct update if RPC doesn't exist
      await supabase
        .from('promotions')
        .update({ current_uses: supabase.rpc('increment', { row_id: id }) as unknown as number })
        .eq('id', id);
    }
  },

  /**
   * Get promotion statistics for dashboard
   */
  async getStats(organizationId: string) {
    const { data, error } = await supabase
      .from('promotions')
      .select('id, is_active, current_uses')
      .eq('organization_id', organizationId);

    if (error) throw new Error(`Failed to fetch promotion stats: ${error.message}`);

    const promos = (data || []) as Promotion[];
    return {
      total: promos.length,
      active: promos.filter(p => p.is_active).length,
      totalRedemptions: promos.reduce((sum, p) => sum + (p.current_uses || 0), 0),
    };
  },

  /**
   * Sync a promotion with Stripe (create coupon + promo code)
   */
  async syncWithStripe(promotionId: string): Promise<{ success: boolean; couponId?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('stripe-manage-promotion', {
        body: {
          action: 'sync_promotion',
          promotionId,
        },
      });

      if (error) throw new Error(error.message);
      return data;
    } catch (err) {
      console.error('Failed to sync promotion with Stripe:', err);
      throw err;
    }
  },

  /**
   * Create promotion and sync to Stripe in one operation
   */
  async createAndSync(input: CreatePromotionInput): Promise<Promotion> {
    // First create the promotion
    const promo = await this.create(input);

    // Then sync with Stripe
    try {
      await this.syncWithStripe(promo.id);
    } catch (err) {
      console.warn('Promotion created but Stripe sync failed:', err);
      // Promotion still exists, sync can be retried
    }

    // Fetch updated promotion with Stripe IDs
    return (await this.getById(promo.id)) as Promotion;
  },

  /**
   * Delete promotion and remove from Stripe
   */
  async deleteWithStripe(id: string, organizationId: string): Promise<void> {
    // First remove from Stripe
    try {
      await supabase.functions.invoke('stripe-manage-promotion', {
        body: {
          action: 'delete_coupon',
          promotionId: id,
          organizationId,
        },
      });
    } catch (err) {
      console.warn('Failed to delete from Stripe:', err);
    }

    // Then delete from database
    await this.delete(id);
  },
};
