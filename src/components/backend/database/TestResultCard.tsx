/**
 * Test Result Card Component
 * @module components/backend/database/TestResultCard
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, Database, Key, Server, HardDrive, Zap } from 'lucide-react';
import { TestResult, DatabaseTheme } from './types';

interface TestResultCardProps {
  result: TestResult;
  theme: DatabaseTheme;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Environment: Key,
  Client: Server,
  Database: Database,
  Auth: Zap,
  Server: HardDrive,
};

export function TestResultCard({ result, theme }: TestResultCardProps) {
  const { isDark, cardBgClass, borderClass, textClass, textMutedClass } = theme;

  const Icon = iconMap[result.name] || Database;

  const getStatusIcon = () => {
    switch (result.status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (result.status) {
      case 'success':
        return <Badge className="bg-green-500/10 text-green-500">Passed</Badge>;
      case 'error':
        return <Badge className="bg-red-500/10 text-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-500">Running</Badge>;
    }
  };

  return (
    <div className={`${cardBgClass} border ${borderClass} rounded-lg p-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100'}`}>
            <Icon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`font-medium ${textClass}`}>{result.name}</h4>
              {getStatusBadge()}
            </div>
            <p className={`text-sm ${textMutedClass} mt-1`}>{result.message}</p>
          </div>
        </div>
        {getStatusIcon()}
      </div>

      {result.details && result.status !== 'pending' && (
        <div className={`mt-3 p-3 rounded ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
          <pre className={`text-xs overflow-x-auto ${textMutedClass}`}>
            {JSON.stringify(result.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
