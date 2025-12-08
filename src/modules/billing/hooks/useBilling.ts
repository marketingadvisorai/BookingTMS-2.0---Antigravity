/**
 * Billing Hook
 * Main hook for billing state management
 * @module billing/hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { billingService } from '../services/billing.service';
import { DEFAULT_PLANS, DEFAULT_CREDIT_PACKAGES } from '../constants/plans';
import type { 
  Subscription, 
  CreditBalance, 
  CreditTransaction,
  SubscriptionPlan,
  CreditPackage,
  Invoice,
  PaymentMethod,
} from '../types';

interface UseBillingState {
  subscription: Subscription | null;
  creditBalance: CreditBalance | null;
  transactions: CreditTransaction[];
  plans: SubscriptionPlan[];
  creditPackages: CreditPackage[];
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];
  loading: boolean;
  error: string | null;
}

interface UseBillingActions {
  refresh: () => Promise<void>;
  createCheckout: (priceId: string) => Promise<string | null>;
  openPortal: () => Promise<string | null>;
  buyCredits: (packageId: string) => Promise<string | null>;
  syncFromStripe: () => Promise<void>;
}

export function useBilling(): UseBillingState & UseBillingActions {
  const { currentUser } = useAuth();
  const organizationId = currentUser?.organizationId;

  const [state, setState] = useState<UseBillingState>({
    subscription: null,
    creditBalance: null,
    transactions: [],
    plans: [],
    creditPackages: [],
    invoices: [],
    paymentMethods: [],
    loading: true,
    error: null,
  });

  /**
   * Load all billing data
   */
  const loadBillingData = useCallback(async () => {
    if (!organizationId) {
      // No organization - show default plans but no subscription data
      setState(prev => ({ 
        ...prev, 
        loading: false,
        plans: DEFAULT_PLANS,
        creditPackages: DEFAULT_CREDIT_PACKAGES,
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Load data in parallel with individual error handling
      const [
        subscriptionResult,
        creditBalanceResult,
        transactionsResult,
        plansResult,
        creditPackagesResult,
        invoicesResult,
      ] = await Promise.allSettled([
        billingService.getSubscription(organizationId),
        billingService.getCreditBalance(organizationId),
        billingService.getCreditTransactions(organizationId),
        billingService.getPlans(),
        billingService.getCreditPackages(),
        billingService.getInvoices(organizationId),
      ]);

      // Extract values, defaulting to null/empty on failure
      const subscription = subscriptionResult.status === 'fulfilled' ? subscriptionResult.value : null;
      const creditBalance = creditBalanceResult.status === 'fulfilled' ? creditBalanceResult.value : null;
      const transactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value : [];
      const plans = plansResult.status === 'fulfilled' ? plansResult.value : [];
      const creditPackages = creditPackagesResult.status === 'fulfilled' ? creditPackagesResult.value : [];
      const invoices = invoicesResult.status === 'fulfilled' ? invoicesResult.value : [];

      // Use fallback plans if database tables don't exist yet
      const finalPlans = plans && plans.length > 0 ? plans : DEFAULT_PLANS;
      const finalPackages = creditPackages && creditPackages.length > 0 ? creditPackages : DEFAULT_CREDIT_PACKAGES;

      setState({
        subscription,
        creditBalance,
        transactions,
        plans: finalPlans,
        creditPackages: finalPackages,
        invoices,
        paymentMethods: [], // Payment methods fetched from Stripe via portal
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Failed to load billing data:', err);
      // Even on error, provide fallback plans
      setState(prev => ({
        ...prev,
        plans: DEFAULT_PLANS,
        creditPackages: DEFAULT_CREDIT_PACKAGES,
        loading: false,
        error: null, // Don't show error if we have fallback data
      }));
    }
  }, [organizationId]);

  /**
   * Create Stripe Checkout session
   */
  const createCheckout = useCallback(async (priceId: string): Promise<string | null> => {
    if (!organizationId) return null;

    try {
      const result = await billingService.createCheckoutSession({
        organizationId,
        priceId,
        successUrl: `${window.location.origin}/billing?success=true`,
        cancelUrl: `${window.location.origin}/billing?canceled=true`,
      });
      return result.url;
    } catch (err: any) {
      console.error('Failed to create checkout:', err);
      setState(prev => ({ ...prev, error: err.message }));
      return null;
    }
  }, [organizationId]);

  /**
   * Open Stripe Customer Portal
   */
  const openPortal = useCallback(async (): Promise<string | null> => {
    if (!organizationId) return null;

    try {
      const result = await billingService.createPortalSession({
        organizationId,
        returnUrl: `${window.location.origin}/billing`,
      });
      return result.url;
    } catch (err: any) {
      console.error('Failed to open portal:', err);
      setState(prev => ({ ...prev, error: err.message }));
      return null;
    }
  }, [organizationId]);

  /**
   * Create checkout for credit purchase
   */
  const buyCredits = useCallback(async (packageId: string): Promise<string | null> => {
    if (!organizationId) return null;

    try {
      const result = await billingService.buyCredits({
        organizationId,
        packageId,
        successUrl: `${window.location.origin}/billing?credits=success`,
        cancelUrl: `${window.location.origin}/billing?credits=canceled`,
      });
      return result.url;
    } catch (err: any) {
      console.error('Failed to create credit checkout:', err);
      setState(prev => ({ ...prev, error: err.message }));
      return null;
    }
  }, [organizationId]);

  /**
   * Sync data from Stripe
   */
  const syncFromStripe = useCallback(async () => {
    if (!organizationId) return;

    try {
      await Promise.all([
        billingService.syncSubscription(organizationId),
        billingService.syncInvoices(organizationId),
      ]);
      await loadBillingData();
    } catch (err: any) {
      console.error('Failed to sync from Stripe:', err);
    }
  }, [organizationId, loadBillingData]);

  // Load data on mount
  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  return {
    ...state,
    refresh: loadBillingData,
    createCheckout,
    openPortal,
    buyCredits,
    syncFromStripe,
  };
}

export default useBilling;
