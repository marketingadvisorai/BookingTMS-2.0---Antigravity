/**
 * Embed Pro 1.1 - Analytics Service
 * @module embed-pro/services/analytics
 * 
 * Handles analytics tracking and reporting
 */

import { supabase } from '@/lib/supabase';
import type {
  AnalyticsEventType,
  TrackEventInput,
  EmbedAnalyticsSummary,
  DailyEventStats,
  EventTypeStats,
  ReferrerStats,
} from '../types';

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
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
