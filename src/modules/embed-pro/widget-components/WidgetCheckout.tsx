/**
 * Embed Pro 2.0 - Widget Checkout Component
 * @module embed-pro/widget-components/WidgetCheckout
 * 
 * Customer information form for checkout.
 * Mobile-first with responsive tablet/desktop enhancements.
 */

import React, { useState } from 'react';
import { User, Mail, Phone, MessageSquare, Loader2, ShieldCheck } from 'lucide-react';
import type { CustomerInfo, WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetCheckoutProps {
  onSubmit: (customerInfo: CustomerInfo) => Promise<void>;
  onBack: () => void;
  style: WidgetStyle;
  isLoading?: boolean;
  buttonText?: string;
  isDarkMode?: boolean;
}

// =====================================================
// COMPONENT
// =====================================================

export const WidgetCheckout: React.FC<WidgetCheckoutProps> = ({
  onSubmit,
  onBack,
  style,
  isLoading = false,
  buttonText = 'Continue to Payment',
  isDarkMode = false,
}) => {
  // Detect dark mode from theme or style
  const dark = isDarkMode || style.theme === 'dark';
  const [formData, setFormData] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerInfo, string>>>({});

  // Validate form
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerInfo, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onSubmit(formData);
    }
  };

  // Handle input change
  const handleChange = (field: keyof CustomerInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-5">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-4 md:mb-5">
        <div 
          className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${style.primaryColor}${dark ? '30' : '15'}` }}
        >
          <User className="w-4 h-4 md:w-5 md:h-5" style={{ color: style.primaryColor }} />
        </div>
        <div>
          <h3 className={`font-semibold text-sm sm:text-base md:text-lg ${dark ? 'text-gray-100' : 'text-gray-800'}`}>
            Your Information
          </h3>
          <p className={`text-[10px] sm:text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
            We'll send your confirmation here
          </p>
        </div>
      </div>

      <div className="space-y-3 md:space-y-4">
        {/* Name Row - Stack on mobile, row on tablet+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* First Name */}
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${dark ? 'text-white' : 'text-gray-700'}`}>
              First Name *
            </label>
            <div className="relative group">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors
                ${dark ? 'text-gray-500 group-focus-within:text-gray-300' : 'text-gray-400 group-focus-within:text-gray-600'}`} />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 md:py-3 border rounded-xl text-sm md:text-base
                  ${errors.firstName 
                    ? dark ? 'border-red-400 bg-red-500/10' : 'border-red-500 bg-red-50/50' 
                    : dark ? 'border-white/20 bg-white/5 text-white' : 'border-gray-200 bg-white/80 text-gray-900'}
                  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent
                  ${dark ? 'hover:border-white/30 placeholder-gray-500' : 'hover:border-gray-300 placeholder-gray-400'}
                  transition-all duration-150`}
                style={{ ['--tw-ring-color' as any]: style.primaryColor }}
                placeholder="John"
                aria-label="First name"
                aria-invalid={!!errors.firstName}
              />
            </div>
            {errors.firstName && (
              <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                {errors.firstName}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${dark ? 'text-white' : 'text-gray-700'}`}>
              Last Name *
            </label>
            <div className="relative group">
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className={`w-full px-3 py-2.5 md:py-3 border rounded-xl text-sm md:text-base
                  ${errors.lastName 
                    ? dark ? 'border-red-400 bg-red-500/10' : 'border-red-500 bg-red-50/50' 
                    : dark ? 'border-white/20 bg-white/5 text-white' : 'border-gray-200 bg-white/80 text-gray-900'}
                  focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent
                  ${dark ? 'hover:border-white/30 placeholder-gray-500' : 'hover:border-gray-300 placeholder-gray-400'}
                  transition-all duration-150`}
                style={{ ['--tw-ring-color' as any]: style.primaryColor }}
                placeholder="Doe"
                aria-label="Last name"
                aria-invalid={!!errors.lastName}
              />
            </div>
            {errors.lastName && (
              <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${dark ? 'text-white' : 'text-gray-700'}`}>
            Email *
          </label>
          <div className="relative group">
            <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors
              ${dark ? 'text-gray-500 group-focus-within:text-gray-300' : 'text-gray-400 group-focus-within:text-gray-600'}`} />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full pl-10 pr-3 py-2.5 md:py-3 border rounded-xl text-sm md:text-base
                ${errors.email 
                  ? dark ? 'border-red-400 bg-red-500/10' : 'border-red-500 bg-red-50/50' 
                  : dark ? 'border-white/20 bg-white/5 text-white' : 'border-gray-200 bg-white/80 text-gray-900'}
                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent
                ${dark ? 'hover:border-gray-500 placeholder-gray-500' : 'hover:border-gray-300 placeholder-gray-400'}
                transition-all duration-150`}
              style={{ ['--tw-ring-color' as any]: style.primaryColor }}
              placeholder="john@example.com"
              aria-label="Email address"
              aria-invalid={!!errors.email}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${dark ? 'text-white' : 'text-gray-700'}`}>
            Phone *
          </label>
          <div className="relative group">
            <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors
              ${dark ? 'text-gray-500 group-focus-within:text-gray-300' : 'text-gray-400 group-focus-within:text-gray-600'}`} />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full pl-10 pr-3 py-2.5 md:py-3 border rounded-xl text-sm md:text-base
                ${errors.phone 
                  ? dark ? 'border-red-400 bg-red-500/10' : 'border-red-500 bg-red-50/50' 
                  : dark ? 'border-white/20 bg-white/5 text-white' : 'border-gray-200 bg-white/80 text-gray-900'}
                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent
                ${dark ? 'hover:border-gray-500 placeholder-gray-500' : 'hover:border-gray-300 placeholder-gray-400'}
                transition-all duration-150`}
              style={{ ['--tw-ring-color' as any]: style.primaryColor }}
              placeholder="(555) 123-4567"
              aria-label="Phone number"
              aria-invalid={!!errors.phone}
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
              {errors.phone}
            </p>
          )}
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className={`block text-xs sm:text-sm font-medium mb-1.5 ${dark ? 'text-white' : 'text-gray-700'}`}>
            Special Requests <span className={`font-normal ${dark ? 'text-gray-500' : 'text-gray-400'}`}>(Optional)</span>
          </label>
          <div className="relative group">
            <MessageSquare className={`absolute left-3 top-3 w-4 h-4 transition-colors
              ${dark ? 'text-gray-500 group-focus-within:text-gray-300' : 'text-gray-400 group-focus-within:text-gray-600'}`} />
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              className={`w-full pl-10 pr-3 py-2.5 md:py-3 border rounded-xl text-sm md:text-base
                ${dark ? 'border-white/20 bg-white/5 text-white placeholder-gray-500' : 'border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400'}
                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:border-transparent
                ${dark ? 'hover:border-gray-500' : 'hover:border-gray-300'}
                transition-all duration-150 resize-none`}
              style={{ ['--tw-ring-color' as any]: style.primaryColor }}
              placeholder="Dietary restrictions, accessibility needs..."
              aria-label="Special requests"
            />
          </div>
        </div>
      </div>

      {/* Security Badge */}
      <div className={`flex items-center justify-center gap-1.5 mt-4 text-[10px] sm:text-xs ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Your information is encrypted and secure</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4 md:mt-5">
        <button
          type="button"
          onClick={onBack}
          className={`flex-1 min-h-[44px] md:min-h-[48px] py-3 px-4 border rounded-xl font-medium
                     active:scale-[0.98] transition-all duration-150 touch-manipulation
                     focus:outline-none focus:ring-2 focus:ring-offset-1
                     ${dark 
                       ? 'border-gray-600 text-gray-300 hover:bg-gray-700/50 focus:ring-gray-500' 
                       : 'border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-300'}`}
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-[2] min-h-[44px] md:min-h-[48px] py-3 px-4 rounded-xl font-semibold text-white
                     transition-all duration-150 flex items-center justify-center gap-2 touch-manipulation
                     hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
                     focus:outline-none focus:ring-2 focus:ring-offset-2
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ 
            backgroundColor: style.primaryColor,
            ['--tw-ring-color' as any]: style.primaryColor,
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              <span className="text-sm md:text-base">Processing...</span>
            </>
          ) : (
            <span className="text-sm md:text-base">{buttonText}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default WidgetCheckout;
