/**
 * Plan Service
 * 
 * Handles all database operations for subscription plans
 * Integrates with Supabase plans table
 */

import { supabase } from '@/lib/supabase';
import type {
  Plan,
  CreatePlanDTO,
  UpdatePlanDTO,
  PlanStats,
} from '../types';

export class PlanService {
  /**
   * Get all plans
   */
  static async getAll(activeOnly: boolean = false): Promise<Plan[]> {
    try {
      let query = (supabase
        .from('plans') as any)
        .select('*')
        .order('display_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch plans: ${error.message}`);
      }

      // Get subscriber count for each plan
      const plansWithCounts = await Promise.all(
        (data || []).map(async (plan: any) => {
          const { count } = await (supabase
            .from('organizations') as any)
            .select('*', { count: 'exact', head: true })
            .eq('plan_id', plan.id)
            .eq('status', 'active');

          return {
            ...plan,
            subscriber_count: count || 0,
          };
        })
      );

      return plansWithCounts;
    } catch (error: any) {
      console.warn('[PlanService] getAll failed:', error?.message || 'Database query failed');
      throw new Error(error?.message || 'Failed to fetch plans');
    }
  }

  /**
   * Get single plan by ID
   */
  static async getById(id: string): Promise<Plan> {
    try {
      const { data, error } = await (supabase
        .from('plans') as any)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch plan: ${error.message}`);
      }

      if (!data) {
        throw new Error('Plan not found');
      }

      // Get subscriber count
      const { count } = await (supabase
        .from('organizations') as any)
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', id)
        .eq('status', 'active');

      return {
        ...data,
        subscriber_count: count || 0,
      };
    } catch (error: any) {
      console.warn('[PlanService] getById failed:', error?.message);
      throw error;
    }
  }

  /**
   * Create new plan
   */
  static async create(dto: CreatePlanDTO): Promise<Plan> {
    try {
      const { data, error } = await (supabase
        .from('plans') as any)
        .insert([{
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          price_monthly: dto.price_monthly,
          price_yearly: dto.price_yearly,
          stripe_product_id: dto.stripe_product_id,
          max_venues: dto.max_venues,
          max_staff: dto.max_staff,
          max_bookings_per_month: dto.max_bookings_per_month,
          max_games: dto.max_games,
          features: dto.features,
          is_active: dto.is_active ?? true,
          is_visible: dto.is_visible ?? true,
          sort_order: dto.sort_order ?? 999,
        } as any])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create plan: ${error.message}`);
      }

      return { ...data, subscriber_count: 0 };
    } catch (error: any) {
      console.warn('[PlanService] create failed:', error?.message);
      throw error;
    }
  }

  /**
   * Update plan
   */
  static async update(id: string, dto: UpdatePlanDTO): Promise<Plan> {
    try {
      const { data, error } = await (supabase
        .from('plans') as any)
        .update({
          ...dto,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update plan: ${error.message}`);
      }

      return data;
    } catch (error: any) {
      console.warn('[PlanService] update failed:', error?.message);
      throw error;
    }
  }

  /**
   * Delete plan (soft delete by marking inactive)
   */
  static async delete(id: string): Promise<void> {
    try {
      // Check if any organizations are using this plan
      const { count } = await (supabase
        .from('organizations') as any)
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', id)
        .eq('status', 'active');

      if (count && count > 0) {
        throw new Error(`Cannot delete plan: ${count} active organizations are using it`);
      }

      // Soft delete
      const { error } = await (supabase
        .from('plans') as any)
        .update({
          is_active: false,
          is_visible: false,
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete plan: ${error.message}`);
      }
    } catch (error: any) {
      console.warn('[PlanService] delete failed:', error?.message);
      throw error;
    }
  }

  /**
   * Get plan statistics
   */
  static async getStats(id: string): Promise<PlanStats> {
    try {
      // Get subscriber count
      const { count: subscriberCount } = await (supabase
        .from('organizations') as any)
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', id)
        .eq('status', 'active');

      // Get plan details for MRR calculation
      const plan = await this.getById(id);

      const monthlyPrice = plan.price_monthly;
      const yearlyPrice = plan.price_yearly;

      const mrr = monthlyPrice * (subscriberCount || 0);
      const arr = yearlyPrice * (subscriberCount || 0);

      // TODO: Calculate growth and churn from historical data
      const growthRate = 0;
      const churnRate = 0;

      return {
        subscriber_count: subscriberCount || 0,
        mrr,
        arr,
        growth_rate: growthRate,
        churn_rate: churnRate,
      };
    } catch (error: any) {
      console.warn('[PlanService] getStats failed:', error?.message);
      throw error;
    }
  }
}
