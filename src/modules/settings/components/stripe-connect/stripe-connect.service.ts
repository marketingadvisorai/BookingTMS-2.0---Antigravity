/**
 * Stripe Connect Service
 * API calls for Stripe Connect functionality
 * @module settings/components/stripe-connect/stripe-connect.service
 */

import { supabase } from '@/lib/supabase';
import type { StripeAccountStatus } from './types';

class StripeConnectService {
  private async getAuthToken(): Promise<string> {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session?.access_token) {
      throw new Error('Authentication required');
    }
    return session.session.access_token;
  }

  private getSupabaseUrl(): string {
    return import.meta.env.VITE_SUPABASE_URL;
  }

  /**
   * Fetch organization's Stripe account ID from database
   */
  async getOrgStripeAccount(organizationId: string): Promise<string | null> {
    const { data } = await supabase
      .from('organizations')
      .select('stripe_account_id')
      .eq('id', organizationId)
      .single();

    return (data as { stripe_account_id?: string } | null)?.stripe_account_id || null;
  }

  /**
   * Get detailed Stripe account status
   */
  async getAccountStatus(organizationId: string, accountId: string): Promise<StripeAccountStatus> {
    const token = await this.getAuthToken();
    
    const response = await fetch(
      `${this.getSupabaseUrl()}/functions/v1/stripe-connect-oauth`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'get_account_status',
          organizationId,
          accountId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch account status');
    }

    return response.json();
  }

  /**
   * Create new Stripe Express account
   */
  async createAccount(params: {
    organizationId: string;
    email: string;
    businessName?: string;
  }): Promise<{ onboardingUrl: string }> {
    const token = await this.getAuthToken();
    
    const response = await fetch(
      `${this.getSupabaseUrl()}/functions/v1/stripe-connect-org`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create_account',
          organizationId: params.organizationId,
          email: params.email,
          country: 'US',
          businessType: 'company',
          businessName: params.businessName,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create account');
    }

    return response.json();
  }

  /**
   * Generate OAuth URL for linking existing account
   */
  async generateOAuthUrl(params: {
    organizationId: string;
    userId: string;
    email: string;
    returnUrl: string;
  }): Promise<{ oauthUrl: string }> {
    const token = await this.getAuthToken();
    
    const response = await fetch(
      `${this.getSupabaseUrl()}/functions/v1/stripe-connect-oauth`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'generate_oauth_url',
          organizationId: params.organizationId,
          userId: params.userId,
          email: params.email,
          returnUrl: params.returnUrl,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate OAuth URL');
    }

    return response.json();
  }

  /**
   * Create login link for Stripe Dashboard
   */
  async createLoginLink(accountId: string): Promise<{ url: string }> {
    const token = await this.getAuthToken();
    
    const response = await fetch(
      `${this.getSupabaseUrl()}/functions/v1/stripe-connect-org`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create_login_link',
          accountId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create login link');
    }

    return response.json();
  }
}

export const stripeConnectService = new StripeConnectService();
