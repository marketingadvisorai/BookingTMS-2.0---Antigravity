/**
 * @file StripeOAuthCallback.tsx
 * @description Handles OAuth callback from Stripe Connect for linking existing accounts
 * @module pages
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/layout/ThemeContext';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const StripeOAuthCallback: React.FC = () => {
  const { theme } = useTheme();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Stripe connection...');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [returnUrl, setReturnUrl] = useState<string>('/');

  const isDark = theme === 'dark';
  const cardBgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');

        // Check for OAuth errors
        if (error) {
          setStatus('error');
          setMessage(errorDescription || 'OAuth authorization failed');
          toast.error('Connection failed', {
            description: errorDescription || error
          });
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          setStatus('error');
          setMessage('Missing required OAuth parameters');
          toast.error('Invalid OAuth callback');
          return;
        }

        // Decode state
        let stateData;
        try {
          stateData = JSON.parse(atob(state));
        } catch (e) {
          setStatus('error');
          setMessage('Invalid state parameter');
          toast.error('Invalid OAuth state');
          return;
        }

        // Extract return URL
        if (stateData.return_url) {
          setReturnUrl(stateData.return_url);
        }

        // Exchange authorization code for access token
        // This should be done on your backend for security
        const response = await fetch('/api/stripe-connect/oauth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            user_id: stateData.user_id,
            organization_id: stateData.organization_id,
            email: stateData.email,
            name: stateData.name,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange OAuth code');
        }

        const data = await response.json();

        if (data.success && data.stripe_user_id) {
          setAccountId(data.stripe_user_id);
          setStatus('success');
          setMessage('Successfully connected your Stripe account!');
          
          toast.success('Account linked!', {
            description: `Stripe account ${data.stripe_user_id} connected`
          });

          // Redirect after 3 seconds
          setTimeout(() => {
            window.location.href = stateData.return_url || '/';
          }, 3000);
        } else {
          throw new Error(data.error || 'Failed to link account');
        }

      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to process OAuth callback');
        toast.error('Connection failed', {
          description: error.message
        });
      }
    };

    handleOAuthCallback();
  }, []);

  const handleReturn = () => {
    window.location.href = returnUrl;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Card className={`${cardBgClass} max-w-md w-full`}>
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-emerald-500" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
            
            <div className="text-center">
              <CardTitle className={textClass}>
                {status === 'loading' && 'Connecting...'}
                {status === 'success' && 'Success!'}
                {status === 'error' && 'Connection Failed'}
              </CardTitle>
              <CardDescription className={mutedTextClass}>
                {message}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {accountId && (
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <p className={`text-sm ${mutedTextClass} mb-1`}>Connected Account ID:</p>
              <code className={`text-sm ${textClass} font-mono`}>{accountId}</code>
            </div>
          )}

          {status === 'success' && (
            <div className={`p-3 rounded-lg ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-50'} border ${isDark ? 'border-emerald-800' : 'border-emerald-200'}`}>
              <p className={`text-sm ${textClass}`}>
                Redirecting you back in 3 seconds...
              </p>
            </div>
          )}

          {status === 'error' && (
            <Button
              onClick={handleReturn}
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Dashboard
            </Button>
          )}

          {status === 'loading' && (
            <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'} border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
              <p className={`text-xs ${mutedTextClass}`}>
                Please wait while we securely connect your Stripe account...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StripeOAuthCallback;
