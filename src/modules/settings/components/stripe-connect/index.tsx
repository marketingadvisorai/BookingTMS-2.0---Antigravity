/**
 * Stripe Connect Tab - Main Component
 * Orchestrates all Stripe Connect functionality
 * @module settings/components/stripe-connect
 * 
 * Refactored from 561 lines to ~80 lines using modular architecture
 */

import React from 'react';
import { useTheme } from '@/components/layout/ThemeContext';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink } from 'lucide-react';

import { useStripeConnect } from './useStripeConnect';
import { ConnectedStatusCard } from './ConnectedStatusCard';
import { AccountDetailsCard } from './AccountDetailsCard';
import { CapabilitiesCard } from './CapabilitiesCard';
import { RequirementsAlert } from './RequirementsAlert';
import { ConnectOptionsCards } from './ConnectOptionsCards';
import type { StripeConnectTabProps } from './types';

// Re-export types for external use
export * from './types';
export { stripeConnectService } from './stripe-connect.service';
export { useStripeConnect } from './useStripeConnect';

export const StripeConnectTab: React.FC<StripeConnectTabProps> = (props) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    loading,
    actionLoading,
    accountStatus,
    existingAccountId,
    isConnected,
    handleCreateAccount,
    handleLinkExisting,
    handleOpenDashboard,
    refreshStatus,
  } = useStripeConnect(props);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // Connected state
  if (isConnected && accountStatus && existingAccountId) {
    return (
      <div className="space-y-6">
        <ConnectedStatusCard
          isDark={isDark}
          loading={loading}
          onRefresh={refreshStatus}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AccountDetailsCard
            isDark={isDark}
            accountId={existingAccountId}
            accountStatus={accountStatus}
          />
          <CapabilitiesCard isDark={isDark} accountStatus={accountStatus} />
        </div>

        <RequirementsAlert
          isDark={isDark}
          requirements={accountStatus.requirements?.currentlyDue || []}
        />

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

  // Not connected state
  return (
    <ConnectOptionsCards
      isDark={isDark}
      actionLoading={actionLoading}
      onCreateAccount={handleCreateAccount}
      onLinkExisting={handleLinkExisting}
    />
  );
};

export default StripeConnectTab;
