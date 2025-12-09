/**
 * Embed Pro 2.0 - Booking Widget Pro Component
 * @module embed-pro/widgets/BookingWidgetPro
 * 
 * Main booking widget with Apple Liquid Glass design.
 * Features glassmorphism, smooth transitions, and premium UX.
 * 
 * Responsive Layouts:
 * - Desktop (lg+): 2-panel with sticky booking summary
 * - Tablet (md): Wide single column with enhanced spacing
 * - Mobile: Compact single column
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { ChevronLeft, Calendar, Clock, Users, CreditCard, Check, Sparkles } from 'lucide-react';
import { useBookingFlow } from '../hooks/useBookingFlow';
import { usePromoCode } from '../hooks/usePromoCode';
import { useGiftCard } from '../hooks/useGiftCard';
import {
  WidgetHeader,
  WidgetCalendar,
  WidgetTimeSlots,
  WidgetPartySize,
  WidgetCheckout,
  WidgetSuccess,
  WidgetActivitySelector,
  WidgetBookingSummary,
  WidgetDiscounts,
  WidgetPreviewCheckout,
} from '../widget-components';
import { checkoutProService } from '../services';
import type { WidgetData, CustomerInfo, WidgetActivity } from '../types/widget.types';

// =====================================================
// LIQUID GLASS STYLES
// =====================================================

const liquidGlassStyles = `
  /* Light Mode Styles */
  .liquid-glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 
      0 8px 32px rgba(31, 38, 135, 0.15),
      inset 0 2px 20px rgba(255, 255, 255, 0.4);
  }
  
  /* Dark Mode Styles - Spotify-inspired */
  .liquid-glass-dark {
    background: linear-gradient(180deg, rgba(32, 32, 32, 0.9) 0%, rgba(18, 18, 18, 0.95) 100%);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.4),
      inset 0 1px 1px rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }

  /* Noise Texture Overlay */
  .liquid-glass-dark::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
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
  
  .liquid-glass-button-dark {
    position: relative;
    z-index: 1;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #ffffff;
    box-shadow: 
      0 4px 6px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .liquid-glass-button:hover,
  .liquid-glass-button-dark:hover {
    transform: translateY(-1px);
  }
  
  .liquid-glass-button:hover {
    box-shadow: 
      0 8px 24px rgba(0, 0, 0, 0.15),
      inset 0 2px 12px rgba(255, 255, 255, 0.8);
  }
  
  .liquid-glass-button-dark:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 
      0 8px 20px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
  
  .liquid-glass-button:active,
  .liquid-glass-button-dark:active {
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
  
  .liquid-glass-button-dark::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(135deg, rgba(150,150,160,0.15) 0%, transparent 50%);
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
  
  .step-indicator-glass-dark {
    background: rgba(30, 30, 30, 0.6);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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
  
  .shimmer-effect-dark {
    background: linear-gradient(90deg, transparent, rgba(150,150,160,0.2), transparent);
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
  const { venue, style, config, isPreview, activities, venueLayout } = data;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showPreviewCheckout, setShowPreviewCheckout] = useState(false);
  const [previewCustomerName, setPreviewCustomerName] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Detect dark mode from style theme
  const isDarkMode = style.theme === 'dark';
  
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
    selectActivity,
    selectDate,
    selectTime,
    setPartySize,
    setChildCount,
    goBack,
    goNext,
    goToStep,
    setBookingId,
    setError,
    reset,
  } = useBookingFlow({
    initialActivity: activity,
    hasMultipleActivities,
  });

  // Calculate subtotal in cents
  const adultPrice = activity ? (activity.price || 0) * 100 : 0; // Convert to cents
  const childPrice = activity ? ((activity.childPrice || activity.price || 0)) * 100 : 0;
  const subtotal = (state.partySize * adultPrice) + (state.childCount * childPrice);

  // Promo Code Hook
  const promo = usePromoCode({
    activityId: activity?.id || '',
    organizationId: activity?.organizationId,
    subtotal,
    currency: activity?.currency || 'USD',
  });

  // Gift Card Hook
  const giftCard = useGiftCard({
    activityId: activity?.id || '',
    organizationId: activity?.organizationId,
    subtotal: subtotal - promo.discountAmount, // Apply after promo
    currency: activity?.currency || 'USD',
  });

  // Handle activity selection for venue mode
  const handleActivitySelect = useCallback((selected: WidgetActivity) => {
    setSelectedActivity(selected);
    // Use booking flow's selectActivity to properly advance to date selection step
    selectActivity(selected);
  }, [selectActivity]);

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
    if (!activity || !state.selectedDate || !state.selectedTime) {
      setError('Missing booking information');
      return;
    }

    // Preview mode - show simulated Stripe checkout
    if (isPreview) {
      setPreviewCustomerName(`${customerInfo.firstName} ${customerInfo.lastName}`);
      setShowPreviewCheckout(true);
      return;
    }

    setIsCheckoutLoading(true);

    try {
      console.log('[BookingWidget] Creating checkout session:', {
        activityId: activity.id,
        date: state.selectedDate.toISOString(),
        time: state.selectedTime,
        partySize: state.partySize,
        childCount: state.childCount,
        customer: customerInfo,
      });

      // Track the booking started event
      if (data.embedKey) {
        checkoutProService.trackBookingStarted(data.embedKey);
      }

      // Create Stripe checkout session
      const { url } = await checkoutProService.createCheckoutSession({
        activity,
        date: state.selectedDate,
        time: state.selectedTime,
        partySize: state.partySize,
        childCount: state.childCount,
        customerInfo,
        organizationId: activity.organizationId,
        embedKey: data.embedKey,
      });

      // Redirect to Stripe Checkout
      checkoutProService.redirectToCheckout(url);
    } catch (err) {
      console.error('[BookingWidget] Checkout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create checkout');
      setIsCheckoutLoading(false);
    }
  }, [activity, state, data.embedKey, isPreview, setBookingId, setError]);

  // Show activity selector for venues with multiple activities
  if (needsActivitySelection) {
    return (
      <>
        <style>{liquidGlassStyles}</style>
        <div
          className={`w-full max-w-md mx-auto rounded-3xl overflow-hidden ${isDarkMode ? 'liquid-glass-dark' : 'liquid-glass'}`}
          style={{ fontFamily: style.fontFamily }}
        >
          <WidgetActivitySelector
            activities={activities}
            venue={venue}
            style={style}
            onSelect={handleActivitySelect}
            layout={venueLayout}
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

  // Desktop 2-panel layout check
  const showSummaryPanel = currentStep !== 'success';

  return (
    <>
      {/* Inject Liquid Glass Styles */}
      <style>{liquidGlassStyles}</style>
      
      {/* Responsive Container */}
      <div 
        className="w-full flex flex-col lg:flex-row lg:gap-6 lg:max-w-5xl mx-auto"
        style={{ fontFamily: style.fontFamily }}
      >
        {/* Main Booking Panel */}
        <div
          className={`w-full lg:flex-1 max-w-md mx-auto lg:max-w-none rounded-3xl overflow-hidden ${isDarkMode ? 'liquid-glass-dark' : 'liquid-glass'}`}
        >
        {/* Compact Header - Always visible */}
        {currentStep !== 'success' && (
          <WidgetHeader activity={activity} venue={venue} style={style} />
        )}

        {/* Step Indicator - Liquid Glass Style */}
        {currentStep !== 'success' && (
          <div className={`px-4 py-3 mx-3 my-2 rounded-2xl ${isDarkMode ? 'step-indicator-glass-dark' : 'step-indicator-glass'}`}>
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
                            : isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(229, 231, 235, 0.8)',
                          color: isActive || isComplete ? '#fff' : isDarkMode ? '#9ca3af' : '#9ca3af',
                          boxShadow: isActive 
                            ? `0 4px 15px ${style.primaryColor}40` 
                            : isDarkMode ? '0 2px 8px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                        }}
                      >
                        {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                      </div>
                      <span className={`text-[10px] mt-1.5 font-semibold tracking-wide ${
                        isActive ? (isDarkMode ? 'text-white' : 'text-gray-900') : 'text-gray-500'
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
                            : isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(229, 231, 235, 0.6)'
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
                // Go back to activity selection - reset both local state and booking flow
                setSelectedActivity(null);
                reset();
              } else if (canGoBack) {
                handleStepChange(goBack);
              }
            }}
            className={`
              ${isDarkMode ? 'liquid-glass-button-dark' : 'liquid-glass-button'} 
              flex items-center gap-1 mx-4 mb-2 px-3 py-1.5 rounded-xl text-sm 
              ${isDarkMode ? 'text-gray-300 hover:text-gray-100' : 'text-gray-600 hover:text-gray-900'}
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
              // Use goToStep directly to avoid stale closure issues with goNext
              handleStepChange(() => goToStep('select-time'));
            }}
            style={style}
            isDarkMode={isDarkMode}
          />
        )}

        {currentStep === 'select-time' && (
          <WidgetTimeSlots
            schedule={activity.schedule}
            selectedDate={state.selectedDate}
            selectedTime={state.selectedTime}
            onTimeSelect={(time, sessionId) => {
              selectTime(time, sessionId);
              // Use goToStep directly to avoid stale closure issues with goNext
              handleStepChange(() => goToStep('select-party'));
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
              onClick={() => handleStepChange(() => goToStep('checkout'))}
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
          <>
            {/* Preview Mode: Show simulated Stripe checkout */}
            {showPreviewCheckout && state.selectedDate && state.selectedTime ? (
              <WidgetPreviewCheckout
                activity={activity}
                selectedDate={state.selectedDate}
                selectedTime={state.selectedTime}
                partySize={state.partySize}
                childCount={state.childCount}
                customerName={previewCustomerName}
                style={style}
                onComplete={() => {
                  setShowPreviewCheckout(false);
                  setBookingId('PREVIEW-' + Date.now());
                }}
                onBack={() => setShowPreviewCheckout(false)}
              />
            ) : (
              <>
                {/* Discounts Section */}
                <WidgetDiscounts
                  // Promo Code
                  promoCode={promo.code}
                  onPromoCodeChange={promo.setCode}
                  isPromoValidating={promo.isValidating}
                  appliedPromo={promo.appliedPromo}
                  promoDiscountAmount={promo.discountAmount}
                  promoError={promo.error}
                  onApplyPromo={promo.applyPromo}
                  onRemovePromo={promo.removePromo}
                  onClearPromoError={promo.clearError}
                  // Gift Card
                  giftCardCode={giftCard.code}
                  onGiftCardCodeChange={giftCard.setCode}
                  isGiftCardValidating={giftCard.isValidating}
                  appliedGiftCard={giftCard.appliedGiftCard}
                  giftCardAmountApplied={giftCard.amountApplied}
                  giftCardRemainingAfter={giftCard.remainingAfter}
                  giftCardError={giftCard.error}
                  onApplyGiftCard={giftCard.applyGiftCard}
                  onRemoveGiftCard={giftCard.removeGiftCard}
                  onClearGiftCardError={giftCard.clearError}
                  // Common
                  style={style}
                  subtotal={subtotal}
                  formatAmount={promo.formatAmount}
                />
                <WidgetCheckout
                  onSubmit={handleCheckoutSubmit}
                  onBack={() => handleStepChange(goBack)}
                  style={style}
                  isLoading={isCheckoutLoading}
                  buttonText={isPreview ? 'Continue to Payment (Preview)' : 'Continue to Payment'}
                  isDarkMode={isDarkMode}
                />
              </>
            )}
          </>
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
        {/* End Main Booking Panel */}

        {/* Desktop Sidebar - Booking Summary */}
        {showSummaryPanel && (
          <div className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-4">
              <WidgetBookingSummary
                activity={activity}
                venueName={venue?.name}
                venueCity={venue?.city || undefined}
                selectedDate={state.selectedDate}
                selectedTime={state.selectedTime}
                partySize={state.partySize}
                childCount={state.childCount}
                style={style}
                currentStep={currentStep}
              />
            </div>
          </div>
        )}
      </div>
      {/* End Responsive Container */}
    </>
  );
};

export default BookingWidgetPro;
