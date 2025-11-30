/**
 * MarketingPro 1.1 - Gift Cards Stats Component
 * @description Stats overview for the Gift Cards tab
 */

import { Gift, DollarSign, CheckCircle2, BarChart3 } from 'lucide-react';
import { StatsCard } from '../shared';

export function GiftCardsStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        title="Total Sold"
        value={487}
        trend={{ value: '+12%', isPositive: true }}
        icon={Gift}
        color="pink"
      />
      <StatsCard
        title="Active Balance"
        value="$12,340"
        subtitle="Outstanding"
        icon={DollarSign}
        color="green"
      />
      <StatsCard
        title="Redeemed"
        value="$8,920"
        subtitle="This month"
        icon={CheckCircle2}
        color="blue"
      />
      <StatsCard
        title="Redemption Rate"
        value="68%"
        trend={{ value: '+5%', isPositive: true }}
        icon={BarChart3}
        color="purple"
      />
    </div>
  );
}
