/**
 * MarketingPro 1.1 - Gift Cards Tab
 * @description Main container for the Gift Cards section
 */

import { GiftCardsStats } from './GiftCardsStats';
import { GiftCardsTable } from './GiftCardsTable';

interface GiftCardsTabProps {
  onCreateGiftCard: () => void;
}

export function GiftCardsTab({ onCreateGiftCard }: GiftCardsTabProps) {
  return (
    <div className="space-y-6">
      <GiftCardsStats />
      <GiftCardsTable onCreateGiftCard={onCreateGiftCard} />
    </div>
  );
}
