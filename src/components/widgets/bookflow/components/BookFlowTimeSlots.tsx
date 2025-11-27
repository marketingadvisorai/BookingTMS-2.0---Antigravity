/**
 * BookFlow Widget - Time Slots Component
 * @module widgets/bookflow/components/BookFlowTimeSlots
 */

import React from 'react';
import { Clock, Loader2 } from 'lucide-react';
import { cn } from '../../../ui/utils';
import type { TimeSlot } from '../types';

interface BookFlowTimeSlotsProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  loading?: boolean;
  primaryColor?: string;
}

export const BookFlowTimeSlots: React.FC<BookFlowTimeSlotsProps> = ({
  slots,
  selectedTime,
  onSelectTime,
  loading = false,
  primaryColor = '#3B82F6',
}) => {
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading available times...</span>
      </div>
    );
  }

  const availableSlots = slots.filter(s => s.available);

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          No available times for this date
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Please select another date
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Select a Time
      </h4>
      
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {availableSlots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          
          return (
            <button
              key={slot.time}
              onClick={() => onSelectTime(slot.time)}
              className={cn(
                'p-3 rounded-lg text-sm font-medium transition-all',
                'border-2',
                isSelected
                  ? 'text-white border-transparent'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500',
                !isSelected && 'bg-white dark:bg-gray-800'
              )}
              style={isSelected ? { 
                backgroundColor: primaryColor,
                borderColor: primaryColor,
              } : undefined}
            >
              {formatTime(slot.time)}
              {slot.remainingSpots <= 3 && (
                <span className="block text-xs opacity-75 mt-0.5">
                  {slot.remainingSpots} left
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BookFlowTimeSlots;
