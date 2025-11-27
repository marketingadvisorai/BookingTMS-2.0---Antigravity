/**
 * Embed Pro 1.1 - Analytics Type Definitions
 * @module embed-pro/types/analytics
 */

// =====================================================
// EVENT TYPES
// =====================================================

export type AnalyticsEventType =
  | 'view'
  | 'interaction'
  | 'date_selected'
  | 'time_selected'
  | 'checkout_started'
  | 'booking_completed'
  | 'error';

// =====================================================
// EVENT ENTITY
// =====================================================

export interface EmbedAnalyticsEvent {
  id: string;
  embed_config_id: string;
  event_type: AnalyticsEventType;
  metadata: Record<string, unknown>;
  session_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  country_code: string | null;
  created_at: string;
}

// =====================================================
// INPUT TYPES
// =====================================================

export interface TrackEventInput {
  embed_config_id: string;
  event_type: AnalyticsEventType;
  metadata?: Record<string, unknown>;
  session_id?: string;
  referrer?: string;
}

// =====================================================
// AGGREGATED STATS
// =====================================================

export interface EmbedAnalyticsSummary {
  total_views: number;
  total_interactions: number;
  total_bookings: number;
  conversion_rate: number;
  avg_time_to_book: number | null;
  top_referrers: ReferrerStats[];
  events_by_day: DailyEventStats[];
  events_by_type: EventTypeStats[];
}

export interface ReferrerStats {
  referrer: string;
  count: number;
  percentage: number;
}

export interface DailyEventStats {
  date: string;
  views: number;
  interactions: number;
  bookings: number;
}

export interface EventTypeStats {
  event_type: AnalyticsEventType;
  count: number;
  percentage: number;
}

// =====================================================
// CHART DATA
// =====================================================

export interface AnalyticsChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

// =====================================================
// FILTER OPTIONS
// =====================================================

export interface AnalyticsFilterOptions {
  startDate?: string;
  endDate?: string;
  eventTypes?: AnalyticsEventType[];
  embedConfigId?: string;
}

// =====================================================
// EVENT METADATA SHAPES
// =====================================================

export interface ViewEventMetadata {
  page: string;
  viewport_width: number;
  viewport_height: number;
}

export interface InteractionEventMetadata {
  element: string;
  action: 'click' | 'hover' | 'scroll';
}

export interface DateSelectedMetadata {
  date: string;
  activity_id?: string;
}

export interface TimeSelectedMetadata {
  time: string;
  activity_id: string;
  session_id: string;
}

export interface CheckoutStartedMetadata {
  amount: number;
  currency: string;
  items: { activity_id: string; quantity: number }[];
}

export interface BookingCompletedMetadata {
  booking_id: string;
  amount: number;
  currency: string;
  activity_id: string;
}

export interface ErrorEventMetadata {
  error: string;
  code: string;
  stack?: string;
}
