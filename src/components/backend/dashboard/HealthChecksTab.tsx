/**
 * Health Checks Tab Component
 * Displays service health status
 * @module components/backend/dashboard/HealthChecksTab
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { HealthCheck, DashboardTheme, STATUS_BADGE_CLASSES } from './types';

interface HealthChecksTabProps {
  theme: DashboardTheme;
  healthChecks: HealthCheck[];
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'unhealthy':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'degraded':
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    default:
      return <AlertCircle className="w-5 h-5 text-gray-500" />;
  }
}

export function HealthChecksTab({ theme, healthChecks }: HealthChecksTabProps) {
  const { isDark, bgCard, textPrimary, textSecondary, borderColor } = theme;

  return (
    <Card className={`${bgCard} border ${borderColor}`}>
      <div className={`p-6 border-b ${borderColor}`}>
        <h3 className={`text-lg ${textPrimary} mb-1`}>Service Health</h3>
        <p className={`text-sm ${textSecondary}`}>
          Health status of all backend services
        </p>
      </div>
      <div className="p-6 space-y-4">
        {healthChecks.length === 0 ? (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              No health check data available. Click "Refresh All" to run checks.
            </AlertDescription>
          </Alert>
        ) : (
          healthChecks.map((check, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${borderColor} ${
                isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <h4 className={textPrimary}>{check.service}</h4>
                </div>
                <Badge className={STATUS_BADGE_CLASSES[check.status] || STATUS_BADGE_CLASSES.unknown}>
                  {check.status}
                </Badge>
              </div>
              <p className={`text-sm ${textSecondary} mb-2`}>{check.message}</p>
              <div className={`flex items-center gap-4 text-xs ${textSecondary}`}>
                {check.responseTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {check.responseTime}ms
                  </span>
                )}
                <span>Last checked: {new Date(check.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
