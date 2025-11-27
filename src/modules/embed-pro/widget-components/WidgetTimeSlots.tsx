/**
 * Embed Pro 2.0 - Widget Time Slots Component
 * @module embed-pro/widget-components/WidgetTimeSlots
 * 
 * Displays available time slots for the selected date.
 */

import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import type { ActivitySchedule, WidgetStyle, TimeSlot } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetTimeSlotsProps {
  schedule: ActivitySchedule;
  selectedDate: Date | null;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  style: WidgetStyle;
  duration: number;
}

// =====================================================
// HELPERS
// =====================================================

/**
 * Generate time slots based on schedule
 */
const generateTimeSlots = (
  schedule: ActivitySchedule,
  date: Date | null,
  duration: number
): TimeSlot[] => {
  if (!date) return [];

  const slots: TimeSlot[] = [];
  const [startHour, startMin] = schedule.startTime.split(':').map(Number);
  const [endHour, endMin] = schedule.endTime.split(':').map(Number);
  const interval = schedule.slotInterval || duration || 60;

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Check if date is today and skip past times
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const currentTimeMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

  while (currentMinutes + duration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

    // Skip past times for today
    const isAvailable = !isToday || currentMinutes > currentTimeMinutes + 30;

    slots.push({
      time: timeStr,
      available: isAvailable,
      spotsRemaining: isAvailable ? 8 : 0, // Placeholder - would come from sessions
      price: 0, // Price is per activity, not per slot
    });

    currentMinutes += interval;
  }

  return slots;
};

/**
 * Format time for display (12-hour format)
 */
const formatTime = (time: string): string => {
  const [hours, mins] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`;
};

// =====================================================
// COMPONENT
// =====================================================

export const WidgetTimeSlots: React.FC<WidgetTimeSlotsProps> = ({
  schedule,
  selectedDate,
  selectedTime,
  onTimeSelect,
  style,
  duration,
}) => {
  const timeSlots = useMemo(
    () => generateTimeSlots(schedule, selectedDate, duration),
    [schedule, selectedDate, duration]
  );

  if (!selectedDate) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>Select a date to see available times</p>
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No time slots available for this date</p>
      </div>
    );
  }

  const availableSlots = timeSlots.filter(s => s.available);

  // Format selected date for display
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="p-4">
      {/* Date Display */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Select Time</h3>
        <span 
          className="text-xs px-2 py-1 rounded-full"
          style={{ backgroundColor: `${style.primaryColor}15`, color: style.primaryColor }}
        >
          {formattedDate}
        </span>
      </div>

      {/* Time Grid */}
      <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto pr-1">
        {timeSlots.filter(s => s.available).map((slot) => {
          const isSelected = selectedTime === slot.time;
          
          return (
            <button
              key={slot.time}
              onClick={() => onTimeSelect(slot.time)}
              className={`
                py-3 px-2 rounded-xl text-sm font-semibold
                transition-all duration-200 transform
                ${isSelected
                  ? 'text-white shadow-lg scale-105'
                  : 'bg-blue-50 hover:bg-blue-100 text-gray-700 hover:scale-102'
                }
              `}
              style={{
                backgroundColor: isSelected ? style.primaryColor : undefined,
              }}
            >
              {formatTime(slot.time)}
            </button>
          );
        })}
      </div>

      {/* Selection Hint */}
      <p className="text-center text-xs text-gray-400 mt-3">
        {availableSlots.length} time{availableSlots.length !== 1 ? 's' : ''} available
      </p>
    </div>
  );
};

export default WidgetTimeSlots;
