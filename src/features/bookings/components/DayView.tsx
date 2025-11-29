/**
 * DayView Component
 * 
 * Displays bookings for a single day with detailed time slots.
 * Shows booking cards with full details per time slot.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Clock, ChevronLeft, ChevronRight, Users, DollarSign } from 'lucide-react';
import type { Booking, GameOption } from '../types';
import { getStatusColor } from '../utils';

interface DayViewProps {
  bookings: Booking[];
  onViewDetails: (booking: Booking) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  gamesData: GameOption[];
}

export function DayView({
  bookings,
  onViewDetails,
  selectedDate,
  setSelectedDate,
  gamesData,
}: DayViewProps) {
  const timeSlots = Array.from({ length: 14 }, (_, i) => `${String(10 + i).padStart(2, '0')}:00`);

  const getBookingsForTimeSlot = (time: string) => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return bookings.filter((b) => {
      if (b.date !== dateStr) return false;
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
            <Clock className="w-5 h-5 text-indigo-600" />
            <span>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </span>
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
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-2">
          {timeSlots.map((time) => (
            <TimeSlotRow
              key={time}
              time={time}
              bookings={getBookingsForTimeSlot(time)}
              gamesData={gamesData}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Sub-component: Time Slot Row
function TimeSlotRow({
  time,
  bookings,
  gamesData,
  onViewDetails,
}: {
  time: string;
  bookings: Booking[];
  gamesData: GameOption[];
  onViewDetails: (booking: Booking) => void;
}) {
  return (
    <div className="flex gap-3 border-b border-gray-100 dark:border-gray-800 pb-2">
      <div className="w-20 flex-shrink-0 text-sm text-gray-600 dark:text-gray-400 pt-2">
        {time}
      </div>
      <div className="flex-1 space-y-2">
        {bookings.length === 0 ? (
          <div className="h-16 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-400">
            No bookings
          </div>
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              gamesData={gamesData}
              onClick={() => onViewDetails(booking)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Sub-component: Booking Card
function BookingCard({
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
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: gameColor }}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-gray-900 dark:text-white mb-1">{booking.game}</h4>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {booking.customer}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {booking.groupSize} people
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                ${booking.amount}
              </span>
            </div>
          </div>
          <Badge variant="secondary" className={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
