/**
 * Connect Options Cards
 * Shows options to create new or link existing Stripe account
 * @module settings/components/stripe-connect/ConnectOptionsCards
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Plus, Link2, CheckCircle, Building2, Loader2 } from 'lucide-react';
import type { ActionType } from './types';

interface ConnectOptionsCardsProps {
  isDark: boolean;
  actionLoading: ActionType;
  onCreateAccount: () => void;
  onLinkExisting: () => void;
}

export const ConnectOptionsCards: React.FC<ConnectOptionsCardsProps> = ({
  isDark,
  actionLoading,
  onCreateAccount,
  onLinkExisting,
}) => {
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedText = isDark ? 'text-gray-400' : 'text-gray-600';
  const border = isDark ? 'border-gray-700' : 'border-gray-200';

  const features = [
    { create: 'Quick 5-minute setup', link: 'Keep existing settings' },
    { create: 'Stripe handles verification', link: 'Instant connection' },
    { create: 'Express Dashboard access', link: 'Full Stripe Dashboard' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={`${cardBg} border ${border}`}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10">
              <CreditCard className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <CardTitle className={textColor}>Connect Stripe Account</CardTitle>
              <CardDescription className={mutedText}>
                Accept payments from customers and receive payouts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create New */}
        <Card className={`${cardBg} border ${border} hover:border-indigo-500/50 transition-colors`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <Plus className="w-5 h-5 text-indigo-500" />
              </div>
              <CardTitle className={`text-lg ${textColor}`}>Create New Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`text-sm ${mutedText}`}>
              Set up a new Stripe account with guided onboarding. Best for businesses
              that don't have an existing Stripe account.
            </p>
            <ul className={`text-sm space-y-2 ${mutedText}`}>
              {features.map(({ create }) => (
                <li key={create} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {create}
                </li>
              ))}
            </ul>
            <Separator />
            <Button
              onClick={onCreateAccount}
              disabled={actionLoading === 'create'}
              className="w-full"
            >
              {actionLoading === 'create' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Stripe Account
            </Button>
          </CardContent>
        </Card>

        {/* Link Existing */}
        <Card className={`${cardBg} border ${border} hover:border-emerald-500/50 transition-colors`}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Link2 className="w-5 h-5 text-emerald-500" />
              </div>
              <CardTitle className={`text-lg ${textColor}`}>Link Existing Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className={`text-sm ${mutedText}`}>
              Connect your existing Stripe account to this platform. Best for businesses
              already using Stripe for payments.
            </p>
            <ul className={`text-sm space-y-2 ${mutedText}`}>
              {features.map(({ link }) => (
                <li key={link} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  {link}
                </li>
              ))}
            </ul>
            <Separator />
            <Button
              onClick={onLinkExisting}
              disabled={actionLoading === 'link'}
              variant="outline"
              className="w-full"
            >
              {actionLoading === 'link' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Link2 className="w-4 h-4 mr-2" />
              )}
              Link Existing Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className={`${cardBg} border ${isDark ? 'border-blue-800' : 'border-blue-200'} 
        ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Building2 className="w-5 h-5 text-blue-500 mt-0.5" />
            <div className={`text-sm ${mutedText}`}>
              <p className="font-medium text-blue-500">Platform Fee Information</p>
              <p className="mt-1">
                A small platform fee is applied to each booking to support platform services.
                You'll see the exact fee breakdown in your Stripe dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
