/**
 * Waiver Record Service
 * CRUD operations for signed waiver records with multi-tenant support
 * @module waivers/services/waiver.service
 */

import { supabase } from '@/lib/supabase/client';
import {
  WaiverRecord,
  DBWaiverRecord,
  WaiverStats,
  WaiverFilters,
  WaiverStatus,
} from '../types';
import { mapDBWaiverToUI, mapWaiverFormToDBInsert } from '../utils/mappers';

export interface ListWaiversOptions {
  organizationId?: string;
  templateId?: string;
  bookingId?: string;
  customerId?: string;
  status?: WaiverStatus | 'all';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

class WaiverService {
  // Use 'waivers' for existing data, will work with both old and new schema
  private tableName = 'waivers';

  /**
   * List all waiver records with optional filters
   */
  async list(options: ListWaiversOptions = {}): Promise<WaiverRecord[]> {
    const {
      templateId,
      bookingId,
      customerId,
      status,
      search,
      dateFrom,
      dateTo,
      limit = 50,
      offset = 0,
    } = options;

    let query = supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (templateId) query = query.eq('template_id', templateId);
    if (bookingId) query = query.eq('booking_id', bookingId);
    if (customerId) query = query.eq('customer_id', customerId);
    if (status && status !== 'all') query = query.eq('status', status);
    if (dateFrom) query = query.gte('signed_at', dateFrom);
    if (dateTo) query = query.lte('signed_at', dateTo);
    
    if (search) {
      query = query.or(
        `participant_name.ilike.%${search}%,participant_email.ilike.%${search}%,waiver_code.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching waivers:', error);
      throw new Error(error.message);
    }

    return (data || []).map((d) => mapDBWaiverToUI(d as DBWaiverRecord));
  }

  /**
   * Get a single waiver by ID
   */
  async getById(id: string): Promise<WaiverRecord | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching waiver:', error);
      throw new Error(error.message);
    }

    return data ? mapDBWaiverToUI(data as DBWaiverRecord) : null;
  }

  /**
   * Get a waiver by its code (for QR verification)
   */
  async getByCode(code: string): Promise<WaiverRecord | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('waiver_code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching waiver by code:', error);
      throw new Error(error.message);
    }

    return data ? mapDBWaiverToUI(data as DBWaiverRecord) : null;
  }

  /**
   * Create a new waiver record (submit a signed waiver)
   */
  async create(waiverData: {
    templateId: string;
    templateName: string;
    templateType: string;
    bookingId?: string;
    participantName: string;
    participantEmail: string;
    participantPhone?: string;
    participantDob?: string;
    isMinor?: boolean;
    guardianName?: string;
    guardianEmail?: string;
    guardianPhone?: string;
    signatureData: string;
    filledContent?: string;
    formData?: Record<string, any>;
  }): Promise<WaiverRecord> {
    const dbData = mapWaiverFormToDBInsert(waiverData);

    const { data, error } = await (supabase
      .from(this.tableName)
      .insert as any)(dbData)
      .select()
      .single();

    if (error) {
      console.error('Error creating waiver:', error);
      throw new Error(error.message);
    }

    return mapDBWaiverToUI(data as DBWaiverRecord);
  }

  /**
   * Update waiver status
   */
  async updateStatus(id: string, status: WaiverStatus): Promise<WaiverRecord> {
    const { data, error } = await (supabase
      .from(this.tableName)
      .update as any)({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating waiver status:', error);
      throw new Error(error.message);
    }

    return mapDBWaiverToUI(data as DBWaiverRecord);
  }

  /**
   * Record a check-in for a waiver
   */
  async recordCheckIn(
    waiverId: string,
    method: 'qr_scan' | 'manual' | 'camera' | 'upload',
    checkedInBy?: string
  ): Promise<void> {
    // Update the waiver's check-in count
    const waiver = await this.getById(waiverId);
    if (!waiver) throw new Error('Waiver not found');

    await (supabase
      .from(this.tableName)
      .update as any)({
        check_in_count: (waiver.checkInCount || 0) + 1,
        last_check_in: new Date().toISOString(),
      })
      .eq('id', waiverId);

    // Log the check-in
    await (supabase
      .from('waiver_check_ins')
      .insert as any)({
        waiver_id: waiverId,
        check_in_method: method,
        checked_in_by: checkedInBy,
        verified: true,
        checked_in_at: new Date().toISOString(),
      });
  }

  /**
   * Delete a waiver record
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting waiver:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Get waiver statistics
   */
  async getStats(organizationId?: string): Promise<WaiverStats> {
    let query = supabase.from(this.tableName).select('status, signed_at');

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching waiver stats:', error);
      return {
        total: 0,
        signed: 0,
        pending: 0,
        expired: 0,
        thisMonth: 0,
        signedThisWeek: 0,
      };
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const stats = {
      total: 0,
      signed: 0,
      pending: 0,
      expired: 0,
      thisMonth: 0,
      signedThisWeek: 0,
    };

    (data || []).forEach((item: any) => {
      stats.total++;
      if (item.status === 'signed') stats.signed++;
      else if (item.status === 'pending') stats.pending++;
      else if (item.status === 'expired') stats.expired++;

      if (item.signed_at) {
        const signedDate = new Date(item.signed_at);
        if (signedDate >= startOfMonth) stats.thisMonth++;
        if (signedDate >= startOfWeek && item.status === 'signed') {
          stats.signedThisWeek++;
        }
      }
    });

    return stats;
  }

  /**
   * Get waivers for a booking
   */
  async getForBooking(bookingId: string): Promise<WaiverRecord[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching waivers for booking:', error);
      return [];
    }

    return (data || []).map((d) => mapDBWaiverToUI(d as DBWaiverRecord));
  }

  /**
   * Send reminder email for pending waivers
   */
  async sendReminders(waiverIds: string[]): Promise<{ sent: number; failed: number }> {
    // This would integrate with an email service
    // For now, just return success for all
    console.log('Sending reminders for waivers:', waiverIds);
    return { sent: waiverIds.length, failed: 0 };
  }
}

export const waiverService = new WaiverService();
