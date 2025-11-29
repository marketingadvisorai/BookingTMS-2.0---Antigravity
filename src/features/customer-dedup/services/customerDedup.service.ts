/**
 * Customer Deduplication Service
 * Handles finding and merging duplicate customer records
 */

import { supabase } from '@/lib/supabase';
import type {
  DuplicateGroup,
  DuplicateCustomerMatch,
  MergeCustomersRequest,
  MergeResult,
  DedupStats,
} from '../types';

interface DBCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  total_bookings: number;
  total_spent: number;
  created_at: string;
}

class CustomerDedupService {
  /**
   * Find potential duplicate customers
   */
  async findDuplicates(organizationId?: string): Promise<DuplicateGroup[]> {
    // Fetch all customers
    let query = supabase.from('customers').select('*');
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data: customers, error } = await query;
    if (error || !customers?.length) return [];

    const customerList = customers as DBCustomer[];
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (const customer of customerList) {
      if (processed.has(customer.id)) continue;

      const duplicates = this.findMatchingCustomers(customer, customerList, processed);
      
      if (duplicates.length > 0) {
        processed.add(customer.id);
        duplicates.forEach((d) => processed.add(d.id));

        groups.push({
          primaryCustomerId: customer.id,
          duplicates,
          matchedOn: this.getMatchReasons(customer, duplicates),
        });
      }
    }

    return groups;
  }

  /**
   * Find customers matching the given customer
   */
  private findMatchingCustomers(
    customer: DBCustomer,
    allCustomers: DBCustomer[],
    processed: Set<string>
  ): DuplicateCustomerMatch[] {
    const matches: DuplicateCustomerMatch[] = [];

    for (const other of allCustomers) {
      if (other.id === customer.id || processed.has(other.id)) continue;

      const { score, reasons } = this.calculateMatchScore(customer, other);
      
      if (score >= 70) {
        matches.push({
          id: other.id,
          email: other.email,
          firstName: other.first_name,
          lastName: other.last_name,
          phone: other.phone,
          totalBookings: other.total_bookings || 0,
          totalSpent: other.total_spent || 0,
          createdAt: other.created_at,
          matchScore: score,
          matchReasons: reasons,
        });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * Calculate match score between two customers
   */
  private calculateMatchScore(
    a: DBCustomer,
    b: DBCustomer
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Email match (highest weight)
    if (a.email && b.email && a.email.toLowerCase() === b.email.toLowerCase()) {
      score += 100;
      reasons.push('Same email address');
    }

    // Phone match
    if (a.phone && b.phone) {
      const phoneA = a.phone.replace(/\D/g, '');
      const phoneB = b.phone.replace(/\D/g, '');
      if (phoneA === phoneB && phoneA.length >= 10) {
        score += 80;
        reasons.push('Same phone number');
      }
    }

    // Name match
    const nameA = `${a.first_name} ${a.last_name}`.toLowerCase().trim();
    const nameB = `${b.first_name} ${b.last_name}`.toLowerCase().trim();
    
    if (nameA === nameB && nameA.length > 3) {
      score += 60;
      reasons.push('Same full name');
    } else if (this.calculateNameSimilarity(nameA, nameB) > 0.8) {
      score += 40;
      reasons.push('Similar name');
    }

    return { score: Math.min(score, 100), reasons };
  }

  /**
   * Calculate name similarity using Levenshtein distance
   */
  private calculateNameSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (!a || !b) return 0;

    const maxLen = Math.max(a.length, b.length);
    const distance = this.levenshteinDistance(a, b);
    return 1 - distance / maxLen;
  }

  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Get match reasons for a duplicate group
   */
  private getMatchReasons(
    primary: DBCustomer,
    duplicates: DuplicateCustomerMatch[]
  ): ('email' | 'phone' | 'name')[] {
    const reasons = new Set<'email' | 'phone' | 'name'>();
    
    for (const dup of duplicates) {
      if (dup.matchReasons.some((r) => r.includes('email'))) reasons.add('email');
      if (dup.matchReasons.some((r) => r.includes('phone'))) reasons.add('phone');
      if (dup.matchReasons.some((r) => r.includes('name'))) reasons.add('name');
    }

    return Array.from(reasons);
  }

  /**
   * Merge duplicate customers into primary
   */
  async mergeCustomers(request: MergeCustomersRequest): Promise<MergeResult> {
    const { primaryCustomerId, duplicateCustomerIds, keepFields } = request;

    try {
      // Move all bookings from duplicates to primary
      let bookingsMoved = 0;
      for (const dupId of duplicateCustomerIds) {
        const { count } = await (supabase
          .from('bookings') as any)
          .update({ customer_id: primaryCustomerId })
          .eq('customer_id', dupId)
          .select('id', { count: 'exact' });
        
        bookingsMoved += count || 0;
      }

      // Update primary customer with kept fields if specified
      if (keepFields) {
        const updateData: Record<string, string> = {};
        if (keepFields.email) updateData.email = keepFields.email;
        if (keepFields.phone) updateData.phone = keepFields.phone;
        if (keepFields.firstName) updateData.first_name = keepFields.firstName;
        if (keepFields.lastName) updateData.last_name = keepFields.lastName;

        if (Object.keys(updateData).length > 0) {
          await (supabase
            .from('customers') as any)
            .update(updateData)
            .eq('id', primaryCustomerId);
        }
      }

      // Recalculate totals for primary customer
      const { data: bookings } = await supabase
        .from('bookings')
        .select('total_amount')
        .eq('customer_id', primaryCustomerId);

      const bookingList = (bookings || []) as { total_amount: number }[];
      const totalBookings = bookingList.length;
      const totalSpent = bookingList.reduce((sum, b) => sum + (b.total_amount || 0), 0);

      await (supabase
        .from('customers') as any)
        .update({ total_bookings: totalBookings, total_spent: totalSpent })
        .eq('id', primaryCustomerId);

      // Delete duplicate customer records
      const { error: deleteError } = await supabase
        .from('customers')
        .delete()
        .in('id', duplicateCustomerIds);

      if (deleteError) {
        throw new Error(`Failed to delete duplicates: ${deleteError.message}`);
      }

      return {
        success: true,
        mergedCustomerId: primaryCustomerId,
        bookingsMoved,
        duplicatesRemoved: duplicateCustomerIds.length,
      };
    } catch (error) {
      return {
        success: false,
        mergedCustomerId: primaryCustomerId,
        bookingsMoved: 0,
        duplicatesRemoved: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get deduplication statistics
   */
  async getStats(organizationId?: string): Promise<DedupStats> {
    let query = supabase.from('customers').select('id', { count: 'exact' });
    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { count: totalCustomers } = await query;
    const groups = await this.findDuplicates(organizationId);
    const potentialDuplicates = groups.reduce((sum, g) => sum + g.duplicates.length, 0);

    return {
      totalCustomers: totalCustomers || 0,
      potentialDuplicates,
      duplicateGroups: groups.length,
      lastScanDate: new Date().toISOString(),
    };
  }
}

export const customerDedupService = new CustomerDedupService();
