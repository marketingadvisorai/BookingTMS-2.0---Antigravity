/**
 * Billing Cycle Toggle
 * Monthly/Yearly toggle with discount badge
 * @module billing/components
 */

import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Percent } from 'lucide-react';

interface BillingCycleToggleProps {
  value: 'monthly' | 'yearly';
  onChange: (value: 'monthly' | 'yearly') => void;
  discountPercent?: number;
  isDark?: boolean;
}

export function BillingCycleToggle({
  value,
  onChange,
  discountPercent = 20,
  isDark = false,
}: BillingCycleToggleProps) {
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const bgClass = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';

  return (
    <div className={`flex items-center justify-center gap-4 p-4 rounded-lg border ${borderClass} ${bgClass}`}>
      <span className={`text-sm font-medium ${value === 'monthly' ? textClass : mutedClass}`}>
        Monthly
      </span>
      <Switch
        checked={value === 'yearly'}
        onCheckedChange={(checked) => onChange(checked ? 'yearly' : 'monthly')}
      />
      <span className={`text-sm font-medium ${value === 'yearly' ? textClass : mutedClass}`}>
        Yearly
      </span>
      {value === 'yearly' && discountPercent > 0 && (
        <Badge className={`${
          isDark 
            ? 'bg-emerald-500/20 text-emerald-400' 
            : 'bg-green-100 text-green-700'
        } border-0`}>
          <Percent className="w-3 h-3 mr-1" />
          Save {discountPercent}%
        </Badge>
      )}
    </div>
  );
}

export default BillingCycleToggle;
