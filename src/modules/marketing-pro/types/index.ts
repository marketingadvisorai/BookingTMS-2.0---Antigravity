/**
 * MarketingPro 1.1 - Type Definitions
 * @description Centralized types for all marketing features
 * 
 * Types are organized as:
 * - Database types (matching Supabase schema) for services
 * - UI types (camelCase) for components - kept for backward compatibility
 */

// ============================================================================
// DATABASE TYPES (match Supabase schema - snake_case)
// ============================================================================

// ============= PROMOTIONS (Database) =============
export interface Promotion {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed' | 'free_add_on';
  discount_value: number;
  min_purchase?: number;
  max_uses?: number;
  current_uses: number;
  valid_from?: string;
  valid_until?: string;
  applicable_activities?: string[];
  applicable_venues?: string[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Legacy UI type for backward compatibility
export interface PromotionUI {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  discount: number;
  usage: number;
  limit: number | null;
  validUntil: string;
  status: 'active' | 'paused' | 'expired';
  createdAt: string;
}

export interface PromotionFormData {
  code: string;
  type: 'percentage' | 'fixed';
  discount: number;
  limit: number | null;
  validUntil: string;
  minPurchase?: number;
  maxDiscount?: number;
}

// ============= GIFT CARDS (Database) =============
export interface GiftCard {
  id: string;
  organization_id: string;
  code: string;
  initial_value: number;
  current_balance: number;
  purchaser_name?: string;
  purchaser_email?: string;
  recipient_name?: string;
  recipient_email?: string;
  message?: string;
  purchased_at: string;
  expires_at?: string;
  is_active: boolean;
  redeemed_at?: string;
  redeemed_by?: string;
  stripe_payment_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Legacy UI type for backward compatibility
export interface GiftCardUI {
  id: string;
  code: string;
  amount: number;
  balance: number;
  recipientEmail: string;
  recipientName?: string;
  status: 'active' | 'redeemed' | 'expired';
  expiryDate: string;
  createdAt: string;
}

export interface GiftCardFormData {
  amount: number;
  recipientEmail: string;
  recipientName?: string;
  message?: string;
  expiryDate: string;
  sendImmediately: boolean;
}

// ============= REVIEWS (Database) =============
export interface Review {
  id: string;
  organization_id: string;
  venue_id?: string;
  platform: 'google' | 'facebook' | 'yelp' | 'tripadvisor' | 'internal';
  external_id?: string;
  author_name: string;
  author_avatar?: string;
  rating: number;
  review_text?: string;
  response_text?: string;
  responded_at?: string;
  responded_by?: string;
  review_date?: string;
  is_featured: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
  created_at: string;
  updated_at: string;
}

// Legacy UI type
export interface ReviewUI {
  id: string;
  customerName: string;
  customerInitials: string;
  rating: number;
  content: string;
  source: 'google' | 'facebook' | 'yelp' | 'tripadvisor';
  date: string;
  isVerified: boolean;
  hasResponse: boolean;
  response?: {
    content: string;
    date: string;
  };
  needsResponse: boolean;
}

export interface ReviewPlatform {
  id: string;
  name: string;
  reviewCount: number;
  isConnected: boolean;
  icon: 'google' | 'facebook' | 'yelp' | 'tripadvisor';
}

// ============= EMAIL CAMPAIGNS (Database) =============
export interface EmailCampaign {
  id: string;
  organization_id: string;
  name: string;
  subject: string;
  preheader?: string;
  content: string;
  template_id?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  target_audience?: Record<string, unknown>;
  scheduled_at?: string;
  sent_at?: string;
  recipients_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  unsubscribed_count: number;
  bounced_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ============= EMAIL TEMPLATES (Database) =============
export interface EmailTemplate {
  id: string;
  name: string;
  category: 'transactional' | 'marketing' | 'engagement';
  subject: string;
  preheader: string;
  body: string;
  variables: string[];
  icon: string;
  description: string;
  isActive: boolean;
  lastModified: string;
}

// Database version of EmailTemplate
export interface DBEmailTemplate {
  id: string;
  organization_id: string;
  name: string;
  category: 'transactional' | 'marketing' | 'notification' | 'custom';
  subject: string;
  preheader?: string;
  body: string;
  variables?: string[];
  is_active: boolean;
  is_default: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// ============= EMAIL WORKFLOWS (Database) =============
export interface EmailWorkflow {
  id: string;
  organization_id: string;
  name: string;
  trigger_type: string;
  template_id?: string;
  delay_minutes: number;
  is_enabled: boolean;
  conditions?: Record<string, unknown>;
  last_triggered_at?: string;
  trigger_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  template?: DBEmailTemplate;
}

export interface EmailCampaignFormData {
  name: string;
  subject: string;
  fromName: string;
  template: string;
  targetAudience: 'all' | 'active' | 'inactive' | 'new';
  sendType: 'immediately' | 'schedule';
  scheduledDate?: string;
}

export interface WorkflowFormData {
  name: string;
  triggerEvent: string;
  templateId: string;
  delayValue: number;
  delayUnit: 'minutes' | 'hours' | 'days' | 'weeks';
  conditions?: string;
  activateImmediately: boolean;
}

// ============= AFFILIATES (Database) =============
export interface Affiliate {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  referral_code: string;
  commission_type: 'percentage' | 'fixed';
  commission_rate: number;
  status: 'pending' | 'active' | 'paused' | 'terminated';
  total_referrals: number;
  total_conversions: number;
  total_revenue: number;
  total_commissions: number;
  pending_payout: number;
  last_referral_at?: string;
  payout_method?: 'bank_transfer' | 'paypal' | 'stripe' | 'check';
  payout_details?: Record<string, unknown>;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// Legacy UI type
export interface AffiliateUI {
  id: string;
  name: string;
  email: string;
  code: string;
  commissionRate: number;
  status: 'active' | 'pending' | 'inactive';
  website?: string;
  stats: {
    clicks: number;
    conversions: number;
    revenue: number;
    earnings: number;
  };
  joinedDate: string;
}

export interface AffiliateFormData {
  name: string;
  email: string;
  commissionRate: number;
  customCode?: string;
  website?: string;
  notes?: string;
  activateImmediately: boolean;
}

// ============= MARKETING SETTINGS (Database) =============
export interface MarketingSettings {
  id: string;
  organization_id: string;
  
  // Email Settings
  email_from_name?: string;
  email_from_address?: string;
  email_reply_to?: string;
  email_signature?: string;
  unsubscribe_message?: string;
  
  // Review Platforms
  google_place_id?: string;
  facebook_page_id?: string;
  yelp_business_id?: string;
  tripadvisor_id?: string;
  
  // Affiliate Program
  affiliate_enabled: boolean;
  affiliate_default_commission: number;
  affiliate_cookie_days: number;
  affiliate_min_payout: number;
  affiliate_auto_approve: boolean;
  
  // SMTP Settings
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password_encrypted?: string;
  smtp_secure?: boolean;
  
  // API Keys
  mailgun_api_key_encrypted?: string;
  sendgrid_api_key_encrypted?: string;
  
  created_at: string;
  updated_at: string;
}

// ============= SHARED =============
export interface StatsCard {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  icon: string;
  iconColor: string;
  bgColor: string;
}

export type MarketingTab = 
  | 'promotions' 
  | 'gift-cards' 
  | 'reviews' 
  | 'email' 
  | 'affiliate';

export interface TabConfig {
  id: MarketingTab;
  label: string;
  icon: string;
  description: string;
  color: string;
}
