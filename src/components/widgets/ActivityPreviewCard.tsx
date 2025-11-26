/**
 * ActivityPreviewCard
 * 
 * A beautiful preview component matching CalendarSingleEventBookingPage design.
 * This is SEPARATE from live booking widgets - no database calls, no real bookings.
 * 
 * Design inspired by: CalendarSingleEventBookingPage
 * - Hero section with gradient overlay
 * - Info pills (duration, players, difficulty)
 * - Calendar with month navigation
 * - Time slots grid
 * - Booking summary sidebar
 * - Fully responsive (mobile, tablet, desktop)
 */

import { useState, useMemo } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Clock, Users, Award, MapPin, Star, 
  ChevronLeft, ChevronRight, Play, Image as ImageIcon,
  CreditCard, Shield, Sparkles, Plus, Minus
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from '../ui/utils';
import { 
  getDateStatus, 
  generateTimeSlotsForDate,
  ScheduleConfig,
  DayStatus
} from '../../lib/schedule/scheduleUtils';

// Activity data interface for preview
export interface ActivityPreviewData {
  id?: string;
  name: string;
  description?: string;
  duration: number;
  difficulty?: string;
  min_players?: number;
  max_players?: number;
  price: number;
  child_price?: number;
  image_url?: string;
  gallery_images?: string[];
  video_url?: string;
  age_guideline?: string;
  faqs?: Array<{ question: string; answer: string }>;
  highlights?: string[];
  schedule?: {
    operatingDays?: string[];
    startTime?: string;
    endTime?: string;
    slotInterval?: number;
    customHours?: Record<string, { start: string; end: string; enabled: boolean }>;
    blockedDates?: Array<{ date: string; reason?: string }>;
    specificDates?: Array<{ date: string; start: string; end: string }>;
    advanceBookingDays?: number;
  };
}

interface ActivityPreviewCardProps {
  activity: ActivityPreviewData;
  venueName?: string;
  venueCity?: string;
  venueState?: string;
  primaryColor?: string;
  theme?: 'light' | 'dark';
  showBookingFlow?: boolean;
  compact?: boolean;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&h=800&fit=crop';

export function ActivityPreviewCard({
  activity,
  venueName = 'Your Venue',
  venueCity,
  venueState,
  primaryColor = '#2563eb',
  theme = 'light',
  showBookingFlow = true,
  compact = false,
}: ActivityPreviewCardProps) {
  const isDark = theme === 'dark';
  
  // Compact mode adjustments for preview window
  const heroHeight = compact ? 'h-[180px] sm:h-[200px]' : 'h-[280px] sm:h-[320px] md:h-[360px]';
  const titleSize = compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl md:text-4xl';
  const pillSize = compact ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs';
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(2);

  // Derived values
  const heroImage = activity.image_url || DEFAULT_IMAGE;
  const location = venueCity && venueState ? `${venueCity}, ${venueState}` : 'Downtown Location';
  const players = `${activity.min_players || 2}-${activity.max_players || 8} players`;
  const durationText = `${activity.duration || 60} min`;

  // Build schedule config for utilities
  const scheduleConfig: ScheduleConfig = useMemo(() => ({
    operatingDays: activity.schedule?.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startTime: activity.schedule?.startTime || '10:00',
    endTime: activity.schedule?.endTime || '22:00',
    slotInterval: activity.schedule?.slotInterval || 60,
    customHours: activity.schedule?.customHours,
    blockedDates: activity.schedule?.blockedDates || [],
    specificDates: activity.schedule?.specificDates || [],
    advanceBookingDays: activity.schedule?.advanceBookingDays || 30,
  }), [activity.schedule]);

  // Generate time slots based on selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
    const slots = generateTimeSlotsForDate(date, scheduleConfig);
    // Add mock spots for preview
    return slots.map(slot => ({
      ...slot,
      spots: Math.floor(Math.random() * 8) + 1,
    }));
  }, [selectedDate, currentDate, scheduleConfig]);

  // Calculate days in month
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  // Helper to get date status with styling
  const getDayInfo = (day: number): { status: DayStatus; canBook: boolean } => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const status = getDateStatus(date, scheduleConfig);
    const canBook = status === 'available' || status === 'special';
    return { status, canBook };
  };

  // Price calculation
  const subtotal = activity.price * partySize;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + tax;

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  return (
    <div className={cn(
      "w-full transition-colors",
      compact ? "min-h-[800px]" : "min-h-screen",
      isDark ? "bg-[#161616]" : "bg-gray-50"
    )}>
      {/* Hero Section */}
      <div className={cn("relative overflow-hidden", heroHeight)}>
        {/* Background Image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src={heroImage}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

        {/* Content */}
        <div className="relative h-full flex flex-col justify-between">
          {/* Top Bar - Badges */}
          <div className="flex items-start justify-between p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-500 text-black border-0 px-2.5 py-1 text-xs font-medium">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-white text-xs font-medium">4.9</span>
                <span className="text-gray-200 text-xs">(234)</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/30 transition-all flex items-center gap-1.5 text-xs">
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Gallery</span>
              </button>
              <button className="bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-lg border border-white/30 hover:bg-white/30 transition-all flex items-center gap-1.5 text-xs">
                <Play className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">Video</span>
              </button>
            </div>
          </div>

          {/* Bottom Content - Title & Info */}
          <div className={cn("p-3 sm:p-4", compact ? "p-2 sm:p-3" : "p-4 sm:p-6")}>
            <h1 className={cn(titleSize, "text-white font-bold mb-1 sm:mb-2 drop-shadow-lg tracking-tight line-clamp-1")}>
              {activity.name}
            </h1>

            <p className={cn(
              "text-gray-200 mb-2 sm:mb-4 max-w-2xl line-clamp-1 sm:line-clamp-2",
              compact ? "text-xs" : "text-sm sm:text-base"
            )}>
              {activity.description || 'Experience an amazing adventure with your group.'}
            </p>

            {/* Info Pills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <div className={cn("flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20", pillSize)}>
                <Clock className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                <span className="text-white font-medium">{durationText}</span>
              </div>
              <div className={cn("flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20", pillSize)}>
                <Users className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                <span className="text-white font-medium">{players}</span>
              </div>
              <div className={cn("flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20", pillSize)}>
                <Award className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
                <span className="text-white font-medium">{activity.difficulty || 'Medium'}</span>
              </div>
              {!compact && (
                <div className={cn("flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/20", pillSize)}>
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-white font-medium">{location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Calendar and Time Selection - Left Side */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Calendar */}
            <Card className={cn(
              "p-4 sm:p-6 rounded-2xl shadow-sm border",
              isDark ? "bg-[#1a1a1a] border-[#2a2a2a]" : "bg-white border-gray-200"
            )}>
              <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
                <h2 className={cn(
                  "text-lg sm:text-xl font-semibold",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  Select Date
                </h2>
                <div className="flex items-center gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-9 w-9 sm:h-10 sm:w-10 rounded-lg",
                      isDark ? "border-[#3a3a3a] hover:bg-[#2a2a2a]" : "border-gray-300 hover:bg-gray-50"
                    )}
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className={cn(
                    "text-sm sm:text-base px-2 whitespace-nowrap min-w-[120px] sm:min-w-[140px] text-center font-medium",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-9 w-9 sm:h-10 sm:w-10 rounded-lg",
                      isDark ? "border-[#3a3a3a] hover:bg-[#2a2a2a]" : "border-gray-300 hover:bg-gray-50"
                    )}
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                {/* Day Headers */}
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className={cn(
                    "text-center text-xs sm:text-sm py-2 font-medium",
                    isDark ? "text-gray-400" : "text-gray-600"
                  )}>
                    {day}
                  </div>
                ))}
                
                {/* Empty cells */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                
                {/* Days - Color coded by availability */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDate === day;
                  const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const isCurrentDay = new Date().toDateString() === dateObj.toDateString();
                  const { status, canBook } = getDayInfo(day);

                  // Status-based styling
                  const statusStyles = {
                    available: isDark 
                      ? 'bg-green-900/30 text-green-300 border-green-800 hover:bg-green-900/50' 
                      : 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100',
                    special: isDark 
                      ? 'bg-blue-900/30 text-blue-300 border-blue-800 hover:bg-blue-900/50' 
                      : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
                    blocked: isDark 
                      ? 'bg-red-900/30 text-red-400 border-red-800 cursor-not-allowed' 
                      : 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed',
                    unavailable: isDark 
                      ? 'bg-gray-800/30 text-gray-500 border-gray-700 cursor-not-allowed' 
                      : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed',
                    past: isDark 
                      ? 'bg-gray-800/50 text-gray-600 border-gray-700 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed',
                  };

                  return (
                    <button
                      key={day}
                      onClick={() => canBook && setSelectedDate(day)}
                      disabled={!canBook}
                      className={cn(
                        "aspect-square rounded-xl text-sm sm:text-base transition-all flex items-center justify-center font-medium border",
                        isSelected 
                          ? "ring-2 ring-offset-1 shadow-lg scale-105" 
                          : statusStyles[status],
                        isCurrentDay && !isSelected && "ring-1 ring-offset-1"
                      )}
                      style={{
                        backgroundColor: isSelected ? primaryColor : undefined,
                        color: isSelected ? 'white' : undefined,
                        borderColor: isSelected ? primaryColor : undefined,
                        // @ts-ignore - Tailwind ring color
                        '--tw-ring-color': isCurrentDay ? primaryColor : undefined,
                      } as React.CSSProperties}
                      title={status === 'blocked' ? 'Blocked' : status === 'unavailable' ? 'Not operating' : status === 'special' ? 'Special hours' : undefined}
                    >
                      {day}
                      {/* Availability indicator dot */}
                      {canBook && !isSelected && (
                        <span 
                          className="absolute bottom-1 w-1 h-1 rounded-full"
                          style={{ backgroundColor: status === 'special' ? '#3b82f6' : '#22c55e' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Time Slots */}
            {selectedDate && (
              <Card className={cn(
                "p-4 sm:p-6 rounded-2xl shadow-sm border",
                isDark ? "bg-[#1a1a1a] border-[#2a2a2a]" : "bg-white border-gray-200"
              )}>
                <h2 className={cn(
                  "text-lg sm:text-xl font-semibold mb-4 sm:mb-6",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  Available Times - {currentDate.toLocaleString('default', { month: 'short' })} {selectedDate}
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && setSelectedTime(slot.time)}
                      disabled={!slot.available}
                      className={cn(
                        "p-3 sm:p-4 rounded-xl border-2 text-center transition-all",
                        selectedTime === slot.time && "shadow-lg transform scale-105",
                        slot.available && selectedTime !== slot.time && (isDark
                          ? "border-[#2a2a2a] hover:border-[#3a3a3a] hover:shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md"),
                        !slot.available && "opacity-50 cursor-not-allowed"
                      )}
                      style={{
                        backgroundColor: selectedTime === slot.time ? primaryColor : undefined,
                        borderColor: selectedTime === slot.time ? primaryColor : undefined,
                      }}
                    >
                      <div className={cn(
                        "text-sm sm:text-base font-medium mb-1",
                        selectedTime === slot.time ? "text-white" : (isDark ? "text-gray-200" : "text-gray-900"),
                        !slot.available && "text-gray-400"
                      )}>
                        {slot.display}
                      </div>
                      <div className={cn(
                        "text-xs",
                        selectedTime === slot.time ? "text-blue-100" : (isDark ? "text-gray-500" : "text-gray-500")
                      )}>
                        {slot.available ? `${slot.spots} spots left` : 'Sold Out'}
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Booking Summary - Right Side */}
          <div className="lg:col-span-1">
            <Card className={cn(
              "p-4 sm:p-6 rounded-2xl shadow-sm border sticky top-4",
              isDark ? "bg-[#1a1a1a] border-[#2a2a2a]" : "bg-white border-gray-200"
            )}>
              <h3 className={cn(
                "text-lg font-semibold mb-4 flex items-center gap-2",
                isDark ? "text-white" : "text-gray-900"
              )}>
                <CreditCard className="w-5 h-5" style={{ color: primaryColor }} />
                Your Booking
              </h3>

              {/* Party Size */}
              <div className="mb-6">
                <label className={cn(
                  "text-sm mb-3 flex items-center gap-2 font-medium",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  <Users className="w-4 h-4" /> Number of Guests
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setPartySize(Math.max(activity.min_players || 1, partySize - 1))}
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-colors",
                      isDark ? "border-[#3a3a3a] hover:border-[#4a4a4a]" : "border-gray-300 hover:border-gray-400"
                    )}
                    style={{ borderColor: primaryColor }}
                  >
                    <Minus className="w-4 h-4" style={{ color: primaryColor }} />
                  </button>
                  <div className="text-center">
                    <span className={cn(
                      "text-2xl sm:text-3xl font-bold",
                      isDark ? "text-white" : "text-gray-900"
                    )}>
                      {partySize}
                    </span>
                    <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>
                      guests
                    </p>
                  </div>
                  <button
                    onClick={() => setPartySize(Math.min(activity.max_players || 12, partySize + 1))}
                    className={cn(
                      "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-colors",
                      isDark ? "border-[#3a3a3a] hover:border-[#4a4a4a]" : "border-gray-300 hover:border-gray-400"
                    )}
                    style={{ borderColor: primaryColor }}
                  >
                    <Plus className="w-4 h-4" style={{ color: primaryColor }} />
                  </button>
                </div>
              </div>

              {/* Booking Details */}
              <div className={cn(
                "space-y-3 text-sm mb-6 p-4 rounded-xl",
                isDark ? "bg-[#0a0a0a]" : "bg-gray-50"
              )}>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Activity</span>
                  <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                    {activity.name}
                  </span>
                </div>
                {selectedDate && (
                  <div className="flex justify-between">
                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>Date</span>
                    <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                      {currentDate.toLocaleString('default', { month: 'short' })} {selectedDate}
                    </span>
                  </div>
                )}
                {selectedTime && (
                  <div className="flex justify-between">
                    <span className={isDark ? "text-gray-400" : "text-gray-600"}>Time</span>
                    <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                      {timeSlots.find(s => s.time === selectedTime)?.display}
                    </span>
                  </div>
                )}
              </div>

              {/* Pricing */}
              <div className={cn(
                "rounded-xl p-4 mb-6",
                isDark ? "bg-[#0a0a0a]" : "bg-gray-50"
              )}>
                <div className="flex justify-between text-sm mb-2">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                    ${activity.price} × {partySize} guests
                  </span>
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    ${subtotal}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Tax</span>
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>${tax}</span>
                </div>
                <div className={cn(
                  "flex justify-between items-center pt-3 border-t",
                  isDark ? "border-[#2a2a2a]" : "border-gray-200"
                )}>
                  <span className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                    Total
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-bold" style={{ color: primaryColor }}>
                      ${total}
                    </span>
                    <span className={cn("text-xs ml-1", isDark ? "text-gray-500" : "text-gray-400")}>
                      USD
                    </span>
                  </div>
                </div>
              </div>

              {/* Book Now Button */}
              <Button 
                className="w-full mb-4 h-12 text-base font-semibold rounded-xl text-white"
                style={{ backgroundColor: primaryColor }}
                disabled={!selectedDate || !selectedTime}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {selectedDate && selectedTime ? `Book Now - $${total}` : 'Select Date & Time'}
              </Button>

              {/* Security Badge */}
              <div className={cn(
                "flex items-center justify-center gap-2 text-xs",
                isDark ? "text-gray-500" : "text-gray-400"
              )}>
                <Shield className="w-3.5 h-3.5" />
                Secure checkout powered by Stripe
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Mode Banner */}
      <div className={cn(
        "text-center py-3 text-xs font-medium border-t",
        isDark ? "bg-amber-900/20 text-amber-400 border-amber-800/30" : "bg-amber-50 text-amber-600 border-amber-200"
      )}>
        ⚠️ PREVIEW MODE - This is how your widget will appear to customers
      </div>
    </div>
  );
}

export default ActivityPreviewCard;
