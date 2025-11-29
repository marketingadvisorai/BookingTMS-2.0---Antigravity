/**
 * Customer Deduplication Types
 * Types for handling duplicate customer records
 */

export interface DuplicateCustomerMatch {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  totalBookings: number;
  totalSpent: number;
  createdAt: string;
  matchScore: number;
  matchReasons: string[];
}

export interface DuplicateGroup {
  primaryCustomerId: string;
  duplicates: DuplicateCustomerMatch[];
  matchedOn: ('email' | 'phone' | 'name')[];
}

export interface MergeCustomersRequest {
  primaryCustomerId: string;
  duplicateCustomerIds: string[];
  keepFields?: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface MergeResult {
  success: boolean;
  mergedCustomerId: string;
  bookingsMoved: number;
  duplicatesRemoved: number;
  error?: string;
}

export interface DedupStats {
  totalCustomers: number;
  potentialDuplicates: number;
  duplicateGroups: number;
  lastScanDate?: string;
}
