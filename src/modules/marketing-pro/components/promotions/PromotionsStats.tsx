/**
 * MarketingPro 1.1 - Promotions Stats Component
 * @description Stats overview for the Promotions tab
 */

import { Percent, DollarSign, BarChart3 } from 'lucide-react';
import { StatsCard } from '../shared';

export function PromotionsStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        title="Active Promos"
        value={12}
        trend={{ value: '+3 this month', isPositive: true }}
        icon={Percent}
        color="blue"
      />
      <StatsCard
        title="Total Redemptions"
        value="1,234"
        trend={{ value: '+18%', isPositive: true }}
        icon={Percent}
        color="green"
      />
      <StatsCard
        title="Revenue Impact"
        value="$8,450"
        trend={{ value: '+25%', isPositive: true }}
        icon={DollarSign}
        color="purple"
      />
      <StatsCard
        title="Avg Discount"
        value="15%"
        subtitle="Across all promos"
        icon={BarChart3}
        color="orange"
      />
    </div>
  );
}
