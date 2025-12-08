/**
 * Billing Hook
 * Main hook for billing state management
 * @module billing/hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { billingService } from '../services/billing.service';
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
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Load data in parallel
      const [
        subscription,
        creditBalance,
        transactions,
        plans,
        creditPackages,
        invoices,
      ] = await Promise.all([
        billingService.getSubscription(organizationId),
        billingService.getCreditBalance(organizationId),
        billingService.getCreditTransactions(organizationId),
        billingService.getPlans(),
        billingService.getCreditPackages(),
        billingService.getInvoices(organizationId),
      ]);

      setState({
        subscription,
        creditBalance,
        transactions,
        plans,
        creditPackages,
        invoices,
        paymentMethods: [], // Payment methods fetched from Stripe via portal
        loading: false,
        error: null,
      });
    } catch (err: any) {
      console.error('Failed to load billing data:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to load billing data',
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
