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
    selectedGameId: string | null;
    partySize: number;
    customerData: CustomerData;
    validationErrors: {
        name?: string;
        email?: string;
        phone?: string;
    };
    isProcessing: boolean;
    confirmationCode: string;
    showGameDetails: boolean;
    showVideoModal: boolean;
    currentMonth: number;
    currentYear: number;
}

type BookingAction =
    | { type: 'SET_STEP'; payload: BookingStep }
    | { type: 'SET_DATE'; payload: number }
    | { type: 'SET_TIME'; payload: string | null }
    | { type: 'SET_GAME'; payload: string | null }
    | { type: 'SET_PARTY_SIZE'; payload: number }
    | { type: 'UPDATE_CUSTOMER_DATA'; payload: Partial<CustomerData> }
    | { type: 'SET_VALIDATION_ERRORS'; payload: BookingState['validationErrors'] }
    | { type: 'SET_PROCESSING'; payload: boolean }
    | { type: 'SET_CONFIRMATION_CODE'; payload: string }
    | { type: 'TOGGLE_GAME_DETAILS'; payload: boolean }
    | { type: 'TOGGLE_VIDEO_MODAL'; payload: boolean }
    | { type: 'SET_MONTH_YEAR'; payload: { month: number; year: number } }
    | { type: 'RESET_BOOKING' };

const initialState: BookingState = {
    step: 'booking',
    selectedDate: new Date().getDate(),
    selectedTime: null,
    selectedGameId: null,
    partySize: 4,
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
    showGameDetails: false,
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
        case 'SET_GAME':
            return { ...state, selectedGameId: action.payload, selectedTime: null }; // Reset time on game change
        case 'SET_PARTY_SIZE':
            return { ...state, partySize: action.payload };
        case 'UPDATE_CUSTOMER_DATA':
            return { ...state, customerData: { ...state.customerData, ...action.payload } };
        case 'SET_VALIDATION_ERRORS':
            return { ...state, validationErrors: action.payload };
        case 'SET_PROCESSING':
            return { ...state, isProcessing: action.payload };
        case 'SET_CONFIRMATION_CODE':
            return { ...state, confirmationCode: action.payload };
        case 'TOGGLE_GAME_DETAILS':
            return { ...state, showGameDetails: action.payload };
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

export const useBookingState = (defaultGameId?: string, defaultDate?: number) => {
    const [state, dispatch] = useReducer(bookingReducer, {
        ...initialState,
        selectedGameId: defaultGameId || null,
        selectedDate: defaultDate || initialState.selectedDate
    });

    const setCurrentStep = (step: BookingStep) => dispatch({ type: 'SET_STEP', payload: step });
    const setSelectedDate = (date: number) => dispatch({ type: 'SET_DATE', payload: date });
    const setSelectedTime = (time: string | null) => dispatch({ type: 'SET_TIME', payload: time });
    const setSelectedGameId = (id: string | null) => dispatch({ type: 'SET_GAME', payload: id });
    const setPartySize = (size: number) => dispatch({ type: 'SET_PARTY_SIZE', payload: size });
    const setCustomerData = (data: CustomerData) => dispatch({ type: 'UPDATE_CUSTOMER_DATA', payload: data });
    const setValidationErrors = (errors: BookingState['validationErrors']) => dispatch({ type: 'SET_VALIDATION_ERRORS', payload: errors });
    const setIsProcessing = (isProcessing: boolean) => dispatch({ type: 'SET_PROCESSING', payload: isProcessing });
    const setConfirmationCode = (code: string) => dispatch({ type: 'SET_CONFIRMATION_CODE', payload: code });
    const setShowGameDetails = (show: boolean) => dispatch({ type: 'TOGGLE_GAME_DETAILS', payload: show });
    const setShowVideoModal = (show: boolean) => dispatch({ type: 'TOGGLE_VIDEO_MODAL', payload: show });
    const setCurrentMonth = (month: number) => dispatch({ type: 'SET_MONTH_YEAR', payload: { month, year: state.currentYear } });
    const setCurrentYear = (year: number) => dispatch({ type: 'SET_MONTH_YEAR', payload: { month: state.currentMonth, year } });
    const resetBooking = () => dispatch({ type: 'RESET_BOOKING' });

    // Additional state for dialogs that wasn't in the reducer but used in Wizard
    // We can add it to reducer or just return it if it was missing.
    // Wait, showHealthSafetyDialog was missing in BookingState.
    // I should add it to BookingState or handle it locally in Wizard.
    // But Wizard expects it from useBookingState.
    // Let's add it to the return object but we need state for it.
    // Since I can't easily change the reducer state definition without rewriting the whole file,
    // I will add a local state for it here or just omit it and let Wizard handle it?
    // No, Wizard uses it.
    // I will add a local state for health safety dialog here.
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
        selectedGameId: state.selectedGameId,
        setSelectedGameId,
        partySize: state.partySize,
        setPartySize,
        customerData: state.customerData,
        setCustomerData,
        validationErrors: state.validationErrors,
        setValidationErrors,
        isProcessing: state.isProcessing,
        setIsProcessing,
        confirmationCode: state.confirmationCode,
        setConfirmationCode,
        showGameDetails: state.showGameDetails,
        setShowGameDetails,
        showVideoModal: state.showVideoModal,
        setShowVideoModal,
        currentMonth: state.currentMonth,
        setCurrentMonth,
        currentYear: state.currentYear,
        setCurrentYear,
        resetBooking,
        // Extra state
        showHealthSafetyDialog,
        setShowHealthSafetyDialog,
        appliedPromoCode,
        setAppliedPromoCode,
        appliedGiftCard,
        setAppliedGiftCard
    };
};
