/**
 * MarketingPro 1.1 - Promotions Tab
 * @description Main container for the Promotions section
 */

import { PromotionsStats } from './PromotionsStats';
import { PromotionsTable } from './PromotionsTable';

interface PromotionsTabProps {
  onCreatePromo: () => void;
}

export function PromotionsTab({ onCreatePromo }: PromotionsTabProps) {
  return (
    <div className="space-y-6">
      <PromotionsStats />
      <PromotionsTable onCreatePromo={onCreatePromo} />
    </div>
  );
}
