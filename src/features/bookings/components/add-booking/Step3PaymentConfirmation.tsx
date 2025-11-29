/**
 * Step3PaymentConfirmation Component
 * 
 * Third step of AddBookingDialog - payment details and booking summary.
 * @module features/bookings/components/add-booking/Step3PaymentConfirmation
 */
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Separator } from '../../../../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { formatCurrency } from '../../utils';
import type { GameOption } from '../../types';

interface PaymentFormData {
  paymentMethod: string;
  paymentStatus: string;
  couponCode: string;
  discountPercentage: number;
  depositAmount: number;
}

interface BookingSummary {
  firstName: string;
  lastName: string;
  venueName: string;
  gameName: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  estimatedEndTime: string;
}

interface Step3PaymentConfirmationProps {
  formData: PaymentFormData;
  summary: BookingSummary;
  selectedGame: GameOption | undefined;
  totalAmount: number;
  onChange: (updates: Partial<PaymentFormData>) => void;
}

/**
 * Payment and confirmation step - shows summary and collects payment info.
 */
export function Step3PaymentConfirmation({
  formData,
  summary,
  selectedGame,
  totalAmount,
  onChange
}: Step3PaymentConfirmationProps) {
  const adultPrice = selectedGame?.price ?? 30;
  const childPrice = selectedGame?.childPrice ?? Math.max(adultPrice * 0.7, 0);
  const subtotal = (summary.adults * adultPrice) + (summary.children * childPrice);
  const discountAmount = (subtotal * formData.discountPercentage) / 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">3</div>
        <h3 className="text-sm sm:text-base text-gray-900 dark:text-white">Payment & Confirmation</h3>
      </div>

      {/* Booking Summary */}
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
        <h4 className="text-sm text-blue-900 dark:text-blue-300 mb-3">Booking Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Customer:</span>
            <span className="text-gray-900 dark:text-white">
              {summary.firstName && summary.lastName ? `${summary.firstName} ${summary.lastName}` : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Venue:</span>
            <span className="text-gray-900 dark:text-white">{summary.venueName || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Game:</span>
            <span className="text-gray-900 dark:text-white">{summary.gameName || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Date & Time:</span>
            <span className="text-gray-900 dark:text-white">
              {summary.date || '—'}{summary.time ? ` at ${summary.time}` : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Estimated End:</span>
            <span className="text-gray-900 dark:text-white">{summary.estimatedEndTime || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Group Size:</span>
            <span className="text-gray-900 dark:text-white">{summary.adults} adults, {summary.children} children</span>
          </div>
          <Separator className="my-2" />
          {formData.discountPercentage > 0 && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount ({formData.discountPercentage}%):</span>
                <span>-{formatCurrency(discountAmount)}</span>
              </div>
            </>
          )}
          <div className="flex justify-between font-semibold">
            <span className="text-gray-900 dark:text-white">Total Amount:</span>
            <span className="text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm">Payment Method</Label>
          <Select value={formData.paymentMethod} onValueChange={(value) => onChange({ paymentMethod: value })}>
            <SelectTrigger className="mt-1 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit-card">Credit Card</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="paypal">PayPal</SelectItem>
              <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm">Payment Status</Label>
          <Select value={formData.paymentStatus} onValueChange={(value) => onChange({ paymentStatus: value })}>
            <SelectTrigger className="mt-1 h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partially_paid">Partially Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Discount & Deposit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="couponCode" className="text-sm">Coupon Code (Optional)</Label>
          <Input
            id="couponCode"
            type="text"
            value={formData.couponCode}
            onChange={(e) => onChange({ couponCode: e.target.value.toUpperCase() })}
            placeholder="SAVE20"
            className="mt-1 h-11 uppercase"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter promotional code if available</p>
        </div>

        <div>
          <Label htmlFor="discountPercentage" className="text-sm">Discount Percentage</Label>
          <Input
            id="discountPercentage"
            type="number"
            min="0"
            max="100"
            step="1"
            value={formData.discountPercentage}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              onChange({ discountPercentage: Math.min(Math.max(value, 0), 100) });
            }}
            placeholder="0"
            className="mt-1 h-11"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter discount percentage (0-100%)</p>
        </div>
      </div>

      <div>
        <Label htmlFor="depositAmount" className="text-sm">Deposit Amount (Optional)</Label>
        <Input
          id="depositAmount"
          type="number"
          min="0"
          step="0.01"
          value={formData.depositAmount}
          onChange={(e) => onChange({ depositAmount: parseFloat(e.target.value) || 0 })}
          placeholder="0.00"
          className="mt-1 h-11"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave as 0 if no deposit is required</p>
      </div>
    </div>
  );
}
