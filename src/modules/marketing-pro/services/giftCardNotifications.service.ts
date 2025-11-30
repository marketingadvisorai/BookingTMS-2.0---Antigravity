/**
 * MarketingPro 1.1 - Gift Card Notifications Service
 * @description Email notifications for gift card purchases and redemptions
 */

import { supabase } from '@/lib/supabase';

interface GiftCardPurchaseNotificationData {
  giftCardId: string;
  purchaserEmail: string;
  purchaserName?: string;
  recipientEmail?: string;
  recipientName?: string;
  amount: number;
  code: string;
  message?: string;
  organizationId: string;
}

interface GiftCardRedemptionNotificationData {
  giftCardId: string;
  customerEmail: string;
  customerName?: string;
  amountUsed: number;
  remainingBalance: number;
  bookingReference: string;
  organizationId: string;
}

/**
 * Gift Card Notifications Service
 */
export const GiftCardNotificationsService = {
  /**
   * Send gift card purchase confirmation to purchaser
   */
  async sendPurchaseConfirmation(data: GiftCardPurchaseNotificationData): Promise<boolean> {
    try {
      const { data: funcData, error } = await supabase.functions.invoke('send-marketing-email', {
        body: {
          organizationId: data.organizationId,
          to: data.purchaserEmail,
          subject: `Your Gift Card Purchase - $${data.amount.toFixed(2)}`,
          template: 'gift_card_purchase',
          variables: {
            purchaserName: data.purchaserName || 'Valued Customer',
            amount: data.amount.toFixed(2),
            code: data.code,
            recipientName: data.recipientName || '',
            recipientEmail: data.recipientEmail || '',
            message: data.message || '',
          },
        },
      });

      if (error) {
        console.error('Failed to send gift card purchase email:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error sending gift card purchase email:', err);
      return false;
    }
  },

  /**
   * Send gift card to recipient
   */
  async sendGiftCardToRecipient(data: GiftCardPurchaseNotificationData): Promise<boolean> {
    if (!data.recipientEmail) return false;

    try {
      const { data: funcData, error } = await supabase.functions.invoke('send-marketing-email', {
        body: {
          organizationId: data.organizationId,
          to: data.recipientEmail,
          subject: `You've Received a Gift Card! - $${data.amount.toFixed(2)}`,
          template: 'gift_card_received',
          variables: {
            recipientName: data.recipientName || 'Friend',
            purchaserName: data.purchaserName || 'Someone special',
            amount: data.amount.toFixed(2),
            code: data.code,
            message: data.message || 'Enjoy your gift!',
          },
        },
      });

      if (error) {
        console.error('Failed to send gift card to recipient:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error sending gift card to recipient:', err);
      return false;
    }
  },

  /**
   * Send gift card redemption notification
   */
  async sendRedemptionNotification(data: GiftCardRedemptionNotificationData): Promise<boolean> {
    try {
      const { data: funcData, error } = await supabase.functions.invoke('send-marketing-email', {
        body: {
          organizationId: data.organizationId,
          to: data.customerEmail,
          subject: `Gift Card Used - $${data.amountUsed.toFixed(2)}`,
          template: 'gift_card_redeemed',
          variables: {
            customerName: data.customerName || 'Valued Customer',
            amountUsed: data.amountUsed.toFixed(2),
            remainingBalance: data.remainingBalance.toFixed(2),
            bookingReference: data.bookingReference,
          },
        },
      });

      if (error) {
        console.error('Failed to send gift card redemption email:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error sending gift card redemption email:', err);
      return false;
    }
  },

  /**
   * Send low balance warning (when gift card drops below threshold)
   */
  async sendLowBalanceWarning(
    giftCardId: string,
    currentBalance: number,
    threshold: number = 10
  ): Promise<boolean> {
    if (currentBalance > threshold) return false;

    try {
      // Fetch gift card details
      const { data: giftCard, error: fetchError } = await supabase
        .from('gift_cards')
        .select('code, recipient_email, recipient_name, organization_id')
        .eq('id', giftCardId)
        .single();

      if (fetchError || !giftCard || !giftCard.recipient_email) return false;

      const { error } = await supabase.functions.invoke('send-marketing-email', {
        body: {
          organizationId: giftCard.organization_id,
          to: giftCard.recipient_email,
          subject: `Gift Card Balance Low - $${currentBalance.toFixed(2)} Remaining`,
          template: 'gift_card_low_balance',
          variables: {
            recipientName: giftCard.recipient_name || 'Valued Customer',
            code: giftCard.code,
            remainingBalance: currentBalance.toFixed(2),
          },
        },
      });

      if (error) {
        console.error('Failed to send low balance warning:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error sending low balance warning:', err);
      return false;
    }
  },
};

export default GiftCardNotificationsService;
