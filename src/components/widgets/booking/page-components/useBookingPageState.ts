/**
 * useBookingPageState - State management hook for the booking page
 * Centralizes all booking page state and actions
 */
import { useState, useCallback, useRef } from 'react';
import { BookingStep, CustomerData, PromoCode, GiftCard, ParticipantCounts } from './types';

interface BookingPageState {
  currentStep: BookingStep;
  selectedDate: number;
  selectedTime: string | null;
  participants: ParticipantCounts;
  customerData: CustomerData;
  appliedPromoCode: PromoCode | null;
  appliedGiftCard: GiftCard | null;
  isSubmitting: boolean;
  bookingNumber: string;
  showGameDetails: boolean;
  showVideoModal: boolean;
}

const initialParticipants: ParticipantCounts = {
  adults: 2,
  children: 0,
  custom: {}
};

const initialCustomerData: CustomerData = {
  name: '',
  email: '',
  phone: '',
  cardNumber: '',
  cardExpiry: '',
  cardCVV: '',
  cardName: ''
};

export function useBookingPageState(initialDate?: number) {
  const today = new Date();
  
  const [state, setState] = useState<BookingPageState>({
    currentStep: 'booking',
    selectedDate: initialDate || today.getDate(),
    selectedTime: null,
    participants: initialParticipants,
    customerData: initialCustomerData,
    appliedPromoCode: null,
    appliedGiftCard: null,
    isSubmitting: false,
    bookingNumber: '',
    showGameDetails: false,
    showVideoModal: false
  });

  const [currentDate, setCurrentDate] = useState(today);

  // Refs for auto-scroll
  const timeSlotsRef = useRef<HTMLDivElement>(null);
  const playersSectionRef = useRef<HTMLDivElement>(null);
  const continueButtonRef = useRef<HTMLDivElement>(null);

  // Actions
  const setSelectedDate = useCallback((date: number) => {
    setState(prev => ({ ...prev, selectedDate: date, selectedTime: null }));
    
    // Auto-scroll to time slots
    setTimeout(() => {
      timeSlotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  }, []);

  const setSelectedTime = useCallback((time: string) => {
    setState(prev => ({ ...prev, selectedTime: time }));
    
    // Auto-scroll to players section
    setTimeout(() => {
      playersSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    
    // Then to continue button
    setTimeout(() => {
      continueButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
  }, []);

  const setParticipants = useCallback((participants: ParticipantCounts) => {
    setState(prev => ({ ...prev, participants }));
  }, []);

  const setCurrentStep = useCallback((step: BookingStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const updateCustomerData = useCallback((updates: Partial<CustomerData>) => {
    setState(prev => ({
      ...prev,
      customerData: { ...prev.customerData, ...updates }
    }));
  }, []);

  const applyPromoCode = useCallback((promo: PromoCode) => {
    setState(prev => ({ ...prev, appliedPromoCode: promo }));
  }, []);

  const removePromoCode = useCallback(() => {
    setState(prev => ({ ...prev, appliedPromoCode: null }));
  }, []);

  const applyGiftCard = useCallback((card: GiftCard) => {
    setState(prev => ({ ...prev, appliedGiftCard: card }));
  }, []);

  const removeGiftCard = useCallback(() => {
    setState(prev => ({ ...prev, appliedGiftCard: null }));
  }, []);

  const setIsSubmitting = useCallback((submitting: boolean) => {
    setState(prev => ({ ...prev, isSubmitting: submitting }));
  }, []);

  const setBookingNumber = useCallback((number: string) => {
    setState(prev => ({ ...prev, bookingNumber: number }));
  }, []);

  const setShowGameDetails = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showGameDetails: show }));
  }, []);

  const setShowVideoModal = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showVideoModal: show }));
  }, []);

  const handleMonthChange = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const resetBooking = useCallback(() => {
    setState({
      currentStep: 'booking',
      selectedDate: today.getDate(),
      selectedTime: null,
      participants: initialParticipants,
      customerData: initialCustomerData,
      appliedPromoCode: null,
      appliedGiftCard: null,
      isSubmitting: false,
      bookingNumber: '',
      showGameDetails: false,
      showVideoModal: false
    });
    setCurrentDate(new Date());
  }, []);

  return {
    // State
    ...state,
    currentDate,
    
    // Refs
    timeSlotsRef,
    playersSectionRef,
    continueButtonRef,
    
    // Actions
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
  };
}

export default useBookingPageState;
