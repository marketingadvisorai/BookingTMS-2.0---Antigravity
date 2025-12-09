/**
 * Report Types - User error report type definitions
 * @module error-monitoring/types/reports
 */

// Report types
export type ReportType =
  | 'bug'
  | 'feature_request'
  | 'performance'
  | 'ui_issue'
  | 'data_issue'
  | 'other';

// Reporter types
export type ReporterType = 'system_admin' | 'org_owner' | 'staff' | 'customer';

// Priority levels
export type Priority = 'low' | 'medium' | 'high' | 'critical';

// Report status
export type ReportStatus =
  | 'open'
  | 'in_progress'
  | 'pending_info'
  | 'resolved'
  | 'closed'
  | 'duplicate';

// User error report
export interface UserErrorReport {
  id: string;
  reportType: ReportType;
  priority: Priority;
  reporterType: ReporterType;
  reporterId?: string;
  reporterEmail?: string;
  reporterName?: string;
  organizationId?: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  url?: string;
  browserInfo?: BrowserInfo;
  screenshotUrls?: string[];
  linkedErrorId?: string;
  status: ReportStatus;
  assignedTo?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

// Database model
export interface DBUserErrorReport {
  id: string;
  report_type: ReportType;
  priority: Priority;
  reporter_type: ReporterType;
  reporter_id?: string;
  reporter_email?: string;
  reporter_name?: string;
  organization_id?: string;
  title: string;
  description: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  url?: string;
  browser_info?: BrowserInfo;
  screenshot_urls?: string[];
  linked_error_id?: string;
  status: ReportStatus;
  assigned_to?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

// Browser information
export interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  osVersion: string;
  deviceType: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
}

// Report submission input
export interface ReportInput {
  reportType: ReportType;
  priority?: Priority;
  reporterType: ReporterType;
  reporterEmail?: string;
  reporterName?: string;
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  screenshotUrls?: string[];
}

// Report statistics
export interface ReportStats {
  totalReports: number;
  openReports: number;
  inProgress: number;
  resolvedToday: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

// Report filters
export interface ReportFilters {
  status?: ReportStatus;
  priority?: Priority;
  reportType?: ReportType;
  reporterType?: ReporterType;
  organizationId?: string;
  assignedTo?: string;
  search?: string;
}
