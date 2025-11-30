// Generated Supabase types - regenerated 2025-11-30
// Run: npx supabase gen types typescript --project-id qftjyjpitnoapqxlrvfs > src/types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      promotions: {
        Row: {
          id: string
          organization_id: string
          code: string
          name: string
          description: string | null
          discount_type: 'percentage' | 'fixed' | 'free_add_on'
          discount_value: number
          min_purchase: number | null
          minimum_order_value: number | null
          max_uses: number | null
          current_uses: number | null
          valid_from: string | null
          valid_until: string | null
          applicable_activities: string[] | null
          applicable_venues: string[] | null
          is_active: boolean | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
          stripe_coupon_id: string | null
          stripe_promo_code_id: string | null
          stripe_sync_status: string | null
          stripe_last_sync: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          code: string
          name: string
          description?: string | null
          discount_type: 'percentage' | 'fixed' | 'free_add_on'
          discount_value: number
          min_purchase?: number | null
          minimum_order_value?: number | null
          max_uses?: number | null
          current_uses?: number | null
          valid_from?: string | null
          valid_until?: string | null
          applicable_activities?: string[] | null
          applicable_venues?: string[] | null
          is_active?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          stripe_coupon_id?: string | null
          stripe_promo_code_id?: string | null
          stripe_sync_status?: string | null
          stripe_last_sync?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          code?: string
          name?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed' | 'free_add_on'
          discount_value?: number
          min_purchase?: number | null
          minimum_order_value?: number | null
          max_uses?: number | null
          current_uses?: number | null
          valid_from?: string | null
          valid_until?: string | null
          applicable_activities?: string[] | null
          applicable_venues?: string[] | null
          is_active?: boolean | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          stripe_coupon_id?: string | null
          stripe_promo_code_id?: string | null
          stripe_sync_status?: string | null
          stripe_last_sync?: string | null
        }
      }
      gift_cards: {
        Row: {
          id: string
          organization_id: string
          code: string
          initial_value: number
          current_balance: number
          purchaser_email: string | null
          purchaser_name: string | null
          recipient_email: string | null
          recipient_name: string | null
          recipient_message: string | null
          is_active: boolean | null
          purchased_at: string | null
          expires_at: string | null
          redeemed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          code: string
          initial_value: number
          current_balance: number
          purchaser_email?: string | null
          purchaser_name?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_message?: string | null
          is_active?: boolean | null
          purchased_at?: string | null
          expires_at?: string | null
          redeemed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          code?: string
          initial_value?: number
          current_balance?: number
          purchaser_email?: string | null
          purchaser_name?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_message?: string | null
          is_active?: boolean | null
          purchased_at?: string | null
          expires_at?: string | null
          redeemed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      gift_card_transactions: {
        Row: {
          id: string
          gift_card_id: string
          booking_id: string | null
          amount: number
          balance_after: number
          transaction_type: string
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          gift_card_id: string
          booking_id?: string | null
          amount: number
          balance_after: number
          transaction_type: string
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          gift_card_id?: string
          booking_id?: string | null
          amount?: number
          balance_after?: number
          transaction_type?: string
          notes?: string | null
          created_at?: string | null
        }
      }
      email_campaigns: {
        Row: {
          id: string
          organization_id: string
          name: string
          subject: string
          preheader: string | null
          content: string
          template_id: string | null
          status: string | null
          target_audience: Json | null
          scheduled_at: string | null
          sent_at: string | null
          recipients_count: number | null
          delivered_count: number | null
          opened_count: number | null
          clicked_count: number | null
          unsubscribed_count: number | null
          bounced_count: number | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
          promo_code_id: string | null
          campaign_type: string | null
          auto_generate_codes: boolean | null
          promo_code_prefix: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          subject: string
          preheader?: string | null
          content: string
          template_id?: string | null
          status?: string | null
          target_audience?: Json | null
          scheduled_at?: string | null
          sent_at?: string | null
          recipients_count?: number | null
          delivered_count?: number | null
          opened_count?: number | null
          clicked_count?: number | null
          unsubscribed_count?: number | null
          bounced_count?: number | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          promo_code_id?: string | null
          campaign_type?: string | null
          auto_generate_codes?: boolean | null
          promo_code_prefix?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          subject?: string
          preheader?: string | null
          content?: string
          template_id?: string | null
          status?: string | null
          target_audience?: Json | null
          scheduled_at?: string | null
          sent_at?: string | null
          recipients_count?: number | null
          delivered_count?: number | null
          opened_count?: number | null
          clicked_count?: number | null
          unsubscribed_count?: number | null
          bounced_count?: number | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
          promo_code_id?: string | null
          campaign_type?: string | null
          auto_generate_codes?: boolean | null
          promo_code_prefix?: string | null
        }
      }
      campaign_promo_codes: {
        Row: {
          id: string
          campaign_id: string
          promo_code_id: string
          recipient_email: string
          sent_at: string | null
          redeemed_at: string | null
          redemption_booking_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          promo_code_id: string
          recipient_email: string
          sent_at?: string | null
          redeemed_at?: string | null
          redemption_booking_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          promo_code_id?: string
          recipient_email?: string
          sent_at?: string | null
          redeemed_at?: string | null
          redemption_booking_id?: string | null
          created_at?: string | null
        }
      }
    }
    Functions: {
      increment_promo_usage: {
        Args: { p_organization_id: string; p_promo_code: string }
        Returns: undefined
      }
      decrement_gift_card_balance: {
        Args: { p_gift_card_id: string; p_amount: number; p_booking_id?: string }
        Returns: { new_balance: number; success: boolean }[]
      }
    }
  }
}
