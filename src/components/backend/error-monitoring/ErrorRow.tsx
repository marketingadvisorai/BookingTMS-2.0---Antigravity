/**
 * Error Row Component
 * @module components/backend/error-monitoring/ErrorRow
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import { SystemError, getSeverityColor, getStatusColor } from './types';

interface ErrorRowProps {
  error: SystemError;
  isDark: boolean;
  onSelect: () => void;
}

export function ErrorRow({ error, isDark, onSelect }: ErrorRowProps) {
  return (
    <div
      className={`p-4 hover:${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'} cursor-pointer transition-colors`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className={`${getSeverityColor(error.severity)} border text-xs`}>
              {error.severity}
            </Badge>
            <Badge className={`${getStatusColor(error.status)} text-xs`}>
              {error.status}
            </Badge>
            {error.auto_fixable && (
              <Badge className="bg-purple-500/10 text-purple-500 text-xs">
                <Bot className="w-3 h-3 mr-1" />
                Auto-fixable
              </Badge>
            )}
          </div>
          <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
            {error.message}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {error.error_type} • {error.occurrence_count} occurrences
          </p>
        </div>
        <div className="text-right">
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Last seen</p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {new Date(error.last_seen_at).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
