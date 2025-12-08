/**
 * Stripe Connect Settings Tab
 * 
 * Allows organization admins to:
 * - Create a new Stripe Express account (onboarding flow)
 * - Link an existing Stripe account (OAuth flow)
 * - View connected account status
 * - Access Stripe Express Dashboard
 * 
 * @version 2.0.0
 * @date Dec 08, 2025
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useTheme } from '@/components/layout/ThemeContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  CreditCard,
  Plus,
  Link2,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2,
  Shield,
  Wallet,
} from 'lucide-react';

interface StripeAccountStatus {
  connected: boolean;
  accountId?: string;
  type?: string;
  email?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  country?: string;
  defaultCurrency?: string;
  businessName?: string;
  requirements?: {
    currentlyDue: string[];
    eventuallyDue: string[];
    pastDue: string[];
    disabledReason?: string;
  };
}

interface StripeConnectTabProps {
  organizationId: string;
  organizationEmail?: string;
  organizationName?: string;
}

export const StripeConnectTab: React.FC<StripeConnectTabProps> = ({
  organizationId,
  organizationEmail,
  organizationName,
}) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null);
  const [existingAccountId, setExistingAccountId] = useState<string | null>(null);

  // Theme classes
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedText = isDark ? 'text-gray-400' : 'text-gray-600';
  const border = isDark ? 'border-gray-700' : 'border-gray-200';

  // Fetch account status
  const fetchAccountStatus = useCallback(async () => {
    if (!organizationId) return;

    setLoading(true);
    try {
      // First check DB for existing account ID
      const { data: org } = await supabase
        .from('organizations')
        .select('stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled')
        .eq('id', organizationId)
        .single();

      const orgData = org as { stripe_account_id?: string } | null;
      if (orgData?.stripe_account_id) {
        setExistingAccountId(orgData.stripe_account_id);

        // Get detailed status from Stripe via edge function
        const { data: session } = await supabase.auth.getSession();
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-oauth`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.session?.access_token}`,
            },
            body: JSON.stringify({
              action: 'get_account_status',
              organizationId,
              accountId: orgData.stripe_account_id,
            }),
          }
        );

        if (response.ok) {
          const status = await response.json();
          setAccountStatus(status);
        }
      } else {
        setAccountStatus({ connected: false });
      }
    } catch (error) {
      console.error('Failed to fetch account status:', error);
      toast.error('Failed to load Stripe account status');
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchAccountStatus();
  }, [fetchAccountStatus]);

  // Create new Express account
  const handleCreateAccount = async () => {
    setActionLoading('create');
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-org`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: 'create_account',
            organizationId,
            email: organizationEmail || currentUser?.email,
            country: 'US',
            businessType: 'company',
            businessName: organizationName,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create account');
      }

      const data = await response.json();
      toast.success('Stripe account created!', {
        description: 'Redirecting to complete onboarding...',
      });

      // Redirect to Stripe onboarding
      window.location.href = data.onboardingUrl;
    } catch (error: any) {
      console.error('Create account error:', error);
      toast.error('Failed to create Stripe account', {
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Link existing Stripe account via OAuth
  const handleLinkExisting = async () => {
    setActionLoading('link');
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-oauth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: 'generate_oauth_url',
            organizationId,
            userId: currentUser?.id,
            email: organizationEmail || currentUser?.email,
            returnUrl: window.location.href,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate OAuth URL');
      }

      const data = await response.json();
      toast.success('Opening Stripe...', {
        description: 'Connect your existing account',
      });

      // Open OAuth in new window or redirect
      window.open(data.oauthUrl, '_blank', 'width=800,height=700');
    } catch (error: any) {
      console.error('Link account error:', error);
      toast.error('Failed to link Stripe account', {
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Open Stripe Dashboard
  const handleOpenDashboard = async () => {
    if (!existingAccountId) return;

    setActionLoading('dashboard');
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-org`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: 'create_login_link',
            accountId: existingAccountId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create login link');
      }

      const data = await response.json();
      window.open(data.url, '_blank');
    } catch (error: any) {
      toast.error('Failed to open Stripe dashboard');
    } finally {
      setActionLoading(null);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Render connected state
  if (accountStatus?.connected && existingAccountId) {
    return (
      <div className="space-y-6">
        {/* Status Card */}
        <Card className={`${cardBg} border ${border}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <CardTitle className={textColor}>Stripe Connected</CardTitle>
                  <CardDescription className={mutedText}>
                    Your account is linked and ready to accept payments
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchAccountStatus}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Account Info */}
          <Card className={`${cardBg} border ${border}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm ${mutedText}`}>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={mutedText}>Account ID</span>
                <code className={`text-xs ${textColor}`}>{existingAccountId}</code>
              </div>
              {accountStatus.businessName && (
                <div className="flex items-center justify-between">
                  <span className={mutedText}>Business Name</span>
                  <span className={textColor}>{accountStatus.businessName}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className={mutedText}>Type</span>
                <Badge variant="outline">{accountStatus.type || 'Express'}</Badge>
              </div>
              {accountStatus.country && (
                <div className="flex items-center justify-between">
                  <span className={mutedText}>Country</span>
                  <span className={textColor}>{accountStatus.country}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card className={`${cardBg} border ${border}`}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm ${mutedText}`}>Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className={mutedText}>Card Payments</span>
                </div>
                {accountStatus.chargesEnabled ? (
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500">
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="destructive">Disabled</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <span className={mutedText}>Payouts</span>
                </div>
                {accountStatus.payoutsEnabled ? (
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500">
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="destructive">Disabled</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className={mutedText}>Verification</span>
                </div>
                {accountStatus.detailsSubmitted ? (
                  <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500">
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500 text-amber-500">
                    Pending
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requirements Warning */}
        {(accountStatus.requirements?.currentlyDue?.length ?? 0) > 0 && (
          <Card className={`${cardBg} border border-amber-500/50`}>
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div>
                  <p className={`font-medium ${textColor}`}>Action Required</p>
                  <p className={`text-sm ${mutedText}`}>
                    Complete the following to enable all features:
                  </p>
                  <ul className="mt-2 text-sm space-y-1">
                    {accountStatus.requirements?.currentlyDue?.map((req) => (
                      <li key={req} className={mutedText}>• {req.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleOpenDashboard}
            disabled={actionLoading === 'dashboard'}
            className="flex-1"
          >
            {actionLoading === 'dashboard' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ExternalLink className="w-4 h-4 mr-2" />
            )}
            Open Stripe Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Render not connected state
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={`${cardBg} border ${border}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <CreditCard className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <CardTitle className={textColor}>Connect Stripe Account</CardTitle>
              <CardDescription className={mutedText}>
                Accept payments from customers and receive payouts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create New Account */}
        <Card className={`${cardBg} border ${border} hover:border-indigo-500/50 transition-colors`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <Plus className="w-5 h-5 text-indigo-500" />
              </div>
              <CardTitle className={`text-lg ${textColor}`}>Create New Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`text-sm ${mutedText}`}>
              Set up a new Stripe account with guided onboarding. Best for businesses 
              that don't have an existing Stripe account.
            </p>
            <ul className={`text-sm space-y-2 ${mutedText}`}>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Quick 5-minute setup
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Stripe handles verification
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Express Dashboard access
              </li>
            </ul>
            <Separator />
            <Button
              onClick={handleCreateAccount}
              disabled={actionLoading === 'create'}
              className="w-full"
            >
              {actionLoading === 'create' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Stripe Account
            </Button>
          </CardContent>
        </Card>

        {/* Link Existing Account */}
        <Card className={`${cardBg} border ${border} hover:border-emerald-500/50 transition-colors`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Link2 className="w-5 h-5 text-emerald-500" />
              </div>
              <CardTitle className={`text-lg ${textColor}`}>Link Existing Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`text-sm ${mutedText}`}>
              Connect your existing Stripe account to this platform. Best for businesses 
              already using Stripe for payments.
            </p>
            <ul className={`text-sm space-y-2 ${mutedText}`}>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Keep existing settings
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Instant connection
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                Full Stripe Dashboard
              </li>
            </ul>
            <Separator />
            <Button
              onClick={handleLinkExisting}
              disabled={actionLoading === 'link'}
              variant="outline"
              className="w-full"
            >
              {actionLoading === 'link' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="w-4 h-4 mr-2" />
              )}
              Link Existing Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className={`${cardBg} border ${isDark ? 'border-blue-800' : 'border-blue-200'} 
        ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className={`text-sm ${mutedText}`}>
              <p className="font-medium text-blue-500">Platform Fee Information</p>
              <p className="mt-1">
                A small platform fee is applied to each booking to support platform services.
                You'll see the exact fee breakdown in your Stripe dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeConnectTab;
