import React, { useState } from 'react';
import { X, Lock, ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Trash2, Plus, Minus, ShoppingCart, CheckCircle, Moon, Sun, Sparkles, Star, CreditCard, User, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { WidgetContainer } from './WidgetContainer';
import { PromoCodeInput } from './PromoCodeInput';
import { GiftCardInput } from './GiftCardInput';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';

interface FareBookSingleEventWidgetProps {
  primaryColor?: string;
  config?: WidgetConfig;
  theme?: 'light' | 'dark';
  eventData?: EventData;
}

interface WidgetConfig {
  showSecuredBadge?: boolean;
  showHealthSafety?: boolean;
  enableVeteranDiscount?: boolean;
  ticketTypes?: TicketType[];
  additionalQuestions?: AdditionalQuestion[];
  cancellationPolicy?: string;
}

interface EventData {
  id: string;
  name: string;
  image: string;
  priceRange: string;
  ageRange: string;
  duration: string;
  difficulty: number;
  description?: string;
}

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  minAge?: number;
}

interface AdditionalQuestion {
  id: string;
  question: string;
  type: 'select' | 'text' | 'checkbox';
  options?: string[];
  required?: boolean;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface CartItem {
  id: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  promoCode?: string;
}

export default function FareBookSingleEventWidget({
  primaryColor = '#0ea5e9',
  config,
  theme: initialTheme = 'light',
  eventData
}: FareBookSingleEventWidgetProps) {
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>(initialTheme);
  const [currentStep, setCurrentStep] = useState<'calendar' | 'timeslot' | 'plan' | 'cart' | 'checkout' | 'success' | 'failed'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Month and year options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 3 }, (_, i) => 2025 + i);
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [ticketCounts, setTicketCounts] = useState<{ [key: string]: number }>({});
  const [promoInputs, setPromoInputs] = useState<{ [ticketTypeId: string]: string }>({});
  const [showPromoInput, setShowPromoInput] = useState<{ [ticketTypeId: string]: boolean }>({});
  const [appliedPromos, setAppliedPromos] = useState<{ [ticketTypeId: string]: { code: string; discount: number } }>({});

  const [contactDetails, setContactDetails] = useState({
    fullName: '',
    phone: '',
    email: '',
    emailUpdates: false
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    securityCode: '',
    country: 'United States'
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Gift card state
  const [showGiftCardInput, setShowGiftCardInput] = useState(false);
  const [appliedGiftCard, setAppliedGiftCard] = useState<{ code: string; amount: number } | null>(null);

  // Checkout-level promo code state
  const [showPromoCodeInput, setShowPromoCodeInput] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<{ code: string; discount: number } | null>(null);

  // Simple input states for lite checkout
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [giftCardInput, setGiftCardInput] = useState('');

  // Dialog state for badges
  const [showSecuredDialog, setShowSecuredDialog] = useState(false);
  const [showHealthSafetyDialog, setShowHealthSafetyDialog] = useState(false);

  // Default event data
  const defaultEventData: EventData = {
    id: '1',
    name: 'Zombie Apocalypse',
    image: 'https://images.unsplash.com/photo-1659059530318-656a112ad2cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6b21iaWUlMjBhcG9jYWx5cHNlJTIwaG9ycm9yfGVufDF8fHx8MTc2MTg5OTYzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    priceRange: '$25 - $30',
    ageRange: 'Ages 6+',
    duration: '1 Hour',
    difficulty: 5,
    description: 'Can you survive the zombie apocalypse and find the cure?'
  };

  // Default configuration
  const defaultConfig: WidgetConfig = {
    showSecuredBadge: true,
    showHealthSafety: true,
    enableVeteranDiscount: true,
    ticketTypes: [
      { id: 'player', name: 'Players', description: 'Ages 6 & Up', price: 30 },
      { id: 'veteran', name: 'Veterans', description: 'Must show military ID', price: 25 }
    ],
    additionalQuestions: [
      {
        id: 'hear-about',
        question: 'How did you hear about us?',
        type: 'select',
        options: ['Google', 'Facebook', 'Friend', 'Other'],
        required: false
      }
    ],
    cancellationPolicy: 'Cash refunds are not available. If you are unable to keep your scheduled reservation, please contact us. We can rebook you to a different date and/or time or issue a refund in the form of a gift card.'
  };

  const activeConfig = { ...defaultConfig, ...config };
  const activeEvent = eventData || defaultEventData;
  const ticketTypes = activeConfig.ticketTypes || [];

  // Generate calendar days for the current month
  const generateCalendarDays = () => {
    const days: Array<{
      date: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      slots: number;
    }> = [];
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(selectedYear, selectedMonth, 0).getDate();

    // Add days from previous month
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
      days.push({
        date: day,
        month: prevMonth,
        year: selectedMonth === 0 ? selectedYear - 1 : selectedYear,
        isCurrentMonth: false,
        slots: 0
      });
    }

    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const slots = Math.floor(Math.random() * 10) + 1; // Random 1-10 slots available
      days.push({
        date: i,
        month: selectedMonth,
        year: selectedYear,
        isCurrentMonth: true,
        slots: slots
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
      days.push({
        date: i,
        month: nextMonth,
        year: selectedMonth === 11 ? selectedYear + 1 : selectedYear,
        isCurrentMonth: false,
        slots: 0
      });
    }

    return days;
  };

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleDateSelect = (day: any) => {
    if (day.isCurrentMonth && day.slots > 0) {
      const date = new Date(day.year, day.month, day.date);
      setSelectedDate(date);
      setCurrentStep('timeslot');
    }
  };

  // Generate time slots
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 10; hour <= 20; hour++) {
      const timeStr = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      slots.push({
        time: timeStr,
        available: Math.random() > 0.3 // 70% availability
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('plan');
  };

  const handleBack = () => {
    if (currentStep === 'timeslot') setCurrentStep('calendar');
    else if (currentStep === 'plan') setCurrentStep('timeslot');
    else if (currentStep === 'cart') setCurrentStep('plan');
    else if (currentStep === 'checkout') setCurrentStep('cart');
  };

  const handleAddToCart = () => {
    const newItems: CartItem[] = [];
    Object.keys(ticketCounts).forEach((ticketTypeId) => {
      const count = ticketCounts[ticketTypeId];
      if (count > 0) {
        const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
        if (ticketType) {
          for (let i = 0; i < count; i++) {
            newItems.push({
              id: `${ticketTypeId}-${Date.now()}-${i}`,
              ticketTypeId: ticketType.id,
              ticketTypeName: ticketType.name,
              price: ticketType.price,
              promoCode: appliedPromos[ticketTypeId]?.code
            });
          }
        }
      }
    });

    setCartItems([...cartItems, ...newItems]);
    setCurrentStep('cart');
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      setCurrentStep('checkout');
    }
  };

  const handleCompletePayment = async () => {
    // Validate contact details
    if (!contactDetails.fullName.trim()) {
      alert('Please enter your full name');
      return;
    }
    if (!contactDetails.phone.trim()) {
      alert('Please enter your phone number');
      return;
    }
    if (!contactDetails.email.trim() || !contactDetails.email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate payment details
    if (!paymentDetails.cardNumber.trim() || paymentDetails.cardNumber.replace(/\s/g, '').length < 13) {
      alert('Please enter a valid card number');
      return;
    }
    if (!paymentDetails.expiryDate.trim()) {
      alert('Please enter card expiration date');
      return;
    }
    if (!paymentDetails.securityCode.trim() || paymentDetails.securityCode.length < 3) {
      alert('Please enter a valid security code');
      return;
    }

    // Start processing
    setIsProcessingPayment(true);

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate payment processing with 85% success rate
    const isPaymentSuccessful = Math.random() > 0.15;

    setIsProcessingPayment(false);

    if (isPaymentSuccessful) {
      setCurrentStep('success');
    } else {
      setCurrentStep('failed');
    }
  };

  const handleStartOver = () => {
    setCurrentStep('calendar');
    setSelectedDate(null);
    setSelectedTime('');
    setCartItems([]);
    setTicketCounts({});
    setPromoInputs({});
    setShowPromoInput({});
    setAppliedPromos({});
    setShowGiftCardInput(false);
    setAppliedGiftCard(null);
    setContactDetails({
      fullName: '',
      phone: '',
      email: '',
      emailUpdates: false
    });
    setPaymentDetails({
      cardNumber: '',
      expiryDate: '',
      securityCode: '',
      country: 'United States'
    });
  };

  const calendarDays = generateCalendarDays();

  // Dark mode classes
  const isDark = widgetTheme === 'dark';
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  const renderStars = (difficulty: number) => {
    const stars: React.ReactNode[] = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${i < difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
        />
      );
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  };

  const calculateDiscount = () => {
    let discount = 0;
    if (appliedPromoCode) {
      discount += appliedPromoCode.discount;
    }
    return discount;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    const giftCardAmount = appliedGiftCard?.amount || 0;
    return Math.max(0, subtotal - discount - giftCardAmount);
  };

  return (
    <WidgetContainer>
      <div className={`w-full min-h-screen ${bgClass} flex items-center justify-center p-0 sm:p-2 lg:p-4`}>
        <div className={`w-full h-auto max-w-6xl ${cardBgClass} sm:rounded-xl shadow-2xl overflow-hidden flex flex-col min-h-screen sm:min-h-0 sm:my-4`}>
          {/* Header */}
          <div className={`${cardBgClass} border-b ${borderClass} px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0 sticky top-0 z-10 shadow-sm backdrop-blur-sm ${isDark ? 'bg-[#161616]/95' : 'bg-white/95'}`}>
            <div className="flex items-center justify-between gap-2 w-full">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {/* Theme Toggle - Mobile: Icon only, Desktop: Icon + Text */}
                <button
                  onClick={() => setWidgetTheme(prev => prev === 'light' ? 'dark' : 'light')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg sm:rounded-full transition-all hover:shadow-sm active:scale-95 border touch-manipulation min-w-[44px] justify-center ${isDark
                    ? 'bg-[#2a2a2a] border-[#3a3a3a] text-[#a3a3a3] hover:bg-[#333]'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {isDark ? <Sun className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" /> : <Moon className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" />}
                  <span className="hidden sm:inline text-xs sm:text-sm font-medium whitespace-nowrap">{isDark ? 'Light' : 'Dark'}</span>
                </button>

                {activeConfig.showSecuredBadge && (
                  <button
                    onClick={() => setShowSecuredDialog(true)}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg sm:rounded-full transition-all hover:shadow-sm active:scale-95 border touch-manipulation min-w-[44px] ${isDark
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-green-50 hover:bg-green-100 active:bg-green-200 text-green-700 border-green-200'
                      }`}
                  >
                    <Lock className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap hidden xs:inline">Secured</span>
                    <ChevronDown className="w-3 h-3 flex-shrink-0 hidden sm:block" />
                  </button>
                )}
                {activeConfig.showHealthSafety && (
                  <button
                    onClick={() => setShowHealthSafetyDialog(true)}
                    className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg sm:rounded-full transition-all hover:shadow-sm active:scale-95 border touch-manipulation min-w-[44px] ${isDark
                      ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30 text-[#6366f1] hover:bg-[#4f46e5]/20'
                      : ''
                      }`}
                    style={!isDark ? {
                      backgroundColor: `${primaryColor}10`,
                      borderColor: `${primaryColor}30`,
                      color: primaryColor
                    } : undefined}
                  >
                    <Sparkles className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap hidden xs:inline">Safety</span>
                    <ChevronDown className="w-3 h-3 flex-shrink-0 hidden sm:block" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  if (cartItems.length > 0 && currentStep !== 'success' && currentStep !== 'failed') {
                    setShowExitDialog(true);
                  } else {
                    handleStartOver();
                  }
                }}
                className={`transition-colors p-2.5 active:scale-90 touch-manipulation rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center ${isDark ? 'text-[#737373] hover:text-[#a3a3a3] hover:bg-[#1e1e1e]' : 'text-gray-400 hover:text-gray-600 active:text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>

          {/* Navigation Bar */}
          {(currentStep !== 'success' && currentStep !== 'failed') && (
            <div className={`${cardBgClass} px-3 sm:px-6 py-3 sm:py-4 border-b ${borderClass} flex-shrink-0 sticky top-[57px] sm:top-[65px] z-10 shadow-sm backdrop-blur-sm ${isDark ? 'bg-[#161616]/95' : 'bg-white/95'}`}>
              <div className="flex items-center justify-between">
                {/* Back Button - Mobile: Icon only, Desktop: Icon + Text */}
                {currentStep !== 'calendar' && (
                  <button
                    onClick={handleBack}
                    className={`flex items-center gap-1.5 sm:gap-2 transition-colors active:scale-95 p-2.5 sm:p-2 rounded-lg ${hoverBgClass} touch-manipulation min-w-[44px] min-h-[44px] ${isDark ? 'text-[#a3a3a3] hover:text-[#6366f1]' : 'text-gray-700 hover:text-blue-600 active:text-blue-700 active:bg-gray-100'
                      }`}
                  >
                    <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm sm:text-base hidden sm:inline">Back</span>
                  </button>
                )}

                {/* Cart Badge */}
                {cartItems.length > 0 && currentStep !== 'cart' && currentStep !== 'checkout' && (
                  <button
                    onClick={() => setCurrentStep('cart')}
                    className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isDark
                      ? 'bg-[#4f46e5] hover:bg-[#4338ca] text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm font-medium">{cartItems.length}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Main Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {/* Calendar View */}
            {currentStep === 'calendar' && (
              <div className="p-3 sm:p-4 md:p-10 pb-20 sm:pb-10">
                {/* Event Hero */}
                <div className="relative rounded-lg sm:rounded-xl overflow-hidden mb-4 sm:mb-6 md:mb-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="aspect-[16/9] sm:aspect-[21/9] relative">
                    <ImageWithFallback
                      src={activeEvent.image}
                      alt={activeEvent.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-8">
                      <h2 className="text-white text-lg sm:text-xl md:text-4xl mb-1 sm:mb-2 leading-tight">{activeEvent.name}</h2>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 md:gap-2 text-white text-xs">
                        <span className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-2 sm:px-2.5 py-0.5">
                          {activeEvent.priceRange}
                        </span>
                        <span className="hidden sm:inline text-xs sm:text-sm">{activeEvent.ageRange}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-xs sm:text-sm">{activeEvent.duration}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="hidden md:flex items-center gap-1 text-xs sm:text-sm">
                          Difficulty: {renderStars(activeEvent.difficulty)}
                        </span>
                      </div>
                      {activeEvent.description && (
                        <p className="text-white/90 mt-1 sm:mt-2 max-w-2xl text-xs sm:text-sm hidden sm:block">{activeEvent.description}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Month/Year Navigation */}
                <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button
                    onClick={goToPreviousMonth}
                    className={`p-2.5 sm:p-2 md:p-3 rounded-lg transition-colors active:scale-95 touch-manipulation flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center ${isDark ? 'hover:bg-[#1e1e1e] active:bg-[#2a2a2a]' : 'hover:bg-gray-100 active:bg-gray-200'
                      }`}
                    aria-label="Previous month"
                  >
                    <ChevronLeft className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`} />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-1 px-2">
                    <h3 className={`text-base sm:text-lg md:text-2xl ${textClass} font-semibold`}>
                      {months[selectedMonth]}
                    </h3>
                    <span className={`text-base sm:text-lg md:text-2xl ${isDark ? 'text-[#737373]' : 'text-gray-400'}`}>▾</span>
                    <h3 className={`text-base sm:text-lg md:text-2xl ${textClass} font-semibold`}>
                      {selectedYear}
                    </h3>
                    <span className={`text-base sm:text-lg md:text-2xl ${isDark ? 'text-[#737373]' : 'text-gray-400'}`}>▾</span>
                  </div>

                  <button
                    onClick={goToNextMonth}
                    className={`p-2.5 sm:p-2 md:p-3 rounded-lg transition-colors active:scale-95 touch-manipulation flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center ${isDark ? 'hover:bg-[#1e1e1e] active:bg-[#2a2a2a]' : 'hover:bg-gray-100 active:bg-gray-200'
                      }`}
                    aria-label="Next month"
                  >
                    <ChevronRight className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`} />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                  {/* Week Day Headers */}
                  <div className="grid grid-cols-7 mb-3 sm:mb-4">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
                      <div
                        key={day}
                        className={`text-center text-xs sm:text-sm py-2 font-semibold uppercase tracking-wide ${textMutedClass}`}
                      >
                        <span className="hidden sm:inline">{weekDays[idx].slice(0, 3)}</span>
                        <span className="sm:hidden">{day}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {calendarDays.map((day, idx) => {
                      const isAvailable = day.isCurrentMonth && day.slots > 0;
                      const isSelected = selectedDate &&
                        day.date === selectedDate.getDate() &&
                        day.month === selectedDate.getMonth() &&
                        day.year === selectedDate.getFullYear();

                      return (
                        <button
                          key={idx}
                          onClick={() => handleDateSelect(day)}
                          disabled={!isAvailable}
                          className={`
                          aspect-square p-1 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-200 flex flex-col items-center justify-center
                          ${!day.isCurrentMonth ? (isDark ? 'text-[#2a2a2a]' : 'text-gray-300') : ''}
                          ${isAvailable
                              ? `cursor-pointer ${isDark ? 'hover:bg-[#1e1e1e] active:bg-[#2a2a2a]' : 'hover:bg-gray-100 active:bg-gray-200'}`
                              : 'cursor-not-allowed opacity-40'
                            }
                          ${isSelected
                              ? isDark
                                ? 'bg-[#4f46e5] text-white'
                                : 'bg-blue-600 text-white'
                              : isDark ? 'text-white' : 'text-gray-900'
                            }
                          touch-manipulation
                        `}
                        >
                          <span className={`text-sm sm:text-base font-medium ${isSelected ? 'text-white' : ''}`}>
                            {day.date}
                          </span>
                          {day.isCurrentMonth && day.slots > 0 && (
                            <span className={`text-[10px] sm:text-xs ${isSelected ? 'text-white/80' : isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
                              {day.slots} slots
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Helper Text */}
                <p className={`text-center text-xs sm:text-sm ${textMutedClass} animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200`}>
                  Click a date to browse availability
                </p>
              </div>
            )}

            {/* Time Slot Selection */}
            {currentStep === 'timeslot' && selectedDate && (
              <div className="p-3 sm:p-4 md:p-10 pb-20 sm:pb-10">
                <div className="mb-4 sm:mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className={`text-xl sm:text-2xl md:text-3xl ${textClass} mb-1.5 sm:mb-2`}>
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h2>
                  <p className={`text-sm sm:text-base ${textMutedClass}`}>Select your preferred time</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  {timeSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                      className={`
                      p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-200 border-2
                      ${slot.available
                          ? isDark
                            ? 'border-[#2a2a2a] hover:border-[#4f46e5] hover:bg-[#1e1e1e] active:bg-[#2a2a2a]'
                            : 'border-gray-200 hover:border-blue-600 hover:bg-blue-50 active:bg-blue-100'
                          : isDark
                            ? 'border-[#2a2a2a] opacity-40 cursor-not-allowed'
                            : 'border-gray-200 opacity-40 cursor-not-allowed'
                        }
                      ${selectedTime === slot.time
                          ? isDark
                            ? 'border-[#4f46e5] bg-[#4f46e5]/10'
                            : 'border-blue-600 bg-blue-50'
                          : ''
                        }
                      animate-in fade-in slide-in-from-bottom-4 duration-500
                      touch-manipulation
                    `}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Clock className={`w-4 h-4 ${slot.available ? (isDark ? 'text-[#a3a3a3]' : 'text-gray-600') : (isDark ? 'text-[#2a2a2a]' : 'text-gray-400')}`} />
                        <span className={`text-sm sm:text-base font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {slot.time}
                        </span>
                      </div>
                      {!slot.available && (
                        <p className={`text-xs mt-1 ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>Sold out</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Ticket Selection (Plan Step) */}
            {currentStep === 'plan' && (
              <div className="p-3 sm:p-4 md:p-10 pb-20 sm:pb-10">
                <div className="mb-4 sm:mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className={`text-xl sm:text-2xl md:text-3xl ${textClass} mb-1.5 sm:mb-2`}>Select Tickets</h2>
                  <p className={`text-sm sm:text-base ${textMutedClass}`}>
                    {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
                  </p>
                </div>

                <div className="space-y-3 sm:space-y-4 md:space-y-6">
                  {ticketTypes.map((ticket, idx) => {
                    const count = ticketCounts[ticket.id] || 0;
                    const hasPromo = appliedPromos[ticket.id];
                    const finalPrice = hasPromo ? ticket.price - hasPromo.discount : ticket.price;

                    return (
                      <div
                        key={ticket.id}
                        className={`${cardBgClass} border ${borderClass} rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base sm:text-lg ${textClass} mb-1`}>{ticket.name}</h3>
                            <p className={`text-xs sm:text-sm ${textMutedClass}`}>{ticket.description}</p>
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className={`text-lg sm:text-xl md:text-2xl ${textClass} font-semibold`}>
                                ${finalPrice.toFixed(2)}
                              </span>
                              {hasPromo && (
                                <span className="text-sm text-gray-400 line-through">
                                  ${ticket.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                            <button
                              onClick={() => setTicketCounts(prev => ({ ...prev, [ticket.id]: Math.max(0, (prev[ticket.id] || 0) - 1) }))}
                              disabled={count === 0}
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors touch-manipulation ${count === 0
                                ? isDark ? 'bg-[#1e1e1e] text-[#2a2a2a] cursor-not-allowed' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                : isDark ? 'bg-[#1e1e1e] text-white hover:bg-[#2a2a2a]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                }`}
                            >
                              <Minus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <span className={`text-lg sm:text-xl font-semibold min-w-[2rem] sm:min-w-[3rem] text-center ${textClass}`}>
                              {count}
                            </span>
                            <button
                              onClick={() => setTicketCounts(prev => ({ ...prev, [ticket.id]: (prev[ticket.id] || 0) + 1 }))}
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors touch-manipulation ${isDark
                                ? 'bg-[#4f46e5] text-white hover:bg-[#4338ca]'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Promo Code Section */}
                        {count > 0 && (
                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t" style={{ borderColor: isDark ? '#2a2a2a' : '#e5e7eb' }}>
                            {!hasPromo ? (
                              <button
                                onClick={() => setShowPromoInput(prev => ({ ...prev, [ticket.id]: !prev[ticket.id] }))}
                                className={`text-xs sm:text-sm ${isDark ? 'text-[#4f46e5]' : 'text-blue-600'} hover:underline`}
                              >
                                Have a promo code?
                              </button>
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                                  Promo code "{hasPromo.code}" applied (-${hasPromo.discount})
                                </span>
                                <button
                                  onClick={() => {
                                    const newPromos = { ...appliedPromos };
                                    delete newPromos[ticket.id];
                                    setAppliedPromos(newPromos);
                                  }}
                                  className="text-xs sm:text-sm text-red-600 dark:text-red-400 hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            )}

                            {showPromoInput[ticket.id] && !hasPromo && (
                              <div className="mt-2 flex gap-2">
                                <Input
                                  placeholder="Enter code"
                                  className="h-10 sm:h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                                  value={promoInputs[ticket.id] || ''}
                                  onChange={(e) => setPromoInputs(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                />
                                <Button
                                  onClick={() => {
                                    const code = promoInputs[ticket.id];
                                    if (code) {
                                      setAppliedPromos(prev => ({ ...prev, [ticket.id]: { code, discount: 5 } }));
                                      setShowPromoInput(prev => ({ ...prev, [ticket.id]: false }));
                                    }
                                  }}
                                  className="h-10 sm:h-12 px-4"
                                  style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor }}
                                >
                                  Apply
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Continue Button */}
                <div className="mt-6 sm:mt-8">
                  <Button
                    onClick={handleAddToCart}
                    disabled={Object.values(ticketCounts).reduce((sum, count) => sum + count, 0) === 0}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
                    style={{
                      backgroundColor: isDark ? '#4f46e5' : primaryColor,
                      opacity: Object.values(ticketCounts).reduce((sum, count) => sum + count, 0) === 0 ? 0.5 : 1
                    }}
                  >
                    Continue to Cart
                  </Button>
                </div>
              </div>
            )}

            {/* Cart View */}
            {currentStep === 'cart' && (
              <div className="p-3 sm:p-4 md:p-10 pb-20 sm:pb-10">
                <div className="mb-4 sm:mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className={`text-xl sm:text-2xl md:text-3xl ${textClass} mb-1.5 sm:mb-2`}>Your Cart</h2>
                  <p className={`text-sm sm:text-base ${textMutedClass}`}>Review your booking details</p>
                </div>

                {/* Cart Items */}
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {cartItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`${cardBgClass} border ${borderClass} rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500`}
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm sm:text-base ${textClass} mb-0.5`}>{item.ticketTypeName}</h4>
                        <p className={`text-xs sm:text-sm ${textMutedClass}`}>
                          {selectedDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedTime}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                        <span className={`text-base sm:text-lg font-semibold ${textClass}`}>
                          ${item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => setCartItems(cartItems.filter(i => i.id !== item.id))}
                          className={`p-2 rounded-lg transition-colors touch-manipulation ${isDark ? 'hover:bg-[#1e1e1e] text-red-400' : 'hover:bg-gray-100 text-red-600'
                            }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 space-y-3 sm:space-y-4 mb-6 sm:mb-8 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : ''}`}>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className={textMutedClass}>Subtotal</span>
                    <span className={textClass}>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                      <span>Discount</span>
                      <span>-${calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  {appliedGiftCard && (
                    <div className="flex justify-between text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                      <span>Gift Card</span>
                      <span>-${appliedGiftCard.amount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator className={isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'} />
                  <div className="flex justify-between text-base sm:text-lg">
                    <span className={`${textClass} font-semibold`}>Total</span>
                    <span className={`${textClass} font-semibold text-lg sm:text-xl`}>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
                  style={{
                    backgroundColor: isDark ? '#4f46e5' : primaryColor,
                    opacity: cartItems.length === 0 ? 0.5 : 1
                  }}
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}

            {/* Checkout View */}
            {currentStep === 'checkout' && (
              <div className="p-3 sm:p-4 md:p-10 pb-20 sm:pb-10">
                <div className="mb-4 sm:mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className={`text-xl sm:text-2xl md:text-3xl ${textClass} mb-1.5 sm:mb-2`}>Complete Booking</h2>
                  <p className={`text-sm sm:text-base ${textMutedClass}`}>Enter your details to confirm</p>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  {/* Contact Information */}
                  <div className={`${cardBgClass} border ${borderClass} rounded-lg sm:rounded-xl p-4 sm:p-6`}>
                    <h3 className={`text-base sm:text-lg ${textClass} mb-4 flex items-center gap-2`}>
                      <User className="w-5 h-5" />
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-700 dark:text-[#a3a3a3]">Full Name</Label>
                        <Input
                          placeholder="John Doe"
                          className="h-12 bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-[#2a2a2a] placeholder:text-gray-500"
                          value={contactDetails.fullName}
                          onChange={(e) => setContactDetails({ ...contactDetails, fullName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 dark:text-[#a3a3a3]">Phone Number</Label>
                        <Input
                          placeholder="(555) 123-4567"
                          className="h-12 bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-[#2a2a2a] placeholder:text-gray-500"
                          value={contactDetails.phone}
                          onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-gray-700 dark:text-[#a3a3a3]">Email</Label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          className="h-12 bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-[#2a2a2a] placeholder:text-gray-500"
                          value={contactDetails.email}
                          onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className={`${cardBgClass} border ${borderClass} rounded-lg sm:rounded-xl p-4 sm:p-6`}>
                    <h3 className={`text-base sm:text-lg ${textClass} mb-4 flex items-center gap-2`}>
                      <CreditCard className="w-5 h-5" />
                      Payment Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-700 dark:text-[#a3a3a3]">Card Number</Label>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          className="h-12 bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-[#2a2a2a] placeholder:text-gray-500"
                          value={paymentDetails.cardNumber}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-700 dark:text-[#a3a3a3]">Expiry Date</Label>
                          <Input
                            placeholder="MM/YY"
                            className="h-12 bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-[#2a2a2a] placeholder:text-gray-500"
                            value={paymentDetails.expiryDate}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-gray-700 dark:text-[#a3a3a3]">CVV</Label>
                          <Input
                            placeholder="123"
                            className="h-12 bg-gray-100 dark:bg-[#1e1e1e] border-gray-300 dark:border-[#2a2a2a] placeholder:text-gray-500"
                            value={paymentDetails.securityCode}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, securityCode: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : ''}`}>
                    <h3 className={`text-base sm:text-lg ${textClass} mb-4`}>Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span className={textMutedClass}>Subtotal</span>
                        <span className={textClass}>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <Separator className={isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'} />
                      <div className="flex justify-between text-base sm:text-lg">
                        <span className={`${textClass} font-semibold`}>Total</span>
                        <span className={`${textClass} font-semibold text-lg sm:text-xl`}>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Complete Payment Button */}
                  <Button
                    onClick={handleCompletePayment}
                    disabled={isProcessingPayment}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
                    style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor }}
                  >
                    {isProcessingPayment ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </div>
                    ) : (
                      'Complete Payment'
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Success View */}
            {currentStep === 'success' && (
              <div className="p-3 sm:p-4 md:p-10 pb-20 sm:pb-10 flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md animate-in fade-in zoom-in duration-500">
                  <div className="mb-6 sm:mb-8 flex justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <h2 className={`text-2xl sm:text-3xl md:text-4xl ${textClass} mb-3 sm:mb-4`}>Booking Confirmed!</h2>
                  <p className={`text-sm sm:text-base ${textMutedClass} mb-6 sm:mb-8`}>
                    Your booking has been successfully confirmed. A confirmation email has been sent to {contactDetails.email}
                  </p>
                  <Button
                    onClick={handleStartOver}
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
                    style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor }}
                  >
                    Book Another Experience
                  </Button>
                </div>
              </div>
            )}

            {/* Failed View */}
            {currentStep === 'failed' && (
              <div className="p-3 sm:p-4 md:p-10 pb-20 sm:pb-10 flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md animate-in fade-in zoom-in duration-500">
                  <div className="mb-6 sm:mb-8 flex justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                      <X className="w-10 h-10 sm:w-12 sm:h-12 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <h2 className={`text-2xl sm:text-3xl md:text-4xl ${textClass} mb-3 sm:mb-4`}>Payment Failed</h2>
                  <p className={`text-sm sm:text-base ${textMutedClass} mb-6 sm:mb-8`}>
                    We couldn't process your payment. Please check your payment details and try again.
                  </p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setCurrentStep('checkout')}
                      className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold"
                      style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor }}
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={handleStartOver}
                      variant="outline"
                      className={`w-full h-12 sm:h-14 text-base sm:text-lg ${isDark
                        ? 'border-[#2a2a2a] text-[#a3a3a3] hover:bg-[#1e1e1e]'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      Start Over
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
          <AlertDialogHeader>
            <AlertDialogTitle className={textClass}>Leave booking process?</AlertDialogTitle>
            <AlertDialogDescription className={textMutedClass}>
              You have items in your cart. Are you sure you want to exit? Your progress will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={isDark ? 'bg-[#161616] text-[#a3a3a3] border-[#2a2a2a]' : ''}>
              Continue Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowExitDialog(false);
                handleStartOver();
              }}
              style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor }}
            >
              Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Secured Badge Dialog */}
      <Dialog open={showSecuredDialog} onOpenChange={setShowSecuredDialog}>
        <DialogContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
          <DialogHeader>
            <DialogTitle className={`${textClass} flex items-center gap-2`}>
              <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Secured Checkout
            </DialogTitle>
            <DialogDescription className={textMutedClass}>
              Your payment information is protected with industry-standard 256-bit SSL encryption. We never store your full credit card details.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Health & Safety Dialog */}
      <Dialog open={showHealthSafetyDialog} onOpenChange={setShowHealthSafetyDialog}>
        <DialogContent className={isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-white border-gray-200'}>
          <DialogHeader>
            <DialogTitle className={`${textClass} flex items-center gap-2`}>
              <Sparkles className="w-5 h-5" style={{ color: isDark ? '#6366f1' : primaryColor }} />
              Health & Safety
            </DialogTitle>
            <DialogDescription className={textMutedClass}>
              We follow enhanced cleaning protocols and maintain social distancing guidelines. All staff members are fully trained in health and safety procedures.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </WidgetContainer>
  );
}
