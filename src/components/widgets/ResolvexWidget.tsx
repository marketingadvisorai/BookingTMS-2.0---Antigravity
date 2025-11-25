import { useState, useEffect } from 'react';
import {
  Star, Users, Clock, MapPin, ShoppingCart, CreditCard, Lock, CheckCircle2,
  Mail, Phone, User as UserIcon, ChevronLeft, Calendar
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent } from '../ui/dialog';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { format } from 'date-fns';
import { PromoCodeInput } from './PromoCodeInput';
import { GiftCardInput } from './GiftCardInput';
import DataSyncServiceWithEvents, { DataSyncEvents } from '../../services/DataSyncService';

interface ResolvexWidgetProps {
  primaryColor?: string;
  config?: any;
}

interface Activity {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  category: string;
  players: string;
  duration: string;
  price: number;
  location: string;
}

export function ResolvexWidget({ primaryColor = '#2563eb', config }: ResolvexWidgetProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [partySize, setPartySize] = useState(4);
  const [currentStep, setCurrentStep] = useState<'browse' | 'booking' | 'cart' | 'checkout' | 'success'>('browse');
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    cardName: '',
  });

  // Load admin activities with real-time sync
  const [adminActivities, setAdminActivities] = useState<any[]>([]);

  useEffect(() => {
    const loadActivities = async () => {
      // Load initial admin activities
      const activities = await DataSyncServiceWithEvents.getAllActivities();
      setAdminActivities(activities);
      console.log('🎮 ResolvexWidget: Admin activities loaded:', activities.length);
    };

    loadActivities();

    // Subscribe to real-time updates
    const handleActivitiesUpdate = async () => {
      const updatedActivities = await DataSyncServiceWithEvents.getAllActivities();
      setAdminActivities(updatedActivities);
      console.log('🔄 ResolvexWidget: Admin activities updated:', updatedActivities.length);
    };

    DataSyncEvents.subscribe('activities-updated', handleActivitiesUpdate);

    // Cleanup on unmount
    return () => {
      DataSyncEvents.unsubscribe('activities-updated', handleActivitiesUpdate);
    };
  }, []);

  // Map admin activities to Resolvex format or use fallback
  const activities: Activity[] = adminActivities.length > 0 ? adminActivities.map(g => ({
    id: g.id,
    name: g.name,
    description: g.description || 'Exciting escape room adventure',
    image: g.imageUrl || 'https://images.unsplash.com/photo-1571386630530-12fa47ebed6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
    rating: g.difficulty || 4,
    category: 'Adventure',
    players: `2-${g.capacity}`,
    duration: g.duration,
    price: g.basePrice,
    location: 'Main Location',
  })) : [
    {
      id: '1',
      name: 'Mystery Manor',
      description: 'Uncover hidden truths in this Victorian mystery.',
      image: 'https://images.unsplash.com/photo-1571386630530-12fa47ebed6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      rating: 5,
      category: 'Mystery',
      players: '2-8',
      duration: '60 min',
      price: 30,
      location: 'Main Street Location',
    },
    {
      id: '2',
      name: 'Space Odyssey',
      description: 'Race against time in deep space.',
      image: 'https://images.unsplash.com/photo-1640525381904-4d92e378fbb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      rating: 4,
      category: 'Sci-Fi',
      players: '4-10',
      duration: '75 min',
      price: 35,
      location: 'Downtown Location',
    },
    {
      id: '3',
      name: "Pirate's Treasure",
      description: 'Ahoy! Adventure awaits on the high seas.',
      image: 'https://images.unsplash.com/photo-1633465091434-117f2bcffd9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      rating: 4,
      category: 'Adventure',
      players: '3-8',
      duration: '90 min',
      price: 32,
      location: 'Harbor District',
    },
    {
      id: '4',
      name: 'Zombie Apocalypse',
      description: 'Survive the undead outbreak and find the cure.',
      image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=1080',
      rating: 5,
      category: 'Horror',
      players: '3-8',
      duration: '60 min',
      price: 30,
      location: 'Warehouse District',
    },
    {
      id: '5',
      name: 'Ancient Temple',
      description: 'Discover ancient secrets and escape the curse.',
      image: 'https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=1080',
      rating: 4,
      category: 'Adventure',
      players: '2-6',
      duration: '60 min',
      price: 28,
      location: 'City Center',
    },
    {
      id: '6',
      name: 'Cyber Heist',
      description: 'Hack the system and escape with the data.',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1080',
      rating: 5,
      category: 'Thriller',
      players: '4-8',
      duration: '75 min',
      price: 35,
      location: 'Tech District',
    },
  ];

  const timeSlots = [
    '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM', '8:00 PM'
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const totalPrice = selectedActivity ? selectedActivity.price * partySize : 0;
  const bookingNumber = `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const canProceed = () => {
    if (currentStep === 'booking') return selectedDate && selectedTime;
    if (currentStep === 'cart') return customerData.name && customerData.email && customerData.phone;
    if (currentStep === 'checkout') return customerData.cardNumber && customerData.cardExpiry && customerData.cardCVV && customerData.cardName;
    return true;
  };

  const resetBooking = () => {
    setCurrentStep('browse');
    setSelectedActivity(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setPartySize(4);
    setCustomerData({
      name: '',
      email: '',
      phone: '',
      cardNumber: '',
      cardExpiry: '',
      cardCVV: '',
      cardName: '',
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-900">
      {/* Browse Activities */}
      {currentStep === 'browse' && (
        <div className="p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl text-white mb-2">Choose Your Adventure</h1>
              <p className="text-sm sm:text-base text-gray-400">Select an activity</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => {
                    setSelectedActivity(activity);
                    setCurrentStep('booking');
                  }}
                  className="group relative rounded-xl overflow-hidden cursor-pointer h-[350px] sm:h-[400px] lg:h-[450px] transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  {/* Activity Image */}
                  <ImageWithFallback
                    src={activity.image}
                    alt={activity.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                  {/* Rating Badge */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/60 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1 sm:py-1.5 flex items-center gap-0.5 sm:gap-1">
                    {renderStars(activity.rating)}
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1">
                    <span className="text-xs text-gray-900">{activity.category}</span>
                  </div>

                  {/* Activity Title and Description */}
                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3">
                    <h3 className="text-base sm:text-lg text-white mb-1">{activity.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-300 mb-2 sm:mb-3 line-clamp-2">{activity.description}</p>

                    {/* Activity Details */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-gray-300 mb-2 sm:mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{activity.players}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{activity.duration}</span>
                      </div>
                      <div className="flex items-center gap-1 hidden sm:flex">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[120px]">{activity.location}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-green-400 text-xl sm:text-2xl">${activity.price}</span>
                        <span className="text-gray-400 text-xs sm:text-sm">/person</span>
                      </div>
                      <button
                        className="bg-white text-gray-900 px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all whitespace-nowrap"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking Step */}
      {currentStep === 'booking' && selectedActivity && (
        <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen pb-24 sm:pb-8">
          <div className="max-w-6xl mx-auto">
            <Button
              onClick={() => setCurrentStep('browse')}
              variant="outline"
              className="mb-4 sm:mb-6 h-9 sm:h-10 text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Activities
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2">
                <Card className="p-4 sm:p-6 mb-4 sm:mb-6">
                  <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <ImageWithFallback
                        src={selectedActivity.image}
                        alt={selectedActivity.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-base sm:text-lg lg:text-xl text-gray-900 mb-1 sm:mb-2 truncate">{selectedActivity.name}</h2>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">{selectedActivity.description}</p>
                      <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                          {selectedActivity.players}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          {selectedActivity.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate max-w-[120px]">{selectedActivity.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4 sm:my-6" />

                  <div className="space-y-4 sm:space-y-6">
                    {/* Select Date */}
                    <div className="space-y-2">
                      <Label className="text-sm sm:text-base">Select Date</Label>
                      <div className="border rounded-lg p-2 sm:p-3 inline-block w-full sm:w-auto">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          className="rounded-md"
                        />
                      </div>
                    </div>

                    {/* Number of Players - Horizontal Layout */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Number of Players
                      </Label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setPartySize(Math.max(2, partySize - 1))}
                          className="h-12 w-12 text-center"
                        >
                          -
                        </Button>
                        <span className="text-2xl text-gray-900 min-w-[60px] text-center">{partySize}</span>
                        <Button
                          variant="outline"
                          onClick={() => setPartySize(Math.min(10, partySize + 1))}
                          className="h-12 w-12 text-center"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Select Time</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {timeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`p-3 rounded-lg border-2 transition-all text-center ${selectedTime === time
                              ? 'shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                              }`}
                            style={{
                              borderColor: selectedTime === time ? primaryColor : undefined,
                              backgroundColor: selectedTime === time ? `${primaryColor}10` : undefined,
                            }}
                          >
                            <div className="text-sm text-gray-900">{time}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                  <Card className="p-4 md:p-6">
                    <h3 className="text-gray-900 mb-4">Booking Summary</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Activity:</span>
                        <span className="text-gray-900">{selectedActivity.name}</span>
                      </div>
                      {selectedDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Date:</span>
                          <span className="text-gray-900">{format(selectedDate, 'dd/MM/yyyy')}</span>
                        </div>
                      )}
                      {selectedTime && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Time:</span>
                          <span className="text-gray-900">{selectedTime}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Players:</span>
                        <span className="text-gray-900">{partySize}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-2xl text-gray-900" style={{ color: primaryColor }}>
                          ${totalPrice}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => setCurrentStep('cart')}
                      disabled={!canProceed()}
                      className="w-full text-white"
                      style={{ backgroundColor: canProceed() ? primaryColor : undefined }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Step */}
      {currentStep === 'cart' && selectedActivity && (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
            <Button
              onClick={() => setCurrentStep('booking')}
              variant="outline"
              className="mb-6"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Card className="p-4 md:p-6">
              <h2 className="text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6" />
                Your Cart
              </h2>

              <div className="p-4 bg-white border border-gray-200 rounded-lg mb-6">
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
                      <div>Date: {selectedDate && format(selectedDate, 'dd/MM/yyyy')} at {selectedTime}</div>
                      <div>Players: {partySize} × ${selectedActivity.price}</div>
                    </div>
                  </div>
                  <div className="text-gray-900" style={{ color: primaryColor }}>
                    ${totalPrice}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <h3 className="text-gray-900 mb-4">Your Information</h3>
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <UserIcon className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
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
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
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
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                  />
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-3xl text-gray-900" style={{ color: primaryColor }}>
                  ${totalPrice}
                </span>
              </div>

              <Button
                onClick={() => setCurrentStep('checkout')}
                disabled={!canProceed()}
                className="w-full text-white h-12"
                style={{ backgroundColor: canProceed() ? primaryColor : undefined }}
              >
                Proceed to Checkout
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Checkout Step */}
      {currentStep === 'checkout' && selectedActivity && (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
          <div className="max-w-6xl mx-auto">
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
                      <Label>Cardholder Name</Label>
                      <Input
                        value={customerData.cardName}
                        onChange={(e) => setCustomerData({ ...customerData, cardName: e.target.value })}
                        placeholder="John Doe"
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Card Number</Label>
                      <Input
                        value={customerData.cardNumber}
                        onChange={(e) => setCustomerData({ ...customerData, cardNumber: e.target.value })}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="h-12"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input
                          value={customerData.cardExpiry}
                          onChange={(e) => setCustomerData({ ...customerData, cardExpiry: e.target.value })}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CVV</Label>
                        <Input
                          value={customerData.cardCVV}
                          onChange={(e) => setCustomerData({ ...customerData, cardCVV: e.target.value })}
                          placeholder="123"
                          maxLength={4}
                          className="h-12"
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
                <div className="lg:sticky lg:top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                  <Card className="p-4 md:p-6">
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
                        <span className="text-gray-900">{selectedTime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Players:</span>
                        <span className="text-gray-900">{partySize}</span>
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
                      onClick={() => {
                        try {
                          // Prepare booking data for localStorage
                          const bookingDataForStorage = {
                            activityName: selectedActivity?.name || '',
                            activityId: selectedActivity?.id || '',
                            date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
                            time: selectedTime,
                            customerName: customerData.name,
                            customerEmail: customerData.email,
                            customerPhone: customerData.phone,
                            participants: partySize,
                            ticketTypes: [{
                              id: 'standard',
                              name: 'Standard Ticket',
                              price: selectedActivity?.price || 0,
                              quantity: partySize,
                              subtotal: (selectedActivity?.price || 0) * partySize
                            }],
                            totalPrice: totalPrice
                          };

                          // Save booking to localStorage using DataSyncService
                          const savedBooking = DataSyncServiceWithEvents.saveBooking(bookingDataForStorage);
                          console.log('✅ Resolvex booking saved:', savedBooking.id);

                          // Show success step
                          setCurrentStep('success');
                        } catch (error) {
                          console.error('❌ Error saving Resolvex booking:', error);
                          alert('Error saving booking. Please try again.');
                        }
                      }}
                      disabled={!canProceed()}
                      className="w-full text-white h-12"
                      style={{ backgroundColor: canProceed() ? primaryColor : undefined }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Complete Payment ${totalPrice}
                    </Button>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Step */}
      {currentStep === 'success' && selectedActivity && (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
          <div className="max-w-4xl mx-auto">
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
                      {selectedDate && format(selectedDate, 'dd/MM/yyyy')} at {selectedTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <span className="text-gray-600">Players</span>
                    <span className="text-gray-900">{partySize} people</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-900">Total Paid</span>
                    <span className="text-2xl text-gray-900" style={{ color: primaryColor }}>${totalPrice}</span>
                  </div>
                </div>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
                <p className="text-sm text-gray-700 text-center">
                  A confirmation email has been sent to <strong>{customerData.email}</strong>
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
        </div>
      )}
    </div>
  );
}
