/**
 * MarketingPro 1.1 - Affiliate Stats Component
 * @description Stats overview for the Affiliate Program tab
 */

import { UserPlus, MousePointerClick, DollarSign, CreditCard } from 'lucide-react';
import { StatsCard } from '../shared';

export function AffiliateStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        title="Active Affiliates"
        value={34}
        trend={{ value: '+8%', isPositive: true }}
        icon={UserPlus}
        color="green"
      />
      <StatsCard
        title="Total Clicks"
        value="12.5K"
        trend={{ value: '+22%', isPositive: true }}
        icon={MousePointerClick}
        color="blue"
      />
      <StatsCard
        title="Revenue Generated"
        value="$45,670"
        trend={{ value: '+15%', isPositive: true }}
        icon={DollarSign}
        color="purple"
      />
      <StatsCard
        title="Commissions Paid"
        value="$6,850"
        subtitle="This month"
        icon={CreditCard}
        color="orange"
      />
    </div>
  );
}
