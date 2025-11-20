import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { VisuallyHidden } from '../ui/visually-hidden';
import { 
  Star, Clock, Users, MapPin, Award, Calendar, 
  ShoppingCart, CreditCard, Lock, CheckCircle2,
  Mail, Phone, User, ChevronLeft, Play, Image as ImageIcon,
  Info, Sparkles, ChevronRight
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { format, addMonths } from 'date-fns';

interface SingleGameWidgetProps {
  primaryColor?: string;
  gameName?: string;
  gameDescription?: string;
  gamePrice?: number;
  config?: any;
}

export function SingleGameWidget({ 
  primaryColor = '#2563eb',
  gameName = 'Mystery Manor',
  gameDescription = 'Uncover the dark secrets hidden in an abandoned Victorian mansion',
  config,
  gamePrice = 30
}: SingleGameWidgetProps) {
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(4);
  const [currentStep, setCurrentStep] = useState<'booking' | 'cart' | 'checkout' | 'success'>('booking');
  const [showGallery, setShowGallery] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    cardName: '',
  });

  const gameData = {
    name: gameName,
    description: gameDescription,
    price: gamePrice,
    duration: '60 min',
    difficulty: 'Medium',
    players: '2-8',
    rating: 4.9,
    reviews: 234,
    location: 'Downtown Location',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=800&h=600&fit=crop',
    ],
    highlights: [
      'Perfect for beginners',
      'Family friendly',
      'Award-winning design',
      'Immersive storyline',
      'Professional game master',
      'High-tech puzzles'
    ],
    features: [
      { icon: Clock, label: 'Duration', value: '60 minutes' },
      { icon: Users, label: 'Players', value: '2-8 people' },
      { icon: Award, label: 'Difficulty', value: 'Medium' },
      { icon: MapPin, label: 'Location', value: 'Downtown' },
    ]
  };

  const timeSlots = [
    { time: '10:00 AM', available: true, spots: 6 },
    { time: '11:30 AM', available: true, spots: 3 },
    { time: '1:00 PM', available: false, spots: 0 },
    { time: '2:30 PM', available: true, spots: 8 },
    { time: '4:00 PM', available: true, spots: 5 },
    { time: '5:30 PM', available: true, spots: 2 },
    { time: '7:00 PM', available: false, spots: 0 },
    { time: '8:30 PM', available: true, spots: 4 },
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const totalPrice = gameData.price * partySize;
  const bookingNumber = `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  const canAddToCart = selectedTime !== null;
  const canCheckout = customerData.name && customerData.email && customerData.phone;
  const canCompletePay = customerData.cardNumber && customerData.cardExpiry && customerData.cardCVV && customerData.cardName;

  const resetBooking = () => {
    setCurrentStep('booking');
    setSelectedDate(undefined);
    setSelectedTime(null);
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
    <div className="w-full min-h-screen bg-gray-50">
      {/* Gallery Modal - Full Screen on Mobile */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[900px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-y-auto p-4 sm:p-6">
          <VisuallyHidden>
            <DialogTitle>{gameData.name} Gallery</DialogTitle>
            <DialogDescription>View photos of {gameData.name} escape room experience</DialogDescription>
          </VisuallyHidden>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {gameData.gallery.map((image, index) => (
              <div key={index} className="aspect-video rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={image}
                  alt={`${gameData.name} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Modal - Full Screen on Mobile */}
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-auto sm:!max-w-[1200px] !rounded-none sm:!rounded-lg p-0 overflow-hidden bg-black">
          <VisuallyHidden>
            <DialogTitle>{gameData.name} Video</DialogTitle>
            <DialogDescription>Watch the video trailer for {gameData.name} escape room experience</DialogDescription>
          </VisuallyHidden>
          <div className="relative aspect-video w-full bg-black">
            <video
              className="w-full h-full"
              controls
              autoPlay
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>

      {currentStep === 'booking' && (
        <>
          {/* Hero Section */}
          <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-900 overflow-hidden">
            {/* Background Image with Parallax Effect */}
            <div className="absolute inset-0">
              <ImageWithFallback
                src={gameData.image}
                alt={gameData.name}
                className="w-full h-full object-cover scale-110 transition-transform duration-700 hover:scale-105"
              />
            </div>
            
            {/* Animated Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-blue-900/30 animate-pulse" 
                 style={{ animationDuration: '4s' }} />
            
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-purple-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            
            {/* Hero Content */}
            <div className="absolute inset-0 flex items-end">
              <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-10 lg:pb-12">
                <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0 shadow-lg text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                  <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/20 shadow-lg">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-sm">{gameData.rating}</span>
                    <span className="text-gray-200 text-xs sm:text-sm hidden sm:inline">({gameData.reviews} reviews)</span>
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white mb-2 sm:mb-3 drop-shadow-2xl">{gameData.name}</h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 mb-4 sm:mb-6 max-w-2xl drop-shadow-lg">{gameData.description}</p>
                
                {/* Quick Info */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                  {gameData.features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={idx} className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-white/20 shadow-lg">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        <div>
                          <div className="text-xs text-gray-300 hidden sm:block">{feature.label}</div>
                          <div className="text-xs sm:text-sm text-white">{feature.value}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowGallery(true)}
                    className="group bg-white/15 backdrop-blur-md text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-white/30 hover:bg-white/25 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 text-sm"
                  >
                    <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">View Gallery</span>
                    <span className="sm:hidden">Gallery</span>
                  </button>
                  <button
                    onClick={() => setShowVideo(true)}
                    className="group bg-white/15 backdrop-blur-md text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-white/30 hover:bg-white/25 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 text-sm"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform fill-white" />
                    <span className="hidden sm:inline">Watch Video</span>
                    <span className="sm:hidden">Video</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Left Column - Calendar & Time Slots */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Calendar */}
                <Card className="p-4 sm:p-6 bg-white shadow-sm border-gray-200 overflow-auto">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
                    <h2 className="text-base sm:text-lg text-gray-900">Select Date</h2>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg border-gray-300 hover:bg-gray-50"
                        onClick={() => setCalendarMonth(addMonths(calendarMonth, -1))}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm sm:text-base text-gray-900 px-2 whitespace-nowrap min-w-[140px] text-center">
                        {format(calendarMonth, 'MMMM yyyy')}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg border-gray-300 hover:bg-gray-50"
                        onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => setSelectedDate(date)}
                    month={calendarMonth}
                    onMonthChange={(m) => setCalendarMonth(m)}
                  />
                </Card>

                {/* Time Slots */}
                <Card className="p-4 sm:p-6 bg-white shadow-sm border-gray-200">
                  <h2 className="text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Available Times{selectedDate ? ` - ${format(selectedDate, 'MMM d, yyyy')}` : ''}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-2.5 sm:p-3 lg:p-4 rounded-lg border-2 text-xs sm:text-sm transition-all relative ${
                          selectedTime === slot.time
                            ? 'border-blue-600 shadow-md'
                            : slot.available
                            ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                        }`}
                        style={{
                          borderColor: selectedTime === slot.time ? primaryColor : undefined,
                          backgroundColor: selectedTime === slot.time ? `${primaryColor}10` : undefined,
                        }}
                      >
                        <div className="text-gray-900 text-center">{slot.time}</div>
                        {slot.available ? (
                          <div className="text-xs text-green-600 mt-0.5 sm:mt-1 text-center">
                            {slot.spots} spots
                          </div>
                        ) : (
                          <div className="text-xs text-red-600 mt-0.5 sm:mt-1 text-center">Sold out</div>
                        )}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-4">
                  <Card className="p-4 sm:p-6 bg-white shadow-lg border-gray-200 max-h-[calc(100vh-2rem)] overflow-y-auto">
                    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-6">
                      <h2 className="text-base sm:text-lg text-gray-900">Your Booking</h2>
                      
                      {/* Party Size */}
                      <div>
                        <label className="text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                          Number of Players
                        </label>
                        <div className="flex items-center gap-3 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPartySize(Math.max(2, partySize - 1))}
                            className="h-10 w-10 sm:h-12 sm:w-12"
                          >
                            -
                          </Button>
                          <span className="text-xl sm:text-2xl text-gray-900 min-w-[40px] text-center">{partySize}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPartySize(Math.min(8, partySize + 1))}
                            className="h-10 w-10 sm:h-12 sm:w-12"
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Summary Details */}
                      <div className="space-y-2 sm:space-y-3 pb-4 sm:pb-6 border-b border-gray-200">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Game:</span>
                          <span className="text-gray-900 text-right truncate max-w-[60%]">{gameData.name}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Date:</span>
                          <span className="text-gray-900">Nov {selectedDate}, 2025</span>
                        </div>
                        {selectedTime && (
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-600">Time:</span>
                            <span className="text-gray-900">{selectedTime}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Players:</span>
                          <span className="text-gray-900">{partySize}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div>
                        <div className="flex justify-between mb-2 text-xs sm:text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="text-gray-900">${gameData.price} × {partySize}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="text-sm sm:text-base text-gray-900">Total:</span>
                          <span className="text-xl sm:text-2xl text-gray-900" style={{ color: primaryColor }}>
                            ${totalPrice}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full h-10 sm:h-12 text-sm sm:text-base"
                        >
                          <Info className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          onClick={() => setCurrentStep('cart')}
                          disabled={!canAddToCart}
                          className="w-full text-white h-12 sm:h-14 text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all whitespace-nowrap"
                          style={{ 
                            backgroundColor: canAddToCart ? primaryColor : undefined,
                            opacity: canAddToCart ? 1 : 0.5
                          }}
                        >
                          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {currentStep === 'cart' && (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 min-h-screen pb-24 sm:pb-8">
          <Button
            onClick={() => setCurrentStep('booking')}
            variant="outline"
            className="mb-4 sm:mb-6 h-9 sm:h-10 text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Booking
          </Button>

          <Card className="p-4 sm:p-6 overflow-y-auto">
            <h2 className="text-lg sm:text-xl lg:text-2xl text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              Your Cart
            </h2>

            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={gameData.image}
                    alt={gameData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900 mb-1">{gameData.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Date: {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Not selected'} at {selectedTime || 'Not selected'}</div>
                    <div>Players: {partySize} × ${gameData.price}</div>
                  </div>
                </div>
                <div className="text-xl text-gray-900" style={{ color: primaryColor }}>
                  ${totalPrice}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            <h3 className="text-xl text-gray-900 mb-4">Your Information</h3>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  placeholder="John Doe"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="h-12"
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
              <span className="text-xl text-gray-900">Total Amount</span>
              <span className="text-3xl text-gray-900" style={{ color: primaryColor }}>
                ${totalPrice}
              </span>
            </div>

            <Button
              onClick={() => setCurrentStep('checkout')}
              disabled={!canCheckout}
              className="w-full text-white h-14 text-lg shadow-lg hover:shadow-xl"
              style={{ backgroundColor: canCheckout ? primaryColor : undefined }}
            >
              Proceed to Checkout
              <ChevronLeft className="w-5 h-5 ml-2 rotate-180" />
            </Button>
          </Card>
        </div>
      )}

      {currentStep === 'checkout' && (
        <div className="max-w-6xl mx-auto p-4 md:p-8 min-h-screen">
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
              <Card className="p-4 md:p-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
                <h2 className="text-2xl text-gray-900 mb-6 flex items-center gap-2">
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
                  <h3 className="text-xl text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Experience:</span>
                    <span className="text-gray-900">{gameData.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Date:</span>
                    <span className="text-gray-900">Nov {selectedDate}, 2025</span>
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
                    <span className="text-lg text-gray-900">Total</span>
                    <span className="text-2xl text-gray-900" style={{ color: primaryColor }}>
                      ${totalPrice}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setCurrentStep('success')}
                  disabled={!canCompletePay}
                  className="w-full text-white h-14 text-lg shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: canCompletePay ? primaryColor : undefined }}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Complete Payment ${totalPrice}
                </Button>
              </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'success' && (
        <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen">
          <div className="flex flex-col items-center justify-center py-8 md:py-12 max-h-screen overflow-y-auto">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-pulse"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <CheckCircle2 className="w-16 h-16" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-4xl text-gray-900 mb-3 text-center">Booking Confirmed!</h2>
            <p className="text-xl text-gray-600 mb-8 text-center">Your escape room adventure is all set</p>

            <Card className="w-full p-6 md:p-8 mb-6 shadow-xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Booking Number</span>
                  <span className="text-xl text-gray-900">{bookingNumber}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Experience</span>
                  <span className="text-gray-900">{gameData.name}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="text-gray-900">
                    Nov {selectedDate}, 2025 at {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Players</span>
                  <span className="text-gray-900">{partySize} people</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl text-gray-900">Total Paid</span>
                  <span className="text-3xl text-gray-900" style={{ color: primaryColor }}>${totalPrice}</span>
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
              className="text-white px-8 h-14 text-lg shadow-lg"
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
