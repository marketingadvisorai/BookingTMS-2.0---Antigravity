/**
 * Calendar Widget Pro
 * Calendar-only view showing availability at a glance
 * @module embed-pro/widgets/CalendarWidgetPro
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Clock, Users } from 'lucide-react';
import type { WidgetData, WidgetStyle } from '../types/widget.types';
import { WidgetCalendar, WidgetHeader } from '../widget-components';

interface CalendarWidgetProProps {
  data: WidgetData;
  calendarOptions?: {
    displayMode?: 'month' | 'week' | 'list';
    showAvailabilityIndicator?: boolean;
    showPricing?: boolean;
    highlightToday?: boolean;
    showLegend?: boolean;
  };
  onDateSelect?: (date: Date) => void;
  onBookClick?: (date: Date, time?: string) => void;
}

export const CalendarWidgetPro: React.FC<CalendarWidgetProProps> = ({
  data,
  calendarOptions = {},
  onDateSelect,
  onBookClick,
}) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  
  const {
    showAvailabilityIndicator = true,
    showPricing = true,
    showLegend = true,
  } = calendarOptions;

  const activity = data.activities?.[0] || data.activity;
  const style = data.style;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: style.backgroundColor,
        color: style.textColor,
        fontFamily: style.fontFamily,
        borderRadius: style.borderRadius,
      }}
    >
      {/* Header */}
      <WidgetHeader
        activity={activity}
        venue={data.venue}
        style={style}
        compact
      />

      {/* Activity Quick Info */}
      {activity && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-4 text-sm">
            {showPricing && activity.price > 0 && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" style={{ color: style.primaryColor }} />
                <span className="font-medium">${activity.price}</span>
                <span className="text-gray-500">/person</span>
              </div>
            )}
            {activity.duration && (
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{activity.duration} min</span>
              </div>
            )}
            {activity.minPlayers && (
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>{activity.minPlayers}-{activity.maxPlayers} players</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="p-4">
        <WidgetCalendar
          schedule={activity?.schedule}
          style={style}
          selectedDate={selectedDate}
          onDateSelect={(date) => {
            setSelectedDate(date);
            onDateSelect?.(date);
            onBookClick?.(date);
          }}
        />
      </div>

      {/* Legend */}
      {showLegend && showAvailabilityIndicator && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Limited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <span>Unavailable</span>
            </div>
          </div>
        </div>
      )}

      {/* Book Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onBookClick?.(new Date())}
          className="w-full py-3 px-4 font-semibold text-white rounded-lg transition-all hover:opacity-90"
          style={{ backgroundColor: style.primaryColor, borderRadius: style.borderRadius }}
        >
          <Calendar className="w-4 h-4 inline mr-2" />
          Select Date to Book
        </button>
      </div>
    </motion.div>
  );
};

export default CalendarWidgetPro;
