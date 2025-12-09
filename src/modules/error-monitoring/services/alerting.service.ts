/**
 * Alerting Service - Send alerts for critical events
 * @module error-monitoring/services/alerting
 */

import { supabase } from '@/lib/supabase';
import type {
  ErrorAlert,
  DBErrorAlert,
  AlertInput,
  AlertHistory,
  AlertType,
  AlertChannel,
} from '../types';

class AlertingService {
  /**
   * Create a new alert configuration
   */
  async createAlert(input: AlertInput, userId?: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('error_alerts')
        .insert({
          name: input.name,
          alert_type: input.alertType,
          channel: input.channel,
          trigger_conditions: input.triggerConditions,
          recipients: input.recipients,
          webhook_url: input.webhookUrl,
          slack_channel: input.slackChannel,
          created_by: userId,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('[Alerting] Failed to create alert:', error);
      return null;
    }
  }

  /**
   * List all alerts
   */
  async listAlerts(): Promise<ErrorAlert[]> {
    try {
      const { data, error } = await supabase
        .from('error_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(this.mapDBToUI);
    } catch (error) {
      console.error('[Alerting] Failed to list alerts:', error);
      return [];
    }
  }

  /**
   * Toggle alert active status
   */
  async toggleAlert(id: string, isActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('error_alerts')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[Alerting] Failed to toggle alert:', error);
      return false;
    }
  }

  /**
   * Delete alert
   */
  async deleteAlert(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('error_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[Alerting] Failed to delete alert:', error);
      return false;
    }
  }

  /**
   * Trigger an alert
   */
  async triggerAlert(
    alertId: string,
    triggeredBy: { errorId?: string; healthCheckId?: string; reportId?: string }
  ): Promise<boolean> {
    try {
      // Get alert configuration
      const { data: alert, error: alertError } = await supabase
        .from('error_alerts')
        .select('*')
        .eq('id', alertId)
        .eq('is_active', true)
        .single();

      if (alertError || !alert) return false;

      // Send notification based on channel
      const deliveryStatus = await this.sendNotification(alert);

      // Record in history
      await supabase.from('alert_history').insert({
        alert_id: alertId,
        triggered_by_error_id: triggeredBy.errorId,
        triggered_by_health_check_id: triggeredBy.healthCheckId,
        triggered_by_report_id: triggeredBy.reportId,
        delivery_status: deliveryStatus,
      });

      // Update alert stats
      await supabase
        .from('error_alerts')
        .update({
          last_triggered_at: new Date().toISOString(),
          trigger_count: alert.trigger_count + 1,
        })
        .eq('id', alertId);

      return deliveryStatus === 'sent';
    } catch (error) {
      console.error('[Alerting] Failed to trigger alert:', error);
      return false;
    }
  }

  /**
   * Get alert history
   */
  async getAlertHistory(alertId?: string, limit = 50): Promise<AlertHistory[]> {
    try {
      let query = supabase
        .from('alert_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (alertId) query = query.eq('alert_id', alertId);

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        alertId: row.alert_id,
        triggeredByErrorId: row.triggered_by_error_id,
        triggeredByHealthCheckId: row.triggered_by_health_check_id,
        triggeredByReportId: row.triggered_by_report_id,
        deliveryStatus: row.delivery_status,
        deliveryResponse: row.delivery_response,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('[Alerting] Failed to get history:', error);
      return [];
    }
  }

  /**
   * Check if alert should trigger
   */
  async checkTriggerConditions(
    alertType: AlertType,
    context: Record<string, unknown>
  ): Promise<string[]> {
    try {
      const { data: alerts, error } = await supabase
        .from('error_alerts')
        .select('*')
        .eq('alert_type', alertType)
        .eq('is_active', true);

      if (error || !alerts) return [];

      const triggeredAlerts: string[] = [];
      for (const alert of alerts) {
        if (this.matchesConditions(alert.trigger_conditions, context)) {
          triggeredAlerts.push(alert.id);
        }
      }

      return triggeredAlerts;
    } catch (error) {
      console.error('[Alerting] Failed to check conditions:', error);
      return [];
    }
  }

  // Private methods
  private async sendNotification(alert: DBErrorAlert): Promise<string> {
    switch (alert.channel) {
      case 'email':
        return await this.sendEmailAlert(alert);
      case 'slack':
        return await this.sendSlackAlert(alert);
      case 'webhook':
        return await this.sendWebhookAlert(alert);
      case 'in_app':
        return 'sent'; // In-app notifications handled separately
      default:
        return 'failed';
    }
  }

  private async sendEmailAlert(alert: DBErrorAlert): Promise<string> {
    try {
      await supabase.functions.invoke('send-email', {
        body: {
          to: alert.recipients,
          subject: `[Alert] ${alert.name}`,
          template: 'alert-notification',
          data: { alertName: alert.name },
        },
      });
      return 'sent';
    } catch {
      return 'failed';
    }
  }

  private async sendSlackAlert(alert: DBErrorAlert): Promise<string> {
    if (!alert.webhook_url) return 'failed';
    try {
      await fetch(alert.webhook_url, {
        method: 'POST',
        body: JSON.stringify({ text: `🚨 Alert: ${alert.name}` }),
      });
      return 'sent';
    } catch {
      return 'failed';
    }
  }

  private async sendWebhookAlert(alert: DBErrorAlert): Promise<string> {
    if (!alert.webhook_url) return 'failed';
    try {
      await fetch(alert.webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert: alert.name, type: alert.alert_type }),
      });
      return 'sent';
    } catch {
      return 'failed';
    }
  }

  private matchesConditions(
    conditions: Record<string, unknown>,
    context: Record<string, unknown>
  ): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      if (context[key] !== value) return false;
    }
    return true;
  }

  private mapDBToUI(db: DBErrorAlert): ErrorAlert {
    return {
      id: db.id,
      name: db.name,
      alertType: db.alert_type,
      channel: db.channel,
      triggerConditions: db.trigger_conditions,
      recipients: db.recipients,
      webhookUrl: db.webhook_url,
      slackChannel: db.slack_channel,
      isActive: db.is_active,
      lastTriggeredAt: db.last_triggered_at,
      triggerCount: db.trigger_count,
      createdBy: db.created_by,
      createdAt: db.created_at,
      updatedAt: db.updated_at,
    };
  }
}

export const alertingService = new AlertingService();
