/**
 * Calendar Widget Pro - Legend Component
 * @module embed-pro/widgets/calendar-widget/components/CalendarLegend
 * 
 * Displays availability legend with color indicators.
 */

import React from 'react';
import type { LegendProps } from '../types';

// =====================================================
// LEGEND ITEMS
// =====================================================

const LEGEND_ITEMS = [
  { label: 'Available', color: 'bg-green-500' },
  { label: 'Limited', color: 'bg-yellow-500' },
  { label: 'Unavailable', color: 'bg-gray-300' },
] as const;

// =====================================================
// COMPONENT
// =====================================================

export const CalendarLegend: React.FC<LegendProps> = ({ isDarkMode }) => {
  return (
    <div className="px-4 pb-4">
      <div className={`flex flex-wrap gap-4 text-xs ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-full ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarLegend;
