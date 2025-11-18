/**
 * Booking Widget Preview Page
 * 
 * Test page for the new simplified booking widget.
 * Shows the widget in action with mock data.
 * 
 * @module pages
 */

import { EscapeRoomBookingWidget } from '@/components/booking/EscapeRoomBookingWidget';

export default function BookingWidgetPreview() {
  // Mock organization ID (replace with real one from your database)
  const organizationId = '00000000-0000-0000-0000-000000000000';
  
  const handleBookingComplete = (bookingId: string) => {
    console.log('Booking completed:', bookingId);
    alert(`Booking completed! ID: ${bookingId}`);
  };
  
  const handleBookingError = (error: Error) => {
    console.error('Booking error:', error);
    alert(`Booking error: ${error.message}`);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            🎯 Booking Widget Preview
          </h1>
          <p className="text-gray-600 mt-2">
            Testing the new simplified escape room booking flow
          </p>
        </div>
      </div>
      
      {/* Widget */}
      <EscapeRoomBookingWidget
        organizationId={organizationId}
        onBookingComplete={handleBookingComplete}
        onBookingError={handleBookingError}
        primaryColor="#2563eb"
      />
      
      {/* Footer */}
      <div className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>MVP Development - Task 01: Booking Widget Simplification</p>
          <p className="mt-1">Branch: feature/mvp-01-booking-widget-simplification</p>
        </div>
      </div>
    </div>
  );
}
