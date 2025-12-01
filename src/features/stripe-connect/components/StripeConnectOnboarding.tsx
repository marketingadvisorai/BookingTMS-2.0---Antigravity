/**
 * Stripe Connect Onboarding Component
 * 
 * Beautiful step-by-step onboarding wizard for Stripe Connect.
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  CreditCard,
  Building2,
  Shield,
  ExternalLink,
  Loader2,
  AlertCircle,
  ArrowRight,
  Wallet,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStripeConnect } from '../hooks/useStripeConnect';
import { toast } from 'sonner';

interface StripeConnectOnboardingProps {
  organizationId: string;
  organizationName: string;
  organizationEmail?: string;
  onComplete?: () => void;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'IE', name: 'Ireland' },
  { code: 'SG', name: 'Singapore' },
  { code: 'JP', name: 'Japan' },
];

const STATUS_CONFIG = {
  not_started: { label: 'Not Started', color: 'bg-gray-500', icon: Circle },
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Loader2 },
  in_progress: { label: 'In Progress', color: 'bg-blue-500', icon: Loader2 },
  action_required: { label: 'Action Required', color: 'bg-orange-500', icon: AlertCircle },
  complete: { label: 'Complete', color: 'bg-green-500', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-500', icon: AlertCircle },
};

export function StripeConnectOnboarding({
  organizationId,
  organizationName,
  organizationEmail = '',
  onComplete,
}: StripeConnectOnboardingProps) {
  const {
    status,
    isLoading,
    error,
    onboardingUrl,
    isConnected,
    isComplete,
    needsAction,
    createAccount,
    getOnboardingLink,
    openDashboard,
    fetchStatus,
    clearError,
  } = useStripeConnect(organizationId);

  const [step, setStep] = useState<'info' | 'create' | 'onboard' | 'complete'>('info');
  const [formData, setFormData] = useState({
    email: organizationEmail,
    country: 'US',
    businessType: 'company' as 'individual' | 'company',
    businessName: organizationName,
  });

  // Determine current step based on status
  React.useEffect(() => {
    if (isComplete) {
      setStep('complete');
    } else if (isConnected) {
      setStep('onboard');
    } else {
      setStep('info');
    }
  }, [isConnected, isComplete]);

  const handleCreateAccount = async () => {
    try {
      const result = await createAccount({
        email: formData.email,
        country: formData.country,
        businessType: formData.businessType,
        businessName: formData.businessName,
      });

      toast.success('Account created!', {
        description: 'Now complete the Stripe onboarding',
      });

      // Open onboarding URL
      if (result.onboardingUrl) {
        window.open(result.onboardingUrl, '_blank');
      }

      setStep('onboard');
    } catch (err) {
      toast.error('Failed to create account');
    }
  };

  const handleContinueOnboarding = async () => {
    try {
      const url = await getOnboardingLink();
      window.open(url, '_blank');
    } catch (err) {
      toast.error('Failed to get onboarding link');
    }
  };

  const statusConfig = status?.onboardingStatus 
    ? STATUS_CONFIG[status.onboardingStatus] 
    : STATUS_CONFIG.not_started;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <Card className="border-0 bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-white">Stripe Connect</CardTitle>
                <CardDescription className="text-purple-100">
                  Accept payments for {organizationName}
                </CardDescription>
              </div>
            </div>
            <Badge className={`${statusConfig.color} text-white border-0`}>
              <StatusIcon className={`w-3 h-3 mr-1 ${statusConfig.icon === Loader2 ? 'animate-spin' : ''}`} />
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Account Info (Not Connected) */}
      {step === 'info' && !isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              Set Up Payment Account
            </CardTitle>
            <CardDescription>
              Create a Stripe Express account to start accepting payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="payments@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Your Company Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={formData.country} onValueChange={(v) => setFormData({ ...formData, country: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Select 
                  value={formData.businessType} 
                  onValueChange={(v: 'individual' | 'company') => setFormData({ ...formData, businessType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
              <p className="text-sm font-medium mb-3">What you get with Stripe Connect:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: CreditCard, text: 'Accept card payments' },
                  { icon: Shield, text: 'PCI compliant & secure' },
                  { icon: Wallet, text: 'Automatic payouts' },
                  { icon: Building2, text: 'Multi-currency support' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Icon className="w-4 h-4 text-purple-600" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreateAccount}
              disabled={isLoading || !formData.email}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Onboarding in Progress */}
      {step === 'onboard' && isConnected && !isComplete && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Complete Verification
            </CardTitle>
            <CardDescription>
              {needsAction 
                ? 'Additional information is required to activate your account'
                : 'Continue the Stripe onboarding process to activate payments'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account Info */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Account ID</span>
                <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                  {status?.stripeAccountId}
                </code>
              </div>
              {status?.account && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Charges</span>
                    <Badge variant={status.account.chargesEnabled ? 'default' : 'secondary'}>
                      {status.account.chargesEnabled ? 'Enabled' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Payouts</span>
                    <Badge variant={status.account.payoutsEnabled ? 'default' : 'secondary'}>
                      {status.account.payoutsEnabled ? 'Enabled' : 'Pending'}
                    </Badge>
                  </div>
                </>
              )}
            </div>

            {/* Requirements Alert */}
            {status?.account?.requirements?.currentlyDue?.length ? (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-orange-800 dark:text-orange-200">
                      Action Required
                    </p>
                    <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                      {status.account.requirements.currentlyDue.length} item(s) need your attention
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex gap-3">
              <Button
                onClick={handleContinueOnboarding}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="w-4 h-4 mr-2" />
                )}
                Continue Onboarding
              </Button>
              <Button variant="outline" onClick={fetchStatus} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step: Complete */}
      {step === 'complete' && isComplete && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              Account Ready
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-300">
              Your Stripe account is fully set up and ready to accept payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                <CreditCard className="w-6 h-6 mx-auto text-green-600 mb-2" />
                <p className="text-sm text-gray-500">Charges</p>
                <p className="font-medium text-green-600">Enabled</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                <Wallet className="w-6 h-6 mx-auto text-green-600 mb-2" />
                <p className="text-sm text-gray-500">Payouts</p>
                <p className="font-medium text-green-600">Enabled</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={openDashboard} disabled={isLoading} className="flex-1">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Stripe Dashboard
              </Button>
              {onComplete && (
                <Button variant="outline" onClick={onComplete}>
                  Done
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default StripeConnectOnboarding;
