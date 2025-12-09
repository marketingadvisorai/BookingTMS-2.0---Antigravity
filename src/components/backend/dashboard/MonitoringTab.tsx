/**
 * Monitoring Tab Component
 * Displays system monitoring information
 * @module components/backend/dashboard/MonitoringTab
 */

'use client';

import { Card } from '@/components/ui/card';
import { Cpu, HardDrive, MemoryStick, Activity } from 'lucide-react';
import { DashboardTheme } from './types';

interface MonitoringTabProps {
  theme: DashboardTheme;
}

export function MonitoringTab({ theme }: MonitoringTabProps) {
  const { isDark, bgCard, textPrimary, textSecondary, borderColor } = theme;

  // Placeholder metrics - connect to real monitoring service
  const metrics = [
    { name: 'CPU Usage', value: '--', icon: Cpu, color: 'text-blue-500' },
    { name: 'Memory', value: '--', icon: MemoryStick, color: 'text-green-500' },
    { name: 'Storage', value: '--', icon: HardDrive, color: 'text-purple-500' },
    { name: 'Requests/min', value: '--', icon: Activity, color: 'text-yellow-500' },
  ];

  return (
    <Card className={`${bgCard} border ${borderColor}`}>
      <div className={`p-6 border-b ${borderColor}`}>
        <h3 className={`text-lg ${textPrimary} mb-1`}>System Monitoring</h3>
        <p className={`text-sm ${textSecondary}`}>
          Real-time system metrics and performance data
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className={`p-4 rounded-lg border ${borderColor} ${
                isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                <span className={`text-sm ${textSecondary}`}>{metric.name}</span>
              </div>
              <p className={`text-2xl ${textPrimary}`}>{metric.value}</p>
            </div>
          ))}
        </div>

        <div className={`mt-6 p-4 rounded-lg border ${borderColor} ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
          <p className={`text-sm ${textSecondary} text-center`}>
            Note: Real-time monitoring data will be available when connected to the monitoring backend.
          </p>
        </div>
      </div>
    </Card>
  );
}
