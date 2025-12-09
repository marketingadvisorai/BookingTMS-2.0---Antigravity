/**
 * Alert Types - Alert configuration type definitions
 * @module error-monitoring/types/alerts
 */

// Alert types
export type AlertType =
  | 'error_spike'
  | 'critical_error'
  | 'health_degraded'
  | 'uptime_incident'
  | 'new_user_report';

// Alert channels
export type AlertChannel = 'email' | 'slack' | 'webhook' | 'in_app';

// Alert configuration
export interface ErrorAlert {
  id: string;
  name: string;
  alertType: AlertType;
  channel: AlertChannel;
  triggerConditions: AlertTriggerConditions;
  recipients?: string[];
  webhookUrl?: string;
  slackChannel?: string;
  isActive: boolean;
  lastTriggeredAt?: string;
  triggerCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Database model
export interface DBErrorAlert {
  id: string;
  name: string;
  alert_type: AlertType;
  channel: AlertChannel;
  trigger_conditions: AlertTriggerConditions;
  recipients?: string[];
  webhook_url?: string;
  slack_channel?: string;
  is_active: boolean;
  last_triggered_at?: string;
  trigger_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Trigger conditions
export interface AlertTriggerConditions {
  errorType?: string;
  severity?: string;
  threshold?: number;
  timeWindowMinutes?: number;
  serviceName?: string;
}

// Alert history record
export interface AlertHistory {
  id: string;
  alertId: string;
  triggeredByErrorId?: string;
  triggeredByHealthCheckId?: string;
  triggeredByReportId?: string;
  deliveryStatus: string;
  deliveryResponse?: string;
  createdAt: string;
}

// Alert creation input
export interface AlertInput {
  name: string;
  alertType: AlertType;
  channel: AlertChannel;
  triggerConditions: AlertTriggerConditions;
  recipients?: string[];
  webhookUrl?: string;
  slackChannel?: string;
}
