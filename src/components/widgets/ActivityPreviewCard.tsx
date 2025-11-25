/**
 * ActivityPreviewCard
 * 
 * A preview-only component that shows how an activity will appear to customers.
 * This is SEPARATE from CalendarSingleEventBookingPage to avoid any risk of
 * accidentally creating real bookings.
 * 
 * Usage:
 * - Activity Wizard Step 7 (Widget & Embed)
 * - Admin preview before publishing
 * - Marketing material generation
 * 
 * Does NOT:
 * - Connect to booking services
 * - Create real bookings
 * - Process payments
 * - Update session capacity
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Clock, Users, MapPin, Calendar, Star, 
  ChevronLeft, ChevronRight, Play, Info,
  CreditCard, CheckCircle2, Shield
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore } from 'date-fns';
import { cn } from '../ui/utils';

// Activity data interface for preview
export interface ActivityPreviewData {
  id?: string;
  name: string;
  description?: string;
  duration: number;        // minutes
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
  // Schedule for preview (optional)
  schedule?: {
    operatingDays?: string[];
    startTime?: string;
    endTime?: string;
    slotInterval?: number;
  };
}

interface ActivityPreviewCardProps {
  activity: ActivityPreviewData;
  venueName?: string;
  venueCity?: string;
  venueState?: string;
  primaryColor?: string;
  theme?: 'light' | 'dark';
  showBookingFlow?: boolean;  // Show the full booking simulation
  compact?: boolean;          // Compact card view
}

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
  
  // Preview state - simulates customer journey
  const [currentView, setCurrentView] = useState<'info' | 'calendar' | 'time' | 'checkout' | 'success'>('info');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate mock time slots based on schedule
  const mockTimeSlots = useMemo(() => {
    if (!activity.schedule) {
      // Default slots
      return ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM', '7:00 PM'];
    }
    
    const { startTime = '10:00', endTime = '22:00', slotInterval = 60 } = activity.schedule;
    const slots: string[] = [];
    
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    for (let t = startMinutes; t + slotInterval <= endMinutes; t += slotInterval) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      slots.push(`${h12}:${m.toString().padStart(2, '0')} ${ampm}`);
    }
    
    return slots;
  }, [activity.schedule]);

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Check if day is available (mock)
  const isDayAvailable = (date: Date) => {
    if (isBefore(date, new Date())) return false;
    if (!activity.schedule?.operatingDays) return true;
    const dayName = format(date, 'EEEE');
    return activity.schedule.operatingDays.includes(dayName);
  };

  // Styles based on primary color
  const accentStyle = { backgroundColor: primaryColor };
  const accentTextStyle = { color: primaryColor };
  const accentBorderStyle = { borderColor: primaryColor };

  // Compact view - just the card
  if (compact) {
    return (
      <Card className={cn(
        "overflow-hidden transition-all hover:shadow-lg cursor-pointer",
        isDark ? "bg-gray-800 border-gray-700" : "bg-white"
      )}>
        <div className="relative h-48">
          <ImageWithFallback
            src={activity.image_url}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
          <Badge 
            className="absolute top-3 right-3"
            style={accentStyle}
          >
            ${activity.price}/person
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className={cn(
            "font-semibold text-lg mb-1",
            isDark ? "text-white" : "text-gray-900"
          )}>
            {activity.name}
          </h3>
          <div className={cn(
            "flex items-center gap-4 text-sm",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {activity.duration} min
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {activity.min_players || 1}-{activity.max_players || 8}
            </span>
          </div>
          <Button 
            className="w-full mt-4" 
            style={accentStyle}
          >
            Book Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Full preview with booking flow simulation
  return (
    <div className={cn(
      "rounded-xl overflow-hidden shadow-lg",
      isDark ? "bg-gray-900" : "bg-white"
    )}>
      {/* Header Image */}
      <div className="relative h-64">
        <ImageWithFallback
          src={activity.image_url}
          alt={activity.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <Badge className="mb-2" variant="secondary">
            {activity.difficulty || 'All Levels'}
          </Badge>
          <h2 className="text-2xl font-bold text-white">{activity.name}</h2>
          <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
            <MapPin className="w-4 h-4" />
            {venueName}{venueCity && `, ${venueCity}`}{venueState && `, ${venueState}`}
          </div>
        </div>
        {activity.video_url && (
          <button className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
            <Play className="w-5 h-5 text-gray-900 ml-0.5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Quick Info Bar */}
        <div className={cn(
          "flex items-center justify-between p-4 rounded-lg mb-6",
          isDark ? "bg-gray-800" : "bg-gray-50"
        )}>
          <div className="text-center">
            <Clock className={cn("w-5 h-5 mx-auto mb-1", isDark ? "text-gray-400" : "text-gray-500")} />
            <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
              {activity.duration} min
            </p>
            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>Duration</p>
          </div>
          <Separator orientation="vertical" className="h-12" />
          <div className="text-center">
            <Users className={cn("w-5 h-5 mx-auto mb-1", isDark ? "text-gray-400" : "text-gray-500")} />
            <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
              {activity.min_players || 1}-{activity.max_players || 8}
            </p>
            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>Players</p>
          </div>
          <Separator orientation="vertical" className="h-12" />
          <div className="text-center">
            <Star className={cn("w-5 h-5 mx-auto mb-1", isDark ? "text-gray-400" : "text-gray-500")} />
            <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
              {activity.difficulty || 'Medium'}
            </p>
            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>Difficulty</p>
          </div>
          <Separator orientation="vertical" className="h-12" />
          <div className="text-center">
            <span className="text-2xl font-bold" style={accentTextStyle}>
              ${activity.price}
            </span>
            <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-500")}>per person</p>
          </div>
        </div>

        {/* View Tabs */}
        {showBookingFlow && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['info', 'calendar', 'time', 'checkout', 'success'] as const).map((view, index) => (
              <button
                key={view}
                onClick={() => setCurrentView(view)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  currentView === view
                    ? "text-white"
                    : isDark 
                      ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
                style={currentView === view ? accentStyle : undefined}
              >
                {index + 1}. {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* View Content */}
        {currentView === 'info' && (
          <div className="space-y-6">
            <div>
              <h3 className={cn("font-semibold mb-2", isDark ? "text-white" : "text-gray-900")}>
                About This Experience
              </h3>
              <p className={cn("text-sm leading-relaxed", isDark ? "text-gray-300" : "text-gray-600")}>
                {activity.description || 'Experience an unforgettable adventure with this exciting activity. Perfect for groups looking for a unique challenge.'}
              </p>
            </div>

            {activity.highlights && activity.highlights.length > 0 && (
              <div>
                <h3 className={cn("font-semibold mb-2", isDark ? "text-white" : "text-gray-900")}>
                  Highlights
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {activity.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" style={accentTextStyle} />
                      <span className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-600")}>
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activity.age_guideline && (
              <div className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                isDark ? "bg-gray-800" : "bg-blue-50"
              )}>
                <Info className="w-5 h-5" style={accentTextStyle} />
                <span className={cn("text-sm", isDark ? "text-gray-300" : "text-gray-700")}>
                  Age requirement: {activity.age_guideline}
                </span>
              </div>
            )}

            <Button 
              className="w-full" 
              size="lg"
              style={accentStyle}
              onClick={() => setCurrentView('calendar')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Select Date & Time
            </Button>
          </div>
        )}

        {currentView === 'calendar' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                className={cn(
                  "p-2 rounded-lg",
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <button 
                onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                className={cn(
                  "p-2 rounded-lg",
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className={cn(
                  "text-xs font-medium py-2",
                  isDark ? "text-gray-500" : "text-gray-400"
                )}>
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for start of month */}
              {Array.from({ length: calendarDays[0].getDay() }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              
              {calendarDays.map(date => {
                const available = isDayAvailable(date);
                const selected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
                
                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => available && setSelectedDate(date)}
                    disabled={!available}
                    className={cn(
                      "aspect-square rounded-lg text-sm font-medium transition-colors",
                      available 
                        ? "hover:bg-opacity-10" 
                        : "opacity-30 cursor-not-allowed",
                      selected 
                        ? "text-white" 
                        : isDark 
                          ? "text-gray-300 hover:bg-gray-800" 
                          : "text-gray-700 hover:bg-gray-100",
                      isToday(date) && !selected && "ring-1 ring-inset",
                    )}
                    style={selected ? accentStyle : isToday(date) ? accentBorderStyle : undefined}
                  >
                    {format(date, 'd')}
                  </button>
                );
              })}
            </div>

            <Button 
              className="w-full mt-4" 
              size="lg"
              style={accentStyle}
              disabled={!selectedDate}
              onClick={() => setCurrentView('time')}
            >
              {selectedDate ? `Continue - ${format(selectedDate, 'MMM d')}` : 'Select a Date'}
            </Button>
          </div>
        )}

        {currentView === 'time' && (
          <div className="space-y-4">
            <h3 className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
              Available Times for {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            
            <div className="grid grid-cols-3 gap-2">
              {mockTimeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "py-3 px-4 rounded-lg text-sm font-medium transition-colors",
                    selectedTime === time
                      ? "text-white"
                      : isDark
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                  style={selectedTime === time ? accentStyle : undefined}
                >
                  {time}
                </button>
              ))}
            </div>

            <div className="mt-4">
              <label className={cn("block text-sm font-medium mb-2", isDark ? "text-gray-300" : "text-gray-700")}>
                Party Size
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPartySize(Math.max(activity.min_players || 1, partySize - 1))}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700"
                  )}
                >
                  -
                </button>
                <span className={cn("text-lg font-semibold w-8 text-center", isDark ? "text-white" : "text-gray-900")}>
                  {partySize}
                </span>
                <button
                  onClick={() => setPartySize(Math.min(activity.max_players || 8, partySize + 1))}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700"
                  )}
                >
                  +
                </button>
              </div>
            </div>

            <Button 
              className="w-full mt-4" 
              size="lg"
              style={accentStyle}
              disabled={!selectedTime}
              onClick={() => setCurrentView('checkout')}
            >
              Continue to Checkout - ${activity.price * partySize}
            </Button>
          </div>
        )}

        {currentView === 'checkout' && (
          <div className="space-y-4">
            <div className={cn(
              "p-4 rounded-lg",
              isDark ? "bg-gray-800" : "bg-gray-50"
            )}>
              <h4 className={cn("font-medium mb-3", isDark ? "text-white" : "text-gray-900")}>
                Booking Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Activity</span>
                  <span className={isDark ? "text-white" : "text-gray-900"}>{activity.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Date</span>
                  <span className={isDark ? "text-white" : "text-gray-900"}>
                    {selectedDate && format(selectedDate, 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Time</span>
                  <span className={isDark ? "text-white" : "text-gray-900"}>{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Party Size</span>
                  <span className={isDark ? "text-white" : "text-gray-900"}>{partySize} people</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span className={isDark ? "text-white" : "text-gray-900"}>Total</span>
                  <span style={accentTextStyle}>${activity.price * partySize}</span>
                </div>
              </div>
            </div>

            <div className={cn(
              "flex items-center gap-2 p-3 rounded-lg",
              isDark ? "bg-green-900/20" : "bg-green-50"
            )}>
              <Shield className="w-4 h-4 text-green-600" />
              <span className={cn("text-sm", isDark ? "text-green-400" : "text-green-700")}>
                Secure checkout powered by Stripe
              </span>
            </div>

            <Button 
              className="w-full" 
              size="lg"
              style={accentStyle}
              onClick={() => setCurrentView('success')}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${activity.price * partySize}
            </Button>

            <p className={cn("text-xs text-center", isDark ? "text-gray-500" : "text-gray-400")}>
              This is a preview. No actual payment will be processed.
            </p>
          </div>
        )}

        {currentView === 'success' && (
          <div className="text-center py-8">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={accentStyle}
            >
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-gray-900")}>
              Booking Confirmed!
            </h3>
            <p className={cn("text-sm mb-6", isDark ? "text-gray-400" : "text-gray-600")}>
              This is a preview of what customers will see after booking.
            </p>
            <div className={cn(
              "p-4 rounded-lg text-left mb-4",
              isDark ? "bg-gray-800" : "bg-gray-50"
            )}>
              <p className="text-sm">
                <strong>Confirmation #:</strong> BTM-{Date.now().toString().slice(-6)}
              </p>
              <p className="text-sm mt-1">
                <strong>Activity:</strong> {activity.name}
              </p>
              <p className="text-sm mt-1">
                <strong>Date:</strong> {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                setCurrentView('info');
                setSelectedDate(null);
                setSelectedTime(null);
                setPartySize(2);
              }}
            >
              Start Over
            </Button>
          </div>
        )}
      </div>

      {/* Preview Badge */}
      <div className={cn(
        "text-center py-2 text-xs",
        isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-500"
      )}>
        ⚠️ PREVIEW MODE - No real bookings will be created
      </div>
    </div>
  );
}

export default ActivityPreviewCard;
