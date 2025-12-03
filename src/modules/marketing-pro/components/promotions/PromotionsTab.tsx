/**
 * MarketingPro 1.1 - Promotions Tab
 * @description Main container for the Promotions section with Supabase integration
 */

import { PromotionsStats } from './PromotionsStats';
import { PromotionsTable } from './PromotionsTable';
import { useOrganizationMarketing } from '../../hooks/useOrganizationMarketing';

interface PromotionsTabProps {
  onCreatePromo: () => void;
}

export function PromotionsTab({ onCreatePromo }: PromotionsTabProps) {
  const { promotions, stats, isLoading, deletePromotion } = useOrganizationMarketing();

  return (
    <div className="space-y-6">
      <PromotionsStats 
        total={stats?.promotions?.total || 0}
        active={stats?.promotions?.active || 0}
        totalRedemptions={stats?.promotions?.totalRedemptions || 0}
        isLoading={isLoading}
      />
      <PromotionsTable 
        promotions={promotions}
        isLoading={isLoading}
        onCreatePromo={onCreatePromo} 
        onDeletePromo={deletePromotion}
      />
    </div>
  );
}
