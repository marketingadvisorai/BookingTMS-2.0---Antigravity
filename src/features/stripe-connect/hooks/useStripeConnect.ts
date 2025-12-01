/**
 * Stripe Connect Hook
 * 
 * React hook for managing Stripe Connect state for organizations.
 */

import { useState, useCallback, useEffect } from 'react';
import { stripeConnectOrgService } from '../services/stripeConnect.service';
import type {
  StripeConnectState,
  OrganizationStripeStatus,
  CreateAccountParams,
} from '../types';

export function useStripeConnect(organizationId?: string) {
  const [state, setState] = useState<StripeConnectState>({
    status: null,
    isLoading: false,
    error: null,
    onboardingUrl: null,
  });

  /**
   * Fetch organization's Stripe status
   */
  const fetchStatus = useCallback(async () => {
    if (!organizationId) return;

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const status = await stripeConnectOrgService.getOrganizationStripeStatus(organizationId);
      setState((prev) => ({ ...prev, status, isLoading: false }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch status';
      setState((prev) => ({ ...prev, error: message, isLoading: false }));
    }
  }, [organizationId]);

  /**
   * Create Express Connect account
   */
  const createAccount = useCallback(async (params: Omit<CreateAccountParams, 'organizationId'>) => {
    if (!organizationId) throw new Error('Organization ID required');

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await stripeConnectOrgService.createExpressAccount({
        ...params,
        organizationId,
      });

      setState((prev) => ({
        ...prev,
        isLoading: false,
        onboardingUrl: result.onboardingUrl,
      }));

      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setState((prev) => ({ ...prev, error: message, isLoading: false }));
      throw err;
    }
  }, [organizationId]);

  /**
   * Get onboarding link for existing account
   */
  const getOnboardingLink = useCallback(async () => {
    if (!state.status?.stripeAccountId) throw new Error('No Stripe account');

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const url = await stripeConnectOrgService.getOnboardingLink({
        accountId: state.status.stripeAccountId,
        refreshUrl: window.location.href,
        returnUrl: `${window.location.origin}/stripe-connect/complete?org=${organizationId}`,
        type: 'account_onboarding',
      });

      setState((prev) => ({ ...prev, isLoading: false, onboardingUrl: url }));
      return url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get onboarding link';
      setState((prev) => ({ ...prev, error: message, isLoading: false }));
      throw err;
    }
  }, [organizationId, state.status?.stripeAccountId]);

  /**
   * Open Stripe Express Dashboard
   */
  const openDashboard = useCallback(async () => {
    if (!state.status?.stripeAccountId) throw new Error('No Stripe account');

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const url = await stripeConnectOrgService.getDashboardLink(state.status.stripeAccountId);
      window.open(url, '_blank');
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to open dashboard';
      setState((prev) => ({ ...prev, error: message, isLoading: false }));
      throw err;
    }
  }, [state.status?.stripeAccountId]);

  /**
   * Disconnect Stripe account
   */
  const disconnectAccount = useCallback(async () => {
    if (!organizationId) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await stripeConnectOrgService.disconnectAccount(organizationId);
      setState((prev) => ({
        ...prev,
        status: prev.status ? { ...prev.status, stripeAccountId: null, onboardingStatus: 'not_started' } : null,
        isLoading: false,
        onboardingUrl: null,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect';
      setState((prev) => ({ ...prev, error: message, isLoading: false }));
      throw err;
    }
  }, [organizationId]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Initial fetch
  useEffect(() => {
    if (organizationId) {
      fetchStatus();
    }
  }, [organizationId, fetchStatus]);

  return {
    ...state,
    fetchStatus,
    createAccount,
    getOnboardingLink,
    openDashboard,
    disconnectAccount,
    clearError,
    isConnected: !!state.status?.stripeAccountId,
    isComplete: state.status?.onboardingStatus === 'complete',
    needsAction: state.status?.onboardingStatus === 'action_required',
  };
}
