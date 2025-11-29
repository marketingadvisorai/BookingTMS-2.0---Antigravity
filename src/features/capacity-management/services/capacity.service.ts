/**
 * Capacity Management Service
 * Handles session blocking/unblocking and capacity overrides
 */

import { supabase } from '@/lib/supabase';
import type {
  BlockedSession,
  BlockSessionRequest,
  CapacityOverride,
  CapacityStats,
} from '../types';

// Database row types (snake_case)
interface DBBlockedSession {
  id: string;
  activity_id: string;
  session_id?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  is_full_day: boolean;
  reason: string;
  notes?: string;
  blocked_by: string;
  created_at: string;
  updated_at: string;
}

interface DBActivitySession {
  max_capacity: number;
  capacity_remaining: number;
}

class CapacityService {
  /**
   * Block a session or full day
   */
  async blockSession(request: BlockSessionRequest): Promise<BlockedSession | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const blockedSession: Partial<BlockedSession> = {
      activityId: request.activityId,
      date: request.date,
      startTime: request.startTime,
      endTime: request.endTime,
      isFullDay: request.isFullDay,
      reason: request.reason,
      notes: request.notes,
      blockedBy: user.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Use type assertion as table types will be available after migration
    const { data, error } = await (supabase
      .from('blocked_sessions') as any)
      .insert({
        activity_id: request.activityId,
        date: request.date,
        start_time: request.startTime,
        end_time: request.endTime,
        is_full_day: request.isFullDay,
        reason: request.reason,
        notes: request.notes,
        blocked_by: user.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to block session:', error);
      return null;
    }

    // Update activity_sessions if specific session
    if (request.startTime && !request.isFullDay) {
      await (supabase
        .from('activity_sessions') as any)
        .update({ is_blocked: true, block_reason: request.reason })
        .eq('activity_id', request.activityId)
        .eq('date', request.date)
        .eq('start_time', request.startTime);
    }

    return data as BlockedSession;
  }

  /**
   * Unblock a session
   */
  async unblockSession(blockedSessionId: string): Promise<boolean> {
    const { data: blocked } = await (supabase
      .from('blocked_sessions') as any)
      .select('*')
      .eq('id', blockedSessionId)
      .single();

    if (!blocked) return false;

    const { error } = await (supabase
      .from('blocked_sessions') as any)
      .delete()
      .eq('id', blockedSessionId);

    if (error) {
      console.error('Failed to unblock session:', error);
      return false;
    }

    // Update activity_sessions if specific session
    const blockedRow = blocked as DBBlockedSession;
    if (blockedRow.start_time && !blockedRow.is_full_day) {
      await (supabase
        .from('activity_sessions') as any)
        .update({ is_blocked: false, block_reason: null })
        .eq('activity_id', blockedRow.activity_id)
        .eq('date', blockedRow.date)
        .eq('start_time', blockedRow.start_time);
    }

    return true;
  }

  /**
   * Get blocked sessions for an activity
   */
  async getBlockedSessions(
    activityId: string,
    startDate?: string,
    endDate?: string
  ): Promise<BlockedSession[]> {
    let query = (supabase
      .from('blocked_sessions') as any)
      .select('*')
      .eq('activity_id', activityId)
      .order('date', { ascending: true });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch blocked sessions:', error);
      return [];
    }

    return (data || []).map(this.mapToBlockedSession);
  }

  /**
   * Override capacity for a date/time
   */
  async setCapacityOverride(
    activityId: string,
    date: string,
    maxCapacity: number,
    startTime?: string,
    reason?: string
  ): Promise<CapacityOverride | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return null;

    const override: Partial<CapacityOverride> = {
      activityId,
      date,
      startTime,
      maxCapacity,
      reason,
      createdBy: user.user.id,
      createdAt: new Date().toISOString(),
    };

    const { data, error } = await (supabase
      .from('capacity_overrides') as any)
      .upsert({
        activity_id: activityId,
        date,
        start_time: startTime,
        max_capacity: maxCapacity,
        reason,
        created_by: user.user.id,
      }, { onConflict: 'activity_id,date,start_time' })
      .select()
      .single();

    if (error) {
      console.error('Failed to set capacity override:', error);
      return null;
    }

    return data as CapacityOverride;
  }

  /**
   * Remove capacity override
   */
  async removeCapacityOverride(overrideId: string): Promise<boolean> {
    const { error } = await (supabase
      .from('capacity_overrides') as any)
      .delete()
      .eq('id', overrideId);

    return !error;
  }

  /**
   * Get capacity stats for an activity
   */
  async getCapacityStats(
    activityId: string,
    startDate: string,
    endDate: string
  ): Promise<CapacityStats> {
    const { data: sessions } = await (supabase
      .from('activity_sessions') as any)
      .select('*')
      .eq('activity_id', activityId)
      .gte('date', startDate)
      .lte('date', endDate);

    const { data: blocked } = await (supabase
      .from('blocked_sessions') as any)
      .select('*')
      .eq('activity_id', activityId)
      .gte('date', startDate)
      .lte('date', endDate);

    const sessionList = (sessions || []) as DBActivitySession[];
    const totalSessions = sessionList.length;
    const blockedSessions = blocked?.length || 0;
    const availableSessions = totalSessions - blockedSessions;

    const totalCapacity = sessionList.reduce((sum, s) => sum + (s.max_capacity || 0), 0);
    const bookedCapacity = sessionList.reduce(
      (sum, s) => sum + ((s.max_capacity || 0) - (s.capacity_remaining || 0)),
      0
    );

    return {
      totalSessions,
      blockedSessions,
      availableSessions,
      averageCapacity: totalSessions > 0 ? Math.round(totalCapacity / totalSessions) : 0,
      utilizationRate: totalCapacity > 0 ? Math.round((bookedCapacity / totalCapacity) * 100) : 0,
    };
  }

  private mapToBlockedSession(row: any): BlockedSession {
    return {
      id: row.id,
      activityId: row.activity_id,
      sessionId: row.session_id,
      date: row.date,
      startTime: row.start_time,
      endTime: row.end_time,
      isFullDay: row.is_full_day,
      reason: row.reason,
      notes: row.notes,
      blockedBy: row.blocked_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const capacityService = new CapacityService();
