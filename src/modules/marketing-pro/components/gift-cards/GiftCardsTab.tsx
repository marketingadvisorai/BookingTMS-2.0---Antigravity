/**
 * MarketingPro 1.1 - Gift Cards Tab
 * @description Main container for the Gift Cards section with Supabase integration
 */

import { GiftCardsStats } from './GiftCardsStats';
import { GiftCardsTable } from './GiftCardsTable';
import { useOrganizationMarketing } from '../../hooks/useOrganizationMarketing';

interface GiftCardsTabProps {
  onCreateGiftCard: () => void;
}

export function GiftCardsTab({ onCreateGiftCard }: GiftCardsTabProps) {
  const { giftCards, stats, isLoading } = useOrganizationMarketing();

  return (
    <div className="space-y-6">
      <GiftCardsStats 
        total={stats?.giftCards?.total || 0}
        active={stats?.giftCards?.active || 0}
        totalValue={stats?.giftCards?.totalValue || 0}
        remainingBalance={stats?.giftCards?.remainingBalance || 0}
        isLoading={isLoading}
      />
      <GiftCardsTable 
        giftCards={giftCards}
        isLoading={isLoading}
        onCreateGiftCard={onCreateGiftCard} 
      />
    </div>
  );
}
