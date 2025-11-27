/**
 * BookFlow Widget - Calendar Component
 * @module widgets/bookflow/components/BookFlowCalendar
 */

import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../ui/utils';
import type { BookFlowSchedule } from '../types';

interface BookFlowCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  schedule?: BookFlowSchedule;
  primaryColor?: string;
  minDate?: Date;
}

export const BookFlowCalendar: React.FC<BookFlowCalendarProps> = ({
  selectedDate,
  onSelectDate,
  schedule,
  primaryColor = '#3B82F6',
  minDate = new Date(),
}) => {
  const [viewDate, setViewDate] = React.useState(minDate);

  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [viewDate]);

  const isDateAvailable = (date: Date): boolean => {
    if (!schedule) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return false;

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    if (!schedule.operatingDays.includes(dayName)) return false;

    const dateStr = date.toISOString().split('T')[0];
    if (schedule.blockedDates?.includes(dateStr)) return false;

    return true;
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const prevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const monthName = viewDate.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold text-gray-900 dark:text-white">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="p-2" />;
          }

          const available = isDateAvailable(date);
          const selected = isSelected(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => available && onSelectDate(date)}
              disabled={!available}
              className={cn(
                'p-2 text-sm rounded-lg transition-all',
                available
                  ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                  : 'text-gray-300 dark:text-gray-600 cursor-not-allowed',
                selected && 'text-white font-semibold'
              )}
              style={selected ? { backgroundColor: primaryColor } : undefined}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BookFlowCalendar;
