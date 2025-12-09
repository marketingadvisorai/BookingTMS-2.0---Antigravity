/**
 * Fix Approval Row Component
 * @module components/backend/error-monitoring/FixApprovalRow
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { FixRequest } from './types';

interface FixApprovalRowProps {
  fix: FixRequest;
  isDark: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export function FixApprovalRow({ fix, isDark, onApprove, onReject }: FixApprovalRowProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Bot className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {fix.fix_type}
            </span>
            <Badge className="bg-blue-500/10 text-blue-500 text-xs">
              {fix.ai_confidence}% confident
            </Badge>
          </div>

          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
            {fix.proposed_fix?.description || 'No description'}
          </p>

          <div className="flex items-center gap-4 text-sm">
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
              Files: {fix.files_affected?.join(', ') || 'N/A'}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              <Eye className="w-4 h-4 mr-1" />
              {showDetails ? 'Hide' : 'View'} Details
            </Button>
          </div>

          {showDetails && fix.proposed_fix?.code_changes && (
            <div
              className={`mt-3 p-3 rounded ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} border ${
                isDark ? 'border-gray-800' : 'border-gray-200'
              }`}
            >
              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Proposed Changes:
              </p>
              <pre className={`text-xs overflow-x-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {JSON.stringify(fix.proposed_fix.code_changes, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-red-500 hover:bg-red-500/10"
            onClick={() => onReject('Manual rejection')}
          >
            <ThumbsDown className="w-4 h-4 mr-1" />
            Reject
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={onApprove}>
            <ThumbsUp className="w-4 h-4 mr-1" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}
