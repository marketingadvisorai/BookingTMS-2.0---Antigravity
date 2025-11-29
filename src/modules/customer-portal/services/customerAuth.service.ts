/**
 * Customer Authentication Service
 * Handles customer lookup and session management
 */

import { supabase } from '@/lib/supabase';
import type {
  CustomerLookupRequest,
  CustomerLookupResponse,
  CustomerProfile,
} from '../types';

// Session duration: 2 hours
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;

// Storage key for session
const SESSION_STORAGE_KEY = 'customer_portal_session';

// Database row types
interface CustomerRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  created_at: string;
}

interface BookingRow {
  customer_id: string;
}

/**
 * Generate a simple session token
 */
function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = 'cps_'; // customer portal session prefix
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Lookup customer by email, booking reference, or phone
 */
export async function lookupCustomer(
  request: CustomerLookupRequest
): Promise<CustomerLookupResponse> {
  try {
    let customerId: string | null = null;

    // Handle booking reference lookup separately
    if (request.method === 'booking_reference') {
      // Try booking_number first, then confirmation_code as fallback
      const searchValue = request.value.toUpperCase().trim();
      let { data: booking } = await supabase
        .from('bookings')
        .select('customer_id')
        .eq('booking_number', searchValue)
        .single<BookingRow>();
      
      // If not found by booking_number, try confirmation_code
      if (!booking?.customer_id) {
        const { data: bookingByCode } = await supabase
          .from('bookings')
          .select('customer_id')
          .eq('confirmation_code', searchValue)
          .single<BookingRow>();
        booking = bookingByCode;
      }
      
      if (!booking?.customer_id) {
        return {
          success: false,
          customer: null,
          sessionToken: null,
          expiresAt: null,
          error: 'No booking found with that reference',
        };
      }
      customerId = booking.customer_id;
    }

    // Build base query
    let query = supabase.from('customers').select(`
      id,
      email,
      first_name,
      last_name,
      phone,
      created_at
    `);

    // Apply filter based on lookup method
    if (customerId) {
      query = query.eq('id', customerId);
    } else if (request.method === 'email') {
      query = query.eq('email', request.value.toLowerCase().trim());
    } else if (request.method === 'phone') {
      query = query.eq('phone', request.value.trim());
    }

    const { data: customer, error } = await query.single<CustomerRow>();

    if (error || !customer) {
      return {
        success: false,
        customer: null,
        sessionToken: null,
        expiresAt: null,
        error: 'Customer not found. Please check your details and try again.',
      };
    }

    // Get booking count
    const { count } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer.id);

    // Generate session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    const profile: CustomerProfile = {
      id: customer.id,
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone,
      totalBookings: count || 0,
      createdAt: customer.created_at,
    };

    // Store session
    saveSession({
      customer: profile,
      sessionToken,
      expiresAt: expiresAt.toISOString(),
    });

    return {
      success: true,
      customer: profile,
      sessionToken,
      expiresAt: expiresAt.toISOString(),
    };
  } catch (error) {
    console.error('Customer lookup error:', error);
    return {
      success: false,
      customer: null,
      sessionToken: null,
      expiresAt: null,
      error: 'An error occurred. Please try again.',
    };
  }
}

/**
 * Save session to localStorage
 */
function saveSession(session: {
  customer: CustomerProfile;
  sessionToken: string;
  expiresAt: string;
}): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    console.warn('Could not save session to localStorage');
  }
}

/**
 * Get current session from localStorage
 */
export function getStoredSession(): {
  customer: CustomerProfile;
  sessionToken: string;
  expiresAt: string;
} | null {
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;

    const session = JSON.parse(stored);
    
    // Check if expired
    if (new Date(session.expiresAt) < new Date()) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Clear customer session
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    console.warn('Could not clear session from localStorage');
  }
}

/**
 * Check if session is valid
 */
export function isSessionValid(): boolean {
  const session = getStoredSession();
  return session !== null;
}

/**
 * Extend session duration
 */
export function extendSession(): void {
  const session = getStoredSession();
  if (session) {
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    saveSession({
      ...session,
      expiresAt: newExpiresAt.toISOString(),
    });
  }
}

export const customerAuthService = {
  lookupCustomer,
  getStoredSession,
  clearSession,
  isSessionValid,
  extendSession,
};
