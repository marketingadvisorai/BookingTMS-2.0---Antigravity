/**
 * User Invitation Service
 * 
 * Handles inviting users to organizations with proper email delivery.
 * Uses the invite-organization-member edge function.
 * 
 * @module services/userInvitation
 */

import { supabase } from '../lib/supabase';

export interface InviteMemberParams {
  organization_id: string;
  email: string;
  name: string;
  role?: 'owner' | 'admin' | 'manager' | 'staff';
  phone?: string;
  password?: string;
  send_email?: boolean;
}

export interface InviteMemberResult {
  success: boolean;
  user_id?: string;
  temp_password?: string;
  reset_link?: string;
  email_sent?: boolean;
  method?: 'resend' | 'fallback';
  message?: string;
  error?: string;
}

class UserInvitationService {
  /**
   * Invite a user to an organization
   * Creates user if doesn't exist, sends welcome email with credentials
   */
  async inviteMember(params: InviteMemberParams): Promise<InviteMemberResult> {
    try {
      const { data, error } = await supabase.functions.invoke('invite-organization-member', {
        body: params,
      });

      if (error) {
        console.error('[UserInvitationService] Edge function error:', error);
        return {
          success: false,
          error: error.message || 'Failed to invite member',
        };
      }

      return data as InviteMemberResult;
    } catch (err: any) {
      console.error('[UserInvitationService] Exception:', err);
      return {
        success: false,
        error: err.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Check if a user exists in the system by email
   */
  async checkUserExists(email: string): Promise<{ exists: boolean; userId?: string }> {
    try {
      const { data, error } = await (supabase
        .from('users') as any)
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error('[UserInvitationService] Check user error:', error);
        return { exists: false };
      }

      return {
        exists: !!data,
        userId: (data as any)?.id,
      };
    } catch (err) {
      console.error('[UserInvitationService] Check user exception:', err);
      return { exists: false };
    }
  }

  /**
   * Check if user is member of specific organization
   */
  async checkOrgMembership(email: string, organizationId: string): Promise<{
    isMember: boolean;
    role?: string;
    userId?: string;
  }> {
    try {
      const { data, error } = await (supabase
        .from('organization_members') as any)
        .select(`
          user_id,
          role,
          users!inner(email)
        `)
        .eq('organization_id', organizationId)
        .eq('users.email', email.toLowerCase())
        .maybeSingle();

      if (error || !data) {
        return { isMember: false };
      }

      return {
        isMember: true,
        role: (data as any).role,
        userId: (data as any).user_id,
      };
    } catch (err) {
      console.error('[UserInvitationService] Check membership exception:', err);
      return { isMember: false };
    }
  }

  /**
   * Validate email belongs to an organization before password reset
   * Used by owner login forgot password flow
   */
  async validateEmailForOrg(email: string, orgSlug: string): Promise<{
    valid: boolean;
    organizationId?: string;
    organizationName?: string;
    error?: string;
  }> {
    try {
      // Get organization by slug
      const { data: org, error: orgError } = await (supabase
        .from('organizations') as any)
        .select('id, name')
        .eq('slug', orgSlug)
        .single();

      if (orgError || !org) {
        return {
          valid: false,
          error: 'Organization not found',
        };
      }

      // Check if email belongs to a member
      const membership = await this.checkOrgMembership(email, (org as any).id);

      if (!membership.isMember) {
        return {
          valid: false,
          error: 'This email is not associated with this organization',
        };
      }

      return {
        valid: true,
        organizationId: (org as any).id,
        organizationName: (org as any).name,
      };
    } catch (err: any) {
      console.error('[UserInvitationService] Validate email exception:', err);
      return {
        valid: false,
        error: err.message || 'Validation failed',
      };
    }
  }

  /**
   * Resend invitation email to existing member
   */
  async resendInvitation(userId: string, organizationId: string): Promise<InviteMemberResult> {
    try {
      // Get user details
      const { data: user, error: userError } = await (supabase
        .from('users') as any)
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Generate new password reset link via admin-password-reset
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return {
          success: false,
          error: 'Not authenticated',
        };
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
            email: (user as any).email,
            userName: (user as any).full_name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to send reset email',
        };
      }

      return {
        success: true,
        email_sent: data.method !== 'fallback_link',
        reset_link: data.resetLink,
        method: data.method === 'fallback_link' ? 'fallback' : 'resend',
        message: data.message,
      };
    } catch (err: any) {
      console.error('[UserInvitationService] Resend invitation exception:', err);
      return {
        success: false,
        error: err.message || 'Failed to resend invitation',
      };
    }
  }
}

export const userInvitationService = new UserInvitationService();
