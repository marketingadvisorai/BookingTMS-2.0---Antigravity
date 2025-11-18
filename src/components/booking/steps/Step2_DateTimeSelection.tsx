/**
 * Step 2: Date & Time Selection Component
 * 
 * Second step - user picks date and time slot for their booking.
 * 
 * UX Features:
 * - Calendar with available dates highlighted
 * - Time slot grid with real-time availability
 * - "Almost full" indicators
 * - Mobile-optimized layout
 * - Auto-refresh availability
 * 
 * @module components/booking/steps
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { addMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isToday, isBefore, startOfToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TimeSlotButton } from '../shared/TimeSlotButton';
import { useAvailability } from '../hooks/useAvailability';
import type { DateTimeSelectionStepProps } from '../types';

// =============================================================================
// COMPONENT
// =============================================================================

export function Step2_DateTimeSelection({
  bookingState,
  onNext,
  onBack,
  onUpdate,
  gameId,
  organizationId,
}: DateTimeSelectionStepProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const selectedDate = bookingState.selectedDate;
  const selectedTimeSlot = bookingState.selectedTimeSlot;
  
  // Fetch availability for selected date
  const { slots, isLoading } = useAvailability({
    gameId,
    date: selectedDate,
    organizationId,
  });
  
  // Calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = startOfToday();
  
  // Handle date selection
  const handleSelectDate = (date: Date) => {
    onUpdate({ type: 'SELECT_DATE', payload: date });
  };
  
  // Handle time slot selection
  const handleSelectTimeSlot = (slot: any) => {
    onUpdate({ type: 'SELECT_TIME_SLOT', payload: slot });
  };
  
  // Navigation
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => addMonths(prev, -1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  
  const handleContinue = () => {
    if (selectedDate && selectedTimeSlot) {
      onNext();
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Pick Your Date & Time
        </h2>
        <p className="text-gray-600">
          Choose when you'd like to play
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardContent className="p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousMonth}
                disabled={isBefore(monthStart, today)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <h3 className="font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              
              {/* Days */}
              {days.map(day => {
                const isPast = isBefore(day, today) && !isToday(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentDay = isToday(day);
                
                return (
                  <button
                    key={day.toString()}
                    onClick={() => !isPast && handleSelectDate(day)}
                    disabled={isPast}
                    className={`
                      aspect-square p-2 rounded-lg text-sm font-medium
                      transition-all duration-200
                      ${isPast
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'hover:bg-gray-100 cursor-pointer'
                      }
                      ${isSelected
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : ''
                      }
                      ${isCurrentDay && !isSelected
                        ? 'ring-2 ring-primary/50'
                        : ''
                      }
                    `}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* Time Slots */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Available Times
            </h3>
            
            {!selectedDate ? (
              <div className="text-center py-12 text-gray-500">
                Select a date to see available times
              </div>
            ) : isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No times available for this date
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {slots.map(slot => (
                  <TimeSlotButton
                    key={slot.time}
                    slot={slot}
                    selected={selectedTimeSlot?.time === slot.time}
                    onClick={handleSelectTimeSlot}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        
        {selectedDate && selectedTimeSlot && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button
              size="lg"
              onClick={handleContinue}
              className="min-w-[200px]"
            >
              Continue to Details
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
