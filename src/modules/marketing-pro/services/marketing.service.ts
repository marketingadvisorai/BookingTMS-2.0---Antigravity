/**
 * MarketingPro 1.1 - Main Marketing Service
 * @description Aggregated service for all marketing features with multi-tenant support
 */

import { PromotionsService } from './promotions.service';
import { GiftCardsService } from './giftCards.service';
import { EmailCampaignsService } from './emailCampaigns.service';
import { AffiliatesService } from './affiliates.service';
import { ReviewsService } from './reviews.service';
import { MarketingSettingsService } from './marketingSettings.service';

/**
 * Main Marketing Service - Aggregates all marketing functionality
 * All operations are scoped to the organization for multi-tenant isolation
 */
export const MarketingService = {
  // Sub-services
  promotions: PromotionsService,
  giftCards: GiftCardsService,
  emailCampaigns: EmailCampaignsService,
  affiliates: AffiliatesService,
  reviews: ReviewsService,
  settings: MarketingSettingsService,

  /**
   * Get comprehensive marketing dashboard stats for an organization
   */
  async getDashboardStats(organizationId: string) {
    const [
      promotionStats,
      giftCardStats,
      emailStats,
      affiliateStats,
      reviewStats,
    ] = await Promise.all([
      PromotionsService.getStats(organizationId),
      GiftCardsService.getStats(organizationId),
      EmailCampaignsService.getStats(organizationId),
      AffiliatesService.getStats(organizationId),
      ReviewsService.getStats(organizationId),
    ]);

    return {
      promotions: promotionStats,
      giftCards: giftCardStats,
      email: emailStats,
      affiliates: affiliateStats,
      reviews: reviewStats,
      summary: {
        totalPromotions: promotionStats.total,
        activePromotions: promotionStats.active,
        giftCardBalance: giftCardStats.remainingBalance,
        emailsSent: emailStats.totalDelivered,
        averageRating: reviewStats.averageRating,
        affiliateRevenue: affiliateStats.totalRevenue,
      },
    };
  },

  /**
   * Initialize marketing settings for a new organization
   */
  async initializeForOrganization(organizationId: string, organizationName: string) {
    // Create default marketing settings
    await MarketingSettingsService.upsert(organizationId, {
      email_from_name: organizationName,
      affiliate_enabled: false,
      affiliate_default_commission: 10,
      affiliate_cookie_days: 30,
      affiliate_min_payout: 50,
      affiliate_auto_approve: false,
    });

    return { success: true, message: 'Marketing settings initialized' };
  },
};

// Re-export sub-services for direct access
export { PromotionsService } from './promotions.service';
export { GiftCardsService } from './giftCards.service';
export { EmailCampaignsService } from './emailCampaigns.service';
export { AffiliatesService } from './affiliates.service';
export { ReviewsService } from './reviews.service';
export { MarketingSettingsService } from './marketingSettings.service';
