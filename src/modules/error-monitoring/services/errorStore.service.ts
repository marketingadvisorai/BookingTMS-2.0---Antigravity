/**
 * Error Store Service - Store and retrieve errors from database
 * @module error-monitoring/services/errorStore
 */

import { supabase } from '@/lib/supabase';
import type {
  SystemError,
  DBSystemError,
  ErrorStats,
  ErrorFilters,
  ErrorType,
  Severity,
  ErrorStatus,
} from '../types';

interface StoreErrorInput {
  errorHash: string;
  errorType: ErrorType;
  severity: Severity;
  message: string;
  stackTrace?: string;
  component?: string;
  filePath?: string;
  lineNumber?: number;
  columnNumber?: number;
  url?: string;
  userAgent?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  userId?: string;
  organizationId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

class ErrorStoreService {
  /**
   * Store an error (with deduplication)
   */
  async storeError(input: StoreErrorInput): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('upsert_system_error', {
        p_error_hash: input.errorHash,
        p_error_type: input.errorType,
        p_severity: input.severity,
        p_message: input.message,
        p_stack_trace: input.stackTrace,
        p_component: input.component,
        p_file_path: input.filePath,
        p_line_number: input.lineNumber,
        p_url: input.url,
        p_user_id: input.userId,
        p_organization_id: input.organizationId,
        p_metadata: input.metadata || {},
      });

      if (error) throw error;
      return data as string;
    } catch (error) {
      console.error('[ErrorStore] Failed to store error:', error);
      return null;
    }
  }

  /**
   * Get error statistics
   */
  async getStats(
    timeRange: string = '24 hours',
    organizationId?: string
  ): Promise<ErrorStats | null> {
    try {
      const { data, error } = await supabase.rpc('get_error_stats', {
        p_time_range: timeRange,
        p_organization_id: organizationId,
      });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const stats = data[0];
      return {
        totalErrors: stats.total_errors,
        criticalErrors: stats.critical_errors,
        newErrors: stats.new_errors,
        resolvedErrors: stats.resolved_errors,
        errorRatePerHour: stats.error_rate_per_hour,
        topErrorTypes: stats.top_error_types || {},
        recentErrors: stats.recent_errors || [],
      };
    } catch (error) {
      console.error('[ErrorStore] Failed to get stats:', error);
      return null;
    }
  }

  /**
   * List errors with filters
   */
  async listErrors(
    filters: ErrorFilters,
    page = 1,
    pageSize = 20
  ): Promise<{ errors: SystemError[]; total: number }> {
    try {
      let query = supabase
        .from('system_errors')
        .select('*', { count: 'exact' });

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.severity) query = query.eq('severity', filters.severity);
      if (filters.errorType) query = query.eq('error_type', filters.errorType);
      if (filters.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
      }
      if (filters.search) {
        query = query.ilike('message', `%${filters.search}%`);
      }
      if (filters.timeRange) {
        const now = new Date();
        const ranges: Record<string, number> = {
          '1h': 1, '24h': 24, '7d': 168, '30d': 720,
        };
        const hours = ranges[filters.timeRange] || 24;
        const since = new Date(now.getTime() - hours * 60 * 60 * 1000);
        query = query.gte('created_at', since.toISOString());
      }

      const from = (page - 1) * pageSize;
      query = query.order('last_seen_at', { ascending: false }).range(from, from + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        errors: (data || []).map(this.mapDBToUI),
        total: count || 0,
      };
    } catch (error) {
      console.error('[ErrorStore] Failed to list errors:', error);
      return { errors: [], total: 0 };
    }
  }

  /**
   * Get single error by ID
   */
  async getError(id: string): Promise<SystemError | null> {
    try {
      const { data, error } = await supabase
        .from('system_errors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return this.mapDBToUI(data);
    } catch (error) {
      console.error('[ErrorStore] Failed to get error:', error);
      return null;
    }
  }

  /**
   * Update error status
   */
  async updateStatus(id: string, status: ErrorStatus, userId?: string): Promise<boolean> {
    try {
      const update: Partial<DBSystemError> = { status };
      if (status === 'resolved') {
        update.resolved_at = new Date().toISOString();
        update.resolved_by = userId;
      }

      const { error } = await supabase
        .from('system_errors')
        .update(update)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[ErrorStore] Failed to update status:', error);
      return false;
    }
  }

  private mapDBToUI(db: DBSystemError): SystemError {
    return {
      id: db.id,
      errorHash: db.error_hash,
      errorType: db.error_type,
      severity: db.severity,
      message: db.message,
      stackTrace: db.stack_trace,
      component: db.component,
      filePath: db.file_path,
      lineNumber: db.line_number,
      columnNumber: db.column_number,
      url: db.url,
      userAgent: db.user_agent,
      browser: db.browser,
      os: db.os,
      deviceType: db.device_type,
      userId: db.user_id,
      organizationId: db.organization_id,
      metadata: db.metadata,
      requestId: db.request_id,
      sessionId: db.session_id,
      status: db.status,
      occurrenceCount: db.occurrence_count,
      firstSeenAt: db.first_seen_at,
      lastSeenAt: db.last_seen_at,
      resolvedAt: db.resolved_at,
      resolvedBy: db.resolved_by,
      aiAnalysis: db.ai_analysis,
      aiSuggestion: db.ai_suggestion,
      aiAnalyzedAt: db.ai_analyzed_at,
      createdAt: db.created_at,
      updatedAt: db.updated_at,
    };
  }
}

export const errorStoreService = new ErrorStoreService();
