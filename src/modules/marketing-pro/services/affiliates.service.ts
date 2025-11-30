/**
 * MarketingPro 1.1 - Affiliates Service
 * @description CRUD operations for affiliates with multi-tenant support
 */

import { supabase } from '@/lib/supabase';
import type { Affiliate } from '../types';

export interface CreateAffiliateInput {
  organization_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  commission_type?: 'percentage' | 'fixed';
  commission_rate?: number;
  payout_method?: 'bank_transfer' | 'paypal' | 'stripe' | 'check';
  notes?: string;
}

/**
 * Generate a unique affiliate referral code
 */
const generateReferralCode = (name: string): string => {
  const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
};

/**
 * Affiliates service with multi-tenant organization scoping
 */
export const AffiliatesService = {
  async listByOrganization(organizationId: string): Promise<Affiliate[]> {
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch affiliates: ${error.message}`);
    return (data || []) as Affiliate[];
  },

  async getById(id: string): Promise<Affiliate | null> {
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch affiliate: ${error.message}`);
    return data as Affiliate;
  },

  async create(input: CreateAffiliateInput): Promise<Affiliate> {
    const { data, error } = await supabase
      .from('affiliates')
      .insert({
        ...input,
        referral_code: generateReferralCode(input.name),
        commission_rate: input.commission_rate ?? 10,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create affiliate: ${error.message}`);
    return data as Affiliate;
  },

  async approve(id: string): Promise<Affiliate> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('affiliates')
      .update({
        status: 'active',
        approved_by: user?.user?.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to approve affiliate: ${error.message}`);
    return data as Affiliate;
  },

  async updateStatus(id: string, status: 'active' | 'paused' | 'terminated'): Promise<Affiliate> {
    const { data, error } = await supabase
      .from('affiliates')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update affiliate status: ${error.message}`);
    return data as Affiliate;
  },

  async updateCommission(id: string, rate: number, type: 'percentage' | 'fixed'): Promise<Affiliate> {
    const { data, error } = await supabase
      .from('affiliates')
      .update({
        commission_rate: rate,
        commission_type: type,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update commission: ${error.message}`);
    return data as Affiliate;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('affiliates').delete().eq('id', id);
    if (error) throw new Error(`Failed to delete affiliate: ${error.message}`);
  },

  async getStats(organizationId: string) {
    const { data, error } = await supabase
      .from('affiliates')
      .select('id, status, total_referrals, total_conversions, total_revenue, total_commissions')
      .eq('organization_id', organizationId);

    if (error) throw new Error(`Failed to fetch affiliate stats: ${error.message}`);

    const affiliates = (data || []) as Affiliate[];
    return {
      total: affiliates.length,
      active: affiliates.filter(a => a.status === 'active').length,
      pending: affiliates.filter(a => a.status === 'pending').length,
      totalReferrals: affiliates.reduce((sum, a) => sum + (a.total_referrals || 0), 0),
      totalConversions: affiliates.reduce((sum, a) => sum + (a.total_conversions || 0), 0),
      totalRevenue: affiliates.reduce((sum, a) => sum + (a.total_revenue || 0), 0),
      totalCommissions: affiliates.reduce((sum, a) => sum + (a.total_commissions || 0), 0),
    };
  },

  /**
   * Track a referral click
   */
  async trackReferral(referralCode: string, customerEmail?: string, referralUrl?: string) {
    // Find affiliate by code
    const { data: affiliate, error: findError } = await supabase
      .from('affiliates')
      .select('id, organization_id')
      .eq('referral_code', referralCode)
      .eq('status', 'active')
      .single();

    if (findError || !affiliate) return null;

    // Create referral record
    const { data, error } = await supabase
      .from('affiliate_referrals')
      .insert({
        affiliate_id: affiliate.id,
        customer_email: customerEmail,
        referral_url: referralUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to track referral: ${error.message}`);

    // Update affiliate referral count
    await supabase.rpc('increment_affiliate_referrals', { aff_id: affiliate.id });

    return data;
  },
};
