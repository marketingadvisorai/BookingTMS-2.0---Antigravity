"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";

interface EnhancedCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  primaryColor?: string;
  className?: string;
  bookings?: { date: string; count: number }[];
  minDate?: Date;
  maxDate?: Date;
}

export function EnhancedCalendar({
  selectedDate,
  onDateSelect,
  primaryColor = "#4f46e5",
  className,
  bookings = [],
  minDate,
  maxDate,
}: EnhancedCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selectedDate || new Date()
  );

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    );
  };

  const isPastDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return isPastDate(day);
  };

  const getBookingsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.find(b => b.date === dateStr)?.count || 0;
  };

  const handleDateClick = (day: number) => {
    if (isDisabled(day)) return;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect?.(date);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateSelect?.(today);
  };

  return (
    <div className={cn("w-full bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <CalendarIcon className="w-5 h-5" style={{ color: primaryColor }} />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            className="h-9 w-9 p-0 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="h-9 px-3 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            className="h-9 w-9 p-0 rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="p-3 sm:p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 mb-2">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center py-2 sm:py-3 text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const bookingCount = getBookingsForDay(day);
            const today = isToday(day);
            const selected = isSelected(day);
            const disabled = isDisabled(day);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={disabled}
                className={cn(
                  "relative aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all duration-200 group",
                  "text-sm sm:text-base font-medium",
                  disabled && "opacity-40 cursor-not-allowed",
                  !disabled && !selected && "hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105",
                  today && !selected && "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900",
                  selected && "text-white shadow-lg transform scale-105"
                )}
                style={{
                  backgroundColor: selected ? primaryColor : today && !selected ? `${primaryColor}10` : undefined,
                  color: selected ? 'white' : disabled ? undefined : today ? primaryColor : undefined,
                  // @ts-ignore - ringColor is a custom Tailwind utility
                  '--tw-ring-color': today && !selected ? primaryColor : undefined,
                } as React.CSSProperties}
              >
                <span className={cn(
                  "relative z-10",
                  selected && "font-bold"
                )}>
                  {day}
                </span>
                
                {/* Booking indicator dots */}
                {bookingCount > 0 && (
                  <div className="absolute bottom-1 sm:bottom-2 flex gap-0.5">
                    {Array.from({ length: Math.min(bookingCount, 3) }).map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full",
                          selected ? "bg-white/70" : "bg-current"
                        )}
                        style={{ 
                          backgroundColor: selected ? undefined : primaryColor,
                          opacity: selected ? 0.7 : 0.6
                        }}
                      />
                    ))}
                    {bookingCount > 3 && (
                      <span className={cn(
                        "text-[8px] sm:text-[10px] ml-0.5",
                        selected ? "text-white/70" : ""
                      )} style={{ color: selected ? undefined : primaryColor }}>
                        +{bookingCount - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Today indicator */}
                {today && !selected && (
                  <div 
                    className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Legend */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: primaryColor }}
            />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.6 }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primaryColor, opacity: 0.6 }} />
            </div>
            <span>Has Bookings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedCalendar;
