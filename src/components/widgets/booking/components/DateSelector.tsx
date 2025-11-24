import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { isDateBlocked, isDayOperating, isCustomAvailableDate } from '../../../../utils/availabilityEngine';

interface DateSelectorProps {
    selectedDate: number;
    currentMonth: number;
    currentYear: number;
    onDateSelect: (date: number) => void;
    onMonthChange: (month: number, year: number) => void;
    selectedActivityData: any;
    config: any;
    primaryColor: string;
}

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DateSelector: React.FC<DateSelectorProps> = ({
    selectedDate,
    currentMonth,
    currentYear,
    onDateSelect,
    onMonthChange,
    selectedActivityData,
    config,
    primaryColor
}) => {
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

    return (
        <Card className="p-6 sm:p-8 bg-white shadow-sm border border-gray-200 rounded-2xl">
            <div className="flex items-center justify-between mb-6 gap-2">
                <h2 className="text-lg sm:text-xl text-gray-900">Select Date</h2>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-lg border-gray-300 hover:bg-gray-50"
                        onClick={handlePrevMonth}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm sm:text-base text-gray-900 px-2 whitespace-nowrap min-w-[140px] text-center">
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
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {daysOfWeek.map((day) => (
                    <div key={day} className="text-center text-sm text-gray-600 py-2">
                        {day}
                    </div>
                ))}
                {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }).map((_, i) => {
                    const day = i + 1;
                    const dateObj = new Date(currentYear, currentMonth, day);
                    const isSelected = selectedDate === day;
                    const today = new Date();
                    const isToday = dateObj.toDateString() === today.toDateString();
                    const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());

                    const blockedDates = selectedActivityData?.blockedDates || config?.blockedDates || [];
                    const customAvailableDates = selectedActivityData?.customDates || config?.customAvailableDates || [];
                    const operatingDays = selectedActivityData?.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

                    const advanceBookingDays = selectedActivityData?.advanceBooking || 30;
                    const maxBookingDate = new Date(today);
                    maxBookingDate.setDate(maxBookingDate.getDate() + advanceBookingDays);
                    const isBeyondAdvanceBooking = dateObj > maxBookingDate;

                    const isBlockedDate = isDateBlocked(dateObj, blockedDates);
                    const isOperatingDay = isDayOperating(dateObj, operatingDays, customAvailableDates);
                    // const customDate = isCustomAvailableDate(dateObj, customAvailableDates); // Unused variable
                    const isAvailable = !isPast && !isBlockedDate && isOperatingDay && !isBeyondAdvanceBooking;

                    return (
                        <button
                            key={i}
                            onClick={() => isAvailable && onDateSelect(day)}
                            disabled={!isAvailable}
                            className={`
                aspect-square rounded-xl text-base transition-all flex items-center justify-center relative
                ${isToday && !isSelected
                                    ? 'text-white shadow-md'
                                    : isSelected
                                        ? 'text-gray-900 border-2 shadow-sm bg-white hover:bg-gray-50'
                                        : isAvailable
                                            ? 'text-gray-700 hover:bg-gray-50 border border-green-300 bg-green-50'
                                            : 'text-gray-400 cursor-not-allowed border border-red-200 bg-red-50 opacity-60'
                                }
              `}
                            style={{
                                backgroundColor: isToday && !isSelected ? primaryColor : (isSelected ? undefined : (isAvailable ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)')),
                                borderColor: isSelected ? primaryColor : (isAvailable ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'),
                            }}
                            title={!isAvailable ? (isBlockedDate ? 'Date blocked by admin' : !isOperatingDay ? 'Not operating on this day' : isBeyondAdvanceBooking ? `Cannot book more than ${advanceBookingDays} days in advance` : 'Past date') : 'Available'}
                        >
                            {day}
                            {isAvailable && !isSelected && !isToday && (
                                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-green-500"></span>
                            )}
                            {!isAvailable && !isPast && (
                                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500"></span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span>Blocked/Unavailable</span>
                </div>
            </div>
        </Card>
    );
};
