/**
 * Embed Pro 2.0 - Group Booking Service
 * @module embed-pro/services/groupbooking.service
 * 
 * Service for managing group bookings with multiple activities.
 */

import type {
  GroupBooking,
  GroupBookingCart,
  GroupBookingCartItem,
  GroupBookingCustomer,
} from '../types/groupbooking.types';

// =====================================================
// SERVICE CLASS
// =====================================================

class GroupBookingService {
  /**
   * Create a new cart
   */
  createCart(venueId: string, venueName: string, organizationId: string): GroupBookingCart {
    return {
      items: [],
      venue: { id: venueId, name: venueName },
      organizationId,
      subtotal: 0,
      promoDiscount: 0,
      giftCardAmount: 0,
      total: 0,
    };
  }

  /**
   * Add activity to cart
   */
  addToCart(cart: GroupBookingCart, activity: GroupBookingCartItem['activity']): GroupBookingCart {
    const newItem: GroupBookingCartItem = {
      id: this.generateId(),
      activity,
      date: null,
      timeSlot: null,
      partySize: activity.minPlayers,
    };

    const items = [...cart.items, newItem];
    return this.recalculateTotals({ ...cart, items });
  }

  /**
   * Remove activity from cart
   */
  removeFromCart(cart: GroupBookingCart, index: number): GroupBookingCart {
    const items = cart.items.filter((_, i) => i !== index);
    return this.recalculateTotals({ ...cart, items });
  }

  /**
   * Update cart item
   */
  updateCartItem(
    cart: GroupBookingCart,
    index: number,
    updates: Partial<Pick<GroupBookingCartItem, 'date' | 'timeSlot' | 'partySize'>>
  ): GroupBookingCart {
    const items = cart.items.map((item, i) => {
      if (i !== index) return item;
      return { ...item, ...updates };
    });
    return this.recalculateTotals({ ...cart, items });
  }

  /**
   * Apply promo discount
   */
  applyPromoDiscount(cart: GroupBookingCart, discount: number): GroupBookingCart {
    return this.recalculateTotals({ ...cart, promoDiscount: discount });
  }

  /**
   * Apply gift card
   */
  applyGiftCard(cart: GroupBookingCart, amount: number): GroupBookingCart {
    return this.recalculateTotals({ ...cart, giftCardAmount: amount });
  }

  /**
   * Check if cart is valid for checkout
   */
  validateCart(cart: GroupBookingCart): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (cart.items.length === 0) {
      errors.push('Cart is empty');
    }

    cart.items.forEach((item, index) => {
      if (!item.date) {
        errors.push(`Activity ${index + 1}: Please select a date`);
      }
      if (!item.timeSlot) {
        errors.push(`Activity ${index + 1}: Please select a time`);
      }
      if (item.partySize < item.activity.minPlayers) {
        errors.push(`Activity ${index + 1}: Minimum ${item.activity.minPlayers} players required`);
      }
      if (item.partySize > item.activity.maxPlayers) {
        errors.push(`Activity ${index + 1}: Maximum ${item.activity.maxPlayers} players allowed`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Create group booking from cart
   */
  async createGroupBooking(
    cart: GroupBookingCart,
    customer: GroupBookingCustomer
  ): Promise<{ success: boolean; booking?: GroupBooking; error?: string }> {
    // Validate cart first
    const validation = this.validateCart(cart);
    if (!validation.valid) {
      return { success: false, error: validation.errors[0] };
    }

    try {
      const booking: GroupBooking = {
        id: this.generateId(),
        organizationId: cart.organizationId,
        venueId: cart.venue.id,
        activities: cart.items.map(item => ({
          activityId: item.activity.id,
          name: item.activity.name,
          date: item.date!,
          timeSlotId: item.timeSlot!.id,
          time: item.timeSlot!.time,
          partySize: item.partySize,
          pricePerPerson: item.activity.pricePerPerson,
          totalPrice: item.partySize * item.activity.pricePerPerson,
          duration: item.activity.duration,
          imageUrl: item.activity.imageUrl,
        })),
        customer,
        totalPrice: cart.subtotal,
        discountAmount: cart.promoDiscount + cart.giftCardAmount,
        finalPrice: cart.total,
        status: 'pending_payment',
        bookingRef: this.generateBookingRef(),
        createdAt: new Date().toISOString(),
      };

      // In production, save to Supabase here
      console.log('[GroupBookingService] Created booking:', booking.bookingRef);

      return { success: true, booking };
    } catch (err) {
      console.error('[GroupBookingService] Error creating booking:', err);
      return { success: false, error: 'Failed to create booking' };
    }
  }

  /**
   * Recalculate cart totals
   */
  private recalculateTotals(cart: GroupBookingCart): GroupBookingCart {
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (item.partySize * item.activity.pricePerPerson);
    }, 0);

    const total = Math.max(0, subtotal - cart.promoDiscount - cart.giftCardAmount);

    return { ...cart, subtotal, total };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `gb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate booking reference
   */
  private generateBookingRef(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let ref = 'GRP-';
    for (let i = 0; i < 8; i++) {
      ref += chars[Math.floor(Math.random() * chars.length)];
    }
    return ref;
  }

  /**
   * Format currency
   */
  formatAmount(cents: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(cents / 100);
  }

  /**
   * Get total duration of all activities
   */
  getTotalDuration(cart: GroupBookingCart): number {
    return cart.items.reduce((sum, item) => sum + item.activity.duration, 0);
  }

  /**
   * Format duration
   */
  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
}

// Export singleton
export const groupBookingService = new GroupBookingService();
export default groupBookingService;
