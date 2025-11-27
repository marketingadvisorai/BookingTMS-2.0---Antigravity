/**
 * BookFlow Widget - Main Entry Point
 * @module widgets/bookflow/BookFlowWidget
 * 
 * Routes to appropriate widget based on target type:
 * - targetType: 'activity' → BookFlowSingle
 * - targetType: 'venue' → BookFlowVenue
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { BookFlowSingle } from './BookFlowSingle';
import { BookFlowVenue } from './BookFlowVenue';
import type { BookFlowWidgetProps } from './types';
import { DEFAULT_CONFIG, DEFAULT_STYLE } from './types';

export const BookFlowWidget: React.FC<BookFlowWidgetProps> = ({
  embedKey,
  targetType,
  targetId,
  config: configOverrides,
  style: styleOverrides,
  theme = 'light',
  onBookingComplete,
}) => {
  const config = { ...DEFAULT_CONFIG, ...configOverrides };
  const style = { ...DEFAULT_STYLE, ...styleOverrides };

  // Validate required props
  if (!targetId) {
    return (
      <div className="flex items-center justify-center min-h-[300px] p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Configuration Error
          </h3>
          <p className="text-gray-500">
            No target ID provided. Please check your embed configuration.
          </p>
        </div>
      </div>
    );
  }

  // Theme wrapper
  const themeClass = theme === 'dark' ? 'dark bg-gray-900' : 'bg-white';

  return (
    <div className={`bookflow-widget min-h-[400px] ${themeClass}`}>
      {/* CSS Variables for theming */}
      <style>{`
        .bookflow-widget {
          --bf-primary: ${style.primaryColor};
          --bf-radius: ${style.borderRadius};
          --bf-font: ${style.fontFamily};
        }
      `}</style>

      {/* Route to appropriate widget */}
      {targetType === 'activity' && (
        <BookFlowSingle
          activityId={targetId}
          config={config}
          style={style}
          onBookingComplete={onBookingComplete}
        />
      )}

      {targetType === 'venue' && (
        <BookFlowVenue
          venueId={targetId}
          config={config}
          style={style}
          onBookingComplete={onBookingComplete}
        />
      )}

      {targetType !== 'activity' && targetType !== 'venue' && (
        <div className="flex items-center justify-center min-h-[300px] p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Unknown Widget Type
            </h3>
            <p className="text-gray-500">
              Target type "{targetType}" is not supported.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookFlowWidget;
