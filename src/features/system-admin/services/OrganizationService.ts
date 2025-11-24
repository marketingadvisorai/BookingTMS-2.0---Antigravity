/**
 * Organization Service
 * 
 * Handles all database operations for organizations
 * Integrates with Supabase organizations table
 */

import { supabase } from '@/lib/supabase';
import { StripeService } from './StripeService';
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
            slug,
            price_monthly,
            price_yearly,
            features,
            max_venues,
            max_staff,
            max_bookings_per_month,
            max_widgets
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
    } catch (error: any) {
      // Suppress full error object logging
      const msg = error?.message || 'Database query failed';
      console.warn('[OrganizationService] getAll failed:', msg);
      throw new Error(msg);
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
    } catch (error: any) {
      console.warn('[OrganizationService] getById failed:', error?.message);
      throw error;
    }
  }

  /**
   * Create new organization with Stripe customer and initial owner
   */
  static async create(dto: CreateOrganizationDTO): Promise<Organization> {
    try {
      // Step 1: Create organization in Supabase (UUID auto-generated)
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name: dto.name,
          owner_name: dto.owner_name,
          owner_email: dto.owner_email,
          website: dto.website,
          phone: dto.phone,
          plan_id: dto.plan_id,
          status: dto.status || 'pending',
          stripe_charges_enabled: false,
          stripe_payouts_enabled: false,
          application_fee_percentage: 0.75,
        }])
        .select()
        .single();

      if (orgError) {
        throw new Error(`Failed to create organization: ${orgError.message}`);
      }

      if (!org) {
        throw new Error('Organization created but no data returned');
      }

      // Step 2: Create Stripe customer
      let stripeCustomerId: string | null = null;
      try {
        const stripeCustomer = await StripeService.createCustomer({
          email: dto.owner_email,
          name: dto.owner_name || dto.name,
          metadata: {
            organization_id: org.id,
            organization_name: dto.name,
          },
        });
        stripeCustomerId = stripeCustomer.id;

        // Step 3: Update organization with Stripe customer ID
        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', org.id);

        if (updateError) {
          console.error('Failed to update org with Stripe ID:', updateError);
        }
      } catch (stripeError) {
        // Log but don't fail organization creation
        console.error('Stripe customer creation failed:', stripeError);
      }

      // Step 4: Create initial organization member (owner)
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { error: memberError } = await supabase
            .from('organization_members')
            .insert([{
              organization_id: org.id,
              user_id: user.id,
              role: 'owner',
              permissions: { all: true },
            }]);

          if (memberError) {
            console.error('Failed to create organization member:', memberError);
          } else {
            // Step 5: Update user's organization_id in users table
            const { error: userUpdateError } = await supabase
              .from('users')
              .update({ organization_id: org.id })
              .eq('id', user.id);

            if (userUpdateError) {
              console.error('Failed to update user organization_id:', userUpdateError);
            }
          }
        }
      } catch (memberErr) {
        // Log but don't fail organization creation
        console.error('Organization member creation failed:', memberErr);
      }

      // Return complete organization data
      return {
        ...org,
        stripe_customer_id: stripeCustomerId,
      };
    } catch (error: any) {
      console.warn('[OrganizationService] create failed:', error?.message);
      throw error;
    }
  }

  /**
   * Create new organization with a new user account (Org Admin)
   * This is used by System Admins to create a full setup at once
   */
  static async createWithUser(dto: CreateOrganizationDTO, password?: string, venueName?: string): Promise<Organization> {
    try {
      // 1. Create Auth User (if password provided)
      let userId: string | null = null;

      if (password) {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: dto.owner_email,
          password: password,
          email_confirm: true,
          user_metadata: {
            full_name: dto.owner_name,
          },
        });

        if (authError || !authData.user) {
          throw new Error(`Failed to create user: ${authError?.message}`);
        }
        userId = authData.user.id;
      }

      // 2. Create Organization
      const org = await this.create(dto);

      // 3. Create Default Venue
      const { error: venueError } = await supabase
        .from('venues')
        .insert([{
          organization_id: org.id,
          name: venueName || `${org.name} - Main Venue`,
          is_default: true,
          timezone: 'UTC',
          status: 'active'
        }]);

      if (venueError) {
        console.error('Failed to create default venue:', venueError);
      }

      // 4. Link User to Organization if user was created
      if (userId) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: dto.owner_email,
            full_name: dto.owner_name,
            role: 'org-admin', // Assign new role
            organization_id: org.id,
            phone: dto.phone || null,
            is_active: true,
          });

        if (profileError) {
          console.error('Failed to create user profile:', profileError);
        }

        // Add as organization member
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert([{
            organization_id: org.id,
            user_id: userId,
            role: 'owner',
            permissions: { all: true },
          }]);

        if (memberError) {
          console.error('Failed to link user to org:', memberError);
        }
      }

      return org;
    } catch (error: any) {
      console.error('[OrganizationService] createWithUser failed:', error);
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
    } catch (error: any) {
      console.warn('[OrganizationService] update failed:', error?.message);
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
    } catch (error: any) {
      console.warn('[OrganizationService] delete failed:', error?.message);
      throw error;
    }
  }

  /**
   * Get organization metrics
   */
  static async getMetrics(id: string): Promise<OrganizationMetrics> {
    try {
      const { data, error } = await supabase
        .rpc('get_organization_metrics', { org_id: id })
        .single();

      if (error) {
        throw new Error(`Failed to fetch metrics: ${error.message}`);
      }

      if (!data) {
        throw new Error('No metrics data returned');
      }

      return data as OrganizationMetrics;
    } catch (error: any) {
      console.warn('[OrganizationService] getMetrics failed:', error?.message);
      throw error;
    }
  }
}
