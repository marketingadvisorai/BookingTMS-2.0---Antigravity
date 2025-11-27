/**
 * Embed Pro 2.0 - Waitlist Types
 * @module embed-pro/types/waitlist.types
 * 
 * Type definitions for the waitlist feature.
 * Allows customers to join a waitlist for sold-out time slots.
 */

// =====================================================
// WAITLIST ENTRY TYPES
// =====================================================

export type WaitlistStatus = 'pending' | 'notified' | 'converted' | 'expired' | 'cancelled';

export interface WaitlistEntry {
  /** Unique identifier */
  id: string;
  /** Activity ID */
  activityId: string;
  /** Session/time slot ID */
  sessionId: string;
  /** Customer details */
  customer: WaitlistCustomer;
  /** Number of spots requested */
  partySize: number;
  /** Current status */
  status: WaitlistStatus;
  /** Position in queue (1 = first) */
  position: number;
  /** Timestamp when joined */
  createdAt: string;
  /** Timestamp when notified (if applicable) */
  notifiedAt?: string;
  /** Timestamp when entry expires */
  expiresAt: string;
  /** Notes from customer */
  notes?: string;
}

export interface WaitlistCustomer {
  /** Customer name */
  name: string;
  /** Customer email */
  email: string;
  /** Customer phone (optional) */
  phone?: string;
}

// =====================================================
// WAITLIST REQUEST/RESPONSE TYPES
// =====================================================

export interface JoinWaitlistRequest {
  /** Activity ID */
  activityId: string;
  /** Session/time slot ID */
  sessionId: string;
  /** Date of the session (ISO string) */
  sessionDate: string;
  /** Time of the session */
  sessionTime: string;
  /** Customer details */
  customer: WaitlistCustomer;
  /** Number of spots requested */
  partySize: number;
  /** Optional notes */
  notes?: string;
}

export interface JoinWaitlistResponse {
  /** Whether the join was successful */
  success: boolean;
  /** The created waitlist entry */
  entry?: WaitlistEntry;
  /** Error message if failed */
  error?: string;
  /** Position in queue */
  position?: number;
  /** Estimated wait message */
  estimatedWait?: string;
}

export interface WaitlistAvailability {
  /** Session ID */
  sessionId: string;
  /** Whether waitlist is available */
  isAvailable: boolean;
  /** Current queue length */
  queueLength: number;
  /** Estimated wait time */
  estimatedWait?: string;
  /** Max waitlist size (if limited) */
  maxSize?: number;
}

// =====================================================
// UI STATE TYPES
// =====================================================

export interface WaitlistModalState {
  /** Whether modal is open */
  isOpen: boolean;
  /** Session being waited for */
  sessionId: string | null;
  /** Session date */
  sessionDate: string | null;
  /** Session time */
  sessionTime: string | null;
  /** Loading state */
  isSubmitting: boolean;
  /** Success state */
  isSuccess: boolean;
  /** Error message */
  error: string | null;
  /** Result position */
  position: number | null;
}
