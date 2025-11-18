/**
 * Booking Confirmation Component
 * 
 * Success page shown after booking is complete.
 * Shows confirmation code, booking details, and next steps.
 * 
 * @module components/booking/steps
 */

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  CheckCircle, 
  Calendar, 
  Clock, 
  Users, 
  Mail, 
  Phone,
  MapPin,
  Download,
  Share2,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { BookingState } from '../types';

// =============================================================================
// TYPES
// =============================================================================

interface BookingConfirmationProps {
  bookingState: BookingState;
  confirmationCode: string;
  bookingId: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function BookingConfirmation({
  bookingState,
  confirmationCode,
  bookingId,
}: BookingConfirmationProps) {
  const {
    selectedGame,
    selectedDate,
    selectedTimeSlot,
    partySize,
    customerInfo,
    finalAmount,
  } = bookingState;
  
  if (!selectedGame || !selectedDate || !selectedTimeSlot) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-lg text-gray-600">
          Your escape room adventure is booked
        </p>
      </motion.div>
      
      {/* Confirmation Code */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-2 border-primary">
          <CardContent className="p-6 text-center">
            <div className="text-sm text-gray-600 mb-2">Confirmation Code</div>
            <div className="text-4xl font-bold text-primary tracking-wider font-mono">
              {confirmationCode}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Save this code - you'll need it at the venue
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Booking Details */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Left Column */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Booking Details</h3>
            
            {/* Game */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Escape Room</div>
              <div className="font-medium text-gray-900">{selectedGame.name}</div>
              <div className="text-sm text-gray-600">{selectedGame.duration_minutes} minutes</div>
            </div>
            
            <Separator />
            
            {/* Date & Time */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="font-medium">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Time</div>
                  <div className="font-medium">
                    {selectedTimeSlot.time} - {selectedTimeSlot.endTime}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Party Size</div>
                  <div className="font-medium">
                    {partySize} {partySize === 1 ? 'player' : 'players'}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Right Column */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="text-sm">{customerInfo.email}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="text-sm">{customerInfo.phone}</div>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Payment */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Amount Paid</div>
              <div className="text-2xl font-bold text-green-600">${finalAmount}</div>
              <div className="text-xs text-gray-500 mt-1">
                Payment confirmed ✓
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* What's Next */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              What's Next?
            </h3>
            
            <ol className="space-y-3 list-decimal list-inside">
              <li className="text-gray-700">
                <strong>Check your email</strong> - We've sent your confirmation and details
              </li>
              <li className="text-gray-700">
                <strong>Arrive 15 minutes early</strong> - Give yourself time to park and check in
              </li>
              <li className="text-gray-700">
                <strong>Bring your confirmation code</strong> - Show it at the venue
              </li>
              <li className="text-gray-700">
                <strong>Get ready for adventure!</strong> - Wear comfortable clothes
              </li>
            </ol>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Action Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-4 justify-center pt-4"
      >
        <Button
          size="lg"
          variant="outline"
          onClick={() => window.print()}
        >
          <Download className="w-5 h-5 mr-2" />
          Download Confirmation
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Booking Confirmation',
                text: `Booking confirmed! Code: ${confirmationCode}`,
              });
            }
          }}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>
        
        <Button
          size="lg"
          onClick={() => window.location.reload()}
        >
          <Home className="w-5 h-5 mr-2" />
          Book Another
        </Button>
      </motion.div>
      
      {/* Footer Note */}
      <div className="text-center text-sm text-gray-500 pt-4">
        <p>Questions? Contact us at support@example.com or call (555) 123-4567</p>
        <p className="mt-2">Booking ID: {bookingId}</p>
      </div>
    </div>
  );
}
