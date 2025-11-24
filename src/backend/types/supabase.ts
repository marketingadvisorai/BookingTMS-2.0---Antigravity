/**
 * Supabase Database Types
 * 
 * Auto-generated types for TypeScript support
 * Matches the database schema defined in the PRD
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          plan: 'free' | 'starter' | 'pro' | 'enterprise'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          settings: Json | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          settings?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          plan?: 'free' | 'starter' | 'pro' | 'enterprise'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          settings?: Json | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'super-admin' | 'admin' | 'manager' | 'staff'
          organization_id: string
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'super-admin' | 'admin' | 'manager' | 'staff'
          organization_id: string
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'super-admin' | 'admin' | 'manager' | 'staff'
          organization_id?: string
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          organization_id: string
          venue_id: string
          name: string
          description: string | null
          difficulty: string | null
          duration: number
          min_players: number | null
          max_players: number | null
          price: number | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          settings: Json | null
          setup_time: number | null
          cleanup_time: number | null
          booking_cutoff_minutes: number | null
          cancellation_policy: string | null
          stripe_product_id: string | null
          stripe_price_id: string | null
          stripe_checkout_url: string | null
          stripe_sync_status: string | null
          stripe_last_sync: string | null
          stripe_metadata: Json | null
          price_lookup_key: string | null
          active_price_id: string | null
          venue_name: string | null
          organization_name: string | null
          schedule: Json | null
        }
        Insert: {
          id?: string
          organization_id: string
          venue_id: string
          name: string
          description?: string | null
          difficulty?: string | null
          duration: number
          min_players?: number | null
          max_players?: number | null
          price?: number | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          settings?: Json | null
          setup_time?: number | null
          cleanup_time?: number | null
          booking_cutoff_minutes?: number | null
          cancellation_policy?: string | null
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          stripe_checkout_url?: string | null
          stripe_sync_status?: string | null
          stripe_last_sync?: string | null
          stripe_metadata?: Json | null
          price_lookup_key?: string | null
          active_price_id?: string | null
          venue_name?: string | null
          organization_name?: string | null
          schedule?: Json | null
        }
        Update: {
          id?: string
          organization_id?: string
          venue_id?: string
          name?: string
          description?: string | null
          difficulty?: string | null
          duration?: number
          min_players?: number | null
          max_players?: number | null
          price?: number | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          settings?: Json | null
          setup_time?: number | null
          cleanup_time?: number | null
          booking_cutoff_minutes?: number | null
          cancellation_policy?: string | null
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          stripe_checkout_url?: string | null
          stripe_sync_status?: string | null
          stripe_last_sync?: string | null
          stripe_metadata?: Json | null
          price_lookup_key?: string | null
          active_price_id?: string | null
          venue_name?: string | null
          organization_name?: string | null
          schedule?: Json | null
        }
      }
      customers: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string
          phone: string | null
          stripe_customer_id: string | null
          total_bookings: number
          total_spent: number
          segment: 'vip' | 'regular' | 'new' | 'inactive'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          full_name: string
          phone?: string | null
          stripe_customer_id?: string | null
          total_bookings?: number
          total_spent?: number
          segment?: 'vip' | 'regular' | 'new' | 'inactive'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          full_name?: string
          phone?: string | null
          stripe_customer_id?: string | null
          total_bookings?: number
          total_spent?: number
          segment?: 'vip' | 'regular' | 'new' | 'inactive'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          organization_id: string
          booking_number: string
          customer_id: string
          game_id: string
          booking_date: string
          start_time: string
          end_time: string
          party_size: number
          status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'
          total_amount: number
          discount_amount: number
          final_amount: number
          payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
          payment_intent_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          booking_number: string
          customer_id: string
          game_id: string
          booking_date: string
          start_time: string
          end_time: string
          party_size: number
          status?: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'
          total_amount: number
          discount_amount?: number
          final_amount: number
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
          payment_intent_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          booking_number?: string
          customer_id?: string
          game_id?: string
          booking_date?: string
          start_time?: string
          end_time?: string
          party_size?: number
          status?: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'
          total_amount?: number
          discount_amount?: number
          final_amount?: number
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed'
          payment_intent_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
          updated_by?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          stripe_payment_intent_id: string
          stripe_charge_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'disputed'
          payment_method_type: string | null
          last_4: string | null
          card_brand: string | null
          receipt_url: string | null
          refund_amount: number
          refund_reason: string | null
          failure_code: string | null
          failure_message: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          stripe_payment_intent_id: string
          stripe_charge_id?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'disputed'
          payment_method_type?: string | null
          last_4?: string | null
          card_brand?: string | null
          receipt_url?: string | null
          refund_amount?: number
          refund_reason?: string | null
          failure_code?: string | null
          failure_message?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          stripe_payment_intent_id?: string
          stripe_charge_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'refunded' | 'disputed'
          payment_method_type?: string | null
          last_4?: string | null
          card_brand?: string | null
          receipt_url?: string | null
          refund_amount?: number
          refund_reason?: string | null
          failure_code?: string | null
          failure_message?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          type: 'booking' | 'payment' | 'cancellation' | 'message' | 'staff' | 'system'
          priority: 'low' | 'medium' | 'high'
          title: string
          message: string
          action_url: string | null
          action_label: string | null
          metadata: Json | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id: string
          type: 'booking' | 'payment' | 'cancellation' | 'message' | 'staff' | 'system'
          priority?: 'low' | 'medium' | 'high'
          title: string
          message: string
          action_url?: string | null
          action_label?: string | null
          metadata?: Json | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string
          type?: 'booking' | 'payment' | 'cancellation' | 'message' | 'staff' | 'system'
          priority?: 'low' | 'medium' | 'high'
          title?: string
          message?: string
          action_url?: string | null
          action_label?: string | null
          metadata?: Json | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      notification_settings: {
        Row: {
          user_id: string
          sound_enabled: boolean
          sound_volume: number
          sound_for_bookings: boolean
          sound_for_payments: boolean
          sound_for_cancellations: boolean
          sound_for_messages: boolean
          desktop_enabled: boolean
          desktop_for_bookings: boolean
          desktop_for_payments: boolean
          desktop_for_cancellations: boolean
          desktop_for_messages: boolean
          email_enabled: boolean
          sms_enabled: boolean
          sms_phone_number: string | null
          quiet_hours_enabled: boolean
          quiet_hours_start: string
          quiet_hours_end: string
          show_in_app_notifications: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          sound_enabled?: boolean
          sound_volume?: number
          sound_for_bookings?: boolean
          sound_for_payments?: boolean
          sound_for_cancellations?: boolean
          sound_for_messages?: boolean
          desktop_enabled?: boolean
          desktop_for_bookings?: boolean
          desktop_for_payments?: boolean
          desktop_for_cancellations?: boolean
          desktop_for_messages?: boolean
          email_enabled?: boolean
          sms_enabled?: boolean
          sms_phone_number?: string | null
          quiet_hours_enabled?: boolean
          quiet_hours_start?: string
          quiet_hours_end?: string
          show_in_app_notifications?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          sound_enabled?: boolean
          sound_volume?: number
          sound_for_bookings?: boolean
          sound_for_payments?: boolean
          sound_for_cancellations?: boolean
          sound_for_messages?: boolean
          desktop_enabled?: boolean
          desktop_for_bookings?: boolean
          desktop_for_payments?: boolean
          desktop_for_cancellations?: boolean
          desktop_for_messages?: boolean
          email_enabled?: boolean
          sms_enabled?: boolean
          sms_phone_number?: string | null
          quiet_hours_enabled?: boolean
          quiet_hours_start?: string
          quiet_hours_end?: string
          show_in_app_notifications?: boolean
          updated_at?: string
        }
      }
      stripe_webhook_events: {
        Row: {
          id: string
          event_id: string
          event_type: string
          payload: Json
          processed: boolean
          processing_error: string | null
          created_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          event_type: string
          payload: Json
          processed?: boolean
          processing_error?: string | null
          created_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          event_type?: string
          payload?: Json
          processed?: boolean
          processing_error?: string | null
          created_at?: string
          processed_at?: string | null
        }
      }
      waiver_templates: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          type: string
          content: string
          status: 'active' | 'inactive' | 'draft'
          usage_count: number
          assigned_activities: string[] | null
          required_fields: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          type: string
          content: string
          status?: 'active' | 'inactive' | 'draft'
          usage_count?: number
          assigned_activities?: string[] | null
          required_fields?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          type?: string
          content?: string
          status?: 'active' | 'inactive' | 'draft'
          usage_count?: number
          assigned_activities?: string[] | null
          required_fields?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      waiver_records: {
        Row: {
          id: string
          organization_id: string
          guest_name: string
          guest_email: string
          activity: string | null
          booking_id: string | null
          template_id: string | null
          signed_at: string
          status: 'valid' | 'expired' | 'revoked'
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          guest_name: string
          guest_email: string
          activity?: string | null
          booking_id?: string | null
          template_id?: string | null
          signed_at?: string
          status?: 'valid' | 'expired' | 'revoked'
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          guest_name?: string
          guest_email?: string
          activity?: string | null
          booking_id?: string | null
          template_id?: string | null
          signed_at?: string
          status?: 'valid' | 'expired' | 'revoked'
          pdf_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'super-admin' | 'admin' | 'manager' | 'staff'
      booking_status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled'
      payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
      customer_segment: 'vip' | 'regular' | 'new' | 'inactive'
      difficulty_level: 'easy' | 'medium' | 'hard' | 'expert'
      organization_plan: 'free' | 'starter' | 'pro' | 'enterprise'
    }
  }
}
