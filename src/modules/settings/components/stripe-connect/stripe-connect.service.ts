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

    const data = await this.safeJsonParse(response);
    
    if (!response.ok) {
      throw new Error(data.error || `Failed to fetch account status (${response.status})`);
    }

    return data;
  }

  /**
   * Safely parse JSON response, handling empty/invalid responses
   */
  private async safeJsonParse(response: Response): Promise<any> {
    const text = await response.text();
    if (!text || text.trim() === '') {
      return {};
    }
    try {
      return JSON.parse(text);
    } catch {
      console.error('Failed to parse response:', text);
      return { error: 'Invalid response from server' };
    }
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

    const data = await this.safeJsonParse(response);
    
    if (!response.ok) {
      throw new Error(data.error || `Failed to create account (${response.status})`);
    }

    if (!data.onboardingUrl) {
      throw new Error('No onboarding URL returned from Stripe');
    }

    return data;
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

    const data = await this.safeJsonParse(response);
    
    if (!response.ok) {
      throw new Error(data.error || `Failed to generate OAuth URL (${response.status})`);
    }

    return data;
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

    const data = await this.safeJsonParse(response);
    
    if (!response.ok) {
      throw new Error(data.error || `Failed to create login link (${response.status})`);
    }

    return data;
  }
}

export const stripeConnectService = new StripeConnectService();
