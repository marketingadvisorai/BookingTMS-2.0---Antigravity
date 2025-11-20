import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { X, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';

export default function BookingCancelled() {
  const handleTryAgain = () => {
    window.history.back();
  };

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-orange-200 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-10 h-10 text-orange-600" />
          </div>
          <CardTitle className="text-3xl text-gray-900">
            Payment Cancelled
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Your payment was cancelled and no charges were made
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info Message */}
          <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900 mb-2">
              What happened?
            </h3>
            <p className="text-orange-800 text-sm">
              You cancelled the payment process before completing your booking. 
              Your booking was not created and no payment was processed.
            </p>
          </div>

          {/* Options */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What would you like to do?
            </h3>
            
            <div className="space-y-3">
              <Button
                onClick={handleTryAgain}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Booking Again
              </Button>

              <Button
                onClick={handleReturnHome}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Need Help?
                </p>
                <p className="text-sm text-blue-700">
                  If you experienced any issues during checkout or have questions about your booking, 
                  please contact our support team.
                </p>
                <Button
                  variant="link"
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto mt-2"
                  onClick={() => window.location.href = 'mailto:support@bookingtms.com'}
                >
                  Contact Support →
                </Button>
              </div>
            </div>
          </div>

          {/* Common Reasons */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3">Common Reasons for Cancellation</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>You clicked the back button or closed the payment window</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>You decided to review your booking details before completing payment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>You wanted to check availability for a different time slot</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400">•</span>
                <span>You encountered a technical issue during payment</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
