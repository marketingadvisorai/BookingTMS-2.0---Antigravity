/**
 * Step 3: Party Details Component
 * 
 * Third step - user enters party size and customer information.
 * 
 * UX Features:
 * - Visual player count selector with +/- buttons
 * - Real-time price calculation
 * - Form validation with inline errors
 * - Auto-format phone numbers
 * - Mobile-optimized form layout
 * - Progress saves as user types
 * 
 * @module components/booking/steps
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, User, Mail, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import type { PartyDetailsStepProps, CustomerInfoErrors } from '../types';

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email';
  return undefined;
}

function validateName(name: string): string | undefined {
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return undefined;
}

function validatePhone(phone: string): string | undefined {
  if (!phone.trim()) return 'Phone number is required';
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 10) return 'Please enter a valid phone number';
  return undefined;
}

/**
 * Format phone number as user types
 */
function formatPhoneNumber(value: string): string {
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length <= 3) return digitsOnly;
  if (digitsOnly.length <= 6) return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
  return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, 10)}`;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function Step3_PartyDetails({
  bookingState,
  onNext,
  onBack,
  onUpdate,
  minPlayers,
  maxPlayers,
  basePrice,
}: PartyDetailsStepProps) {
  const { partySize, customerInfo } = bookingState;
  const [errors, setErrors] = useState<CustomerInfoErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Calculate total price
  const totalPrice = basePrice * partySize;
  
  // Handle party size change
  const handlePartySizeChange = (newSize: number) => {
    if (newSize >= minPlayers && newSize <= maxPlayers) {
      onUpdate({ type: 'SET_PARTY_SIZE', payload: newSize });
    }
  };
  
  // Handle customer info change
  const handleCustomerInfoChange = (field: string, value: string) => {
    onUpdate({
      type: 'UPDATE_CUSTOMER_INFO',
      payload: { [field]: value },
    });
  };
  
  // Handle field blur (for validation)
  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    validateField(field);
  };
  
  // Validate single field
  const validateField = (field: string) => {
    let error: string | undefined;
    
    switch (field) {
      case 'name':
        error = validateName(customerInfo.name);
        break;
      case 'email':
        error = validateEmail(customerInfo.email);
        break;
      case 'phone':
        error = validatePhone(customerInfo.phone);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };
  
  // Validate all fields
  const validateAll = (): boolean => {
    const nameError = validateName(customerInfo.name);
    const emailError = validateEmail(customerInfo.email);
    const phoneError = validatePhone(customerInfo.phone);
    
    setErrors({
      name: nameError,
      email: emailError,
      phone: phoneError,
    });
    
    setTouched({
      name: true,
      email: true,
      phone: true,
    });
    
    return !nameError && !emailError && !phoneError;
  };
  
  // Handle continue
  const handleContinue = () => {
    if (validateAll()) {
      onNext();
    }
  };
  
  // Auto-format phone on change
  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleCustomerInfoChange('phone', formatted);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Party Details
        </h2>
        <p className="text-gray-600">
          How many players and who's booking?
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Party Size */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Number of Players
              </h3>
              
              {/* Party Size Selector */}
              <div className="flex items-center justify-center gap-4 py-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handlePartySizeChange(partySize - 1)}
                  disabled={partySize <= minPlayers}
                  className="h-14 w-14 rounded-full"
                >
                  <Minus className="w-6 h-6" />
                </Button>
                
                <motion.div
                  key={partySize}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className="text-5xl font-bold text-primary">
                    {partySize}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {partySize === 1 ? 'player' : 'players'}
                  </div>
                </motion.div>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handlePartySizeChange(partySize + 1)}
                  disabled={partySize >= maxPlayers}
                  className="h-14 w-14 rounded-full"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </div>
              
              {/* Player Range Info */}
              <div className="text-center text-sm text-gray-600">
                This game requires {minPlayers}-{maxPlayers} players
              </div>
            </div>
            
            {/* Price Display */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-600">Price per player</span>
                <span className="font-medium">${basePrice}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-gray-600">Number of players</span>
                <span className="font-medium">× {partySize}</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold pt-4 border-t">
                <span>Total</span>
                <span className="text-primary">${totalPrice}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Right: Customer Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-4">
              Your Information
            </h3>
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
              {/* Name */}
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={customerInfo.name}
                  onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  className={touched.name && errors.name ? 'border-red-500' : ''}
                />
                {touched.name && errors.name && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 text-red-600 text-sm mt-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </motion.div>
                )}
              </div>
              
              {/* Email */}
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={touched.email && errors.email ? 'border-red-500' : ''}
                />
                {touched.email && errors.email && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 text-red-600 text-sm mt-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </motion.div>
                )}
              </div>
              
              {/* Phone */}
              <div>
                <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={customerInfo.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  className={touched.phone && errors.phone ? 'border-red-500' : ''}
                />
                {touched.phone && errors.phone && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 text-red-600 text-sm mt-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone}
                  </motion.div>
                )}
              </div>
              
              {/* Special Requests (Optional) */}
              <div>
                <Label htmlFor="requests" className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Special Requests (Optional)
                </Label>
                <Textarea
                  id="requests"
                  placeholder="Any special requirements or questions?"
                  value={customerInfo.specialRequests || ''}
                  onChange={(e) => handleCustomerInfoChange('specialRequests', e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Let us know about accessibility needs, celebrations, etc.
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
        >
          Back
        </Button>
        
        <Button
          size="lg"
          onClick={handleContinue}
          className="min-w-[200px]"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  );
}
