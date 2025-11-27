/**
 * BookingSuccess - Success confirmation after booking
 */
import React from 'react';
import { CheckCircle2, Calendar, Clock, Users, MapPin, Mail, Download, Share2 } from 'lucide-react';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Separator } from '../../../ui/separator';
import { BookingSuccessProps } from './types';

export function BookingSuccess({
  bookingNumber,
  gameData,
  selectedDate,
  selectedTime,
  partySize,
  customerData,
  primaryColor,
  currentDate,
  onBookAnother
}: BookingSuccessProps) {
  // Format selected date
  const formattedDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    selectedDate
  ).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Format time for display
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="p-8 sm:p-12 bg-white shadow-xl rounded-3xl text-center">
        {/* Success Icon */}
        <div 
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <CheckCircle2 className="w-12 h-12" style={{ color: primaryColor }} />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h1>
        <p className="text-gray-500 mb-6">
          Your adventure awaits. A confirmation email has been sent to {customerData.email}
        </p>

        {/* Booking Number */}
        <div 
          className="inline-block px-6 py-3 rounded-xl mb-8"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <p className="text-sm text-gray-500 mb-1">Confirmation Number</p>
          <p className="text-2xl font-mono font-bold" style={{ color: primaryColor }}>
            {bookingNumber}
          </p>
        </div>

        <Separator className="my-6" />

        {/* Booking Details */}
        <div className="text-left space-y-4 mb-8">
          <h3 className="font-semibold text-gray-900">Booking Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-900">{formatTime(selectedTime)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <Users className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Party Size</p>
                <p className="font-medium text-gray-900">{partySize} players</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{gameData.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Info */}
        <div className="text-left p-4 bg-amber-50 rounded-xl mb-8">
          <h4 className="font-medium text-amber-800 mb-2">Important Information</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Please arrive 15 minutes before your scheduled time</li>
            <li>• Bring a valid photo ID</li>
            <li>• Wear comfortable clothing and closed-toe shoes</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl"
            onClick={() => {
              // Add to calendar functionality
              const event = {
                title: `${gameData.name} Booking`,
                start: new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate),
                description: `Booking #${bookingNumber}`
              };
              console.log('Add to calendar:', event);
            }}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Add to Calendar
          </Button>
          
          <Button
            className="flex-1 h-12 rounded-xl"
            style={{ backgroundColor: primaryColor }}
            onClick={onBookAnother}
          >
            Book Another Experience
          </Button>
        </div>

        {/* Email Confirmation */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Mail className="w-4 h-4" />
          <span>Confirmation sent to {customerData.email}</span>
        </div>
      </Card>
    </div>
  );
}

export default BookingSuccess;
