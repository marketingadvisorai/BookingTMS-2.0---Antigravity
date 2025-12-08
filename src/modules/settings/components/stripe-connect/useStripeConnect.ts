/**
 * Stripe Connect Hook
 * State management for Stripe Connect functionality
 * @module settings/components/stripe-connect/useStripeConnect
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';
import { stripeConnectService } from './stripe-connect.service';
import type { StripeAccountStatus, ActionType } from './types';

interface UseStripeConnectOptions {
  organizationId: string;
  organizationEmail?: string;
  organizationName?: string;
}

export function useStripeConnect(options: UseStripeConnectOptions) {
  const { currentUser } = useAuth();
  const { organizationId, organizationEmail, organizationName } = options;

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<ActionType>(null);
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null);
  const [existingAccountId, setExistingAccountId] = useState<string | null>(null);
  
  const mountedRef = useRef(true);

  // Fetch account status
  const fetchAccountStatus = useCallback(async () => {
    if (!organizationId || !mountedRef.current) return;

    setLoading(true);
    try {
      const accountId = await stripeConnectService.getOrgStripeAccount(organizationId);
      
      if (!mountedRef.current) return;

      if (accountId) {
        setExistingAccountId(accountId);
        const status = await stripeConnectService.getAccountStatus(organizationId, accountId);
        if (mountedRef.current) {
          setAccountStatus(status);
        }
      } else {
        setAccountStatus({ connected: false });
      }
    } catch (error) {
      console.error('Failed to fetch account status:', error);
      toast.error('Failed to load Stripe account status');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [organizationId]);

  // Create new Express account
  const handleCreateAccount = useCallback(async () => {
    setActionLoading('create');
    try {
      const data = await stripeConnectService.createAccount({
        organizationId,
        email: organizationEmail || currentUser?.email || '',
        businessName: organizationName,
      });

      toast.success('Stripe account created!', {
        description: 'Redirecting to complete onboarding...',
      });

      window.location.href = data.onboardingUrl;
    } catch (error: any) {
      toast.error('Failed to create Stripe account', {
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  }, [organizationId, organizationEmail, organizationName, currentUser?.email]);

  // Link existing account via OAuth
  const handleLinkExisting = useCallback(async () => {
    if (!currentUser?.id) return;

    setActionLoading('link');
    try {
      const data = await stripeConnectService.generateOAuthUrl({
        organizationId,
        userId: currentUser.id,
        email: organizationEmail || currentUser.email || '',
        returnUrl: window.location.href,
      });

      toast.success('Opening Stripe...', {
        description: 'Connect your existing account',
      });

      window.open(data.oauthUrl, '_blank', 'width=800,height=700');
    } catch (error: any) {
      toast.error('Failed to link Stripe account', {
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  }, [organizationId, organizationEmail, currentUser]);

  // Open Stripe Dashboard
  const handleOpenDashboard = useCallback(async () => {
    if (!existingAccountId) return;

    setActionLoading('dashboard');
    try {
      const data = await stripeConnectService.createLoginLink(existingAccountId);
      window.open(data.url, '_blank');
    } catch (error: any) {
      toast.error('Failed to open Stripe dashboard');
    } finally {
      setActionLoading(null);
    }
  }, [existingAccountId]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchAccountStatus();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchAccountStatus]);

  return {
    loading,
    actionLoading,
    accountStatus,
    existingAccountId,
    isConnected: accountStatus?.connected && !!existingAccountId,
    handleCreateAccount,
    handleLinkExisting,
    handleOpenDashboard,
    refreshStatus: fetchAccountStatus,
  };
}
