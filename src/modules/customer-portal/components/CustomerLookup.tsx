/**
 * CustomerLookup Component
 * Login/lookup form for customer portal
 */

import React, { useState } from 'react';
import { Mail, Phone, Hash, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CustomerLookupMethod } from '../types';

interface CustomerLookupProps {
  onLookup: (method: CustomerLookupMethod, value: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
}

const lookupMethods = [
  { id: 'email' as const, label: 'Email Address', icon: Mail, placeholder: 'your@email.com' },
  { id: 'booking_reference' as const, label: 'Booking Reference', icon: Hash, placeholder: 'BK-XXXXXX-XXXX' },
  { id: 'phone' as const, label: 'Phone Number', icon: Phone, placeholder: '+1 (555) 000-0000' },
];

export function CustomerLookup({ onLookup, isLoading, error }: CustomerLookupProps) {
  const [method, setMethod] = useState<CustomerLookupMethod>('email');
  const [value, setValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const selectedMethod = lookupMethods.find((m) => m.id === method)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!value.trim()) {
      setLocalError('Please enter a value');
      return;
    }

    // Basic validation
    if (method === 'email' && !value.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }

    const result = await onLookup(method, value);
    if (!result.success) {
      setLocalError(result.error || 'Lookup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Manage Your Bookings
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View, modify, or cancel your upcoming reservations
          </p>
        </div>

        {/* Lookup Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
          {/* Method Selector */}
          <div className="flex gap-2 mb-6">
            {lookupMethods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMethod(m.id);
                  setValue('');
                  setLocalError(null);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  method === m.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <m.icon className="w-4 h-4 mx-auto mb-1" />
                <span className="hidden sm:block">{m.id === 'booking_reference' ? 'Ref #' : m.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Lookup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {selectedMethod.label}
              </label>
              <div className="relative">
                <selectedMethod.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={method === 'email' ? 'email' : 'text'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={selectedMethod.placeholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Display */}
            {(error || localError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              >
                <p className="text-sm text-red-600 dark:text-red-400">{error || localError}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !value.trim()}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 text-white font-medium flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Looking up...
                </>
              ) : (
                <>
                  Find My Bookings
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Help Text */}
          <p className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400">
            Enter your details to access your booking history
          </p>
        </div>
      </motion.div>
    </div>
  );
}
