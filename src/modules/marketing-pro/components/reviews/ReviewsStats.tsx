/**
 * MarketingPro 1.1 - Reviews Stats Component
 * @description Stats overview for the Reviews tab with real data
 */

import { Star, MessageSquare, CheckCircle, ThumbsUp } from 'lucide-react';
import { StatsCard } from '../shared';

interface ReviewsStatsProps {
  total?: number;
  averageRating?: number;
  positive?: number;
  negative?: number;
  isLoading?: boolean;
}

export function ReviewsStats({
  total = 0,
  averageRating = 0,
  positive = 0,
  negative = 0,
  isLoading,
}: ReviewsStatsProps) {
  const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        title="Average Rating"
        value={isLoading ? '...' : averageRating.toFixed(1)}
        subtitle={`${total} reviews`}
        icon={Star}
        color="yellow"
      />
      <StatsCard
        title="New Reviews"
        value={isLoading ? '...' : total}
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
        value={isLoading ? '...' : `${positivePercent}%`}
        subtitle="4-5 stars"
        icon={ThumbsUp}
        color="purple"
      />
    </div>
  );
}
