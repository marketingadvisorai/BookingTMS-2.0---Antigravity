/**
 * Calendar Widget Pro - Activity Info Component
 * @module embed-pro/widgets/calendar-widget/components/CalendarActivityInfo
 * 
 * Displays activity quick info: price, duration, player count.
 */

import React from 'react';
import { DollarSign, Clock, Users } from 'lucide-react';
import type { ActivityInfoProps } from '../types';

// =====================================================
// COMPONENT
// =====================================================

export const CalendarActivityInfo: React.FC<ActivityInfoProps> = ({
  activity,
  style,
  isDarkMode,
  showPricing = true,
}) => {
  return (
    <div className={`px-4 py-3 border-b ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <div className="flex flex-wrap gap-4 text-sm">
        {/* Price */}
        {showPricing && activity.price > 0 && (
          <div className="flex items-center gap-1.5">
            <DollarSign 
              className="w-4 h-4" 
              style={{ color: style.primaryColor }} 
            />
            <span className="font-medium">${activity.price}</span>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              /person
            </span>
          </div>
        )}

        {/* Duration */}
        {activity.duration && (
          <div className={`flex items-center gap-1.5 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{activity.duration} min</span>
          </div>
        )}

        {/* Player Count */}
        {activity.minPlayers && (
          <div className={`flex items-center gap-1.5 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <Users className="w-4 h-4" />
            <span>{activity.minPlayers}-{activity.maxPlayers} players</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarActivityInfo;
