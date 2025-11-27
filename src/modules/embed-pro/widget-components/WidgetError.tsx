/**
 * Embed Pro 2.0 - Widget Error Component
 * @module embed-pro/widget-components/WidgetError
 * 
 * Error state display for widget failures.
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import type { WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetErrorProps {
  message: string;
  onRetry?: () => void;
  style?: Partial<WidgetStyle>;
}

// =====================================================
// COMPONENT
// =====================================================

export const WidgetError: React.FC<WidgetErrorProps> = ({
  message,
  onRetry,
  style,
}) => {
  const primaryColor = style?.primaryColor || '#2563eb';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        Something went wrong
      </h3>

      <p className="text-sm text-gray-600 mb-6 max-w-sm">
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                     text-white transition-colors"
          style={{ backgroundColor: primaryColor }}
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}

      <p className="text-xs text-gray-400 mt-4">
        If the problem persists, please contact support.
      </p>
    </div>
  );
};

export default WidgetError;
