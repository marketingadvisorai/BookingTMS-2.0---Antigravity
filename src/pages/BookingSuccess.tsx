import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Check, Calendar, Mail, Download, Home, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { toast } from 'sonner';

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!sessionId) {
        toast.error('No session ID found');
        setLoading(false);
        return;
      }

      try {
        // Fetch booking by Stripe session ID
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            games (
              name,
              description,
              image_url,
              duration
            ),
            venues (
              name,
              address
            )
          `)
          .eq('stripe_session_id', sessionId)
          .single();

        if (error) throw error;

        if (data) {
          setBooking(data);
          
          // Update booking status to confirmed
          await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              confirmed_at: new Date().toISOString(),
            })
            .eq('id', data.id);
        }
      } catch (error: any) {
        console.error('Error fetching booking:', error);
        toast.error('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [sessionId]);

  const handleDownloadReceipt = () => {
    toast.success('Receipt download started');
    // Implement receipt download logic
  };

  const handleAddToCalendar = () => {
    if (!booking) return;

    const event = {
      title: `${booking.games?.name} - Booking`,
      description: booking.games?.description || '',
      start: new Date(`${booking.booking_date}T${booking.start_time}`),
      end: new Date(`${booking.booking_date}T${booking.end_time}`),
      location: booking.venues?.address || '',
    };

    // Create .ics file
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${event.start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTEND:${event.end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'booking.ics';
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Event added to calendar');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn't find your booking details. Please contact support if you need assistance.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-green-200 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl text-gray-900">
            Booking Confirmed!
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Your payment was successful and your booking is confirmed
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Booking Details */}
          <div className="bg-white rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {booking.games?.image_url && (
                  <img
                    src={booking.games.image_url}
                    alt={booking.games.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{booking.games?.name}</h4>
                  <p className="text-sm text-gray-600">{booking.venues?.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Duration: {booking.games?.duration} minutes
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.booking_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">
                    {booking.start_time} - {booking.end_time}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Party Size</p>
                  <p className="font-medium text-gray-900">{booking.party_size} people</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="font-medium text-green-600">${booking.total_price.toFixed(2)}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">Booking Reference</p>
                <p className="font-mono text-sm font-medium text-gray-900">{booking.id}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Confirmation Email Sent
                </p>
                <p className="text-sm text-blue-700">
                  We've sent a confirmation email to <strong>{booking.customer_email}</strong> with all the details.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={handleAddToCalendar}
              variant="outline"
              className="w-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
            <Button
              onClick={handleDownloadReceipt}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
          </div>

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-2">What's Next?</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Check your email for confirmation and booking details</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Arrive 10-15 minutes before your scheduled time</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Bring a valid ID and your booking reference</span>
              </li>
            </ul>
          </div>

          {/* Return Home Button */}
          <Button
            onClick={() => navigate('/')}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Return to Home
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
