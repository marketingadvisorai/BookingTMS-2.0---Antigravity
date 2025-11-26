import React, { useState, useEffect } from 'react';
import { X, Lock, Heart, ChevronDown, ChevronLeft, ChevronRight, Home, Star, Info, CreditCard, CheckCircle2, Users, Calendar as CalendarIcon, Clock, Trash2, Plus, Minus, ShoppingCart, ArrowLeft, ArrowRight, Gift, Shield, Sparkles, CheckCircle, Moon, Sun } from 'lucide-react';
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
import GiftVoucherWidget from './GiftVoucherWidget';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { DataSyncServiceWithEvents, DataSyncEvents } from '../../services/DataSyncService';

interface FareBookWidgetProps {
  primaryColor?: string;
  config?: WidgetConfig;
  theme?: 'light' | 'dark';
}

interface WidgetConfig {
  showSecuredBadge?: boolean;
  showHealthSafety?: boolean;
  enableVeteranDiscount?: boolean;
  ticketTypes?: TicketType[];
  categories?: Category[];
  activities?: Activity[];
  additionalQuestions?: AdditionalQuestion[];
  cancellationPolicy?: string;
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

interface Category {
  id: string;
  name: string;
  image: string;
}

interface Activity {
  id: string;
  name: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  coverImage?: string;
  duration: string | number;
  capacity: number;
  basePrice: number;
  priceRange?: string;
  ageRange?: string;
  difficulty: number | string;
  categoryId?: string;
  availability: {
    [date: string]: {
      time: string;
      available: boolean;
      spots: number;
    }[];
  };
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

export default function FareBookWidget({ primaryColor = '#0ea5e9', config, theme: initialTheme = 'light' }: FareBookWidgetProps) {
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>(initialTheme);
  const [currentStep, setCurrentStep] = useState<'categories' | 'activities' | 'calendar' | 'timeslot' | 'plan' | 'cart' | 'checkout' | 'success' | 'failed'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [language, setLanguage] = useState('English (US)');

  // Month and year options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 3 }, (_, i) => 2025 + i); // 2025, 2026, 2027

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [ticketCounts, setTicketCounts] = useState<{ [key: string]: number }>({});
  const [promoCode, setPromoCode] = useState('');

  // Promo code state - track per ticket type
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
  const [appliedPromoCode, setAppliedPromoCode] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null);

  // Simple input states for lite checkout
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [giftCardInput, setGiftCardInput] = useState('');

  // Dialog state for badges
  const [showSecuredDialog, setShowSecuredDialog] = useState(false);
  const [showHealthSafetyDialog, setShowHealthSafetyDialog] = useState(false);
  const [showGiftVouchersDialog, setShowGiftVouchersDialog] = useState(false);
  const [showGiftVoucherWidget, setShowGiftVoucherWidget] = useState(false);

  // Admin activities state for dynamic data
  const [adminActivities, setAdminActivities] = useState<Activity[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  // Helper function to get time slots for a specific date
  const getTimeSlotsForDate = (date: Date): TimeSlot[] => {
    if (!selectedActivity) return [];

    const dateKey = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    return DataSyncServiceWithEvents.getAvailableTimeSlots(selectedActivity.id, dateKey);
  };

  // Load admin activities on component mount
  useEffect(() => {
    const loadAdminActivities = async () => {
      try {
        setIsLoadingActivities(true);
        const activities = await DataSyncServiceWithEvents.getAllActivities();
        if (activities && activities.length > 0) {
          setAdminActivities(activities);
        } else {
          setAdminActivities([]);
        }
      } catch (error) {
        console.error('Error loading admin activities:', error);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    loadAdminActivities();

    // Subscribe to activities updates
    const activitiesUpdatedCallback = () => {
      const updatedActivities = DataSyncServiceWithEvents.getAllActivities();
      setAdminActivities(updatedActivities || []);
    };

    DataSyncEvents.subscribe('activities-updated', activitiesUpdatedCallback);

    const unsubscribe = () => {
      DataSyncEvents.unsubscribe('activities-updated', activitiesUpdatedCallback);
    };

    return () => {
      unsubscribe();
    };
  }, []);

  // Load calendar days when activity or date changes
  useEffect(() => {
    const loadCalendarDays = async () => {
      if (selectedActivity && currentStep === 'calendar') {
        setIsLoadingCalendar(true);
        try {
          const days = await generateCalendarDays();
          setCalendarDays(days);
        } catch (error) {
          console.error('Error loading calendar days:', error);
        } finally {
          setIsLoadingCalendar(false);
        }
      }
    };

    loadCalendarDays();
  }, [selectedActivity, selectedMonth, selectedYear, currentStep]);

  // Default configuration
  const defaultConfig: WidgetConfig = {
    showSecuredBadge: true,
    showHealthSafety: true,
    enableVeteranDiscount: true,
    ticketTypes: [
      { id: 'player', name: 'Players', description: 'Ages 6 & Up', price: 30 },
      { id: 'veteran', name: 'Veterans', description: 'Must show military ID', price: 25 }
    ],
    categories: [
      {
        id: '1',
        name: 'Traditional Escape Rooms',
        image: 'https://images.unsplash.com/photo-1569002925653-ed18f55d7292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc2NhcGUlMjByb29tJTIwZGFyayUyMG15c3RlcmlvdXN8ZW58MXx8fHwxNzYxOTM1ODcyfDA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      {
        id: '2',
        name: 'Printable Escape Rooms',
        image: 'https://images.unsplash.com/photo-1632387958032-3b563a92091f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwcGhvdG9ncmFwaGxzJTIwcG9sYXJvaWR8ZW58MXx8fDE3NjE5MzU4NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080'
      }
    ],
    activities: [
      {
        id: '1',
        name: 'Zombie Apocalypse',
        image: 'https://images.unsplash.com/photo-1659059530318-656a112ad2cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx6b21iaWUlMjBhcG9jYWx5cHNlJTIwaG9ycm9yfGVufDF8fHx8MTc2MTg5OTYzNHww&ixlib=rb-4.1.0&q=80&w=1080',
        priceRange: '$25 - $30',
        ageRange: 'Ages 6+',
        duration: '1 Hour',
        difficulty: 5,
        categoryId: '1',
        description: 'Can you survive the zombie apocalypse and find the cure?',
        capacity: 10,
        basePrice: 25,
        availability: {}
      },
      {
        id: '2',
        name: 'Area 51',
        image: 'https://images.unsplash.com/photo-1569002925653-ed18f55d7292?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc2NhcGUlMjByb29tJTIwZGFyayUyMG15c3RlcmlvdXN8ZW58MXx8fDE3NjE5MzU4NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        priceRange: '$25 - $30',
        ageRange: 'All ages',
        duration: '1 Hour',
        difficulty: 5,
        categoryId: '1',
        capacity: 10,
        basePrice: 25,
        availability: {}
      },
      {
        id: '3',
        name: 'Catacombs',
        image: 'https://images.unsplash.com/photo-1637481687365-9b133c567071?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXRhY29tYnMlMjB1bmRlcmdyb3VuZCUyMHR1bm5lbHxlbnwxfHx8fDE3NjE5MzU4NzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
        priceRange: '$25 - $30',
        ageRange: 'All ages',
        duration: '1 Hour',
        difficulty: 2,
        categoryId: '1',
        capacity: 10,
        basePrice: 25,
        availability: {}
      },
      {
        id: '4',
        name: 'Murder Mystery',
        image: 'https://images.unsplash.com/photo-1636056471685-1cfdfa9d2e4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXJkZXIlMjBteXN0ZXJ5JTIwZGV0ZWN0aXZlfGVufDF8fHx8MTc2MTkzNTg3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
        priceRange: '$25 - $30',
        ageRange: 'Ages 6+',
        duration: '1 Hour',
        difficulty: 5,
        categoryId: '1',
        capacity: 10,
        basePrice: 25,
        availability: {}
      },
      {
        id: '5',
        name: "The Jolly Roger, Curse of the Devil's Shroud",
        image: 'https://images.unsplash.com/photo-1561625116-df74735458a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxwaXJhdGUlMjBzaGlwJTIwd3JlY2t8ZW58MXx8fHwxNzYxOTM1ODc0fDA&ixlib=rb-4.1.0&q=80&w=1080',
        priceRange: '$25 - $30',
        ageRange: 'Ages 6+',
        duration: '1 Hour',
        difficulty: 0,
        categoryId: '1',
        capacity: 10,
        basePrice: 25,
        availability: {}
      }
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
  const categories = activeConfig.categories || [];

  // Use config activities if provided (e.g. from Embed page), otherwise fall back to admin/local activities, then defaults
  const activities = config?.activities && config.activities.length > 0
    ? config.activities
    : (adminActivities.length > 0 ? adminActivities : activeConfig.activities || []);
  const ticketTypes = activeConfig.ticketTypes || [];

  // Generate calendar days with real availability data
  const generateCalendarDays = async () => {
    const days: Array<{
      date: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      slots: Array<{
        time: string;
        activityName: string;
        activityId: string;
        available: boolean;
      }>;
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
        slots: []
      });
    }

    // Add days from current month with real availability
    for (let i = 1; i <= daysInMonth; i++) {
      const slots: Array<{
        time: string;
        activityName: string;
        activityId: string;
        available: boolean;
      }> = [];

      if (selectedActivity) {
        try {
          const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
          const availableSlots = await DataSyncServiceWithEvents.getAvailableTimeSlots(selectedActivity.id, dateStr);

          // Convert TimeSlot objects to the format expected by the calendar
          availableSlots.forEach(slot => {
            if (slot.available) {
              slots.push({
                time: slot.time,
                activityName: selectedActivity.name,
                activityId: selectedActivity.id,
                available: true
              });
            }
          });
        } catch (error) {
          console.error(`Error loading availability for ${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}:`, error);
          // Fall back to empty slots if there's an error
        }
      }

      days.push({
        date: i,
        month: selectedMonth,
        year: selectedYear,
        isCurrentMonth: true,
        slots
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    const nextMonth = selectedMonth === 11 ? 0 : selectedMonth + 1;
    const nextYear = selectedMonth === 11 ? selectedYear + 1 : selectedYear;

    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        slots: []
      });
    }

    return days;
  };

  // Navigation functions
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

  const renderStars = (difficulty: number | string) => {
    const numericDifficulty = typeof difficulty === 'string' ? parseInt(difficulty) || 0 : difficulty;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${star <= numericDifficulty ? 'fill-current text-gray-900' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCurrentStep('activities');
  };

  const handleActivitySelect = (activity: Activity) => {
    setSelectedActivity(activity);
    setCurrentStep('calendar');
  };

  const handleDateSelect = (day: any) => {
    const date = new Date(day.year, day.month, day.date);
    setSelectedDate(date);
    setCurrentStep('timeslot');
  };

  const handleTimeSlotSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('plan');
  };

  // Navigation handlers
  const handleBack = () => {
    switch (currentStep) {
      case 'activities':
        setCurrentStep('categories');
        setSelectedCategory(null);
        break;
      case 'calendar':
        setCurrentStep('activities');
        setSelectedActivity(null);
        break;
      case 'timeslot':
        setCurrentStep('calendar');
        setSelectedDate(null);
        break;
      case 'plan':
        setCurrentStep('timeslot');
        setSelectedTime('');
        break;
      case 'cart':
        setCurrentStep('plan');
        break;
      case 'checkout':
        setCurrentStep('cart');
        break;
      default:
        break;
    }
  };

  const handleBackToCategories = () => {
    setCurrentStep('categories');
    setSelectedCategory(null);
    setSelectedActivity(null);
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleBackToActivities = () => {
    setCurrentStep('activities');
    setSelectedActivity(null);
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleBackToCalendar = () => {
    setCurrentStep('calendar');
    setSelectedDate(null);
    setSelectedTime('');
  };

  const handleBackToTimeslot = () => {
    setCurrentStep('timeslot');
    setSelectedTime('');
  };

  const handleBackToCart = () => {
    setCurrentStep('cart');
  };

  const formatSelectedDateTime = () => {
    if (!selectedDate || !selectedTime) return 'Select a date and time';

    try {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = dayNames[selectedDate.getDay()];
      const monthName = months[selectedDate.getMonth()];
      const date = selectedDate.getDate();
      const year = selectedDate.getFullYear();

      // Parse time and create end time (assuming 1 hour duration)
      const [timeStr, period] = selectedTime.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      let endHours = hours + 1;
      let endPeriod = period;

      if (endHours === 12) {
        endPeriod = period === 'AM' ? 'PM' : 'AM';
      } else if (endHours > 12) {
        endHours = endHours - 12;
        endPeriod = 'PM';
      }

      const formattedMinutes = minutes === 0 ? '00' : minutes.toString().padStart(2, '0');

      return `${dayOfWeek}, ${monthName} ${date}, ${year} at ${selectedTime} – ${endHours}:${formattedMinutes} ${endPeriod}`;
    } catch (error) {
      return 'Invalid date or time';
    }
  };

  const handleUpdateTicketCount = (ticketTypeId: string, change: number) => {
    setTicketCounts(prev => ({
      ...prev,
      [ticketTypeId]: Math.max(0, (prev[ticketTypeId] || 0) + change)
    }));
  };

  const handleAddToCart = () => {
    const items: CartItem[] = [];
    Object.entries(ticketCounts).forEach(([ticketTypeId, count]) => {
      const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
      if (ticketType && count > 0) {
        for (let i = 0; i < count; i++) {
          items.push({
            id: `${ticketTypeId}-${Date.now()}-${i}`,
            ticketTypeId,
            ticketTypeName: ticketType.name,
            price: ticketType.price
          });
        }
      }
    });
    setCartItems(items);
    setCurrentStep('cart');
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleApplyPromo = (ticketTypeId: string) => {
    const code = promoInputs[ticketTypeId]?.toUpperCase() || '';

    // Promo codes specific to ticket types
    const promoCodes: { [key: string]: { code: string; discount: number; applicableTypes: string[] }[] } = {
      veteran: [
        { code: 'VETERAN15', discount: 0.15, applicableTypes: ['veteran'] },
        { code: 'VETERAN25', discount: 0.25, applicableTypes: ['veteran'] },
        { code: 'THANKYOU10', discount: 0.10, applicableTypes: ['veteran'] }
      ],
      player: [
        { code: 'SAVE10', discount: 0.10, applicableTypes: ['player'] },
        { code: 'WELCOME20', discount: 0.20, applicableTypes: ['player'] }
      ]
    };

    const allPromos = Object.values(promoCodes).flat();
    const promoConfig = allPromos.find(p => p.code === code && p.applicableTypes.includes(ticketTypeId));

    if (promoConfig) {
      setAppliedPromos(prev => ({
        ...prev,
        [ticketTypeId]: { code: promoConfig.code, discount: promoConfig.discount }
      }));
      setShowPromoInput(prev => ({ ...prev, [ticketTypeId]: false }));
    } else {
      alert('Invalid promo code for this ticket type');
    }
  };

  const handleRemovePromo = (ticketTypeId: string) => {
    setAppliedPromos(prev => {
      const newPromos = { ...prev };
      delete newPromos[ticketTypeId];
      return newPromos;
    });
    setPromoInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[ticketTypeId];
      return newInputs;
    });
  };

  const handleApplyGiftCard = (code: string, amount: number) => {
    setAppliedGiftCard({ code, amount });
    setShowGiftCardInput(false);
  };

  const handleRemoveGiftCard = () => {
    setAppliedGiftCard(null);
  };

  const handleApplyPromoCode = (code: string, discount: number, type: 'percentage' | 'fixed') => {
    setAppliedPromoCode({ code, discount, type });
    setShowPromoCodeInput(false);
  };

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price, 0);
  };

  const calculateDiscountForTicketType = (ticketTypeId: string) => {
    const promo = appliedPromos[ticketTypeId];
    if (!promo) return 0;

    const ticketTotal = cartItems
      .filter(item => item.ticketTypeId === ticketTypeId)
      .reduce((sum, item) => sum + item.price, 0);

    return ticketTotal * promo.discount;
  };

  const calculateTotalDiscount = () => {
    let total = 0;
    // Per-ticket-type discounts
    Object.keys(appliedPromos).forEach(ticketTypeId => {
      total += calculateDiscountForTicketType(ticketTypeId);
    });
    // Checkout-level promo code discount
    if (appliedPromoCode) {
      total += appliedPromoCode.type === 'fixed'
        ? appliedPromoCode.discount
        : (calculateSubtotal() * appliedPromoCode.discount) / 100;
    }
    return total;
  };

  const calculateFees = () => {
    return (calculateSubtotal() - calculateTotalDiscount()) * 0.06; // 6% fees
  };

  const calculateGiftCardDiscount = () => {
    if (!appliedGiftCard) return 0;
    // Gift card applies to total after promo codes and fees
    const totalBeforeGiftCard = calculateSubtotal() - calculateTotalDiscount() + calculateFees();
    // Use the lesser of gift card balance or total amount
    return Math.min(appliedGiftCard.amount, totalBeforeGiftCard);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateTotalDiscount() + calculateFees() - calculateGiftCardDiscount();
  };

  const getTotalTicketsByType = () => {
    const counts: { [key: string]: number } = {};
    cartItems.forEach(item => {
      counts[item.ticketTypeName] = (counts[item.ticketTypeName] || 0) + 1;
    });
    return counts;
  };

  const getGroupedCartItems = () => {
    const grouped: { [ticketTypeId: string]: { ticketType: string; items: CartItem[]; price: number } } = {};
    cartItems.forEach(item => {
      if (!grouped[item.ticketTypeId]) {
        grouped[item.ticketTypeId] = {
          ticketType: item.ticketTypeName,
          items: [],
          price: item.price
        };
      }
      grouped[item.ticketTypeId].items.push(item);
    });
    return grouped;
  };

  const handleBackToPlan = () => {
    setCurrentStep('plan');
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      setCurrentStep('checkout');
    }
  };

  const isCheckoutFormComplete = () => {
    return (
      contactDetails.fullName.trim() !== '' &&
      contactDetails.phone.trim() !== '' &&
      contactDetails.email.trim() !== '' &&
      contactDetails.email.includes('@') &&
      paymentDetails.cardNumber.trim() !== '' &&
      paymentDetails.cardNumber.replace(/\s/g, '').length >= 13 &&
      paymentDetails.expiryDate.trim() !== '' &&
      paymentDetails.securityCode.trim() !== '' &&
      paymentDetails.securityCode.length >= 3
    );
  };

  const handleStartOver = () => {
    setCurrentStep('categories');
    setSelectedCategory(null);
    setSelectedActivity(null);
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

    // Simulate payment processing delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate payment processing with 85% success rate
    const isPaymentSuccessful = Math.random() > 0.15; // 85% success rate

    setIsProcessingPayment(false);

    if (isPaymentSuccessful) {
      setCurrentStep('success');
    } else {
      setCurrentStep('failed');
    }
  };

  // Remove the synchronous calendar generation since we now use state

  // Dark mode classes
  const isDark = widgetTheme === 'dark';
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-100';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  return (
    <WidgetContainer>
      <div className={`w-full min-h-screen ${bgClass} flex items-center justify-center p-0 sm:p-2 lg:p-4`}>
        <div className={`w-full h-auto max-w-6xl ${cardBgClass} sm:rounded-xl shadow-2xl overflow-hidden flex flex-col min-h-screen sm:min-h-0 sm:my-4`}>
          {/* Header */}
          <div className={`${cardBgClass} border-b ${borderClass} px-3 sm:px-6 py-3 sm:py-4 flex-shrink-0 sticky top-0 z-10 shadow-sm backdrop-blur-sm ${isDark ? 'bg-[#161616]/95' : 'bg-white/95'}`}>
            <div className="flex items-center justify-between gap-2 w-full">
              {/* Left side - Theme, Secured, Health Safety */}
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

              {/* Right side - Gift Vouchers and Close */}
              <div className="flex items-center gap-2">
                {/* Gift Vouchers Button */}
                <button
                  onClick={() => setShowGiftVouchersDialog(true)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-lg sm:rounded-full transition-all hover:shadow-sm active:scale-95 border touch-manipulation min-w-[44px] ${isDark
                    ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30 text-[#6366f1] hover:bg-[#4f46e5]/20'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <Gift className="w-4 h-4 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: isDark ? '#6366f1' : '#16a34a' }} />
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap hidden sm:inline">Gift vouchers</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    if (cartItems.length > 0 && currentStep !== 'success' && currentStep !== 'failed') {
                      setShowExitDialog(true);
                    } else {
                      // Reset to categories if no items in cart
                      setCurrentStep('categories');
                      setSelectedCategory(null);
                      // Reset to categories if no items in cart
                      setCurrentStep('categories');
                      setSelectedCategory(null);
                      setSelectedActivity(null);
                      setSelectedDate(null);
                      setSelectedTime('');
                      setCartItems([]);
                      setTicketCounts({});
                      setSelectedDate(null);
                      setSelectedTime('');
                      setCartItems([]);
                      setTicketCounts({});
                    }
                  }}
                  className={`transition-colors p-2.5 active:scale-90 touch-manipulation rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center ${isDark ? 'text-[#737373] hover:text-[#a3a3a3] hover:bg-[#1e1e1e]' : 'text-gray-400 hover:text-gray-600 active:text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          {(currentStep !== 'categories' && currentStep !== 'success' && currentStep !== 'failed') && (
            <div className={`${cardBgClass} px-3 sm:px-6 py-3 sm:py-4 border-b ${borderClass} flex-shrink-0 sticky top-[57px] sm:top-[65px] z-10 shadow-sm backdrop-blur-sm ${isDark ? 'bg-[#161616]/95' : 'bg-white/95'}`}>
              <div className="flex items-center justify-between">
                {/* Back Button - Mobile: Icon only, Desktop: Icon + Text */}
                <button
                  onClick={handleBack}
                  className={`flex items-center gap-1.5 sm:gap-2 transition-colors active:scale-95 p-2.5 sm:p-2 rounded-lg ${hoverBgClass} touch-manipulation min-w-[44px] min-h-[44px] ${isDark ? 'text-[#a3a3a3] hover:text-[#6366f1]' : 'text-gray-700 hover:text-blue-600 active:text-blue-700 active:bg-gray-100'
                    }`}
                >
                  <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm sm:text-base hidden sm:inline">
                    {currentStep === 'activities' && 'Categories'}
                    {currentStep === 'calendar' && (selectedCategory?.name || 'Activities')}
                    {currentStep === 'timeslot' && 'Different date'}
                    {currentStep === 'plan' && 'Different time'}
                    {currentStep === 'cart' && 'Tickets'}
                    {currentStep === 'checkout' && 'Cart'}
                  </span>
                </button>

                {/* Additional Actions */}
                <div className="flex items-center gap-2">
                  {currentStep === 'checkout' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBackToCategories}
                      className="flex items-center gap-2 active:scale-95 touch-manipulation"
                    >
                      <Home className="w-4 h-4" />
                      <span className="hidden sm:inline">Keep shopping</span>
                    </Button>
                  )}
                </div>
              </div>
              {currentStep === 'plan' && (
                <div className={`mt-2 text-xs ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
                  Fields marked with <span className={isDark ? 'text-red-400' : 'text-red-500'}>*</span> are required
                </div>
              )}
            </div>
          )}

          {/* Content Area */}
          <div className={`${cardBgClass} overflow-y-auto flex-1 overscroll-contain`}>{/* Categories View */}
            {currentStep === 'categories' && (
              <div className="p-4 sm:p-6 md:p-10 pb-20 sm:pb-10">
                <div className="mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className={`text-2xl sm:text-3xl md:text-3xl ${textClass} mb-2`}>Choose Your Adventure</h2>
                  <p className={`text-sm sm:text-base ${textMutedClass}`}>Select a category to explore available experiences</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                  {categories.map((category, idx) => (
                    <div
                      key={category.id}
                      className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg cursor-pointer transform transition-all active:scale-[0.98] hover:scale-[1.02] hover:shadow-xl group animate-in fade-in slide-in-from-bottom-4 duration-500 touch-manipulation"
                      style={{ animationDelay: `${idx * 100}ms` }}
                      onClick={() => handleCategorySelect(category)}
                    >
                      <div className="aspect-[4/3] relative">
                        <ImageWithFallback
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-black/80 transition-all duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 flex items-end justify-between gap-2 sm:gap-3">
                          <h3 className="text-white text-base sm:text-lg md:text-2xl flex-1 leading-tight">{category.name}</h3>
                          <Button
                            className="text-white px-3 sm:px-4 md:px-6 h-10 sm:h-9 md:h-10 text-sm sm:text-base whitespace-nowrap shadow-lg active:scale-95 transition-transform touch-manipulation min-w-[44px]"
                            style={{ backgroundColor: primaryColor }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}{/* Activities List View */}
            {currentStep === 'activities' && selectedCategory && (
              <div className="p-3 sm:p-4 md:p-10 pb-20 sm:pb-10">
                <div className="mb-4 sm:mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className={`text-xl sm:text-2xl md:text-3xl ${textClass} mb-1.5 sm:mb-2`}>{selectedCategory.name}</h2>
                  <p className={`text-sm sm:text-base ${textMutedClass}`}>Choose your escape room experience</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  {activities
                    .filter((activity) => activity.categoryId === selectedCategory.id)
                    .map((activity, idx) => (
                      <div
                        key={activity.id}
                        className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-lg cursor-pointer transform transition-all active:scale-[0.98] hover:scale-[1.02] hover:shadow-xl group animate-in fade-in slide-in-from-bottom-4 duration-500 touch-manipulation"
                        style={{ animationDelay: `${idx * 100}ms` }}
                        onClick={() => handleActivitySelect(activity)}
                      >
                        <div className="aspect-[4/3] relative">
                          <ImageWithFallback
                            src={activity.image}
                            alt={activity.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/85 transition-all duration-300" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
                            <h3 className="text-white text-sm sm:text-base md:text-xl mb-1.5 sm:mb-2 leading-tight">{activity.name}</h3>
                            <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 text-white text-xs mb-2 sm:mb-3">
                              <span className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-2 sm:px-2.5 py-0.5">
                                {activity.priceRange}
                              </span>
                              <span className="hidden sm:inline text-xs sm:text-sm">{activity.ageRange}</span>
                              <span className="hidden sm:inline">•</span>
                              <span className="text-xs sm:text-sm">{activity.duration}</span>
                              <span className="hidden md:inline">•</span>
                              <span className="hidden md:flex items-center gap-1 text-xs sm:text-sm">
                                Difficulty: {renderStars(activity.difficulty)}
                              </span>
                            </div>
                            <Button
                              className="text-white px-3 sm:px-4 md:px-6 h-10 sm:h-9 md:h-10 whitespace-nowrap pointer-events-none shadow-lg text-sm min-w-[44px]"
                              style={{ backgroundColor: primaryColor }}
                            >
                              Select date
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}{/* Calendar View */}
            {currentStep === 'calendar' && selectedActivity && (
              <div className="p-3 sm:p-4 md:p-10 pb-20 sm:pb-10">
                {/* Activity Hero */}
                <div className="relative rounded-lg sm:rounded-xl overflow-hidden mb-4 sm:mb-6 md:mb-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="aspect-[16/9] sm:aspect-[21/9] relative">
                    <ImageWithFallback
                      src={selectedActivity.image}
                      alt={selectedActivity.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-8">
                      <h2 className="text-white text-lg sm:text-xl md:text-4xl mb-1 sm:mb-2 leading-tight">{selectedActivity.name}</h2>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 md:gap-2 text-white text-xs">
                        <span className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-2 sm:px-2.5 py-0.5">
                          {selectedActivity.priceRange}
                        </span>
                        <span className="hidden sm:inline text-xs sm:text-sm">{selectedActivity.ageRange}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-xs sm:text-sm">{selectedActivity.duration}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="hidden md:flex items-center gap-1 text-xs sm:text-sm">
                          Difficulty: {renderStars(selectedActivity.difficulty)}
                        </span>
                      </div>
                      {selectedActivity.description && (
                        <p className="text-white/90 mt-1 sm:mt-2 max-w-2xl text-xs sm:text-sm hidden sm:block">{selectedActivity.description}</p>
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

                  {/* Calendar Days - Show loading state */}
                  {isLoadingCalendar ? (
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-3">
                      {Array.from({ length: 42 }).map((_, index) => (
                        <div
                          key={index}
                          className={`aspect-square rounded-lg sm:rounded-xl ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'} animate-pulse`}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-3">
                      {calendarDays.map((day, index) => {
                        const isToday = new Date().getDate() === day.date &&
                          new Date().getMonth() === day.month &&
                          new Date().getFullYear() === day.year;
                        const hasSlots = day.slots.length > 0;
                        const isCurrentMonth = day.isCurrentMonth;

                        return (
                          <button
                            key={index}
                            onClick={() => hasSlots && isCurrentMonth ? handleDateSelect(day) : null}
                            disabled={!hasSlots || !isCurrentMonth}
                            className={`
                            aspect-square rounded-lg sm:rounded-xl transition-all touch-manipulation calendar-day
                            flex flex-col items-center justify-center relative font-medium
                            ${!isCurrentMonth ? (isDark ? 'text-[#525252] cursor-default' : 'text-gray-300 cursor-default') : ''}
                            ${hasSlots && isCurrentMonth ? 'cursor-pointer active:scale-95 hover:opacity-90' : 'cursor-not-allowed'}
                            ${hasSlots && isCurrentMonth ? 'text-white shadow-sm hover:shadow-md active:shadow-lg' : (isDark ? 'bg-[#1e1e1e] text-[#737373] border border-[#2a2a2a]' : 'bg-gray-50 text-gray-400 border border-gray-200')}
                            ${isToday && hasSlots ? (isDark ? 'ring-2 ring-offset-2 ring-offset-[#161616]' : 'ring-2 ring-offset-2 ring-offset-white') : ''}
                          `}
                            style={{
                              backgroundColor: hasSlots && isCurrentMonth ? primaryColor : undefined,
                              borderColor: hasSlots && isCurrentMonth ? primaryColor : undefined,
                              '--tw-ring-color': isToday ? primaryColor : undefined,
                            } as React.CSSProperties}
                            aria-label={`${months[day.month]} ${day.date}, ${hasSlots ? `${day.slots.length} times available` : 'No times available'}`}
                          >
                            <span className="text-sm sm:text-base md:text-lg relative z-10">
                              {day.date}
                            </span>
                            {hasSlots && isCurrentMonth && (
                              <span className="absolute bottom-1 sm:bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full shadow-sm" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Instruction Text */}
                <div className="text-center space-y-2 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                  <p className="text-sm sm:text-base font-medium" style={{ color: isDark ? '#6366f1' : primaryColor }}>
                    Click a date to browse availability
                  </p>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
                    Green dates have available time slots
                  </p>
                </div>
              </div>
            )}{/* Timeslot Selection View */}
            {currentStep === 'timeslot' && selectedActivity && selectedDate && (
              <div className="p-4 sm:p-6 md:p-10 pb-20 sm:pb-10">
                {/* Activity Hero */}
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-6 md:mb-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="aspect-[16/9] sm:aspect-[21/9] relative">
                    <ImageWithFallback
                      src={selectedActivity.image}
                      alt={selectedActivity.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                      <h2 className="text-white text-xl sm:text-2xl md:text-4xl mb-1">{selectedActivity.name}</h2>
                      <p className="text-white/90 text-sm sm:text-base md:text-lg">Choose a start time</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Day Navigation */}
                <div className="flex items-center justify-center gap-3 mb-6 lg:hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button
                    onClick={() => {
                      const prevDate = new Date(selectedDate);
                      prevDate.setDate(prevDate.getDate() - 1);
                      setSelectedDate(prevDate);
                    }}
                    className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-colors active:scale-95 touch-manipulation shadow-sm ${isDark
                      ? 'hover:bg-[#1e1e1e] active:bg-[#2a2a2a] border-[#2a2a2a]'
                      : 'hover:bg-gray-100 active:bg-gray-200 border-gray-200'
                      }`}
                    aria-label="Previous day"
                  >
                    <ChevronLeft className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`} />
                  </button>

                  <div className={`text-center px-4 py-2 rounded-lg sm:rounded-xl border min-w-[200px] sm:min-w-[240px] ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <p className="text-xs sm:text-sm mb-0.5 font-medium" style={{ color: isDark ? '#6366f1' : primaryColor }}>Selected Date</p>
                    <h3 className={`text-sm sm:text-base font-semibold ${textClass}`}>
                      {weekDays[selectedDate.getDay()]}, {months[selectedDate.getMonth()]} {selectedDate.getDate()}
                    </h3>
                  </div>

                  <button
                    onClick={() => {
                      const nextDate = new Date(selectedDate);
                      nextDate.setDate(nextDate.getDate() + 1);
                      setSelectedDate(nextDate);
                    }}
                    className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-colors active:scale-95 touch-manipulation shadow-sm ${isDark
                      ? 'hover:bg-[#1e1e1e] active:bg-[#2a2a2a] border-[#2a2a2a]'
                      : 'hover:bg-gray-100 active:bg-gray-200 border-gray-200'
                      }`}
                    aria-label="Next day"
                  >
                    <ChevronRight className={`w-5 h-5 sm:w-6 sm:h-6 ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`} />
                  </button>
                </div>

                {/* Time Slot Selection */}
                <div className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                    {/* Previous Day */}
                    {(() => {
                      const prevDate = new Date(selectedDate);
                      prevDate.setDate(prevDate.getDate() - 1);
                      const dayName = weekDays[prevDate.getDay()];
                      const monthName = months[prevDate.getMonth()];
                      const dayOfMonth = prevDate.getDate();

                      // Get real time slots for previous day
                      const timeSlots = getTimeSlotsForDate(prevDate);

                      return (
                        <div className="hidden lg:block animate-in fade-in slide-in-from-left-4 duration-500">
                          <div className="text-center mb-4">
                            <button
                              onClick={() => {
                                setSelectedDate(prevDate);
                              }}
                              className={`text-sm transition-colors mb-1 active:scale-95 touch-manipulation ${isDark
                                ? 'text-[#737373] hover:text-[#a3a3a3] active:text-white'
                                : 'text-gray-500 hover:text-gray-700 active:text-gray-900'
                                }`}
                            >
                              Previous day
                            </button>
                            <h3 className={`text-sm sm:text-base ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>{dayName}, {monthName} {dayOfMonth}</h3>
                          </div>
                          <div className="space-y-2">
                            {timeSlots.length > 0 ? (
                              timeSlots.map((slot, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSelectedDate(prevDate);
                                    handleTimeSlotSelect(slot.time);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 sm:px-4 py-3 sm:py-3.5 border-2 rounded-lg active:scale-[0.98] transition-all shadow-sm hover:shadow touch-manipulation ${isDark
                                    ? 'border-[#2a2a2a] hover:border-[#4f46e5] hover:bg-[#4f46e5]/10 active:bg-[#4f46e5]/20 text-[#a3a3a3] hover:text-[#6366f1]'
                                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 text-gray-700 hover:text-blue-600'
                                    }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm sm:text-base">{slot.time}</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                </button>
                              ))
                            ) : (
                              <div className={`text-center py-4 text-sm ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
                                No available time slots
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Selected Day */}
                    {(() => {
                      const dayName = weekDays[selectedDate.getDay()];
                      const monthName = months[selectedDate.getMonth()];
                      const dayOfMonth = selectedDate.getDate();

                      // Get real time slots for selected day
                      const timeSlots = getTimeSlotsForDate(selectedDate);

                      return (
                        <div className="animate-in fade-in zoom-in-95 duration-500 delay-100">
                          <div className="text-center mb-4 hidden lg:block">
                            <p className="text-xs sm:text-sm mb-1 font-medium" style={{ color: isDark ? '#6366f1' : primaryColor }}>You selected</p>
                            <h3 className={`text-sm sm:text-base font-medium ${textClass}`}>{dayName}, {monthName} {dayOfMonth}</h3>
                          </div>
                          <div className="space-y-2">
                            {timeSlots.length > 0 ? (
                              timeSlots.map((slot, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleTimeSlotSelect(slot.time)}
                                  className="w-full flex items-center justify-between px-3 sm:px-4 py-3 sm:py-3.5 border-2 rounded-lg transition-all shadow-sm hover:shadow-md active:shadow-lg active:scale-[0.98] touch-manipulation"
                                  style={{
                                    borderColor: isDark ? '#4f46e5' : primaryColor,
                                    color: isDark ? '#6366f1' : primaryColor,
                                    backgroundColor: isDark ? '#4f46e5' + '10' : `${primaryColor}10`
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                    <span className="font-medium text-sm sm:text-base">{slot.time}</span>
                                  </div>
                                  <ChevronRight className="w-5 h-5 flex-shrink-0" />
                                </button>
                              ))
                            ) : (
                              <div className={`text-center py-4 text-sm ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
                                No available time slots
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Next Day */}
                    {(() => {
                      const nextDate = new Date(selectedDate);
                      nextDate.setDate(nextDate.getDate() + 1);
                      const dayName = weekDays[nextDate.getDay()];
                      const monthName = months[nextDate.getMonth()];
                      const dayOfMonth = nextDate.getDate();

                      // Get real time slots for next day
                      const timeSlots = getTimeSlotsForDate(nextDate);

                      return (
                        <div className="hidden lg:block animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
                          <div className="text-center mb-4">
                            <button
                              onClick={() => {
                                setSelectedDate(nextDate);
                              }}
                              className={`text-sm transition-colors mb-1 active:scale-95 touch-manipulation ${isDark
                                ? 'text-[#737373] hover:text-[#a3a3a3] active:text-white'
                                : 'text-gray-500 hover:text-gray-700 active:text-gray-900'
                                }`}
                            >
                              Next day
                            </button>
                            <h3 className={`text-sm sm:text-base ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>{dayName}, {monthName} {dayOfMonth}</h3>
                          </div>
                          <div className="space-y-2">
                            {timeSlots.length > 0 ? (
                              timeSlots.map((slot, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setSelectedDate(nextDate);
                                    handleTimeSlotSelect(slot.time);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 sm:px-4 py-3 sm:py-3.5 border-2 rounded-lg active:scale-[0.98] transition-all shadow-sm hover:shadow touch-manipulation ${isDark
                                    ? 'border-[#2a2a2a] hover:border-[#4f46e5] hover:bg-[#4f46e5]/10 active:bg-[#4f46e5]/20 text-[#a3a3a3] hover:text-[#6366f1]'
                                    : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 active:bg-blue-100 text-gray-700 hover:text-blue-600'
                                    }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm sm:text-base">{slot.time}</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                </button>
                              ))
                            ) : (
                              <div className={`text-center py-4 text-sm ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
                                No available time slots
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}{/* Plan Your Experience */}
            {currentStep === 'plan' && selectedActivity && (
              <div className="p-4 sm:p-6 md:p-10 pb-20 sm:pb-10">
                <div className="max-w-3xl">
                  {/* Selected Activity & Time */}
                  <div className={`flex gap-3 sm:gap-4 mb-6 md:mb-8 p-3 sm:p-4 rounded-xl border animate-in fade-in slide-in-from-bottom-4 duration-500 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                      <ImageWithFallback
                        src={selectedActivity.image}
                        alt={selectedActivity.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className={`text-base sm:text-xl md:text-2xl mb-1 truncate ${textClass}`}>{selectedActivity.name}</h2>
                      <p className={`text-xs sm:text-sm md:text-base flex items-center gap-2 ${textMutedClass}`}>
                        <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="line-clamp-2">{formatSelectedDateTime()}</span>
                      </p>
                    </div>
                  </div>

                  {/* Plan your experience */}
                  <h3 className={`text-xl sm:text-2xl md:text-2xl mb-4 md:mb-6 ${textClass}`}>Plan your experience</h3>

                  <div className="space-y-3 sm:space-y-4">
                    {ticketTypes.map((ticketType, idx) => (
                      <div
                        key={ticketType.id}
                        className={`flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-5 border-2 rounded-xl transition-all shadow-sm hover:shadow animate-in fade-in slide-in-from-bottom-4 duration-500 touch-manipulation ${isDark ? 'border-[#2a2a2a] hover:border-[#3a3a3a]' : 'border-gray-200 hover:border-gray-300'
                          }`}
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateTicketCount(ticketType.id, -1)}
                            className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 p-0 shadow-sm hover:shadow active:shadow-lg active:scale-90 transition-all touch-manipulation"
                            style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor, color: 'white', borderColor: isDark ? '#4f46e5' : primaryColor }}
                          >
                            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                          <div className="w-8 sm:w-10 md:w-12 text-center text-lg sm:text-xl md:text-2xl font-semibold" style={{ color: isDark ? '#6366f1' : primaryColor }}>
                            {ticketCounts[ticketType.id] || 0}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateTicketCount(ticketType.id, 1)}
                            className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 p-0 shadow-sm hover:shadow active:shadow-lg active:scale-90 transition-all touch-manipulation"
                            style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor, color: 'white', borderColor: isDark ? '#4f46e5' : primaryColor }}
                          >
                            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm sm:text-base md:text-lg font-medium ${textClass}`}>{ticketType.name}</div>
                          <div className={`text-xs sm:text-sm ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>{ticketType.description}</div>
                        </div>
                        <div className={`text-lg sm:text-xl md:text-2xl font-semibold flex-shrink-0 ${textClass}`}>${ticketType.price}</div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    disabled={Object.values(ticketCounts).every(c => c === 0)}
                    className="w-full mt-6 md:mt-8 h-12 sm:h-13 md:h-14 text-base md:text-lg text-white whitespace-nowrap shadow-lg hover:shadow-xl active:shadow-2xl active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor }}
                  >
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Continue to Cart
                  </Button>
                </div>
              </div>
            )}{/* Cart Summary */}
            {currentStep === 'cart' && selectedActivity && (
              <div className="p-4 sm:p-6 md:p-10 pb-20 sm:pb-10">
                <div className="max-w-4xl">
                  <div className="mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <h2 className={`text-2xl sm:text-3xl md:text-3xl mb-2 ${textClass}`}>Review Your Booking</h2>
                    <p className={`text-sm sm:text-base ${textMutedClass}`}>Check your selections before proceeding to checkout</p>
                  </div>
                  {/* Selected Activity & Time */}
                  <div className={`flex gap-3 sm:gap-4 mb-6 md:mb-8 p-3 sm:p-4 rounded-xl border animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 ${isDark ? 'bg-[#1e1e1e] border-[#2a2a2a]' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                      <ImageWithFallback
                        src={selectedActivity.image}
                        alt={selectedActivity.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base sm:text-lg md:text-xl mb-1 truncate ${textClass}`}>{selectedActivity.name}</h3>
                      <p className={`text-xs sm:text-sm flex items-center gap-2 ${textMutedClass}`}>
                        <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="line-clamp-2">{formatSelectedDateTime()}</span>
                      </p>
                    </div>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-[#525252]' : 'text-gray-400'}`} />
                      <h3 className={`text-xl mb-2 ${textClass}`}>Your cart is empty</h3>
                      <p className={`mb-6 ${textMutedClass}`}>Add tickets to continue with your booking.</p>
                      <Button
                        onClick={handleBackToCalendar}
                        variant="outline"
                        className="mx-auto"
                      >
                        Go Back
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Plan your experience - Ticket Type Selectors */}
                      <h3 className="text-xl md:text-2xl text-gray-900 mb-4 md:mb-6">Plan your experience</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                        {ticketTypes.map((ticketType) => {
                          const count = cartItems.filter(item => item.ticketTypeId === ticketType.id).length;
                          return (
                            <div
                              key={ticketType.id}
                              className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border border-gray-200 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const item = cartItems.find(i => i.ticketTypeId === ticketType.id);
                                    if (item) handleRemoveCartItem(item.id);
                                  }}
                                  className="h-10 w-10 md:h-12 md:w-12 p-0"
                                  style={{ backgroundColor: primaryColor, color: 'white', borderColor: primaryColor }}
                                >
                                  <Minus className="w-4 h-4" />
                                </Button>
                                <div className="w-8 md:w-10 text-center text-lg" style={{ color: primaryColor }}>
                                  {count}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const newItem: CartItem = {
                                      id: `${ticketType.id}-${Date.now()}`,
                                      ticketTypeId: ticketType.id,
                                      ticketTypeName: ticketType.name,
                                      price: ticketType.price
                                    };
                                    setCartItems([...cartItems, newItem]);
                                  }}
                                  className="h-10 w-10 md:h-12 md:w-12 p-0"
                                  style={{ backgroundColor: primaryColor, color: 'white', borderColor: primaryColor }}
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex-1">
                                <div className="text-sm md:text-base text-gray-900">{ticketType.name}</div>
                                <div className="text-xs text-gray-500">{ticketType.description}</div>
                              </div>
                              <div className="text-base md:text-lg text-gray-900">${ticketType.price}</div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Cart Items */}
                      <div className="space-y-3 mb-6 md:mb-8">
                        {Object.entries(getGroupedCartItems()).map(([ticketTypeId, group]) => (
                          <div
                            key={ticketTypeId}
                            className={`border rounded-lg ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}
                          >
                            {/* Render each individual item in the group */}
                            {group.items.map((item, idx) => (
                              <div key={item.id}>
                                <div className="flex items-center justify-between p-3 md:p-4">
                                  <div className="flex-1">
                                    <div className={`text-sm md:text-base ${textClass}`}>{item.ticketTypeName}</div>
                                    {/* Only show promo code link on first item of each type */}
                                    {idx === 0 && !appliedPromos[item.ticketTypeId] && !showPromoInput[item.ticketTypeId] && (
                                      <button
                                        onClick={() => setShowPromoInput(prev => ({ ...prev, [item.ticketTypeId]: true }))}
                                        className={`text-xs md:text-sm hover:underline mt-1 ${isDark ? 'text-[#6366f1] hover:text-[#818cf8]' : 'text-blue-600'
                                          }`}
                                      >
                                        Add promo or discount code
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 md:gap-4">
                                    <span className={`text-base md:text-lg ${textClass}`}>${item.price}</span>
                                    <button
                                      onClick={() => handleRemoveCartItem(item.id)}
                                      className={isDark ? 'text-[#737373] hover:text-red-400' : 'text-gray-400 hover:text-red-500'}
                                    >
                                      <X className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                                {idx < group.items.length - 1 && <Separator />}
                              </div>
                            ))}


                            {/* Promo Code Input - Show once per ticket type */}
                            {showPromoInput[ticketTypeId] && !appliedPromos[ticketTypeId] && (
                              <div className={`px-3 md:px-4 pb-3 md:pb-4 border-t space-y-2 pt-3 ${borderClass}`}>
                                <div className="flex gap-2">
                                  <Input
                                    type="text"
                                    placeholder="Enter promo code"
                                    value={promoInputs[ticketTypeId] || ''}
                                    onChange={(e) => setPromoInputs(prev => ({ ...prev, [ticketTypeId]: e.target.value }))}
                                    className="flex-1 text-sm"
                                  />
                                  <Button
                                    onClick={() => handleApplyPromo(ticketTypeId)}
                                    size="sm"
                                    style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor }}
                                    className="text-white"
                                  >
                                    Apply
                                  </Button>
                                  <Button
                                    onClick={() => setShowPromoInput(prev => ({ ...prev, [ticketTypeId]: false }))}
                                    variant="outline"
                                    size="sm"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                                {ticketTypeId === 'veteran' && (
                                  <div className={`text-xs space-y-1 p-2 rounded border ${isDark
                                    ? 'text-[#a3a3a3] bg-[#4f46e5]/10 border-[#4f46e5]/30'
                                    : 'text-gray-500 bg-blue-50 border-blue-100'
                                    }`}>
                                    <div className={`font-medium mb-1 ${isDark ? 'text-[#6366f1]' : 'text-blue-700'}`}>Available veteran codes:</div>
                                    <div>• VETERAN15 - 15% off veteran tickets</div>
                                    <div>• VETERAN25 - 25% off veteran tickets</div>
                                    <div>• THANKYOU10 - 10% off veteran tickets</div>
                                  </div>
                                )}
                                {ticketTypeId === 'player' && (
                                  <div className={`text-xs space-y-1 p-2 rounded border ${isDark
                                    ? 'text-[#a3a3a3] bg-[#4f46e5]/10 border-[#4f46e5]/30'
                                    : 'text-gray-500 bg-blue-50 border-blue-100'
                                    }`}>
                                    <div className={`font-medium mb-1 ${isDark ? 'text-[#6366f1]' : 'text-blue-700'}`}>Available codes:</div>
                                    <div>• SAVE10 - 10% off regular tickets</div>
                                    <div>• WELCOME20 - 20% off regular tickets</div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Applied Promo Display - Show once per ticket type */}
                            {appliedPromos[ticketTypeId] && (
                              <div className={`px-3 md:px-4 pb-3 md:pb-4 border-t pt-3 ${borderClass}`}>
                                <div className={`flex items-center justify-between p-2 border rounded-lg ${isDark
                                  ? 'border-emerald-500/30 bg-emerald-500/10'
                                  : 'border-green-200 bg-green-50'
                                  }`}>
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                                    <span className={`text-xs md:text-sm ${textClass}`}>
                                      <span className="font-medium">{appliedPromos[ticketTypeId].code}</span> applied
                                      ({Math.round(appliedPromos[ticketTypeId].discount * 100)}% off)
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleRemovePromo(ticketTypeId)}
                                    className={`text-xs md:text-sm hover:underline ${isDark ? 'text-red-400' : 'text-red-600'}`}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Additional Information */}
                      {activeConfig.additionalQuestions && activeConfig.additionalQuestions.length > 0 && (
                        <div className="mb-6 md:mb-8">
                          <h3 className={`text-base mb-4 ${textClass}`}>Additional information</h3>
                          {activeConfig.additionalQuestions.map((question) => (
                            <div key={question.id} className="mb-4">
                              <Label className={`text-sm mb-2 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>{question.question}</Label>
                              {question.type === 'select' && (
                                <Select>
                                  <SelectTrigger className={`w-full h-12 ${isDark ? 'bg-[#2a2a2a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300'}`}>
                                    <SelectValue placeholder="Choose an option" />
                                  </SelectTrigger>
                                  <SelectContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
                                    {question.options?.map((option) => (
                                      <SelectItem key={option} value={option.toLowerCase()}>
                                        {option}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          ))}
                          {/* Promo Code and Gift Card Section */}
                          <div className="space-y-2 mt-4">
                            {/* Promo Code */}
                            <div>
                              {!appliedPromoCode && !showPromoCodeInput && (
                                <button
                                  onClick={() => setShowPromoCodeInput(true)}
                                  className={`text-sm hover:underline ${isDark ? 'text-[#6366f1]' : 'text-blue-500'}`}
                                >
                                  Add promo code
                                </button>
                              )}
                              {showPromoCodeInput && !appliedPromoCode && (
                                <PromoCodeInput
                                  onApply={handleApplyPromoCode}
                                  className="mb-2"
                                />
                              )}
                              {appliedPromoCode && (
                                <PromoCodeInput
                                  onApply={handleApplyPromoCode}
                                  onRemove={handleRemovePromoCode}
                                  appliedCode={appliedPromoCode.code}
                                  appliedDiscount={appliedPromoCode.discount}
                                  appliedType={appliedPromoCode.type}
                                  className="mb-2"
                                />
                              )}
                            </div>

                            {/* Gift Card */}
                            <div>
                              {!appliedGiftCard && !showGiftCardInput && (
                                <button
                                  onClick={() => setShowGiftCardInput(true)}
                                  className={`text-sm hover:underline ${isDark ? 'text-[#6366f1]' : 'text-blue-500'}`}
                                >
                                  Apply gift card
                                </button>
                              )}
                              {showGiftCardInput && !appliedGiftCard && (
                                <GiftCardInput
                                  onApply={handleApplyGiftCard}
                                  className="mb-2"
                                />
                              )}
                              {appliedGiftCard && (
                                <GiftCardInput
                                  onApply={handleApplyGiftCard}
                                  onRemove={handleRemoveGiftCard}
                                  appliedCode={appliedGiftCard.code}
                                  appliedAmount={appliedGiftCard.amount}
                                  className="mb-2"
                                />
                              )}
                            </div>
                          </div>
                          <div className={`flex items-center gap-3 mt-4 p-4 border rounded-lg ${isDark ? 'border-[#2a2a2a] bg-[#1e1e1e]' : 'border-gray-200 bg-white'
                            }`}>
                            <Checkbox id="printable" className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600" />
                            <label htmlFor="printable" className={`text-sm flex items-center gap-2 cursor-pointer flex-1 ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                              <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>$8</span>
                              Add a printable activity
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Cancellation Policy */}
                      {activeConfig.cancellationPolicy && (
                        <div className="mb-6 md:mb-8">
                          <h3 className={`text-lg md:text-xl mb-2 ${textClass}`}>Cancellations</h3>
                          <p className={`text-sm ${textMutedClass}`}>{activeConfig.cancellationPolicy}</p>
                        </div>
                      )}

                      {/* Price Summary Sidebar */}
                      <div className={`rounded-lg p-4 md:p-6 mb-6 ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between text-sm md:text-base">
                            <span className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>Subtotal</span>
                            <span className={textClass}>${calculateSubtotal().toFixed(2)}</span>
                          </div>
                          {calculateTotalDiscount() > 0 && (
                            <div className="flex justify-between text-sm md:text-base">
                              <span className={isDark ? 'text-emerald-400' : 'text-green-600'}>Discount</span>
                              <span className={isDark ? 'text-emerald-400' : 'text-green-600'}>-${calculateTotalDiscount().toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm md:text-base">
                            <div className="flex items-center gap-1">
                              <span className={isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}>Fees</span>
                              <Info className={`w-4 h-4 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                            </div>
                            <span className={textClass}>${calculateFees().toFixed(2)}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between text-lg md:text-xl">
                            <span className={textClass}>Total</span>
                            <span className={textClass}>${calculateTotal().toFixed(2)}</span>
                          </div>
                        </div>
                        <Button
                          onClick={handleCheckout}
                          disabled={cartItems.length === 0}
                          className="w-full h-12 md:h-14 text-base md:text-lg text-white whitespace-nowrap shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                          style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor }}
                        >
                          Proceed to Checkout ›
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}{/* Checkout */}
            {currentStep === 'checkout' && selectedActivity && (
              <div className="min-h-screen flex flex-col">
                {/* Header */}
                <div className={`flex items-center justify-between px-4 md:px-6 py-4 border-b ${isDark ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
                  <button
                    onClick={handleBackToPlan}
                    className={`flex items-center gap-2 ${isDark ? 'text-[#a3a3a3] hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm">Cart</span>
                  </button>
                  <button
                    onClick={() => setCurrentStep('categories')}
                    className={`px-4 py-2 rounded-lg text-sm ${isDark ? 'bg-[#2a2a2a] text-[#a3a3a3] hover:bg-[#3a3a3a]' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition-colors`}
                  >
                    Keep shopping
                  </button>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 md:p-6 lg:p-10">
                  <div className="max-w-5xl mx-auto">
                    {/* Title */}
                    <div className="mb-8">
                      <h1 className={`text-2xl md:text-3xl mb-2 ${textClass}`}>Checkout</h1>
                      <p className={`text-sm md:text-base ${textMutedClass}`}>You're moments away from completing your booking.</p>
                    </div>

                    {/* Order Summary */}
                    <div className={`flex gap-4 p-4 md:p-6 border rounded-xl mb-6 ${isDark ? 'border-[#2a2a2a] bg-[#1e1e1e]' : 'border-gray-200 bg-white'}`}>
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={selectedActivity.image}
                          alt={selectedActivity.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base md:text-lg mb-1 ${textClass}`}>{selectedActivity.name}</h3>
                        <p className={`text-sm mb-2 ${textMutedClass}`}>{formatSelectedDateTime()}</p>
                        <p className={`text-sm ${textMutedClass}`}>
                          {Object.entries(getTotalTicketsByType()).map(([type, count], idx, arr) => (
                            <span key={type}>
                              {count} {type}
                              {idx < arr.length - 1 ? ', ' : ''}
                            </span>
                          ))}{' '}
                          <button onClick={handleBackToPlan} className={`hover:underline ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`}>(Change)</button>
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button className={`text-sm hover:underline ${textMutedClass}`}>Remove</button>
                          <span className={textMutedClass}>|</span>
                          <button className={`text-sm hover:underline ${textMutedClass}`}>Cancellation policy ›</button>
                        </div>
                      </div>
                      <div className={`text-lg md:text-xl shrink-0 ${textClass}`}>${calculateSubtotal().toFixed(2)}</div>
                    </div>

                    {/* Promo Code Section */}
                    <div className="mb-4">
                      {!appliedPromoCode ? (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Gift className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                            <Input
                              placeholder="Enter promo code"
                              value={promoCodeInput}
                              onChange={(e) => setPromoCodeInput(e.target.value)}
                              className={`pl-10 h-12 ${isDark ? 'bg-[#2a2a2a] border-[#2a2a2a] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'}`}
                            />
                          </div>
                          <Button
                            onClick={() => {
                              if (promoCodeInput) {
                                // Use predefined codes or 10% default
                                const discount = promoCodeInput === 'SAVE20' ? 20 : promoCodeInput === 'WELCOME' ? 15 : 10;
                                handleApplyPromoCode(promoCodeInput, discount, 'percentage');
                              }
                            }}
                            disabled={!promoCodeInput}
                            variant="ghost"
                            className={`h-12 px-6 ${isDark ? 'bg-[#2a2a2a] text-[#a3a3a3] hover:bg-[#3a3a3a]' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-transparent'}`}
                          >
                            Apply
                          </Button>
                        </div>
                      ) : (
                        <div className={`flex items-center justify-between p-4 border rounded-lg ${isDark ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-green-200 bg-green-50'}`}>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} />
                            <span className={`text-sm ${textClass}`}>
                              <span className="font-medium">{appliedPromoCode.code}</span> applied ({appliedPromoCode.discount}% off)
                            </span>
                          </div>
                          <button
                            onClick={handleRemovePromoCode}
                            className={`text-sm hover:underline ${isDark ? 'text-red-400' : 'text-red-600'}`}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <p className={`text-xs mt-2 ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
                        Try: SAVE10, SAVE20, WELCOME, VIP, or FIRST25
                      </p>
                    </div>

                    {/* Gift Card Section */}
                    <div className="mb-8">
                      {!appliedGiftCard ? (
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Gift className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                            <Input
                              placeholder="Enter gift card code"
                              value={giftCardInput}
                              onChange={(e) => setGiftCardInput(e.target.value)}
                              className={`pl-10 h-12 ${isDark ? 'bg-[#2a2a2a] border-[#2a2a2a] text-white placeholder:text-[#737373]' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder:text-gray-500'}`}
                            />
                          </div>
                          <Button
                            onClick={() => {
                              if (giftCardInput) {
                                // Mock gift card amounts
                                const amount = giftCardInput.includes('100') ? 100 : giftCardInput.includes('50') ? 50 : 25;
                                handleApplyGiftCard(giftCardInput, amount);
                              }
                            }}
                            disabled={!giftCardInput}
                            variant="ghost"
                            className={`h-12 px-6 ${isDark ? 'bg-[#2a2a2a] text-[#a3a3a3] hover:bg-[#3a3a3a]' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-transparent'}`}
                          >
                            Apply
                          </Button>
                        </div>
                      ) : (
                        <div className={`flex items-center justify-between p-4 border rounded-lg ${isDark ? 'border-purple-500/30 bg-purple-500/10' : 'border-purple-200 bg-purple-50'}`}>
                          <div className="flex items-center gap-2">
                            <Gift className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                            <span className={`text-sm ${textClass}`}>
                              <span className="font-medium">{appliedGiftCard.code}</span> applied (${appliedGiftCard.amount.toFixed(2)})
                            </span>
                          </div>
                          <button
                            onClick={handleRemoveGiftCard}
                            className={`text-sm hover:underline ${isDark ? 'text-red-400' : 'text-red-600'}`}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <p className={`text-xs mt-2 ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
                        Try: GIFT50, GIFT100, HOLIDAY25, BIRTHDAY75
                      </p>
                    </div>

                    {/* Contact and Payment Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Contact Details */}
                      <div>
                        <h3 className={`text-base mb-4 ${textClass}`}>Contact details</h3>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="fullname" className={`text-sm mb-2 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                              Full name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="fullname"
                              placeholder=""
                              value={contactDetails.fullName}
                              onChange={(e) => setContactDetails({ ...contactDetails, fullName: e.target.value })}
                              className={`h-12 ${isDark ? 'bg-[#2a2a2a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className={`text-sm mb-2 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                              Phone number <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2">
                              <Select defaultValue="us">
                                <SelectTrigger className={`w-20 h-12 ${isDark ? 'bg-[#2a2a2a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300'}`}>
                                  <SelectValue>🇺🇸</SelectValue>
                                </SelectTrigger>
                                <SelectContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
                                  <SelectItem value="us">🇺🇸</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                id="phone"
                                type="tel"
                                placeholder=""
                                value={contactDetails.phone}
                                onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })}
                                className={`flex-1 h-12 ${isDark ? 'bg-[#2a2a2a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="email" className={`text-sm mb-2 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                              Email address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder=""
                              value={contactDetails.email}
                              onChange={(e) => setContactDetails({ ...contactDetails, email: e.target.value })}
                              className={`h-12 ${isDark ? 'bg-[#2a2a2a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                            />
                          </div>
                          <div className="flex items-start gap-2 pt-2">
                            <Checkbox
                              id="email-updates"
                              checked={contactDetails.emailUpdates}
                              onCheckedChange={(checked) =>
                                setContactDetails({ ...contactDetails, emailUpdates: checked as boolean })
                              }
                              className="mt-0.5"
                            />
                            <label htmlFor="email-updates" className={`text-sm ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                              Get future email updates from Optimal Escape
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div>
                        <h3 className={`text-base mb-4 ${textClass}`}>Payment details</h3>
                        <div className={`mb-4 flex items-center gap-2 text-sm ${isDark ? 'text-emerald-400' : 'text-green-700'}`}>
                          <Shield className="w-4 h-4" />
                          <span>Secure, fast checkout with Link</span>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="cardnumber" className={`text-sm mb-2 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                              Card number
                            </Label>
                            <div className="relative">
                              <Input
                                id="cardnumber"
                                placeholder="1234 1234 1234 1234"
                                value={paymentDetails.cardNumber}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                                className={`h-12 pr-12 ${isDark ? 'bg-[#2a2a2a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <CreditCard className={`w-5 h-5 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label htmlFor="expiry" className={`text-sm mb-2 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                                Expiration date
                              </Label>
                              <Input
                                id="expiry"
                                placeholder="MM / YY"
                                value={paymentDetails.expiryDate}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                                className={`h-12 ${isDark ? 'bg-[#2a2a2a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvc" className={`text-sm mb-2 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                                Security code
                              </Label>
                              <Input
                                id="cvc"
                                placeholder="CVC"
                                value={paymentDetails.securityCode}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, securityCode: e.target.value })}
                                className={`h-12 ${isDark ? 'bg-[#2a2a2a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300 placeholder:text-gray-500'}`}
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="country" className={`text-sm mb-2 block ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                              Country
                            </Label>
                            <Select
                              value={paymentDetails.country}
                              onValueChange={(value) => setPaymentDetails({ ...paymentDetails, country: value })}
                            >
                              <SelectTrigger className={`h-12 ${isDark ? 'bg-[#2a2a2a] border-[#2a2a2a]' : 'bg-gray-100 border-gray-300'}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
                                <SelectItem value="United States">United States</SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-emerald-400' : 'text-green-700'}`}>
                            <Lock className="w-3.5 h-3.5" />
                            <span>Payments are secured and encrypted</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary & Complete Button */}
                    <div className="mt-8">
                      <div className={`rounded-xl p-6 ${isDark ? 'bg-[#1e1e1e] border border-[#2a2a2a]' : 'bg-white border border-gray-200 shadow-sm'}`}>
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between text-sm">
                            <span className={isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}>Subtotal</span>
                            <span className={textClass}>${calculateSubtotal().toFixed(2)}</span>
                          </div>
                          {calculateTotalDiscount() > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className={isDark ? 'text-emerald-400' : 'text-green-600'}>Discount</span>
                              <span className={isDark ? 'text-emerald-400' : 'text-green-600'}>-${calculateTotalDiscount().toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <span className={isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}>Fees</span>
                              <Info className={`w-3.5 h-3.5 ${isDark ? 'text-[#737373]' : 'text-gray-400'}`} />
                            </div>
                            <span className={textClass}>${calculateFees().toFixed(2)}</span>
                          </div>
                          {calculateGiftCardDiscount() > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>Gift Card</span>
                              <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>-${calculateGiftCardDiscount().toFixed(2)}</span>
                            </div>
                          )}
                          <Separator className={isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'} />
                          <div className="flex justify-between text-lg">
                            <span className={textClass}>Total</span>
                            <span className={textClass}>${calculateTotal().toFixed(2)}</span>
                          </div>
                        </div>
                        <Button
                          onClick={handleCompletePayment}
                          disabled={isProcessingPayment || !isCheckoutFormComplete()}
                          className="w-full h-12 text-base text-white mb-3"
                          style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor }}
                        >
                          {isProcessingPayment ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5 mr-2" />
                              Complete and pay
                            </>
                          )}
                        </Button>
                        {!isCheckoutFormComplete() && !isProcessingPayment && (
                          <p className={`text-xs text-center ${textMutedClass}`}>
                            Please answer all fields marked with <span className="text-red-500">*</span> to complete your order
                          </p>
                        )}
                        {isCheckoutFormComplete() && !isProcessingPayment && (
                          <p className={`text-xs text-center flex items-center justify-center gap-1 ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>
                            <CheckCircle2 className="w-4 h-4" />
                            All required fields completed
                          </p>
                        )}
                        <p className={`text-xs text-center mt-2 ${textMutedClass}`}>
                          By completing this transaction, you agree to BookingTMS's Terms of Service for Customers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}{/* Success Page */}
            {currentStep === 'success' && selectedActivity && (
              <div className="p-4 md:p-10 min-h-[60vh] flex items-center justify-center">
                <div className="max-w-2xl w-full text-center">
                  <div className="mb-6 md:mb-8 flex justify-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: isDark ? '#4f46e5' + '20' : `${primaryColor}20` }}>
                      <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" style={{ color: isDark ? '#6366f1' : primaryColor }} />
                    </div>
                  </div>
                  <h1 className={`text-2xl md:text-4xl mb-3 md:mb-4 ${textClass}`}>Payment Successful!</h1>
                  <p className={`text-base md:text-lg mb-6 md:mb-8 ${textMutedClass}`}>
                    Your booking has been confirmed. We've sent a confirmation email to {contactDetails.email}
                  </p>

                  <div className={`rounded-lg p-4 md:p-6 mb-6 md:mb-8 text-left ${isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200'}`}>
                    <div className="flex gap-4 mb-4 md:mb-6">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={selectedActivity.image}
                          alt={selectedActivity.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg md:text-xl mb-1 ${textClass}`}>{selectedActivity.name}</h3>
                        <p className={`text-sm md:text-base ${isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}`}>{formatSelectedDateTime()}</p>
                      </div>
                    </div>

                    <Separator className={`mb-4 md:mb-6 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`} />

                    <div className="space-y-3 text-sm md:text-base">
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}>Booking ID</span>
                        <span className={textClass}>#BK-{Date.now().toString().slice(-6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}>Guests</span>
                        <span className={textClass}>
                          {Object.entries(getTotalTicketsByType()).map(([type, count], idx, arr) => (
                            <span key={type}>
                              {count} {type}
                              {idx < arr.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}>Total Paid</span>
                        <span className={`text-lg ${textClass}`}>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => window.print()}
                      className="h-11 md:h-12 px-6 md:px-8"
                    >
                      Print Receipt
                    </Button>
                    <Button
                      onClick={handleStartOver}
                      className="h-11 md:h-12 px-6 md:px-8 text-white whitespace-nowrap"
                      style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor }}
                    >
                      <Home className="w-5 h-5 mr-2" />
                      Book Another Experience
                    </Button>
                  </div>

                  <p className={`text-xs md:text-sm mt-6 md:mt-8 ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
                    Need help? Contact us at support@bookingtms.com
                  </p>
                </div>
              </div>
            )}{/* Failed Payment Page */}
            {currentStep === 'failed' && selectedActivity && (
              <div className="p-4 md:p-10 min-h-[60vh] flex items-center justify-center">
                <div className="max-w-2xl w-full text-center">
                  <div className="mb-6 md:mb-8 flex justify-center">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-100'
                      }`}>
                      <X className={`w-10 h-10 md:w-12 md:h-12 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                    </div>
                  </div>
                  <h1 className={`text-2xl md:text-4xl mb-3 md:mb-4 ${textClass}`}>Payment Failed</h1>
                  <p className={`text-base md:text-lg mb-6 md:mb-8 ${textMutedClass}`}>
                    We couldn't process your payment. Please check your payment details and try again.
                  </p>

                  <div className={`border rounded-lg p-4 md:p-6 mb-6 md:mb-8 text-left ${isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                    }`}>
                    <h3 className={`text-base md:text-lg mb-3 ${textClass}`}>Common reasons for payment failure:</h3>
                    <ul className={`space-y-2 text-sm md:text-base ${isDark ? 'text-[#a3a3a3]' : 'text-gray-700'}`}>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>•</span>
                        <span>Insufficient funds in your account</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>•</span>
                        <span>Incorrect card number or expiration date</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>•</span>
                        <span>Card security code (CVV) mismatch</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>•</span>
                        <span>Card issuer declined the transaction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>•</span>
                        <span>Billing address mismatch</span>
                      </li>
                    </ul>
                  </div>

                  <div className={`rounded-lg p-4 md:p-6 mb-6 md:mb-8 text-left ${isDark ? 'bg-[#1e1e1e]' : 'bg-white border border-gray-200'}`}>
                    <h3 className={`text-base md:text-lg mb-3 ${textClass}`}>Your booking details:</h3>
                    <div className="flex gap-4 mb-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={selectedActivity.image}
                          alt={selectedActivity.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className={`text-base md:text-lg mb-1 ${textClass}`}>{selectedActivity.name}</h4>
                        <p className={`text-sm ${isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}`}>{formatSelectedDateTime()}</p>
                      </div>
                    </div>

                    <Separator className={`mb-4 ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`} />

                    <div className="space-y-2 text-sm md:text-base">
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}>Guests</span>
                        <span className={textClass}>
                          {Object.entries(getTotalTicketsByType()).map(([type, count], idx, arr) => (
                            <span key={type}>
                              {count} {type}
                              {idx < arr.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}>Total Amount</span>
                        <span className={`text-lg ${textClass}`}>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={handleStartOver}
                      className="h-11 md:h-12 px-6 md:px-8"
                    >
                      <Home className="w-5 h-5 mr-2" />
                      Start Over
                    </Button>
                    <Button
                      onClick={() => setCurrentStep('checkout')}
                      className="h-11 md:h-12 px-6 md:px-8 text-white whitespace-nowrap"
                      style={{ backgroundColor: isDark ? '#4f46e5' : primaryColor }}
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Try Again
                    </Button>
                  </div>

                  <p className={`text-xs md:text-sm mt-6 md:mt-8 ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
                    Need help? Contact us at support@bookingtms.com or call (555) 123-4567
                  </p>
                </div>
              </div>
            )}
          </div>{/* Footer */}
          <div className={`${cardBgClass} border-t ${borderClass} px-4 sm:px-6 py-4 flex-shrink-0 safe-area-inset-bottom`}>
            <div className={`flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm gap-2 sm:gap-3 ${textMutedClass}`}>
              <button className={`flex items-center gap-2 transition-colors active:scale-95 touch-manipulation ${isDark ? 'hover:text-white' : 'hover:text-gray-900'
                }`}>
                <span className={isDark ? 'text-[#737373]' : 'text-gray-500'}>🌐</span>
                <span>{language}</span>
                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className={isDark ? 'text-[#737373]' : 'text-gray-500'}>Powered by</span>
                <span className={`font-medium ${textClass}`}>BookingTMS</span>
              </div>
            </div>
            <div className={`mt-2 text-xs text-center sm:text-left ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
              All prices are in US dollars
            </div>
            {currentStep === 'categories' && (
              <div className={`mt-2 text-xs text-center sm:text-left ${isDark ? 'text-[#737373]' : 'text-gray-500'}`}>
                See any illegal content?{' '}
                <button className={`underline touch-manipulation ${isDark ? 'hover:text-[#a3a3a3] active:text-white' : 'hover:text-gray-700 active:text-gray-900'
                  }`}>Report it using this form</button>.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900">Are you sure you want to close?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Items you've added to your cart will still be here when you come back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              onClick={() => setShowExitDialog(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 order-first sm:order-first"
            >
              Stay
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowExitDialog(false);
                handleStartOver();
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-0"
            >
              Leave checkout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Secured Dialog */}
      <Dialog open={showSecuredDialog} onOpenChange={setShowSecuredDialog}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-700" />
              </div>
              <DialogTitle className="text-2xl text-gray-900">Secure Booking</DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-600 pt-2">
              Your security and privacy are our top priorities. We use industry-leading technology to protect your information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">SSL Encryption</h4>
                <p className="text-sm text-gray-600">
                  All data transmitted between your browser and our servers is encrypted using 256-bit SSL technology, the same security used by major banks.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">PCI DSS Compliant</h4>
                <p className="text-sm text-gray-600">
                  Our payment processing is fully compliant with Payment Card Industry Data Security Standards, ensuring your card information is handled with the highest security.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">Data Protection</h4>
                <p className="text-sm text-gray-600">
                  We never store your complete credit card information on our servers. All payment data is tokenized and processed through secure, certified payment gateways.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">Privacy Guaranteed</h4>
                <p className="text-sm text-gray-600">
                  Your personal information is kept confidential and will never be shared with third parties without your explicit consent.
                </p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-2">
                <Lock className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  <strong>Your trust matters:</strong> We're committed to maintaining the highest standards of security and transparency in all our transactions.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Health & Safety Dialog */}
      <Dialog open={showHealthSafetyDialog} onOpenChange={setShowHealthSafetyDialog}>
        <DialogContent className="bg-white max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${primaryColor}20` }}
              >
                <Sparkles className="w-6 h-6" style={{ color: primaryColor }} />
              </div>
              <DialogTitle className="text-2xl text-gray-900">Health & Safety</DialogTitle>
            </div>
            <DialogDescription className="text-base text-gray-600 pt-2">
              Your health and safety are paramount. We've implemented comprehensive measures to ensure a safe and enjoyable experience.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">Private Bookings</h4>
                <p className="text-sm text-gray-600">
                  We have all private bookings. You will never have to worry about playing with strangers, it will always be just your group.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">Hand Sanitization Required</h4>
                <p className="text-sm text-gray-600">
                  All players are required to wash and sanitize hands before entering any of our rooms. Hand sanitizer stations are provided at all entrances.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">Stringent Cleaning Protocols</h4>
                <p className="text-sm text-gray-600">
                  We have very stringent cleaning policies in place. All rooms are thoroughly cleaned and disinfected between every booking using hospital-grade sanitizers.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">Enhanced Ventilation</h4>
                <p className="text-sm text-gray-600">
                  Our facilities feature upgraded HVAC systems with HEPA filtration to ensure optimal air quality and circulation throughout all spaces.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" style={{ color: primaryColor }} />
              </div>
              <div>
                <h4 className="text-gray-900 mb-1">Staff Training & Wellness</h4>
                <p className="text-sm text-gray-600">
                  All team members receive regular health and safety training. Daily health screenings ensure our staff maintains the highest standards of wellness.
                </p>
              </div>
            </div>
            <div
              className="rounded-lg p-4 mt-4 border"
              style={{
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}30`
              }}
            >
              <div className="flex items-start gap-2">
                <Heart className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                <p className="text-sm" style={{ color: primaryColor }}>
                  <strong>Your safety is our commitment:</strong> These protocols are continuously updated based on CDC guidelines and industry best practices to provide you with the safest experience possible.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gift Vouchers Dialog */}
      <Dialog open={showGiftVouchersDialog} onOpenChange={setShowGiftVouchersDialog}>
        <DialogContent className={`max-w-lg ${isDark ? 'bg-[#161616] border-[#2a2a2a]' : 'bg-white'}`}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-[#4f46e5]/20' : 'bg-green-100'
                  }`}
              >
                <Gift className="w-6 h-6" style={{ color: isDark ? '#6366f1' : '#16a34a' }} />
              </div>
              <DialogTitle className={isDark ? 'text-white' : 'text-gray-900'}>Gift Vouchers</DialogTitle>
            </div>
            <DialogDescription className={`text-base pt-2 ${isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}`}>
              Give the gift of unforgettable experiences! Purchase a gift voucher for friends, family, or colleagues.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" style={{ color: isDark ? '#6366f1' : '#16a34a' }} />
              </div>
              <div>
                <h4 className={isDark ? 'text-white mb-1' : 'text-gray-900 mb-1'}>Flexible Amounts</h4>
                <p className={`text-sm ${isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}`}>
                  Choose from preset amounts or select a custom value. Our gift vouchers can be used for any experience or booking.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" style={{ color: isDark ? '#6366f1' : '#16a34a' }} />
              </div>
              <div>
                <h4 className={isDark ? 'text-white mb-1' : 'text-gray-900 mb-1'}>Instant Delivery</h4>
                <p className={`text-sm ${isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}`}>
                  Gift vouchers are delivered instantly via email. Perfect for last-minute gifts or special occasions.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" style={{ color: isDark ? '#6366f1' : '#16a34a' }} />
              </div>
              <div>
                <h4 className={isDark ? 'text-white mb-1' : 'text-gray-900 mb-1'}>Valid for 12 Months</h4>
                <p className={`text-sm ${isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}`}>
                  All gift vouchers are valid for one year from the date of purchase, giving plenty of time to enjoy the experience.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" style={{ color: isDark ? '#6366f1' : '#16a34a' }} />
              </div>
              <div>
                <h4 className={isDark ? 'text-white mb-1' : 'text-gray-900 mb-1'}>Easy to Redeem</h4>
                <p className={`text-sm ${isDark ? 'text-[#a3a3a3]' : 'text-gray-600'}`}>
                  Simply enter the voucher code at checkout. Multiple vouchers can be combined for a single booking.
                </p>
              </div>
            </div>
            <div
              className={`rounded-lg p-4 mt-4 border ${isDark
                ? 'bg-[#4f46e5]/10 border-[#4f46e5]/30'
                : 'bg-green-50 border-green-200'
                }`}
            >
              <div className="flex items-start gap-2">
                <Gift className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: isDark ? '#6366f1' : '#16a34a' }} />
                <p className={`text-sm ${isDark ? 'text-[#6366f1]' : 'text-green-800'}`}>
                  <strong>Perfect for any occasion:</strong> Birthdays, holidays, corporate events, or just because! Share the joy of adventure with a gift voucher.
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Button
                onClick={() => {
                  setShowGiftVouchersDialog(false);
                  setShowGiftVoucherWidget(true);
                }}
                className="w-full"
                style={{
                  backgroundColor: isDark ? '#4f46e5' : '#16a34a',
                  color: 'white'
                }}
              >
                <Gift className="w-4 h-4 mr-2" />
                Purchase Gift Voucher
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gift Voucher Purchase Widget */}
      <GiftVoucherWidget
        isOpen={showGiftVoucherWidget}
        onClose={() => setShowGiftVoucherWidget(false)}
        primaryColor={primaryColor}
        theme={widgetTheme}
      />
    </WidgetContainer>
  );
}
