/**
 * VenuePreviewCard
 * 
 * A preview-only component that shows how a venue's booking widget will appear.
 * This is SEPARATE from CalendarWidget to avoid database calls and errors.
 * 
 * Design: BookFlow Widget (saved design pattern)
 * 
 * Usage:
 * - Venue Widget Settings preview
 * - Admin preview before publishing
 * 
 * Does NOT:
 * - Connect to booking services
 * - Create real bookings
 * - Make database calls
 */

import { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  Clock, Users, MapPin, Calendar, 
  ChevronLeft, ChevronRight, Plus, Minus,
  CreditCard, CheckCircle2, Shield, Building2
} from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore } from 'date-fns';
import { cn } from '../ui/utils';

// Activity data for preview
interface PreviewActivity {
  id?: string;
  name: string;
  description?: string;
  duration?: number;
  price?: number;
  min_players?: number;
  max_players?: number;
  image_url?: string;
}

interface VenuePreviewCardProps {
  venueName: string;
  venueCity?: string;
  venueState?: string;
  activities?: PreviewActivity[];
  primaryColor?: string;
  theme?: 'light' | 'dark';
}

export function VenuePreviewCard({
  venueName,
  venueCity,
  venueState,
  activities = [],
  primaryColor = '#2563eb',
  theme = 'light',
}: VenuePreviewCardProps) {
  const isDark = theme === 'dark';
  
  // Preview state
  const [selectedActivity, setSelectedActivity] = useState<PreviewActivity | null>(
    activities.length > 0 ? activities[0] : null
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(4);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentStep, setCurrentStep] = useState<'select' | 'calendar' | 'summary'>('select');

  // Mock activities if none provided
  const displayActivities = activities.length > 0 ? activities : [
    { id: '1', name: 'Sample Activity', description: 'Experience the thrill', duration: 60, price: 30, min_players: 2, max_players: 8 }
  ];

  // Mock time slots
  const mockTimeSlots = [
    '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', 
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
  ];

  // Calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Check if day is available (mock - all future dates available)
  const isDayAvailable = (date: Date) => !isBefore(date, new Date());

  // Style helpers
  const accentStyle = { backgroundColor: primaryColor };
  const accentTextStyle = { color: primaryColor };
  const accentBorderStyle = { borderColor: primaryColor };

  const totalPrice = (selectedActivity?.price || 30) * partySize;

  return (
    <div className={cn(
      "rounded-xl overflow-hidden shadow-lg max-w-4xl mx-auto",
      isDark ? "bg-gray-900" : "bg-white"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b",
        isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={accentStyle}
            >
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                {venueName}
              </h2>
              {(venueCity || venueState) && (
                <p className={cn("text-sm flex items-center gap-1", isDark ? "text-gray-400" : "text-gray-500")}>
                  <MapPin className="w-3 h-3" />
                  {venueCity}{venueCity && venueState && ', '}{venueState}
                </p>
              )}
            </div>
          </div>
          <Badge variant="secondary" className={isDark ? "bg-gray-700" : "bg-gray-100"}>
            Health & Safety
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Left: Calendar/Selection */}
        <div className={cn(
          "flex-1 p-6 border-r",
          isDark ? "border-gray-700" : "border-gray-200"
        )}>
          {currentStep === 'select' && displayActivities.length > 1 && (
            <div className="mb-6">
              <h3 className={cn("font-medium mb-3", isDark ? "text-white" : "text-gray-900")}>
                Select Experience
              </h3>
              <div className="space-y-2">
                {displayActivities.map((activity) => (
                  <button
                    key={activity.id || activity.name}
                    onClick={() => setSelectedActivity(activity)}
                    className={cn(
                      "w-full p-3 rounded-lg text-left transition-colors border",
                      selectedActivity?.id === activity.id || selectedActivity?.name === activity.name
                        ? "border-2"
                        : isDark 
                          ? "bg-gray-800 border-gray-700 hover:bg-gray-700" 
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    )}
                    style={selectedActivity?.id === activity.id || selectedActivity?.name === activity.name ? accentBorderStyle : undefined}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
                          {activity.name}
                        </p>
                        <div className={cn("flex items-center gap-3 text-sm mt-1", isDark ? "text-gray-400" : "text-gray-500")}>
                          {activity.duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {activity.duration} min
                            </span>
                          )}
                          {(activity.min_players || activity.max_players) && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" /> {activity.min_players || 1}-{activity.max_players || 8}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-semibold" style={accentTextStyle}>
                        ${activity.price || 30}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Header */}
          <h3 className={cn("font-medium mb-4", isDark ? "text-white" : "text-gray-900")}>
            Select Date
          </h3>
          
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h4 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
              {format(currentMonth, 'MMMM yyyy')}
            </h4>
            <button 
              onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className={cn(
                "text-xs font-medium py-2",
                isDark ? "text-gray-500" : "text-gray-400"
              )}>
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for start of month (adjusted for Monday start) */}
            {Array.from({ length: (calendarDays[0].getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {calendarDays.map(date => {
              const available = isDayAvailable(date);
              const selected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
              const today = isToday(date);
              
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => available && setSelectedDate(date)}
                  disabled={!available}
                  className={cn(
                    "aspect-square rounded-lg text-sm font-medium transition-all relative",
                    available 
                      ? "hover:scale-105" 
                      : "opacity-30 cursor-not-allowed",
                    selected 
                      ? "text-white" 
                      : isDark 
                        ? "text-gray-300 hover:bg-gray-800" 
                        : "text-gray-700 hover:bg-blue-50",
                    today && !selected && "ring-1 ring-inset",
                    !selected && available && isDark ? "bg-gray-800/50" : !selected && available ? "bg-blue-50/50" : ""
                  )}
                  style={selected ? accentStyle : today ? accentBorderStyle : undefined}
                >
                  {format(date, 'd')}
                  {available && !isBefore(date, addDays(new Date(), 1)) && (
                    <span 
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={accentStyle}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="mt-6">
              <h4 className={cn("font-medium mb-3", isDark ? "text-white" : "text-gray-900")}>
                Available Times
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {mockTimeSlots.slice(0, 6).map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm font-medium transition-colors",
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
              {selectedDate && isBefore(selectedDate, new Date()) && (
                <p className={cn("text-xs mt-2", isDark ? "text-gray-500" : "text-gray-400")}>
                  Past date
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Booking Summary */}
        <div className={cn(
          "w-full lg:w-80 p-6",
          isDark ? "bg-gray-800/50" : "bg-gray-50"
        )}>
          <Card className={cn(
            "border",
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5" style={accentTextStyle} />
                <h3 className={cn("font-semibold", isDark ? "text-white" : "text-gray-900")}>
                  Your Booking
                </h3>
              </div>

              {/* Party Size */}
              <div className="mb-4">
                <label className={cn("text-sm mb-2 flex items-center gap-2", isDark ? "text-gray-400" : "text-gray-600")}>
                  <Users className="w-4 h-4" /> Number of Participants
                </label>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <button
                    onClick={() => setPartySize(Math.max(1, partySize - 1))}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                      isDark ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"
                    )}
                    style={accentBorderStyle}
                  >
                    <Minus className="w-4 h-4" style={accentTextStyle} />
                  </button>
                  <div className="text-center">
                    <span className={cn("text-2xl font-bold", isDark ? "text-white" : "text-gray-900")}>
                      {partySize}
                    </span>
                    <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-400")}>
                      participants
                    </p>
                  </div>
                  <button
                    onClick={() => setPartySize(Math.min(12, partySize + 1))}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                      isDark ? "border-gray-600 hover:border-gray-500" : "border-gray-300 hover:border-gray-400"
                    )}
                    style={accentBorderStyle}
                  >
                    <Plus className="w-4 h-4" style={accentTextStyle} />
                  </button>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Activity Info */}
              {selectedActivity && (
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className={cn("flex items-center gap-2", isDark ? "text-gray-400" : "text-gray-600")}>
                      <Calendar className="w-4 h-4" /> Activity
                    </span>
                    <span className={isDark ? "text-white" : "text-gray-900"}>
                      {selectedActivity.name}
                    </span>
                  </div>
                  {selectedDate && (
                    <div className="flex justify-between">
                      <span className={cn("flex items-center gap-2", isDark ? "text-gray-400" : "text-gray-600")}>
                        <Calendar className="w-4 h-4" /> Date
                      </span>
                      <span className={isDark ? "text-white" : "text-gray-900"}>
                        {format(selectedDate, 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {selectedTime && (
                    <div className="flex justify-between">
                      <span className={cn("flex items-center gap-2", isDark ? "text-gray-400" : "text-gray-600")}>
                        <Clock className="w-4 h-4" /> Time
                      </span>
                      <span className={isDark ? "text-white" : "text-gray-900"}>
                        {selectedTime}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <Separator className="my-4" />

              {/* Pricing */}
              <div className={cn(
                "rounded-lg p-3 mb-4",
                isDark ? "bg-gray-900" : "bg-gray-50"
              )}>
                <div className="flex justify-between text-sm mb-2">
                  <span className={isDark ? "text-gray-400" : "text-gray-600"}>Subtotal</span>
                  <span className={isDark ? "text-gray-300" : "text-gray-700"}>
                    ${selectedActivity?.price || 30} × {partySize}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold" style={accentTextStyle}>
                      ${totalPrice}
                    </span>
                    <span className={cn("text-xs ml-1", isDark ? "text-gray-500" : "text-gray-400")}>USD</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                className="w-full mb-3" 
                size="lg"
                style={accentStyle}
                disabled={!selectedDate || !selectedTime}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {selectedDate && selectedTime ? `Book Now - $${totalPrice}` : 'Select Date & Time'}
              </Button>

              {/* See Full Details */}
              <button className={cn(
                "w-full flex items-center justify-center gap-2 py-2 text-sm",
                isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-600 hover:text-gray-700"
              )}>
                <CheckCircle2 className="w-4 h-4" />
                See Full Details
              </button>
            </CardContent>
          </Card>

          {/* Security Badge */}
          <div className={cn(
            "flex items-center justify-center gap-2 mt-4 text-xs",
            isDark ? "text-gray-500" : "text-gray-400"
          )}>
            <Shield className="w-3 h-3" />
            Secure checkout powered by Stripe
          </div>
        </div>
      </div>

      {/* Preview Badge */}
      <div className={cn(
        "text-center py-2 text-xs border-t",
        isDark ? "bg-gray-800 text-amber-400 border-gray-700" : "bg-amber-50 text-amber-600 border-amber-200"
      )}>
        ⚠️ PREVIEW MODE - This is how your widget will appear to customers
      </div>
    </div>
  );
}

export default VenuePreviewCard;
