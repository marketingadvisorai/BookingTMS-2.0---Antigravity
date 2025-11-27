/**
 * BookingTimeSlots - Time slot selection grid
 * Displays available time slots for the selected date
 */
import React from 'react';
import { Clock, Users, X } from 'lucide-react';
import { Card } from '../../../ui/card';
import { BookingTimeSlotsProps } from './types';

export function BookingTimeSlots({
  selectedDate,
  currentDate,
  timeSlots,
  selectedTime,
  onTimeSelect,
  primaryColor,
  loading = false,
  timezone
}: BookingTimeSlotsProps) {
  if (!selectedDate) return null;

  const formattedDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    selectedDate
  ).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Format time for display (12-hour format)
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Card className="overflow-hidden bg-white shadow-lg border border-gray-100 rounded-2xl">
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Clock className="w-5 h-5" style={{ color: primaryColor }} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Select Time
            </h2>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </div>
        <span className="text-xs text-gray-400">Timezone: {timezone}</span>
      </div>

      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-xl border-2 border-gray-100 animate-pulse bg-gray-50"
              />
            ))}
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Times</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              This date is not available for booking. It may be blocked by the admin or outside operating hours. Please select another date.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {timeSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              const displayTime = formatTime(slot.time);

              return (
                <button
                  key={slot.time}
                  onClick={() => slot.available && onTimeSelect(slot.time)}
                  disabled={!slot.available}
                  className={`
                    p-4 rounded-xl border-2 text-center transition-all duration-200
                    ${isSelected
                      ? 'shadow-lg transform scale-105'
                      : slot.available
                        ? 'border-green-200 bg-green-50 hover:border-green-300 hover:shadow-md hover:scale-102'
                        : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                    }
                  `}
                  style={{
                    backgroundColor: isSelected ? primaryColor : undefined,
                    borderColor: isSelected ? primaryColor : undefined,
                  }}
                >
                  <div className={`text-sm sm:text-base font-medium mb-1 ${
                    isSelected ? 'text-white' : slot.available ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {displayTime}
                  </div>
                  <div className={`text-xs flex items-center justify-center gap-1 ${
                    isSelected ? 'text-white/90' : slot.available ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {slot.available ? (
                      <>
                        <Users className="w-3 h-3" />
                        <span>{slot.spots || slot.capacity || 0} spots</span>
                      </>
                    ) : (
                      <span>Sold out</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

export default BookingTimeSlots;
