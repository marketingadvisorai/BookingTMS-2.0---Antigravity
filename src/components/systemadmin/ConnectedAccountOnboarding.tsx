import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/layout/ThemeContext';
import { 
  Shield, 
  Key, 
  Link2, 
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { stripeConnectService } from '@/services/stripeConnectService';

interface ConnectedAccountOnboardingProps {
  userId?: string;
  userEmail?: string;
  organizationId?: string;
  onAccountCreated?: (accountId: string, type: string) => void;
  onClose?: () => void;
}

export const ConnectedAccountOnboarding: React.FC<ConnectedAccountOnboardingProps> = ({
  userId,
  userEmail,
  organizationId,
  onAccountCreated,
  onClose
}) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState<string | null>(null);
  const [accountLinks, setAccountLinks] = useState<{
    express?: string;
    custom?: string;
    oauth?: string;
  }>({});

  // Theme classes
  const isDark = theme === 'dark';
  const cardBgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';

  /**
   * Create Express Account (Stripe-hosted onboarding)
   * Best for quick setup with reduced compliance burden
   */
  const handleCreateExpressAccount = async () => {
    if (!userEmail) {
      toast.error('User email is required');
      return;
    }

    setLoading('express');
    try {
      // Create Express connected account
      const account = await stripeConnectService.createAccount({
        type: 'express',
        email: userEmail,
        country: 'US',
        businessType: 'individual',
        metadata: {
          user_id: userId || '',
          organization_id: organizationId || '',
          created_via: 'admin_panel'
        }
      });

      toast.success('Express account created!', {
        description: `Account ID: ${account.accountId}`
      });

      // Generate account link for onboarding
      const linkResponse = await stripeConnectService.createAccountLink({
        accountId: account.accountId,
        refreshUrl: window.location.href,
        returnUrl: window.location.href,
        type: 'account_onboarding'
      });

      setAccountLinks(prev => ({ ...prev, express: linkResponse.url }));

      // Notify parent component
      if (onAccountCreated) {
        onAccountCreated(account.accountId, 'express');
      }

      // Show success with link
      toast.success('Onboarding link generated!', {
        description: 'Click "Open Onboarding Link" to complete setup',
        duration: 5000
      });

    } catch (error: any) {
      console.error('Failed to create Express account:', error);
      toast.error('Failed to create Express account', {
        description: error?.message || 'Unknown error occurred'
      });
    } finally {
      setLoading(null);
    }
  };

  /**
   * Create Custom Account (Full control over onboarding UI)
   * You handle compliance and verification
   */
  const handleCreateCustomAccount = async () => {
    if (!userEmail) {
      toast.error('User email is required');
      return;
    }

    setLoading('custom');
    try {
      // Create Custom connected account
      const account = await stripeConnectService.createAccount({
        type: 'custom',
        email: userEmail,
        country: 'US',
        businessType: 'company',
        metadata: {
          user_id: userId || '',
          organization_id: organizationId || '',
          created_via: 'admin_panel'
        }
      });

      toast.success('Custom account created!', {
        description: `Account ID: ${account.accountId}`
      });

      // Generate account session for embedded onboarding
      const sessionResponse = await stripeConnectService.createAccountSession(account.accountId);

      setAccountLinks(prev => ({ ...prev, custom: sessionResponse.clientSecret }));

      // Notify parent component
      if (onAccountCreated) {
        onAccountCreated(account.accountId, 'custom');
      }

      toast.success('Account session created!', {
        description: 'Use the client secret to embed onboarding UI',
        duration: 5000
      });

    } catch (error: any) {
      console.error('Failed to create Custom account:', error);
      toast.error('Failed to create Custom account', {
        description: error?.message || 'Unknown error occurred'
      });
    } finally {
      setLoading(null);
    }
  };

  /**
   * Generate OAuth Link (Connect existing Stripe accounts)
   * Fastest for verified accounts
   */
  const handleGenerateOAuthLink = async () => {
    setLoading('oauth');
    try {
      // Generate OAuth link
      const clientId = import.meta.env.VITE_STRIPE_CONNECT_CLIENT_ID || 'ca_YOUR_CLIENT_ID';
      const redirectUri = `${window.location.origin}/stripe/oauth/callback`;
      const state = btoa(JSON.stringify({
        user_id: userId || '',
        organization_id: organizationId || '',
        email: userEmail || ''
      }));

      const oauthUrl = `https://connect.stripe.com/oauth/authorize?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `scope=read_write&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}`;

      setAccountLinks(prev => ({ ...prev, oauth: oauthUrl }));

      toast.success('OAuth link generated!', {
        description: 'Click "Open OAuth Link" to connect existing account',
        duration: 5000
      });

    } catch (error: any) {
      console.error('Failed to generate OAuth link:', error);
      toast.error('Failed to generate OAuth link', {
        description: error?.message || 'Unknown error occurred'
      });
    } finally {
      setLoading(null);
    }
  };

  /**
   * Open generated link in new window
   */
  const openLink = (url: string) => {
    window.open(url, '_blank', 'width=800,height=800');
  };

  return (
    <Card className={`${cardBgClass} border ${borderColor}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={textClass}>Connected Account Onboarding</CardTitle>
            <CardDescription className={mutedTextClass}>
              OAuth flows, account links, and verification management
            </CardDescription>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            ✕
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* User Info */}
        {userEmail && (
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <p className={`text-sm ${mutedTextClass}`}>Creating account for:</p>
            <p className={`font-medium ${textClass}`}>{userEmail}</p>
            {userId && (
              <p className={`text-xs ${mutedTextClass} mt-1`}>User ID: {userId}</p>
            )}
          </div>
        )}

        {/* Express Accounts */}
        <Card className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} border ${borderColor}`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-500 mt-1" />
              <div className="flex-1">
                <h3 className={`font-semibold ${textClass} mb-1`}>Express Accounts</h3>
                <p className={`text-sm ${mutedTextClass}`}>
                  Stripe-hosted onboarding with reduced compliance burden. Best for quick setup.
                </p>
              </div>
            </div>

            <Button
              onClick={handleCreateExpressAccount}
              disabled={loading !== null}
              className="w-full"
              variant="outline"
            >
              {loading === 'express' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Create Express Account
                </>
              )}
            </Button>

            {accountLinks.express && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className={`text-sm ${textClass}`}>Onboarding link ready!</span>
                </div>
                <Button
                  onClick={() => openLink(accountLinks.express!)}
                  className="w-full"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Onboarding Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Custom Accounts */}
        <Card className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} border ${borderColor}`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-blue-500 mt-1" />
              <div className="flex-1">
                <h3 className={`font-semibold ${textClass} mb-1`}>Custom Accounts</h3>
                <p className={`text-sm ${mutedTextClass}`}>
                  Full control over onboarding UI. You handle compliance and verification.
                </p>
              </div>
            </div>

            <Button
              onClick={handleCreateCustomAccount}
              disabled={loading !== null}
              className="w-full"
              variant="outline"
            >
              {loading === 'custom' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Create Custom Account
                </>
              )}
            </Button>

            {accountLinks.custom && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className={`text-sm ${textClass}`}>Account session created!</span>
                </div>
                <div className={`p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'} border ${borderColor}`}>
                  <p className={`text-xs ${mutedTextClass} mb-1`}>Client Secret:</p>
                  <code className={`text-xs ${textClass} break-all`}>
                    {accountLinks.custom}
                  </code>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* OAuth Flow */}
        <Card className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} border ${borderColor}`}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Link2 className="w-5 h-5 text-purple-500 mt-1" />
              <div className="flex-1">
                <h3 className={`font-semibold ${textClass} mb-1`}>OAuth Flow</h3>
                <p className={`text-sm ${mutedTextClass}`}>
                  Let existing Stripe accounts connect via OAuth. Fastest for verified accounts.
                </p>
              </div>
            </div>

            <Button
              onClick={handleGenerateOAuthLink}
              disabled={loading !== null}
              className="w-full"
              variant="outline"
            >
              {loading === 'oauth' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4 mr-2" />
                  Generate OAuth Link
                </>
              )}
            </Button>

            {accountLinks.oauth && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span className={`text-sm ${textClass}`}>OAuth link ready!</span>
                </div>
                <Button
                  onClick={() => openLink(accountLinks.oauth!)}
                  className="w-full"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open OAuth Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Best Practice */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className={`text-sm font-medium ${textClass} mb-1`}>Best Practice:</p>
              <p className={`text-sm ${mutedTextClass}`}>
                Store account IDs securely in your database, never expose secret keys client-side, and 
                use account sessions for embedded components. Verify accounts meet requirements before enabling payouts.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
