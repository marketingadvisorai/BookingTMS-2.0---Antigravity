/**
 * Embed Pro 2.0 - Analytics Service
 * @module embed-pro/services/analytics
 * 
 * Handles analytics tracking and reporting.
 * Includes step drop-off tracking and funnel analysis.
 */

import { supabase } from '../../../lib/supabase';
import type {
  AnalyticsEventType,
  TrackEventInput,
  EmbedAnalyticsSummary,
  DailyEventStats,
  EventTypeStats,
  ReferrerStats,
} from '../types';

// =====================================================
// STEP FUNNEL TYPES
// =====================================================

export interface StepFunnelStats {
  step: string;
  count: number;
  percentage: number;
  dropOffRate: number;
}

export interface FunnelAnalysis {
  steps: StepFunnelStats[];
  overallConversionRate: number;
  biggestDropOff: { step: string; rate: number } | null;
}

// =====================================================
// ANALYTICS SERVICE
// =====================================================

class AnalyticsService {
  private readonly tableName = 'embed_analytics';

  /**
   * Track an analytics event
   */
  async trackEvent(input: TrackEventInput): Promise<void> {
    const insertData = {
      embed_config_id: input.embed_config_id,
      event_type: input.event_type,
      metadata: input.metadata || {},
      session_id: input.session_id || this.generateSessionId(),
      referrer: input.referrer || (typeof document !== 'undefined' ? document.referrer : null),
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    };

    await supabase.from(this.tableName).insert(insertData as never);
  }

  /**
   * Generate a random session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get analytics summary for an embed config
   */
  async getSummary(
    embedConfigId: string,
    startDate?: string,
    endDate?: string
  ): Promise<EmbedAnalyticsSummary> {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('embed_config_id', embedConfigId);

    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data: events } = await query;
    const eventList = (events as Array<{ event_type: string; referrer: string | null; created_at: string }>) || [];

    // Calculate metrics
    const totalViews = eventList.filter(e => e.event_type === 'view').length;
    const totalInteractions = eventList.filter(e => e.event_type === 'interaction').length;
    const totalBookings = eventList.filter(e => e.event_type === 'booking_completed').length;
    const conversionRate = totalViews > 0 ? (totalBookings / totalViews) * 100 : 0;

    // Group by referrer
    const referrerMap = new Map<string, number>();
    eventList.forEach(e => {
      const ref = e.referrer || 'Direct';
      referrerMap.set(ref, (referrerMap.get(ref) || 0) + 1);
    });

    const topReferrers: ReferrerStats[] = Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({
        referrer,
        count,
        percentage: (count / eventList.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Group by day
    const dayMap = new Map<string, { views: number; interactions: number; bookings: number }>();
    eventList.forEach(e => {
      const day = e.created_at.split('T')[0];
      const stats = dayMap.get(day) || { views: 0, interactions: 0, bookings: 0 };
      if (e.event_type === 'view') stats.views++;
      if (e.event_type === 'interaction') stats.interactions++;
      if (e.event_type === 'booking_completed') stats.bookings++;
      dayMap.set(day, stats);
    });

    const eventsByDay: DailyEventStats[] = Array.from(dayMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Group by event type
    const typeMap = new Map<string, number>();
    eventList.forEach(e => {
      typeMap.set(e.event_type, (typeMap.get(e.event_type) || 0) + 1);
    });

    const eventsByType: EventTypeStats[] = Array.from(typeMap.entries())
      .map(([event_type, count]) => ({
        event_type: event_type as AnalyticsEventType,
        count,
        percentage: (count / eventList.length) * 100,
      }));

    return {
      total_views: totalViews,
      total_interactions: totalInteractions,
      total_bookings: totalBookings,
      conversion_rate: Math.round(conversionRate * 100) / 100,
      avg_time_to_book: null, // TODO: Calculate from timestamps
      top_referrers: topReferrers,
      events_by_day: eventsByDay,
      events_by_type: eventsByType,
    };
  }

  /**
   * Get recent events for an embed config
   */
  async getRecentEvents(embedConfigId: string, limit = 50) {
    const { data } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('embed_config_id', embedConfigId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  }

  /**
   * Clear analytics for an embed config
   */
  async clearAnalytics(embedConfigId: string): Promise<void> {
    await supabase
      .from(this.tableName)
      .delete()
      .eq('embed_config_id', embedConfigId);
  }

  /**
   * Increment view count for an embed config
   */
  async incrementViewCount(embedKey: string): Promise<void> {
    try {
      const { data } = await supabase
        .from('embed_configs')
        .select('view_count')
        .eq('embed_key', embedKey)
        .single();

      if (data) {
        await supabase
          .from('embed_configs')
          .update({ view_count: ((data as any).view_count || 0) + 1 } as never)
          .eq('embed_key', embedKey);
      }
    } catch (error) {
      console.warn('[Analytics] Failed to increment view count:', error);
    }
  }

  /**
   * Increment booking count for an embed config
   */
  async incrementBookingCount(embedKey: string): Promise<void> {
    try {
      const { data } = await supabase
        .from('embed_configs')
        .select('booking_count')
        .eq('embed_key', embedKey)
        .single();

      if (data) {
        await supabase
          .from('embed_configs')
          .update({ booking_count: ((data as any).booking_count || 0) + 1 } as never)
          .eq('embed_key', embedKey);
      }
    } catch (error) {
      console.warn('[Analytics] Failed to increment booking count:', error);
    }
  }

  /**
   * Get funnel analysis (step drop-off rates)
   */
  async getFunnelAnalysis(
    embedConfigId: string,
    startDate?: string,
    endDate?: string
  ): Promise<FunnelAnalysis> {
    let query = supabase
      .from(this.tableName)
      .select('event_type')
      .eq('embed_config_id', embedConfigId);

    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const { data: events } = await query;
    const eventList = (events as Array<{ event_type: string }>) || [];

    // Define funnel steps in order
    const funnelSteps = [
      { key: 'view', label: 'Widget Viewed' },
      { key: 'date_selected', label: 'Date Selected' },
      { key: 'time_selected', label: 'Time Selected' },
      { key: 'checkout_started', label: 'Checkout Started' },
      { key: 'booking_completed', label: 'Booking Completed' },
    ];

    // Count events by type
    const counts = new Map<string, number>();
    eventList.forEach(e => {
      counts.set(e.event_type, (counts.get(e.event_type) || 0) + 1);
    });

    // Build funnel stats
    const steps: StepFunnelStats[] = [];
    let previousCount = 0;

    funnelSteps.forEach((step, index) => {
      const count = counts.get(step.key) || 0;
      const firstCount = counts.get('view') || 1;
      const percentage = firstCount > 0 ? (count / firstCount) * 100 : 0;
      const dropOffRate = index > 0 && previousCount > 0 
        ? ((previousCount - count) / previousCount) * 100 
        : 0;

      steps.push({
        step: step.label,
        count,
        percentage: Math.round(percentage * 10) / 10,
        dropOffRate: Math.round(dropOffRate * 10) / 10,
      });

      previousCount = count;
    });

    // Find biggest drop-off
    let biggestDropOff: { step: string; rate: number } | null = null;
    steps.forEach(step => {
      if (!biggestDropOff || step.dropOffRate > biggestDropOff.rate) {
        if (step.dropOffRate > 0) {
          biggestDropOff = { step: step.step, rate: step.dropOffRate };
        }
      }
    });

    const viewCount = counts.get('view') || 0;
    const bookingCount = counts.get('booking_completed') || 0;
    const overallConversionRate = viewCount > 0 
      ? Math.round((bookingCount / viewCount) * 1000) / 10 
      : 0;

    return {
      steps,
      overallConversionRate,
      biggestDropOff,
    };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
