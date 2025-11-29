/**
 * RescheduleDialog Component
 * 
 * Dialog for rescheduling a booking to a new date/time.
 * Shows available time slots based on existing bookings.
 * @module features/bookings/components/RescheduleDialog
 */
import { useState, useEffect, useMemo } from 'react';
import { RefreshCcw, CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Calendar } from '../../../components/ui/calendar';
import type { Booking } from '../types';

export interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Booking | null;
  bookings: Booking[];
  onConfirm: (dateStr: string, timeStr: string) => void;
}

/** Standard business hours time slots (10:00 - 23:00) */
const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => `${String(10 + i).padStart(2, '0')}:00`);

/** Format date as ISO string (YYYY-MM-DD) */
const formatDateISO = (d: Date) => d.toISOString().split('T')[0];

/** Format date for display */
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Displays a dialog for rescheduling a booking.
 * Shows calendar and available time slots based on existing bookings.
 */
export function RescheduleDialog({ open, onOpenChange, booking, bookings = [], onConfirm }: RescheduleDialogProps) {
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newTime, setNewTime] = useState<string>('');

  // Reset form when booking changes
  useEffect(() => {
    if (booking) {
      setNewDate(new Date(booking.date));
      setNewTime(booking.time);
    }
  }, [booking]);

  // Compute availability for the selected date
  const slotsForSelectedDate = useMemo(() => {
    if (!newDate || !booking) return [];
    const dateStr = formatDateISO(newDate);
    return TIME_SLOTS.map((time) => {
      const isBusy = bookings.some(
        (b) => b.date === dateStr && b.time === time && b.status !== 'cancelled' && b.id !== booking.id
      );
      return { time, available: !isBusy };
    });
  }, [newDate, bookings, booking]);

  if (!booking) return null;

  const handleConfirm = () => {
    if (newDate && newTime) {
      onConfirm(formatDateISO(newDate), newTime);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-lg:w-full max-lg:h-full max-lg:max-h-full max-lg:rounded-none overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-blue-600 dark:text-[#4f46e5]" />
            Reschedule Booking
          </DialogTitle>
          <DialogDescription>
            Update the date and time for booking {booking.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm">New Date</Label>
            <div className="mt-2 border rounded-md p-2">
              <Calendar
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                className="rounded-md [&_.rdp-day_selected]:bg-blue-600 [&_.rdp-day_selected]:text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">New Time</Label>
            <div className="mt-2">
              {newDate ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {slotsForSelectedDate.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setNewTime(slot.time)}
                      disabled={!slot.available}
                      className={`px-3 py-2 rounded-lg border-2 text-center transition-all
                        ${newTime === slot.time
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : slot.available
                            ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            : 'border-gray-100 cursor-not-allowed opacity-50'
                        }`}
                    >
                      <div className="text-sm">{slot.time}</div>
                      <div className={`text-xs mt-0.5 ${slot.available ? 'text-green-600' : 'text-red-500'}`}>
                        {slot.available ? 'Available' : 'Unavailable'}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-2">Select a date to view available time slots</p>
              )}
              <Input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="mt-3 h-11"
              />
              <p className="text-xs text-gray-500 mt-1">Pick a slot or enter a custom time.</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-[#4f46e5]/10 border border-blue-200 dark:border-[#4f46e5]/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <CalendarDays className="w-4 h-4 text-blue-600 dark:text-[#6366f1]" />
              <span className="text-blue-900 dark:text-[#a5b4fc]">
                Current: {formatDate(booking.date)} {booking.time}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto h-11">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-blue-600 dark:bg-[#4f46e5] hover:bg-blue-700 dark:hover:bg-[#4338ca] w-full sm:w-auto h-11"
            disabled={!newDate || !newTime}
          >
            Confirm Reschedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
