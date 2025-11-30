/**
 * MarketingPro 1.1 - Module Barrel Export
 * @description Complete marketing automation module
 * @version 1.1.0
 */

// Main Page
export { MarketingProPage } from './pages/MarketingProPage';

// Types
export * from './types';

// Constants
export * from './constants';

// Hooks
export { useMarketingState } from './hooks/useMarketingState';
export { useOrganizationMarketing } from './hooks/useOrganizationMarketing';

// Services
export * from './services';

// Tab Components
export { PromotionsTab } from './components/promotions';
export { GiftCardsTab } from './components/gift-cards';
export { ReviewsTab } from './components/reviews';
export { EmailTab } from './components/email';
export { AffiliateTab } from './components/affiliate';

// Shared Components
export { StatsCard, SectionHeader } from './components/shared';

// Dialogs
export {
  CreatePromoDialog,
  CreateGiftCardDialog,
  CreateCampaignDialog,
  AddAffiliateDialog,
  CreateWorkflowDialog,
} from './components/dialogs';
