import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { generateTimeSlots, getAvailableDatesForMonth, isDateBlocked, isDayOperating } from '../../utils/availabilityEngine';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { VisuallyHidden } from '../ui/visually-hidden';
import { ScrollArea } from '../ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { 
  Calendar, Clock, Users, ChevronLeft, ChevronRight, Star, Play, Info, 
  X, ShoppingCart, CreditCard, Lock, CheckCircle2, Mail, Phone, User,
  Target, Zap, Award, Shield, MapPin, ChevronDown, ChevronUp, HelpCircle,
  Sparkles, TrendingUp, Heart, FileText, Camera, Languages, Briefcase,
  AlertCircle, XCircle, RefreshCw, ShieldCheck
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { PromoCodeInput } from './PromoCodeInput';
import { GiftCardInput } from './GiftCardInput';

interface CalendarWidgetProps {
  primaryColor?: string;
  config?: any;
}

export function CalendarWidget({ primaryColor = '#2563eb', config }: CalendarWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<number>(config?.defaultSelectedDateDay ?? 15);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(config?.games?.[0]?.id ?? null);
  const [partySize, setPartySize] = useState(4);
  const [showGameDetails, setShowGameDetails] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<'booking' | 'cart' | 'checkout' | 'success'>('booking');
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
  const [bookingsCount, setBookingsCount] = useState(0);
  
  // Promo code and gift card state
  const [showPromoCodeInput, setShowPromoCodeInput] = useState(false);
const [appliedPromoCode, setAppliedPromoCode] = useState<{ code: string; discount: number; type: 'percentage' | 'fixed' } | null>(null);
  const [showGiftCardInput, setShowGiftCardInput] = useState(false);
  const [appliedGiftCard, setAppliedGiftCard] = useState<{ code: string; amount: number } | null>(null);
  const [showSecuredDialog, setShowSecuredDialog] = useState(false);
  const [showHealthSafetyDialog, setShowHealthSafetyDialog] = useState(false);

  // Derived preview/config values
  const previewRole = String(config?.previewRole || 'customer').toLowerCase();
  const timezoneLabel = config?.timezoneLabel || 'Local Time';
  const slotDurationMinutes = typeof config?.slotDurationMinutes === 'number' ? config.slotDurationMinutes : 90;
  const allowPromoSection = (config?.showPromoCodeInput ?? true) && previewRole !== 'staff';
  const allowGiftSection = config?.showGiftCardInput ?? true;
  const cs = config?.customSettings || {};

  const games = (Array.isArray(config?.games) ? config.games : []).map((g: any) => {
    const difficultyLabel = typeof g?.difficulty === 'number'
      ? (g.difficulty <= 2 ? 'Easy' : g.difficulty === 3 ? 'Medium' : g.difficulty === 4 ? 'Hard' : 'Extreme')
      : (g?.difficultyLabel || g?.difficulty || 'Medium');
    const difficultyLevelMap: Record<string, number> = { Easy: 2, Medium: 3, Hard: 4, Extreme: 5 };
    return {
      id: g?.id,
      name: g?.name,
      duration: g?.duration || '60 min',
      price: typeof g?.price === 'number' ? g.price : (typeof g?.basePrice === 'number' ? g.basePrice : 0),
      rating: g?.rating ?? 0,
      reviewCount: g?.reviews ?? 0,
      difficulty: difficultyLabel,
      difficultyLevel: typeof g?.difficulty === 'number' ? g.difficulty : (difficultyLevelMap[String(difficultyLabel)] ?? 3),
      players: g?.players || '',
      minAge: g?.minAge,
      ageRecommendation: g?.ageRange || '',
      image: g?.image || g?.imageUrl || g?.coverImage || 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=500&fit=crop',
      gallery: g?.galleryImages || g?.gallery || [],
      description: g?.description || '',
      longDescription: g?.longDescription || g?.description || '',
      highlights: g?.highlights || [],
      story: g?.story || '',
      whatToExpect: g?.whatToExpect || [],
      requirements: g?.requirements || [],
      successTips: g?.successTips || [],
      faq: g?.faq || [],
      reviews: g?.reviewsList || [],
      gameType: g?.gameType || 'physical',
      // Schedule & Availability fields
      operatingDays: g?.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      startTime: g?.startTime || '10:00',
      endTime: g?.endTime || '22:00',
      slotInterval: g?.slotInterval || 60,
      advanceBooking: g?.advanceBooking || 30
    };
  });

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const selectedGameData = selectedGame ? (games.find(g => g.id === selectedGame) || games[0]) : games[0];

  // Get current month and year for calendar
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Calculate time slots dynamically based on selected game's schedule
  const timeSlots = useMemo(() => {
    if (!selectedGameData) return [];
    
    const selectedDateObj = new Date(currentYear, currentMonth, selectedDate);
    const blockedDates = config?.blockedDates || [];
    
    return generateTimeSlots(
      selectedDateObj,
      {
        operatingDays: selectedGameData.operatingDays,
        startTime: selectedGameData.startTime,
        endTime: selectedGameData.endTime,
        slotInterval: selectedGameData.slotInterval,
        duration: typeof selectedGameData.duration === 'string' 
          ? parseInt(selectedGameData.duration) 
          : selectedGameData.duration,
        advanceBooking: selectedGameData.advanceBooking
      },
      blockedDates,
      [] // TODO: Load existing bookings from database
    );
  }, [selectedDate, currentMonth, currentYear, selectedGameData, config]);

  // Compute address details from config with sensible fallbacks (parity with single-game page)
  const streetAddress = (config?.streetAddress || config?.address || (selectedGameData as any)?.location?.address) as string | undefined;
  const city = (config?.city || (selectedGameData as any)?.location?.city) as string | undefined;
  const state = (config?.state || (selectedGameData as any)?.location?.state) as string | undefined;
  const zipCode = (config?.zipCode || config?.postalCode || (selectedGameData as any)?.location?.zip || (selectedGameData as any)?.location?.postalCode) as string | undefined;
  const country = (config?.country || (selectedGameData as any)?.location?.country) as string | undefined;
  const fullAddress = [streetAddress, city, state, zipCode, country].filter(Boolean).join(', ');
  const heroImage: string = (selectedGameData?.image || (selectedGameData as any)?.coverImage || 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=630&fit=crop') as string;
  // Contact details derived from config or selected game
  const contactPhone = (config?.phoneNumber || (selectedGameData as any)?.location?.phone || '') as string;
  const contactEmail = (config?.emailAddress || (selectedGameData as any)?.contactEmail || '') as string;

  useEffect(() => {
    if (!selectedGame && games.length > 0) {
      setSelectedGame(games[0].id);
    }
  }, [config, games, selectedGame]);

  // Inject SEO meta tags, Open Graph/Twitter, and optional JSON-LD LocalBusiness (parity with single-game page)
  useEffect(() => {
    const title = (config?.seoTitle as string) || `${(config?.businessName as string) || 'Booking'} | Calendar`;
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

      const description = (config?.metaDescription as string) || 'Browse and book experiences';
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
      const existing = document.getElementById('calendar-widget-jsonld') as HTMLScriptElement | null;
      if (config?.enableLocalBusinessSchema) {
        const mapUrl = fullAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}` : undefined;
        const jsonLd: Record<string, any> = {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: (config?.businessName as string) || (selectedGameData?.name as string) || 'Booking',
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
        scriptEl.id = 'calendar-widget-jsonld';
        scriptEl.textContent = JSON.stringify(jsonLd, null, 2);
        if (!existing) document.head.appendChild(scriptEl);
      } else if (existing) {
        existing.remove();
      }
    }

    return () => {
      const el = document.getElementById('calendar-widget-jsonld');
      if (el) el.remove();
    };
  }, [config, selectedGameData?.name, heroImage, fullAddress, streetAddress, city, state, zipCode, country]);

  // Load existing bookings count on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bookings');
      if (saved) {
        const arr = JSON.parse(saved);
        setBookingsCount(Array.isArray(arr) ? arr.length : 0);
      }
    } catch (error) {
      console.error('Error loading bookings from localStorage:', error);
    }
  }, []);
  
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
  const calculateSubtotal = () => (selectedGameData?.price ?? 0) * partySize;
  
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

  const canAddToCart = selectedTime !== null;
  
  const canCheckout = customerData.name !== '' && customerData.email !== '' && customerData.phone !== '';
  
  const canCompletePay = customerData.cardNumber !== '' && customerData.cardExpiry !== '' && 
                         customerData.cardCVV !== '' && customerData.cardName !== '';

  const resetBooking = () => {
    setCurrentStep('booking');
    setSelectedDate(15);
    setSelectedTime(null);
    setSelectedGame(games[0]?.id ?? null);
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

  // Save booking to localStorage and move to success step
  const handleCompleteBooking = () => {
    if (!canCompletePay) {
      alert('Please complete checkout details');
      return;
    }

    try {
      const isoDate = new Date(new Date().getFullYear(), 10, Number(selectedDate)).toISOString().slice(0, 10); // Nov index = 10
      const bookingData = {
        id: `booking_${Date.now()}`,
        timestamp: new Date().toISOString(),
        reference: bookingNumber,
        status: 'confirmed',
        widget: 'calendar',
        customer: {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone,
        },
        game: {
          id: selectedGameData?.id,
          name: selectedGameData?.name,
          duration: selectedGameData?.duration,
        },
        schedule: {
          dateLabel: `Nov ${selectedDate}, 2025`,
          isoDate,
          time: selectedTime,
        },
        participants: partySize,
        pricing: {
          subtotal: calculateSubtotal(),
          promoDiscount: calculateDiscount(),
          giftCardDiscount: calculateGiftCardDiscount(),
          total: totalPrice,
          currency: 'USD',
        },
        promoCode: appliedPromoCode ? { code: appliedPromoCode.code, discount: appliedPromoCode.discount } : null,
        giftCard: appliedGiftCard ? { code: appliedGiftCard.code, amount: appliedGiftCard.amount } : null,
        source: 'CalendarWidget',
      };

      const existing = localStorage.getItem('bookings');
      const all = existing ? JSON.parse(existing) : [];
      all.push(bookingData);
      localStorage.setItem('bookings', JSON.stringify(all));
      setBookingsCount(all.length);

      toast.success('Booking saved');
      console.log('✅ Saved booking:', bookingData);
      console.log('✅ Total bookings:', all.length);

      setCurrentStep('success');
    } catch (error) {
      console.error('❌ Error saving booking:', error);
      toast.error('Failed to save booking');
    }
  };

  const renderDifficultyStars = (level: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 transition-all ${
              star <= level ? 'fill-orange-400 text-orange-400 scale-100' : 'fill-gray-200 text-gray-200 scale-90'
            }`}
          />
        ))}
      </div>
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (games.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto p-6">
          <Card className="p-6">
            <h2 className="text-xl text-gray-900 mb-2">No experiences configured</h2>
            <p className="text-gray-600 mb-4">Add games in the settings to display the calendar booking widget.</p>
            <div className="text-sm text-gray-700">Open Settings → Games and create your first experience.</div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50" style={{ fontFamily: config?.fontFamily || undefined }}>
      {/* Health & Safety Dialog */}
      <Dialog open={showHealthSafetyDialog} onOpenChange={setShowHealthSafetyDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Health & Safety</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <ul className="space-y-4">
              <li className="flex items-start">
                <ShieldCheck className="w-6 h-6 text-green-500 mr-4" />
                <div>
                  <h4 className="font-semibold">Enhanced Cleaning</h4>
                  <p className="text-sm text-gray-500">We've increased the frequency of cleaning and disinfecting our facilities, especially high-touch surfaces.</p>
                </div>
              </li>
              <li className="flex items-start">
                <Users className="w-6 h-6 text-green-500 mr-4" />
                <div>
                  <h4 className="font-semibold">Private Experiences</h4>
                  <p className="text-sm text-gray-500">All our escape room games are private, meaning you'll only be playing with the people you came with.</p>
                </div>
              </li>
              <li className="flex items-start">
                <Heart className="w-6 h-6 text-green-500 mr-4" />
                <div>
                  <h4 className="font-semibold">Well-being</h4>
                  <p className="text-sm text-gray-500">If you're feeling unwell, please stay home. We're happy to reschedule your booking for a future date.</p>
                </div>
              </li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Secured Dialog */}
      <Dialog open={showSecuredDialog} onOpenChange={setShowSecuredDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Secure Booking</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-sm text-gray-500 mb-4">Your security and privacy are our top priorities. We use industry-leading technology to protect your information.</p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <ShieldCheck className="w-6 h-6 text-green-500 mr-4" />
                <div>
                  <h4 className="font-semibold">SSL Encryption</h4>
                  <p className="text-sm text-gray-500">All data transmitted between your browser and our servers is encrypted using 256-bit SSL technology, the same security used by major banks.</p>
                </div>
              </li>
              <li className="flex items-start">
                <ShieldCheck className="w-6 h-6 text-green-500 mr-4" />
                <div>
                  <h4 className="font-semibold">PCI DSS Compliant</h4>
                  <p className="text-sm text-gray-500">Our payment processing is fully compliant with Payment Card Industry Data Security Standards, ensuring your card information is handled with the highest security.</p>
                </div>
              </li>
              <li className="flex items-start">
                <ShieldCheck className="w-6 h-6 text-green-500 mr-4" />
                <div>
                  <h4 className="font-semibold">Data Protection</h4>
                  <p className="text-sm text-gray-500">We never store your complete credit card information on our servers. All payment data is tokenized and processed through secure, certified payment gateways.</p>
                </div>
              </li>
              <li className="flex items-start">
                <ShieldCheck className="w-6 h-6 text-green-500 mr-4" />
                <div>
                  <h4 className="font-semibold">Privacy Guaranteed</h4>
                  <p className="text-sm text-gray-500">Your personal information is kept confidential and will never be shared with third parties without your explicit consent.</p>
                </div>
              </li>
            </ul>
            <div className="mt-6 bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700"><strong>Your trust matters:</strong> We're committed to maintaining the highest standards of security and transparency in all our transactions.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex justify-end items-center gap-4 p-4">
        {/* Preview badges */}
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 border">
          TZ: {timezoneLabel}
        </Badge>
        <Badge variant="secondary" className="bg-gray-100 text-gray-700 border">
          Role: {previewRole}
        </Badge>
        {config.showSecuredBadge && (
          <Button variant="outline" onClick={() => setShowSecuredDialog(true)}>
            <ShieldCheck className="w-4 h-4 mr-2" />
            Secured
          </Button>
        )}
        {config.showHealthSafety && (
          <Button variant="outline" onClick={() => setShowHealthSafetyDialog(true)}>
            <Heart className="w-4 h-4 mr-2" />
            Health & Safety
          </Button>
        )}
      </div>
      {/* Headline + Logo + Description (Custom Settings) */}
      <div className="mb-6">
        {cs.logoUrl && cs.logoPosition === 'top' && (
          <img src={cs.logoUrl} alt="logo" style={{ width: cs.logoSize, height: cs.logoSize }} className="mx-auto mb-2" />
        )}
        <div className="flex items-center justify-center gap-3">
          {cs.logoUrl && cs.logoPosition === 'left' && (
            <img src={cs.logoUrl} alt="logo" style={{ width: cs.logoSize, height: cs.logoSize }} />
          )}
          <h1
            className="font-bold mb-2"
            style={{
              fontFamily: cs.headlineFont || undefined,
              fontSize: (typeof cs.headlineSize === 'number' ? cs.headlineSize : 28),
              color: cs.headlineColor || undefined,
              textAlign: (cs.headlineAlign as any) || 'center',
            }}
          >
            {cs.headlineText || config.widgetTitle}
          </h1>
          {cs.logoUrl && cs.logoPosition === 'right' && (
            <img src={cs.logoUrl} alt="logo" style={{ width: cs.logoSize, height: cs.logoSize }} />
          )}
        </div>
        {cs.logoUrl && cs.logoPosition === 'bottom' && (
          <img src={cs.logoUrl} alt="logo" style={{ width: cs.logoSize, height: cs.logoSize }} className="mx-auto mt-2" />
        )}
        {cs.descriptionHtml ? (
          <div className="mt-1 text-gray-700" style={{ textAlign: (cs.headlineAlign as any) || 'center' }} dangerouslySetInnerHTML={{ __html: cs.descriptionHtml }} />
        ) : (
          <p className="text-center mb-2">{config.widgetDescription}</p>
        )}
      </div>
      {/* Enhanced Game Details Modal - SEO/AEO/GEO Optimized */}
      <Dialog open={showGameDetails} onOpenChange={setShowGameDetails}>
        <DialogContent className="!w-screen !h-screen !max-w-none !max-h-none sm:!w-[95vw] sm:!h-[95vh] sm:!max-w-[1200px] sm:!max-h-[95vh] !rounded-none sm:!rounded-xl overflow-hidden p-0 bg-gradient-to-b from-white to-gray-50 flex flex-col">
          {/* Close Button - Visible */}
          <button
            onClick={() => setShowGameDetails(false)}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 border border-gray-200"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>{selectedGameData.name}</DialogTitle>
              <DialogDescription>
                Complete guide to {selectedGameData.name} escape room - {selectedGameData.difficulty} difficulty, {selectedGameData.duration} duration, suitable for ages {selectedGameData.ageRecommendation}. Book your adventure now!
              </DialogDescription>
            </DialogHeader>
          </VisuallyHidden>
          
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full w-full">
              {/* Hero Cover Section */}
              <div className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
              {/* Background Image with Overlay */}
              <div className="absolute inset-0">
                <ImageWithFallback
                  src={selectedGameData.image}
                  alt={selectedGameData.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
              </div>

              {/* Hero Content */}
              <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 lg:p-12">
                {/* Badges */}
                <div className="flex items-center gap-3 mb-4">
                  {selectedGameData.featured && (
                    <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 px-3 py-1 text-sm">
                      ⭐ Featured
                    </Badge>
                  )}
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm px-3 py-1 text-sm">
                    <Star className="w-3 h-3 fill-white mr-1" />
                    {selectedGameData.rating} ({selectedGameData.reviewCount} reviews)
                  </Badge>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl text-white mb-3 sm:mb-4">
                  {selectedGameData.name}
                </h1>

                {/* Description */}
                <p className="text-base sm:text-lg text-gray-200 mb-6 sm:mb-8 max-w-3xl">
                  {selectedGameData.description}
                </p>

                {/* Quick Info Pills */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-white" />
                    <div>
                      <div className="text-xs text-gray-300">Duration</div>
                      <div className="text-sm text-white">{selectedGameData.duration}</div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <Users className="w-5 h-5 text-white" />
                    <div>
                      <div className="text-xs text-gray-300">Players</div>
                      <div className="text-sm text-white">{selectedGameData.players}</div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <Target className="w-5 h-5 text-white" />
                    <div>
                      <div className="text-xs text-gray-300">Difficulty</div>
                      <div className="text-sm text-white">{selectedGameData.difficulty}</div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <Award className="w-5 h-5 text-white" />
                    <div>
                      <div className="text-xs text-gray-300">Type</div>
                      <div className="text-sm text-white">{selectedGameData.gameType}</div>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-white" />
                    <div>
                      <div className="text-xs text-gray-300">Location</div>
                      <div className="text-sm text-white">Downtown</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button 
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md transition-all"
                    variant="outline"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    View Gallery
                  </Button>
                  <Button 
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md transition-all"
                    variant="outline"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Watch Video
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-8 sm:space-y-10 p-4 sm:p-6 lg:p-8 pb-20">
              {/* Hero Gallery */}
              <section aria-label="Photo gallery">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {selectedGameData.gallery.map((image, index) => (
                    <div 
                      key={index} 
                      className="group aspect-video rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 relative"
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`${selectedGameData.name} escape room - View ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Overview */}
              <section aria-labelledby="overview-heading" className="scroll-mt-20">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                      <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
                    </div>
                    <h2 id="overview-heading" className="text-2xl sm:text-3xl text-gray-900">
                      Overview
                    </h2>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                    {selectedGameData.longDescription}
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 sm:p-5 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm sm:text-base text-gray-700">
                        <strong className="text-blue-900">At a Glance:</strong> {selectedGameData.description}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Collapsible Information Sections - SEO & LLM Optimized */}
              <section aria-labelledby="detailed-info-heading" className="scroll-mt-20">
                <VisuallyHidden>
                  <h2 id="detailed-info-heading">Detailed Activity Information</h2>
                </VisuallyHidden>
                
                <Accordion type="single" collapsible defaultValue="activity-details" className="space-y-4">
                  {/* Activity Details */}
                  <AccordionItem 
                    value="activity-details" 
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    data-seo-section="activity-details"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors [&[data-state=open]]:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-lg text-gray-900">Activity Details</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-6 pt-2">
                        {/* Duration & Group Size */}
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div itemScope itemType="https://schema.org/Duration">
                            <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                              <Clock className="w-5 h-5" style={{ color: primaryColor }} />
                              Duration
                            </h3>
                            <p className="text-gray-700" itemProp="duration">
                              <strong className="text-xl" style={{ color: primaryColor }}>{selectedGameData.duration}</strong>
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Total experience time including briefing and debriefing
                            </p>
                          </div>

                          <div itemScope itemType="https://schema.org/QuantitativeValue">
                            <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                              <Users className="w-5 h-5" style={{ color: primaryColor }} />
                              Group Size
                            </h3>
                            <p className="text-gray-700" itemProp="value">
                              <strong className="text-xl" style={{ color: primaryColor }}>{selectedGameData.players}</strong>
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Private experience - your group only
                            </p>
                          </div>
                        </div>

                        <Separator />

                        {/* Difficulty Level */}
                        <div>
                          <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                            <Target className="w-5 h-5" style={{ color: primaryColor }} />
                            Difficulty Level
                          </h3>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <div
                                  key={level}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                    level <= selectedGameData.difficulty
                                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md'
                                      : 'bg-gray-200 text-gray-400'
                                  }`}
                                >
                                  <span className="text-xs">{level}</span>
                                </div>
                              ))}
                            </div>
                            <span className="text-gray-700">
                              <strong style={{ color: primaryColor }}>{selectedGameData.difficulty}/5</strong> - {selectedGameData.difficulty <= 2 ? 'Beginner Friendly' : selectedGameData.difficulty <= 3 ? 'Moderate Challenge' : 'Advanced Puzzlers'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {selectedGameData.difficulty <= 2 
                              ? 'Perfect for first-time escape room enthusiasts and families' 
                              : selectedGameData.difficulty <= 3 
                              ? 'Suitable for those with some escape room experience'
                              : 'Recommended for experienced escape room teams'}
                          </p>
                        </div>

                        <Separator />

                        {/* What's Included */}
                        <div>
                          <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            What's Included
                          </h3>
                          <ul className="space-y-3">
                            {selectedGameData.whatToExpect.map((item: string, index: number) => (
                              <li key={index} className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                                <span className="text-gray-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Separator />

                        {/* Meeting Point */}
                        <div itemScope itemType="https://schema.org/Place">
                          <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                            <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                            Meeting Point
                          </h3>
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                            <p className="text-gray-700" itemProp="address">
                              <strong>123 Adventure Street, Downtown District</strong><br />
                              New York, NY 10001
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              Please arrive <strong className="text-blue-900">15 minutes before</strong> your scheduled time for check-in and game briefing
                            </p>
                          </div>
                        </div>

                        <Separator />

                        {/* Languages Offered */}
                        <div>
                          <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                            <Languages className="w-5 h-5" style={{ color: primaryColor }} />
                            Available Languages
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {['English', 'Spanish', 'French', 'German'].map((lang) => (
                              <Badge key={lang} variant="secondary" className="text-sm px-3 py-1">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            Game master can provide hints and instructions in multiple languages
                          </p>
                        </div>

                        {/* Age Recommendation */}
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-700">
                                <strong className="text-amber-900">Age Requirement:</strong> Recommended for ages {selectedGameData.ageRecommendation}. Children under 16 must be accompanied by an adult.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Additional Information */}
                  <AccordionItem 
                    value="additional-info" 
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    data-seo-section="additional-information"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors [&[data-state=open]]:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                          <Info className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-lg text-gray-900">Additional Information</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-6 pt-2">
                        {/* Accessibility */}
                        <div>
                          <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-600" />
                            Accessibility & Accommodations
                          </h3>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <span>Wheelchair accessible facility with elevator access</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <span>Accessible restroom facilities available</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <span>Service animals are welcome</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <span>Special accommodations available - contact us in advance</span>
                            </li>
                          </ul>
                        </div>

                        <Separator />

                        {/* Health & Safety */}
                        <div>
                          <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" />
                            Health & Safety Protocols
                          </h3>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <span>Rooms sanitized and disinfected between each group</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <span>Emergency exits clearly marked and accessible at all times</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <span>Game master monitoring via live camera feed</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <span>First aid certified staff on-site during all operating hours</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                              <span>Climate-controlled environment for your comfort</span>
                            </li>
                          </ul>
                        </div>

                        <Separator />

                        {/* What to Bring/Wear */}
                        <div>
                          <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" style={{ color: primaryColor }} />
                            What to Bring & Wear
                          </h3>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h4 className="text-sm text-green-900 mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Recommended
                              </h4>
                              <ul className="space-y-1 text-sm text-gray-700">
                                <li>• Comfortable casual clothing</li>
                                <li>• Closed-toe shoes (required)</li>
                                <li>• Enthusiasm and team spirit!</li>
                                <li>• Your confirmation email/QR code</li>
                              </ul>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <h4 className="text-sm text-red-900 mb-2 flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                Not Recommended
                              </h4>
                              <ul className="space-y-1 text-sm text-gray-700">
                                <li>• Loose jewelry or accessories</li>
                                <li>• High heels or open-toed shoes</li>
                                <li>• Large bags (lockers provided)</li>
                                <li>• Outside food or beverages</li>
                              </ul>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mt-3 bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                            <strong className="text-blue-900">Note:</strong> You may need to kneel, reach, crawl, or perform light physical activity. All puzzles can be solved through teamwork and creativity.
                          </p>
                        </div>

                        <Separator />

                        {/* Restrictions */}
                        <div>
                          <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                            Important Restrictions
                          </h3>
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                              <span>Not suitable for individuals with severe claustrophobia</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                              <span>No outside food, drinks, or smoking permitted in game rooms</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                              <span>Photography/video recording not allowed inside game room (lobby photos OK)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                              <span>All participants must sign waiver (minors need parent/guardian signature)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-500" />
                              <span>Pregnant individuals should consult with staff before participating</span>
                            </li>
                          </ul>
                        </div>

                        {/* Photography Policy */}
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
                          <div className="flex items-start gap-3">
                            <Camera className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm text-purple-900 mb-1">Photography Policy</h4>
                              <p className="text-sm text-gray-700">
                                Photos and videos welcome in our lobby! Inside the game room, photography is not permitted to preserve the mystery for future players. We'll take a professional victory photo for successful teams!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* FAQs */}
                  <AccordionItem 
                    value="faqs" 
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    data-seo-section="frequently-asked-questions"
                    itemScope 
                    itemType="https://schema.org/FAQPage"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors [&[data-state=open]]:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                          <HelpCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-lg text-gray-900">Frequently Asked Questions</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-5 pt-2">
                        {selectedGameData.faq.map((item: any, index: number) => (
                          <div 
                            key={index} 
                            className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-5 border border-gray-200"
                            itemScope 
                            itemProp="mainEntity" 
                            itemType="https://schema.org/Question"
                          >
                            <h3 className="text-base text-gray-900 mb-2 flex items-start gap-2" itemProp="name">
                              <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                              <span>{item.question}</span>
                            </h3>
                            <div 
                              itemScope 
                              itemProp="acceptedAnswer" 
                              itemType="https://schema.org/Answer"
                            >
                              <p className="text-gray-700 ml-7" itemProp="text">
                                {item.answer}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* Additional Universal FAQs */}
                        <Separator className="my-4" />
                        
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-5 border border-gray-200" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                          <h3 className="text-base text-gray-900 mb-2 flex items-start gap-2" itemProp="name">
                            <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                            <span>Do I need to book in advance?</span>
                          </h3>
                          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                            <p className="text-gray-700 ml-7" itemProp="text">
                              Yes, advance booking is required. We recommend booking at least 2-3 days in advance, especially for weekends and evenings. Walk-ins are accepted only if we have availability.
                            </p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-5 border border-gray-200" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                          <h3 className="text-base text-gray-900 mb-2 flex items-start gap-2" itemProp="name">
                            <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                            <span>Can I change my booking date/time?</span>
                          </h3>
                          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                            <p className="text-gray-700 ml-7" itemProp="text">
                              Yes! You can reschedule your booking free of charge up to 48 hours before your scheduled time. Contact us via phone or email with your booking reference.
                            </p>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-5 border border-gray-200" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                          <h3 className="text-base text-gray-900 mb-2 flex items-start gap-2" itemProp="name">
                            <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: primaryColor }} />
                            <span>Is this escape room scary or horror-themed?</span>
                          </h3>
                          <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                            <p className="text-gray-700 ml-7" itemProp="text">
                              {selectedGameData.difficulty <= 2 
                                ? 'This room has a mysterious atmosphere but is designed to be family-friendly without jump scares or intense horror elements.' 
                                : 'While this room has some atmospheric elements, it focuses on puzzles and mystery rather than horror. There are no actors or jump scares.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Cancellation Policy */}
                  <AccordionItem 
                    value="cancellation" 
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    data-seo-section="cancellation-refund-policy"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors [&[data-state=open]]:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100">
                          <RefreshCw className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-lg text-gray-900">Cancellation & Refund Policy</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-6 pt-2">
                        {/* Cancellation Timeline */}
                        <div>
                          <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5" style={{ color: primaryColor }} />
                            Cancellation Timeline & Refunds
                          </h3>
                          <div className="space-y-4">
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                              <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h4 className="text-sm text-green-900 mb-1">48+ Hours Before</h4>
                                  <p className="text-sm text-gray-700">
                                    <strong>Free cancellation</strong> - Full 100% refund to original payment method or free rescheduling to any available time slot
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                              <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h4 className="text-sm text-amber-900 mb-1">24-48 Hours Before</h4>
                                  <p className="text-sm text-gray-700">
                                    <strong>50% refund</strong> or <strong>free rescheduling</strong> - Your choice of partial refund or move to another available date/time
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                              <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h4 className="text-sm text-red-900 mb-1">Less than 24 Hours</h4>
                                  <p className="text-sm text-gray-700">
                                    <strong>No refund</strong> - However, you may reschedule <strong>one time</strong> for a $25 rescheduling fee (subject to availability)
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                              <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <h4 className="text-sm text-blue-900 mb-1">No-Show Policy</h4>
                                  <p className="text-sm text-gray-700">
                                    If you don't arrive for your scheduled booking and haven't contacted us, <strong>no refund or rescheduling</strong> will be offered. Full booking fee is forfeited.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* How to Cancel or Reschedule */}
                        <div>
                          <h3 className="text-base text-gray-900 mb-4 flex items-center gap-2">
                            <Phone className="w-5 h-5" style={{ color: primaryColor }} />
                            How to Cancel or Reschedule
                          </h3>
                          <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-5 border border-gray-200">
                            <ol className="space-y-3">
                              <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${primaryColor}15` }}>
                                  <span className="text-sm" style={{ color: primaryColor }}>1</span>
                                </div>
                                <div>
                                  <strong className="text-gray-900">Contact Us</strong>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {contactPhone || contactEmail ? (
                                      <>
                                        {contactPhone && (
                                          <>Call us at <strong className="text-blue-600">{contactPhone}</strong></>
                                        )}
                                        {contactPhone && contactEmail && <> or </>}
                                        {contactEmail && (
                                          <>email <strong className="text-blue-600">{contactEmail}</strong></>
                                        )}
                                      </>
                                    ) : (
                                      <>Contact us to cancel or reschedule — details are in your confirmation email.</>
                                    )}
                                  </p>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${primaryColor}15` }}>
                                  <span className="text-sm" style={{ color: primaryColor }}>2</span>
                                </div>
                                <div>
                                  <strong className="text-gray-900">Provide Booking Details</strong>
                                  <p className="text-sm text-gray-700 mt-1">
                                    Have your booking reference number, name, and scheduled date/time ready
                                  </p>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${primaryColor}15` }}>
                                  <span className="text-sm" style={{ color: primaryColor }}>3</span>
                                </div>
                                <div>
                                  <strong className="text-gray-900">Choose Option</strong>
                                  <p className="text-sm text-gray-700 mt-1">
                                    Select to either cancel for a refund (if eligible) or reschedule to a new date/time
                                  </p>
                                </div>
                              </li>
                              <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${primaryColor}15` }}>
                                  <span className="text-sm" style={{ color: primaryColor }}>4</span>
                                </div>
                                <div>
                                  <strong className="text-gray-900">Receive Confirmation</strong>
                                  <p className="text-sm text-gray-700 mt-1">
                                    You'll receive email confirmation of your cancellation/refund or new booking details
                                  </p>
                                </div>
                              </li>
                            </ol>
                          </div>
                        </div>

                        <Separator />

                        {/* Important Notes */}
                        <div>
                          <h3 className="text-base text-gray-900 mb-4">Important Notes</h3>
                          <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                              <span>Refunds are processed to the original payment method within 5-7 business days</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                              <span>Gift card purchases and promotional bookings may have different cancellation terms</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                              <span>Group bookings (10+ people) may have special cancellation policies - contact us for details</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                              <span>We reserve the right to cancel bookings due to unforeseen circumstances and will offer full refund or alternative dates</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-600" />
                              <span>Weather-related closures: Full refund or free rescheduling if we must close due to severe weather</span>
                            </li>
                          </ul>
                        </div>

                        {/* Emergency Contact */}
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                          <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-sm text-red-900 mb-1">Running Late or Emergency?</h4>
                              <p className="text-sm text-gray-700">
                                {contactPhone ? (
                                  <>If you're running late or have an emergency, please call us immediately at <strong className="text-red-900">{contactPhone}</strong>. We'll do our best to accommodate you, though we cannot guarantee your full playing time if you arrive late.</>
                                ) : (
                                  <>If you're running late or have an emergency, please reach out to us. We'll do our best to accommodate you, though we cannot guarantee your full playing time if you arrive late.</>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Business Cancellation Policy (from configuration) */}
                        {config?.cancellationPolicy && (
                          <div className="mt-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
                            <h3 className="text-base text-gray-900 mb-2">Business Cancellation Policy</h3>
                            <p className="text-sm text-gray-700">{config.cancellationPolicy}</p>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>

              {/* Location & Directions - GEO Optimized */}
              {(config?.showLocationBlock !== false) && (fullAddress || config?.phoneNumber || config?.emailAddress || config?.parkingInfo) && (
              <section aria-labelledby="location-heading" className="scroll-mt-20">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                    <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <h2 id="location-heading" className="text-2xl sm:text-3xl text-gray-900">
                    Location & Directions
                  </h2>
                </div>
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5" style={{ color: primaryColor }} />
                        Address
                      </h3>
                      {streetAddress && (<p className="text-gray-700 mb-2">{streetAddress}</p>)}
                      {(city || state || zipCode) && (
                        <p className="text-gray-700 mb-2">{[city, state, zipCode].filter(Boolean).join(', ')}</p>
                      )}
                      {country && (<p className="text-gray-700 mb-4">{country}</p>)}
                      {(config?.nearbyLandmarks || config?.landmarkInfo) && (
                        <p className="text-sm text-gray-600">{config.nearbyLandmarks || config.landmarkInfo}</p>
                      )}
                      {fullAddress && (
                        <p className="pt-2">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-medium hover:underline"
                            style={{ color: primaryColor }}
                          >
                            Get directions
                          </a>
                        </p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 mb-3">Parking & Transportation</h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {config?.parkingInfo && (
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                            <span>{config.parkingInfo}</span>
                          </li>
                        )}
                        {config?.phoneNumber && (
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                            <span>Questions? Call us at {config.phoneNumber}</span>
                          </li>
                        )}
                        {config?.emailAddress && (
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                            <span>Email: {config.emailAddress}</span>
                          </li>
                        )}
                        {!(config?.parkingInfo || config?.phoneNumber || config?.emailAddress) && (
                          <li className="flex items-start gap-2">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                            <span>Parking and transport details will be shared upon booking.</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
              )}

              {/* What's Included */}
              <section aria-labelledby="included-heading" className="scroll-mt-20">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 id="included-heading" className="text-2xl sm:text-3xl text-gray-900">
                    What's Included
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    'Professional game master guidance throughout',
                    'Private escape room for your group only',
                    'All puzzles, clues, and props included',
                    'Pre-game briefing and safety orientation',
                    'Victory photo opportunity after escape',
                    'Complimentary water and refreshments',
                    'Climate-controlled comfortable environment',
                    'Free Wi-Fi in lobby and waiting area'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Booking & Cancellation Policy */}
              <section aria-labelledby="policy-heading" className="scroll-mt-20">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-orange-100">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 id="policy-heading" className="text-2xl sm:text-3xl text-gray-900">
                    Booking & Cancellation Policy
                  </h2>
                </div>
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
                  <div>
                    <h3 className="text-lg text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5" style={{ color: primaryColor }} />
                      Cancellation & Rescheduling
                    </h3>
                    <ul className="space-y-3 text-gray-700">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${primaryColor}15` }}>
                          <span className="text-sm" style={{ color: primaryColor }}>1</span>
                        </div>
                        <div>
                          <strong className="text-gray-900">Free cancellation:</strong> Cancel or reschedule up to 48 hours before your booking for a full refund
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${primaryColor}15` }}>
                          <span className="text-sm" style={{ color: primaryColor }}>2</span>
                        </div>
                        <div>
                          <strong className="text-gray-900">24-48 hours notice:</strong> 50% refund or free rescheduling to another available time
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${primaryColor}15` }}>
                          <span className="text-sm" style={{ color: primaryColor }}>3</span>
                        </div>
                        <div>
                          <strong className="text-gray-900">Less than 24 hours:</strong> No refund, but you can reschedule once for a $25 fee
                        </div>
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg text-gray-900 mb-3">Late Arrival Policy</h3>
                    <p className="text-gray-700 mb-3">Please arrive 15 minutes before your scheduled time for check-in and briefing.</p>
                    <ul className="space-y-2 text-sm text-gray-600 ml-5 list-disc">
                      <li>Arriving late may reduce your playing time (game still ends at scheduled time)</li>
                      <li>If you're more than 15 minutes late, we may need to reschedule your booking</li>
                      <li>No refunds for time lost due to late arrival</li>
                      <li>
                        {contactPhone ? (
                          <>Please call us if you're running late: {contactPhone}</>
                        ) : (
                          <>Please contact us if you're running late.</>
                        )}
                      </li>
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg text-gray-900 mb-3">Group Booking Policy</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                        <span>Minimum of {selectedGameData.players.split('-')[0]} players required</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                        <span>You can add or remove players up to 24 hours before your booking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                        <span>Private room guaranteed - you won't be grouped with strangers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                        <span>Corporate and team building discounts available for groups of 10+</span>
                      </li>
                    </ul>
                  </div>
                  {/* Configured Business Policy Summary */}
                  {config?.cancellationPolicy && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm text-gray-900 mb-1">Business Cancellation Policy</h4>
                      <p className="text-sm text-gray-700">{config.cancellationPolicy}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Safety & Accessibility */}
              <section aria-labelledby="safety-heading" className="scroll-mt-20">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 id="safety-heading" className="text-2xl sm:text-3xl text-gray-900">
                    Safety & Accessibility
                  </h2>
                </div>
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 sm:p-8 shadow-sm border border-gray-100">
                  <div className="grid sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-lg text-gray-900 mb-3">Health & Safety</h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                          <span>Regular sanitization between games</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                          <span>Emergency exit available at all times</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                          <span>Game master monitoring via camera</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                          <span>First aid trained staff on-site</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg text-gray-900 mb-3">Accessibility</h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                          <span>Wheelchair accessible facility</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                          <span>Elevator access to all floors</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                          <span>Accessible restrooms available</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                          <span>Service animals welcome</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-sm text-gray-700">
                      <strong className="text-blue-900">Note:</strong> If you have specific accessibility needs or health concerns, please contact us before booking at (555) 123-4567 so we can ensure the best experience for your group.
                    </p>
                  </div>
                </div>
              </section>

              {/* Additional Information */}
              <section aria-labelledby="additional-heading" className="scroll-mt-20">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                    <Info className="w-5 h-5" style={{ color: primaryColor }} />
                  </div>
                  <h2 id="additional-heading" className="text-2xl sm:text-3xl text-gray-900">
                    Good to Know
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                      <Camera className="w-5 h-5" style={{ color: primaryColor }} />
                      Photography Policy
                    </h3>
                    <p className="text-sm text-gray-700">Photos and videos are allowed in the lobby area. Inside the game room, photography is not permitted to preserve the experience for future players. We'll take a victory photo for you after completion!</p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" style={{ color: primaryColor }} />
                      What to Wear
                    </h3>
                    <p className="text-sm text-gray-700">Comfortable casual clothing recommended. Closed-toe shoes required. You may need to kneel, reach, or crawl. Avoid loose jewelry that could get caught. Temperature controlled environment.</p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" style={{ color: primaryColor }} />
                      What to Bring
                    </h3>
                    <p className="text-sm text-gray-700">Just bring yourself and your team! All puzzles and clues are provided. Lockers available for personal belongings. We recommend leaving valuables at home or in your vehicle.</p>
                  </div>
                  
                  <div className="bg-white p-5 rounded-xl border border-gray-200">
                    <h3 className="text-base text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5" style={{ color: primaryColor }} />
                      Age Restrictions
                    </h3>
                    <p className="text-sm text-gray-700">Recommended for ages {selectedGameData.ageRecommendation}. Children under 16 must be accompanied by an adult. All participants must sign a waiver (parents/guardians sign for minors).</p>
                  </div>
                </div>
              </section>

            {/* Key Details Grid */}
            <section aria-labelledby="details-heading" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Award className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <h2 id="details-heading" className="text-2xl sm:text-3xl text-gray-900">
                  Key Details
                </h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="group text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-blue-200">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Clock className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                  </div>
                  <div className="text-xs sm:text-sm text-blue-700 mb-1">Duration</div>
                  <div className="text-base sm:text-lg text-blue-900">{selectedGameData.duration}</div>
                </div>
                <div className="group text-center p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-purple-200">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
                  </div>
                  <div className="text-xs sm:text-sm text-purple-700 mb-1">Group Size</div>
                  <div className="text-base sm:text-lg text-purple-900">{selectedGameData.players}</div>
                </div>
                <div className="group text-center p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-orange-200">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Target className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" />
                  </div>
                  <div className="text-xs sm:text-sm text-orange-700 mb-1">Difficulty</div>
                  <div className="text-base sm:text-lg text-orange-900 mb-2">{selectedGameData.difficulty}</div>
                  <div className="flex justify-center">
                    {renderDifficultyStars(selectedGameData.difficultyLevel)}
                  </div>
                </div>
                <div className="group text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-green-200">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                  </div>
                  <div className="text-xs sm:text-sm text-green-700 mb-1">Min Age</div>
                  <div className="text-base sm:text-lg text-green-900">{selectedGameData.ageRecommendation}</div>
                </div>
              </div>
            </section>

            {/* The Story */}
            <section aria-labelledby="story-heading" className="scroll-mt-20">
              <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 sm:p-8 lg:p-10 rounded-2xl shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    <h2 id="story-heading" className="text-2xl sm:text-3xl">The Story</h2>
                  </div>
                  <p className="text-base sm:text-lg leading-relaxed text-gray-200">
                    {selectedGameData.story}
                  </p>
                </div>
              </div>
            </section>

            {/* What to Expect */}
            <section aria-labelledby="expect-heading" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Zap className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <h2 id="expect-heading" className="text-2xl sm:text-3xl text-gray-900">
                  What to Expect
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {selectedGameData.whatToExpect.map((item, index) => (
                  <div 
                    key={index} 
                    className="group flex items-start gap-3 p-4 sm:p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Highlights */}
            <section aria-labelledby="highlights-heading" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                  <Heart className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <h2 id="highlights-heading" className="text-2xl sm:text-3xl text-gray-900">
                  Experience Highlights
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {selectedGameData.highlights.map((highlight, index) => (
                  <div 
                    key={index} 
                    className="group relative overflow-hidden text-center p-4 sm:p-5 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl border border-blue-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-purple-400/0 group-hover:from-blue-400/5 group-hover:to-purple-400/5 transition-all duration-300"></div>
                    <Sparkles className="w-5 h-5 mx-auto mb-2 text-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative text-sm sm:text-base text-gray-900">{highlight}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Requirements & Guidelines */}
            <section aria-labelledby="requirements-heading" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-100">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <h2 id="requirements-heading" className="text-2xl sm:text-3xl text-gray-900">
                  Requirements & Guidelines
                </h2>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 sm:p-7 shadow-sm">
                <ul className="space-y-3">
                  {selectedGameData.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Info className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Success Tips */}
            <section aria-labelledby="tips-heading" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h2 id="tips-heading" className="text-2xl sm:text-3xl text-gray-900">
                  Tips for Success
                </h2>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 sm:p-7 shadow-sm">
                <ul className="space-y-4">
                  {selectedGameData.successTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-4 text-sm sm:text-base text-gray-700">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center shadow-md">
                        {index + 1}
                      </div>
                      <span className="leading-relaxed pt-1">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Customer Reviews */}
            <section aria-labelledby="reviews-heading" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-100">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                </div>
                <h2 id="reviews-heading" className="text-2xl sm:text-3xl text-gray-900">
                  Customer Reviews
                </h2>
              </div>
              <div className="space-y-4 sm:space-y-5">
                {selectedGameData.reviews.map((review, index) => (
                  <div 
                    key={index} 
                    className="group bg-white p-5 sm:p-7 rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-gray-300"
                  >
                    <div className="flex items-start justify-between mb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white shadow-md">
                          <span className="text-lg">{review.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-base sm:text-lg text-gray-900">{review.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{review.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-200">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ Section */}
            <section aria-labelledby="faq-heading" className="scroll-mt-20">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                  <HelpCircle className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <h2 id="faq-heading" className="text-2xl sm:text-3xl text-gray-900">
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {selectedGameData.faq.map((item, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group"
                    >
                      <span className="text-sm sm:text-base text-gray-900 pr-4 group-hover:text-blue-600 transition-colors">
                        {item.question}
                      </span>
                      <div 
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                        style={{ 
                          backgroundColor: expandedFAQ === index ? `${primaryColor}15` : 'transparent'
                        }}
                      >
                        {expandedFAQ === index ? (
                          <ChevronUp className="w-5 h-5 transition-transform duration-300" style={{ color: primaryColor }} />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        )}
                      </div>
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm sm:text-base text-gray-600 leading-relaxed animate-in slide-in-from-top-2 duration-200">
                        <div className="pt-3 border-t border-gray-100">
                          {item.answer}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Pricing CTA */}
            <section aria-labelledby="pricing-heading" className="scroll-mt-20">
              <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white p-8 sm:p-12 rounded-2xl shadow-2xl text-center">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative z-10">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                  <h2 id="pricing-heading" className="text-2xl sm:text-3xl lg:text-4xl mb-3">
                    Ready for the Adventure?
                  </h2>
                  <p className="text-base sm:text-lg text-blue-100 mb-6">
                    Book your escape room experience today
                  </p>
                  <div className="inline-block bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-4 mb-8">
                    <div className="text-sm text-blue-100 mb-1">Starting from</div>
                    <div className="text-5xl sm:text-6xl lg:text-7xl mb-1">
                      ${selectedGameData.price}
                    </div>
                    <div className="text-lg sm:text-xl text-blue-100">per person</div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => setShowGameDetails(false)}
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Book Now
                    </Button>
                    <Button
                      onClick={() => setShowGameDetails(false)}
                      size="lg"
                      variant="outline"
                      className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20 px-8 py-6 text-lg"
                    >
                      <Info className="w-5 h-5 mr-2" />
                      View Calendar
                    </Button>
                  </div>
                </div>
              </div>
            </section>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {currentStep === 'booking' && (
        <>
          {/* Hero Section */}
          <div className="relative h-[250px] sm:h-[350px] lg:h-[450px] bg-gray-900 overflow-hidden">
            <ImageWithFallback
              src={selectedGameData.image}
              alt={`${selectedGameData.name} escape room experience`}
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12 text-white">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4">{selectedGameData.name}</h1>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-sm sm:text-base lg:text-lg">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{selectedGameData.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{selectedGameData.players}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Age {selectedGameData.ageRecommendation}</span>
                  </div>
                  <Badge className={`${getDifficultyColor(selectedGameData.difficulty)} border-0 text-sm sm:text-base px-3 py-1.5`}>
                    {selectedGameData.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Game Selector */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl text-gray-900 mb-4 sm:mb-6">Choose Your Adventure</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {games.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => setSelectedGame(game.id)}
                    className={`group rounded-2xl border-2 overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer bg-white ${
                      selectedGame === game.id ? 'shadow-xl border-blue-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <Badge className={`absolute top-3 left-3 ${getDifficultyColor(game.difficulty)} border-0 shadow-md z-10`}>
                        {game.difficulty}
                      </Badge>
                      <ImageWithFallback
                        src={game.image}
                        alt={`${game.name} escape room`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="text-lg text-gray-900 mb-2">
                        {game.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-4 text-sm">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-gray-900">{game.rating}</span>
                        <span className="text-gray-500">({game.reviewCount})</span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{game.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{game.players}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Target className="w-4 h-4" />
                            <span>Age {game.ageRecommendation}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {renderDifficultyStars(game.difficultyLevel)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                        <div className="text-xl text-blue-600">
                          ${game.price}
                          <span className="text-sm text-gray-500">/person</span>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGame(game.id);
                            setShowGameDetails(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-sm whitespace-nowrap border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <Info className="w-4 h-4 mr-1" />
                          See Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                          if (currentMonth === 0) {
                            setCurrentMonth(11);
                            setCurrentYear(currentYear - 1);
                          } else {
                            setCurrentMonth(currentMonth - 1);
                          }
                        }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm sm:text-base text-gray-900 px-2 whitespace-nowrap min-w-[140px] text-center">
                        {new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-10 w-10 rounded-lg border-gray-300 hover:bg-gray-50"
                        onClick={() => {
                          if (currentMonth === 11) {
                            setCurrentMonth(0);
                            setCurrentYear(currentYear + 1);
                          } else {
                            setCurrentMonth(currentMonth + 1);
                          }
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
                    {Array.from({ length: new Date(currentYear, currentMonth + 1, 0).getDate() }).map((_, i) => {
                      const day = i + 1;
                      const dateObj = new Date(currentYear, currentMonth, day);
                      const isSelected = selectedDate === day;
                      const today = new Date();
                      const isToday = dateObj.toDateString() === today.toDateString();
                      const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      
                      // Check if date is available based on game schedule and blocked dates
                      const blockedDates = config?.blockedDates || [];
                      const isBlockedDate = isDateBlocked(dateObj, blockedDates);
                      const isOperatingDay = isDayOperating(dateObj, selectedGameData?.operatingDays);
                      const isAvailable = !isPast && !isBlockedDate && isOperatingDay;

                      return (
                        <button
                          key={i}
                          onClick={() => isAvailable && setSelectedDate(day)}
                          disabled={!isAvailable}
                          className={`
                            aspect-square rounded-xl text-base transition-all flex items-center justify-center relative
                            ${isToday && !isSelected
                              ? 'text-white shadow-md' 
                              : isSelected 
                                ? 'text-gray-900 border-2 shadow-sm bg-white hover:bg-gray-50' 
                                : isAvailable 
                                  ? 'text-gray-700 hover:bg-gray-50 border border-green-300 bg-green-50' 
                                  : 'text-gray-400 cursor-not-allowed border border-red-200 bg-red-50 opacity-60'
                            }
                          `}
                          style={{
                            backgroundColor: isToday && !isSelected ? primaryColor : (isSelected ? undefined : (isAvailable ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)')),
                            borderColor: isSelected ? primaryColor : (isAvailable ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'),
                          }}
                          title={!isAvailable ? (isBlockedDate ? 'Date blocked by admin' : !isOperatingDay ? 'Not operating on this day' : 'Past date') : 'Available'}
                        >
                          {day}
                          {isAvailable && !isSelected && !isToday && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-green-500"></span>
                          )}
                          {!isAvailable && !isPast && (
                            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Calendar Legend */}
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span>Blocked/Unavailable</span>
                    </div>
                  </div>
                </Card>

                {/* Time Slots */}
                {selectedDate && (
                  <Card className="p-6 sm:p-8 bg-white shadow-sm border border-gray-200 rounded-2xl">
                    <h2 className="text-lg sm:text-xl text-gray-900 mb-1 sm:mb-2">
                      Available Times - {new Date(currentYear, currentMonth, selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </h2>
                    <div className="text-xs text-gray-500 mb-4">Timezone: {timezoneLabel}</div>
                    
                    {timeSlots.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                          <X className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Times</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          This date is not available for booking. It may be blocked by the admin or outside operating hours. Please select another date.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {timeSlots.map((slot) => (
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
                          <div className={`text-sm sm:text-base mb-2 ${
                            selectedTime === slot.time ? 'text-white' : slot.available ? 'text-gray-900' : 'text-gray-400'
                          }`}>
                            {slot.time}
                          </div>
                          <div className={`text-xs flex items-center justify-center gap-1 ${
                            selectedTime === slot.time ? 'text-white/90' : slot.available ? 'text-green-600' : 'text-red-500'
                          }`}>
                            {slot.available ? (
                              <>
                                <Users className="w-3 h-3" />
                                <span>{slot.spots} spots</span>
                              </>
                            ) : (
                              <span>Sold out</span>
                            )}
                          </div>
                          <div className={`mt-2 text-[11px] ${selectedTime === slot.time ? 'text-white/80' : 'text-gray-500'}`}>
                            Duration: {slotDurationMinutes} min
                          </div>
                        </button>
                      ))}
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
                            <span className="text-gray-900 text-right truncate max-w-[55%]">{selectedGameData.name}</span>
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
                          <span className="text-gray-900">${selectedGameData.price} × {partySize}</span>
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
            <div className="flex items-center gap-2 mb-6">
              <ShoppingCart className="w-6 h-6" style={{ color: primaryColor }} />
              <h2 className="text-gray-900">Your Cart</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={selectedGameData.image}
                    alt={selectedGameData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-2">{selectedGameData.name}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Date: Nov {selectedDate}, 2025 at {selectedTime}</div>
                    <div>Players: {partySize} × ${selectedGameData.price}</div>
                  </div>
                </div>
                <div className="text-gray-900" style={{ color: primaryColor }}>
                  ${totalPrice}
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Promo Code and Gift Card Section */}
            {(allowPromoSection || allowGiftSection) && (
            <div className="mb-6 space-y-4">
              {/* Promo Code */}
              {allowPromoSection && (
              <div>
                {!appliedPromoCode && !showPromoCodeInput && (
                  <button 
                    onClick={() => setShowPromoCodeInput(true)}
                    className="text-sm md:text-base hover:underline"
                    style={{ color: primaryColor }}
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
              )}

              {/* Gift Card */}
              {allowGiftSection && (
              <div>
                {!appliedGiftCard && !showGiftCardInput && (
                  <button 
                    onClick={() => setShowGiftCardInput(true)}
                    className="text-sm md:text-base hover:underline"
                    style={{ color: primaryColor }}
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
              )}
            </div>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${calculateSubtotal()}</span>
              </div>
              {appliedPromoCode && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Promo Code ({appliedPromoCode.code})</span>
                  <span className="text-green-600">-${calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              {appliedGiftCard && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Gift Card ({appliedGiftCard.code})</span>
                  <span className="text-green-600">-${calculateGiftCardDiscount().toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-900">Total</span>
                <span className="text-2xl text-gray-900" style={{ color: primaryColor }}>
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            <Button
              onClick={() => setCurrentStep('checkout')}
              className="w-full text-white h-12"
              style={{ backgroundColor: primaryColor }}
            >
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      )}

      {currentStep === 'checkout' && (
        <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-8">
          <Button
            onClick={() => setCurrentStep('cart')}
            variant="outline"
            className="mb-4 sm:mb-6 min-h-[44px] px-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Card className="p-3 sm:p-4 md:p-6 bg-white border border-gray-200 shadow-sm">
                <h2 className="text-gray-900 mb-4 sm:mb-6 text-lg sm:text-xl">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                    <div className="relative mt-2">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={customerData.name}
                        onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                        className="pl-10 h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-700">Email</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={customerData.email}
                        onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                        className="pl-10 h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                    <div className="relative mt-2">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={customerData.phone}
                        onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                        className="pl-10 h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-3 sm:p-4 md:p-6 bg-white border border-gray-200 shadow-sm">
                <h2 className="text-gray-900 mb-4 sm:mb-6 text-lg sm:text-xl">Payment Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="cardName" className="text-gray-700">Name on Card</Label>
                    <Input
                      id="cardName"
                      type="text"
                      placeholder="John Doe"
                      value={customerData.cardName}
                      onChange={(e) => setCustomerData({ ...customerData, cardName: e.target.value })}
                      className="h-12 mt-2 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber" className="text-gray-700">Card Number</Label>
                    <div className="relative mt-2">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={customerData.cardNumber}
                        onChange={(e) => setCustomerData({ ...customerData, cardNumber: e.target.value })}
                        maxLength={19}
                        className="pl-10 h-12 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-gray-700">Expiry Date</Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM/YY"
                        value={customerData.cardExpiry}
                        onChange={(e) => setCustomerData({ ...customerData, cardExpiry: e.target.value })}
                        maxLength={5}
                        className="h-12 mt-2 bg-gray-100 border-gray-300 placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv" className="text-gray-700">CVV</Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        value={customerData.cardCVV}
                        onChange={(e) => setCustomerData({ ...customerData, cardCVV: e.target.value })}
                        maxLength={4}
                        className="h-12 mt-2 bg-gray-100 border-gray-300 placeholder:text-gray-500"
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
              <Card className="p-3 sm:p-4 md:p-6 bg-white border border-gray-200 shadow-sm">
                <h3 className="text-gray-900 mb-4 text-lg sm:text-xl">Order Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Game:</span>
                    <span className="text-gray-900">{selectedGameData.name}</span>
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
                    <span className="text-gray-900">Total</span>
                    <span className="text-2xl text-gray-900" style={{ color: primaryColor }}>
                      ${totalPrice}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCompleteBooking}
                  disabled={!canCompletePay}
                  className="w-full text-white min-h-[44px] h-12 sm:h-14 text-sm sm:text-base"
                  style={{ backgroundColor: canCompletePay ? primaryColor : undefined }}
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Complete Payment ${totalPrice}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'success' && (
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
                  <span className="text-gray-600">Game</span>
                  <span className="text-gray-900">{selectedGameData.name}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-gray-600">Date & Time</span>
                  <span className="text-gray-900">Nov {selectedDate}, 2025 at {selectedTime}</span>
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
