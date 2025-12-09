/**
 * User Reports Service - Handle user-submitted error reports
 * @module error-monitoring/services/userReports
 */

import { supabase } from '@/lib/supabase';
import type {
  UserErrorReport,
  DBUserErrorReport,
  ReportInput,
  ReportStats,
  ReportFilters,
  ReportStatus,
} from '../types';
import { getBrowserInfo, getPageContext } from '../utils/errorEnricher';

class UserReportsService {
  /**
   * Submit a new report
   */
  async submitReport(
    input: ReportInput,
    organizationId?: string
  ): Promise<string | null> {
    try {
      const browserInfo = getBrowserInfo();
      const pageContext = getPageContext();

      const { data, error } = await supabase
        .from('user_error_reports')
        .insert({
          report_type: input.reportType,
          priority: input.priority || 'medium',
          reporter_type: input.reporterType,
          reporter_email: input.reporterEmail,
          reporter_name: input.reporterName,
          organization_id: organizationId,
          title: input.title,
          description: input.description,
          steps_to_reproduce: input.stepsToReproduce,
          expected_behavior: input.expectedBehavior,
          actual_behavior: input.actualBehavior,
          url: pageContext.url as string,
          browser_info: browserInfo,
          screenshot_urls: input.screenshotUrls,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('[UserReports] Failed to submit:', error);
      return null;
    }
  }

  /**
   * List reports with filters
   */
  async listReports(
    filters: ReportFilters,
    page = 1,
    pageSize = 20
  ): Promise<{ reports: UserErrorReport[]; total: number }> {
    try {
      let query = supabase
        .from('user_error_reports')
        .select('*', { count: 'exact' });

      if (filters.status) query = query.eq('status', filters.status);
      if (filters.priority) query = query.eq('priority', filters.priority);
      if (filters.reportType) query = query.eq('report_type', filters.reportType);
      if (filters.reporterType) query = query.eq('reporter_type', filters.reporterType);
      if (filters.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
      }
      if (filters.assignedTo) query = query.eq('assigned_to', filters.assignedTo);
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const from = (page - 1) * pageSize;
      query = query.order('created_at', { ascending: false }).range(from, from + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        reports: (data || []).map(this.mapDBToUI),
        total: count || 0,
      };
    } catch (error) {
      console.error('[UserReports] Failed to list:', error);
      return { reports: [], total: 0 };
    }
  }

  /**
   * Get report statistics
   */
  async getStats(): Promise<ReportStats | null> {
    try {
      const { data, error } = await supabase.rpc('get_report_stats');
      if (error) throw error;
      if (!data || data.length === 0) return null;

      const stats = data[0];
      return {
        totalReports: stats.total_reports,
        openReports: stats.open_reports,
        inProgress: stats.in_progress,
        resolvedToday: stats.resolved_today,
        byType: stats.by_type || {},
        byPriority: stats.by_priority || {},
      };
    } catch (error) {
      console.error('[UserReports] Failed to get stats:', error);
      return null;
    }
  }

  /**
   * Get single report
   */
  async getReport(id: string): Promise<UserErrorReport | null> {
    try {
      const { data, error } = await supabase
        .from('user_error_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return this.mapDBToUI(data);
    } catch (error) {
      console.error('[UserReports] Failed to get report:', error);
      return null;
    }
  }

  /**
   * Update report status
   */
  async updateStatus(
    id: string,
    status: ReportStatus,
    resolutionNotes?: string
  ): Promise<boolean> {
    try {
      const update: Partial<DBUserErrorReport> = { status };
      if (status === 'resolved') {
        update.resolved_at = new Date().toISOString();
        update.resolution_notes = resolutionNotes;
      }

      const { error } = await supabase
        .from('user_error_reports')
        .update(update)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[UserReports] Failed to update status:', error);
      return false;
    }
  }

  /**
   * Assign report to user
   */
  async assignTo(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_error_reports')
        .update({ assigned_to: userId, status: 'in_progress' })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[UserReports] Failed to assign:', error);
      return false;
    }
  }

  private mapDBToUI(db: DBUserErrorReport): UserErrorReport {
    return {
      id: db.id,
      reportType: db.report_type,
      priority: db.priority,
      reporterType: db.reporter_type,
      reporterId: db.reporter_id,
      reporterEmail: db.reporter_email,
      reporterName: db.reporter_name,
      organizationId: db.organization_id,
      title: db.title,
      description: db.description,
      stepsToReproduce: db.steps_to_reproduce,
      expectedBehavior: db.expected_behavior,
      actualBehavior: db.actual_behavior,
      url: db.url,
      browserInfo: db.browser_info,
      screenshotUrls: db.screenshot_urls,
      linkedErrorId: db.linked_error_id,
      status: db.status,
      assignedTo: db.assigned_to,
      resolvedAt: db.resolved_at,
      resolutionNotes: db.resolution_notes,
      createdAt: db.created_at,
      updatedAt: db.updated_at,
    };
  }
}

export const userReportsService = new UserReportsService();
