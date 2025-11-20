import { useState, useEffect } from 'react';
import { DataSyncService as DataSyncServiceWithEvents } from '../../services/DataSyncService';
import SupabaseBookingService from '../../services/SupabaseBookingService';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { VisuallyHidden } from '../ui/visually-hidden';
import { 
  Check, ChevronRight, ChevronLeft, Calendar, Clock, 
  Users, Mail, Phone, User, CreditCard, Lock, Star, Play, 
  Image as ImageIcon, ShoppingCart, CheckCircle2, X
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { format } from 'date-fns';

interface MultiStepWidgetProps {
  primaryColor?: string;
  config?: any;
}

export function MultiStepWidget({ primaryColor = '#2563eb', config }: MultiStepWidgetProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showGallery, setShowGallery] = useState(false);
  const [selectedGameForGallery, setSelectedGameForGallery] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingData, setBookingData] = useState({
    game: '',
    date: '',
    time: '',
    players: 4,
    name: '',
    email: '',
    phone: '',
    addOns: [] as string[],
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    cardName: '',
  });

  // 🔄 Real-time admin games data loading
  const [adminGames, setAdminGames] = useState<any[]>([]);

  // Load admin games with real-time sync
  useEffect(() => {
    const loadAndSubscribeGames = () => {
      // Initial load
      const games = DataSyncServiceWithEvents.getAllGames();
      console.log('📦 MultiStepWidget loaded', games.length, 'games from admin');
      setAdminGames(games);

      // Real-time sync: Listen for admin changes
      const handleGamesUpdate = () => {
        const updatedGames = DataSyncServiceWithEvents.getAllGames();
        console.log('🔄 MultiStepWidget games updated in real-time!', updatedGames.length);
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

  // 🔄 Use admin games when available, fallback to hardcoded games
  const games = adminGames.length > 0 ? adminGames.map(g => ({
    id: g.id.toString(),
    name: g.name,
    duration: g.duration,
    price: g.basePrice,
    rating: 4.8,
    reviews: 156,
    image: g.imageUrl,
    gallery: [g.imageUrl],
    description: g.description || 'Amazing escape room experience',
    maxPlayers: g.capacity,
    minPlayers: 2
  })) : [
    {
      id: '1',
      name: 'Mystery Manor',
      duration: 60,
      price: 30,
      rating: 4.9,
      reviews: 234,
      image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=400&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
      ],
      tagline: 'Uncover the secrets of an abandoned Victorian mansion',
    },
    {
      id: '2',
      name: 'Space Odyssey',
      duration: 75,
      price: 35,
      rating: 4.8,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=600&h=400&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&h=600&fit=crop',
      ],
      tagline: 'Save your crew from catastrophic ship malfunction',
    },
    {
      id: '3',
      name: 'Zombie Outbreak',
      duration: 60,
      price: 30,
      rating: 4.7,
      reviews: 312,
      image: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=600&h=400&fit=crop',
      gallery: [
        'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1518709414768-a88981a4515d?w=800&h=600&fit=crop',
      ],
      tagline: 'Survive the apocalypse and find the cure',
    },
  ];

  const timeSlots = [
    { time: '10:00 AM', available: true },
    { time: '12:00 PM', available: true },
    { time: '2:00 PM', available: false },
    { time: '4:00 PM', available: true },
    { time: '6:00 PM', available: true },
    { time: '8:00 PM', available: true },
  ];
  
  const addOns = [
    { id: 'photo', name: 'Professional Photo Package', price: 15, description: 'High-quality photos of your experience' },
    { id: 'video', name: 'Video Recording', price: 25, description: 'Full video recording of your game' },
    { id: 'hints', name: 'Extra Hint Pack', price: 5, description: 'Get 3 additional hints during gameplay' },
  ];

  const steps = [
    { number: 1, name: 'Select Game', icon: Calendar },
    { number: 2, name: 'Date & Time', icon: Clock },
    { number: 3, name: 'Add-ons & Cart', icon: ShoppingCart },
    { number: 4, name: 'Your Details', icon: User },
    { number: 5, name: 'Payment', icon: CreditCard },
  ];

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const selectedGame = games.find(g => g.id === bookingData.game);
  const basePrice = selectedGame ? selectedGame.price * bookingData.players : 0;
  const addOnsPrice = bookingData.addOns.reduce((sum, id) => {
    const addOn = addOns.find(a => a.id === id);
    return sum + (addOn?.price || 0);
  }, 0);
  const totalPrice = basePrice + addOnsPrice;

  const openGallery = (gameId: string) => {
    setSelectedGameForGallery(gameId);
    setShowGallery(true);
  };

  const galleryGame = games.find(g => g.id === selectedGameForGallery);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.game !== '';
      case 2:
        return bookingData.date !== '' && bookingData.time !== '';
      case 3:
        return true; // Cart/Add-ons are optional
      case 4:
        return bookingData.name !== '' && bookingData.email !== '' && bookingData.phone !== '';
      case 5:
        return bookingData.cardNumber !== '' && bookingData.cardExpiry !== '' && 
               bookingData.cardCVV !== '' && bookingData.cardName !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePayment = async () => {
    if (canProceed()) {
      try {
        // Find the selected game details
        const selectedGame = games.find(g => g.id === bookingData.game);

        // Get venue and game IDs from config
        const venueId = config?.venueId || config?.venue?.id;
        const gameId = bookingData.game;

        if (!venueId || !gameId) {
          toast.error('Missing venue or game information');
          console.error('Missing IDs:', { venueId, gameId, config });
          return;
        }

        // Format date and time for Supabase
        const bookingDate = bookingData.date instanceof Date 
          ? bookingData.date.toISOString().split('T')[0]
          : bookingData.date;
        const startTime = bookingData.time + ':00';
        
        // Calculate end time (assume 60 min duration)
        const [hour, minute] = bookingData.time.split(':');
        const endHour = String((parseInt(hour) + 1) % 24).padStart(2, '0');
        const endTime = `${endHour}:${minute}:00`;

        // Prepare ticket types
        const ticketTypes = [{
          id: 'standard',
          name: 'Standard Ticket',
          price: selectedGame?.price || 0,
          quantity: bookingData.players,
          subtotal: (selectedGame?.price || 0) * bookingData.players
        }];

        // Create booking via Supabase
        const result = await SupabaseBookingService.createWidgetBooking({
          venue_id: venueId,
          game_id: gameId,
          customer_name: bookingData.name,
          customer_email: bookingData.email,
          customer_phone: bookingData.phone,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          party_size: bookingData.players,
          ticket_types: ticketTypes,
          total_amount: totalPrice,
          final_amount: totalPrice,
          notes: `Add-ons: ${bookingData.addOns.join(', ')}`
        });

        if (result) {
          console.log('✅ Booking created:', result);
          toast.success('Booking confirmed!');
          setShowSuccess(true);
        }
      } catch (error: any) {
        console.error('❌ Error creating booking:', error);
        toast.error(error.message || 'Failed to create booking. Please try again.');
      }
    }
  };

  const bookingNumber = `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Success Modal - Full Screen on Mobile */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-auto sm:!max-w-[800px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-y-auto p-4 sm:p-6">
          <VisuallyHidden>
            <DialogTitle>Booking Confirmation</DialogTitle>
            <DialogDescription>Your escape room booking has been confirmed successfully</DialogDescription>
          </VisuallyHidden>
          <div className="flex flex-col items-center justify-center py-6 sm:py-8 px-2 sm:px-4">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-4 sm:mb-6"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" style={{ color: primaryColor }} />
            </div>
            <h2 className="text-2xl sm:text-3xl text-gray-900 mb-2 text-center">Booking Confirmed!</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 text-center">Your escape room adventure is all set</p>

            <Card className="w-full max-w-2xl p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center pb-3 sm:pb-4 border-b text-sm sm:text-base">
                  <span className="text-gray-600">Booking Number</span>
                  <span className="text-gray-900 text-xs sm:text-base">{bookingNumber}</span>
                </div>
                <div className="flex justify-between items-center pb-3 sm:pb-4 border-b text-sm sm:text-base">
                  <span className="text-gray-600">Game</span>
                  <span className="text-gray-900 text-right truncate max-w-[60%]">{selectedGame?.name}</span>
                </div>
                <div className="flex justify-between items-center pb-3 sm:pb-4 border-b text-sm sm:text-base">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="text-gray-900 text-xs sm:text-base text-right">
                    Nov {selectedDate}, 2025 at {bookingData.time}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 sm:pb-4 border-b text-sm sm:text-base">
                  <span className="text-gray-600">Players</span>
                  <span className="text-gray-900">{bookingData.players} people</span>
                </div>
                {bookingData.addOns.length > 0 && (
                  <div className="pb-3 sm:pb-4 border-b">
                    <div className="text-sm sm:text-base text-gray-600 mb-2">Add-ons</div>
                    <div className="space-y-1">
                      {bookingData.addOns.map(id => {
                        const addOn = addOns.find(a => a.id === id);
                        return (
                          <div key={id} className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-700 truncate max-w-[70%]">{addOn?.name}</span>
                            <span className="text-gray-900">${addOn?.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm sm:text-base text-gray-900">Total Paid</span>
                  <span className="text-xl sm:text-2xl text-gray-900" style={{ color: primaryColor }}>${totalPrice}</span>
                </div>
              </div>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 max-w-2xl w-full">
              <p className="text-xs sm:text-sm text-gray-700 text-center">
                A confirmation email has been sent to <strong>{bookingData.email}</strong>
              </p>
            </div>

            <Button
              onClick={() => {
                setShowSuccess(false);
                setCurrentStep(1);
                setBookingData({
                  game: '',
                  date: '',
                  time: '',
                  players: 4,
                  name: '',
                  email: '',
                  phone: '',
                  addOns: [],
                  cardNumber: '',
                  cardExpiry: '',
                  cardCVV: '',
                  cardName: '',
                });
                setSelectedDate(undefined);
              }}
              className="text-white px-6 sm:px-8 h-10 sm:h-12 text-sm sm:text-base"
              style={{ backgroundColor: primaryColor }}
            >
              Book Another Experience
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gallery Modal - Full Screen on Mobile */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[90vw] sm:!h-[90vh] sm:!max-w-[900px] sm:!max-h-[90vh] !rounded-none sm:!rounded-lg overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{galleryGame?.name}</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">{galleryGame?.tagline}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
            {galleryGame?.gallery.map((image, index) => (
              <div key={index} className="aspect-video rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={image}
                  alt={`${galleryGame.name} - Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 lg:py-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base sm:text-lg lg:text-xl text-gray-900">Complete Your Booking</h2>
            <Badge variant="secondary" className="text-blue-700 text-xs sm:text-sm" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
              Step {currentStep} of {totalSteps}
            </Badge>
          </div>
          <Progress value={progress} className="h-1.5 sm:h-2 mb-3 sm:mb-4 lg:mb-6" style={{ '--progress-background': primaryColor } as React.CSSProperties} />
          
          {/* Step Indicators - Hidden on mobile */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              
              return (
                <div key={step.number} className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                      isCompleted
                        ? 'text-white'
                        : isCurrent
                        ? 'border-2'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    style={{
                      backgroundColor: isCompleted ? primaryColor : isCurrent ? 'white' : undefined,
                      borderColor: isCurrent ? primaryColor : undefined,
                      color: isCurrent ? primaryColor : undefined,
                    }}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isCurrent || isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8 pb-24 sm:pb-8">
        <div className="min-h-[60vh] sm:min-h-0">
          {/* Step 1: Select Game */}
          {currentStep === 1 && (
            <Card className="p-4 sm:p-6 bg-white shadow-sm border-gray-200">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg text-gray-900">Choose Your Adventure</h3>
                <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 text-xs">Required</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {games.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => setBookingData({ ...bookingData, game: game.id })}
                    className={`cursor-pointer rounded-lg border-2 transition-all hover:shadow-lg ${
                      bookingData.game === game.id ? 'shadow-lg' : 'border-gray-200'
                    }`}
                    style={{
                      borderColor: bookingData.game === game.id ? primaryColor : undefined,
                    }}
                  >
                    <div className="relative h-40 sm:h-48 lg:h-56 rounded-t-lg overflow-hidden group">
                      <ImageWithFallback
                        src={game.image}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openGallery(game.id);
                          }}
                          className="bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full hover:bg-white transition-colors"
                        >
                          <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
                        </button>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4">
                      <div className="mb-2 sm:mb-3">
                        <h4 className="text-sm sm:text-base text-gray-900 mb-1">{game.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{game.tagline}</p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                          <span>{game.rating}</span>
                          <span className="text-gray-400 hidden sm:inline">({game.reviews})</span>
                        </div>
                        <span className="hidden sm:inline">•</span>
                        <span>{game.duration} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-lg sm:text-xl lg:text-2xl text-gray-900" style={{ color: primaryColor }}>
                          ${game.price}
                          <span className="text-xs sm:text-sm text-gray-500"> /person</span>
                        </p>
                        {bookingData.game === game.id && (
                          <Check className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: primaryColor }} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar and Time Selection */}
              <div className="lg:col-span-2 space-y-6">
                {/* Calendar */}
                <Card className="p-4 md:p-6 bg-white shadow-sm border-gray-200">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-3">
                      <h3 className="text-gray-900">Select Date</h3>
                      <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">Required</Badge>
                    </div>
                  </div>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setBookingData({ ...bookingData, date: date ? format(date, 'yyyy-MM-dd') : '' });
                    }}
                  />
                </Card>

                {/* Time Slots */}
                <Card className="p-4 md:p-6 bg-white shadow-sm border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-gray-900">Available Times{selectedDate ? ` - ${format(selectedDate, 'MMM d, yyyy')}` : ''}</h3>
                    <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">Required</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setBookingData({ ...bookingData, time: slot.time })}
                        disabled={!slot.available}
                        className={`p-3 md:p-4 rounded-lg border-2 text-sm transition-all relative ${
                          bookingData.time === slot.time
                            ? 'border-blue-600 shadow-md'
                            : slot.available
                            ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                        }`}
                        style={{
                          borderColor: bookingData.time === slot.time ? primaryColor : undefined,
                          backgroundColor: bookingData.time === slot.time ? `${primaryColor}10` : undefined,
                        }}
                      >
                        <div className="text-gray-900 text-center">{slot.time}</div>
                        {slot.available ? (
                          <div className="text-xs text-green-600 mt-1 text-center">Available</div>
                        ) : (
                          <div className="text-xs text-red-600 mt-1 text-center">Sold out</div>
                        )}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Booking Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <Card className="p-4 md:p-6 bg-white shadow-lg border-gray-200">
                    <h3 className="text-gray-900 mb-4">Booking Summary</h3>
                    
                    {/* Party Size */}
                    <div className="mb-6">
                      <Label className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Number of Players
                      </Label>
                      <div className="flex items-center gap-3 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setBookingData({ ...bookingData, players: Math.max(2, bookingData.players - 1) })}
                        >
                          -
                        </Button>
                        <span className="text-2xl text-gray-900 min-w-[40px] text-center">{bookingData.players}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setBookingData({ ...bookingData, players: Math.min(10, bookingData.players + 1) })}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Summary Details */}
                    <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Game:</span>
                        <span className="text-gray-900">{selectedGame?.name || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Date:</span>
                        <span className="text-gray-900">
                          {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Not selected'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Time:</span>
                        <span className="text-gray-900">{bookingData.time || 'Not selected'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Players:</span>
                        <span className="text-gray-900">{bookingData.players}</span>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price per person:</span>
                        <span className="text-gray-900">${selectedGame?.price || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">${basePrice}</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex justify-between items-center">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-2xl text-gray-900" style={{ color: primaryColor }}>
                        ${basePrice}
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Add-ons & Cart */}
          {currentStep === 3 && (
            <Card className="p-4 md:p-6 bg-white shadow-sm border-gray-200">
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <h3 className="text-gray-900">Enhance Your Experience</h3>
                <Badge variant="secondary" className="text-gray-600">Optional</Badge>
              </div>
              <div className="space-y-4 mb-8">
                {addOns.map((addOn) => {
                  const isSelected = bookingData.addOns.includes(addOn.id);
                  return (
                    <div
                      key={addOn.id}
                      onClick={() => {
                        if (isSelected) {
                          setBookingData({
                            ...bookingData,
                            addOns: bookingData.addOns.filter(id => id !== addOn.id)
                          });
                        } else {
                          setBookingData({
                            ...bookingData,
                            addOns: [...bookingData.addOns, addOn.id]
                          });
                        }
                      }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected ? 'shadow-md' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        borderColor: isSelected ? primaryColor : undefined,
                        backgroundColor: isSelected ? `${primaryColor}05` : undefined,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-gray-900">{addOn.name}</h4>
                            {isSelected && <Check className="w-5 h-5" style={{ color: primaryColor }} />}
                          </div>
                          <p className="text-sm text-gray-600">{addOn.description}</p>
                        </div>
                        <p className="text-xl text-gray-900 ml-4" style={{ color: primaryColor }}>
                          +${addOn.price}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Cart Summary
                </h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{selectedGame?.name}</span>
                    <span className="text-gray-900">${selectedGame?.price} × {bookingData.players}</span>
                  </div>
                  {bookingData.addOns.length > 0 && (
                    <>
                      <Separator />
                      {bookingData.addOns.map(id => {
                        const addOn = addOns.find(a => a.id === id);
                        return (
                          <div key={id} className="flex justify-between items-center">
                            <span className="text-gray-600">{addOn?.name}</span>
                            <span className="text-gray-900">${addOn?.price}</span>
                          </div>
                        );
                      })}
                    </>
                  )}
                  <Separator />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-2xl text-gray-900" style={{ color: primaryColor }}>
                      ${totalPrice}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: Your Details */}
          {currentStep === 4 && (
            <Card className="p-4 md:p-6 bg-white shadow-sm border-gray-200">
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <h3 className="text-gray-900">Your Information</h3>
                <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">Required</Badge>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <User className="w-4 h-4" />
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Step 5: Payment */}
          {currentStep === 5 && (
            <Card className="p-4 md:p-6 bg-white shadow-sm border-gray-200">
              <div className="flex items-start justify-between mb-4 md:mb-6">
                <h3 className="text-gray-900 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Secure Payment
                </h3>
                <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">Required</Badge>
              </div>
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Label className="text-gray-700">Cardholder Name <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={bookingData.cardName}
                    onChange={(e) => setBookingData({ ...bookingData, cardName: e.target.value })}
                    className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700">Card Number <span className="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={bookingData.cardNumber}
                    onChange={(e) => setBookingData({ ...bookingData, cardNumber: e.target.value })}
                    maxLength={19}
                    className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Expiry Date <span className="text-red-500">*</span></Label>
                    <Input
                      type="text"
                      placeholder="MM/YY"
                      value={bookingData.cardExpiry}
                      onChange={(e) => setBookingData({ ...bookingData, cardExpiry: e.target.value })}
                      maxLength={5}
                      className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700">CVV <span className="text-red-500">*</span></Label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={bookingData.cardCVV}
                      onChange={(e) => setBookingData({ ...bookingData, cardCVV: e.target.value })}
                      maxLength={4}
                      className="h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-6 bg-gray-200" />

              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2 mb-6 shadow-sm">
                <h4 className="text-gray-900 mb-3">Order Summary</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Game</span>
                  <span className="text-gray-900">{selectedGame?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="text-gray-900">
                    Nov {selectedDate}, 2025 at {bookingData.time}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Players</span>
                  <span className="text-gray-900">{bookingData.players} × ${selectedGame?.price}</span>
                </div>
                {bookingData.addOns.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    {bookingData.addOns.map(id => {
                      const addOn = addOns.find(a => a.id === id);
                      return (
                        <div key={id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{addOn?.name}</span>
                          <span className="text-gray-900">${addOn?.price}</span>
                        </div>
                      );
                    })}
                  </>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-900">Total</span>
                  <span className="text-2xl text-gray-900" style={{ color: primaryColor }}>
                    ${totalPrice}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-gray-700 flex items-start gap-2">
                <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p>Your payment information is encrypted and secure</p>
              </div>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg mt-8 -mx-4 md:-mx-6 px-4 md:px-6 py-4 z-10">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                variant="outline"
                className="w-full sm:w-auto h-12 border-2 hover:bg-gray-50 order-2 sm:order-1"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            )}
            
            <div className="flex-1 order-1 sm:order-2 w-full">
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="w-full h-14 text-white text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: canProceed() ? primaryColor : '#9ca3af',
                    opacity: canProceed() ? 1 : 0.6
                  }}
                >
                  {!canProceed() && currentStep === 1 && 'Select a game to continue'}
                  {!canProceed() && currentStep === 2 && 'Select date and time to continue'}
                  {!canProceed() && currentStep === 4 && 'Fill in all required fields'}
                  {!canProceed() && currentStep === 5 && 'Enter payment details'}
                  {canProceed() && 'Continue to Next Step'}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handlePayment}
                  disabled={!canProceed()}
                  className="w-full h-14 text-white text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: canProceed() ? primaryColor : '#9ca3af',
                    opacity: canProceed() ? 1 : 0.6
                  }}
                >
                  <Lock className="w-5 h-5 mr-2" />
                  {canProceed() ? `Complete Payment - $${totalPrice}` : 'Enter payment details to complete'}
                </Button>
              )}
            </div>
          </div>
          
          {/* Helper Text */}
          {!canProceed() && (
            <div className="text-center mt-3 text-sm text-gray-500">
              {currentStep === 1 && 'Please select an escape room game to continue'}
              {currentStep === 2 && 'Please select both date and time slot to proceed'}
              {currentStep === 3 && 'Optional: Add enhancements or continue to the next step'}
              {currentStep === 4 && 'Please fill in your name, email, and phone number'}
              {currentStep === 5 && 'Please enter your complete payment information'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
