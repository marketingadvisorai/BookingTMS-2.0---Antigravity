/**
 * Embed Pro 2.0 - Widget Checkout Component
 * @module embed-pro/widget-components/WidgetCheckout
 * 
 * Customer information form for checkout.
 */

import React, { useState } from 'react';
import { User, Mail, Phone, MessageSquare, Loader2 } from 'lucide-react';
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
}) => {
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
    <form onSubmit={handleSubmit} className="p-4">
      <h3 className="font-semibold text-gray-800 mb-4">Your Information</h3>

      <div className="space-y-4">
        {/* Name Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm
                  ${errors.firstName ? 'border-red-500' : 'border-gray-200'}
                  focus:outline-none focus:ring-2 focus:ring-opacity-50`}
                style={{ ['--tw-ring-color' as any]: style.primaryColor }}
                placeholder="John"
              />
            </div>
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm
                ${errors.lastName ? 'border-red-500' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              style={{ ['--tw-ring-color' as any]: style.primaryColor }}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm
                ${errors.email ? 'border-red-500' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              style={{ ['--tw-ring-color' as any]: style.primaryColor }}
              placeholder="john@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm
                ${errors.phone ? 'border-red-500' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              style={{ ['--tw-ring-color' as any]: style.primaryColor }}
              placeholder="(555) 123-4567"
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests (Optional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none"
              style={{ ['--tw-ring-color' as any]: style.primaryColor }}
              placeholder="Any special requests or notes..."
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-4 border border-gray-200 rounded-lg font-medium
                     text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 px-4 rounded-lg font-medium text-white
                     transition-colors flex items-center justify-center gap-2"
          style={{ backgroundColor: style.primaryColor }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </form>
  );
};

export default WidgetCheckout;
