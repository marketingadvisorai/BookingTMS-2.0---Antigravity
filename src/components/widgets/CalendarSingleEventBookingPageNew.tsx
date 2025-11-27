/**
 * CalendarSingleEventBookingPage - Refactored modular booking page
 * Uses modular components for enterprise-level architecture
 * Syncs with Step 5 Schedule settings (operating days, blocked dates, custom hours)
 */
import { useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { VisuallyHidden } from '../ui/visually-hidden';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';

// Modular components
import {
  BookingHero,
  BookingCalendar,
  BookingTimeSlots,
  BookingSidebar,
  BookingCheckout,
  BookingSuccess,
  useBookingPageState,
  GameData,
  ScheduleData
} from './booking/page-components';

// Hooks and services
import { useAvailability } from './booking/hooks/useAvailability';
import { useBookingWidgetData } from './booking/hooks/useBookingWidgetData';
import { useWidgetTheme } from './WidgetThemeContext';
import { CheckoutService } from '../../lib/payments/checkoutService';

interface CalendarSingleEventBookingPageProps {
  primaryColor?: string;
  activityId?: string;
  venueId?: string;
  gameName?: string;
  gameDescription?: string;
  gamePrice?: number;
  gameSchedule?: any;
  timezone?: string;
  config?: any;
}

export function CalendarSingleEventBookingPageNew({
  primaryColor: propPrimaryColor,
  activityId,
  venueId,
  gameName,
  gameDescription,
  gamePrice,
  gameSchedule,
  timezone,
  config
}: CalendarSingleEventBookingPageProps) {
  const { widgetTheme, getCurrentPrimaryColor } = useWidgetTheme();
  const primaryColor = propPrimaryColor || getCurrentPrimaryColor() || '#2563eb';

  // Get game data using custom hook
  const { selectedGame, gameData } = useBookingWidgetData({
    config,
    activityId,
    gameName,
    gameDescription,
    gamePrice,
    timezone
  });

  // Use state hook
  const {
    currentStep,
    selectedDate,
    selectedTime,
    participants,
    customerData,
    appliedPromoCode,
    appliedGiftCard,
    isSubmitting,
    bookingNumber,
    showGameDetails,
    showVideoModal,
    currentDate,
    timeSlotsRef,
    playersSectionRef,
    continueButtonRef,
    setSelectedDate,
    setSelectedTime,
    setParticipants,
    setCurrentStep,
    updateCustomerData,
    applyPromoCode,
    removePromoCode,
    applyGiftCard,
    removeGiftCard,
    setIsSubmitting,
    setBookingNumber,
    setShowGameDetails,
    setShowVideoModal,
    handleMonthChange,
    resetBooking
  } = useBookingPageState();

  // Get time slots from availability hook
  const { timeSlots, loading: slotsLoading } = useAvailability({
    config,
    selectedActivity: selectedGame?.id,
    selectedActivityData: gameData,
    selectedDate,
    currentMonth: currentDate.getMonth(),
    currentYear: currentDate.getFullYear()
  });

  // Get Stripe prices from activity data
  const stripePrices = useMemo(() => selectedGame?.stripePrices || selectedGame?.stripe_prices, [selectedGame]);
  
  // Get prices for adults and children
  const adultPrice = stripePrices?.adult?.amount || gameData.price || 0;
  const childPrice = stripePrices?.child?.amount || (gameData as any).childPrice || adultPrice;
  
  // Calculate total amount
  const totalAmount = useMemo(() => {
    const adultTotal = adultPrice * participants.adults;
    const childTotal = childPrice * participants.children;
    const subtotal = adultTotal + childTotal;
    const promoDiscount = appliedPromoCode
      ? appliedPromoCode.type === 'percentage'
        ? (subtotal * appliedPromoCode.discount) / 100
        : appliedPromoCode.discount
      : 0;
    const giftCardAmount = appliedGiftCard?.amount || 0;
    return Math.max(0, subtotal - promoDiscount - giftCardAmount);
  }, [adultPrice, childPrice, participants, appliedPromoCode, appliedGiftCard]);

  // Handle checkout submission
  const handleCheckoutSubmit = useCallback(async () => {
    if (!selectedTime || !selectedDate) return;
    
    const priceId = selectedGame?.stripePriceId || selectedGame?.stripe_price_id;
    
    // If no Stripe price, create demo booking
    if (!priceId) {
      setBookingNumber(`BK-${Date.now().toString(36).toUpperCase()}`);
      setCurrentStep('success');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const sessionDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate).toISOString();
      
      // Build checkout params with multi-tier pricing
      const checkoutParams: any = {
        customerEmail: customerData.email,
        customerName: customerData.name,
        successUrl: `${window.location.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/booking/cancel`,
        metadata: {
          activityId: selectedGame?.id || activityId || '',
          sessionDate,
          sessionTime: selectedTime,
          customerPhone: customerData.phone,
          adult_count: String(participants.adults),
          child_count: String(participants.children),
          total_participants: String(participants.adults + participants.children)
        }
      };

      // Use multi-tier pricing if available
      if (stripePrices?.adult?.price_id && participants.adults > 0) {
        checkoutParams.adultPriceId = stripePrices.adult.price_id;
        checkoutParams.adultQuantity = participants.adults;
      }
      if (stripePrices?.child?.price_id && participants.children > 0) {
        checkoutParams.childPriceId = stripePrices.child.price_id;
        checkoutParams.childQuantity = participants.children;
      }
      // Fallback to single price if no multi-tier
      if (!checkoutParams.adultPriceId) {
        checkoutParams.priceId = priceId;
        checkoutParams.quantity = participants.adults + participants.children;
      }

      // Create Stripe checkout session
      const result = await CheckoutService.createCheckoutSession(checkoutParams);

      if (result.url) {
        window.location.href = result.url;
      } else {
        // Fallback for demo/testing
        setBookingNumber(`BK-${Date.now().toString(36).toUpperCase()}`);
        setCurrentStep('success');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to process checkout');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTime, selectedDate, selectedGame, activityId, participants, customerData, currentDate, stripePrices]);

  // Render based on current step
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Game Details Dialog */}
      <Dialog open={showGameDetails} onOpenChange={setShowGameDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{gameData.name}</DialogTitle>
            <DialogDescription>{gameData.description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4">
              <p className="text-gray-700">{gameData.longDescription}</p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-4xl">
          <VisuallyHidden>
            <DialogTitle>Video</DialogTitle>
            <DialogDescription>Experience video</DialogDescription>
          </VisuallyHidden>
          <div className="aspect-video bg-black rounded-lg" />
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      {currentStep === 'booking' && (
        <>
          <BookingHero
            gameData={gameData}
            primaryColor={primaryColor}
            onShowDetails={() => setShowGameDetails(true)}
            onShowVideo={() => setShowVideoModal(true)}
          />
          
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar and Time Slots */}
              <div className="lg:col-span-2 space-y-6">
                <BookingCalendar
                  currentDate={currentDate}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  onMonthChange={handleMonthChange}
                  primaryColor={primaryColor}
                  schedule={gameData.schedule}
                  blockedDates={gameData.schedule.blockedDates || []}
                  customDates={gameData.schedule.customDates || []}
                  advanceBookingDays={gameData.schedule.advanceBooking || 30}
                />

                <div ref={timeSlotsRef}>
                  <BookingTimeSlots
                    selectedDate={selectedDate}
                    currentDate={currentDate}
                    timeSlots={timeSlots}
                    selectedTime={selectedTime}
                    onTimeSelect={setSelectedTime}
                    primaryColor={primaryColor}
                    loading={slotsLoading}
                    timezone={gameData.timezone}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div ref={playersSectionRef}>
                <BookingSidebar
                  gameData={gameData}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  participants={participants}
                  onParticipantsChange={setParticipants}
                  onContinue={() => setCurrentStep('checkout')}
                  primaryColor={primaryColor}
                  currentDate={currentDate}
                  appliedPromoCode={appliedPromoCode}
                  appliedGiftCard={appliedGiftCard}
                  onApplyPromoCode={applyPromoCode}
                  onApplyGiftCard={applyGiftCard}
                  onRemovePromoCode={removePromoCode}
                  onRemoveGiftCard={removeGiftCard}
                  stripePrices={stripePrices}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {currentStep === 'checkout' && selectedTime && (
        <BookingCheckout
          gameData={gameData}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          participants={participants}
          customerData={customerData}
          onCustomerDataChange={updateCustomerData}
          onSubmit={handleCheckoutSubmit}
          onBack={() => setCurrentStep('booking')}
          primaryColor={primaryColor}
          isSubmitting={isSubmitting}
          currentDate={currentDate}
          totalAmount={totalAmount}
          stripePrices={stripePrices}
        />
      )}

      {currentStep === 'success' && selectedTime && (
        <BookingSuccess
          bookingNumber={bookingNumber}
          gameData={gameData}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          participants={participants}
          customerData={customerData}
          primaryColor={primaryColor}
          currentDate={currentDate}
          onBookAnother={resetBooking}
        />
      )}
    </div>
  );
}

export default CalendarSingleEventBookingPageNew;
