/**
 * WeekView Component
 * 
 * Displays bookings in a weekly grid with time slots on the Y-axis
 * and days of the week on the X-axis.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Grid3X3, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking, GameOption } from '../types';

interface WeekViewProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  gamesData: GameOption[];
}

export function WeekView({
  bookings,
  onViewDetails,
  selectedDate,
  setSelectedDate,
  gamesData,
}: WeekViewProps) {
  // Generate week days starting from Sunday
  const getWeekDays = (date: Date): Date[] => {
    const days: Date[] = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);
  const timeSlots = Array.from({ length: 14 }, (_, i) => `${String(10 + i).padStart(2, '0')}:00`);

  const getBookingsForTimeSlot = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter((b) => {
      if (b.date !== dateStr) return false;
      const bookingTime = b.time.substring(0, 5);
      return bookingTime === time;
    });
  };

  const prevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="w-5 h-5 text-indigo-600" />
            Week View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevWeek}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
              This Week
            </Button>
            <Button variant="outline" size="sm" onClick={nextWeek}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Week Days Header */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="text-xs text-gray-600 dark:text-gray-400 p-2">Time</div>
              {weekDays.map((day, idx) => {
                const isToday = day.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={idx}
                    className={`text-center p-2 rounded-t-lg ${isToday ? 'bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-900'}`}
                  >
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </p>
                    <p className={`text-sm ${isToday ? 'text-indigo-600' : 'text-gray-900 dark:text-white'}`}>
                      {day.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Time Slots Grid */}
            <div className="space-y-1">
              {timeSlots.map((time) => (
                <div key={time} className="grid grid-cols-8 gap-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400 p-2 flex items-center">
                    {time}
                  </div>
                  {weekDays.map((day, idx) => (
                    <TimeSlotCell
                      key={idx}
                      bookings={getBookingsForTimeSlot(day, time)}
                      gamesData={gamesData}
                      onViewDetails={onViewDetails}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="sm:hidden text-center text-xs text-gray-500 mt-2 py-1">
          ← Swipe to view all days →
        </div>
      </CardContent>
    </Card>
  );
}

// Sub-component: Time Slot Cell
function TimeSlotCell({
  bookings,
  gamesData,
  onViewDetails,
}: {
  bookings: Booking[];
  gamesData: GameOption[];
  onViewDetails: (booking: Booking) => void;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 p-1 min-h-[60px] bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      {bookings.map((booking) => {
        const gameColor = (gamesData as any).find((g: any) => g.name === booking.game)?.color || '#6b7280';
        return (
          <div
            key={booking.id}
            className="text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity mb-1"
            style={{ backgroundColor: gameColor + '20', borderLeft: `3px solid ${gameColor}` }}
            onClick={() => onViewDetails(booking)}
          >
            <p className="text-gray-900 dark:text-white truncate">{booking.game}</p>
            <p className="text-gray-600 dark:text-gray-400 text-[10px] truncate">{booking.customer}</p>
            <p className="text-gray-500 text-[10px]">{booking.groupSize} people</p>
          </div>
        );
      })}
    </div>
  );
}
