/**
 * Quick Stats Component
 * Displays dashboard statistics cards
 * @module components/backend/dashboard/QuickStats
 */

'use client';

import { Card } from '@/components/ui/card';
import { Database, Activity, Globe, Zap } from 'lucide-react';
import { ConnectionStatus, HealthCheck, ApiTestResult, DashboardTheme } from './types';

interface QuickStatsProps {
  theme: DashboardTheme;
  connections: ConnectionStatus[];
  healthChecks: HealthCheck[];
  apiTests: ApiTestResult[];
}

export function QuickStats({ theme, connections, healthChecks, apiTests }: QuickStatsProps) {
  const { isDark, bgCard, textPrimary, textSecondary, borderColor } = theme;

  const supabaseConnection = connections.find((c) => c.name === 'Supabase');
  const isConnected = supabaseConnection?.status === 'connected';
  const healthyCount = healthChecks.filter((h) => h.status === 'healthy').length;
  const avgLatency = connections[0]?.latency;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Database Status */}
      <Card className={`${bgCard} border ${borderColor} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${textSecondary} mb-1`}>Database</p>
            <p className={`text-xl ${textPrimary}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
          <Database
            className={`w-8 h-8 ${isConnected ? 'text-green-500' : 'text-red-500'}`}
          />
        </div>
      </Card>

      {/* Health Checks */}
      <Card className={`${bgCard} border ${borderColor} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${textSecondary} mb-1`}>Health Checks</p>
            <p className={`text-xl ${textPrimary}`}>
              {healthyCount}/{healthChecks.length}
            </p>
          </div>
          <Activity className={`w-8 h-8 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
        </div>
      </Card>

      {/* API Endpoints */}
      <Card className={`${bgCard} border ${borderColor} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${textSecondary} mb-1`}>API Endpoints</p>
            <p className={`text-xl ${textPrimary}`}>{apiTests.length}</p>
          </div>
          <Globe className={`w-8 h-8 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
      </Card>

      {/* Avg Response */}
      <Card className={`${bgCard} border ${borderColor} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${textSecondary} mb-1`}>Avg Response</p>
            <p className={`text-xl ${textPrimary}`}>
              {avgLatency ? `${avgLatency}ms` : '--'}
            </p>
          </div>
          <Zap className={`w-8 h-8 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
        </div>
      </Card>
    </div>
  );
}
