/**
 * MarketingPro 1.1 - Affiliate Tab
 * @description Main container for the Affiliate Program section
 */

import { AffiliateStats } from './AffiliateStats';
import { AffiliateTable } from './AffiliateTable';
import { AffiliateSettings } from './AffiliateSettings';

interface AffiliateTabProps {
  onAddAffiliate: () => void;
}

export function AffiliateTab({ onAddAffiliate }: AffiliateTabProps) {
  return (
    <div className="space-y-6">
      <AffiliateStats />
      <AffiliateTable onAddAffiliate={onAddAffiliate} />
      <AffiliateSettings />
    </div>
  );
}
