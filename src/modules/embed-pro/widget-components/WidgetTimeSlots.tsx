/**
 * Embed Pro 2.0 - Widget Time Slots Component
 * @module embed-pro/widget-components/WidgetTimeSlots
 * 
 * Displays available time slots for the selected date.
 * Supports real-time availability from database sessions.
 * Cross-browser compatible with graceful fallbacks.
 */

import React, { useMemo, useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import type { ActivitySchedule, WidgetStyle, TimeSlot } from '../types/widget.types';
import { availabilityService, AvailabilitySlot } from '../services';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetTimeSlotsProps {
  schedule: ActivitySchedule;
  selectedDate: Date | null;
  selectedTime: string | null;
  onTimeSelect: (time: string, sessionId?: string) => void;
  style: WidgetStyle;
  duration: number;
  activityId?: string;
  partySize?: number;
  useRealAvailability?: boolean; // Enable DB-backed availability
}

// =====================================================
// HELPERS (Cross-browser safe)
// =====================================================

/**
 * Generate time slots based on schedule (fallback mode)
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

  // Cross-browser date comparison
  const now = new Date();
  const dateStr = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const nowStr = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const isToday = dateStr === nowStr;
  const currentTimeMinutes = isToday ? now.getHours() * 60 + now.getMinutes() : 0;

  while (currentMinutes + duration <= endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

    // Skip past times for today (30 min buffer)
    const isAvailable = !isToday || currentMinutes > currentTimeMinutes + 30;

    slots.push({
      time: timeStr,
      available: isAvailable,
      spotsRemaining: isAvailable ? 10 : 0,
      price: 0,
    });

    currentMinutes += interval;
  }

  return slots;
};

/**
 * Format time for display (12-hour format) - Cross-browser safe
 */
const formatTime = (time: string): string => {
  const parts = time.split(':');
  const hours = parseInt(parts[0], 10);
  const mins = parts[1] || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${mins} ${ampm}`;
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
  activityId,
  partySize = 1,
  useRealAvailability = false,
}) => {
  // State for real-time availability
  const [realSlots, setRealSlots] = useState<AvailabilitySlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fallback to schedule-based slots
  const fallbackSlots = useMemo(
    () => generateTimeSlots(schedule, selectedDate, duration),
    [schedule, selectedDate, duration]
  );

  // Fetch real availability when enabled and date changes
  useEffect(() => {
    if (!useRealAvailability || !activityId || !selectedDate) {
      setRealSlots([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    availabilityService
      .getAvailableSlots(activityId, selectedDate, partySize)
      .then((slots) => {
        if (!cancelled) {
          setRealSlots(slots);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[WidgetTimeSlots] Availability error:', err);
          setError('Unable to load availability');
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [useRealAvailability, activityId, selectedDate, partySize]);

  // Merge real slots with fallback (real slots override when available)
  const timeSlots = useMemo(() => {
    if (useRealAvailability && realSlots.length > 0) {
      return realSlots.map((rs) => ({
        time: rs.time,
        available: rs.available,
        spotsRemaining: rs.spotsRemaining,
        price: rs.price,
        sessionId: rs.sessionId,
      }));
    }
    return fallbackSlots;
  }, [useRealAvailability, realSlots, fallbackSlots]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm">Loading available times...</p>
      </div>
    );
  }

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

  // Cross-browser safe date formatting
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const formattedDate = `${days[selectedDate.getDay()]}, ${months[selectedDate.getMonth()]} ${selectedDate.getDate()}`;

  return (
    <div className="p-3 sm:p-4">
      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-50 rounded-lg text-yellow-700 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error} - Showing estimated times</span>
        </div>
      )}

      {/* Date Display */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Select Time</h3>
        <span 
          className="text-[10px] sm:text-xs px-2 py-1 rounded-full"
          style={{ backgroundColor: `${style.primaryColor}15`, color: style.primaryColor }}
        >
          {formattedDate}
        </span>
      </div>

      {/* Time Grid - Min 44px touch targets, responsive columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[280px] sm:max-h-[240px] overflow-y-auto overscroll-contain pr-1 -mr-1">
        {availableSlots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const sessionId = (slot as any).sessionId;
          
          return (
            <button
              key={slot.time}
              onClick={() => onTimeSelect(slot.time, sessionId)}
              className={`
                min-h-[44px] py-3 px-2 rounded-xl text-sm font-semibold
                transition-all duration-150 relative touch-manipulation
                active:scale-95
                ${isSelected
                  ? 'text-white shadow-lg'
                  : 'bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-gray-700'
                }
              `}
              style={{
                backgroundColor: isSelected ? style.primaryColor : undefined,
              }}
            >
              {formatTime(slot.time)}
              {/* Show spots remaining if available */}
              {slot.spotsRemaining > 0 && slot.spotsRemaining <= 3 && !isSelected && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {slot.spotsRemaining} left
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection Hint */}
      <p className="text-center text-[10px] sm:text-xs text-gray-400 mt-3">
        {availableSlots.length} time{availableSlots.length !== 1 ? 's' : ''} available
      </p>
    </div>
  );
};

export default WidgetTimeSlots;
