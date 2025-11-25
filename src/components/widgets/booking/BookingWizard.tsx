import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../../ui/button';
import { useBookingState } from './hooks/useBookingState';
import { useAvailability } from './hooks/useAvailability';
import { useBookingLogic } from './hooks/useBookingLogic';
import { DateSelector } from './components/DateSelector';
import { TimeSlotGrid } from './components/TimeSlotGrid';
import { BookingSummary } from './components/BookingSummary';
import { CustomerForm } from './components/CustomerForm';
import { PaymentForm } from './components/PaymentForm';
import { ActivityDetailsModal } from './components/ActivityDetailsModal';
import { HealthSafetyDialog } from './components/HealthSafetyDialog';
import { PromoCodeInput } from '../PromoCodeInput';
import { GiftCardInput } from '../GiftCardInput';
import { useWidgetData } from '../../../hooks/useWidgetData';

interface BookingWizardProps {
    config: any;
    primaryColor?: string;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
    config,
    primaryColor = '#2563eb'
}) => {
    // 1. Initialize State Hooks
    const {
        currentStep,
        setCurrentStep,
        selectedDate,
        setSelectedDate,
        selectedTime,
        setSelectedTime,
        selectedActivityId,
        setSelectedActivityId,
        partySize,
        setPartySize,
        customerData,
        setCustomerData,
        validationErrors,
        setValidationErrors,
        appliedPromoCode,
        setAppliedPromoCode,
        appliedGiftCard,
        setAppliedGiftCard,
        currentMonth,
        setCurrentMonth,
        currentYear,
        setCurrentYear,
        showActivityDetails,
        setShowActivityDetails,
        showHealthSafetyDialog,
        setShowHealthSafetyDialog
    } = useBookingState(config?.activityId || config?.gameId);

    // 2. Fetch Data
    const { venue: venueData, activities, loading, error } = useWidgetData({
        venueId: config?.venueId,
        activityId: config?.activityId || config?.gameId,
        date: selectedDate ? new Date(currentYear, currentMonth, selectedDate) : new Date()
    });

    // Derive selected activity data
    const selectedActivityData = React.useMemo(() => {
        const availableActivities = (activities && activities.length > 0) ? activities : (config?.activities || []);
        if (!availableActivities || availableActivities.length === 0) return null;
        return availableActivities.find((a: any) => a.id === selectedActivityId) || availableActivities[0];
    }, [activities, selectedActivityId, config?.activities]);

    // 3. Availability Hook
    const { timeSlots, loading: slotsLoading } = useAvailability({
        selectedDate,
        currentMonth,
        currentYear,
        selectedActivity: selectedActivityData?.id || null,
        selectedActivityData,
        venueData,
        config
    });

    // 4. Derived State
    const subtotal = (selectedActivityData?.price || 0) * partySize;

    let displayPrice = subtotal;
    if (appliedPromoCode) {
        if (appliedPromoCode.type === 'percentage') {
            displayPrice = displayPrice * (1 - appliedPromoCode.discount / 100);
        } else {
            displayPrice = Math.max(0, displayPrice - appliedPromoCode.discount);
        }
    }
    if (appliedGiftCard) {
        displayPrice = Math.max(0, displayPrice - appliedGiftCard.amount);
    }

    const canAddToCart = !!(selectedDate && selectedTime && selectedActivityData);
    const canContinueToPayment = !!(customerData.name && customerData.email && customerData.phone);

    // 5. Booking Logic Hook
    const { handleCompleteBooking, isProcessing } = useBookingLogic({
        customerData,
        selectedActivityData,
        selectedTime,
        selectedDate,
        currentMonth,
        currentYear,
        partySize,
        totalPrice: subtotal, // Pass subtotal to logic hook to avoid double discounting
        appliedPromoCode,
        appliedGiftCard,
        timeSlots,
        config,
        setValidationErrors,
        setAppliedPromoCode,
        setAppliedGiftCard
    });

    const isInitialLoading = loading.venue || loading.activities;

    if (isInitialLoading) {
        return (
            <div className="w-full min-h-[600px] bg-gray-50 max-w-full overflow-x-hidden">
                <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-8">
                    <div className="flex justify-end items-center gap-4 mb-6">
                        <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                            <div className="h-[400px] bg-white rounded-xl border border-gray-200 animate-pulse" />
                            <div className="h-[200px] bg-white rounded-xl border border-gray-200 animate-pulse" />
                        </div>
                        <div className="lg:col-span-1">
                            <div className="h-[300px] bg-white rounded-xl border border-gray-200 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="flex items-center justify-center min-h-[600px] text-red-500">Error: {error}</div>;
    }

    if (!selectedActivityData) {
        return <div className="flex items-center justify-center min-h-[600px]">No activity data available.</div>;
    }

    return (
        <div className="w-full min-h-[600px] bg-gray-50 max-w-full overflow-x-hidden" style={{ fontFamily: config?.fontFamily }}>
            {/* Dialogs */}
            <HealthSafetyDialog
                isOpen={showHealthSafetyDialog}
                onOpenChange={setShowHealthSafetyDialog}
            />

            <ActivityDetailsModal
                isOpen={showActivityDetails}
                onClose={() => setShowActivityDetails(false)}
                activityData={selectedActivityData}
                primaryColor={primaryColor}
            />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-8">
                {/* Header */}
                <div className="flex justify-end items-center gap-4 mb-6">
                    {config?.showHealthSafety && (
                        <Button variant="outline" onClick={() => setShowHealthSafetyDialog(true)}>
                            Health & Safety
                        </Button>
                    )}
                </div>

                {/* Wizard Steps */}
                {currentStep === 'booking' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                            <DateSelector
                                selectedDate={selectedDate || 0}
                                currentMonth={currentMonth}
                                currentYear={currentYear}
                                onDateSelect={setSelectedDate}
                                onMonthChange={(m, y) => { setCurrentMonth(m); setCurrentYear(y); }}
                                selectedActivityData={selectedActivityData}
                                config={config}
                                primaryColor={primaryColor}
                            />
                            <TimeSlotGrid
                                timeSlots={timeSlots}
                                selectedDate={selectedDate}
                                currentMonth={currentMonth}
                                currentYear={currentYear}
                                timezoneLabel={venueData?.timezone || 'Local Time'}
                                selectedTime={selectedTime}
                                onTimeSelect={setSelectedTime}
                                primaryColor={primaryColor}
                                slotDurationMinutes={selectedActivityData.duration || 60}
                                loading={slotsLoading}
                            />
                        </div>
                        <div className="lg:col-span-1">
                            <BookingSummary
                                selectedActivityData={selectedActivityData}
                                selectedDate={selectedDate}
                                selectedTime={selectedTime}
                                partySize={partySize}
                                totalPrice={displayPrice}
                                primaryColor={primaryColor}
                                onPartySizeChange={setPartySize}
                                onShowDetails={() => setShowActivityDetails(true)}
                                onContinue={() => setCurrentStep('cart')}
                                canContinue={canAddToCart}
                            />
                        </div>
                    </div>
                )}

                {currentStep === 'cart' && (
                    <div className="max-w-4xl mx-auto">
                        <Button
                            onClick={() => setCurrentStep('booking')}
                            variant="outline"
                            className="mb-4"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back to Calendar
                        </Button>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <CustomerForm
                                    customerData={customerData}
                                    validationErrors={validationErrors}
                                    onChange={(field, value) => setCustomerData({ ...customerData, [field]: value })}
                                    onValidationError={setValidationErrors}
                                    primaryColor={primaryColor}
                                />
                            </div>
                            <div className="lg:col-span-1 space-y-6">
                                {/* Promo & Gift Card */}
                                <PromoCodeInput
                                    onApply={(code, discount, type) => setAppliedPromoCode({ code, discount, type })}
                                    onRemove={() => setAppliedPromoCode(null)}
                                    appliedCode={appliedPromoCode?.code}
                                    appliedDiscount={appliedPromoCode?.discount}
                                    appliedType={appliedPromoCode?.type}
                                />
                                <GiftCardInput
                                    onApply={(code, amount) => setAppliedGiftCard({ code, amount })}
                                    onRemove={() => setAppliedGiftCard(null)}
                                    appliedCode={appliedGiftCard?.code}
                                    appliedAmount={appliedGiftCard?.amount}
                                />

                                <Button
                                    onClick={() => setCurrentStep('payment')}
                                    disabled={!canContinueToPayment}
                                    className="w-full h-12 text-lg"
                                    style={{ backgroundColor: canContinueToPayment ? primaryColor : undefined }}
                                >
                                    Proceed to Payment
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 'payment' && (
                    <div className="max-w-2xl mx-auto">
                        <Button
                            onClick={() => setCurrentStep('cart')}
                            variant="outline"
                            className="mb-4"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            Back to Details
                        </Button>

                        <PaymentForm
                            totalPrice={displayPrice}
                            primaryColor={primaryColor}
                            onSubmit={handleCompleteBooking}
                            isProcessing={isProcessing}
                            onCancel={() => setCurrentStep('cart')}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
