/**
 * AddBookingDialog Component
 * 
 * Multi-step dialog for creating new admin bookings.
 * Steps: 1) Customer Info, 2) Booking Details, 3) Payment & Confirmation
 * @module features/bookings/components/AddBookingDialog
 */
import { useState, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { Step1CustomerInfo } from './add-booking/Step1CustomerInfo';
import { Step2BookingDetails } from './add-booking/Step2BookingDetails';
import { Step3PaymentConfirmation } from './add-booking/Step3PaymentConfirmation';
import type { Booking, GameOption } from '../types';

export interface AddBookingFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  venueId: string;
  gameId: string;
  date: string;
  time: string;
  adults: number;
  children: number;
  notes: string;
  customerNotes: string;
  paymentMethod: string;
  paymentStatus: string;
  depositAmount: number;
  couponCode: string;
  discountPercentage: number;
}

export interface AddBookingSubmission extends AddBookingFormValues {
  totalAmount: number;
  endTime: string;
}

export interface AddBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (values: AddBookingSubmission) => Promise<void>;
  bookings: Booking[];
  gamesData: GameOption[];
  venues: Array<{ id: string; name: string }>;
  isSubmitting: boolean;
}

/** Default form values */
const DEFAULT_FORM: AddBookingFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  venueId: '',
  gameId: '',
  date: '',
  time: '',
  adults: 2,
  children: 0,
  notes: '',
  customerNotes: '',
  paymentMethod: 'credit-card',
  paymentStatus: 'pending',
  depositAmount: 0,
  couponCode: '',
  discountPercentage: 0,
};

/** Email validation regex */
const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** Add minutes to time string */
const addMinutesToTime = (time: string, minutes: number): string => {
  if (!time) return time;
  const [hours, mins] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(mins)) return time;
  const start = new Date();
  start.setHours(hours, mins, 0, 0);
  start.setMinutes(start.getMinutes() + minutes);
  return `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;
};

/**
 * Multi-step booking creation dialog.
 * Validates each step before proceeding to the next.
 */
export function AddBookingDialog({ 
  open, 
  onOpenChange, 
  onCreate, 
  bookings, 
  gamesData, 
  venues, 
  isSubmitting 
}: AddBookingDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AddBookingFormValues>(DEFAULT_FORM);

  // Derived values
  const selectedVenue = useMemo(() => venues.find(v => v.id === formData.venueId), [venues, formData.venueId]);
  const selectedGame = useMemo(() => gamesData.find(g => g.id === formData.gameId), [gamesData, formData.gameId]);

  const totalAmount = useMemo(() => {
    const adultPrice = selectedGame?.price ?? 30;
    const childPrice = selectedGame?.childPrice ?? Math.max(adultPrice * 0.7, 0);
    const subtotal = (formData.adults * adultPrice) + (formData.children * childPrice);
    return subtotal - (subtotal * formData.discountPercentage / 100);
  }, [formData.adults, formData.children, formData.discountPercentage, selectedGame]);

  const estimatedEndTime = useMemo(() => {
    if (!selectedGame || !formData.time) return '';
    return addMinutesToTime(formData.time, selectedGame.duration);
  }, [selectedGame, formData.time]);

  // Form update handler
  const handleFormChange = useCallback((updates: Partial<AddBookingFormValues>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Validation
  const validateStep1 = () => {
    if (!formData.firstName.trim()) { toast.error('Please enter the first name.'); return false; }
    if (!formData.lastName.trim()) { toast.error('Please enter the last name.'); return false; }
    if (!formData.email.trim() || !isEmailValid(formData.email.trim())) { 
      toast.error('Please enter a valid email address.'); 
      return false; 
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.venueId) { toast.error('Please select a venue.'); return false; }
    if (!formData.gameId) { toast.error('Please select a game.'); return false; }
    if (!formData.date) { toast.error('Please select a date.'); return false; }
    if (!formData.time) { toast.error('Please select a time.'); return false; }
    if (formData.adults < 1) { toast.error('Adults must be at least 1.'); return false; }
    if (formData.children < 0) { toast.error('Children cannot be negative.'); return false; }
    // Check if date/time is not in the past
    const [hh, mm] = formData.time.split(':').map(Number);
    const dt = new Date(formData.date);
    dt.setHours(hh || 0, mm || 0, 0, 0);
    if (dt.getTime() < Date.now()) { toast.error('Selected date/time is in the past.'); return false; }
    return true;
  };

  // Navigation
  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const handleBack = () => setStep(s => s - 1);

  // Submit
  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2()) return;
    try {
      await onCreate({
        ...formData,
        totalAmount,
        endTime: estimatedEndTime || formData.time,
      });
      // Reset on success
      onOpenChange(false);
      setStep(1);
      setFormData(DEFAULT_FORM);
    } catch {
      // Error handled by parent
    }
  };

  // Reset when dialog closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStep(1);
      setFormData(DEFAULT_FORM);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto max-lg:w-full max-lg:h-full max-lg:max-h-full max-lg:rounded-none">
        <DialogHeader>
          <DialogTitle>Add New Booking</DialogTitle>
          <DialogDescription>Create a new booking for a customer. Step {step} of 3.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 1 && (
            <Step1CustomerInfo 
              formData={formData} 
              onChange={handleFormChange} 
            />
          )}
          {step === 2 && (
            <Step2BookingDetails
              formData={formData}
              onChange={handleFormChange}
              venues={venues}
              gamesData={gamesData}
              bookings={bookings}
            />
          )}
          {step === 3 && (
            <Step3PaymentConfirmation
              formData={formData}
              onChange={handleFormChange}
              selectedGame={selectedGame}
              totalAmount={totalAmount}
              summary={{
                firstName: formData.firstName,
                lastName: formData.lastName,
                venueName: selectedVenue?.name || '',
                gameName: selectedGame?.name || '',
                date: formData.date,
                time: formData.time,
                adults: formData.adults,
                children: formData.children,
                estimatedEndTime,
              }}
            />
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="w-full sm:w-auto h-11" disabled={isSubmitting}>
              Back
            </Button>
          )}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="w-full sm:w-auto h-11 order-2 sm:order-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto h-11 order-1 sm:order-2"
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto h-11 order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />Saving...
                  </span>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
