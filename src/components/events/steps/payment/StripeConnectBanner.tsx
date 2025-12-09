/**
 * Stripe Connect Status Banner
 * Shows the organization's Stripe Connect status and guides users to connect
 * 
 * @module payment/StripeConnectBanner
 * @version 1.0.0
 * @date 2025-12-10
 */

import React from 'react';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Loader2,
  Building2,
} from 'lucide-react';
import { StripeConnectStatus } from './types';

interface StripeConnectBannerProps {
  status: StripeConnectStatus;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function StripeConnectBanner({ status, isLoading, onRefresh }: StripeConnectBannerProps) {
  // Loading state
  if (isLoading) {
    return (
      <Alert className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <AlertDescription className="text-sm text-gray-600 dark:text-gray-300">
          Checking Stripe Connect status...
        </AlertDescription>
      </Alert>
    );
  }

  // Not connected - show warning
  if (!status.isConnected) {
    return (
      <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-sm">
          <div className="flex flex-col gap-3">
            <div>
              <strong className="text-amber-800 dark:text-amber-300">Stripe Account Not Connected</strong>
              <p className="text-amber-700 dark:text-amber-400 mt-1">
                You must connect a Stripe account before you can create products and accept payments.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                onClick={() => window.location.href = '/settings?tab=stripe-connect'}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Connect Stripe Account
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onRefresh}
              >
                Refresh Status
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Connected but not fully onboarded
  if (!status.chargesEnabled) {
    return (
      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm">
          <div className="flex flex-col gap-3">
            <div>
              <strong className="text-blue-800 dark:text-blue-300">Stripe Onboarding Incomplete</strong>
              <p className="text-blue-700 dark:text-blue-400 mt-1">
                Your Stripe account is connected but not fully set up. Complete the onboarding to accept payments.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Account: {status.accountId?.slice(0, 12)}...
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                onClick={() => window.location.href = '/settings?tab=stripe-connect'}
              >
                Complete Setup
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Fully connected and enabled
  return (
    <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      <AlertDescription className="text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <strong className="text-green-800 dark:text-green-300">Stripe Connected</strong>
              <p className="text-green-700 dark:text-green-400 text-xs mt-0.5">
                Products will be created on your organization's Stripe account
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono bg-green-100 dark:bg-green-900/40 border-green-300 dark:border-green-700">
              <Building2 className="w-3 h-3 mr-1" />
              {status.accountId?.slice(0, 12)}...
            </Badge>
            <Badge className="bg-green-600 text-white text-xs">
              USD Only
            </Badge>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default StripeConnectBanner;
