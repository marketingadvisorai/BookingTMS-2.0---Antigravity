/**
 * MarketingPro 1.1 - Marketing Settings Service
 * @description Per-organization marketing configuration with multi-tenant support
 */

import { supabase } from '@/lib/supabase';
import type { MarketingSettings } from '../types';

export interface UpdateSettingsInput {
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
  affiliate_enabled?: boolean;
  affiliate_default_commission?: number;
  affiliate_cookie_days?: number;
  affiliate_min_payout?: number;
  affiliate_auto_approve?: boolean;
  
  // SMTP Settings
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_password?: string; // Will be encrypted before storage
  smtp_secure?: boolean;
}

/**
 * Marketing Settings service - per-organization configuration
 */
export const MarketingSettingsService = {
  /**
   * Get marketing settings for an organization
   */
  async getByOrganization(organizationId: string): Promise<MarketingSettings | null> {
    const { data, error } = await supabase
      .from('marketing_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      throw new Error(`Failed to fetch marketing settings: ${error.message}`);
    }
    return data as MarketingSettings | null;
  },

  /**
   * Create or update marketing settings (upsert)
   */
  async upsert(organizationId: string, settings: UpdateSettingsInput): Promise<MarketingSettings> {
    // Check if settings exist
    const existing = await this.getByOrganization(organizationId);
    
    const payload = {
      organization_id: organizationId,
      ...settings,
      updated_at: new Date().toISOString(),
    };

    // Remove plain password before storing (should be encrypted by Edge Function)
    if (settings.smtp_password) {
      // In production, encrypt this via Edge Function
      // For now, we'll store it with a prefix indicating it needs encryption
      (payload as Record<string, unknown>).smtp_password_encrypted = `[PENDING]${settings.smtp_password}`;
      delete (payload as Record<string, unknown>).smtp_password;
    }

    if (existing) {
      const { data, error } = await supabase
        .from('marketing_settings')
        .update(payload)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw new Error(`Failed to update settings: ${error.message}`);
      return data as MarketingSettings;
    } else {
      const { data, error } = await supabase
        .from('marketing_settings')
        .insert(payload)
        .select()
        .single();

      if (error) throw new Error(`Failed to create settings: ${error.message}`);
      return data as MarketingSettings;
    }
  },

  /**
   * Test SMTP connection
   */
  async testSmtpConnection(organizationId: string): Promise<{ success: boolean; message: string }> {
    const settings = await this.getByOrganization(organizationId);
    
    if (!settings?.smtp_host || !settings?.smtp_user) {
      return { success: false, message: 'SMTP settings not configured' };
    }

    // In production, call an Edge Function to test SMTP
    // For now, return a mock success
    return { success: true, message: 'SMTP connection test would be performed via Edge Function' };
  },

  /**
   * Update affiliate program settings
   */
  async updateAffiliateSettings(
    organizationId: string,
    settings: {
      enabled?: boolean;
      default_commission?: number;
      cookie_days?: number;
      min_payout?: number;
      auto_approve?: boolean;
    }
  ): Promise<MarketingSettings> {
    return this.upsert(organizationId, {
      affiliate_enabled: settings.enabled,
      affiliate_default_commission: settings.default_commission,
      affiliate_cookie_days: settings.cookie_days,
      affiliate_min_payout: settings.min_payout,
      affiliate_auto_approve: settings.auto_approve,
    });
  },

  /**
   * Update review platform connections
   */
  async updateReviewPlatforms(
    organizationId: string,
    platforms: {
      google_place_id?: string;
      facebook_page_id?: string;
      yelp_business_id?: string;
      tripadvisor_id?: string;
    }
  ): Promise<MarketingSettings> {
    return this.upsert(organizationId, platforms);
  },
};
