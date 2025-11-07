import { useState, useEffect } from 'react';
import DataSyncServiceWithEvents, { DataSyncEvents } from '../../services/DataSyncService';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { VisuallyHidden } from '../ui/visually-hidden';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { 
  Clock, Users, Star, Play, ChevronRight, Award, Zap, Heart,
  Calendar, ShoppingCart, CreditCard, Lock, CheckCircle2, 
  Mail, Phone, User, ChevronLeft, ImageIcon
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { format } from 'date-fns';
import { PromoCodeInput } from './PromoCodeInput';
import { GiftCardInput } from './GiftCardInput';

interface BookGoWidgetProps {
  primaryColor?: string;
  config?: any;
}

export function BookGoWidget({ primaryColor = '#2563eb', config }: BookGoWidgetProps) {
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(4);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
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
  
  // Promo code and gift card state
  const [showPromoCodeInput, setShowPromoCodeInput] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null);
  const [showGiftCardInput, setShowGiftCardInput] = useState(false);
  const [appliedGiftCard, setAppliedGiftCard] = useState<{ code: string; amount: number } | null>(null);

  // 🔄 Real-time admin games data loading
  const [adminGames, setAdminGames] = useState<any[]>([]);

  // Load admin games with real-time sync
  useEffect(() => {
    const loadAndSubscribeGames = () => {
      // Initial load
      const games = DataSyncServiceWithEvents.getAllGames();
      console.log('📦 ListWidget loaded', games.length, 'games from admin');
      setAdminGames(games);

      // Real-time sync: Listen for admin changes
      const handleGamesUpdate = () => {
        const updatedGames = DataSyncServiceWithEvents.getAllGames();
        console.log('🔄 ListWidget games updated in real-time!', updatedGames.length);
        setAdminGames(updatedGames);
      };

      // Subscribe to events
      DataSyncEvents.subscribe('games-updated', handleGamesUpdate);

      // Cleanup function
      return () => {
        DataSyncEvents.unsubscribe('games-updated', handleGamesUpdate);
      };
    };

    return loadAndSubscribeGames();
  }, []);

  // 🔄 Use admin games when available, fallback to hardcoded experiences
  const experiences = adminGames.length > 0 ? adminGames.map(g => ({
    id: g.id.toString(),
    name: g.name,
    description: g.description || 'Amazing escape room experience',
    duration: g.duration,
    difficulty: g.difficulty || 'Medium',
    minAge: 10,
    maxPlayers: g.capacity,
    price: g.basePrice,
    rating: 4.8,
    reviews: 156,
    image: g.imageUrl,
    tags: ['Family Friendly', 'Adventure', 'Puzzle']
  })) : [
    {
      id: '1',
      name: 'Mystery Manor',
      tagline: 'Uncover the secrets of an abandoned Victorian mansion',
      duration: 60,
      difficulty: 'Medium',
      rating: 4.9,
      reviews: 234,
      price: 30,
      featured: true,
      image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=400&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=800&h=600&fit=crop',
      ],
      videoThumb: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=400&fit=crop',
      availability: ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM'],
      features: ['Beginner Friendly', 'Atmospheric', 'Award Winning'],
      players: '2-8 players',
    },
    {
      id: '2',
      name: 'Space Odyssey',
      tagline: 'Race against time to save your crew in deep space',
      duration: 75,
      difficulty: 'Hard',
      rating: 4.8,
      reviews: 189,
      price: 35,
      featured: false,
      image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=600&h=400&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop',
      ],
      videoThumb: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=600&h=400&fit=crop',
      availability: ['11:00 AM', '2:00 PM', '5:00 PM', '8:00 PM'],
      features: ['Advanced', 'Team Building', 'High Tech'],
      players: '4-10 players',
    },
    {
      id: '3',
      name: 'Zombie Outbreak',
      tagline: 'Find the cure before the apocalypse spreads worldwide',
      duration: 60,
      difficulty: 'Medium',
      rating: 4.7,
      reviews: 312,
      price: 30,
      featured: true,
      image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&h=400&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=800&h=600&fit=crop',
      ],
      videoThumb: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&h=400&fit=crop',
      availability: ['10:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '9:00 PM'],
      features: ['Action Packed', 'Horror Elements', 'Popular'],
      players: '3-8 players',
    },
  ];

  const selectedExp = experiences.find(e => e.id === selectedExperience);
  
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
  const calculateSubtotal = () => selectedExp ? selectedExp.price * partySize : 0;
  
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

  const canProceed = () => {
    if (currentStep === 'booking') return selectedDate && selectedTime;
    if (currentStep === 'cart') return customerData.name && customerData.email && customerData.phone;
    if (currentStep === 'checkout') return customerData.cardNumber && customerData.cardExpiry && customerData.cardCVV && customerData.cardName;
    return true;
  };

  const resetBooking = () => {
    setCurrentStep('browse');
    setSelectedExperience(null);
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
    setAppliedPromoCode(null);
    setAppliedGiftCard(null);
    setShowPromoCodeInput(false);
    setShowGiftCardInput(false);
  };

  // 🎯 Handle payment completion with localStorage save
  const handleCompletePayment = () => {
    try {
      // Validate form data
      if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
        alert('Please fill in all customer details');
        return;
      }

      if (!selectedExperience || !selectedDate || !selectedTime) {
        alert('Please complete booking details');
        return;
      }

      const selectedExp = experiences.find(e => e.id === selectedExperience);

      // Create booking data
      const bookingData = {
        gameName: selectedExp?.name || '',
        gameId: selectedExperience || '',
        date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
        time: selectedTime || '',
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        participants: partySize,
        ticketTypes: [{
          id: 'standard',
          name: 'Standard Ticket',
          price: selectedExp?.price || 0,
          quantity: partySize,
          subtotal: (selectedExp?.price || 0) * partySize
        }],
        totalPrice: totalPrice,
        promoCode: appliedPromoCode?.code,
        giftCardCredit: appliedGiftCard?.amount
      };

      // Save booking using DataSyncService
      const savedBooking = DataSyncServiceWithEvents.saveBooking(bookingData);

      console.log('✅ ListWidget booking saved:', savedBooking.id);
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
      {/* Image Gallery Dialog - Full Screen on Mobile */}
      <Dialog open={showImageGallery} onOpenChange={setShowImageGallery}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[900px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-y-auto p-4 sm:p-6">
          <VisuallyHidden>
            <DialogTitle>Image Gallery</DialogTitle>
            <DialogDescription>View photos of escape room experiences</DialogDescription>
          </VisuallyHidden>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {galleryImages.map((image, index) => (
              <div key={index} className="aspect-video rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {currentStep === 'browse' && (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-gray-900 mb-2">Escape Room Experiences</h1>
            <p className="text-sm sm:text-base text-gray-600">Choose your adventure and book instantly</p>
          </div>

          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {experiences.map((exp) => (
              <Card key={exp.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6">
                  {/* Image */}
                  <div className="lg:col-span-4 relative group h-48 sm:h-56 lg:h-auto">
                    <ImageWithFallback
                      src={exp.image}
                      alt={exp.name}
                      className="w-full h-full object-cover"
                    />
                    {exp.featured && (
                      <Badge 
                        className="absolute top-2 left-2 sm:top-3 sm:left-3 text-xs"
                        style={{ backgroundColor: primaryColor, color: 'white' }}
                      >
                        <Star className="w-3 h-3 mr-1 fill-white" />
                        Featured
                      </Badge>
                    )}
                    <button
                      onClick={() => {
                        setGalleryImages(exp.gallery);
                        setShowImageGallery(true);
                      }}
                      className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-gray-700" />
                    </button>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-8 p-4 sm:p-6">
                    <div className="flex flex-col h-full">
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <h2 className="text-lg sm:text-xl lg:text-2xl text-gray-900">{exp.name}</h2>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm sm:text-base text-gray-900">{exp.rating}</span>
                            <span className="text-gray-500 text-xs sm:text-sm hidden sm:inline">({exp.reviews})</span>
                          </div>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">{exp.tagline}</p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {exp.features.map((feature, idx) => {
                          const icons = [Award, Zap, Heart];
                          const Icon = icons[idx % icons.length];
                          return (
                            <Badge key={feature} variant="secondary" className="bg-gray-100 text-xs">
                              <Icon className="w-3 h-3 mr-1" />
                              {feature}
                            </Badge>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div>
                          <div className="text-xs sm:text-sm text-gray-600 mb-1">Duration</div>
                          <div className="flex items-center gap-1 text-sm sm:text-base text-gray-900">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{exp.duration} min</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-600 mb-1">Difficulty</div>
                          <div className="text-sm sm:text-base text-gray-900">{exp.difficulty}</div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-600 mb-1">Players</div>
                          <div className="flex items-center gap-1 text-sm sm:text-base text-gray-900">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>{exp.players}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-600 mb-1">Price</div>
                          <div className="text-lg sm:text-xl text-gray-900" style={{ color: primaryColor }}>
                            ${exp.price}
                          </div>
                        </div>
                      </div>

                      <div className="mt-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
                        <div className="text-xs sm:text-sm text-gray-600">
                          {exp.availability.length} time slots available
                        </div>
                        <Button
                          onClick={() => {
                            setSelectedExperience(exp.id);
                            setCurrentStep('booking');
                          }}
                          className="text-white h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all whitespace-nowrap"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Book Now
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {currentStep === 'booking' && selectedExp && (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
          <Button
            onClick={() => setCurrentStep('browse')}
            variant="outline"
            className="mb-4 sm:mb-6 h-9 sm:h-10 text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Experiences
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <Card className="p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl text-gray-900 mb-2">{selectedExp.name}</h2>
                  <p className="text-sm sm:text-base text-gray-600">{selectedExp.tagline}</p>
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
                    <Label className="flex items-center gap-2 text-sm sm:text-base">
                      <Users className="w-4 h-4" />
                      Number of Players
                    </Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setPartySize(Math.max(2, partySize - 1))}
                        className="h-10 w-10 sm:h-12 sm:w-12 text-center"
                      >
                        -
                      </Button>
                      <span className="text-xl sm:text-2xl text-gray-900 min-w-[50px] sm:min-w-[60px] text-center">{partySize}</span>
                      <Button
                        variant="outline"
                        onClick={() => setPartySize(Math.min(10, partySize + 1))}
                        className="h-10 w-10 sm:h-12 sm:w-12 text-center"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base">Select Time</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {selectedExp.availability.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2.5 sm:p-3 rounded-lg border-2 transition-all text-center ${
                            selectedTime === time
                              ? 'shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          style={{
                            borderColor: selectedTime === time ? primaryColor : undefined,
                            backgroundColor: selectedTime === time ? `${primaryColor}10` : undefined,
                          }}
                        >
                          <div className="text-xs sm:text-sm text-gray-900">{time}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-4 sm:p-6 lg:sticky lg:top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
                <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-6">
                  <h3 className="text-base sm:text-lg text-gray-900">Booking Summary</h3>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Experience:</span>
                      <span className="text-gray-900 text-right truncate max-w-[60%]">{selectedExp.name}</span>
                    </div>
                    {selectedDate && (
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span className="text-gray-900">{format(selectedDate, 'dd/MM/yyyy')}</span>
                      </div>
                    )}
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
                    <Separator />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm sm:text-base text-gray-900">Total:</span>
                      <span className="text-xl sm:text-2xl text-gray-900" style={{ color: primaryColor }}>
                        ${totalPrice}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setCurrentStep('cart')}
                    disabled={!canProceed()}
                    className="w-full text-white h-11 sm:h-12 text-sm sm:text-base"
                    style={{ backgroundColor: canProceed() ? primaryColor : undefined }}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'cart' && selectedExp && (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
          <Button
            onClick={() => setCurrentStep('booking')}
            variant="outline"
            className="mb-4 sm:mb-6 h-9 sm:h-10 text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              Your Cart
            </h2>

            <div className="p-3 sm:p-4 bg-white border border-gray-200 rounded-lg mb-4 sm:mb-6">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={selectedExp.image}
                    alt={selectedExp.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base text-gray-900 mb-1 truncate">{selectedExp.name}</h3>
                  <div className="text-xs sm:text-sm text-gray-600 space-y-0.5 sm:space-y-1">
                    <div>Date: {selectedDate && format(selectedDate, 'dd/MM/yyyy')} at {selectedTime}</div>
                    <div>Players: {partySize} × ${selectedExp.price}</div>
                  </div>
                </div>
                <div className="text-sm sm:text-base text-gray-900 flex-shrink-0" style={{ color: primaryColor }}>
                  ${totalPrice}
                </div>
              </div>
            </div>

            <Separator className="my-4 sm:my-6" />

            <h3 className="text-base sm:text-lg text-gray-900 mb-3 sm:mb-4">Your Information</h3>
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  placeholder="John Doe"
                  className="h-10 sm:h-12 text-sm sm:text-base bg-gray-100 border-gray-300 placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="h-10 sm:h-12 text-sm sm:text-base bg-gray-100 border-gray-300 placeholder:text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="h-10 sm:h-12 text-sm sm:text-base bg-gray-100 border-gray-300 placeholder:text-gray-500"
                />
              </div>
            </div>

            <Separator className="my-4 sm:my-6" />

            {/* Promo Code and Gift Card Section */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
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
                    className="mb-4"
                  />
                )}
                {appliedPromoCode && (
                  <PromoCodeInput
                    onApply={handleApplyPromoCode}
                    onRemove={handleRemovePromoCode}
                    appliedCode={appliedPromoCode.code}
                    appliedDiscount={appliedPromoCode.discount}
                    appliedType={appliedPromoCode.type}
                    className="mb-4"
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
                    className="mb-4"
                  />
                )}
                {appliedGiftCard && (
                  <GiftCardInput
                    onApply={handleApplyGiftCard}
                    onRemove={handleRemoveGiftCard}
                    appliedCode={appliedGiftCard.code}
                    appliedAmount={appliedGiftCard.amount}
                    className="mb-4"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
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

            <Separator className="my-4 sm:my-6" />

            <div className="flex justify-between items-center mb-4 sm:mb-6 p-3 sm:p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <span className="text-sm sm:text-base text-gray-900">Total Amount</span>
              <span className="text-2xl sm:text-3xl text-gray-900" style={{ color: primaryColor }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            <Button
              onClick={() => setCurrentStep('checkout')}
              disabled={!canProceed()}
              className="w-full text-white h-11 sm:h-12 text-sm sm:text-base"
              style={{ backgroundColor: canProceed() ? primaryColor : undefined }}
            >
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      )}

      {currentStep === 'checkout' && selectedExp && (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 sm:pb-8">
          <Button
            onClick={() => setCurrentStep('cart')}
            variant="outline"
            className="mb-4 sm:mb-6 h-9 sm:h-10 text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <Card className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                  Secure Payment
                </h2>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Cardholder Name</Label>
                    <Input
                      value={customerData.cardName}
                      onChange={(e) => setCustomerData({ ...customerData, cardName: e.target.value })}
                      placeholder="John Doe"
                      className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">Card Number</Label>
                    <Input
                      value={customerData.cardNumber}
                      onChange={(e) => setCustomerData({ ...customerData, cardNumber: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700">Expiry Date</Label>
                      <Input
                        value={customerData.cardExpiry}
                        onChange={(e) => setCustomerData({ ...customerData, cardExpiry: e.target.value })}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700">CVV</Label>
                      <Input
                        value={customerData.cardCVV}
                        onChange={(e) => setCustomerData({ ...customerData, cardCVV: e.target.value })}
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
                    <span className="text-gray-600">Experience:</span>
                    <span className="text-gray-900">{selectedExp.name}</span>
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
                  onClick={handleCompletePayment}
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
      )}

      {currentStep === 'success' && selectedExp && (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <CheckCircle2 className="w-12 h-12" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-3xl text-gray-900 mb-2 text-center">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-8 text-center">Your escape room adventure is all set</p>

            <Card className="w-full p-4 md:p-6 mb-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Booking Number</span>
                  <span className="text-gray-900">{bookingNumber}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Experience</span>
                  <span className="text-gray-900">{selectedExp.name}</span>
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
      )}
    </div>
  );
}
