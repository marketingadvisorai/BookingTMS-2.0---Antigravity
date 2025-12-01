/**
 * Stripe Connect Service
 * 
 * Service for managing Stripe Connect accounts for organizations.
 */

import { supabase } from '@/lib/supabase';
import type {
  StripeConnectAccount,
  OrganizationStripeStatus,
  CreateAccountParams,
  AccountLinkParams,
  OnboardingStatus,
} from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

class StripeConnectServiceOrg {
  /**
   * Get organization's Stripe Connect status
   */
  async getOrganizationStripeStatus(organizationId: string): Promise<OrganizationStripeStatus> {
    const { data: org, error } = await supabase
      .from('organizations')
      .select('id, name, stripe_account_id, stripe_onboarding_status')
      .eq('id', organizationId)
      .single();

    if (error) throw new Error(`Failed to fetch organization: ${error.message}`);

    const status: OrganizationStripeStatus = {
      organizationId: org.id,
      organizationName: org.name,
      stripeAccountId: org.stripe_account_id,
      onboardingStatus: (org.stripe_onboarding_status as OnboardingStatus) || 'not_started',
      lastChecked: new Date().toISOString(),
    };

    // Fetch account details if connected
    if (org.stripe_account_id) {
      try {
        const account = await this.getAccountDetails(org.stripe_account_id);
        status.account = account;
        
        // Update onboarding status based on account state
        if (account.chargesEnabled && account.payoutsEnabled) {
          status.onboardingStatus = 'complete';
        } else if (account.requirements?.currentlyDue?.length) {
          status.onboardingStatus = 'action_required';
        } else if (account.detailsSubmitted) {
          status.onboardingStatus = 'pending';
        }
      } catch (err) {
        console.warn('Failed to fetch Stripe account details:', err);
      }
    }

    return status;
  }

  /**
   * Create Express Connect account for organization
   */
  async createExpressAccount(params: CreateAccountParams): Promise<{
    accountId: string;
    onboardingUrl: string;
  }> {
    // Call Supabase Edge Function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-connect-org`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        action: 'create_account',
        ...params,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create account');
    }

    const data = await response.json();
    
    // Update organization with account ID
    await supabase
      .from('organizations')
      .update({
        stripe_account_id: data.accountId,
        stripe_onboarding_status: 'in_progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.organizationId);

    return {
      accountId: data.accountId,
      onboardingUrl: data.onboardingUrl,
    };
  }

  /**
   * Get account onboarding link
   */
  async getOnboardingLink(params: AccountLinkParams): Promise<string> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-connect-org`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        action: 'create_account_link',
        ...params,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create onboarding link');
    }

    const data = await response.json();
    return data.url;
  }

  /**
   * Get Stripe account details
   */
  async getAccountDetails(accountId: string): Promise<StripeConnectAccount> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-connect-org`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        action: 'get_account',
        accountId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch account');
    }

    return response.json();
  }

  /**
   * Get Stripe dashboard login link
   */
  async getDashboardLink(accountId: string): Promise<string> {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-connect-org`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify({
        action: 'create_login_link',
        accountId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create dashboard link');
    }

    const data = await response.json();
    return data.url;
  }

  /**
   * Disconnect Stripe account from organization
   */
  async disconnectAccount(organizationId: string): Promise<void> {
    await supabase
      .from('organizations')
      .update({
        stripe_account_id: null,
        stripe_onboarding_status: 'not_started',
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId);
  }

  /**
   * Update organization's onboarding status
   */
  async updateOnboardingStatus(
    organizationId: string,
    status: OnboardingStatus
  ): Promise<void> {
    await supabase
      .from('organizations')
      .update({
        stripe_onboarding_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organizationId);
  }
}

export const stripeConnectOrgService = new StripeConnectServiceOrg();
