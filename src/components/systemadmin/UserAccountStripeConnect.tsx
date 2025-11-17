import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/layout/ThemeContext';
import {
  CreditCard,
  Plus,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Link2
} from 'lucide-react';
import { ConnectedAccountOnboarding } from './ConnectedAccountOnboarding';
import { stripeConnectService } from '@/services/stripeConnectService';
import { toast } from 'sonner';

interface UserAccountStripeConnectProps {
  userId: string;
  userEmail: string;
  userName: string;
  organizationId?: string;
  existingAccountId?: string;
  onAccountLinked?: (accountId: string) => void;
}

export const UserAccountStripeConnect: React.FC<UserAccountStripeConnectProps> = ({
  userId,
  userEmail,
  userName,
  organizationId,
  existingAccountId,
  onAccountLinked
}) => {
  const { theme } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [accountDetails, setAccountDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [linkingExisting, setLinkingExisting] = useState(false);

  // Theme classes
  const isDark = theme === 'dark';
  const cardBgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  /**
   * Fetch account details if account exists
   */
  const fetchAccountDetails = async () => {
    if (!existingAccountId) return;

    setLoading(true);
    try {
      const account = await stripeConnectService.getAccount(existingAccountId);
      setAccountDetails(account);
    } catch (error: any) {
      console.error('Failed to fetch account details:', error);
      toast.error('Failed to fetch account details', {
        description: error?.message || 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle account creation success
   */
  const handleAccountCreated = (accountId: string, type: string) => {
    toast.success('Account created successfully!', {
      description: `${type} account linked to ${userName}`
    });

    if (onAccountLinked) {
      onAccountLinked(accountId);
    }

    // Fetch the new account details
    setAccountDetails({ id: accountId, type });
    setShowOnboarding(false);
  };

  /**
   * Open Stripe Dashboard for account
   */
  const openStripeDashboard = async () => {
    if (!existingAccountId) return;

    setLoading(true);
    try {
      const loginLink = await stripeConnectService.getAccountLoginLink(existingAccountId);
      window.open(loginLink.url, '_blank');
    } catch (error: any) {
      console.error('Failed to get login link:', error);
      toast.error('Failed to open Stripe dashboard', {
        description: error?.message || 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Link existing Stripe account via OAuth
   */
  const handleLinkExistingAccount = () => {
    setLinkingExisting(true);
    try {
      // Generate OAuth URL for connecting existing Stripe accounts
      const clientId = import.meta.env.VITE_STRIPE_CONNECT_CLIENT_ID || 'ca_YOUR_CLIENT_ID';
      const redirectUri = `${window.location.origin}/stripe/oauth/callback`;
      
      // Encode state with user info for callback
      const state = btoa(JSON.stringify({
        user_id: userId,
        organization_id: organizationId || '',
        email: userEmail,
        name: userName,
        return_url: window.location.href
      }));

      // Build OAuth URL
      const oauthUrl = `https://connect.stripe.com/oauth/authorize?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `scope=read_write&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}&` +
        `stripe_user[email]=${encodeURIComponent(userEmail)}&` +
        `stripe_user[business_name]=${encodeURIComponent(userName)}`;

      toast.success('Opening Stripe OAuth...', {
        description: 'Connect your existing Stripe account'
      });

      // Open OAuth in new window
      window.open(oauthUrl, '_blank', 'width=800,height=800');
    } catch (error: any) {
      console.error('Failed to generate OAuth link:', error);
      toast.error('Failed to link existing account', {
        description: error?.message || 'Unknown error'
      });
    } finally {
      setLinkingExisting(false);
    }
  };

  // Load account details on mount if account exists
  React.useEffect(() => {
    if (existingAccountId && !accountDetails) {
      fetchAccountDetails();
    }
  }, [existingAccountId]);

  return (
    <div className="space-y-4">
      {/* User Info Card */}
      <Card className={`${cardBgClass} border ${borderColor}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={textClass}>Stripe Connect Account</CardTitle>
              <CardDescription className={mutedTextClass}>
                Payment account for {userName}
              </CardDescription>
            </div>
            <CreditCard className={`w-6 h-6 ${mutedTextClass}`} />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* User Details */}
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className={mutedTextClass}>Name</p>
                <p className={`font-medium ${textClass}`}>{userName}</p>
              </div>
              <div>
                <p className={mutedTextClass}>Email</p>
                <p className={`font-medium ${textClass}`}>{userEmail}</p>
              </div>
              <div>
                <p className={mutedTextClass}>User ID</p>
                <p className={`text-xs ${mutedTextClass} font-mono`}>{userId}</p>
              </div>
              {organizationId && (
                <div>
                  <p className={mutedTextClass}>Organization</p>
                  <p className={`text-xs ${mutedTextClass} font-mono`}>{organizationId}</p>
                </div>
              )}
            </div>
          </div>

          {/* Account Status */}
          {existingAccountId ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                <span className={`font-medium ${textClass}`}>Connected Account Active</span>
              </div>

              {accountDetails && (
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <span className={mutedTextClass}>Account ID</span>
                    <code className={`text-xs ${textClass}`}>{accountDetails.id}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={mutedTextClass}>Type</span>
                    <Badge variant="outline">{accountDetails.type || 'Unknown'}</Badge>
                  </div>
                  {accountDetails.charges_enabled !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className={mutedTextClass}>Charges</span>
                      {accountDetails.charges_enabled ? (
                        <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500 text-red-500">
                          Disabled
                        </Badge>
                      )}
                    </div>
                  )}
                  {accountDetails.payouts_enabled !== undefined && (
                    <div className="flex items-center justify-between">
                      <span className={mutedTextClass}>Payouts</span>
                      {accountDetails.payouts_enabled ? (
                        <Badge variant="outline" className="border-emerald-500 text-emerald-500">
                          Enabled
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500 text-red-500">
                          Disabled
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={openStripeDashboard}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Stripe Dashboard
                    </>
                  )}
                </Button>
                <Button
                  onClick={fetchAccountDetails}
                  disabled={loading}
                  variant="outline"
                >
                  Refresh
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className={`font-medium ${textClass}`}>No Connected Account</span>
              </div>

              <p className={`text-sm ${mutedTextClass}`}>
                This user doesn't have a Stripe Connect account yet. Create one to enable payments and payouts.
              </p>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => setShowOnboarding(true)}
                  className="w-full"
                  disabled={loading || linkingExisting}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Stripe Connect Account
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleLinkExistingAccount}
                  variant="outline"
                  className="w-full"
                  disabled={loading || linkingExisting}
                >
                  {linkingExisting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Opening OAuth...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4 mr-2" />
                      Link Existing Stripe Account
                    </>
                  )}
                </Button>
              </div>

              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
                <p className={`text-xs ${mutedTextClass}`}>
                  <strong>Create:</strong> Set up a new Stripe account with guided onboarding.{' '}
                  <strong>Link:</strong> Connect an existing Stripe account via OAuth.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ConnectedAccountOnboarding
              userId={userId}
              userEmail={userEmail}
              organizationId={organizationId}
              onAccountCreated={handleAccountCreated}
              onClose={() => setShowOnboarding(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
