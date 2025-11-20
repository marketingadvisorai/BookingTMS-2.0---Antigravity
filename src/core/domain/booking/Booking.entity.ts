/**
 * Booking Entity
 * Core domain entity for bookings with business logic
 * @module core/domain/booking
 */

import {
  IBooking,
  ICreateBookingDTO,
  IUpdateBookingDTO,
  BookingStatus,
  PaymentStatus,
  BookingSource,
} from './Booking.types';

/**
 * Booking Entity Class
 * Encapsulates booking business logic and validation
 */
export class BookingEntity implements IBooking {
  public readonly id: string;
  public readonly organizationId: string;
  public readonly venueId: string;
  public readonly gameId: string;
  public readonly customerId: string;
  
  public bookingDate: Date;
  public bookingTime: string;
  public endTime: string;
  public players: number;
  
  public status: BookingStatus;
  public paymentStatus: PaymentStatus;
  public source: BookingSource;
  
  public totalAmount: number;
  public depositAmount: number;
  public finalAmount: number;
  public discountAmount?: number;
  
  public notes?: string;
  public confirmationCode: string;
  public promoCode?: string;
  
  public metadata?: Record<string, any>;
  public readonly createdBy: string;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(data: IBooking) {
    this.id = data.id;
    this.organizationId = data.organizationId;
    this.venueId = data.venueId;
    this.gameId = data.gameId;
    this.customerId = data.customerId;
    
    this.bookingDate = data.bookingDate;
    this.bookingTime = data.bookingTime;
    this.endTime = data.endTime;
    this.players = data.players;
    
    this.status = data.status;
    this.paymentStatus = data.paymentStatus;
    this.source = data.source;
    
    this.totalAmount = data.totalAmount;
    this.depositAmount = data.depositAmount;
    this.finalAmount = data.finalAmount;
    this.discountAmount = data.discountAmount;
    
    this.notes = data.notes;
    this.confirmationCode = data.confirmationCode;
    this.promoCode = data.promoCode;
    
    this.metadata = data.metadata;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  /**
   * Factory method to create a new booking
   */
  static create(dto: ICreateBookingDTO, userId: string): BookingEntity {
    const now = new Date();
    const confirmationCode = this.generateConfirmationCode();
    
    const booking: IBooking = {
      id: '', // Will be set by repository
      organizationId: dto.organizationId,
      venueId: dto.venueId,
      gameId: dto.gameId,
      customerId: dto.customerId,
      
      bookingDate: dto.bookingDate,
      bookingTime: dto.bookingTime,
      endTime: this.calculateEndTime(dto.bookingTime, 60), // Default 60 min
      players: dto.players,
      
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      source: dto.source || BookingSource.ADMIN,
      
      totalAmount: dto.totalAmount,
      depositAmount: dto.depositAmount || 0,
      finalAmount: dto.totalAmount,
      discountAmount: 0,
      
      notes: dto.notes,
      confirmationCode,
      promoCode: dto.promoCode,
      
      metadata: dto.metadata,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    };
    
    return new BookingEntity(booking);
  }

  /**
   * Update booking details
   */
  update(dto: IUpdateBookingDTO): void {
    if (dto.bookingDate) this.bookingDate = dto.bookingDate;
    if (dto.bookingTime) this.bookingTime = dto.bookingTime;
    if (dto.players) this.players = dto.players;
    if (dto.status) this.status = dto.status;
    if (dto.paymentStatus) this.paymentStatus = dto.paymentStatus;
    if (dto.notes !== undefined) this.notes = dto.notes;
    if (dto.metadata) this.metadata = { ...this.metadata, ...dto.metadata };
    
    this.updatedAt = new Date();
  }

  /**
   * Confirm the booking
   */
  confirm(): void {
    if (this.status === BookingStatus.CANCELLED) {
      throw new Error('Cannot confirm a cancelled booking');
    }
    
    this.status = BookingStatus.CONFIRMED;
    this.updatedAt = new Date();
  }

  /**
   * Cancel the booking
   */
  cancel(reason: string): void {
    if (this.status === BookingStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed booking');
    }
    
    this.status = BookingStatus.CANCELLED;
    this.metadata = {
      ...this.metadata,
      cancellationReason: reason,
      cancelledAt: new Date().toISOString(),
    };
    this.updatedAt = new Date();
  }

  /**
   * Mark booking as completed
   */
  complete(): void {
    if (this.status !== BookingStatus.CONFIRMED && 
        this.status !== BookingStatus.IN_PROGRESS) {
      throw new Error('Can only complete confirmed or in-progress bookings');
    }
    
    this.status = BookingStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  /**
   * Mark booking as no-show
   */
  markNoShow(): void {
    if (this.status !== BookingStatus.CONFIRMED) {
      throw new Error('Can only mark confirmed bookings as no-show');
    }
    
    this.status = BookingStatus.NO_SHOW;
    this.updatedAt = new Date();
  }

  /**
   * Update payment status
   */
  updatePaymentStatus(status: PaymentStatus, amount?: number): void {
    this.paymentStatus = status;
    
    if (amount !== undefined) {
      this.depositAmount = amount;
    }
    
    this.updatedAt = new Date();
  }

  /**
   * Apply discount to booking
   */
  applyDiscount(discountAmount: number, promoCode?: string): void {
    if (discountAmount < 0 || discountAmount > this.totalAmount) {
      throw new Error('Invalid discount amount');
    }
    
    this.discountAmount = discountAmount;
    this.finalAmount = this.totalAmount - discountAmount;
    
    if (promoCode) {
      this.promoCode = promoCode;
    }
    
    this.updatedAt = new Date();
  }

  /**
   * Check if booking can be cancelled
   */
  canBeCancelled(): boolean {
    return this.status !== BookingStatus.CANCELLED && 
           this.status !== BookingStatus.COMPLETED;
  }

  /**
   * Check if booking can be modified
   */
  canBeModified(): boolean {
    return this.status === BookingStatus.PENDING || 
           this.status === BookingStatus.CONFIRMED;
  }

  /**
   * Check if booking is in the past
   */
  isPast(): boolean {
    const bookingDateTime = new Date(this.bookingDate);
    const [hours, minutes] = this.bookingTime.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    
    return bookingDateTime < new Date();
  }

  /**
   * Check if booking is upcoming (within next 24 hours)
   */
  isUpcoming(): boolean {
    const bookingDateTime = new Date(this.bookingDate);
    const [hours, minutes] = this.bookingTime.split(':').map(Number);
    bookingDateTime.setHours(hours, minutes, 0, 0);
    
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return bookingDateTime >= now && bookingDateTime <= tomorrow;
  }

  /**
   * Get booking duration in minutes
   */
  getDurationMinutes(): number {
    const [startHours, startMinutes] = this.bookingTime.split(':').map(Number);
    const [endHours, endMinutes] = this.endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  }

  /**
   * Convert entity to plain object
   */
  toObject(): IBooking {
    return {
      id: this.id,
      organizationId: this.organizationId,
      venueId: this.venueId,
      gameId: this.gameId,
      customerId: this.customerId,
      bookingDate: this.bookingDate,
      bookingTime: this.bookingTime,
      endTime: this.endTime,
      players: this.players,
      status: this.status,
      paymentStatus: this.paymentStatus,
      source: this.source,
      totalAmount: this.totalAmount,
      depositAmount: this.depositAmount,
      finalAmount: this.finalAmount,
      discountAmount: this.discountAmount,
      notes: this.notes,
      confirmationCode: this.confirmationCode,
      promoCode: this.promoCode,
      metadata: this.metadata,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Generate a unique confirmation code
   */
  private static generateConfirmationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'CONF-';
    
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return code;
  }

  /**
   * Calculate end time based on start time and duration
   */
  private static calculateEndTime(startTime: string, durationMinutes: number): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }
}
