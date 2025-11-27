/**
 * Embed Pro 2.0 - Widget Loading Component
 * @module embed-pro/widget-components/WidgetLoading
 * 
 * Minimal, fast-loading skeleton for widget initialization.
 */

import React from 'react';

// =====================================================
// COMPONENT
// =====================================================

export const WidgetLoading: React.FC = () => {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Compact Header Skeleton */}
      <div className="flex items-center gap-3 p-3 border-b border-gray-100 animate-pulse">
        <div className="w-16 h-16 rounded-xl bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-24 bg-gray-100 rounded mb-2" />
          <div className="h-3 w-20 bg-gray-100 rounded" />
        </div>
        <div className="w-16 h-8 bg-gray-200 rounded-lg" />
      </div>

      {/* Step Indicator Skeleton */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 animate-pulse">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="w-8 h-2 mt-1 bg-gray-100 rounded" />
              </div>
              {i < 4 && <div className="flex-1 h-0.5 mx-1 bg-gray-200" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 animate-pulse" style={{ minHeight: 280 }}>
        <div className="flex items-center justify-center py-16">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetLoading;
