/**
 * Current Plan Card
 * Displays current subscription status with Stripe-inspired design
 * @module billing/components
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, Calendar, Shield, Award, CheckCircle2, 
  AlertCircle, Clock, Loader2 
} from 'lucide-react';
import type { Subscription, SubscriptionPlan } from '../types';

interface CurrentPlanCardProps {
  subscription: Subscription | null;
  plan: SubscriptionPlan | null;
  loading?: boolean;
  onManageSubscription: () => void;
  isDark?: boolean;
}

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  active: { icon: CheckCircle2, color: 'emerald', label: 'Active' },
  trialing: { icon: Clock, color: 'blue', label: 'Trial' },
  past_due: { icon: AlertCircle, color: 'amber', label: 'Past Due' },
  canceled: { icon: AlertCircle, color: 'red', label: 'Canceled' },
  unpaid: { icon: AlertCircle, color: 'red', label: 'Unpaid' },
};

export function CurrentPlanCard({
  subscription,
  plan,
  loading,
  onManageSubscription,
  isDark = false,
}: CurrentPlanCardProps) {
  const status = subscription?.status || 'active';
  const config = statusConfig[status] || statusConfig.active;
  const StatusIcon = config.icon;

  const cardBg = isDark 
    ? 'border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-[#161616]'
    : 'border-purple-200 bg-gradient-to-br from-purple-50 to-white';

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  if (loading) {
    return (
      <Card className={`border shadow-lg ${cardBg}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const renewalDate = subscription?.current_period_end 
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card className={`border shadow-lg ${cardBg}`}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4 w-full">
            {/* Plan Icon */}
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ${
              isDark 
                ? 'bg-gradient-to-br from-[#4f46e5] to-[#4338ca]' 
                : 'bg-gradient-to-br from-purple-600 to-purple-700'
            }`}>
              <Star className="w-8 h-8 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Plan Name & Status */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className={`text-xl font-semibold ${textClass}`}>
                  {plan?.name || 'Free'} Plan
                </h2>
                <Badge className={`${
                  isDark 
                    ? `bg-${config.color}-500/20 text-${config.color}-400` 
                    : `bg-${config.color}-100 text-${config.color}-700`
                } border-0`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>

              {/* Description */}
              <p className={`text-sm ${mutedClass} mb-3`}>
                {plan?.description || 'Your current subscription includes basic features'}
              </p>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                {renewalDate && (
                  <div className={`flex items-center gap-2 ${mutedClass}`}>
                    <Calendar className="w-4 h-4" />
                    Renews {renewalDate}
                  </div>
                )}
                {plan?.monthly_price !== undefined && plan.monthly_price > 0 && (
                  <div className={`flex items-center gap-2 ${mutedClass}`}>
                    <Shield className="w-4 h-4" />
                    ${plan.monthly_price}/mo
                  </div>
                )}
                {plan?.slug !== 'free' && (
                  <div className={`flex items-center gap-2 ${mutedClass}`}>
                    <Award className="w-4 h-4" />
                    Premium Support
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Manage Button */}
          <Button 
            variant="outline" 
            className="h-11 whitespace-nowrap"
            onClick={onManageSubscription}
          >
            Manage Subscription
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CurrentPlanCard;
