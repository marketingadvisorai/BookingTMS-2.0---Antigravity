/**
 * MarketingPro 1.1 - Gift Cards Service
 * @description CRUD operations for gift cards with multi-tenant support
 */

import { supabase } from '@/lib/supabase';
import type { GiftCard } from '../types';

export interface CreateGiftCardInput {
  organization_id: string;
  initial_value: number;
  purchaser_name?: string;
  purchaser_email?: string;
  recipient_name?: string;
  recipient_email?: string;
  message?: string;
  expires_at?: string;
}

/**
 * Generate a unique gift card code
 */
const generateGiftCardCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'GC-';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Gift Cards service with multi-tenant organization scoping
 */
export const GiftCardsService = {
  /**
   * List all gift cards for an organization
   */
  async listByOrganization(organizationId: string): Promise<GiftCard[]> {
    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch gift cards: ${error.message}`);
    return (data || []) as GiftCard[];
  },

  /**
   * Get a single gift card by ID
   */
  async getById(id: string): Promise<GiftCard | null> {
    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Failed to fetch gift card: ${error.message}`);
    return data as GiftCard;
  },

  /**
   * Validate and get gift card by code
   */
  async validateCode(organizationId: string, code: string): Promise<GiftCard | null> {
    const { data, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !data) return null;

    const gc = data as GiftCard;
    // Check expiration
    if (gc.expires_at && new Date(gc.expires_at) < new Date()) return null;
    // Check balance
    if (gc.current_balance <= 0) return null;

    return gc;
  },

  /**
   * Create a new gift card
   */
  async create(input: CreateGiftCardInput): Promise<GiftCard> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('gift_cards')
      .insert({
        ...input,
        code: generateGiftCardCode(),
        current_balance: input.initial_value,
        created_by: user?.user?.id,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create gift card: ${error.message}`);
    return data as GiftCard;
  },

  /**
   * Bulk create gift cards
   */
  async bulkCreate(organizationId: string, count: number, value: number): Promise<GiftCard[]> {
    const { data: user } = await supabase.auth.getUser();
    
    const giftCards = Array.from({ length: count }, () => ({
      organization_id: organizationId,
      code: generateGiftCardCode(),
      initial_value: value,
      current_balance: value,
      created_by: user?.user?.id,
    }));

    const { data, error } = await supabase
      .from('gift_cards')
      .insert(giftCards)
      .select();

    if (error) throw new Error(`Failed to bulk create gift cards: ${error.message}`);
    return (data || []) as GiftCard[];
  },

  /**
   * Redeem amount from gift card
   */
  async redeem(id: string, amount: number, bookingId?: string): Promise<GiftCard> {
    // Get current balance
    const { data: gc, error: fetchError } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !gc) throw new Error('Gift card not found');
    
    const giftCard = gc as GiftCard;
    if (giftCard.current_balance < amount) {
      throw new Error('Insufficient balance');
    }

    const newBalance = giftCard.current_balance - amount;

    // Update balance
    const { data, error } = await supabase
      .from('gift_cards')
      .update({
        current_balance: newBalance,
        redeemed_at: newBalance === 0 ? new Date().toISOString() : undefined,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to redeem gift card: ${error.message}`);

    // Record transaction
    await supabase.from('gift_card_transactions').insert({
      gift_card_id: id,
      booking_id: bookingId,
      amount: -amount,
      balance_after: newBalance,
      transaction_type: 'redemption',
    });

    return data as GiftCard;
  },

  /**
   * Deactivate a gift card
   */
  async deactivate(id: string): Promise<void> {
    const { error } = await supabase
      .from('gift_cards')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(`Failed to deactivate gift card: ${error.message}`);
  },

  /**
   * Get gift card statistics
   */
  async getStats(organizationId: string) {
    const { data, error } = await supabase
      .from('gift_cards')
      .select('id, is_active, initial_value, current_balance')
      .eq('organization_id', organizationId);

    if (error) throw new Error(`Failed to fetch gift card stats: ${error.message}`);

    const cards = (data || []) as GiftCard[];
    return {
      total: cards.length,
      active: cards.filter(c => c.is_active && c.current_balance > 0).length,
      totalValue: cards.reduce((sum, c) => sum + c.initial_value, 0),
      remainingBalance: cards.reduce((sum, c) => sum + c.current_balance, 0),
    };
  },
};
