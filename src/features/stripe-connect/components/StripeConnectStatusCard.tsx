/**
 * Stripe Connect Status Card
 * 
 * Compact status card for displaying Stripe Connect status in Organizations page.
 */

import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Circle,
  Loader2,
  ExternalLink,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useStripeConnect } from '../hooks/useStripeConnect';

interface StripeConnectStatusCardProps {
  organizationId: string;
  onManage?: () => void;
  compact?: boolean;
}

const STATUS_CONFIG = {
  not_started: { 
    label: 'Not Connected', 
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    icon: Circle,
    description: 'Set up Stripe to accept payments',
  },
  pending: { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Loader2,
    description: 'Waiting for verification',
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Loader2,
    description: 'Complete onboarding to activate',
  },
  action_required: { 
    label: 'Action Required', 
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    icon: AlertCircle,
    description: 'Additional info needed',
  },
  complete: { 
    label: 'Connected', 
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle2,
    description: 'Payments enabled',
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: AlertCircle,
    description: 'Account was rejected',
  },
};

export function StripeConnectStatusCard({
  organizationId,
  onManage,
  compact = false,
}: StripeConnectStatusCardProps) {
  const {
    status,
    isLoading,
    isConnected,
    isComplete,
    needsAction,
    openDashboard,
    getOnboardingLink,
  } = useStripeConnect(organizationId);

  const currentStatus = status?.onboardingStatus || 'not_started';
  const config = STATUS_CONFIG[currentStatus];
  const StatusIcon = config.icon;

  const handleAction = async () => {
    if (isComplete) {
      await openDashboard();
    } else if (isConnected) {
      const url = await getOnboardingLink();
      window.open(url, '_blank');
    } else if (onManage) {
      onManage();
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <CreditCard className="w-4 h-4 text-gray-400" />
        <Badge className={config.color}>
          <StatusIcon className={`w-3 h-3 mr-1 ${config.icon === Loader2 ? 'animate-spin' : ''}`} />
          {config.label}
        </Badge>
        {(isComplete || needsAction || isConnected) && (
          <Button size="sm" variant="ghost" onClick={handleAction} disabled={isLoading}>
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isComplete ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
          <CreditCard className={`w-5 h-5 ${isComplete ? 'text-green-600' : 'text-gray-500'}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">Stripe Connect</span>
            <Badge className={config.color}>
              <StatusIcon className={`w-3 h-3 mr-1 ${config.icon === Loader2 ? 'animate-spin' : ''}`} />
              {config.label}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{config.description}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={handleAction} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isComplete ? (
          <>Dashboard <ExternalLink className="w-3 h-3 ml-1" /></>
        ) : isConnected ? (
          <>Continue <ChevronRight className="w-3 h-3 ml-1" /></>
        ) : (
          <>Set Up <ChevronRight className="w-3 h-3 ml-1" /></>
        )}
      </Button>
    </div>
  );
}

export default StripeConnectStatusCard;
