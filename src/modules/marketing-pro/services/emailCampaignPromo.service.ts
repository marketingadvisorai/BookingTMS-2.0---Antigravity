/**
 * MarketingPro 1.1 - Email Campaign Promo Code Service
 * @description Service for sending promo codes with email campaigns
 */

import { supabase } from '@/lib/supabase';

interface CampaignWithPromoParams {
  organizationId: string;
  campaignId?: string;
  name: string;
  subject: string;
  content: string;
  promoCodeId: string;
  targetAudience?: {
    allCustomers?: boolean;
    customerSegment?: 'all' | 'active' | 'inactive' | 'new' | 'vip';
    customerIds?: string[];
    tags?: string[];
  };
  scheduledAt?: string;
  autoGenerateCodes?: boolean;
  promoCodePrefix?: string;
}

interface PromoCodeEmailData {
  recipientEmail: string;
  recipientName?: string;
  promoCode: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  validUntil?: string;
  organizationId: string;
}

interface CampaignPromoStats {
  totalSent: number;
  totalRedeemed: number;
  redemptionRate: number;
  totalRevenue: number;
}

/**
 * Email Campaign Promo Code Service
 */
export const EmailCampaignPromoService = {
  /**
   * Create email campaign with promo code
   */
  async createCampaignWithPromo(params: CampaignWithPromoParams): Promise<{ success: boolean; campaignId?: string; error?: string }> {
    try {
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .insert({
          organization_id: params.organizationId,
          name: params.name,
          subject: params.subject,
          content: params.content,
          promo_code_id: params.promoCodeId,
          campaign_type: 'promotional',
          target_audience: params.targetAudience || {},
          scheduled_at: params.scheduledAt,
          auto_generate_codes: params.autoGenerateCodes || false,
          promo_code_prefix: params.promoCodePrefix,
          status: params.scheduledAt ? 'scheduled' : 'draft',
        })
        .select('id')
        .single();

      if (campaignError) {
        return { success: false, error: campaignError.message };
      }

      return { success: true, campaignId: campaign.id };
    } catch (err) {
      console.error('Error creating campaign with promo:', err);
      return { success: false, error: 'Failed to create campaign' };
    }
  },

  /**
   * Get eligible customers for a campaign
   */
  async getEligibleCustomers(
    organizationId: string,
    segment: 'all' | 'active' | 'inactive' | 'new' | 'vip' = 'all'
  ): Promise<{ id: string; email: string; name: string }[]> {
    try {
      let query = supabase
        .from('customers')
        .select('id, email, name')
        .eq('organization_id', organizationId)
        .eq('marketing_consent', true)
        .not('email', 'is', null);

      // Apply segment filters
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      switch (segment) {
        case 'active':
          // Customers with bookings in last 30 days
          query = query.gte('last_booking_date', thirtyDaysAgo.toISOString());
          break;
        case 'inactive':
          // No bookings in last 90 days
          query = query.lt('last_booking_date', ninetyDaysAgo.toISOString());
          break;
        case 'new':
          // Signed up in last 30 days
          query = query.gte('created_at', thirtyDaysAgo.toISOString());
          break;
        case 'vip':
          // Total spent > $500
          query = query.gte('total_spent', 500);
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching customers:', error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error getting eligible customers:', err);
      return [];
    }
  },

  /**
   * Send campaign with promo code to customers
   */
  async sendCampaignWithPromo(
    campaignId: string,
    organizationId: string
  ): Promise<{ success: boolean; sentCount: number; error?: string }> {
    try {
      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select(`
          *,
          promo:promotions(*)
        `)
        .eq('id', campaignId)
        .single();

      if (campaignError || !campaign) {
        return { success: false, sentCount: 0, error: 'Campaign not found' };
      }

      // Get eligible customers
      const segment = campaign.target_audience?.customerSegment || 'all';
      const customers = await this.getEligibleCustomers(organizationId, segment);

      if (customers.length === 0) {
        return { success: false, sentCount: 0, error: 'No eligible customers found' };
      }

      let sentCount = 0;
      const promo = campaign.promo;

      for (const customer of customers) {
        try {
          // Send promo code email
          await this.sendPromoCodeEmail({
            recipientEmail: customer.email,
            recipientName: customer.name,
            promoCode: promo.code,
            discountValue: promo.discount_value,
            discountType: promo.discount_type,
            validUntil: promo.valid_until,
            organizationId,
          });

          // Track the promo code sent
          await supabase.from('campaign_promo_codes').insert({
            campaign_id: campaignId,
            promo_code_id: promo.id,
            recipient_email: customer.email,
          });

          sentCount++;
        } catch (err) {
          console.error(`Failed to send to ${customer.email}:`, err);
        }
      }

      // Update campaign stats
      await supabase
        .from('email_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          recipients_count: sentCount,
        })
        .eq('id', campaignId);

      return { success: true, sentCount };
    } catch (err) {
      console.error('Error sending campaign:', err);
      return { success: false, sentCount: 0, error: 'Failed to send campaign' };
    }
  },

  /**
   * Send promo code email to a single recipient
   */
  async sendPromoCodeEmail(data: PromoCodeEmailData): Promise<boolean> {
    try {
      const discountText = data.discountType === 'percentage'
        ? `${data.discountValue}% off`
        : `$${data.discountValue} off`;

      const validityText = data.validUntil
        ? `Valid until ${new Date(data.validUntil).toLocaleDateString()}`
        : 'No expiration';

      const { error } = await supabase.functions.invoke('send-marketing-email', {
        body: {
          organizationId: data.organizationId,
          to: data.recipientEmail,
          subject: `🎉 Exclusive Offer: ${discountText} with code ${data.promoCode}`,
          template: 'promo_code_offer',
          variables: {
            recipientName: data.recipientName || 'Valued Customer',
            promoCode: data.promoCode,
            discountValue: data.discountValue,
            discountType: data.discountType,
            discountText,
            validityText,
          },
        },
      });

      return !error;
    } catch (err) {
      console.error('Error sending promo email:', err);
      return false;
    }
  },

  /**
   * Get campaign promo code statistics
   */
  async getCampaignPromoStats(campaignId: string): Promise<CampaignPromoStats> {
    try {
      // Get sent count
      const { count: sentCount } = await supabase
        .from('campaign_promo_codes')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId);

      // Get redeemed count
      const { count: redeemedCount } = await supabase
        .from('campaign_promo_codes')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .not('redeemed_at', 'is', null);

      // Get total revenue from redemptions
      const { data: revenueData } = await supabase
        .from('campaign_promo_codes')
        .select('redemption_booking_id')
        .eq('campaign_id', campaignId)
        .not('redemption_booking_id', 'is', null);

      let totalRevenue = 0;
      if (revenueData && revenueData.length > 0) {
        const bookingIds = revenueData.map((r) => r.redemption_booking_id);
        const { data: bookings } = await supabase
          .from('bookings')
          .select('total_amount')
          .in('id', bookingIds);

        totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      }

      return {
        totalSent: sentCount || 0,
        totalRedeemed: redeemedCount || 0,
        redemptionRate: sentCount ? ((redeemedCount || 0) / sentCount) * 100 : 0,
        totalRevenue,
      };
    } catch (err) {
      console.error('Error getting campaign stats:', err);
      return { totalSent: 0, totalRedeemed: 0, redemptionRate: 0, totalRevenue: 0 };
    }
  },

  /**
   * Track promo code redemption from campaign
   */
  async trackRedemption(
    promoCode: string,
    customerEmail: string,
    bookingId: string
  ): Promise<void> {
    try {
      await supabase
        .from('campaign_promo_codes')
        .update({
          redeemed_at: new Date().toISOString(),
          redemption_booking_id: bookingId,
        })
        .eq('recipient_email', customerEmail)
        .is('redeemed_at', null);
    } catch (err) {
      console.error('Error tracking redemption:', err);
    }
  },
};

export default EmailCampaignPromoService;
