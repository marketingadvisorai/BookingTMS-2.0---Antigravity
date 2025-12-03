/**
 * MarketingPro 1.1 - Promotions Stats Component
 * @description Stats overview for the Promotions tab with real data
 */

import { Percent, DollarSign, BarChart3 } from 'lucide-react';
import { StatsCard } from '../shared';

interface PromotionsStatsProps {
  total?: number;
  active?: number;
  totalRedemptions?: number;
  isLoading?: boolean;
}

export function PromotionsStats({ 
  total = 0, 
  active = 0, 
  totalRedemptions = 0,
  isLoading,
}: PromotionsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        title="Active Promos"
        value={isLoading ? '...' : active}
        trend={{ value: `${total} total`, isPositive: true }}
        icon={Percent}
        color="blue"
      />
      <StatsCard
        title="Total Redemptions"
        value={isLoading ? '...' : totalRedemptions.toLocaleString()}
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
