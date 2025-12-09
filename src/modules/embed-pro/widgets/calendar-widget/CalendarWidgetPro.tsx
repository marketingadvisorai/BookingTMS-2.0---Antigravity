/**
 * Calendar Widget Pro - Main Component
 * @module embed-pro/widgets/calendar-widget/CalendarWidgetPro
 * 
 * Calendar-first booking widget with complete checkout flow.
 * Flow: Calendar → Time Slots → Party Size → Checkout → Stripe → Success
 * 
 * Uses same components as BookingWidgetPro for consistency.
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Calendar, Clock, Users, CreditCard } from 'lucide-react';
import { useBookingFlow } from '../../hooks/useBookingFlow';
import {
  WidgetHeader,
  WidgetCalendar,
  WidgetTimeSlots,
  WidgetPartySize,
  WidgetCheckout,
  WidgetSuccess,
  WidgetPreviewCheckout,
} from '../../widget-components';
import { CalendarStepIndicator, CalendarActivityInfo, CalendarLegend } from './components';
import { useCalendarBooking } from './hooks/useCalendarBooking';
import { liquidGlassStyles } from './styles/liquidGlass.styles';
import type { CalendarWidgetProProps, StepConfig, CalendarStep } from './types';

// =====================================================
// STEP CONFIGURATION
// =====================================================

const STEPS: StepConfig[] = [
  { id: 'select-date', label: 'Date', icon: Calendar },
  { id: 'select-time', label: 'Time', icon: Clock },
  { id: 'select-party', label: 'Guests', icon: Users },
  { id: 'checkout', label: 'Details', icon: CreditCard },
];

// =====================================================
// ANIMATION VARIANTS
// =====================================================

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// =====================================================
// COMPONENT
// =====================================================

export const CalendarWidgetPro: React.FC<CalendarWidgetProProps> = ({
  data,
  calendarOptions = {},
  onDateSelect,
  onBookClick,
  onBookingComplete,
}) => {
  const { venue, style, isPreview } = data;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { showPricing = true, showLegend = true } = calendarOptions || {};
  const activity = data.activities?.[0] || data.activity;
  const isDarkMode = style.theme === 'dark';

  // Booking flow state machine
  const {
    state,
    currentStep,
    canGoBack,
    selectDate,
    selectTime,
    setPartySize,
    setChildCount,
    goBack,
    goToStep,
    setBookingId,
  } = useBookingFlow({ initialActivity: activity, hasMultipleActivities: false });

  // Checkout handling
  const {
    isLoading,
    showPreviewCheckout,
    previewCustomerName,
    handleCheckout,
    closePreviewCheckout,
  } = useCalendarBooking({ activity, embedKey: data.embedKey, isPreview });

  // Scroll to top on step change
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Handle step transition
  const handleStepChange = useCallback((action: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      action();
      setIsTransitioning(false);
    }, 100);
  }, []);

  if (!activity) {
    return <div className="p-8 text-center text-gray-500">No activity selected</div>;
  }

  return (
    <>
      <style>{liquidGlassStyles}</style>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl overflow-hidden shadow-lg"
        style={{
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          color: style.textColor,
          fontFamily: style.fontFamily,
          borderRadius: style.borderRadius,
        }}
      >
        {/* Header */}
        {currentStep !== 'success' && (
          <WidgetHeader activity={activity} venue={venue} style={style} compact />
        )}

        {/* Activity Info - Only on date selection */}
        {currentStep === 'select-date' && (
          <CalendarActivityInfo
            activity={activity}
            style={style}
            isDarkMode={isDarkMode}
            showPricing={showPricing}
          />
        )}

        {/* Step Indicator */}
        {currentStep !== 'success' && currentStep !== 'select-date' && (
          <CalendarStepIndicator
            steps={STEPS}
            currentStep={currentStep as CalendarStep}
            style={style}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Back Button */}
        {currentStep !== 'success' && currentStep !== 'select-date' && canGoBack && (
          <button
            onClick={() => handleStepChange(goBack)}
            className={`flex items-center gap-1 mx-4 mb-2 px-3 py-1.5 rounded-xl text-sm 
              transition-all hover:bg-gray-100 dark:hover:bg-gray-700
              ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {/* Content Area */}
        <div
          ref={contentRef}
          className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
          style={{ minHeight: 320 }}
        >
          <AnimatePresence mode="wait">
            {currentStep === 'select-date' && (
              <motion.div key="date" {...stepVariants}>
                <WidgetCalendar
                  schedule={activity.schedule}
                  selectedDate={state.selectedDate}
                  onDateSelect={(date) => {
                    selectDate(date);
                    onDateSelect?.(date);
                    handleStepChange(() => goToStep('select-time'));
                  }}
                  style={style}
                  isDarkMode={isDarkMode}
                />
                {showLegend && <CalendarLegend isDarkMode={isDarkMode} />}
              </motion.div>
            )}

            {currentStep === 'select-time' && (
              <motion.div key="time" {...stepVariants}>
                <WidgetTimeSlots
                  schedule={activity.schedule}
                  selectedDate={state.selectedDate}
                  selectedTime={state.selectedTime}
                  onTimeSelect={(time, sessionId) => {
                    selectTime(time, sessionId);
                    handleStepChange(() => goToStep('select-party'));
                  }}
                  style={style}
                  duration={activity.duration}
                />
              </motion.div>
            )}

            {currentStep === 'select-party' && (
              <motion.div key="party" {...stepVariants} className="p-4">
                <WidgetPartySize
                  activity={activity}
                  partySize={state.partySize}
                  childCount={state.childCount}
                  onPartySizeChange={setPartySize}
                  onChildCountChange={setChildCount}
                  style={style}
                />
                <button
                  onClick={() => handleStepChange(() => goToStep('checkout'))}
                  className="liquid-primary-button w-full mt-4 py-4 rounded-xl font-semibold text-white"
                  style={{ backgroundColor: style.primaryColor }}
                >
                  Continue to Checkout
                </button>
              </motion.div>
            )}

            {currentStep === 'checkout' && state.selectedDate && state.selectedTime && (
              <motion.div key="checkout" {...stepVariants}>
                {showPreviewCheckout ? (
                  <WidgetPreviewCheckout
                    activity={activity}
                    selectedDate={state.selectedDate}
                    selectedTime={state.selectedTime}
                    partySize={state.partySize}
                    childCount={state.childCount}
                    customerName={previewCustomerName}
                    style={style}
                    onComplete={() => {
                      closePreviewCheckout();
                      setBookingId('PREVIEW-' + Date.now());
                    }}
                    onBack={closePreviewCheckout}
                  />
                ) : (
                  <WidgetCheckout
                    style={style}
                    isLoading={isLoading}
                    isDarkMode={isDarkMode}
                    onBack={() => handleStepChange(() => goToStep('select-party'))}
                    onSubmit={(customerInfo) => handleCheckout({
                      selectedDate: state.selectedDate!,
                      selectedTime: state.selectedTime!,
                      partySize: state.partySize,
                      childCount: state.childCount,
                      customerInfo,
                      sessionId: state.sessionId,
                    })}
                  />
                )}
              </motion.div>
            )}

            {currentStep === 'success' && state.selectedDate && state.selectedTime && (
              <motion.div key="success" {...stepVariants}>
                <WidgetSuccess
                  bookingId={state.bookingId || ''}
                  activity={activity}
                  selectedDate={state.selectedDate}
                  selectedTime={state.selectedTime}
                  partySize={state.partySize}
                  childCount={state.childCount}
                  style={style}
                  onNewBooking={() => {
                    onBookingComplete?.(state.bookingId || '');
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

export default CalendarWidgetPro;
