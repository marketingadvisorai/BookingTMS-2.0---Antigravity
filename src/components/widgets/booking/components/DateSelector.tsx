import React, { useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { useCalendarAvailability, DateAvailabilityStatus } from '../../../../hooks/useCalendarAvailability';

interface DateSelectorProps {
    selectedDate: number;
    currentMonth: number;
    currentYear: number;
    onDateSelect: (date: number) => void;
    onMonthChange: (month: number, year: number) => void;
    selectedActivityData: any;
    config: any;
    primaryColor: string;
    timeSlotsRef?: React.RefObject<HTMLDivElement>;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Color classes for different availability states
const getDateStyles = (
    status: DateAvailabilityStatus,
    isSelected: boolean,
    isToday: boolean,
    primaryColor: string
): { className: string; style: React.CSSProperties } => {
    if (isSelected) {
        return {
            className: 'text-white shadow-lg transform scale-105 ring-2 ring-offset-2',
            style: { backgroundColor: primaryColor, borderColor: primaryColor, '--tw-ring-color': primaryColor } as React.CSSProperties
        };
    }
    
    if (isToday) {
        return {
            className: 'text-white shadow-md ring-2 ring-offset-1',
            style: { backgroundColor: primaryColor, '--tw-ring-color': `${primaryColor}50` } as React.CSSProperties
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
};

export const DateSelector: React.FC<DateSelectorProps> = ({
    selectedDate,
    currentMonth,
    currentYear,
    onDateSelect,
    onMonthChange,
    selectedActivityData,
    config,
    primaryColor,
    timeSlotsRef
}) => {
    // Extract schedule configuration
    const blockedDates = selectedActivityData?.blockedDates || config?.blockedDates || [];
    const customAvailableDates = selectedActivityData?.customDates || config?.customAvailableDates || [];
    const schedule = selectedActivityData?.schedule || {};
    const operatingDays = schedule.operatingDays || selectedActivityData?.operatingDays || 
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const advanceBookingDays = schedule.advanceBooking || selectedActivityData?.advanceBooking || 30;
    const customHours = schedule.customHours || selectedActivityData?.customHours;
    const customHoursEnabled = schedule.customHoursEnabled || selectedActivityData?.customHoursEnabled;

    // Use the availability hook
    const { getDateAvailability, stats } = useCalendarAvailability(
        {
            operatingDays,
            blockedDates,
            customAvailableDates,
            advanceBookingDays,
            customHours,
            customHoursEnabled
        },
        currentMonth,
        currentYear
    );

    // Handle date selection with auto-scroll
    const handleDateSelect = useCallback((day: number) => {
        const availability = getDateAvailability(day);
        if (availability.isClickable) {
            onDateSelect(day);
            
            // Auto-scroll to time slots after date selection
            setTimeout(() => {
                if (timeSlotsRef?.current) {
                    timeSlotsRef.current.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                }
            }, 100);
        }
    }, [onDateSelect, getDateAvailability, timeSlotsRef]);

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            onMonthChange(11, currentYear - 1);
        } else {
            onMonthChange(currentMonth - 1, currentYear);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            onMonthChange(0, currentYear + 1);
        } else {
            onMonthChange(currentMonth + 1, currentYear);
        }
    };

    // Calculate first day offset (Sunday = 0)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    return (
        <Card className="p-6 sm:p-8 bg-white shadow-sm border border-gray-200 rounded-2xl">
            {/* Header with month navigation */}
            <div className="flex items-center justify-between mb-6 gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Select Date</h2>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-lg border-gray-300 hover:bg-gray-50"
                        onClick={handlePrevMonth}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm sm:text-base font-medium text-gray-900 px-2 whitespace-nowrap min-w-[140px] text-center">
                        {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-lg border-gray-300 hover:bg-gray-50"
                        onClick={handleNextMonth}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2 uppercase">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateObj = new Date(currentYear, currentMonth, day);
                    const isSelected = selectedDate === day;
                    const isToday = dateObj.toDateString() === new Date().toDateString();
                    const availability = getDateAvailability(day);
                    const { className, style } = getDateStyles(availability.status, isSelected, isToday, primaryColor);

                    return (
                        <button
                            key={day}
                            onClick={() => handleDateSelect(day)}
                            disabled={!availability.isClickable}
                            className={`
                                aspect-square rounded-xl text-sm sm:text-base font-medium
                                transition-all duration-200 flex items-center justify-center relative
                                border ${className}
                            `}
                            style={style}
                            title={availability.reason}
                            aria-label={`${day} - ${availability.reason}`}
                        >
                            {day}
                            {/* Availability indicator dot */}
                            {!isSelected && !isToday && (
                                <span className={`
                                    absolute bottom-1 w-1.5 h-1.5 rounded-full
                                    ${availability.status === 'available' ? 'bg-green-500' : 
                                      availability.status === 'blocked' ? 'bg-red-500' :
                                      availability.status === 'unavailable' ? 'bg-red-400' : 
                                      availability.status === 'outside-advance' ? 'bg-orange-400' : 'bg-gray-400'}
                                `} />
                            )}
                            {/* Custom hours indicator */}
                            {availability.hasCustomHours && availability.status === 'available' && (
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        <span>Available ({stats.available})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        <span>Blocked/Unavailable</span>
                    </div>
                    {stats.customDates > 0 && (
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-blue-500" />
                            <span>Custom Hours</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};
