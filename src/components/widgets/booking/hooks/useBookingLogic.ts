import { useState } from 'react';
import { toast } from 'sonner';
import { validateCheckoutForm, sanitizeEmail, sanitizeName, sanitizePhone } from '../../../../lib/validation/formValidation';
import { validatePromoCode as validatePromoCodeService, validateGiftCard as validateGiftCardService, applyPromoDiscount, applyGiftCardBalance } from '../../../../lib/validation/codeValidation';
import { CheckoutService } from '../../../../lib/payments/checkoutService';
import { CustomerData } from './useBookingState';
import { TimeSlot } from './useAvailability';

interface UseBookingLogicProps {
    customerData: CustomerData;
    selectedGameData: any;
    selectedTime: string | null;
    selectedDate: number | null;
    currentMonth: number;
    currentYear: number;
    partySize: number;
    totalPrice: number;
    appliedPromoCode: any;
    appliedGiftCard: any;
    timeSlots: TimeSlot[];
    config: any;
    setValidationErrors: (errors: any) => void;
    setAppliedPromoCode: (code: any) => void;
    setAppliedGiftCard: (card: any) => void;
}

export function useBookingLogic({
    customerData,
    selectedGameData,
    selectedTime,
    selectedDate,
    currentMonth,
    currentYear,
    partySize,
    totalPrice,
    appliedPromoCode,
    appliedGiftCard,
    timeSlots,
    config,
    setValidationErrors,
    setAppliedPromoCode,
    setAppliedGiftCard
}: UseBookingLogicProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleCompleteBooking = async () => {
        if (isProcessing) return;

        try {
            // Step 1: Validate all form inputs
            const validation = validateCheckoutForm({
                fullName: customerData.name,
                email: customerData.email,
                phone: customerData.phone,
            });

            if (!validation.isValid) {
                setValidationErrors(validation.errors);
                toast.error('Please fix the errors in the form');
                return;
            }

            // Step 2: Check if payment is enabled (template mode vs venue mode)
            if (config?.isTemplate || config?.enablePayment === false) {
                toast.info('This is a template preview. Configure in Venues to enable booking.', {
                    duration: 5000,
                    description: 'Booking widgets are templates. Add this to your venue to accept real bookings.'
                });
                return;
            }

            // Step 3: Validate required venue data
            if (!config?.venueId) {
                toast.error('Venue configuration is missing. This widget must be configured in Venues.', {
                    duration: 5000,
                    description: 'Please configure this widget in the Venues section to enable booking.'
                });
                return;
            }

            if (!selectedGameData?.id) {
                toast.error('Please select a game');
                return;
            }

            if (!selectedTime) {
                toast.error('Please select a time');
                return;
            }

            setIsProcessing(true);
            toast.loading('Processing your booking...', { id: 'booking-process' });

            // Step 3: Calculate final amount with discounts
            let finalAmount = totalPrice;

            if (appliedPromoCode) {
                const promoValidation = await validatePromoCodeService(appliedPromoCode.code, finalAmount);
                if (!promoValidation.isValid) {
                    toast.error(promoValidation.error || 'Invalid promo code', { id: 'booking-process' });
                    setAppliedPromoCode(null);
                    setIsProcessing(false);
                    return;
                }
                if (promoValidation.discount) {
                    finalAmount = applyPromoDiscount(finalAmount, promoValidation.discount);
                }
            }

            if (appliedGiftCard) {
                const giftValidation = await validateGiftCardService(appliedGiftCard.code);
                if (!giftValidation.isValid) {
                    toast.error(giftValidation.error || 'Invalid gift card', { id: 'booking-process' });
                    setAppliedGiftCard(null);
                    setIsProcessing(false);
                    return;
                }
                if (giftValidation.balance) {
                    const result = applyGiftCardBalance(finalAmount, giftValidation.balance);
                    finalAmount = result.remainingAmount;
                }
            }

            // Step 4: Sanitize customer data
            const nameParts = customerData.name.trim().split(/\s+/);
            const firstName = sanitizeName(nameParts[0] || '');
            const lastName = sanitizeName(nameParts.slice(1).join(' ') || 'Customer');

            const cleanCustomerData = {
                email: sanitizeEmail(customerData.email),
                firstName,
                lastName,
                phone: sanitizePhone(customerData.phone),
            };

            // Step 5: Prepare booking date
            if (!selectedDate) throw new Error("Selected date is null");
            const bookingDate = new Date(currentYear, currentMonth, selectedDate);
            const isoDate = bookingDate.toISOString().split('T')[0];

            // Step 6: Parse and calculate time
            let startTime = selectedTime;
            let endTime = '';

            const cleanedTime = selectedTime.trim().replace(/\s+/g, ' ');
            const timeMatch = cleanedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);

            if (timeMatch) {
                let hours = parseInt(timeMatch[1]);
                const minutes = parseInt(timeMatch[2]);
                const period = timeMatch[3];

                if (period) {
                    if (period.toUpperCase() === 'PM' && hours !== 12) {
                        hours += 12;
                    } else if (period.toUpperCase() === 'AM' && hours === 12) {
                        hours = 0;
                    }
                }

                startTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

                const startDate = new Date();
                startDate.setHours(hours, minutes, 0, 0);
                const duration = typeof selectedGameData?.duration === 'string'
                    ? parseInt(selectedGameData.duration)
                    : selectedGameData?.duration || 60;
                const endDate = new Date(startDate.getTime() + duration * 60000);
                endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
            } else {
                toast.error('Invalid time format', { id: 'booking-process' });
                setIsProcessing(false);
                return;
            }

            // Validate priceId before proceeding
            if (!selectedGameData.stripe_price_id) {
                toast.error('Game pricing not configured. Please contact support.', { id: 'booking-process' });
                setIsProcessing(false);
                return;
            }

            // Find selected slot to get sessionId
            const selectedSlot = timeSlots.find((s: any) => s.time === selectedTime);
            const sessionId = selectedSlot?.sessionId;

            const baseParams = {
                venueId: config.venueId,
                gameId: selectedGameData.id,
                sessionId, // Pass sessionId
                bookingDate: isoDate,
                startTime,
                endTime,
                partySize,
                customer: cleanCustomerData,
                totalPrice: parseFloat(finalAmount.toFixed(2)),
                priceId: selectedGameData.stripe_price_id,
            };

            // Use Checkout Service (Payment Link or Checkout Session)
            // Check if game has a custom checkout URL configured
            const checkoutUrl = selectedGameData.stripeCheckoutUrl || selectedGameData.stripe_checkout_url;

            if (checkoutUrl) {
                // OPTION 1A: Direct Stripe Checkout URL (Custom Payment Link)
                toast.success('Redirecting to checkout...', { id: 'booking-process' });
                console.log('Using custom checkout URL:', checkoutUrl);

                // Create booking record first then redirect
                await CheckoutService.createBookingWithPaymentLink({
                    ...baseParams,
                    paymentLink: checkoutUrl
                });

                setTimeout(() => {
                    window.location.href = checkoutUrl;
                }, 1000);
            } else {
                // OPTION 1B: Generate dynamic Stripe Checkout Session
                console.log('Generating dynamic checkout session...');

                const successUrl = `${window.location.origin}/booking/success?session_id={CHECKOUT_SESSION_ID}`;
                const cancelUrl = window.location.href;

                const { checkoutUrl: sessionUrl } = await CheckoutService.createBookingWithCheckout({
                    ...baseParams,
                    successUrl,
                    cancelUrl
                });

                if (sessionUrl) {
                    toast.success('Redirecting to payment...', { id: 'booking-process' });
                    setTimeout(() => {
                        window.location.href = sessionUrl;
                    }, 1000);
                } else {
                    throw new Error('Failed to generate checkout URL');
                }
            }

        } catch (error: any) {
            console.error('Booking error:', error);
            toast.error(error.message || 'Failed to process booking', { id: 'booking-process' });
            setIsProcessing(false);
        }
    };

    return {
        handleCompleteBooking,
        isProcessing
    };
}
