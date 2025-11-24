# Venues & Games Payment Implementation Plan
## Step-by-Step Development Guide

**Version:** 1.0.0  
**Date:** November 10, 2025

---

## Implementation Roadmap

### Overview
This document provides a detailed, step-by-step plan to implement Stripe payment processing for game bookings from Venues and Games pages.

---

## Phase 1: Foundation (Days 1-3)

### Step 1.1: Create Booking Service

**File:** `src/lib/bookings/bookingService.ts`

```typescript
import { supabase } from '../supabase';
import { PaymentService } from '../payments/paymentService';

export interface CreateBookingParams {
  venueId: string;
  gameId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  partySize: number;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  totalPrice: number;
}

export class BookingService {
  /**
   * Create booking and payment intent
   */
  static async createBookingWithPayment(params: CreateBookingParams) {
    // 1. Check if customer exists
    let customer = await this.findOrCreateCustomer(params.customer);
    
    // 2. Create booking record
    const booking = await this.createBooking({
      ...params,
      customerId: customer.id,
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    // 3. Create payment intent
    const paymentIntent = await PaymentService.createPaymentIntent({
      bookingId: booking.id,
      amount: params.totalPrice,
      currency: 'usd'
    });
    
    return {
      bookingId: booking.id,
      clientSecret: paymentIntent.clientSecret,
      amount: params.totalPrice
    };
  }
  
  /**
   * Find existing customer or create new one
   */
  static async findOrCreateCustomer(customerData: any) {
    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('email', customerData.email)
      .single();
    
    if (existing) return existing;
    
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert({
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        email: customerData.email,
        phone: customerData.phone
      })
      .select()
      .single();
    
    return newCustomer;
  }
  
  /**
   * Create booking record
   */
  static async createBooking(data: any) {
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        venue_id: data.venueId,
        game_id: data.gameId,
        customer_id: data.customerId,
        booking_date: data.bookingDate,
        start_time: data.startTime,
        end_time: data.endTime,
        party_size: data.partySize,
        total_price: data.totalPrice,
        status: data.status,
        payment_status: data.paymentStatus
      })
      .select()
      .single();
    
    if (error) throw error;
    return booking;
  }
  
  /**
   * Get booking by ID
   */
  static async getBooking(bookingId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        venue:venues(*),
        game:games(*),
        customer:customers(*),
        payment:payments(*)
      `)
      .eq('id', bookingId)
      .single();
    
    if (error) throw error;
    return data;
  }
}
```

### Step 1.2: Create Price Calculator

**File:** `src/lib/bookings/priceCalculator.ts`

```typescript
export interface PriceBreakdown {
  basePrice: number;
  partySize: number;
  subtotal: number;
  tax: number;
  total: number;
}

export class PriceCalculator {
  static TAX_RATE = 0.08; // 8% tax
  
  /**
   * Calculate total price for booking
   */
  static calculate(pricePerPerson: number, partySize: number): PriceBreakdown {
    const subtotal = pricePerPerson * partySize;
    const tax = subtotal * this.TAX_RATE;
    const total = subtotal + tax;
    
    return {
      basePrice: pricePerPerson,
      partySize,
      subtotal,
      tax,
      total: Math.round(total * 100) / 100 // Round to 2 decimals
    };
  }
  
  /**
   * Format price for display
   */
  static format(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }
}
```

### Step 1.3: Create Availability Checker

**File:** `src/lib/bookings/availabilityChecker.ts`

```typescript
import { supabase } from '../supabase';

export class AvailabilityChecker {
  /**
   * Check if time slot is available
   */
  static async isSlotAvailable(
    gameId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    // Check for overlapping bookings
    const { data: overlapping } = await supabase
      .from('bookings')
      .select('id')
      .eq('game_id', gameId)
      .eq('booking_date', date)
      .or(`start_time.lte.${endTime},end_time.gte.${startTime}`)
      .neq('status', 'canceled');
    
    return !overlapping || overlapping.length === 0;
  }
  
  /**
   * Get available time slots for a game on a date
   */
  static async getAvailableSlots(
    gameId: string,
    date: string
  ): Promise<string[]> {
    // Get game details for operating hours
    const { data: game } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();
    
    if (!game) return [];
    
    // Generate time slots (simplified)
    const slots = [
      '10:00', '11:30', '13:00', '14:30',
      '16:00', '17:30', '19:00', '20:30'
    ];
    
    // Filter out booked slots
    const available = [];
    for (const slot of slots) {
      const isAvailable = await this.isSlotAvailable(
        gameId,
        date,
        slot,
        this.addDuration(slot, game.duration || 60)
      );
      if (isAvailable) available.push(slot);
    }
    
    return available;
  }
  
  /**
   * Add duration to time
   */
  private static addDuration(time: string, durationMinutes: number): string {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  }
}
```

---

## Phase 2: UI Components (Days 4-7)

### Step 2.1: Create Booking Dialog

**File:** `src/components/bookings/BookingDialog.tsx`

```typescript
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar } from '../ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { PriceCalculator } from '../../lib/bookings/priceCalculator';
import { AvailabilityChecker } from '../../lib/bookings/availabilityChecker';
import { BookingService } from '../../lib/bookings/bookingService';
import { PaymentCheckout } from './PaymentCheckout';
import { toast } from 'sonner';

interface BookingDialogProps {
  game: any;
  venue: any;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingDialog({ game, venue, isOpen, onClose }: BookingDialogProps) {
  const [step, setStep] = useState<'booking' | 'payment'>('booking');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookingData, setBookingData] = useState<any>(null);
  
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  
  // Calculate price
  const priceBreakdown = PriceCalculator.calculate(game.price || 30, partySize);
  
  // Load available slots when date changes
  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const slots = await AvailabilityChecker.getAvailableSlots(game.id, dateStr);
    setAvailableSlots(slots);
  };
  
  // Handle booking submission
  const handleProceedToPayment = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select date and time');
      return;
    }
    
    if (!customer.firstName || !customer.email) {
      toast.error('Please fill in customer details');
      return;
    }
    
    try {
      const endTime = addDuration(selectedTime, game.duration || 60);
      
      const result = await BookingService.createBookingWithPayment({
        venueId: venue.id,
        gameId: game.id,
        bookingDate: selectedDate.toISOString().split('T')[0],
        startTime: selectedTime,
        endTime: endTime,
        partySize,
        customer,
        totalPrice: priceBreakdown.total
      });
      
      setBookingData(result);
      setStep('payment');
    } catch (error) {
      toast.error('Failed to create booking');
      console.error(error);
    }
  };
  
  const addDuration = (time: string, minutes: number): string => {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  };
  
  if (step === 'payment' && bookingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <PaymentCheckout
            bookingId={bookingData.bookingId}
            amount={bookingData.amount}
            onSuccess={() => {
              toast.success('Payment successful!');
              window.location.href = `/booking-confirmation?id=${bookingData.bookingId}`;
            }}
            onCancel={() => setStep('booking')}
          />
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {game.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Game Info */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="font-semibold">{game.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{venue.name}</p>
            <p className="text-sm mt-2">{game.description}</p>
          </div>
          
          {/* Date Selection */}
          <div>
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
          
          {/* Time Selection */}
          {selectedDate && (
            <div>
              <Label>Select Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Party Size */}
          <div>
            <Label>Party Size</Label>
            <Input
              type="number"
              min={game.min_players || 1}
              max={game.max_players || 10}
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
            />
          </div>
          
          {/* Customer Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={customer.firstName}
                  onChange={(e) => setCustomer({ ...customer, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={customer.lastName}
                  onChange={(e) => setCustomer({ ...customer, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                type="tel"
                value={customer.phone}
                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              />
            </div>
          </div>
          
          {/* Price Breakdown */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Base Price ({partySize} players)</span>
              <span>{PriceCalculator.format(priceBreakdown.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>{PriceCalculator.format(priceBreakdown.tax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{PriceCalculator.format(priceBreakdown.total)}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleProceedToPayment} className="flex-1">
              Proceed to Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Step 2.2: Create Payment Checkout

**File:** `src/components/bookings/PaymentCheckout.tsx`

```typescript
import { PaymentWrapper } from '../payments/PaymentWrapper';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

interface PaymentCheckoutProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentCheckout({ bookingId, amount, onSuccess, onCancel }: PaymentCheckoutProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Complete Payment</h2>
      </div>
      
      <PaymentWrapper
        bookingId={bookingId}
        amount={amount}
        currency="USD"
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </div>
  );
}
```

---

## Phase 3: Page Integration (Days 8-10)

### Step 3.1: Update Venues Page

**Add to:** `src/pages/Venues.tsx`

```typescript
import { BookingDialog } from '../components/bookings/BookingDialog';

// Add state
const [bookingDialog, setBookingDialog] = useState({
  isOpen: false,
  game: null,
  venue: null
});

// Add button to venue card
<Button
  onClick={() => setBookingDialog({
    isOpen: true,
    game: selectedGame,
    venue: venue
  })}
>
  Book Now
</Button>

// Add dialog
<BookingDialog
  game={bookingDialog.game}
  venue={bookingDialog.venue}
  isOpen={bookingDialog.isOpen}
  onClose={() => setBookingDialog({ isOpen: false, game: null, venue: null })}
/>
```

### Step 3.2: Update Games Page

**Add to:** `src/pages/Games.tsx`

```typescript
import { BookingDialog } from '../components/bookings/BookingDialog';

// Add state
const [bookingDialog, setBookingDialog] = useState({
  isOpen: false,
  game: null,
  venue: null
});

// Add button to game card
<Button
  onClick={() => {
    const venue = findVenue(game.venue_id);
    setBookingDialog({
      isOpen: true,
      game: game,
      venue: venue
    });
  }}
>
  Book This Game
</Button>

// Add dialog
<BookingDialog
  game={bookingDialog.game}
  venue={bookingDialog.venue}
  isOpen={bookingDialog.isOpen}
  onClose={() => setBookingDialog({ isOpen: false, game: null, venue: null })}
/>
```

---

## Testing Checklist

- [ ] Booking dialog opens correctly
- [ ] Date picker works
- [ ] Time slots load based on availability
- [ ] Party size validation works
- [ ] Customer form validation works
- [ ] Price calculation is correct
- [ ] Payment intent creates successfully
- [ ] Stripe payment form displays
- [ ] Payment processes successfully
- [ ] Booking status updates
- [ ] Email sends with QR code
- [ ] Confirmation page displays

---

**Status:** Implementation Plan Complete  
**Next:** Begin Phase 1 Development  
**Estimated Time:** 10 days
