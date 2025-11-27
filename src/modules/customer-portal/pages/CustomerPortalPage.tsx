/**
 * CustomerPortalPage
 * Main entry point for customer-facing booking management portal
 */

import React from 'react';
import { useCustomerAuth, useCustomerBookings } from '../hooks';
import { CustomerLookup, CustomerDashboard } from '../components';

export function CustomerPortalPage() {
  const {
    isAuthenticated,
    customer,
    isLoading: authLoading,
    error: authError,
    lookup,
    logout,
  } = useCustomerAuth();

  const {
    bookings,
    upcomingBookings,
    pastBookings,
    cancelledBookings,
    isLoading: bookingsLoading,
    fetchBookings,
    cancelBooking,
  } = useCustomerBookings({
    customerId: customer?.id || null,
    autoFetch: true,
  });

  // Show lookup form if not authenticated
  if (!isAuthenticated || !customer) {
    return (
      <CustomerLookup
        onLookup={lookup}
        isLoading={authLoading}
        error={authError}
      />
    );
  }

  // Show dashboard if authenticated
  return (
    <CustomerDashboard
      customer={customer}
      bookings={bookings}
      upcomingBookings={upcomingBookings}
      pastBookings={pastBookings}
      cancelledBookings={cancelledBookings}
      isLoading={bookingsLoading}
      onLogout={logout}
      onRefresh={fetchBookings}
      onCancelBooking={cancelBooking}
    />
  );
}
