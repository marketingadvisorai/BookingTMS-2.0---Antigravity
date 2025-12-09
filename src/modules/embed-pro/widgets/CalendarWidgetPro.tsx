/**
 * Calendar Widget Pro - Calendar-first Booking Entry
 *
 * Shows an availability calendar and, when the user is ready,
 * reveals the full BookingWidgetPro flow (date → time → party → checkout).
 *
 * This keeps CalendarWidgetPro small and focused, while reusing the
 * enterprise-grade BookingWidgetPro for the actual checkout pipeline.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, DollarSign, Clock, Users } from 'lucide-react';
import type { WidgetData } from '../types/widget.types';
import { WidgetCalendar, WidgetHeader } from '../widget-components';
import { BookingWidgetPro } from './BookingWidgetPro';

interface CalendarWidgetProProps {
  data: WidgetData;
  onBookingComplete?: (bookingId: string) => void;
}

export const CalendarWidgetPro: React.FC<CalendarWidgetProProps> = ({
  data,
  onBookingComplete,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);

  const activity = data.activities?.[0] || data.activity;
  const style = data.style;
  const isDark = style.theme === 'dark';

  if (!activity) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        No activity configured for this calendar widget.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden shadow-lg"
      style={{
        backgroundColor: isDark ? '#111827' : '#ffffff',
        color: style.textColor,
        fontFamily: style.fontFamily,
        borderRadius: style.borderRadius,
      }}
    >
      {/* Header */}
      <WidgetHeader
        activity={activity}
        venue={data.venue}
        style={style}
        compact
      />

      {/* Activity summary strip, only in calendar mode */}
      {!showBookingFlow && (
        <div
          className={`px-4 py-3 border-b ${
            isDark ? 'border-gray-800 bg-gray-900/40' : 'border-gray-200 bg-gray-50'
          }`}
        >
          <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
            {activity.price > 0 && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" style={{ color: style.primaryColor }} />
                <span className="font-semibold">${activity.price}</span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>/person</span>
              </div>
            )}
            {activity.duration && (
              <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Clock className="w-4 h-4" />
                <span>{activity.duration} min</span>
              </div>
            )}
            {activity.minPlayers && (
              <div className={`flex items-center gap-1.5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Users className="w-4 h-4" />
                <span>
                  {activity.minPlayers}-{activity.maxPlayers} players
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* CALENDAR VIEW (entry) */}
        {!showBookingFlow && (
          <motion.div
            key="calendar-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="p-4">
              <WidgetCalendar
                schedule={activity.schedule}
                selectedDate={selectedDate}
                onDateSelect={(date) => {
                  setSelectedDate(date);
                  // We keep this selection for UX, but the main booking
                  // widget will still guide the user through its own flow.
                }}
                style={style}
                isDarkMode={isDark}
              />

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-[11px] text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span>Limited</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-gray-300" />
                  <span>Unavailable</span>
                </div>
              </div>
            </div>

            {/* CTA button that reveals the full booking flow */}
            <div
              className={`px-4 pb-4 pt-2 border-t ${
                isDark ? 'border-gray-800 bg-gray-900/60' : 'border-gray-200 bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setShowBookingFlow(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm sm:text-base font-semibold text-white shadow-md transition hover:shadow-lg"
                style={{ backgroundColor: style.primaryColor, borderRadius: style.borderRadius }}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>{selectedDate ? 'Continue to booking' : 'Select date to book'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* FULL BOOKING FLOW (reuses BookingWidgetPro) */}
        {showBookingFlow && (
          <motion.div
            key="booking-flow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <BookingWidgetPro
              data={data}
              onBookingComplete={onBookingComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CalendarWidgetPro;
