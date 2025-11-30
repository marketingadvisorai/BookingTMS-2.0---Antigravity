/**
 * MarketingPro 1.1 - Reviews Stats Component
 * @description Stats overview for the Reviews tab
 */

import { Star, MessageSquare, CheckCircle, ThumbsUp } from 'lucide-react';
import { StatsCard } from '../shared';

export function ReviewsStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        title="Average Rating"
        value="4.8"
        subtitle="1,234 reviews"
        icon={Star}
        color="yellow"
      />
      <StatsCard
        title="New Reviews"
        value={47}
        trend={{ value: '+22% this month', isPositive: true }}
        icon={MessageSquare}
        color="blue"
      />
      <StatsCard
        title="Response Rate"
        value="92%"
        subtitle="Within 24 hours"
        icon={CheckCircle}
        color="green"
      />
      <StatsCard
        title="Positive Reviews"
        value="89%"
        subtitle="4-5 stars"
        icon={ThumbsUp}
        color="purple"
      />
    </div>
  );
}
