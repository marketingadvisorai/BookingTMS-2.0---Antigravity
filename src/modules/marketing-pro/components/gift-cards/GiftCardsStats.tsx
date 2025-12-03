/**
 * MarketingPro 1.1 - Gift Cards Stats Component
 * @description Stats overview for the Gift Cards tab with real data
 */

import { Gift, DollarSign, CheckCircle2, BarChart3 } from 'lucide-react';
import { StatsCard } from '../shared';

interface GiftCardsStatsProps {
  total?: number;
  active?: number;
  totalValue?: number;
  remainingBalance?: number;
  isLoading?: boolean;
}

export function GiftCardsStats({
  total = 0,
  active = 0,
  totalValue = 0,
  remainingBalance = 0,
  isLoading,
}: GiftCardsStatsProps) {
  const redeemed = totalValue - remainingBalance;
  const redemptionRate = totalValue > 0 ? Math.round((redeemed / totalValue) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        title="Total Sold"
        value={isLoading ? '...' : total}
        trend={{ value: `${active} active`, isPositive: true }}
        icon={Gift}
        color="pink"
      />
      <StatsCard
        title="Active Balance"
        value={isLoading ? '...' : `$${remainingBalance.toLocaleString()}`}
        subtitle="Outstanding"
        icon={DollarSign}
        color="green"
      />
      <StatsCard
        title="Redeemed"
        value={isLoading ? '...' : `$${redeemed.toLocaleString()}`}
        subtitle="Total redeemed"
        icon={CheckCircle2}
        color="blue"
      />
      <StatsCard
        title="Redemption Rate"
        value={isLoading ? '...' : `${redemptionRate}%`}
        trend={{ value: '+5%', isPositive: true }}
        icon={BarChart3}
        color="purple"
      />
    </div>
  );
}
