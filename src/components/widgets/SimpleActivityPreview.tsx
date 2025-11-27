/**
 * SimpleActivityPreview - Lightweight static preview for Step 7
 * 
 * No complex calculations, no heavy state management.
 * Just a visual representation of how the widget will look.
 */
import { Calendar, Clock, Users, CreditCard, Shield } from 'lucide-react';
import { cn } from '../ui/utils';

interface SimpleActivityPreviewProps {
  activityName?: string;
  activityDescription?: string;
  price?: number;
  duration?: number;
  minPlayers?: number;
  maxPlayers?: number;
  primaryColor?: string;
  coverImage?: string;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&h=400&fit=crop';

export function SimpleActivityPreview({
  activityName = 'Your Activity',
  activityDescription = 'An exciting experience awaits!',
  price = 30,
  duration = 60,
  minPlayers = 2,
  maxPlayers = 8,
  primaryColor = '#2563eb',
  coverImage
}: SimpleActivityPreviewProps) {
  
  // Static month data for preview
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate static calendar days (just for visual display)
  const staticDays = Array.from({ length: 35 }, (_, i) => {
    const day = (i % 31) + 1;
    const isAvailable = i >= 7 && i < 28 && [1, 2, 3, 4, 5].includes((i % 7));
    return { day: day <= 31 ? day : null, isAvailable };
  });

  // Static time slots for preview
  const staticTimeSlots = ['10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'];

  return (
    <div className="w-full bg-gray-50 min-h-[600px]">
      {/* Hero Section */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={coverImage || DEFAULT_IMAGE}
          alt={activityName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="text-xl font-bold text-white truncate">{activityName}</h2>
          <p className="text-sm text-gray-200 line-clamp-1">{activityDescription}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs bg-white/20 px-2 py-1 rounded text-white flex items-center gap-1">
              <Clock className="w-3 h-3" /> {duration} min
            </span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded text-white flex items-center gap-1">
              <Users className="w-3 h-3" /> {minPlayers}-{maxPlayers}
            </span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calendar Section */}
        <div className="md:col-span-2 bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: primaryColor }} />
              Select Date
            </h3>
            <span className="text-sm text-gray-600">{currentMonth}</span>
          </div>
          
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {days.map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid - Static */}
          <div className="grid grid-cols-7 gap-1">
            {staticDays.slice(0, 35).map((item, i) => (
              <div
                key={i}
                className={cn(
                  "aspect-square flex items-center justify-center text-sm rounded-lg",
                  item.day === null && "invisible",
                  item.isAvailable 
                    ? "bg-green-50 text-green-800 border border-green-200" 
                    : "bg-gray-50 text-gray-300",
                  item.day === 15 && "ring-2 ring-offset-1 text-white"
                )}
                style={item.day === 15 ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
              >
                {item.day}
              </div>
            ))}
          </div>

          {/* Time Slots Preview */}
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Available Times</h4>
            <div className="grid grid-cols-3 gap-2">
              {staticTimeSlots.map((time, i) => (
                <div
                  key={time}
                  className={cn(
                    "text-center py-2 text-xs rounded-lg border",
                    i === 2 
                      ? "text-white border-transparent" 
                      : "bg-gray-50 text-gray-700 border-gray-200"
                  )}
                  style={i === 2 ? { backgroundColor: primaryColor } : undefined}
                >
                  {time}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Summary - Right Side */}
        <div className="bg-white rounded-xl p-4 shadow-sm border h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Activity</span>
              <span className="font-medium text-gray-900 truncate ml-2 max-w-[120px]">{activityName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-medium text-gray-900">Dec 15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time</span>
              <span className="font-medium text-gray-900">12:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guests</span>
              <span className="font-medium text-gray-900">2 adults</span>
            </div>
            
            <hr className="my-3" />
            
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">${(price * 2).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">${(price * 2 * 0.08).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span style={{ color: primaryColor }}>${(price * 2 * 1.08).toFixed(2)}</span>
            </div>
          </div>

          <button
            className="w-full mt-4 py-3 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Continue to Checkout
          </button>

          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500">
            <Shield className="w-3 h-3" />
            <span>Secure checkout with Stripe</span>
          </div>
        </div>
      </div>

      {/* Preview Banner */}
      <div className="mx-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-700 text-center">
          <strong>Preview Mode</strong> - This is how your booking widget will appear to customers
        </p>
      </div>
    </div>
  );
}

export default SimpleActivityPreview;
