/**
 * Connections Tab Component
 * Displays service connection status
 * @module components/backend/dashboard/ConnectionsTab
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle, Activity, Clock } from 'lucide-react';
import { ConnectionStatus, DashboardTheme, STATUS_BADGE_CLASSES } from './types';

interface ConnectionsTabProps {
  theme: DashboardTheme;
  connections: ConnectionStatus[];
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'connected':
    case 'healthy':
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case 'disconnected':
    case 'unhealthy':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'checking':
    case 'unknown':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    case 'degraded':
      return <AlertCircle className="w-5 h-5 text-orange-500" />;
    default:
      return <Activity className="w-5 h-5 text-gray-500" />;
  }
}

export function ConnectionsTab({ theme, connections }: ConnectionsTabProps) {
  const { isDark, bgCard, textPrimary, textSecondary, borderColor } = theme;

  return (
    <Card className={`${bgCard} border ${borderColor}`}>
      <div className={`p-6 border-b ${borderColor}`}>
        <h3 className={`text-lg ${textPrimary} mb-1`}>Service Connections</h3>
        <p className={`text-sm ${textSecondary}`}>
          Status of all backend service connections
        </p>
      </div>
      <div className="p-6 space-y-4">
        {connections.length === 0 ? (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              No connection data available. Click "Refresh All" to check connections.
            </AlertDescription>
          </Alert>
        ) : (
          connections.map((conn, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${borderColor} ${
                isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(conn.status)}
                  <div>
                    <h4 className={`${textPrimary} mb-1`}>{conn.name}</h4>
                    <p className={`text-sm ${textSecondary}`}>{conn.message}</p>
                  </div>
                </div>
                <Badge className={STATUS_BADGE_CLASSES[conn.status] || STATUS_BADGE_CLASSES.unknown}>
                  {conn.status}
                </Badge>
              </div>

              {conn.latency && (
                <div className={`flex items-center gap-2 text-sm ${textSecondary}`}>
                  <Clock className="w-4 h-4" />
                  <span>Latency: {conn.latency}ms</span>
                </div>
              )}

              {conn.details && (
                <div className={`mt-3 p-3 rounded ${isDark ? 'bg-[#161616]' : 'bg-white'}`}>
                  <pre className={`text-xs ${textSecondary} overflow-x-auto`}>
                    {JSON.stringify(conn.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
