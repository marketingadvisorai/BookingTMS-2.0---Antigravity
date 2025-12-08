/**
 * Billing Service
 * Handles all billing-related API calls
 * @module billing/services
 */

import { supabase } from '@/lib/supabase/client';
import type { 
  BillingData, 
  CheckoutSessionResponse, 
  PortalSessionResponse,
  SubscriptionPlan,
  CreditPackage,
} from '../types';

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-billing`;

/**
 * Call the billing edge function
 */
async function callBillingFunction(action: string, params: Record<string, any>) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ action, ...params }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Billing request failed');
  }

  return response.json();
}

export const billingService = {
  /**
   * Get complete billing data for organization
   */
  async getBillingData(organizationId: string): Promise<BillingData> {
    return callBillingFunction('get_billing_data', { organization_id: organizationId });
  },

  /**
   * Get subscription plans from database
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get credit packages from database
   */
  async getCreditPackages(): Promise<CreditPackage[]> {
    const { data, error } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) throw error;
    return data || [];
  },

  /**
   * Create checkout session for subscription
   */
  async createCheckoutSession(params: {
    organizationId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSessionResponse> {
    return callBillingFunction('create_checkout_session', {
      organization_id: params.organizationId,
      price_id: params.priceId,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });
  },

  /**
   * Create customer portal session
   */
  async createPortalSession(params: {
    organizationId: string;
    returnUrl: string;
  }): Promise<PortalSessionResponse> {
    return callBillingFunction('create_portal_session', {
      organization_id: params.organizationId,
      return_url: params.returnUrl,
    });
  },

  /**
   * Create checkout session for credit purchase
   */
  async buyCredits(params: {
    organizationId: string;
    packageId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<CheckoutSessionResponse> {
    return callBillingFunction('buy_credits', {
      organization_id: params.organizationId,
      package_id: params.packageId,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });
  },

  /**
   * Sync invoices from Stripe
   */
  async syncInvoices(organizationId: string) {
    return callBillingFunction('get_invoices', {
      organization_id: organizationId,
      limit: 12,
    });
  },

  /**
   * Sync subscription from Stripe
   */
  async syncSubscription(organizationId: string) {
    return callBillingFunction('sync_subscription', {
      organization_id: organizationId,
    });
  },

  /**
   * Get credit balance directly from database
   */
  async getCreditBalance(organizationId: string) {
    const { data, error } = await supabase
      .from('credit_balances')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get credit transactions
   */
  async getCreditTransactions(organizationId: string, limit = 20) {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get subscription from database
   */
  async getSubscription(organizationId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, subscription_plans(*)')
      .eq('organization_id', organizationId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Get invoices from database
   */
  async getInvoices(organizationId: string, limit = 12) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};

export default billingService;
