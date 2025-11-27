/**
 * Embed Pro 2.0 - Waitlist Modal Component
 * @module embed-pro/widget-components/WidgetWaitlistModal
 * 
 * Modal for joining the waitlist when a time slot is sold out.
 * Collects customer info and shows confirmation.
 */

import React, { useState } from 'react';
import { X, Bell, Check, Loader2, Users, Clock, Mail } from 'lucide-react';
import { waitlistService } from '../services/waitlist.service';
import type { WidgetStyle } from '../types/widget.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface WidgetWaitlistModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close modal handler */
  onClose: () => void;
  /** Activity ID */
  activityId: string;
  /** Session ID */
  sessionId: string;
  /** Session date (display) */
  sessionDate: string;
  /** Session time (display) */
  sessionTime: string;
  /** Party size */
  partySize: number;
  /** Widget style */
  style: WidgetStyle;
}

// =====================================================
// COMPONENT
// =====================================================

export const WidgetWaitlistModal: React.FC<WidgetWaitlistModalProps> = ({
  isOpen,
  onClose,
  activityId,
  sessionId,
  sessionDate,
  sessionTime,
  partySize,
  style,
}) => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<number | null>(null);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await waitlistService.joinWaitlist({
        activityId,
        sessionId,
        sessionDate,
        sessionTime,
        customer: { name, email, phone: phone || undefined },
        partySize,
      });

      if (result.success) {
        setIsSuccess(true);
        setPosition(result.position || null);
      } else {
        setError(result.error || 'Failed to join waitlist');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset and close
  const handleClose = () => {
    setName('');
    setEmail('');
    setPhone('');
    setIsSuccess(false);
    setError(null);
    setPosition(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="waitlist-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div 
          className="px-6 py-4 border-b border-gray-100"
          style={{ backgroundColor: `${style.primaryColor}08` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${style.primaryColor}15` }}
              >
                <Bell className="w-5 h-5" style={{ color: style.primaryColor }} />
              </div>
              <div>
                <h2 id="waitlist-title" className="font-bold text-gray-800">
                  Join Waitlist
                </h2>
                <p className="text-sm text-gray-500">Get notified if a spot opens</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSuccess ? (
            /* Success State */
            <div className="text-center py-4">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: '#dcfce7' }}
              >
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                You're on the list!
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                We'll email you at <strong>{email}</strong> if a spot opens up.
              </p>
              
              {position && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-sm">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">
                    Position <strong>#{position}</strong> in queue
                  </span>
                </div>
              )}

              <button
                onClick={handleClose}
                className="w-full mt-6 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg"
                style={{ backgroundColor: style.primaryColor }}
              >
                Done
              </button>
            </div>
          ) : (
            /* Form State */
            <>
              {/* Session Info */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 mb-4">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800">{sessionTime}</p>
                  <p className="text-sm text-gray-500">{sessionDate}</p>
                </div>
                <div className="ml-auto flex items-center gap-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  {partySize} {partySize === 1 ? 'guest' : 'guests'}
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1"
                    style={{ ['--tw-ring-color' as string]: style.primaryColor }}
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{ ['--tw-ring-color' as string]: style.primaryColor }}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-1"
                    style={{ ['--tw-ring-color' as string]: style.primaryColor }}
                    placeholder="(555) 123-4567"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm" role="alert">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !name || !email}
                  className="w-full py-3 rounded-xl font-semibold text-white transition-all 
                           hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                  style={{ backgroundColor: style.primaryColor }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <Bell className="w-5 h-5" />
                      Join Waitlist
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  We'll only contact you about this waitlist
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetWaitlistModal;
