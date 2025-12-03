/**
 * MarketingPro 1.1 - Reviews Tab
 * @description Main container for the Reviews section with Supabase integration
 */

import { ReviewsStats } from './ReviewsStats';
import { ReviewsList } from './ReviewsList';
import { ReviewPlatforms } from './ReviewPlatforms';
import { useOrganizationMarketing } from '../../hooks/useOrganizationMarketing';

export function ReviewsTab() {
  const { reviews, stats, isLoading, respondToReview } = useOrganizationMarketing();

  return (
    <div className="space-y-6">
      <ReviewsStats 
        total={stats?.reviews?.total || 0}
        averageRating={stats?.reviews?.averageRating || 0}
        positive={stats?.reviews?.positive || 0}
        negative={stats?.reviews?.negative || 0}
        isLoading={isLoading}
      />
      <ReviewsList 
        reviews={reviews}
        isLoading={isLoading}
        onRespond={respondToReview}
      />
      <ReviewPlatforms />
    </div>
  );
}
