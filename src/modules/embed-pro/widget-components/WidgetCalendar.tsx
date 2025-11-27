/**
 * Embed Pro 2.0 - Widget Calendar Component
 * @module embed-pro/widget-components/WidgetCalendar
 * 
 * Month calendar grid for date selection with availability indicators.
 */

import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ActivitySchedule, WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetCalendarProps {
  schedule: ActivitySchedule;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  style: WidgetStyle;
  timezone?: string;
}

// =====================================================
// HELPERS
// =====================================================

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'];

const DAY_MAP: Record<string, number> = {
  'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
  'Thursday': 4, 'Friday': 5, 'Saturday': 6,
};

// =====================================================
// COMPONENT
// =====================================================

export const WidgetCalendar: React.FC<WidgetCalendarProps> = ({
  schedule,
  selectedDate,
  onDateSelect,
  style,
}) => {
  const today = useMemo(() => new Date(), []);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Get operating days as numbers (0-6)
  const operatingDayNumbers = useMemo(() => {
    return schedule.operatingDays.map(day => DAY_MAP[day]).filter(n => n !== undefined);
  }, [schedule.operatingDays]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPadding = firstDay.getDay();
    const days: (Date | null)[] = [];

    // Add padding for days before month starts
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(currentYear, currentMonth, d));
    }

    return days;
  }, [currentMonth, currentYear]);

  // Check if a date is available for booking
  const isDateAvailable = (date: Date): boolean => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // Past dates
    if (date < now) return false;

    // Check advance booking limit
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + (schedule.advanceBookingDays || 30));
    if (date > maxDate) return false;

    // Check if day of week is operating
    if (!operatingDayNumbers.includes(date.getDay())) return false;

    // Check blocked dates
    const dateStr = date.toISOString().split('T')[0];
    if (schedule.blockedDates?.includes(dateStr)) return false;

    return true;
  };

  // Check if date is selected
  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  // Navigate months
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Can navigate to previous month?
  const canGoPrev = currentYear > today.getFullYear() || 
    (currentYear === today.getFullYear() && currentMonth > today.getMonth());

  return (
    <div className="p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-lg font-semibold" style={{ color: style.textColor }}>
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const available = isDateAvailable(date);
          const selected = isSelected(date);
          const isToday = date.toDateString() === today.toDateString();

          return (
            <button
              key={date.toISOString()}
              onClick={() => available && onDateSelect(date)}
              disabled={!available}
              className={`
                aspect-square flex items-center justify-center rounded-xl text-sm font-medium
                transition-all duration-200 transform
                ${selected
                  ? 'text-white shadow-lg scale-110'
                  : available
                    ? 'hover:scale-105 text-gray-800 bg-green-50 hover:bg-green-100'
                    : 'text-gray-300 bg-gray-50 cursor-not-allowed'
                }
                ${isToday && !selected ? 'ring-2 ring-offset-1' : ''}
              `}
              style={{
                backgroundColor: selected ? style.primaryColor : undefined,
                ['--tw-ring-color' as any]: isToday ? style.primaryColor : undefined,
              }}
              aria-label={`${date.toDateString()}${available ? '' : ' (unavailable)'}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Hint Text */}
      <p className="text-center text-xs text-gray-400 mt-4">
        Tap a green date to continue
      </p>
    </div>
  );
};

export default WidgetCalendar;
