/**
 * Billing Page
 * Main billing and subscription management page
 * @module billing/pages
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from '@/components/layout/ThemeContext';
import { PageHeader } from '@/components/layout/PageHeader';
import { toast } from 'sonner';
import { useBilling } from '../hooks/useBilling';
import {
  CurrentPlanCard,
  CreditBalanceCard,
  PlanSelector,
  InvoiceHistory,
  CreditPurchaseDialog,
  BillingCycleToggle,
  CreditInfoSection,
} from '../components';
import type { SubscriptionPlan } from '../types';

export function BillingPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();

  const {
    subscription,
    creditBalance,
    plans,
    creditPackages,
    invoices,
    loading,
    createCheckout,
    openPortal,
    buyCredits,
    refresh,
  } = useBilling();

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [processingPlan, setProcessingPlan] = useState(false);

  // Handle URL params for success/cancel
  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    const credits = searchParams.get('credits');

    if (success === 'true') {
      toast.success('Subscription updated successfully!');
      refresh();
    } else if (canceled === 'true') {
      toast.info('Subscription change was cancelled');
    } else if (credits === 'success') {
      toast.success('Credits purchased successfully!');
      refresh();
    } else if (credits === 'canceled') {
      toast.info('Credit purchase was cancelled');
    }
  }, [searchParams, refresh]);

  const currentPlan = subscription?.subscription_plans || plans.find(p => p.slug === 'free');

  /**
   * Handle plan selection
   */
  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan.slug === 'enterprise') {
      toast.info('Please contact our sales team for Enterprise pricing');
      return;
    }

    const priceId = billingCycle === 'yearly' 
      ? plan.stripe_price_id_yearly 
      : plan.stripe_price_id_monthly;

    if (!priceId) {
      toast.error('Price not configured for this plan');
      return;
    }

    setProcessingPlan(true);
    try {
      const url = await createCheckout(priceId);
      if (url) {
        window.location.href = url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } finally {
      setProcessingPlan(false);
    }
  };

  /**
   * Handle manage subscription
   */
  const handleManageSubscription = async () => {
    const url = await openPortal();
    if (url) {
      window.open(url, '_blank');
    } else {
      toast.error('Failed to open billing portal');
    }
  };

  /**
   * Handle credit purchase
   */
  const handleCreditPurchase = async (packageId: string) => {
    const url = await buyCredits(packageId);
    if (url) {
      window.location.href = url;
    } else {
      toast.error('Failed to create checkout session');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Billing & Subscription"
        description="Manage your plan, billing, and payment information"
        sticky
      />

      {/* Current Plan */}
      <CurrentPlanCard
        subscription={subscription}
        plan={currentPlan || null}
        loading={loading}
        onManageSubscription={handleManageSubscription}
        isDark={isDark}
      />

      {/* Billing Cycle Toggle */}
      <BillingCycleToggle
        value={billingCycle}
        onChange={setBillingCycle}
        discountPercent={20}
        isDark={isDark}
      />

      {/* Plan Selector */}
      <PlanSelector
        plans={plans}
        currentPlanSlug={currentPlan?.slug}
        billingCycle={billingCycle}
        loading={processingPlan}
        onSelectPlan={handleSelectPlan}
        isDark={isDark}
      />

      {/* Credit Info */}
      <CreditInfoSection isDark={isDark} />

      {/* Credit & Invoice Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreditBalanceCard
          creditBalance={creditBalance}
          loading={loading}
          onBuyCredits={() => setShowCreditDialog(true)}
          isDark={isDark}
        />

        <InvoiceHistory
          invoices={invoices}
          loading={loading}
          isDark={isDark}
        />
      </div>

      {/* Credit Purchase Dialog */}
      <CreditPurchaseDialog
        open={showCreditDialog}
        onOpenChange={setShowCreditDialog}
        packages={creditPackages}
        onPurchase={handleCreditPurchase}
        isDark={isDark}
      />
    </div>
  );
}

export default BillingPage;
