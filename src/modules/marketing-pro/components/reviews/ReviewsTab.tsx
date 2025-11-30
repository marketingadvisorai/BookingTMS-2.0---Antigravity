/**
 * MarketingPro 1.1 - Reviews Tab
 * @description Main container for the Reviews section
 */

import { ReviewsStats } from './ReviewsStats';
import { ReviewsList } from './ReviewsList';
import { ReviewPlatforms } from './ReviewPlatforms';

export function ReviewsTab() {
  return (
    <div className="space-y-6">
      <ReviewsStats />
      <ReviewsList />
      <ReviewPlatforms />
    </div>
  );
}
