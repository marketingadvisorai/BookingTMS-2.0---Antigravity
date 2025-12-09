/**
 * Error Monitoring Types
 * @module components/backend/error-monitoring/types
 */

export interface SystemError {
  id: string;
  error_type: string;
  message: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  occurrence_count: number;
  auto_fixable: boolean;
  fix_category: 'auto_fixable' | 'approval_required' | 'admin_only';
  first_seen_at: string;
  last_seen_at: string;
  ai_analysis?: Record<string, unknown>;
}

export interface FixRequest {
  id: string;
  error_id: string;
  fix_type: string;
  status: string;
  ai_confidence: number;
  proposed_fix: {
    description?: string;
    code_changes?: Array<{ file: string; change: string }>;
  };
  files_affected: string[];
  created_at: string;
  error?: SystemError;
}

export interface ErrorStats {
  total: number;
  critical: number;
  new_today: number;
  resolved_today: number;
  pending_fixes: number;
}

export interface ErrorMonitoringTheme {
  isDark: boolean;
  bgCard: string;
  textPrimary: string;
  textSecondary: string;
  borderColor: string;
}

export function getErrorMonitoringTheme(isDark: boolean): ErrorMonitoringTheme {
  return {
    isDark,
    bgCard: isDark ? 'bg-[#161616]' : 'bg-white',
    textPrimary: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-gray-400' : 'text-gray-600',
    borderColor: isDark ? 'border-gray-800' : 'border-gray-200',
  };
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'error': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'warning': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'new': return 'bg-blue-500/10 text-blue-500';
    case 'investigating': return 'bg-yellow-500/10 text-yellow-500';
    case 'resolved': return 'bg-green-500/10 text-green-500';
    default: return 'bg-gray-500/10 text-gray-500';
  }
}
