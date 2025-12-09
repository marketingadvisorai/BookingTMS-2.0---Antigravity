/**
 * API Tests Tab Component
 * Displays API endpoint test results
 * @module components/backend/dashboard/ApiTestsTab
 */

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Clock, Code } from 'lucide-react';
import { ApiTestResult, DashboardTheme, STATUS_BADGE_CLASSES } from './types';

interface ApiTestsTabProps {
  theme: DashboardTheme;
  apiTests: ApiTestResult[];
}

export function ApiTestsTab({ theme, apiTests }: ApiTestsTabProps) {
  const { isDark, bgCard, textPrimary, textSecondary, borderColor } = theme;

  return (
    <Card className={`${bgCard} border ${borderColor}`}>
      <div className={`p-6 border-b ${borderColor}`}>
        <h3 className={`text-lg ${textPrimary} mb-1`}>API Endpoint Tests</h3>
        <p className={`text-sm ${textSecondary}`}>
          Test results for all API endpoints
        </p>
      </div>
      <div className="p-6 space-y-4">
        {apiTests.length === 0 ? (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              No API test data available. Click "Refresh All" to run tests.
            </AlertDescription>
          </Alert>
        ) : (
          apiTests.map((test, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${borderColor} ${
                isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Code className="w-5 h-5 text-blue-500" />
                  <div>
                    <h4 className={textPrimary}>{test.name}</h4>
                    <span className={`text-xs ${textSecondary}`}>
                      {test.method} {test.url}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={STATUS_BADGE_CLASSES[test.status] || STATUS_BADGE_CLASSES.unknown}>
                    {test.statusCode}
                  </Badge>
                  <Badge className={STATUS_BADGE_CLASSES[test.status] || STATUS_BADGE_CLASSES.unknown}>
                    {test.status}
                  </Badge>
                </div>
              </div>
              <p className={`text-sm ${textSecondary} mb-2`}>{test.message}</p>
              <div className={`flex items-center gap-1 text-xs ${textSecondary}`}>
                <Clock className="w-3 h-3" />
                {test.latency}ms
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
