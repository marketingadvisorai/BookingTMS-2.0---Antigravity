/**
 * MarketingPro 1.1 - Email Stats Component
 * @description Stats overview for the Email Campaigns tab
 */

import { Mail, Eye, MousePointerClick, Target } from 'lucide-react';
import { StatsCard } from '../shared';

export function EmailStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        title="Total Sent"
        value="45.2K"
        subtitle="This month"
        icon={Mail}
        color="blue"
      />
      <StatsCard
        title="Open Rate"
        value="34.5%"
        trend={{ value: '+4.2%', isPositive: true }}
        icon={Eye}
        color="green"
      />
      <StatsCard
        title="Click Rate"
        value="12.8%"
        trend={{ value: '+2.1%', isPositive: true }}
        icon={MousePointerClick}
        color="purple"
      />
      <StatsCard
        title="Conversions"
        value={234}
        trend={{ value: '+15%', isPositive: true }}
        icon={Target}
        color="orange"
      />
    </div>
  );
}
