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
      let query = supabase
        .from('plans')
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
        (data || []).map(async (plan) => {
          const { count } = await supabase
            .from('organizations')
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
    } catch (error) {
      console.error('PlanService.getAll error:', error);
      throw error;
    }
  }

  /**
   * Get single plan by ID
   */
  static async getById(id: string): Promise<Plan> {
    try {
      const { data, error } = await supabase
        .from('plans')
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
      const { count } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', id)
        .eq('status', 'active');

      return {
        ...data,
        subscriber_count: count || 0,
      };
    } catch (error) {
      console.error('PlanService.getById error:', error);
      throw error;
    }
  }

  /**
   * Create new plan
   */
  static async create(dto: CreatePlanDTO): Promise<Plan> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .insert([{
          name: dto.name,
          description: dto.description,
          price: dto.price,
          currency: dto.currency || 'USD',
          billing_period: dto.billing_period,
          features: dto.features,
          limits: dto.limits,
          is_featured: dto.is_featured || false,
          display_order: dto.display_order || 999,
          color: dto.color,
          is_active: true,
          is_visible: true,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create plan: ${error.message}`);
      }

      return { ...data, subscriber_count: 0 };
    } catch (error) {
      console.error('PlanService.create error:', error);
      throw error;
    }
  }

  /**
   * Update plan
   */
  static async update(id: string, dto: UpdatePlanDTO): Promise<Plan> {
    try {
      const { data, error } = await supabase
        .from('plans')
        .update({
          ...dto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update plan: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('PlanService.update error:', error);
      throw error;
    }
  }

  /**
   * Delete plan (soft delete by marking inactive)
   */
  static async delete(id: string): Promise<void> {
    try {
      // Check if any organizations are using this plan
      const { count } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', id)
        .eq('status', 'active');

      if (count && count > 0) {
        throw new Error(`Cannot delete plan: ${count} active organizations are using it`);
      }

      // Soft delete
      const { error } = await supabase
        .from('plans')
        .update({
          is_active: false,
          is_visible: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete plan: ${error.message}`);
      }
    } catch (error) {
      console.error('PlanService.delete error:', error);
      throw error;
    }
  }

  /**
   * Get plan statistics
   */
  static async getStats(id: string): Promise<PlanStats> {
    try {
      // Get subscriber count
      const { count: subscriberCount } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', id)
        .eq('status', 'active');

      // Get plan details for MRR calculation
      const plan = await this.getById(id);
      
      const monthlyPrice = plan.billing_period === 'annual' 
        ? plan.price / 12 
        : plan.price;

      const mrr = monthlyPrice * (subscriberCount || 0);
      const arr = mrr * 12;

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
    } catch (error) {
      console.error('PlanService.getStats error:', error);
      throw error;
    }
  }
}
