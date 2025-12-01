/**
 * Organization Service
 * 
 * Handles all database operations for organizations
 * Integrates with Supabase organizations table
 */

import { supabase } from '@/lib/supabase';
import { StripeService } from './StripeService';
import { normalizeUrl } from '../utils/validators';
import type {
  Organization,
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  OrganizationFilters,
  OrganizationListResponse,
  OrganizationMetrics,
} from '../types';

/**
 * Generate a URL-safe slug from a name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Date.now().toString(36);
}

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
      // First try simple query to ensure data loads
      let query = supabase
        .from('organizations')
        .select(`
          *,
          plan:plans!organizations_plan_id_fkey (
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
          ),
          venues (count),
          activities (count)
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
      // Log full error for debugging
      console.error('[OrganizationService] getAll error:', error);
      const msg = error?.message || error?.code || 'Database query failed';
      
      // Try fallback simple query without joins
      try {
        console.log('[OrganizationService] Trying fallback query...');
        const { data, error: fallbackError, count } = await supabase
          .from('organizations')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range((page - 1) * perPage, page * perPage - 1);
        
        if (fallbackError) throw fallbackError;
        
        return {
          data: data || [],
          total: count || 0,
          page,
          per_page: perPage,
          total_pages: Math.ceil((count || 0) / perPage),
        };
      } catch (fallbackErr: any) {
        console.error('[OrganizationService] Fallback also failed:', fallbackErr);
        throw new Error(msg);
      }
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
          plan:plan_id (*)
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
      // Step 1: Create organization using RPC function (bypasses RLS issues)
      const slug = generateSlug(dto.name);
      
      const { data: orgId, error: rpcError } = await (supabase.rpc as any)('admin_create_organization', {
        p_name: dto.name,
        p_slug: slug,
        p_owner_name: dto.owner_name,
        p_owner_email: dto.owner_email,
        p_website: dto.website ? normalizeUrl(dto.website) : null,
        p_phone: dto.phone || null,
        p_address: dto.address || null,
        p_city: dto.city || null,
        p_state: dto.state || null,
        p_zip: dto.zip || null,
        p_country: dto.country || 'United States',
        p_plan_id: dto.plan_id || null,
        p_status: dto.status || 'pending',
      });

      if (rpcError) {
        console.error('[OrganizationService] RPC create error:', rpcError);
        throw new Error(`Failed to create organization: ${rpcError.message}`);
      }

      if (!orgId) {
        throw new Error('Organization created but no ID returned');
      }

      // Fetch the created organization
      const { data: org, error: fetchError } = await (supabase
        .from('organizations') as any)
        .select('*')
        .eq('id', orgId)
        .single();

      if (fetchError || !org) {
        console.error('[OrganizationService] Fetch after create error:', fetchError);
        throw new Error('Organization created but failed to fetch details');
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
        const { error: updateError } = await (supabase
          .from('organizations') as any)
          .update({
            stripe_customer_id: stripeCustomerId,
            updated_at: new Date().toISOString(),
          } as any)
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
          const { error: memberError } = await (supabase
            .from('organization_members') as any)
            .insert([{
              organization_id: org.id,
              user_id: user.id,
              role: 'owner',
              permissions: { all: true },
            } as any]);

          if (memberError) {
            console.error('Failed to create organization member:', memberError);
          } else {
            // Step 5: Update user's organization_id in users table
            const { error: userUpdateError } = await (supabase
              .from('users') as any)
              .update({ organization_id: org.id } as any)
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

      // Step 5: Create default venue for the organization
      if (dto.create_default_venue !== false) {
        try {
          const venueName = `${org.name} - Main Location`;
          const venueSlug = venueName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
          const { data: venue, error: venueError } = await (supabase
            .from('venues') as any)
            .insert([{
              organization_id: org.id,
              name: venueName,
              slug: venueSlug,
              is_default: true, // Mark as default venue
              timezone: 'America/New_York',
              status: 'active',
              primary_color: '#2563eb',
              address: dto.address || '',
              city: dto.city || '',
              state: dto.state || '',
              zip: dto.zip || '',
              country: dto.country || 'United States',
              settings: { type: 'escape-room' },
            } as any])
            .select()
            .single();

          if (venueError) {
            console.error('Failed to create default venue:', venueError);
          } else {
            console.log('Default venue created:', venue?.id);
          }
        } catch (venueErr) {
          console.error('Exception creating default venue:', venueErr);
        }
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
      const org = await this.create({ ...dto, create_default_venue: false });

      // 3. Create Default Venue
      const defaultVenueName = venueName || `${org.name} - Main Venue`;
      const defaultVenueSlug = defaultVenueName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
      const { error: venueError } = await (supabase
        .from('venues') as any)
        .insert([{
          organization_id: org.id,
          name: defaultVenueName,
          slug: defaultVenueSlug,
          is_default: true, // Mark as default venue
          timezone: 'America/New_York',
          status: 'active',
          primary_color: '#2563eb',
          address: dto.address || '',
          city: dto.city || '',
          state: dto.state || '',
          zip: dto.zip || '',
          country: dto.country || 'United States',
          settings: { type: 'escape-room' },
        } as any]);

      if (venueError) {
        console.error('Failed to create default venue:', venueError);
      }

      // 4. Link User to Organization if user was created
      if (userId) {
        // Create user profile
        const { error: profileError } = await (supabase
          .from('users') as any)
          .insert({
            id: userId,
            email: dto.owner_email,
            full_name: dto.owner_name,
            role: 'org-admin', // Assign new role
            organization_id: org.id,
            phone: dto.phone || null,
            is_active: true,
          } as any);

        if (profileError) {
          console.error('Failed to create user profile:', profileError);
        }

        // Add as organization member
        const { error: memberError } = await (supabase
          .from('organization_members') as any)
          .insert([{
            organization_id: org.id,
            user_id: userId,
            role: 'owner',
            permissions: { all: true },
          } as any]);

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
   * Uses RPC function to bypass RLS issues
   */
  static async update(id: string, dto: UpdateOrganizationDTO): Promise<Organization> {
    try {
      console.log('[OrganizationService] Updating organization via RPC:', id);

      // Call RPC function to update
      const { error: rpcError } = await (supabase.rpc as any)('admin_update_organization', {
        p_org_id: id,
        p_name: dto.name || null,
        p_owner_name: dto.owner_name || null,
        p_owner_email: dto.owner_email || null,
        p_website: dto.website ? normalizeUrl(dto.website) : null,
        p_phone: dto.phone || null,
        p_address: dto.address || null,
        p_city: dto.city || null,
        p_state: dto.state || null,
        p_zip: dto.zip || null,
        p_country: dto.country || null,
        p_plan_id: dto.plan_id || null,
        p_status: dto.status || null,
        p_application_fee_percentage: dto.application_fee_percentage ?? null,
      });

      if (rpcError) {
        console.error('[OrganizationService] RPC update error:', rpcError);
        throw new Error(`Failed to update organization: ${rpcError.message}`);
      }

      // Fetch updated organization
      const { data, error: fetchError } = await (supabase
        .from('organizations') as any)
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !data) {
        console.error('[OrganizationService] fetch after update error:', fetchError);
        throw new Error('Organization updated but failed to fetch details');
      }

      return data;
    } catch (error: any) {
      console.error('[OrganizationService] update failed:', error?.message);
      throw error;
    }
  }

  /**
   * Delete organization and all related data
   * Uses RPC function to bypass RLS and handle cascading deletes
   */
  static async delete(id: string): Promise<void> {
    try {
      console.log('[OrganizationService] Deleting organization via RPC:', id);

      const { data, error } = await (supabase.rpc as any)('admin_delete_organization', {
        p_org_id: id,
      });

      if (error) {
        console.error('[OrganizationService] RPC delete error:', error);
        throw new Error(`Failed to delete organization: ${error.message}`);
      }

      console.log('[OrganizationService] Organization deleted successfully:', id);
    } catch (error: any) {
      console.error('[OrganizationService] delete failed:', error?.message);
      throw new Error(`Failed to delete organization: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Create org admin user via Edge Function
   * Returns user credentials, reset link, and email status
   */
  static async createOrgAdmin(params: {
    organization_id: string;
    email: string;
    name: string;
    phone?: string;
    set_password?: string;
    send_welcome_email?: boolean;
    organization_name?: string;
  }): Promise<{
    success: boolean;
    user_id?: string;
    temp_password?: string;
    reset_link?: string;
    login_url?: string;
    organization_id?: string;
    email_sent?: boolean;
    email_error?: string;
    message?: string;
    error?: string;
  }> {
    try {
      console.log('[OrganizationService] Creating org admin via Edge Function:', {
        organization_id: params.organization_id,
        email: params.email,
        name: params.name,
      });

      const { data, error } = await supabase.functions.invoke('create-org-admin', {
        body: params,
      });

      if (error) {
        console.error('[OrganizationService] Edge function error:', error);
        throw new Error(error.message);
      }

      console.log('[OrganizationService] createOrgAdmin result:', {
        success: data?.success,
        email_sent: data?.email_sent,
        has_temp_password: !!data?.temp_password,
        has_reset_link: !!data?.reset_link,
      });

      return data;
    } catch (error: any) {
      console.error('[OrganizationService] createOrgAdmin failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to create org admin',
      };
    }
  }

  /**
   * Resend welcome email to organization owner
   * Uses the password service to send a reset email
   */
  static async resendWelcomeEmail(organizationId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Get organization details
      const { data: org, error: fetchError } = await (supabase
        .from('organizations') as any)
        .select('owner_email, owner_name, name')
        .eq('id', organizationId)
        .single();

      if (fetchError || !org) {
        throw new Error('Organization not found');
      }

      if (!org.owner_email) {
        throw new Error('No owner email configured for this organization');
      }

      // Send password reset email via the edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qftjyjpitnoapqxlrvfs.supabase.co';
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/admin-password-reset`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'send_reset',
            email: org.owner_email,
            userName: org.owner_name || org.name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      return {
        success: true,
        message: data.message || 'Password reset email sent successfully',
      };
    } catch (error: any) {
      console.error('[OrganizationService] resendWelcomeEmail failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email',
      };
    }
  }

  /**
   * Create organization with org admin user in one transaction
   * Returns organization, admin credentials, and email status
   */
  static async createComplete(
    dto: CreateOrganizationDTO,
    adminPassword?: string
  ): Promise<{
    organization: Organization;
    admin_credentials?: {
      email: string;
      temp_password?: string;
      reset_link?: string;
      login_url?: string;
      email_sent?: boolean;
      email_error?: string;
    };
    message?: string;
  }> {
    try {
      console.log('[OrganizationService] Creating complete organization setup:', {
        name: dto.name,
        owner_email: dto.owner_email,
        has_password: !!adminPassword,
      });

      // Step 1: Create the organization
      const org = await this.create(dto);
      console.log('[OrganizationService] Organization created:', org.id);

      // Step 2: Create org admin user with welcome email
      const adminResult = await this.createOrgAdmin({
        organization_id: org.id,
        email: dto.owner_email,
        name: dto.owner_name,
        phone: dto.phone,
        set_password: adminPassword,
        send_welcome_email: true,
        organization_name: dto.name,
      });

      // Build response message
      let message = 'Organization created successfully.';
      if (adminResult.success) {
        if (adminResult.email_sent) {
          message = 'Organization created! Welcome email with credentials sent to owner.';
        } else {
          message = 'Organization created! Email sending failed - share credentials manually.';
        }
      } else {
        message = `Organization created but admin user creation failed: ${adminResult.error}`;
      }

      console.log('[OrganizationService] createComplete finished:', {
        org_id: org.id,
        admin_success: adminResult.success,
        email_sent: adminResult.email_sent,
      });

      return {
        organization: org,
        admin_credentials: adminResult.success ? {
          email: dto.owner_email,
          temp_password: adminResult.temp_password,
          reset_link: adminResult.reset_link,
          login_url: adminResult.login_url,
          email_sent: adminResult.email_sent,
          email_error: adminResult.email_error,
        } : undefined,
        message,
      };
    } catch (error: any) {
      console.error('[OrganizationService] createComplete failed:', error);
      throw error;
    }
  }

  /**
   * Get organization metrics
   */
  static async getMetrics(id: string): Promise<OrganizationMetrics> {
    try {
      const { data, error } = await (supabase
        .rpc('get_organization_metrics', { org_id: id } as any) as any)
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
