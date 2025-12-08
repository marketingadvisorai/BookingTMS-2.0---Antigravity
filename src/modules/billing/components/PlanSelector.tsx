/**
 * Plan Selector Component
 * Displays available subscription plans
 * @module billing/components
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, Sparkles, Gift, Zap, Star, Crown, 
  MessageSquare, Loader2 
} from 'lucide-react';
import type { SubscriptionPlan } from '../types';

interface PlanSelectorProps {
  plans: SubscriptionPlan[];
  currentPlanSlug?: string;
  billingCycle: 'monthly' | 'yearly';
  loading?: boolean;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  isDark?: boolean;
}

const planIcons: Record<string, typeof Star> = {
  free: Gift,
  starter: Zap,
  professional: Star,
  enterprise: Crown,
};

const planColors: Record<string, { text: string; bg: string }> = {
  free: { text: 'text-emerald-600', bg: 'bg-emerald-100' },
  starter: { text: 'text-blue-600', bg: 'bg-blue-100' },
  professional: { text: 'text-purple-600', bg: 'bg-purple-100' },
  enterprise: { text: 'text-orange-600', bg: 'bg-orange-100' },
};

export function PlanSelector({
  plans,
  currentPlanSlug = 'free',
  billingCycle,
  loading,
  onSelectPlan,
  isDark = false,
}: PlanSelectorProps) {
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const cardBg = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  const calculatePrice = (plan: SubscriptionPlan) => {
    if (plan.monthly_price === 0) return 0;
    if (billingCycle === 'yearly') {
      return Math.round((plan.yearly_price / 12) * 100) / 100;
    }
    return plan.monthly_price;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {plans.map((plan) => {
        const Icon = planIcons[plan.slug] || Star;
        const colors = planColors[plan.slug] || planColors.professional;
        const isCurrentPlan = plan.slug === currentPlanSlug;
        const price = calculatePrice(plan);
        const isEnterprise = plan.slug === 'enterprise';

        return (
          <Card
            key={plan.id}
            className={`border-2 shadow-lg transition-all relative ${
              plan.is_popular
                ? isDark 
                  ? 'border-purple-500/50 bg-gradient-to-br from-purple-900/20 to-[#161616]'
                  : 'border-purple-300 bg-gradient-to-br from-purple-50 to-white'
                : isCurrentPlan
                  ? isDark 
                    ? 'border-[#4f46e5]/50 bg-gradient-to-br from-[#4f46e5]/10 to-[#161616]'
                    : 'border-blue-300 bg-gradient-to-br from-blue-50 to-white'
                  : isDark 
                    ? `border-[#2a2a2a] ${cardBg} hover:border-[#3a3a3a]`
                    : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CardHeader className="p-6">
              {/* Popular Badge */}
              {plan.is_popular && (
                <div className="absolute top-0 right-6 transform -translate-y-1/2">
                  <Badge className={`${
                    isDark ? 'bg-[#4f46e5] text-white' : 'bg-purple-600 text-white'
                  } border-0 shadow-lg`}>
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                isDark ? 'bg-[#1e1e1e]' : colors.bg
              }`}>
                <Icon className={`w-7 h-7 ${isDark ? 'text-[#6366f1]' : colors.text}`} />
              </div>

              <CardTitle className={textClass}>{plan.name}</CardTitle>
              <CardDescription className={`text-sm min-h-[40px] ${mutedClass}`}>
                {plan.description}
              </CardDescription>

              {/* Price */}
              <div className="mt-4">
                {isEnterprise ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-lg font-semibold ${textClass}`}>
                        Custom Pricing
                      </span>
                    </div>
                    <Badge className={`${
                      isDark ? 'bg-[#4f46e5]/20 text-[#6366f1]' : 'bg-blue-100 text-blue-700'
                    } border-0 mt-2`}>
                      Contact us for pricing
                    </Badge>
                  </>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-bold ${textClass}`}>
                        ${price}
                      </span>
                      <span className={`text-sm ${mutedClass}`}>/mo</span>
                    </div>
                    {billingCycle === 'yearly' && plan.monthly_price > 0 && (
                      <p className={`text-xs ${mutedClass} mt-1`}>
                        Billed ${plan.yearly_price}/year
                      </p>
                    )}
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-6 pt-0">
              <Separator className={borderClass} />

              {/* Features */}
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {(plan.features as string[]).slice(0, 8).map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                      isDark ? 'text-emerald-400' : 'text-green-600'
                    }`} />
                    <span className={`text-sm ${mutedClass}`}>{feature}</span>
                  </div>
                ))}
              </div>

              <Separator className={borderClass} />

              {/* Action Button */}
              {isCurrentPlan ? (
                <Button 
                  className={`w-full h-11 ${
                    isDark ? 'bg-[#2a2a2a] text-[#737373]' : 'bg-gray-200 text-gray-500'
                  }`} 
                  disabled
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Current Plan
                </Button>
              ) : (
                <Button
                  onClick={() => onSelectPlan(plan)}
                  disabled={loading}
                  style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}
                  className={`w-full h-11 ${
                    plan.is_popular
                      ? isDark 
                        ? 'text-white hover:bg-[#4338ca]'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                      : isDark 
                        ? 'text-white hover:bg-[#4338ca]'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : isEnterprise ? (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Contact Sales
                    </>
                  ) : (
                    <>
                      Upgrade to {plan.name}
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default PlanSelector;
