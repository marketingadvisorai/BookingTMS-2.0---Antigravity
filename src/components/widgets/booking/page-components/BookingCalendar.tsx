/**
 * BookingCalendar - Calendar component for date selection
 * Syncs with Step 5 Schedule settings (operating days, blocked dates, custom hours)
 */
import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { useCalendarAvailability, DateAvailabilityStatus } from '../../../../hooks/useCalendarAvailability';
import { BookingCalendarProps } from './types';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Get styles based on availability status
function getDateStyles(
  status: DateAvailabilityStatus,
  isSelected: boolean,
  isToday: boolean,
  primaryColor: string
): { className: string; style: React.CSSProperties } {
  if (isSelected) {
    return {
      className: 'text-white shadow-lg transform scale-105 ring-2 ring-offset-2',
      style: { backgroundColor: primaryColor, borderColor: primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties
    };
  }
  
  if (isToday) {
    return {
      className: 'ring-2 ring-offset-1',
      style: { backgroundColor: `${primaryColor}20`, color: primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties
    };
  }

  switch (status) {
    case 'available':
      return {
        className: 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100 hover:border-green-400 hover:scale-105 cursor-pointer',
        style: {}
      };
    case 'blocked':
      return {
        className: 'bg-red-100 border-red-300 text-red-400 cursor-not-allowed opacity-70',
        style: {}
      };
    case 'unavailable':
      return {
        className: 'bg-red-50 border-red-200 text-red-300 cursor-not-allowed opacity-60',
        style: {}
      };
    case 'past':
      return {
        className: 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed opacity-50',
        style: {}
      };
    case 'outside-advance':
      return {
        className: 'bg-orange-50 border-orange-200 text-orange-300 cursor-not-allowed opacity-60',
        style: {}
      };
    default:
      return {
        className: 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed',
        style: {}
      };
  }
}

export function BookingCalendar({
  currentDate,
  selectedDate,
  onDateSelect,
  onMonthChange,
  primaryColor,
  schedule,
  blockedDates,
  customDates,
  advanceBookingDays
}: BookingCalendarProps) {
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Normalize blocked dates to the expected format
  const normalizedBlockedDates = blockedDates.map(bd => 
    typeof bd === 'string' ? { date: bd } : bd
  );

  // Use calendar availability hook for date status
  const { getDateAvailability, stats } = useCalendarAvailability(
    {
      operatingDays: schedule.operatingDays,
      blockedDates: normalizedBlockedDates,
      customAvailableDates: customDates,
      advanceBookingDays,
      customHours: schedule.customHours,
      customHoursEnabled: schedule.customHoursEnabled
    },
    currentMonth,
    currentYear
  );

  // Calculate calendar grid
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
    
    const days: Array<{ day: number | null; isCurrentMonth: boolean }> = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day, isCurrentMonth: true });
    }
    
    return days;
  }, [currentMonth, currentYear]);

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  return (
    <Card className="overflow-hidden bg-white shadow-lg border border-gray-100 rounded-2xl">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Calendar className="w-5 h-5" style={{ color: primaryColor }} />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 rounded-lg border-gray-200 hover:bg-gray-100"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0 rounded-lg border-gray-200 hover:bg-gray-100"
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4 sm:p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, index) => {
            if (item.day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const day = item.day as number; // Safe: we've checked for null above
            const availability = getDateAvailability(day);
            const dayIsToday = isToday(day);
            const isSelected = selectedDate === day;
            const { className, style } = getDateStyles(availability.status, isSelected, dayIsToday, primaryColor);

            return (
              <button
                key={day}
                onClick={() => availability.isClickable && onDateSelect(day)}
                disabled={!availability.isClickable}
                className={`
                  aspect-square rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center justify-center relative border
                  ${className}
                `}
                style={style}
                title={availability.reason || (availability.isClickable ? 'Available' : 'Not available')}
              >
                <span>{item.day}</span>
                {/* Custom hours indicator */}
                {availability.hasCustomHours && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span>Available ({stats.available})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span>Blocked ({stats.blocked})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Custom Hours</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default BookingCalendar;
