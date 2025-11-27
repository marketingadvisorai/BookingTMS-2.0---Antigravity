/**
 * Payment Header Component
 * Header with title, status badge, and refresh button
 * 
 * @module payment/PaymentHeader
 */

import React from 'react';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { CreditCard, Check, RotateCw } from 'lucide-react';
import { SyncStatus } from './types';

interface PaymentHeaderProps {
  isConfigured: boolean;
  isCheckoutConnected: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const PaymentHeader: React.FC<PaymentHeaderProps> = ({
  isConfigured,
  isCheckoutConnected,
  isRefreshing,
  onRefresh,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Settings
          {isConfigured ? (
            <Badge className="bg-green-500">
              <Check className="w-3 h-3 mr-1" />
              {isCheckoutConnected ? 'Connected & Active' : 'Connected'}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">Optional</Badge>
          )}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Checking...' : 'Check Connection'}
        </Button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        {isConfigured
          ? 'Stripe integration active - Update prices or view product details below'
          : 'Create a new Stripe product or reconnect an existing one for online bookings'
        }
      </p>
    </div>
  );
};

export default PaymentHeader;
