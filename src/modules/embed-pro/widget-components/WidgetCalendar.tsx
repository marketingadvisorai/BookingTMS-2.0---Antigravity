/**
 * Embed Pro 2.0 - Widget Calendar Component
 * @module embed-pro/widget-components/WidgetCalendar
 * 
 * Month calendar grid for date selection with availability indicators.
 * Mobile-optimized with 44px minimum touch targets (WCAG 2.1 AAA).
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
  isDarkMode?: boolean;
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
  isDarkMode = false,
}) => {
  // Detect dark mode from theme or style
  const dark = isDarkMode || style.theme === 'dark';
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

  // Format date for screen readers
  const formatDateForAria = (date: Date): string => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${dayNames[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div 
      className="p-3 sm:p-4 md:p-5"
      role="region"
      aria-label="Date selection calendar"
    >
      {/* Month Navigation - 44px touch targets */}
      <div className="flex items-center justify-between mb-3 sm:mb-4" role="group" aria-label="Month navigation">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className={`w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-xl 
            ${dark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}
            disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all duration-150 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2`}
          style={{ ['--tw-ring-color' as any]: style.primaryColor }}
          aria-label={`Go to previous month, ${MONTHS[currentMonth === 0 ? 11 : currentMonth - 1]}`}
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
        </button>
        
        <h2 
          className={`text-base sm:text-lg md:text-xl font-semibold ${dark ? 'text-gray-100' : 'text-gray-900'}`}
          style={{ color: style.textColor }}
          aria-live="polite"
          aria-atomic="true"
        >
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        
        <button
          onClick={nextMonth}
          className={`w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-xl 
            ${dark ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'}
            active:scale-95 transition-all duration-150 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2`}
          style={{ ['--tw-ring-color' as any]: style.primaryColor }}
          aria-label={`Go to next month, ${MONTHS[currentMonth === 11 ? 0 : currentMonth + 1]}`}
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" aria-hidden="true" />
        </button>
      </div>

      {/* Day Headers */}
      <div 
        className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2 mb-1 sm:mb-2" 
        role="row"
        aria-hidden="true"
      >
        {DAYS.map(day => (
          <div
            key={day}
            className={`text-center text-[10px] sm:text-xs md:text-sm font-medium py-1 sm:py-2
              ${dark ? 'text-gray-400' : 'text-gray-500'}`}
            role="columnheader"
          >
            {day.slice(0, 2)}
          </div>
        ))}
      </div>

      {/* Calendar Grid - Min 44px touch targets */}
      <div 
        className="grid grid-cols-7 gap-0.5 sm:gap-1 md:gap-2"
        role="grid"
        aria-label={`Calendar for ${MONTHS[currentMonth]} ${currentYear}`}
      >
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="min-h-[44px] sm:aspect-square" role="gridcell" />;
          }

          const available = isDateAvailable(date);
          const selected = isSelected(date);
          const isToday = date.toDateString() === today.toDateString();

          return (
            <button
              key={date.toISOString()}
              onClick={() => available && onDateSelect(date)}
              disabled={!available}
              role="gridcell"
              aria-selected={selected}
              aria-disabled={!available}
              aria-current={isToday ? 'date' : undefined}
              className={`
                min-h-[44px] sm:aspect-square flex items-center justify-center 
                rounded-lg sm:rounded-xl text-sm font-medium
                transition-all duration-150 touch-manipulation
                active:scale-95
                ${selected
                  ? 'text-white shadow-lg'
                  : available
                    ? dark
                      ? 'text-green-300 bg-green-900/40 hover:bg-green-800/60 active:bg-green-700/60 border border-green-700/50'
                      : 'text-gray-800 bg-green-50 hover:bg-green-100 active:bg-green-200'
                    : dark
                      ? 'text-gray-600 bg-gray-800/50 cursor-not-allowed'
                      : 'text-gray-300 bg-gray-50 cursor-not-allowed'
                }
                ${isToday && !selected ? 'ring-2 ring-offset-1' : ''}
              `}
              style={{
                backgroundColor: selected ? style.primaryColor : undefined,
                ['--tw-ring-color' as any]: isToday ? style.primaryColor : undefined,
              }}
              aria-label={`${formatDateForAria(date)}${isToday ? ', today' : ''}${selected ? ', selected' : ''}${!available ? ', unavailable' : ', available'}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Hint Text */}
      <p className={`text-center text-[10px] sm:text-xs mt-3 sm:mt-4
        ${dark ? 'text-gray-500' : 'text-gray-400'}`} aria-live="polite">
        Tap a green date to continue
      </p>
    </div>
  );
};

export default WidgetCalendar;
