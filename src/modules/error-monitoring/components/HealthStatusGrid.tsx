/**
 * HealthStatusGrid - Display system health status
 * @module error-monitoring/components/HealthStatusGrid
 */

import React from 'react';
import {
  Server,
  Database,
  CreditCard,
  Mail,
  Webhook,
  LayoutGrid,
  CheckCircle,
  AlertCircle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { HealthSummary, HealthStatus } from '../types';
import { SERVICE_INFO, STATUS_COLORS } from '../constants';

interface HealthStatusGridProps {
  summaries: HealthSummary[];
  loading?: boolean;
  onRunChecks?: () => void;
}

const STATUS_ICONS: Record<HealthStatus, React.ReactNode> = {
  healthy: <CheckCircle className="h-4 w-4 text-green-500" />,
  degraded: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  unhealthy: <XCircle className="h-4 w-4 text-red-500" />,
  unknown: <HelpCircle className="h-4 w-4 text-gray-500" />,
};

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  api: <Server className="h-5 w-5" />,
  database: <Database className="h-5 w-5" />,
  stripe: <CreditCard className="h-5 w-5" />,
  webhooks: <Webhook className="h-5 w-5" />,
  'embed-widgets': <LayoutGrid className="h-5 w-5" />,
  email: <Mail className="h-5 w-5" />,
};

function ServiceCard({ summary }: { summary: HealthSummary }) {
  const info = SERVICE_INFO[summary.serviceName] || {
    label: summary.serviceName,
    description: 'Service',
  };
  const colors = STATUS_COLORS[summary.currentStatus];

  return (
    <Card
      className="border-border/40"
      style={{ borderLeftColor: colors.border, borderLeftWidth: 3 }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              {SERVICE_ICONS[summary.serviceName] || <Server className="h-5 w-5" />}
            </div>
            <div>
              <h4 className="font-medium">{info.label}</h4>
              <p className="text-xs text-muted-foreground">{info.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {STATUS_ICONS[summary.currentStatus]}
            <Badge
              variant="outline"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                borderColor: colors.border,
              }}
            >
              {summary.currentStatus}
            </Badge>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Response: {summary.responseTimeMs ? `${summary.responseTimeMs}ms` : 'N/A'}
          </span>
          <span>Uptime: {summary.uptime24h?.toFixed(1) || 100}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function HealthStatusGrid({ summaries, loading }: HealthStatusGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-border/40 animate-pulse">
            <CardContent className="p-4 h-28" />
          </Card>
        ))}
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No health data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">System Health</h3>
        <Badge variant="outline" className="text-xs">
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaries.map((summary) => (
          <ServiceCard key={summary.serviceName} summary={summary} />
        ))}
      </div>
    </div>
  );
}
