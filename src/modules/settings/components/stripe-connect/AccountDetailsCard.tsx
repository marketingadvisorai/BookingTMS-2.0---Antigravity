/**
 * Account Details Card
 * Shows Stripe account information
 * @module settings/components/stripe-connect/AccountDetailsCard
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { StripeAccountStatus } from './types';

interface AccountDetailsCardProps {
  isDark: boolean;
  accountId: string;
  accountStatus: StripeAccountStatus;
}

export const AccountDetailsCard: React.FC<AccountDetailsCardProps> = ({
  isDark,
  accountId,
  accountStatus,
}) => {
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedText = isDark ? 'text-gray-400' : 'text-gray-600';
  const border = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <Card className={`${cardBg} border ${border}`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm ${mutedText}`}>Account Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className={mutedText}>Account ID</span>
          <code className={`text-xs ${textColor}`}>{accountId}</code>
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
  );
};
