/**
 * Error Types - System error tracking type definitions
 * @module error-monitoring/types/errors
 */

// Error type categories
export type ErrorType =
  | 'javascript'
  | 'network'
  | 'api'
  | 'database'
  | 'stripe'
  | 'webhook'
  | 'embed'
  | 'auth'
  | 'validation'
  | 'runtime'
  | 'crash'
  | 'unknown';

// Severity levels
export type Severity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

// Error status tracking
export type ErrorStatus =
  | 'new'
  | 'investigating'
  | 'identified'
  | 'fixing'
  | 'resolved'
  | 'ignored'
  | 'recurring';

// System error record
export interface SystemError {
  id: string;
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
  metadata: Record<string, unknown>;
  requestId?: string;
  sessionId?: string;
  status: ErrorStatus;
  occurrenceCount: number;
  firstSeenAt: string;
  lastSeenAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  aiAnalysis?: AIAnalysis;
  aiSuggestion?: string;
  aiAnalyzedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Database model (snake_case)
export interface DBSystemError {
  id: string;
  error_hash: string;
  error_type: ErrorType;
  severity: Severity;
  message: string;
  stack_trace?: string;
  component?: string;
  file_path?: string;
  line_number?: number;
  column_number?: number;
  url?: string;
  user_agent?: string;
  browser?: string;
  os?: string;
  device_type?: string;
  user_id?: string;
  organization_id?: string;
  metadata: Record<string, unknown>;
  request_id?: string;
  session_id?: string;
  status: ErrorStatus;
  occurrence_count: number;
  first_seen_at: string;
  last_seen_at: string;
  resolved_at?: string;
  resolved_by?: string;
  ai_analysis?: AIAnalysis;
  ai_suggestion?: string;
  ai_analyzed_at?: string;
  created_at: string;
  updated_at: string;
}

// AI analysis result
export interface AIAnalysis {
  rootCause: string;
  impact: string;
  suggestedFix?: string;
  severity: number; // 1-5
  relatedErrors?: string[];
  prevention?: string;
  confidence: number; // 0-100
  provider: 'anthropic' | 'openai';
  model: string;
}

// Error capture input
export interface ErrorCaptureInput {
  errorType: ErrorType;
  message: string;
  stackTrace?: string;
  component?: string;
  filePath?: string;
  lineNumber?: number;
  columnNumber?: number;
  url?: string;
  metadata?: Record<string, unknown>;
}

// Error statistics
export interface ErrorStats {
  totalErrors: number;
  criticalErrors: number;
  newErrors: number;
  resolvedErrors: number;
  errorRatePerHour: number;
  topErrorTypes: Record<string, number>;
  recentErrors: RecentError[];
}

export interface RecentError {
  id: string;
  type: ErrorType;
  message: string;
  severity: Severity;
  createdAt: string;
}

// Error filters
export interface ErrorFilters {
  status?: ErrorStatus;
  severity?: Severity;
  errorType?: ErrorType;
  organizationId?: string;
  timeRange?: '1h' | '24h' | '7d' | '30d';
  search?: string;
}
