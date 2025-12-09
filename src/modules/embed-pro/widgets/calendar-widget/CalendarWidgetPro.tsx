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
  WidgetActivitySelector,
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
  const { venue, style, isPreview, activities } = data;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const { showPricing = true, showLegend = true } = calendarOptions || {};
  const isDarkMode = style.theme === 'dark';
  
  // Check if venue has multiple activities
  const hasMultipleActivities = (activities?.length || 0) > 1;
  
  // Track selected activity for venue mode
  const [selectedActivity, setSelectedActivity] = useState<typeof data.activity>(
    hasMultipleActivities ? null : (activities?.[0] || data.activity)
  );
  
  // Active activity is selected or the only one
  const activity = selectedActivity || activities?.[0] || data.activity;

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
    reset,
  } = useBookingFlow({ initialActivity: activity, hasMultipleActivities });
  
  // Handle activity selection for venue mode
  const handleActivitySelect = useCallback((selected: typeof data.activity) => {
    if (!selected) return;
    setSelectedActivity(selected);
    // Move to date selection after selecting activity
    goToStep('select-date');
  }, [goToStep]);

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

  // Needs activity selection (venue with multiple activities, none selected yet)
  const needsActivitySelection = hasMultipleActivities && !selectedActivity;

  return (
    <>
      <style>{liquidGlassStyles}</style>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? 'liquid-glass-dark' : ''}`}
        style={{
          backgroundColor: isDarkMode ? 'rgba(18, 18, 18, 0.96)' : '#ffffff',
          color: isDarkMode ? '#ffffff' : style.textColor,
          fontFamily: style.fontFamily,
          borderRadius: style.borderRadius,
          border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : undefined,
        }}
      >
        {/* Header - Show only when activity is selected */}
        {currentStep !== 'success' && !needsActivitySelection && activity && (
          <WidgetHeader activity={activity} venue={venue} style={style} compact isDarkMode={isDarkMode} />
        )}
        
        {/* Venue Header - Show when selecting activities */}
        {needsActivitySelection && venue && (
          <div className={`p-4 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {venue.name}
            </h2>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Select an activity to book
            </p>
          </div>
        )}

        {/* Activity Info - Only on date selection */}
        {currentStep === 'select-date' && !needsActivitySelection && activity && (
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
        {currentStep !== 'success' && !needsActivitySelection && (
          <button
            onClick={() => {
              if (currentStep === 'select-date' && hasMultipleActivities) {
                // Go back to activity selection
                setSelectedActivity(null);
                reset();
              } else if (canGoBack) {
                handleStepChange(goBack);
              }
            }}
            className={`flex items-center gap-1 mx-4 mb-2 px-3 py-1.5 rounded-xl text-sm 
              transition-all 
              ${isDarkMode 
                ? 'text-gray-300 hover:bg-white/10' 
                : 'text-gray-600 hover:bg-gray-100'}
              ${currentStep === 'select-date' && !hasMultipleActivities ? 'hidden' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 'select-date' && hasMultipleActivities ? 'Change Activity' : 'Back'}
          </button>
        )}

        {/* Content Area */}
        <div
          ref={contentRef}
          className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
          style={{ minHeight: 320 }}
        >
          <AnimatePresence mode="wait">
            {/* Activity Selection for Venues */}
            {needsActivitySelection && activities && (
              <motion.div key="activities" {...stepVariants}>
                <WidgetActivitySelector
                  activities={activities}
                  venue={venue}
                  style={style}
                  onSelect={handleActivitySelect}
                  layout={data.venueLayout}
                  isDarkMode={isDarkMode}
                />
              </motion.div>
            )}

            {currentStep === 'select-date' && !needsActivitySelection && activity && (
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
                  isDarkMode={isDarkMode}
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
                  isDarkMode={isDarkMode}
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
                  isDarkMode={isDarkMode}
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
