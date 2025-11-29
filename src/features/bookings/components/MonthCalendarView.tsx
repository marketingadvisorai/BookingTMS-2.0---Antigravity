/**
 * MonthCalendarView Component
 * 
 * Displays bookings in a monthly calendar grid format.
 * Shows booking cards per day with quick attendee overview.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import type { Booking, GameOption } from '../types';

interface MonthCalendarViewProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  onShowAttendees: (date: Date) => void;
  calendarMonth: Date;
  setCalendarMonth: (date: Date) => void;
  gamesData: GameOption[];
}

export function MonthCalendarView({
  bookings,
  onViewDetails,
  onShowAttendees,
  calendarMonth,
  setCalendarMonth,
  gamesData,
}: MonthCalendarViewProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(calendarMonth);

  const getBookingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter((b) => b.date === dateStr);
  };

  const prevMonth = () => setCalendarMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarMonth(new Date(year, month + 1, 1));
  const goToToday = () => setCalendarMonth(new Date());

  // Build calendar grid
  const days: React.ReactElement[] = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[120px]" />);
  }

  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dayBookings = getBookingsForDay(day);
    const isToday = new Date().getDate() === day && 
                    new Date().getMonth() === month && 
                    new Date().getFullYear() === year;

    days.push(
      <DayCell
        key={day}
        day={day}
        isToday={isToday}
        bookings={dayBookings}
        gamesData={gamesData}
        onViewDetails={onViewDetails}
        onShowAttendees={() => onShowAttendees(new Date(year, month, day))}
      />
    );
  }

  return (
    <Card className="border-gray-200 dark:border-[#2a2a2a] shadow-sm">
      <CardHeader className="p-3 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            <span className="truncate">
              {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={prevMonth} className="h-8 w-8 p-0">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday} className="h-8 px-3 text-xs">
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 w-8 p-0">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="grid grid-cols-7 gap-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
            <div key={dayName} className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 p-1 sm:p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              <span className="hidden sm:inline">{dayName}</span>
              <span className="sm:hidden">{dayName.charAt(0)}</span>
            </div>
          ))}
          {days}
        </div>
        <GameLegend gamesData={gamesData} />
      </CardContent>
    </Card>
  );
}

// Sub-component: Day Cell
function DayCell({
  day,
  isToday,
  bookings,
  gamesData,
  onViewDetails,
  onShowAttendees,
}: {
  day: number;
  isToday: boolean;
  bookings: Booking[];
  gamesData: GameOption[];
  onViewDetails: (booking: Booking) => void;
  onShowAttendees: () => void;
}) {
  const totalGuests = bookings.reduce((sum, b) => sum + b.groupSize, 0);

  return (
    <div className={`min-h-[80px] sm:min-h-[120px] border border-gray-200 dark:border-gray-800 p-1 sm:p-2 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${isToday ? 'ring-2 ring-indigo-500' : ''}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs sm:text-sm ${isToday ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-900 dark:text-white'}`}>
          {day}
        </span>
        {bookings.length > 0 && (
          <Button variant="ghost" size="sm" className="h-6 text-xs px-1" onClick={onShowAttendees}>
            <Users className="w-3 h-3 mr-1" />
            {totalGuests}
          </Button>
        )}
      </div>
      <div className="space-y-1">
        {bookings.slice(0, 2).map((booking) => (
          <BookingChip key={booking.id} booking={booking} gamesData={gamesData} onClick={() => onViewDetails(booking)} />
        ))}
        {bookings.length > 2 && (
          <button className="text-xs text-indigo-600 hover:text-indigo-800 w-full text-left pl-1" onClick={onShowAttendees}>
            +{bookings.length - 2} more
          </button>
        )}
      </div>
    </div>
  );
}

// Sub-component: Booking Chip
function BookingChip({
  booking,
  gamesData,
  onClick,
}: {
  booking: Booking;
  gamesData: GameOption[];
  onClick: () => void;
}) {
  const gameColor = (gamesData as any).find((g: any) => g.name === booking.game)?.color || '#6b7280';

  return (
    <div
      className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
      style={{ backgroundColor: gameColor + '20', borderLeft: `3px solid ${gameColor}` }}
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3" style={{ color: gameColor }} />
        <span className="text-xs truncate" style={{ color: gameColor }}>{booking.time}</span>
      </div>
      <p className="text-gray-900 dark:text-white truncate mt-0.5 text-xs hidden sm:block">{booking.game}</p>
    </div>
  );
}

// Sub-component: Game Legend
function GameLegend({ gamesData }: { gamesData: GameOption[] }) {
  if (!gamesData.length) return null;

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Activities:</p>
      <div className="flex flex-wrap gap-2">
        {gamesData.map((game: any) => (
          <div key={game.id} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: game.color || '#6b7280' }} />
            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">{game.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
