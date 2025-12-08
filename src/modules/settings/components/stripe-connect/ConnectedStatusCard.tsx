/**
 * Connected Status Card
 * Shows connected status header with refresh button
 * @module settings/components/stripe-connect/ConnectedStatusCard
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw } from 'lucide-react';

interface ConnectedStatusCardProps {
  isDark: boolean;
  loading: boolean;
  onRefresh: () => void;
}

export const ConnectedStatusCard: React.FC<ConnectedStatusCardProps> = ({
  isDark,
  loading,
  onRefresh,
}) => {
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedText = isDark ? 'text-gray-400' : 'text-gray-600';
  const border = isDark ? 'border-gray-700' : 'border-gray-200';

  return (
    <Card className={`${cardBg} border ${border}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className={textColor}>Stripe Connected</CardTitle>
              <CardDescription className={mutedText}>
                Your account is linked and ready to accept payments
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onRefresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};
