/**
 * ScheduleView Component
 * 
 * Displays bookings organized by activity/room with time slots.
 * Shows all activities side by side for a given day.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Columns2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Booking, GameOption } from '../types';
import { getStatusColor } from '../utils';

interface ScheduleViewProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  gamesData: GameOption[];
}

export function ScheduleView({
  bookings,
  onViewDetails,
  selectedDate,
  setSelectedDate,
  gamesData,
}: ScheduleViewProps) {
  const timeSlots = Array.from({ length: 14 }, (_, i) => `${String(10 + i).padStart(2, '0')}:00`);

  const getBookingsForGameAndTime = (game: string, time: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return bookings.filter((b) => {
      if (b.date !== dateStr || b.game !== game) return false;
      const bookingTime = b.time.substring(0, 5);
      return bookingTime === time;
    });
  };

  const prevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Columns2 className="w-5 h-5 text-indigo-600" />
            <span>Schedule by Room</span>
            {isToday && <Badge className="bg-indigo-600">Today</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevDay}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={nextDay}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </p>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Room Headers */}
            <div 
              className="grid gap-1 mb-2" 
              style={{ gridTemplateColumns: `100px repeat(${gamesData.length}, 1fr)` }}
            >
              <div className="text-xs text-gray-600 dark:text-gray-400 p-2">Time</div>
              {gamesData.map((game: any) => (
                <div
                  key={game.id}
                  className="text-center p-2 rounded-t-lg"
                  style={{ backgroundColor: (game.color || '#6b7280') + '20' }}
                >
                  <div 
                    className="w-3 h-3 rounded mx-auto mb-1" 
                    style={{ backgroundColor: game.color || '#6b7280' }} 
                  />
                  <p className="text-xs text-gray-900 dark:text-white">{game.name}</p>
                </div>
              ))}
            </div>

            {/* Time Slots Grid */}
            <div className="space-y-1">
              {timeSlots.map((time) => (
                <div 
                  key={time} 
                  className="grid gap-1" 
                  style={{ gridTemplateColumns: `100px repeat(${gamesData.length}, 1fr)` }}
                >
                  <div className="text-xs text-gray-600 dark:text-gray-400 p-2 flex items-center">
                    {time}
                  </div>
                  {gamesData.map((game: any) => (
                    <GameTimeSlot
                      key={game.id}
                      bookings={getBookingsForGameAndTime(game.name, time)}
                      gameColor={game.color || '#6b7280'}
                      onViewDetails={onViewDetails}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="sm:hidden text-center text-xs text-gray-500 mt-2 py-1">
          ← Swipe to view all rooms →
        </div>
      </CardContent>
    </Card>
  );
}

// Sub-component: Game Time Slot
function GameTimeSlot({
  bookings,
  gameColor,
  onViewDetails,
}: {
  bookings: Booking[];
  gameColor: string;
  onViewDetails: (booking: Booking) => void;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 p-1 min-h-[60px] bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity mb-1"
          style={{ backgroundColor: gameColor + '20', borderLeft: `3px solid ${gameColor}` }}
          onClick={() => onViewDetails(booking)}
        >
          <p className="text-gray-900 dark:text-white truncate">{booking.customer}</p>
          <p className="text-gray-600 dark:text-gray-400 text-[10px]">{booking.groupSize} people</p>
          <Badge variant="secondary" className={`text-[10px] px-1 py-0 h-4 mt-1 ${getStatusColor(booking.status)}`}>
            {booking.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
