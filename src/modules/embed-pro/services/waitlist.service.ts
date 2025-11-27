/**
 * Embed Pro 2.0 - Waitlist Service
 * @module embed-pro/services/waitlist.service
 * 
 * Service for managing waitlist entries.
 * Allows customers to join a waitlist when slots are sold out.
 * 
 * NOTE: Uses local storage for demo. Connect to Supabase for production.
 */

import type {
  WaitlistEntry,
  JoinWaitlistRequest,
  JoinWaitlistResponse,
  WaitlistAvailability,
} from '../types/waitlist.types';

// =====================================================
// CONSTANTS
// =====================================================

const STORAGE_KEY = 'embed_pro_waitlist';
const EXPIRY_HOURS = 24; // Waitlist entries expire after 24 hours

// =====================================================
// SERVICE CLASS
// =====================================================

class WaitlistService {
  /**
   * Join the waitlist for a sold-out slot
   */
  async joinWaitlist(request: JoinWaitlistRequest): Promise<JoinWaitlistResponse> {
    try {
      // Validate request
      if (!request.customer.email || !request.customer.name) {
        return { success: false, error: 'Name and email are required' };
      }

      if (!this.isValidEmail(request.customer.email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Check if already on waitlist
      const existing = await this.getExistingEntry(
        request.sessionId,
        request.customer.email
      );

      if (existing) {
        return {
          success: false,
          error: 'You are already on the waitlist for this time slot',
        };
      }

      // Get current queue position
      const queueLength = await this.getQueueLength(request.sessionId);
      const position = queueLength + 1;

      // Create waitlist entry
      const entry: WaitlistEntry = {
        id: this.generateId(),
        activityId: request.activityId,
        sessionId: request.sessionId,
        customer: request.customer,
        partySize: request.partySize,
        status: 'pending',
        position,
        createdAt: new Date().toISOString(),
        expiresAt: this.getExpiryDate().toISOString(),
        notes: request.notes,
      };

      // Save entry
      await this.saveEntry(entry);

      console.log('[WaitlistService] Added to waitlist:', {
        sessionId: request.sessionId,
        position,
        email: request.customer.email,
      });

      return {
        success: true,
        entry,
        position,
        estimatedWait: this.getEstimatedWait(position),
      };
    } catch (err) {
      console.error('[WaitlistService] Error joining waitlist:', err);
      return { success: false, error: 'Unable to join waitlist. Please try again.' };
    }
  }

  /**
   * Get waitlist availability for a session
   */
  async getAvailability(sessionId: string): Promise<WaitlistAvailability> {
    const queueLength = await this.getQueueLength(sessionId);

    return {
      sessionId,
      isAvailable: true, // Waitlist always available for demo
      queueLength,
      estimatedWait: this.getEstimatedWait(queueLength + 1),
      maxSize: 50, // Max waitlist size
    };
  }

  /**
   * Cancel a waitlist entry
   */
  async cancelEntry(entryId: string, email: string): Promise<boolean> {
    try {
      const entries = this.getAllEntries();
      const index = entries.findIndex(
        e => e.id === entryId && e.customer.email === email
      );

      if (index === -1) {
        return false;
      }

      entries[index].status = 'cancelled';
      this.saveAllEntries(entries);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get user's waitlist entries
   */
  async getUserEntries(email: string): Promise<WaitlistEntry[]> {
    const entries = this.getAllEntries();
    return entries.filter(
      e => e.customer.email === email && e.status === 'pending'
    );
  }

  // =====================================================
  // PRIVATE HELPERS
  // =====================================================

  private generateId(): string {
    return `wl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getExpiryDate(): Date {
    const date = new Date();
    date.setHours(date.getHours() + EXPIRY_HOURS);
    return date;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private getEstimatedWait(position: number): string {
    if (position <= 2) return 'High chance of availability';
    if (position <= 5) return 'Good chance of availability';
    if (position <= 10) return 'Moderate wait expected';
    return 'Longer wait expected';
  }

  private async getExistingEntry(
    sessionId: string,
    email: string
  ): Promise<WaitlistEntry | null> {
    const entries = this.getAllEntries();
    return entries.find(
      e => e.sessionId === sessionId && 
           e.customer.email === email && 
           e.status === 'pending'
    ) || null;
  }

  private async getQueueLength(sessionId: string): Promise<number> {
    const entries = this.getAllEntries();
    return entries.filter(
      e => e.sessionId === sessionId && e.status === 'pending'
    ).length;
  }

  private getAllEntries(): WaitlistEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];

      const entries: WaitlistEntry[] = JSON.parse(data);
      
      // Filter out expired entries
      const now = new Date();
      return entries.filter(e => new Date(e.expiresAt) > now);
    } catch {
      return [];
    }
  }

  private saveAllEntries(entries: WaitlistEntry[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  private async saveEntry(entry: WaitlistEntry): Promise<void> {
    const entries = this.getAllEntries();
    entries.push(entry);
    this.saveAllEntries(entries);
  }
}

// Export singleton instance
export const waitlistService = new WaitlistService();
export default waitlistService;
