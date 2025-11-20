import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { CreditCard, DollarSign, TrendingUp, CheckCircle, Link2, ShieldCheck, Globe, Percent, Settings, AlertCircle } from 'lucide-react';
import { useTheme } from '../layout/ThemeContext';
import { StripeConnectAdminPanel } from './StripeConnectAdminPanel';

interface PaymentsSubscriptionsSectionProps {
  selectedAccount: any | null;
  platformMetrics?: any;
  accountMetrics?: any;
}

export const PaymentsSubscriptionsSection = ({
  selectedAccount,
  platformMetrics,
  accountMetrics,
}: PaymentsSubscriptionsSectionProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const secondaryBgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';

  // Use platform or account metrics based on selection
  const metrics = selectedAccount ? accountMetrics : platformMetrics;

  const paymentData = {
    totalRevenue: metrics?.totalRevenue || 0,
    mrr: metrics?.mrr || 0,
    activeSubscriptions: metrics?.activeSubscriptions || metrics?.active_organizations || 0,
    churnRate: metrics?.churnRate || 2.5,
    lifetimeValue: metrics?.lifetimeValue || 2400,
    nextBillingDate: selectedAccount ? 'Dec 15, 2024' : 'N/A',
  };

  const [globalFeeConfig, setGlobalFeeConfig] = useState({
    platformMarkupPercent: 1.5,
    flatMarkup: 0.5,
    payoutBufferDays: 2,
    autoCapture: true,
  });

  const [accountFeeOverrides, setAccountFeeOverrides] = useState<Record<string, {
    useGlobal: boolean;
    platformMarkupPercent: number;
    flatMarkup: number;
    payoutBufferDays: number;
    autoCapture: boolean;
  }>>({});

  const [isSaving, setIsSaving] = useState(false);

  const defaultAccountFeeConfig = useMemo(() => ({
    useGlobal: true,
    ...globalFeeConfig,
  }), [globalFeeConfig]);

  const accountFeeConfig = selectedAccount
    ? accountFeeOverrides[selectedAccount.id] ?? defaultAccountFeeConfig
    : null;

  const handleGlobalFeeChange = (field: keyof typeof globalFeeConfig, value: number | boolean) => {
    setGlobalFeeConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateAccountFeeConfig = (updates: Partial<NonNullable<typeof accountFeeConfig>>) => {
    if (!selectedAccount) return;
    setAccountFeeOverrides((prev) => ({
      ...prev,
      [selectedAccount.id]: {
        ...(prev[selectedAccount.id] ?? defaultAccountFeeConfig),
        ...updates,
      },
    }));
  };

  const handleSaveStripeSettings = async () => {
    setIsSaving(true);
    try {
      // Here you would save to your backend/database
      // For now, save to localStorage as a demonstration
      const settingsToSave = {
        globalFeeConfig,
        accountFeeOverrides,
        savedAt: new Date().toISOString(),
      };

      localStorage.setItem('stripeFeesConfig', JSON.stringify(settingsToSave));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success('Settings saved successfully', {
        description: selectedAccount 
          ? `Stripe fee settings updated for ${selectedAccount.name}`
          : 'Global Stripe fee settings updated',
        duration: 3000,
      });

      console.log('Saved Stripe settings:', settingsToSave);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings', {
        description: 'Please try again or contact support',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Determine connection status and account details
  // For organizations: Only show data if they have a connected Stripe account
  // For platform view (no org selected): Show platform account
  const isOrgSelected = !!selectedAccount;
  const hasConnectedAccount = isOrgSelected ? !!selectedAccount.stripeAccountId : true;
  
  const stripeAccountId = isOrgSelected
    ? (selectedAccount.stripeAccountId || 'Not connected')
    : (import.meta.env.VITE_STRIPE_PLATFORM_ACCOUNT_ID || 'Not configured');
    
  const stripeAccountName = isOrgSelected
    ? (selectedAccount.stripeAccountId ? selectedAccount.name : 'No account linked')
    : (import.meta.env.VITE_STRIPE_PLATFORM_ACCOUNT_NAME || 'Platform account not configured');

  const connectFeatures = ['Payments', 'Refund management', 'Dispute workflows', 'Capture controls'];

  return (
    <div className={`border-b-2 ${borderColor} pb-6 mb-6`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className={`text-lg font-medium ${textClass}`}>
            {selectedAccount ? `Payments & Subscriptions - ${selectedAccount.name}` : 'Payments & Subscriptions'}
          </h2>
          <p className={`text-sm mt-1 ${mutedTextClass}`}>
            {selectedAccount 
              ? 'View payment history and subscription details for this account' 
              : 'Platform-wide payment and subscription overview'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <Card className={`${cardBgClass} border ${borderColor}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`text-lg ${textClass}`}>Revenue Overview</CardTitle>
              <DollarSign className={`w-5 h-5 ${mutedTextClass}`} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg ${secondaryBgClass}`}>
              <div className={`text-sm ${mutedTextClass} mb-1`}>Total Revenue</div>
              <div className={`text-2xl font-bold ${textClass}`}>
                ${paymentData.totalRevenue.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+12.5% vs last month</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${secondaryBgClass}`}>
                <div className={`text-xs ${mutedTextClass} mb-1`}>MRR</div>
                <div className={`text-lg font-semibold ${textClass}`}>
                  ${paymentData.mrr.toLocaleString()}
                </div>
              </div>
              <div className={`p-3 rounded-lg ${secondaryBgClass}`}>
                <div className={`text-xs ${mutedTextClass} mb-1`}>LTV</div>
                <div className={`text-lg font-semibold ${textClass}`}>
                  ${paymentData.lifetimeValue.toLocaleString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status Card */}
        <Card className={`${cardBgClass} border ${borderColor}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`text-lg ${textClass}`}>Subscription Status</CardTitle>
              <CreditCard className={`w-5 h-5 ${mutedTextClass}`} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg ${secondaryBgClass}`}>
              <div className={`text-sm ${mutedTextClass} mb-1`}>Active Subscriptions</div>
              <div className={`text-2xl font-bold ${textClass}`}>
                {paymentData.activeSubscriptions}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {hasConnectedAccount ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500">All payments up to date</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-500">No Stripe account connected</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg ${secondaryBgClass}`}>
                <div className={`text-xs ${mutedTextClass} mb-1`}>Churn Rate</div>
                <div className={`text-lg font-semibold ${textClass}`}>
                  {paymentData.churnRate}%
                </div>
              </div>
              {selectedAccount && (
                <div className={`p-3 rounded-lg ${secondaryBgClass}`}>
                  <div className={`text-xs ${mutedTextClass} mb-1`}>Next Billing</div>
                  <div className={`text-xs font-semibold ${textClass}`}>
                    {paymentData.nextBillingDate}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stripe Connect Setup */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className={`${cardBgClass} border ${borderColor} xl:col-span-2`}>
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className={`text-lg ${textClass}`}>Stripe Connect Setup</CardTitle>
              <p className={`text-sm mt-1 ${mutedTextClass}`}>
                Manage embedded components, onboarding, and delegated access for {selectedAccount ? selectedAccount.name : 'all accounts'}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href="https://docs.stripe.com/connect/connect-embedded-components/quickstart" target="_blank" rel="noreferrer">
                  <Link2 className="w-4 h-4" /> Quickstart
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href="https://dashboard.stripe.com/settings/connect" target="_blank" rel="noreferrer">
                  <Settings className="w-4 h-4" /> Stripe Dashboard
                </a>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-4 rounded-lg border ${borderColor} ${secondaryBgClass}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    {hasConnectedAccount ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                    )}
                    <span className={`text-sm font-medium ${textClass}`}>
                      {selectedAccount ? 'Connected account status' : 'Platform connection status'}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${mutedTextClass}`}>
                    {hasConnectedAccount
                      ? (selectedAccount ? 'Syncing payouts, refunds, and disputes for this account.' : 'Controls defaults for every connected organization.')
                      : 'No Stripe account connected. Connect an account to enable payments.'}
                  </p>
                </div>
                <Badge 
                  variant="outline" 
                  className={hasConnectedAccount 
                    ? "px-3 py-1 border-emerald-500 text-emerald-500 bg-emerald-50 dark:bg-emerald-950" 
                    : "px-3 py-1 border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950"}
                >
                  {hasConnectedAccount ? (selectedAccount ? 'Connected' : 'Live') : 'Not Connected'}
                </Badge>
              </div>
              <dl className={`mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm ${textClass}`}>
                <div>
                  <dt className={`text-xs uppercase ${mutedTextClass}`}>Account ID</dt>
                  <dd className="font-semibold" data-component-name="PaymentsSubscriptionsSection">
                    {stripeAccountId}
                  </dd>
                </div>
                <div>
                  <dt className={`text-xs uppercase ${mutedTextClass}`}>Account name</dt>
                  <dd className="font-semibold">
                    {stripeAccountName}
                  </dd>
                </div>
                <div>
                  <dt className={`text-xs uppercase ${mutedTextClass}`}>Environment</dt>
                  <dd className="font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Test & Live
                  </dd>
                </div>
              </dl>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border ${borderColor}`}>
                <p className={`text-xs uppercase tracking-wide ${mutedTextClass} mb-2`}>Account session</p>
                <p className={`text-sm ${textClass}`}>
                  Use <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 text-xs">stripe.accountSessions.create</code> per login to delegate dashboard access.
                </p>
                <ul className="mt-3 space-y-2 text-xs text-[#a0aec0] dark:text-gray-400">
                  {connectFeatures.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-indigo-500" /> {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`p-4 rounded-lg border ${borderColor}`}>
                <p className={`text-xs uppercase tracking-wide ${mutedTextClass} mb-2`}>Client integration</p>
                <p className={`text-sm ${textClass}`}>
                  Initialize <strong>loadConnectAndInitialize</strong> with our publishable key, pass `fetchClientSecret`, and mount <em>ConnectPayments</em> or other components.
                </p>
                <div className="mt-3 flex gap-3 text-xs">
                  <Badge variant="secondary" className="gap-1">npm install @stripe/connect-js</Badge>
                  <Badge variant="secondary" className="gap-1">Supports React & Web</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${cardBgClass} border ${borderColor}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className={`text-lg ${textClass}`}>Stripe Fees & Markups</CardTitle>
              <Percent className={`w-5 h-5 ${mutedTextClass}`} />
            </div>
            <p className={`text-sm mt-2 ${mutedTextClass}`}>
              Configure how much we charge on top of Stripe processing fees{selectedAccount ? ' for this account' : ' globally'}.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAccount && accountFeeConfig && (
              <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm" style={{ borderColor }}>
                <span className={textClass}>Use global defaults</span>
                <Switch
                  checked={accountFeeConfig.useGlobal}
                  onCheckedChange={(checked) =>
                    updateAccountFeeConfig(
                      checked
                        ? { useGlobal: true }
                        : { useGlobal: false, ...globalFeeConfig }
                    )
                  }
                />
              </div>
            )}

            {(!selectedAccount || (accountFeeConfig && !accountFeeConfig.useGlobal)) && (
              <div className="space-y-3">
                <label className="text-xs uppercase tracking-wide flex items-center justify-between">
                  <span className={mutedTextClass}>Platform markup (%)</span>
                  <span className={textClass}>{selectedAccount ? accountFeeConfig?.platformMarkupPercent : globalFeeConfig.platformMarkupPercent}%</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={selectedAccount ? accountFeeConfig?.platformMarkupPercent : globalFeeConfig.platformMarkupPercent}
                  onChange={(e) =>
                    selectedAccount
                      ? updateAccountFeeConfig({ platformMarkupPercent: Number(e.target.value) })
                      : handleGlobalFeeChange('platformMarkupPercent', Number(e.target.value))
                  }
                />
                <label className="text-xs uppercase tracking-wide flex items-center justify-between">
                  <span className={mutedTextClass}>Flat markup (USD)</span>
                  <span className={textClass}>${selectedAccount ? accountFeeConfig?.flatMarkup : globalFeeConfig.flatMarkup}</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.05"
                  value={selectedAccount ? accountFeeConfig?.flatMarkup : globalFeeConfig.flatMarkup}
                  onChange={(e) =>
                    selectedAccount
                      ? updateAccountFeeConfig({ flatMarkup: Number(e.target.value) })
                      : handleGlobalFeeChange('flatMarkup', Number(e.target.value))
                  }
                />
                <label className="text-xs uppercase tracking-wide flex items-center justify-between">
                  <span className={mutedTextClass}>Payout buffer (days)</span>
                  <span className={textClass}>{selectedAccount ? accountFeeConfig?.payoutBufferDays : globalFeeConfig.payoutBufferDays} days</span>
                </label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={selectedAccount ? accountFeeConfig?.payoutBufferDays : globalFeeConfig.payoutBufferDays}
                  onChange={(e) =>
                    selectedAccount
                      ? updateAccountFeeConfig({ payoutBufferDays: Number(e.target.value) })
                      : handleGlobalFeeChange('payoutBufferDays', Number(e.target.value))
                  }
                />
                <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm" style={{ borderColor }}>
                  <span className={textClass}>Auto-capture payments</span>
                  <Switch
                    checked={selectedAccount ? accountFeeConfig?.autoCapture ?? true : globalFeeConfig.autoCapture}
                    onCheckedChange={(checked) =>
                      selectedAccount
                        ? updateAccountFeeConfig({ autoCapture: checked })
                        : handleGlobalFeeChange('autoCapture', checked)
                    }
                  />
                </div>
              </div>
            )}

            {selectedAccount && accountFeeConfig?.useGlobal && (
              <p className={`text-xs ${mutedTextClass}`}>
                This account inherits <strong>{globalFeeConfig.platformMarkupPercent}% + ${globalFeeConfig.flatMarkup.toFixed(2)}</strong> markup and {globalFeeConfig.payoutBufferDays}-day payout buffer from the platform defaults.
              </p>
            )}

            <Button 
              className="w-full" 
              variant="default"
              onClick={handleSaveStripeSettings}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Stripe settings'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stripe Connect Admin Panel - Only for All Accounts View */}
      {!selectedAccount && (
        <div className="mt-6">
          <StripeConnectAdminPanel />
        </div>
      )}

    </div>
  );
};
