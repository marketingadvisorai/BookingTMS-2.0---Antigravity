/**
 * Plans Section
 * Displays subscription plan cards
 * @module system-admin/components/dashboard/PlansSection
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Crown, Star } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import type { Plan } from '../../types';

// Plan color mapping
const PLAN_COLORS: Record<string, string> = {
  Basic: '#6b7280',
  Growth: '#10b981',
  Pro: '#4f46e5',
  Enterprise: '#7c3aed',
};

const getPlanColor = (planName: string): string => {
  return PLAN_COLORS[planName] || '#6b7280';
};

interface PlansSectionProps {
  plans: Plan[];
  isLoading?: boolean;
  onManagePlan: (plan: Plan) => void;
}

export function PlansSection({ plans, isLoading = false, onManagePlan }: PlansSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';

  // Get feature list from JSONB features field
  const getFeatureList = (features: unknown): string[] => {
    if (Array.isArray(features)) return features;
    if (typeof features === 'object' && features !== null) {
      return Object.entries(features)
        .filter(([, v]) => v === true)
        .map(([k]) => k.replace(/_/g, ' '));
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="pb-6">
        <h2 className={`text-lg font-medium mb-4 ${textClass}`}>Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className={`${cardBgClass} border ${borderColor} animate-pulse`}>
              <CardContent className="p-6 h-64" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      <h2 className={`text-lg font-medium mb-4 ${textClass}`}>Subscription Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const color = getPlanColor(plan.name);
          const featureList = getFeatureList(plan.features);
          const isPopular = plan.name === 'Growth';

          return (
            <Card
              key={plan.id || plan.name}
              className={`${cardBgClass} border ${borderColor} relative overflow-hidden transition-all hover:shadow-lg`}
              style={{ borderTopColor: color, borderTopWidth: '3px' }}
            >
              {isPopular && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5" style={{ color }} />
                  <CardTitle className={textClass}>{plan.name}</CardTitle>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <span className={`text-3xl font-bold ${textClass}`}>
                    ${(plan.price_monthly || 0).toLocaleString()}
                  </span>
                  <span className={`text-sm ${mutedTextClass}`}>/month</span>
                </div>

                <div className="space-y-2">
                  {featureList.slice(0, 5).map((feature, idx) => (
                    <div key={idx} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
                      <span className={`text-sm ${mutedTextClass}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className={`text-sm ${mutedTextClass} pt-2 border-t ${borderColor}`}>
                  {plan.subscriber_count || 0} subscribers
                </div>

                <Button
                  variant="outline"
                  onClick={() => onManagePlan(plan)}
                  className="w-full"
                  style={{ borderColor: color, color }}
                >
                  Manage Plan
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default PlansSection;
