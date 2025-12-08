/**
 * Capabilities Card
 * Shows Stripe account capabilities status
 * @module settings/components/stripe-connect/CapabilitiesCard
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Wallet, Shield } from 'lucide-react';
import type { StripeAccountStatus } from './types';

interface CapabilitiesCardProps {
  isDark: boolean;
  accountStatus: StripeAccountStatus;
}

export const CapabilitiesCard: React.FC<CapabilitiesCardProps> = ({
  isDark,
  accountStatus,
}) => {
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const mutedText = isDark ? 'text-gray-400' : 'text-gray-600';
  const border = isDark ? 'border-gray-700' : 'border-gray-200';

  const capabilities = [
    {
      icon: CreditCard,
      label: 'Card Payments',
      enabled: accountStatus.chargesEnabled,
    },
    {
      icon: Wallet,
      label: 'Payouts',
      enabled: accountStatus.payoutsEnabled,
    },
    {
      icon: Shield,
      label: 'Verification',
      enabled: accountStatus.detailsSubmitted,
      pendingLabel: 'Pending',
    },
  ];

  return (
    <Card className={`${cardBg} border ${border}`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm ${mutedText}`}>Capabilities</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {capabilities.map(({ icon: Icon, label, enabled, pendingLabel }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className={mutedText}>{label}</span>
            </div>
            {enabled ? (
              <Badge className="bg-emerald-500/20 text-emerald-500 border-emerald-500">
                Enabled
              </Badge>
            ) : pendingLabel ? (
              <Badge variant="outline" className="border-amber-500 text-amber-500">
                {pendingLabel}
              </Badge>
            ) : (
              <Badge variant="destructive">Disabled</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
