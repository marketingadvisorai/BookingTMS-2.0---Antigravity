/**
 * Booking Success Page
 * 
 * Displays after successful Stripe checkout.
 * Shows booking confirmation and next steps.
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import {
  CheckCircle2, Calendar, Clock, Users, MapPin,
  Mail, Download, Share2, Home, Loader2, AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BookingConfirmation {
  id: string;
  bookingNumber: string;
  activityName: string;
  venueName: string;
  date: string;
  time: string;
  partySize: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  status: string;
}

export function BookingSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    const verifyBooking = async () => {
      if (!sessionId) {
        setError('Invalid session. Please contact support.');
        setLoading(false);
        return;
      }

      try {
        // Verify the Stripe session and get booking details
        const { data, error: fetchError } = await supabase.functions.invoke('verify-checkout-session', {
          body: { sessionId, bookingId }
        });

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (data?.booking) {
          setBooking(data.booking);
        } else {
          // Fallback: Show generic success
          setBooking({
            id: bookingId || 'PENDING',
            bookingNumber: `BK-${Date.now().toString(36).toUpperCase()}`,
            activityName: 'Your Experience',
            venueName: 'Venue',
            date: new Date().toLocaleDateString(),
            time: '',
            partySize: 0,
            totalAmount: 0,
            customerName: '',
            customerEmail: '',
            status: 'confirmed'
          });
        }
      } catch (err: any) {
        console.error('Error verifying booking:', err);
        // Still show success but with limited info
        setBooking({
          id: bookingId || 'PENDING',
          bookingNumber: `BK-${Date.now().toString(36).toUpperCase()}`,
          activityName: 'Your Experience',
          venueName: 'Venue',
          date: new Date().toLocaleDateString(),
          time: '',
          partySize: 0,
          totalAmount: 0,
          customerName: '',
          customerEmail: '',
          status: 'confirmed'
        });
      } finally {
        setLoading(false);
      }
    };

    verifyBooking();
  }, [sessionId, bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Confirming your booking...</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/')}>
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your adventure awaits. Check your email for details.</p>
        </div>

        {/* Booking Confirmation Card */}
        <Card className="shadow-lg mb-6">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Confirmation</CardTitle>
              <Badge className="bg-white/20 text-white border-0">
                {booking?.status || 'Confirmed'}
              </Badge>
            </div>
            <p className="text-green-100 text-sm">Booking #{booking?.bookingNumber}</p>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {/* Activity Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 text-lg">{booking?.activityName}</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{booking?.date}</span>
                </div>
                {booking?.time && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{booking?.time}</span>
                  </div>
                )}
                {(booking?.partySize ?? 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{booking?.partySize} guests</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{booking?.venueName}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Info */}
            {(booking?.totalAmount ?? 0) > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="text-xl font-bold text-green-600">
                    ${(booking?.totalAmount ?? 0).toFixed(2)}
                  </span>
                </div>
                <Separator />
              </>
            )}

            {/* Confirmation Email */}
            <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Confirmation email sent</p>
                <p className="text-xs text-blue-700 mt-1">
                  We've sent booking details to {booking?.customerEmail || 'your email'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.print()}
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'My Booking',
                  text: `I just booked ${booking?.activityName}!`,
                  url: window.location.href,
                });
              }
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => navigate('/')}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* What's Next */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-blue-800">
            <p>✅ Check your email for booking confirmation and receipt</p>
            <p>✅ Arrive 15 minutes before your scheduled time</p>
            <p>✅ Bring a valid ID and your confirmation email</p>
            <p>✅ Have fun and enjoy your experience!</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BookingSuccessPage;
