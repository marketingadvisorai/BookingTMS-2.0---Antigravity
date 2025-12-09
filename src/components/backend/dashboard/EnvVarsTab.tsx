/**
 * Environment Variables Tab Component
 * Displays environment variable status
 * @module components/backend/dashboard/EnvVarsTab
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle, Key } from 'lucide-react';
import { DashboardTheme } from './types';

interface EnvVarsTabProps {
  theme: DashboardTheme;
  envVars: Record<string, boolean>;
}

export function EnvVarsTab({ theme, envVars }: EnvVarsTabProps) {
  const { isDark, bgCard, textPrimary, textSecondary, borderColor } = theme;

  const envEntries = Object.entries(envVars);
  const configuredCount = envEntries.filter(([, v]) => v).length;

  return (
    <Card className={`${bgCard} border ${borderColor}`}>
      <div className={`p-6 border-b ${borderColor}`}>
        <h3 className={`text-lg ${textPrimary} mb-1`}>Environment Variables</h3>
        <p className={`text-sm ${textSecondary}`}>
          Required environment variables status ({configuredCount}/{envEntries.length} configured)
        </p>
      </div>
      <div className="p-6 space-y-4">
        {envEntries.length === 0 ? (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              No environment variable data available. Click "Refresh All" to check.
            </AlertDescription>
          </Alert>
        ) : (
          envEntries.map(([key, isConfigured]) => (
            <div
              key={key}
              className={`p-4 rounded-lg border ${borderColor} ${
                isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className={`w-5 h-5 ${isConfigured ? 'text-green-500' : 'text-red-500'}`} />
                  <code className={`text-sm ${textPrimary}`}>{key}</code>
                </div>
                {isConfigured ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                    <XCircle className="w-3 h-3 mr-1" />
                    Missing
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
