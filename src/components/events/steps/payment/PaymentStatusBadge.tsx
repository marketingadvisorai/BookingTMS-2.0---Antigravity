/**
 * Payment Status Badge Component
 * Displays sync status as a visual badge
 * 
 * @module payment/PaymentStatusBadge
 */

import React from 'react';
import { Badge } from '../../../ui/badge';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import { SyncStatus } from './types';

interface PaymentStatusBadgeProps {
  status: SyncStatus;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'synced':
      return (
        <Badge className="bg-green-500">
          <Check className="w-3 h-3 mr-1" /> Synced
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-yellow-500">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Syncing...
        </Badge>
      );
    case 'error':
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" /> Error
        </Badge>
      );
    default:
      return <Badge variant="outline">Not Configured</Badge>;
  }
};

export default PaymentStatusBadge;
