/**
 * CustomerDashboard Component
 * Main dashboard view for customer bookings
 */

import React, { useState } from 'react';
import { LogOut, Calendar, Clock, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingCard } from './BookingCard';
import { BookingDetailsModal } from './BookingDetailsModal';
import type { CustomerProfile, CustomerBooking, CancelBookingResponse } from '../types';

interface CustomerDashboardProps {
  customer: CustomerProfile;
  bookings: CustomerBooking[];
  upcomingBookings: CustomerBooking[];
  pastBookings: CustomerBooking[];
  cancelledBookings: CustomerBooking[];
  isLoading: boolean;
  onLogout: () => void;
  onRefresh: () => void;
  onCancelBooking: (bookingId: string, reason?: string) => Promise<CancelBookingResponse>;
}

type TabType = 'upcoming' | 'past' | 'cancelled';

const tabs: { id: TabType; label: string; icon: typeof Calendar }[] = [
  { id: 'upcoming', label: 'Upcoming', icon: Calendar },
  { id: 'past', label: 'Past', icon: CheckCircle },
  { id: 'cancelled', label: 'Cancelled', icon: XCircle },
];

export function CustomerDashboard({
  customer,
  bookings,
  upcomingBookings,
  pastBookings,
  cancelledBookings,
  isLoading,
  onLogout,
  onRefresh,
  onCancelBooking,
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<CustomerBooking | null>(null);

  const getTabBookings = (): CustomerBooking[] => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingBookings;
      case 'past':
        return pastBookings;
      case 'cancelled':
        return cancelledBookings;
      default:
        return [];
    }
  };

  const currentBookings = getTabBookings();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Welcome, {customer.firstName}!
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {customer.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50"
                title="Refresh bookings"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{upcomingBookings.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{pastBookings.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Completed</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700">
                <Clock className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{customer.totalBookings}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
              }`}>
                {tab.id === 'upcoming' ? upcomingBookings.length :
                 tab.id === 'past' ? pastBookings.length : cancelledBookings.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : currentBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              No {activeTab} bookings
            </p>
          </div>
        ) : (
          <motion.div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {currentBookings.map((booking) => (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <BookingCard
                    booking={booking}
                    onClick={() => setSelectedBooking(booking)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={onCancelBooking}
        />
      )}
    </div>
  );
}
