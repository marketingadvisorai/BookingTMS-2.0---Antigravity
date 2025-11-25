import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from '../ui/dialog';
import { VisuallyHidden } from '../ui/visually-hidden';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import {
  Star, Clock, Users, MapPin, Award, Calendar,
  ShoppingCart, CreditCard, Lock, CheckCircle2,
  Mail, Phone, User, ChevronLeft, Play, Image as ImageIcon,
  Info, Sparkles, ChevronRight, Target, X, Zap,
  Shield, HelpCircle, TrendingUp, Heart, Camera, ChevronDown, ChevronUp
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { format } from 'date-fns';
import { useAvailability } from './booking/hooks/useAvailability';
import { PromoCodeInput } from './PromoCodeInput';
import { GiftCardInput } from './GiftCardInput';
import { useWidgetTheme } from './WidgetThemeContext';
import SupabaseBookingService from '../../services/SupabaseBookingService';
import { toast } from 'sonner';

interface CalendarSingleEventBookingPageProps {
  primaryColor?: string;
  gameName?: string;
  gameDescription?: string;
  gamePrice?: number;
  gameSchedule?: any;
  timezone?: string;
  config?: any;
}

export function CalendarSingleEventBookingPage({
  primaryColor: propPrimaryColor,
  gameName,
  gameDescription,
  gamePrice,
  gameSchedule,
  timezone,
  config
}: CalendarSingleEventBookingPageProps) {
  const { widgetTheme, getCurrentPrimaryColor } = useWidgetTheme();
  // Use prop value if provided, otherwise fall back to context
  const primaryColor = propPrimaryColor || getCurrentPrimaryColor() || '#2563eb';
  const isDark = widgetTheme === 'dark';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number>(currentDate.getDate());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(4);
  const [currentStep, setCurrentStep] = useState<'booking' | 'cart' | 'checkout' | 'success'>('booking');
  const [showGameDetails, setShowGameDetails] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingNumber, setBookingNumber] = useState<string>('');

  // Resolve game data from config if not provided in props
  const selectedGame = Array.isArray(config?.games) && config.games.length > 0 ? config.games[0] : null;

  const effectiveGameName = gameName || selectedGame?.name || 'Mystery Manor';
  const effectiveDescription = gameDescription || selectedGame?.description || 'Uncover the dark secrets hidden in an abandoned Victorian mansion';
  const effectivePrice = gamePrice !== undefined ? gamePrice : (selectedGame?.price || 30);

  const gameData = {
    name: effectiveGameName,
    description: effectiveDescription,
    price: effectivePrice,
    duration: selectedGame?.duration || '60 min',
    difficulty: selectedGame?.difficulty || 'Medium',
    difficultyLevel: 3,
    players: selectedGame?.players || '2-8 players',
    gameType: 'physical',
    minAge: 10,
    ageRecommendation: '10+',
    rating: 4.9,
    reviewCount: 234,
    location: (config?.city && config?.state) ? `${config.city}, ${config.state}` : 'Downtown Location',
    image: selectedGame?.image || selectedGame?.imageUrl || 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=800&fit=crop',
    gallery: selectedGame?.galleryImages || [
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=800&h=600&fit=crop',
    ],
    highlights: ['Perfect for beginners', 'Family friendly', 'Award-winning design', 'Immersive storyline'],
    longDescription: 'Step into the eerie halls of Mystery Manor, a Victorian mansion shrouded in darkness and secrets. As amateur detectives, your team has been hired to investigate the mysterious disappearance of the manor\'s last owner. Legend has it that the mansion is cursed, and those who enter never leave. You have 60 minutes to unravel the mystery, find the hidden clues, and escape before you become part of the manor\'s dark history.',
    story: 'In 1897, the wealthy Blackwood family mysteriously vanished from their grand Victorian estate. The mansion has been abandoned ever since, with locals reporting strange noises and eerie lights in the windows.',
    whatToExpect: [
      'Atmospheric Victorian-era setting with authentic period details',
      'Mind-bending puzzles that require teamwork and communication',
      'Hidden compartments and secret passages to discover',
      'An engaging storyline that unfolds as you progress',
      'Professional game master guidance throughout your adventure'
    ],
    requirements: [
      'Minimum age: 10 years old (children under 16 must be accompanied by an adult)',
      'Recommended group size: 4-6 players for optimal experience',
      'No prior escape room experience necessary',
      'Comfortable clothing and closed-toe shoes recommended',
      'Please arrive 15 minutes before your scheduled time'
    ],
    faq: [
      {
        question: 'Is this escape room scary?',
        answer: 'Mystery Manor has a spooky atmosphere but is not designed to be frightening. It\'s more mysterious and intriguing than scary, making it perfect for families and first-timers.'
      },
      {
        question: 'What if we get stuck?',
        answer: 'Your game master monitors your progress and can provide hints via a screen in the room. You can request hints at any time - there\'s no penalty for asking for help!'
      },
      {
        question: 'Can we bring our own food or drinks?',
        answer: 'We have a waiting lounge where you can enjoy food and drinks before or after your game. However, food and drinks are not allowed inside the escape room itself.'
      }
    ],
    reviews: [
      {
        name: 'Sarah M.',
        rating: 5,
        date: 'November 2025',
        comment: 'Amazing experience! Perfect for our family outing. The puzzles were challenging but doable with teamwork.'
      },
      {
        name: 'Mike T.',
        rating: 5,
        date: 'October 2025',
        comment: 'Best escape room we\'ve ever done! The atmosphere was incredible and the story kept us engaged throughout.'
      }
    ],
    schedule: gameSchedule || selectedGame?.schedule || {
      operatingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: '09:00',
      endTime: '22:00',
      slotInterval: 60,
      duration: 60
    },
    timezone: timezone || gameSchedule?.timezone || selectedGame?.timezone || config?.timezone || 'UTC'
  };

  // Prefer user-provided images from config when available
  const heroImage: string = gameData.image;
  const galleryImages: string[] = gameData.gallery;

  const { timeSlots, loading: slotsLoading = false, error: slotsError } = useAvailability({
    config,
    selectedActivity: config?.gameId || selectedGame?.id,
    selectedActivityData: gameData,
    selectedDate,
    currentMonth: currentDate.getMonth(),
    currentYear: currentDate.getFullYear()
  });

  console.log('CalendarSingleEventBookingPage: slotsLoading:', slotsLoading);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const subtotal = gameData.price * partySize;
  const promoDiscount = appliedPromoCode
    ? (appliedPromoCode.type === 'fixed'
      ? appliedPromoCode.discount
      : (subtotal * appliedPromoCode.discount) / 100)
    : 0;
  const giftCardCredit = appliedGiftCard ? appliedGiftCard.amount : 0;
  const totalPrice = Math.max(0, subtotal - promoDiscount - giftCardCredit);

  const canAddToCart = selectedTime !== null;
  const canCheckout = customerData.name && customerData.email && customerData.phone;
  const canCompletePay = customerData.cardNumber && customerData.cardExpiry && customerData.cardCVV && customerData.cardName;

  const handleCompletePayment = async () => {
    if (!canCompletePay || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Get venue and game IDs from config
      const venueId = config?.venueId || config?.venue?.id;
      const gameId = selectedGame?.id || config?.gameId;

      if (!venueId || !gameId) {
        toast.error('Missing venue or game information');
        console.error('Missing IDs:', { venueId, gameId, config });
        return;
      }

      // Calculate booking time using current date state
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate).padStart(2, '0');
      const bookingDate = `${year}-${month}-${day}`;
      
      const [startHour, startMinute] = selectedTime!.split(':');
      const startTime = `${startHour.padStart(2, '0')}:${startMinute.padStart(2, '0')}:00`;

      // Calculate end time based on activity duration
      const duration = gameData.schedule?.duration || 60;
      const startMinutes = parseInt(startHour) * 60 + parseInt(startMinute);
      const endMinutes = startMinutes + duration;
      const endHour = String(Math.floor(endMinutes / 60) % 24).padStart(2, '0');
      const endMin = String(endMinutes % 60).padStart(2, '0');
      const endTime = `${endHour}:${endMin}:00`;

      // Prepare ticket types
      const ticketTypes = [{
        id: 'standard',
        name: 'Standard Ticket',
        price: gameData.price,
        quantity: partySize,
        subtotal: subtotal
      }];

      // Create booking via Supabase
      const result = await SupabaseBookingService.createWidgetBooking({
        venue_id: venueId,
        activity_id: gameId,
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        party_size: partySize,
        ticket_types: ticketTypes,
        total_amount: subtotal,
        final_amount: totalPrice,
        promo_code: appliedPromoCode?.code,
        notes: `Payment: ${customerData.cardNumber.slice(-4)}`
      });

      if (result) {
        setBookingNumber(result.confirmation_code);
        setCurrentStep('success');
        toast.success('Booking confirmed!');
        console.log('✅ Booking created:', result);
      }
    } catch (error: any) {
      console.error('❌ Error creating booking:', error);
      toast.error(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setCurrentStep('booking');
    setSelectedDate(15);
    setSelectedTime(null);
    setPartySize(4);
    setBookingNumber('');
    setAppliedPromoCode(null);
    setAppliedGiftCard(null);
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

  // Compute address details from config with sensible fallbacks
  const streetAddress = (config?.streetAddress || config?.address || (gameData as any)?.location?.address) as string | undefined;
  const city = (config?.city || (gameData as any)?.location?.city) as string | undefined;
  const state = (config?.state || (gameData as any)?.location?.state) as string | undefined;
  const zipCode = (config?.zipCode || config?.postalCode || (gameData as any)?.location?.zip || (gameData as any)?.location?.postalCode) as string | undefined;
  const country = (config?.country || (gameData as any)?.location?.country) as string | undefined;
  const fullAddress = [streetAddress, city, state, zipCode, country].filter(Boolean).join(', ');

  // Inject SEO meta tags, Open Graph/Twitter, and JSON-LD LocalBusiness
  useEffect(() => {
    // Title
    const title = (config?.seoTitle as string) || `${gameData.name} | ${(config?.businessName as string) || 'Booking'}`;
    if (typeof document !== 'undefined') {
      document.title = title;

      const ensureMeta = (name: string, content: string) => {
        if (!content) return;
        let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute('name', name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      const ensureOg = (property: string, content: string) => {
        if (!content) return;
        let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute('property', property);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      const description = (config?.metaDescription as string) || gameData.description;
      const keywords = Array.isArray(config?.seoKeywords) ? (config!.seoKeywords as string[]).join(', ') : (config?.seoKeywords as string) || '';

      ensureMeta('description', description);
      ensureMeta('keywords', keywords);

      // Open Graph
      ensureOg('og:title', title);
      ensureOg('og:description', description);
      ensureOg('og:image', heroImage);
      ensureOg('og:type', 'website');

      // Twitter Card
      ensureMeta('twitter:card', 'summary_large_image');
      ensureMeta('twitter:title', title);
      ensureMeta('twitter:description', description);
      ensureMeta('twitter:image', heroImage);

      // JSON-LD LocalBusiness (optional)
      const existing = document.getElementById('calendar-singlegame-jsonld') as HTMLScriptElement | null;
      if (config?.enableLocalBusinessSchema) {
        const mapUrl = fullAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}` : undefined;
        const jsonLd: Record<string, any> = {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: (config?.businessName as string) || gameData.name,
          image: heroImage,
          description,
          address: (streetAddress || city || state || zipCode || country) ? {
            '@type': 'PostalAddress',
            streetAddress: streetAddress,
            addressLocality: city,
            addressRegion: state,
            postalCode: zipCode,
            addressCountry: country,
          } : undefined,
          telephone: config?.phoneNumber,
          email: config?.emailAddress,
          hasMap: mapUrl,
        };

        const scriptEl = existing || document.createElement('script');
        scriptEl.type = 'application/ld+json';
        scriptEl.id = 'calendar-singlegame-jsonld';
        scriptEl.textContent = JSON.stringify(jsonLd, null, 2);
        if (!existing) document.head.appendChild(scriptEl);
      } else if (existing) {
        existing.remove();
      }
    }

    return () => {
      const el = document.getElementById('calendar-singlegame-jsonld');
      if (el) el.remove();
    };
  }, [config, heroImage, gameData.description, gameData.name, fullAddress, streetAddress, city, state, zipCode, country]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500 text-white';
      case 'Medium':
        return 'bg-yellow-500 text-white';
      case 'Hard':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const renderDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < level ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className={`w-full min-h-screen ${isDark ? 'bg-[#161616]' : 'bg-gray-50'} transition-colors`}>
      {/* Game Details Modal */}
      <Dialog open={showGameDetails} onOpenChange={setShowGameDetails}>
        <DialogContent className={`!w-screen !h-screen !max-w-none !max-h-none sm:!w-[95vw] sm:!h-[95vh] sm:!max-w-[1200px] sm:!max-h-[95vh] !rounded-none sm:!rounded-xl overflow-hidden p-0 ${isDark ? 'bg-gradient-to-b from-[#161616] to-[#0a0a0a]' : 'bg-gradient-to-b from-white to-gray-50'} flex flex-col`}>
          {/* Close Button */}
          <button
            onClick={() => setShowGameDetails(false)}
            className={`absolute top-4 right-4 z-50 w-10 h-10 rounded-full ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'} shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 border`}
            aria-label="Close dialog"
          >
            <X className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>

          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>{gameData.name}</DialogTitle>
              <DialogDescription>
                Complete guide to {gameData.name} escape room - {gameData.difficulty} difficulty, {gameData.duration} duration, suitable for ages {gameData.ageRecommendation}.
              </DialogDescription>
            </DialogHeader>
          </VisuallyHidden>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              {/* Hero Cover Section */}
              <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
                <ImageWithFallback
                  src={heroImage}
                  alt={gameData.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12 text-white">
                  <div className="max-w-5xl mx-auto">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Badge className={`${getDifficultyColor(gameData.difficulty)} border-0 shadow-lg px-3 py-1.5`}>
                        {gameData.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{gameData.rating}</span>
                        <span className="text-xs text-gray-200">({gameData.reviewCount})</span>
                      </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-4">{gameData.name}</h1>
                    <p className="text-lg sm:text-xl text-gray-100 mb-6 max-w-3xl">{gameData.description}</p>

                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                        <Clock className="w-5 h-5" />
                        <span>{gameData.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                        <Users className="w-5 h-5" />
                        <span>{gameData.players} players</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                        <Target className="w-5 h-5" />
                        <span>Age {gameData.ageRecommendation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
                {/* Photo Gallery */}
                <section>
                  <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6 flex items-center gap-3">
                    <Camera className="w-7 h-7" style={{ color: primaryColor }} />
                    Photo Gallery
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {galleryImages.map((image, index) => (
                      <div key={index} className="aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <ImageWithFallback
                          src={image}
                          alt={`${gameData.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* The Story */}
                <section className={`${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'} rounded-2xl p-6 sm:p-8 shadow-lg border`}>
                  <h2 className={`text-2xl sm:text-3xl ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center gap-3`}>
                    <Heart className="w-7 h-7" style={{ color: primaryColor }} />
                    The Story
                  </h2>
                  <p className={`text-base sm:text-lg ${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-6`}>{gameData.longDescription}</p>
                  <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>{gameData.story}</p>
                </section>

                {/* Key Highlights */}
                <section>
                  <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6 flex items-center gap-3">
                    <Sparkles className="w-7 h-7" style={{ color: primaryColor }} />
                    Key Highlights
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gameData.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${primaryColor}15` }}>
                          <Zap className="w-5 h-5" style={{ color: primaryColor }} />
                        </div>
                        <span className="text-gray-800">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* What to Expect */}
                <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 border-2" style={{ borderColor: `${primaryColor}20` }}>
                  <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6 flex items-center gap-3">
                    <Info className="w-7 h-7" style={{ color: primaryColor }} />
                    What to Expect
                  </h2>
                  <ul className="space-y-4">
                    {gameData.whatToExpect.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                        <span className="text-base">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Requirements */}
                <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
                  <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6 flex items-center gap-3">
                    <Shield className="w-7 h-7" style={{ color: primaryColor }} />
                    Requirements & Guidelines
                  </h2>
                  <ul className="space-y-4">
                    {gameData.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <Award className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                        <span className="text-base">{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* FAQ */}
                <section>
                  <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6 flex items-center gap-3">
                    <HelpCircle className="w-7 h-7" style={{ color: primaryColor }} />
                    Frequently Asked Questions
                  </h2>
                  <Accordion type="single" collapsible className="space-y-3">
                    {gameData.faq.map((item, index) => (
                      <AccordionItem
                        key={index}
                        value={`faq-${index}`}
                        className="bg-white rounded-xl border border-gray-200 px-6 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <AccordionTrigger className="text-left text-base sm:text-lg text-gray-900 hover:no-underline py-4">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 pb-4 text-base leading-relaxed">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </section>

                {/* Reviews */}
                <section>
                  <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6 flex items-center gap-3">
                    <Star className="w-7 h-7 fill-yellow-400 text-yellow-400" />
                    Customer Reviews
                  </h2>
                  <div className="space-y-4">
                    {gameData.reviews.map((review, index) => (
                      <div key={index} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-gray-900">{review.name}</p>
                            <p className="text-sm text-gray-500">{review.date}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
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
          {/* Compact Hero Section - Optimized for Booking UX */}
          <div className="relative h-[280px] sm:h-[320px] bg-black overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <ImageWithFallback
                src={heroImage}
                alt={`${gameData.name} escape room experience`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

            {/* Content */}
            <div className="relative h-full flex flex-col justify-between">
              {/* Top Bar - Badges & Actions */}
              <div className="flex items-start justify-between p-4 sm:p-6">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-500 text-black border-0 px-2.5 py-1 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-xs">{gameData.rating}</span>
                    <span className="text-gray-200 text-xs">({gameData.reviewCount})</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setShowGameDetails(true)}
                    className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/30 transition-all flex items-center gap-1.5 text-xs"
                    title="View Gallery"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Gallery</span>
                  </button>
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/30 transition-all flex items-center gap-1.5 text-xs"
                    title="Watch Video"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span className="hidden sm:inline">Video</span>
                  </button>
                </div>
              </div>

              {/* Bottom Content - Title & Info */}
              <div className="p-4 sm:p-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl text-white mb-2 drop-shadow-lg tracking-tight">
                  {gameData.name}
                </h1>

                <p className="text-sm sm:text-base text-gray-200 mb-4 max-w-2xl line-clamp-2">
                  {gameData.description}
                </p>

                {/* Compact Info Pills - Single Row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                    <Clock className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs text-white">{gameData.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                    <Users className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs text-white">{gameData.players}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                    <Award className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs text-white">{gameData.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                    <Award className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs text-white">{gameData.gameType}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                    <span className="text-xs text-white">{gameData.location}</span>
                  </div>
                </div>

                {/* Action Buttons under pills to match single-page header design */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowGameDetails(true)}
                    className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/20 transition-all flex items-center gap-1.5 text-xs"
                    title="View Gallery"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>View Gallery</span>
                  </button>
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="bg-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/20 transition-all flex items-center gap-1.5 text-xs"
                    title="Watch Video"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Watch Video</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Calendar and Time Selection */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Calendar */}
                <Card className="p-6 sm:p-8 bg-white shadow-sm border border-gray-200 rounded-2xl">
                  <div className="flex items-center justify-between mb-6 gap-2">
                    <h2 className="text-lg sm:text-xl text-gray-900">Select Date</h2>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-lg border-gray-300 hover:bg-gray-50"
                        onClick={() => {
                          const newDate = new Date(currentDate);
                          newDate.setMonth(newDate.getMonth() - 1);
                          setCurrentDate(newDate);
                          setSelectedDate(1); // Reset selection
                        }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm sm:text-base text-gray-900 px-2 whitespace-nowrap min-w-[140px] text-center">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-lg border-gray-300 hover:bg-gray-50"
                        onClick={() => {
                          const newDate = new Date(currentDate);
                          newDate.setMonth(newDate.getMonth() + 1);
                          setCurrentDate(newDate);
                          setSelectedDate(1); // Reset selection
                        }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-2 sm:gap-3">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="text-center text-sm text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                    {/* Empty slots for days before start of month */}
                    {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {/* Days of the month */}
                    {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }).map((_, i) => {
                      const day = i + 1;
                      const isSelected = selectedDate === day;
                      const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                      const isToday = new Date().toDateString() === dateObj.toDateString();
                      const isPast = dateObj < new Date(new Date().setHours(0, 0, 0, 0));
                      const isAvailable = !isPast; // Basic check, useAvailability handles specific blocked dates

                      return (
                        <button
                          key={i}
                          onClick={() => isAvailable && setSelectedDate(day)}
                          disabled={!isAvailable}
                          className={`
                            aspect-square rounded-xl text-base transition-all flex items-center justify-center
                            ${isToday && !isSelected
                              ? 'text-white shadow-md'
                              : isSelected
                                ? 'text-gray-900 border-2 shadow-sm bg-white hover:bg-gray-50'
                                : isAvailable
                                  ? 'text-gray-700 hover:bg-gray-50 border border-gray-200'
                                  : 'text-gray-300 cursor-not-allowed border border-gray-100'
                            }
                          `}
                          style={{
                            backgroundColor: isToday && !isSelected ? primaryColor : undefined,
                            borderColor: isSelected ? primaryColor : undefined,
                          }}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* Time Slots */}
                {selectedDate && (
                  <Card className="p-6 sm:p-8 bg-white shadow-sm border border-gray-200 rounded-2xl">
                    <h2 className="text-lg sm:text-xl text-gray-900 mb-4 sm:mb-6">
                      Available Times - {currentDate.toLocaleString('default', { month: 'short' })} {selectedDate}
                    </h2>

                    {slotsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    ) : timeSlots.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No available times for this date.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {timeSlots.map((slot) => {
                          // Format time for display (e.g. 14:00 -> 2:00 PM)
                          const [hours, minutes] = slot.time.split(':');
                          const date = new Date();
                          date.setHours(parseInt(hours), parseInt(minutes));
                          const displayTime = date.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          });

                          return (
                            <button
                              key={slot.time}
                              onClick={() => slot.available && setSelectedTime(slot.time)}
                              disabled={!slot.available}
                              className={`
                                p-4 sm:p-5 rounded-xl border-2 text-center transition-all
                                ${selectedTime === slot.time
                                  ? 'shadow-lg transform scale-105'
                                  : slot.available
                                    ? 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-102'
                                    : 'border-gray-100 cursor-not-allowed opacity-50'
                                }
                              `}
                              style={{
                                backgroundColor: selectedTime === slot.time ? primaryColor : undefined,
                                borderColor: selectedTime === slot.time ? primaryColor : undefined,
                              }}
                            >
                              <div className={`text-sm sm:text-base mb-2 ${selectedTime === slot.time ? 'text-white' : slot.available ? 'text-gray-900' : 'text-gray-400'
                                }`}>
                                {displayTime}
                              </div>
                              <div className={`text-xs ${selectedTime === slot.time ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                {slot.available ? `${slot.capacity || slot.spots || 0} spots left` : 'Sold Out'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                )}
              </div>

              {/* Booking Summary Sidebar */}
              <div className="lg:col-span-1">
                <div className="lg:sticky lg:top-4">
                  <Card className="p-6 sm:p-8 bg-gradient-to-br from-white to-gray-50 shadow-2xl border-2 rounded-2xl max-h-[calc(100vh-2rem)] overflow-y-auto" style={{ borderColor: `${primaryColor}20` }}>
                    <div className="space-y-6 pb-20 sm:pb-6">
                      <div className="flex items-center gap-3 pb-4 border-b-2" style={{ borderColor: `${primaryColor}20` }}>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                          <ShoppingCart className="w-5 h-5" style={{ color: primaryColor }} />
                        </div>
                        <h2 className="text-xl text-gray-900">Your Booking</h2>
                      </div>

                      {/* Party Size */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <label className="text-sm text-gray-700 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" style={{ color: primaryColor }} />
                          <span className="">Number of Players</span>
                        </label>
                        <div className="flex items-center justify-between gap-4 mt-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPartySize(Math.max(2, partySize - 1))}
                            className="h-12 w-12 rounded-full hover:scale-110 transition-transform"
                            style={{ borderColor: primaryColor, color: primaryColor }}
                          >
                            -
                          </Button>
                          <div className="text-center">
                            <div className="text-3xl text-gray-900" style={{ color: primaryColor }}>{partySize}</div>
                            <div className="text-xs text-gray-500">players</div>
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPartySize(Math.min(10, partySize + 1))}
                            className="h-12 w-12 rounded-full hover:scale-110 transition-transform"
                            style={{ borderColor: primaryColor, color: primaryColor }}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {/* Summary Details */}
                      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 flex items-center gap-2">
                              <Award className="w-4 h-4" style={{ color: primaryColor }} />
                              Game
                            </span>
                            <span className="text-gray-900 text-right truncate max-w-[55%]">{gameData.name}</span>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 flex items-center gap-2">
                              <Calendar className="w-4 h-4" style={{ color: primaryColor }} />
                              Date
                            </span>
                            <span className="text-gray-900">Nov {selectedDate}, 2025</span>
                          </div>
                          {selectedTime && (
                            <>
                              <Separator />
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-2">
                                  <Clock className="w-4 h-4" style={{ color: primaryColor }} />
                                  Time
                                </span>
                                <span className="text-gray-900">{selectedTime}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border-2" style={{ borderColor: `${primaryColor}30` }}>
                        <div className="flex justify-between mb-3 text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="text-gray-900">${gameData.price} × {partySize}</span>
                        </div>
                        <Separator className="my-3" />
                        <div className="flex justify-between items-center">
                          <span className="text-base text-gray-900">Total</span>
                          <div className="text-right">
                            <div className="text-3xl" style={{ color: primaryColor }}>
                              ${totalPrice}
                            </div>
                            <div className="text-xs text-gray-500">USD</div>
                          </div>
                        </div>
                      </div>

                      {/* Location & Info */}
                      {(config?.showLocationBlock !== false) && (fullAddress || config?.phoneNumber || config?.emailAddress) && (
                        <div className="rounded-xl p-5 border-2 bg-white" style={{ borderColor: `${primaryColor}30` }}>
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4" style={{ color: primaryColor }} />
                            <span className="text-sm text-gray-900">Location & Info</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            {fullAddress && (
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-gray-600">Address</span>
                                <span className="text-gray-900 text-right">{fullAddress}</span>
                              </div>
                            )}
                            {config?.phoneNumber && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Phone</span>
                                <a href={`tel:${config.phoneNumber}`} className="text-gray-900 hover:underline">{config.phoneNumber}</a>
                              </div>
                            )}
                            {config?.emailAddress && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600">Email</span>
                                <a href={`mailto:${config.emailAddress}`} className="text-gray-900 hover:underline">{config.emailAddress}</a>
                              </div>
                            )}
                            {fullAddress && (
                              <div className="pt-2">
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm font-medium hover:underline"
                                  style={{ color: primaryColor }}
                                >
                                  Get directions
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Button
                          onClick={() => setShowGameDetails(true)}
                          variant="outline"
                          className="w-full h-12 text-base border-2 hover:bg-gray-50"
                          style={{ borderColor: `${primaryColor}30`, color: primaryColor }}
                        >
                          <Info className="w-4 h-4 mr-2" />
                          See Full Details
                        </Button>
                        <Button
                          onClick={() => setCurrentStep('cart')}
                          disabled={!canAddToCart}
                          className="w-full text-white h-14 text-lg shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all relative overflow-hidden group"
                          style={{
                            backgroundColor: canAddToCart ? primaryColor : undefined,
                            opacity: canAddToCart ? 1 : 0.5
                          }}
                        >
                          <div className="absolute inset-0 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                          <ShoppingCart className="w-5 h-5 mr-2 relative z-10" />
                          <span className="relative z-10">
                            {selectedTime ? 'Continue to Cart' : 'Select Time to Continue'}
                          </span>
                        </Button>
                        {!selectedTime && (
                          <p className="text-xs text-center text-gray-500 mt-2">
                            Please select a time slot to continue
                          </p>
                        )}
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
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <Button
            onClick={() => setCurrentStep('booking')}
            variant="outline"
            className="mb-6"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Booking
          </Button>

          <Card className="p-4 md:p-6">
            <h2 className="text-2xl text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Your Cart
            </h2>

            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={heroImage}
                    alt={gameData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg text-gray-900 mb-1">{gameData.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Date: Nov {selectedDate}, 2025 at {selectedTime}</div>
                    <div>Players: {partySize} × ${gameData.price}</div>
                  </div>
                </div>
                <div className="text-xl text-gray-900" style={{ color: primaryColor }}>
                  ${subtotal}
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

            {/* Promo Code & Gift Card Section */}
            <div className="space-y-2 mt-4 mb-6">
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
                    onApply={(code, discount, type) => {
                      setAppliedPromoCode({ code, discount, type });
                      setShowPromoCodeInput(false);
                    }}
                    className="mb-2"
                  />
                )}
                {appliedPromoCode && (
                  <PromoCodeInput
                    onApply={(code, discount, type) => {
                      setAppliedPromoCode({ code, discount, type });
                    }}
                    onRemove={() => setAppliedPromoCode(null)}
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
                    onApply={(code, amount) => {
                      setAppliedGiftCard({ code, amount });
                      setShowGiftCardInput(false);
                    }}
                    className="mb-2"
                  />
                )}
                {appliedGiftCard && (
                  <GiftCardInput
                    onApply={(code, amount) => {
                      setAppliedGiftCard({ code, amount });
                    }}
                    onRemove={() => setAppliedGiftCard(null)}
                    appliedCode={appliedGiftCard.code}
                    appliedAmount={appliedGiftCard.amount}
                    className="mb-2"
                  />
                )}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-base">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${subtotal}</span>
              </div>
              {appliedPromoCode && (
                <div className="flex justify-between text-base">
                  <span className="text-green-600">Promo Code Discount</span>
                  <span className="text-green-600">-${promoDiscount}</span>
                </div>
              )}
              {appliedGiftCard && (
                <div className="flex justify-between text-base">
                  <span className="text-blue-600">Gift Card Credit</span>
                  <span className="text-blue-600">-${giftCardCredit}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="text-xl text-gray-900">Total Amount</span>
                <span className="text-3xl text-gray-900" style={{ color: primaryColor }}>
                  ${totalPrice}
                </span>
              </div>
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
              <div className="lg:sticky lg:top-4">
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
                    {appliedPromoCode && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Promo Discount:</span>
                        <span className="text-green-600">-${promoDiscount}</span>
                      </div>
                    )}
                    {appliedGiftCard && (
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600">Gift Card:</span>
                        <span className="text-blue-600">-${giftCardCredit}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg text-gray-900">Total</span>
                      <span className="text-2xl text-gray-900" style={{ color: primaryColor }}>
                        ${totalPrice}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCompletePayment}
                    disabled={!canCompletePay || isSubmitting}
                    className="w-full text-white h-14 text-lg shadow-lg hover:shadow-xl"
                    style={{ backgroundColor: (canCompletePay && !isSubmitting) ? primaryColor : undefined }}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    {isSubmitting ? 'Processing...' : `Complete Payment $${totalPrice}`}
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'success' && (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
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
