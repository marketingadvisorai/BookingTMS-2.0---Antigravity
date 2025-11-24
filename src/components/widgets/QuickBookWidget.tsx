import { useState, useEffect } from 'react';
import DataSyncServiceWithEvents, { DataSyncEvents } from '../../services/DataSyncService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Calendar as CalendarComponent } from '../ui/calendar';
import {
  Calendar, Clock, Users, Mail, Phone, User, Star, Play,
  Image as ImageIcon, ShoppingCart, CreditCard, Lock, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { format } from 'date-fns';
import { PromoCodeInput } from './PromoCodeInput';
import { GiftCardInput } from './GiftCardInput';

interface QuickBookWidgetProps {
  primaryColor?: string;
  config?: any;
}

export function QuickBookWidget({ primaryColor = '#2563eb', config }: QuickBookWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentStep, setCurrentStep] = useState<'booking' | 'cart' | 'checkout' | 'success'>('booking');
  const [formData, setFormData] = useState({
    activity: '',
    date: '',
    time: '',
    players: 4,
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    cardName: '',
  });
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  // 🔄 Real-time admin activities data loading
  const [adminActivities, setAdminActivities] = useState<any[]>([]);

  // Load admin activities with real-time sync
  useEffect(() => {
    const loadAndSubscribeActivities = () => {
      // Initial load
      const activities = DataSyncServiceWithEvents.getAllActivities();
      console.log('📦 QuickBookWidget loaded', activities.length, 'activities from admin');
      setAdminActivities(activities);

      // Real-time sync: Listen for admin changes
      const handleActivitiesUpdate = () => {
        const updatedActivities = DataSyncServiceWithEvents.getAllActivities();
        console.log('🔄 QuickBookWidget activities updated in real-time!', updatedActivities.length);
        setAdminActivities(updatedActivities);
      };

      // Subscribe to events
      DataSyncEvents.subscribe('activities-updated', handleActivitiesUpdate);

      // Cleanup function
      return () => {
        DataSyncEvents.unsubscribe('activities-updated', handleActivitiesUpdate);
      };
    };

    return loadAndSubscribeActivities();
  }, []);

  // Promo code and gift card state
  const [showPromoCodeInput, setShowPromoCodeInput] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null);
  const [showGiftCardInput, setShowGiftCardInput] = useState(false);
  const [appliedGiftCard, setAppliedGiftCard] = useState<{ code: string; amount: number } | null>(null);

  // 🔄 Use admin activities when available, fallback to hardcoded activities
  const activities = adminActivities.length > 0 ? adminActivities.map(g => ({
    id: g.id.toString(),
    name: g.name,
    price: g.basePrice,
    duration: `${g.duration} min`,
    rating: 4.8,
    reviews: 156,
    image: g.imageUrl,
    description: g.description || 'Amazing experience'
  })) : [
    {
      id: '1',
      name: 'Mystery Manor',
      price: 30,
      duration: '60 min',
      rating: 4.9,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=300&fit=crop',
      description: 'Uncover the dark secrets hidden in this Victorian mansion',
      video: true,
    },
    {
      id: '2',
      name: 'Space Odyssey',
      price: 35,
      duration: '75 min',
      rating: 4.8,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=300&fit=crop',
      description: 'Save your crew from a malfunctioning spaceship',
      video: true,
    },
    {
      id: '3',
      name: 'Zombie Outbreak',
      price: 30,
      duration: '60 min',
      rating: 4.7,
      reviews: 312,
      image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=400&h=300&fit=crop',
      description: 'Find the cure before the apocalypse spreads',
      video: false,
    },
  ];

  const timeSlots = [
    '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'
  ];

  const selectedActivity = activities.find(g => g.id === formData.activity);

  // Handlers for promo code and gift card
  const handleApplyPromoCode = (code: string, discount: number, type: 'percentage' | 'fixed') => {
    setAppliedPromoCode({ code, discount, type });
    setShowPromoCodeInput(false);
  };

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null);
  };

  const handleApplyGiftCard = (code: string, amount: number) => {
    setAppliedGiftCard({ code, amount });
    setShowGiftCardInput(false);
  };

  const handleRemoveGiftCard = () => {
    setAppliedGiftCard(null);
  };

  // Calculate prices
  const calculateSubtotal = () => selectedActivity ? selectedActivity.price * formData.players : 0;

  const calculateDiscount = () => {
    if (!appliedPromoCode) return 0;
    return appliedPromoCode.type === 'fixed'
      ? appliedPromoCode.discount
      : (calculateSubtotal() * appliedPromoCode.discount) / 100;
  };

  const calculateGiftCardDiscount = () => {
    if (!appliedGiftCard) return 0;
    const afterPromo = calculateSubtotal() - calculateDiscount();
    return Math.min(appliedGiftCard.amount, afterPromo);
  };

  const totalPrice = calculateSubtotal() - calculateDiscount() - calculateGiftCardDiscount();
  const bookingNumber = `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const canAddToCart = formData.activity && formData.date && formData.time;
  const canCheckout = formData.name && formData.email && formData.phone;
  const canCompletePay = formData.cardNumber && formData.cardExpiry && formData.cardCVV && formData.cardName;

  const resetBooking = () => {
    setCurrentStep('booking');
    setSelectedDate(undefined);
    setFormData({
      activity: '',
      date: '',
      time: '',
      players: 4,
      name: '',
      email: '',
      phone: '',
      cardNumber: '',
      cardExpiry: '',
      cardCVV: '',
      cardName: '',
    });
    setAppliedPromoCode(null);
    setAppliedGiftCard(null);
    setShowPromoCodeInput(false);
    setShowGiftCardInput(false);
  };

  const activityDetails = activities.find(g => g.id === selectedActivityId);

  // 🎯 Handle payment completion with localStorage save
  const handleCompletePayment = () => {
    try {
      // Validate form data
      if (!formData.name || !formData.email || !formData.phone) {
        alert('Please fill in all customer details');
        return;
      }

      if (!selectedActivityId || !formData.date || !formData.time) {
        alert('Please complete booking details');
        return;
      }

      // Create booking data
      const bookingData = {
        activityName: activityDetails?.name || '',
        activityId: selectedActivityId,
        date: formData.date,
        time: formData.time,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        participants: formData.players,
        ticketTypes: [{
          id: 'standard',
          name: 'Standard Ticket',
          price: activityDetails?.price || 0,
          quantity: formData.players,
          subtotal: (activityDetails?.price || 0) * formData.players
        }],
        totalPrice: totalPrice,
        promoCode: appliedPromoCode?.code,
        giftCardCredit: appliedGiftCard?.amount
      };

      // Save booking using DataSyncService
      const savedBooking = DataSyncServiceWithEvents.saveBooking(bookingData);

      console.log('✅ QuickBookWidget booking saved:', savedBooking.id);
      console.log('📊 Total bookings:', DataSyncServiceWithEvents.getAllBookings().length);

      // Show success
      setCurrentStep('success');

    } catch (error) {
      console.error('❌ Error saving booking:', error);
      alert('Error saving booking. Please try again.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Activity Details Dialog - Full Screen on Mobile */}
      <Dialog open={showActivityDetails} onOpenChange={setShowActivityDetails}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-auto sm:!max-w-[700px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-y-auto p-4 sm:p-6">
          {activityDetails && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl lg:text-2xl">{activityDetails.name}</DialogTitle>
                <DialogDescription className="sr-only">View details about {activityDetails.name}</DialogDescription>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    <span>{activityDetails.rating}</span>
                    <span className="text-gray-500 hidden sm:inline">({activityDetails.reviews} reviews)</span>
                  </div>
                  <span>•</span>
                  <span>{activityDetails.duration}</span>
                  <span>•</span>
                  <span style={{ color: primaryColor }}>${activityDetails.price}/person</span>
                </div>
              </DialogHeader>
              <div className="mt-3 sm:mt-4">
                <div className="aspect-video rounded-lg overflow-hidden mb-3 sm:mb-4">
                  <ImageWithFallback
                    src={activityDetails.image}
                    alt={activityDetails.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm sm:text-base text-gray-600">{activityDetails.description}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {currentStep === 'booking' && (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
          <Card className="p-4 sm:p-6 overflow-y-auto">
            <h2 className="text-base sm:text-lg lg:text-xl text-gray-900 mb-4 sm:mb-6">Quick Book Your Experience</h2>

            {/* Activity Selection */}
            <div className="mb-6">
              <Label className="mb-3 block">Select Activity</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => setFormData({ ...formData, activity: activity.id })}
                    className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg ${formData.activity === activity.id ? 'shadow-lg' : 'border-gray-200'
                      }`}
                    style={{
                      borderColor: formData.activity === activity.id ? primaryColor : undefined,
                    }}
                  >
                    <div className="aspect-video relative group">
                      <ImageWithFallback
                        src={activity.image}
                        alt={activity.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedActivityId(activity.id);
                          setShowActivityDetails(true);
                        }}
                        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                      >
                        <ImageIcon className="w-4 h-4 text-gray-700" />
                      </button>
                      {activity.video && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                            <Play className="w-6 h-6 text-gray-900" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm text-gray-900">{activity.name}</h3>
                        {formData.activity === activity.id && (
                          <CheckCircle2 className="w-5 h-5" style={{ color: primaryColor }} />
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{activity.rating}</span>
                        </div>
                        <span>${activity.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Date, Time, Players */}
            <div className="space-y-6 mb-6">
              {/* Select Date */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </Label>
                <div className="border rounded-lg p-3 inline-block">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      if (date) {
                        setFormData({ ...formData, date: format(date, 'yyyy-MM-dd') });
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="rounded-md"
                  />
                </div>
              </div>

              {/* Number of Players - Horizontal Layout */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Players
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setFormData({ ...formData, players: Math.max(2, formData.players - 1) })}
                    className="h-12 w-12 text-center"
                  >
                    -
                  </Button>
                  <span className="text-2xl text-gray-900 min-w-[60px] text-center">{formData.players}</span>
                  <Button
                    variant="outline"
                    onClick={() => setFormData({ ...formData, players: Math.min(10, formData.players + 1) })}
                    className="h-12 w-12 text-center"
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time
                </Label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full h-12 rounded-lg border-2 border-gray-200 px-3 text-gray-900"
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedActivity && (
              <>
                <Separator className="my-6" />
                <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="text-gray-900">{selectedActivity.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{formData.players} × ${selectedActivity.price}</div>
                    <div className="text-2xl text-gray-900" style={{ color: primaryColor }}>
                      ${totalPrice}
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={() => setCurrentStep('cart')}
              disabled={!canAddToCart}
              className="w-full text-white h-12"
              style={{ backgroundColor: canAddToCart ? primaryColor : undefined }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>
          </Card>
        </div>
      )}

      {currentStep === 'cart' && (
        <div className="max-w-4xl mx-auto p-3 sm:p-4 md:p-8">
          <Button
            onClick={() => setCurrentStep('booking')}
            variant="outline"
            className="mb-4 sm:mb-6 min-h-[44px]"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Booking
          </Button>

          <Card className="p-3 sm:p-4 md:p-6 bg-white border border-gray-200 shadow-sm">
            <h2 className="text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Your Cart
            </h2>

            {selectedActivity && (
              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={selectedActivity.image}
                      alt={selectedActivity.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 mb-1">{selectedActivity.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Date: {selectedDate && format(selectedDate, 'dd/MM/yyyy')} at {formData.time}</div>
                      <div>Players: {formData.players} × ${selectedActivity.price}</div>
                    </div>
                  </div>
                  <div className="text-gray-900" style={{ color: primaryColor }}>
                    ${totalPrice}
                  </div>
                </div>
              </div>
            )}

            <Separator className="my-6" />

            <h3 className="text-gray-900 mb-4">Your Information</h3>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Promo Code and Gift Card Section */}
            <div className="space-y-4 mb-6">
              <div>
                {!appliedPromoCode && !showPromoCodeInput && (
                  <button
                    onClick={() => setShowPromoCodeInput(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Add promo code
                  </button>
                )}
                {showPromoCodeInput && !appliedPromoCode && (
                  <PromoCodeInput
                    onApply={handleApplyPromoCode}
                  />
                )}
                {appliedPromoCode && (
                  <PromoCodeInput
                    onApply={handleApplyPromoCode}
                    onRemove={handleRemovePromoCode}
                    appliedCode={appliedPromoCode.code}
                    appliedDiscount={appliedPromoCode.discount}
                    appliedType={appliedPromoCode.type}
                  />
                )}
              </div>

              <div>
                {!appliedGiftCard && !showGiftCardInput && (
                  <button
                    onClick={() => setShowGiftCardInput(true)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Apply gift card
                  </button>
                )}
                {showGiftCardInput && !appliedGiftCard && (
                  <GiftCardInput
                    onApply={handleApplyGiftCard}
                  />
                )}
                {appliedGiftCard && (
                  <GiftCardInput
                    onApply={handleApplyGiftCard}
                    onRemove={handleRemoveGiftCard}
                    appliedCode={appliedGiftCard.code}
                    appliedAmount={appliedGiftCard.amount}
                  />
                )}
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">${calculateSubtotal()}</span>
              </div>
              {calculateDiscount() > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Promo Code Discount:</span>
                  <span className="text-green-600">-${calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              {calculateGiftCardDiscount() > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-purple-600">Gift Card:</span>
                  <span className="text-purple-600">-${calculateGiftCardDiscount().toFixed(2)}</span>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            <div className="flex justify-between items-center mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <span className="text-gray-900">Total Amount</span>
              <span className="text-3xl text-gray-900" style={{ color: primaryColor }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <Button
              onClick={() => setCurrentStep('checkout')}
              disabled={!canCheckout}
              className="w-full text-white h-12"
              style={{ backgroundColor: canCheckout ? primaryColor : undefined }}
            >
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      )}

      {currentStep === 'checkout' && selectedActivity && (
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <Button
            onClick={() => setCurrentStep('cart')}
            variant="outline"
            className="mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-4 md:p-6">
                <h2 className="text-gray-900 mb-6 flex items-center gap-2">
                  <Lock className="w-6 h-6" />
                  Secure Payment
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Cardholder Name</Label>
                    <Input
                      value={formData.cardName}
                      onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                      placeholder="John Doe"
                      className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Card Number</Label>
                    <Input
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Expiry Date</Label>
                      <Input
                        value={formData.cardExpiry}
                        onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">CVV</Label>
                      <Input
                        value={formData.cardCVV}
                        onChange={(e) => setFormData({ ...formData, cardCVV: e.target.value })}
                        placeholder="123"
                        maxLength={4}
                        className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700 flex items-start gap-2 mt-6">
                  <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p>Your payment information is encrypted and secure</p>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-4 md:p-6 sticky top-4">
                <h3 className="text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Activity:</span>
                    <span className="text-gray-900">{selectedActivity.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">{selectedDate && format(selectedDate, 'dd/MM/yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Time:</span>
                    <span className="text-gray-900">{formData.time}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Players:</span>
                    <span className="text-gray-900">{formData.players}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-2xl text-gray-900" style={{ color: primaryColor }}>
                      ${totalPrice}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCompletePayment}
                  disabled={!canCompletePay}
                  className="w-full text-white h-12"
                  style={{ backgroundColor: canCompletePay ? primaryColor : undefined }}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Complete Payment ${totalPrice}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'success' && selectedActivity && (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <CheckCircle2 className="w-12 h-12" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-3xl text-gray-900 mb-2 text-center">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-8 text-center">Your adventure is all set</p>

            <Card className="w-full p-4 md:p-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Booking Number</span>
                  <span className="text-gray-900">{bookingNumber}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Activity</span>
                  <span className="text-gray-900">{selectedActivity.name}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="text-gray-900">
                    {selectedDate && format(selectedDate, 'dd/MM/yyyy')} at {formData.time}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Players</span>
                  <span className="text-gray-900">{formData.players} people</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-900">Total Paid</span>
                  <span className="text-2xl text-gray-900" style={{ color: primaryColor }}>${totalPrice}</span>
                </div>
              </div>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
              <p className="text-sm text-gray-700 text-center">
                A confirmation email has been sent to <strong>{formData.email}</strong>
              </p>
            </div>

            <Button
              onClick={resetBooking}
              className="text-white px-8"
              style={{ backgroundColor: primaryColor }}
            >
              Book Another Experience
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
