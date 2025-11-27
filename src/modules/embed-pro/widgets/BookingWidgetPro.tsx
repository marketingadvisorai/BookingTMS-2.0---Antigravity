/**
 * Embed Pro 2.0 - Booking Widget Pro Component
 * @module embed-pro/widgets/BookingWidgetPro
 * 
 * Main booking widget with Apple Liquid Glass design.
 * Features glassmorphism, smooth transitions, and premium UX.
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ChevronLeft, Calendar, Clock, Users, CreditCard, Check, Sparkles } from 'lucide-react';
import { useBookingFlow } from '../hooks/useBookingFlow';
import {
  WidgetHeader,
  WidgetCalendar,
  WidgetTimeSlots,
  WidgetPartySize,
  WidgetCheckout,
  WidgetSuccess,
  WidgetActivitySelector,
} from '../widget-components';
import type { WidgetData, CustomerInfo, WidgetActivity } from '../types/widget.types';

// =====================================================
// LIQUID GLASS STYLES
// =====================================================

const liquidGlassStyles = `
  .liquid-glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 
      0 8px 32px rgba(31, 38, 135, 0.15),
      inset 0 2px 20px rgba(255, 255, 255, 0.4);
  }
  
  .liquid-glass-button {
    position: relative;
    background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.1),
      inset 0 2px 8px rgba(255, 255, 255, 0.6);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .liquid-glass-button:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.15),
      inset 0 2px 12px rgba(255, 255, 255, 0.8);
  }
  
  .liquid-glass-button:active {
    transform: translateY(0) scale(0.98);
  }
  
  .liquid-glass-button::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%);
    pointer-events: none;
  }
  
  .liquid-primary-button {
    position: relative;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }
  
  .liquid-primary-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%);
    pointer-events: none;
  }
  
  .liquid-primary-button::after {
    content: '';
    position: absolute;
    inset: -50%;
    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .liquid-primary-button:hover::after {
    opacity: 1;
  }
  
  .liquid-primary-button:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  }
  
  .liquid-primary-button:active {
    transform: translateY(0) scale(0.98);
  }
  
  .step-indicator-glass {
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  .step-dot {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .step-dot.active {
    transform: scale(1.15);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  .shimmer-effect {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
`;

// =====================================================
// TYPES
// =====================================================

interface BookingWidgetProProps {
  data: WidgetData;
  onBookingComplete?: (bookingId: string) => void;
}

// Step configuration with icons
const STEPS = [
  { id: 'select-date', label: 'Date', icon: Calendar },
  { id: 'select-time', label: 'Time', icon: Clock },
  { id: 'select-party', label: 'Guests', icon: Users },
  { id: 'checkout', label: 'Details', icon: CreditCard },
] as const;

// =====================================================
// COMPONENT
// =====================================================

export const BookingWidgetPro: React.FC<BookingWidgetProProps> = ({
  data,
  onBookingComplete,
}) => {
  const { venue, style, config, isPreview, activities } = data;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Track selected activity - for venues with multiple activities
  const [selectedActivity, setSelectedActivity] = useState<WidgetActivity | null>(
    activities.length === 1 ? activities[0] : null
  );
  
  // Use selected activity or first activity
  const activity = selectedActivity || data.activity;
  const hasMultipleActivities = activities.length > 1;
  const needsActivitySelection = hasMultipleActivities && !selectedActivity;

  const {
    state,
    currentStep,
    canGoBack,
    selectDate,
    selectTime,
    setPartySize,
    setChildCount,
    goBack,
    goNext,
    setBookingId,
    setError,
    reset,
  } = useBookingFlow({
    initialActivity: activity,
    hasMultipleActivities,
  });

  // Handle activity selection for venue mode
  const handleActivitySelect = useCallback((selected: WidgetActivity) => {
    setSelectedActivity(selected);
  }, []);

  // Smooth scroll to top on step change
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Handle step transition with animation
  const handleStepChange = useCallback((action: () => void) => {
    setIsTransitioning(true);
    setTimeout(() => {
      action();
      setIsTransitioning(false);
    }, 100);
  }, []);

  // Handle checkout submission
  const handleCheckoutSubmit = useCallback(async (customerInfo: CustomerInfo) => {
    if (isPreview) {
      setTimeout(() => setBookingId('PREVIEW-' + Date.now()), 800);
      return;
    }

    try {
      // TODO: Integrate with create-checkout-session edge function
      console.log('[BookingWidget] Creating booking:', {
        activityId: activity?.id,
        date: state.selectedDate?.toISOString(),
        time: state.selectedTime,
        partySize: state.partySize,
        customer: customerInfo,
      });

      await new Promise(resolve => setTimeout(resolve, 1200));
      const bookingId = 'BK-' + Date.now();
      setBookingId(bookingId);
      onBookingComplete?.(bookingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    }
  }, [activity, state, isPreview, setBookingId, setError, onBookingComplete]);

  // Show activity selector for venues with multiple activities
  if (needsActivitySelection) {
    return (
      <>
        <style>{liquidGlassStyles}</style>
        <div
          className="w-full max-w-md mx-auto liquid-glass rounded-3xl overflow-hidden"
          style={{ fontFamily: style.fontFamily }}
        >
          <WidgetActivitySelector
            activities={activities}
            venue={venue}
            style={style}
            onSelect={handleActivitySelect}
          />
        </div>
      </>
    );
  }

  if (!activity) {
    return (
      <div className="p-8 text-center text-gray-500">No activity selected</div>
    );
  }

  // Get current step index
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <>
      {/* Inject Liquid Glass Styles */}
      <style>{liquidGlassStyles}</style>
      
      <div
        className="w-full max-w-md mx-auto liquid-glass rounded-3xl overflow-hidden"
        style={{ fontFamily: style.fontFamily }}
      >
        {/* Compact Header - Always visible */}
        {currentStep !== 'success' && (
          <WidgetHeader activity={activity} venue={venue} style={style} />
        )}

        {/* Step Indicator - Liquid Glass Style */}
        {currentStep !== 'success' && (
          <div className="px-4 py-3 step-indicator-glass mx-3 my-2 rounded-2xl">
            <div className="flex items-center justify-between">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isComplete = idx < currentStepIndex;
                
                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`step-dot w-10 h-10 rounded-2xl flex items-center justify-center ${
                          isActive ? 'active' : ''
                        }`}
                        style={{
                          background: isActive || isComplete 
                            ? `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.primaryColor}dd 100%)`
                            : 'rgba(229, 231, 235, 0.8)',
                          color: isActive || isComplete ? '#fff' : '#9ca3af',
                          boxShadow: isActive 
                            ? `0 4px 15px ${style.primaryColor}40` 
                            : '0 2px 8px rgba(0,0,0,0.05)',
                        }}
                      >
                        {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span className={`text-[10px] mt-1.5 font-semibold tracking-wide ${
                        isActive ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div 
                        className="flex-1 h-1 mx-2 rounded-full transition-all duration-500"
                        style={{ 
                          background: idx < currentStepIndex 
                            ? `linear-gradient(90deg, ${style.primaryColor}, ${style.primaryColor}aa)`
                            : 'rgba(229, 231, 235, 0.6)'
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Back Button - Liquid Glass Style */}
        {currentStep !== 'success' && (
          <button
            onClick={() => {
              if (currentStep === 'select-date' && hasMultipleActivities) {
                // Go back to activity selection
                setSelectedActivity(null);
              } else if (canGoBack) {
                handleStepChange(goBack);
              }
            }}
            className={`
              liquid-glass-button flex items-center gap-1 mx-4 mb-2 px-3 py-1.5 rounded-xl text-sm text-gray-600 hover:text-gray-900
              ${currentStep === 'select-date' && !hasMultipleActivities ? 'hidden' : ''}
            `}
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 'select-date' && hasMultipleActivities ? 'Change Activity' : 'Back'}
          </button>
        )}

      {/* Content Area with Animation */}
      <div
        ref={contentRef}
        className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
        style={{ minHeight: 320 }}
      >
        {currentStep === 'select-date' && (
          <WidgetCalendar
            schedule={activity.schedule}
            selectedDate={state.selectedDate}
            onDateSelect={(date) => {
              selectDate(date);
              handleStepChange(goNext);
            }}
            style={style}
          />
        )}

        {currentStep === 'select-time' && (
          <WidgetTimeSlots
            schedule={activity.schedule}
            selectedDate={state.selectedDate}
            selectedTime={state.selectedTime}
            onTimeSelect={(time) => {
              selectTime(time);
              handleStepChange(goNext);
            }}
            style={style}
            duration={activity.duration}
          />
        )}

        {currentStep === 'select-party' && (
          <div className="p-4">
            <WidgetPartySize
              activity={activity}
              partySize={state.partySize}
              childCount={state.childCount}
              onPartySizeChange={setPartySize}
              onChildCountChange={setChildCount}
              style={style}
            />
            <button
              onClick={() => handleStepChange(goNext)}
              className="liquid-primary-button w-full mt-4 py-4 rounded-2xl font-semibold text-white"
              style={{ 
                background: `linear-gradient(135deg, ${style.primaryColor} 0%, ${style.primaryColor}dd 100%)` 
              }}
            >
              Continue to Checkout
            </button>
          </div>
        )}

        {currentStep === 'checkout' && (
          <WidgetCheckout
            onSubmit={handleCheckoutSubmit}
            onBack={() => handleStepChange(goBack)}
            style={style}
            buttonText={isPreview ? 'Complete (Preview)' : config.buttonText}
          />
        )}

        {currentStep === 'success' && state.selectedDate && state.selectedTime && (
          <WidgetSuccess
            activity={activity}
            venue={venue}
            selectedDate={state.selectedDate}
            selectedTime={state.selectedTime}
            partySize={state.partySize + state.childCount}
            bookingId={state.bookingId || undefined}
            style={style}
            successMessage={config.successMessage}
            onNewBooking={reset}
          />
        )}
      </div>

      {/* Error */}
      {state.error && (
        <div className="px-4 pb-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {state.error}
          </div>
        </div>
      )}

        {/* Preview Badge */}
        {isPreview && (
          <div className="px-4 pb-3">
            <div className="p-2 step-indicator-glass rounded-xl text-xs text-amber-700 text-center flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" />
              Preview Mode
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BookingWidgetPro;
