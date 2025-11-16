/**
 * Organization Service
 * 
 * Handles all database operations for organizations
 * Integrates with Supabase organizations table
 */

import { supabase } from '@/lib/supabase';
import type {
  Organization,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  OrganizationFilters,
  OrganizationListResponse,
  OrganizationMetrics,
} from '../types';

export class OrganizationService {
  /**
   * Get all organizations with optional filtering
   */
  static async getAll(
    filters?: OrganizationFilters,
    page: number = 1,
    perPage: number = 10
  ): Promise<OrganizationListResponse> {
    try {
      let query = supabase
        .from('organizations')
        .select(`
          *,
          plans:plan_id (
            id,
            name,
            price,
            billing_period,
            features,
            limits
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.plan_id) {
        query = query.eq('plan_id', filters.plan_id);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,owner_name.ilike.%${filters.search}%,owner_email.ilike.%${filters.search}%`);
      }

      if (filters?.has_stripe_account !== undefined) {
        if (filters.has_stripe_account) {
          query = query.not('stripe_account_id', 'is', null);
        } else {
          query = query.is('stripe_account_id', null);
        }
      }

      if (filters?.stripe_status) {
        query = query.eq('stripe_onboarding_status', filters.stripe_status);
      }

      // Pagination
      const start = (page - 1) * perPage;
      const end = start + perPage - 1;
      query = query.range(start, end);

      // Order by
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch organizations: ${error.message}`);
      }

      return {
        data: data || [],
        total: count || 0,
        page,
        per_page: perPage,
        total_pages: Math.ceil((count || 0) / perPage),
      };
    } catch (error) {
      console.error('OrganizationService.getAll error:', error);
      throw error;
    }
  }

  /**
   * Get single organization by ID
   */
  static async getById(id: string): Promise<Organization> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          plans:plan_id (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch organization: ${error.message}`);
      }

      if (!data) {
        throw new Error('Organization not found');
      }

      return data;
    } catch (error) {
      console.error('OrganizationService.getById error:', error);
      throw error;
    }
  }

  /**
   * Create new organization
   */
  static async create(dto: CreateOrganizationDTO): Promise<Organization> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{
          name: dto.name,
          owner_name: dto.owner_name,
          owner_email: dto.owner_email,
          website: dto.website,
          phone: dto.phone,
          plan_id: dto.plan_id,
          status: dto.status || 'active',
          stripe_charges_enabled: false,
          stripe_payouts_enabled: false,
          application_fee_percentage: 0.75,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create organization: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('OrganizationService.create error:', error);
      throw error;
    }
  }

  /**
   * Update organization
   */
  static async update(id: string, dto: UpdateOrganizationDTO): Promise<Organization> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          ...dto,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update organization: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('OrganizationService.update error:', error);
      throw error;
    }
  }

  /**
   * Delete organization
   */
  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete organization: ${error.message}`);
      }
    } catch (error) {
      console.error('OrganizationService.delete error:', error);
      throw error;
    }
  }

  /**
   * Get organization metrics
   */
  static async getMetrics(id: string): Promise<OrganizationMetrics> {
    try {
      // This would call a database function
      const { data, error } = await supabase
        .rpc('get_organization_metrics', { org_id: id });

      if (error) {
        throw new Error(`Failed to fetch metrics: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('OrganizationService.getMetrics error:', error);
      // Return empty metrics if function doesn't exist yet
      return {
        total_venues: 0,
        active_venues: 0,
        total_games: 0,
        total_bookings: 0,
        confirmed_bookings: 0,
        pending_bookings: 0,
        canceled_bookings: 0,
        total_revenue: 0,
        mrr: 0,
        average_booking_value: 0,
        total_users: 0,
        active_users: 0,
        storage_used_gb: 0,
        storage_limit_gb: 100,
        period_start: new Date().toISOString(),
        period_end: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        organization_id: id,
      };
    }
  }
}
