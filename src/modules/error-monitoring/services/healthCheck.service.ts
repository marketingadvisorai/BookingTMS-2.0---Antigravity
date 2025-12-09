/**
 * Health Check Service - Monitor system health
 * @module error-monitoring/services/healthCheck
 */

import { supabase } from '@/lib/supabase';
import type {
  HealthCheck,
  DBHealthCheck,
  HealthSummary,
  HealthStatus,
  HealthCheckType,
  SystemStatus,
} from '../types';
import { HEALTH_CHECK_CONFIGS } from '../constants';

class HealthCheckService {
  /**
   * Run all health checks
   */
  async runAllChecks(): Promise<HealthCheck[]> {
    const results: HealthCheck[] = [];
    
    for (const config of HEALTH_CHECK_CONFIGS) {
      if (!config.enabled) continue;
      
      const result = await this.runCheck(config.serviceName, config.checkType);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Run a single health check
   */
  async runCheck(serviceName: string, checkType: HealthCheckType): Promise<HealthCheck> {
    const startTime = Date.now();
    let status: HealthStatus = 'unknown';
    let responseTimeMs: number | undefined;
    let statusCode: number | undefined;
    let errorMessage: string | undefined;
    let details: Record<string, unknown> = {};

    try {
      switch (checkType) {
        case 'database':
          await this.checkDatabase();
          status = 'healthy';
          break;
        case 'api':
          const apiResult = await this.checkApi();
          status = apiResult.status;
          statusCode = apiResult.statusCode;
          break;
        case 'stripe':
          status = await this.checkStripe();
          break;
        default:
          status = 'unknown';
      }
      responseTimeMs = Date.now() - startTime;
    } catch (error) {
      status = 'unhealthy';
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      responseTimeMs = Date.now() - startTime;
    }

    // Store result
    const result: HealthCheck = {
      id: crypto.randomUUID(),
      checkType,
      serviceName,
      status,
      responseTimeMs,
      statusCode,
      errorMessage,
      details,
      checkedAt: new Date().toISOString(),
    };

    await this.storeResult(result);
    return result;
  }

  /**
   * Get health summary for all services
   */
  async getHealthSummary(): Promise<HealthSummary[]> {
    try {
      const { data, error } = await supabase.rpc('get_health_summary');
      if (error) throw error;
      
      return (data || []).map((row: {
        service_name: string;
        current_status: HealthStatus;
        last_check_time: string;
        response_time_ms: number;
        uptime_24h: number;
      }) => ({
        serviceName: row.service_name,
        currentStatus: row.current_status,
        lastCheckTime: row.last_check_time,
        responseTimeMs: row.response_time_ms,
        uptime24h: row.uptime_24h,
      }));
    } catch (error) {
      console.error('[HealthCheck] Failed to get summary:', error);
      return [];
    }
  }

  /**
   * Get system status overview
   */
  async getSystemStatus(): Promise<SystemStatus> {
    const summaries = await this.getHealthSummary();
    const unhealthyCount = summaries.filter(s => s.currentStatus === 'unhealthy').length;
    const degradedCount = summaries.filter(s => s.currentStatus === 'degraded').length;

    let overallStatus: HealthStatus = 'healthy';
    if (unhealthyCount > 0) overallStatus = 'unhealthy';
    else if (degradedCount > 0) overallStatus = 'degraded';

    // Calculate 30-day uptime
    const uptime30d = await this.calculateUptime('api', 30);

    return {
      overallStatus,
      services: summaries,
      lastUpdated: new Date().toISOString(),
      uptime30d,
      incidentCount30d: 0, // TODO: Implement incident counting
    };
  }

  /**
   * Calculate uptime percentage
   */
  async calculateUptime(serviceName: string, days: number): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('calculate_uptime', {
        p_service_name: serviceName,
        p_days: days,
      });
      if (error) throw error;
      return data || 100;
    } catch (error) {
      console.error('[HealthCheck] Failed to calculate uptime:', error);
      return 100;
    }
  }

  /**
   * Get recent health checks for a service
   */
  async getRecentChecks(serviceName: string, limit = 20): Promise<HealthCheck[]> {
    try {
      const { data, error } = await supabase
        .from('health_checks')
        .select('*')
        .eq('service_name', serviceName)
        .order('checked_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(this.mapDBToUI);
    } catch (error) {
      console.error('[HealthCheck] Failed to get recent checks:', error);
      return [];
    }
  }

  // Private methods
  private async checkDatabase(): Promise<void> {
    const { error } = await supabase.from('organizations').select('id').limit(1);
    if (error) throw error;
  }

  private async checkApi(): Promise<{ status: HealthStatus; statusCode?: number }> {
    try {
      const { data, error } = await supabase.functions.invoke('health');
      if (error) return { status: 'unhealthy', statusCode: 500 };
      return { status: 'healthy', statusCode: 200 };
    } catch {
      return { status: 'unhealthy', statusCode: 500 };
    }
  }

  private async checkStripe(): Promise<HealthStatus> {
    // Simplified check - in production would call Stripe API
    return 'healthy';
  }

  private async storeResult(result: HealthCheck): Promise<void> {
    try {
      await supabase.from('health_checks').insert({
        check_type: result.checkType,
        service_name: result.serviceName,
        status: result.status,
        response_time_ms: result.responseTimeMs,
        status_code: result.statusCode,
        error_message: result.errorMessage,
        details: result.details,
      });
    } catch (error) {
      console.error('[HealthCheck] Failed to store result:', error);
    }
  }

  private mapDBToUI(db: DBHealthCheck): HealthCheck {
    return {
      id: db.id,
      checkType: db.check_type,
      serviceName: db.service_name,
      endpoint: db.endpoint,
      status: db.status,
      responseTimeMs: db.response_time_ms,
      statusCode: db.status_code,
      errorMessage: db.error_message,
      details: db.details,
      checkedAt: db.checked_at,
    };
  }
}

export const healthCheckService = new HealthCheckService();
