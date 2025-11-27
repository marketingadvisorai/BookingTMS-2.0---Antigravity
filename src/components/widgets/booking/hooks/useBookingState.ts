import { useReducer, useState } from 'react';

export type BookingStep = 'booking' | 'cart' | 'checkout' | 'payment' | 'success';

export interface CustomerData {
    name: string;
    email: string;
    phone: string;
    cardNumber: string;
    cardExpiry: string;
    cardCVV: string;
    cardName: string;
}

interface BookingState {
    step: BookingStep;
    selectedDate: number;
    selectedTime: string | null;
    selectedActivityId: string | null;
    participants: {
        adults: number;
        children: number;
        custom: Record<string, number>;
    };
    customerData: CustomerData;
    validationErrors: {
        name?: string;
        email?: string;
        phone?: string;
    };
    isProcessing: boolean;
    confirmationCode: string;
    showActivityDetails: boolean;
    showVideoModal: boolean;
    currentMonth: number;
    currentYear: number;
}

type BookingAction =
    | { type: 'SET_STEP'; payload: BookingStep }
    | { type: 'SET_DATE'; payload: number }
    | { type: 'SET_TIME'; payload: string | null }
    | { type: 'SET_ACTIVITY'; payload: string | null }
    | { type: 'SET_PARTICIPANTS'; payload: { type: 'adults' | 'children' | string; count: number } }
    | { type: 'UPDATE_CUSTOMER_DATA'; payload: Partial<CustomerData> }
    | { type: 'SET_VALIDATION_ERRORS'; payload: BookingState['validationErrors'] }
    | { type: 'SET_PROCESSING'; payload: boolean }
    | { type: 'SET_CONFIRMATION_CODE'; payload: string }
    | { type: 'TOGGLE_ACTIVITY_DETAILS'; payload: boolean }
    | { type: 'TOGGLE_VIDEO_MODAL'; payload: boolean }
    | { type: 'SET_MONTH_YEAR'; payload: { month: number; year: number } }
    | { type: 'RESET_BOOKING' };

const initialState: BookingState = {
    step: 'booking',
    selectedDate: new Date().getDate(),
    selectedTime: null,
    selectedActivityId: null,
    participants: {
        adults: 2,
        children: 0,
        custom: {},
    },
    customerData: {
        name: '',
        email: '',
        phone: '',
        cardNumber: '',
        cardExpiry: '',
        cardCVV: '',
        cardName: '',
    },
    validationErrors: {},
    isProcessing: false,
    confirmationCode: '',
    showActivityDetails: false,
    showVideoModal: false,
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, step: action.payload };
        case 'SET_DATE':
            return { ...state, selectedDate: action.payload, selectedTime: null }; // Reset time on date change
        case 'SET_TIME':
            return { ...state, selectedTime: action.payload };
        case 'SET_ACTIVITY':
            return { ...state, selectedActivityId: action.payload, selectedTime: null }; // Reset time on activity change
        case 'SET_PARTICIPANTS':
            if (action.payload.type === 'adults') {
                return { ...state, participants: { ...state.participants, adults: action.payload.count } };
            } else if (action.payload.type === 'children') {
                return { ...state, participants: { ...state.participants, children: action.payload.count } };
            } else {
                return {
                    ...state,
                    participants: {
                        ...state.participants,
                        custom: { ...state.participants.custom, [action.payload.type]: action.payload.count }
                    }
                };
            }
        case 'UPDATE_CUSTOMER_DATA':
            return { ...state, customerData: { ...state.customerData, ...action.payload } };
        case 'SET_VALIDATION_ERRORS':
            return { ...state, validationErrors: action.payload };
        case 'SET_PROCESSING':
            return { ...state, isProcessing: action.payload };
        case 'SET_CONFIRMATION_CODE':
            return { ...state, confirmationCode: action.payload };
        case 'TOGGLE_ACTIVITY_DETAILS':
            return { ...state, showActivityDetails: action.payload };
        case 'TOGGLE_VIDEO_MODAL':
            return { ...state, showVideoModal: action.payload };
        case 'SET_MONTH_YEAR':
            return { ...state, currentMonth: action.payload.month, currentYear: action.payload.year };
        case 'RESET_BOOKING':
            return initialState;
        default:
            return state;
    }
}

export const useBookingState = (defaultActivityId?: string, defaultDate?: number) => {
    const [state, dispatch] = useReducer(bookingReducer, {
        ...initialState,
        selectedActivityId: defaultActivityId || null,
        selectedDate: defaultDate || initialState.selectedDate
    });

    const setCurrentStep = (step: BookingStep) => dispatch({ type: 'SET_STEP', payload: step });
    const setSelectedDate = (date: number) => dispatch({ type: 'SET_DATE', payload: date });
    const setSelectedTime = (time: string | null) => dispatch({ type: 'SET_TIME', payload: time });
    const setSelectedActivityId = (id: string | null) => dispatch({ type: 'SET_ACTIVITY', payload: id });
    const setParticipants = (type: string, count: number) => dispatch({ type: 'SET_PARTICIPANTS', payload: { type, count } });
    const setCustomerData = (data: CustomerData) => dispatch({ type: 'UPDATE_CUSTOMER_DATA', payload: data });
    const setValidationErrors = (errors: BookingState['validationErrors']) => dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
    const setIsProcessing = (isProcessing: boolean) => dispatch({ type: 'SET_PROCESSING', payload: isProcessing });
    const setConfirmationCode = (code: string) => dispatch({ type: 'SET_CONFIRMATION_CODE', payload: code });
    const setShowActivityDetails = (show: boolean) => dispatch({ type: 'TOGGLE_ACTIVITY_DETAILS', payload: show });
    const setShowVideoModal = (show: boolean) => dispatch({ type: 'TOGGLE_VIDEO_MODAL', payload: show });
    const setCurrentMonth = (month: number) => dispatch({ type: 'SET_MONTH_YEAR', payload: { month, year: state.currentYear } });
    const setCurrentYear = (year: number) => dispatch({ type: 'SET_MONTH_YEAR', payload: { month: state.currentMonth, year } });
    const resetBooking = () => dispatch({ type: 'RESET_BOOKING' });

    const [showHealthSafetyDialog, setShowHealthSafetyDialog] = useState(false);
    const [appliedPromoCode, setAppliedPromoCode] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null);
    const [appliedGiftCard, setAppliedGiftCard] = useState<any | null>(null);

    return {
        currentStep: state.step,
        setCurrentStep,
        selectedDate: state.selectedDate,
        setSelectedDate,
        selectedTime: state.selectedTime,
        setSelectedTime,
        selectedActivityId: state.selectedActivityId,
        setSelectedActivityId,
        participants: state.participants,
        setParticipants,
        customerData: state.customerData,
        setCustomerData,
        validationErrors: state.validationErrors,
        setValidationErrors,
        isProcessing: state.isProcessing,
        setIsProcessing,
        confirmationCode: state.confirmationCode,
        setConfirmationCode,
        showActivityDetails: state.showActivityDetails,
        setShowActivityDetails,
        showVideoModal: state.showVideoModal,
        setShowVideoModal,
        currentMonth: state.currentMonth,
        setCurrentMonth,
        currentYear: state.currentYear,
        setCurrentYear,
        resetBooking,
        showHealthSafetyDialog,
        setShowHealthSafetyDialog,
        appliedPromoCode,
        setAppliedPromoCode,
        appliedGiftCard,
        setAppliedGiftCard
    };
};
