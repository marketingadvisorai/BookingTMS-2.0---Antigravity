/**
 * Booking Validator
 * Validates booking data and business rules
 * @module core/domain/booking
 */

import {
  ICreateBookingDTO,
  IUpdateBookingDTO,
  IBookingValidation,
  IValidationError,
  IValidationWarning,
  BookingStatus,
  PaymentStatus,
} from './Booking.types';

/**
 * Booking Validator Class
 * Handles all booking validation logic
 */
export class BookingValidator {
  private errors: IValidationError[] = [];
  private warnings: IValidationWarning[] = [];

  /**
   * Validate booking creation data
   */
  validateCreate(dto: ICreateBookingDTO): IBookingValidation {
    this.errors = [];
    this.warnings = [];

    this.validateOrganizationId(dto.organizationId);
    this.validateVenueId(dto.venueId);
    this.validateGameId(dto.gameId);
    this.validateCustomerId(dto.customerId);
    this.validateBookingDate(dto.bookingDate);
    this.validateBookingTime(dto.bookingTime);
    this.validatePlayers(dto.players);
    this.validateAmount(dto.totalAmount);
    
    if (dto.depositAmount !== undefined) {
      this.validateDepositAmount(dto.depositAmount, dto.totalAmount);
    }
    
    if (dto.promoCode) {
      this.validatePromoCode(dto.promoCode);
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  /**
   * Validate booking update data
   */
  validateUpdate(dto: IUpdateBookingDTO): IBookingValidation {
    this.errors = [];
    this.warnings = [];

    if (dto.bookingDate) {
      this.validateBookingDate(dto.bookingDate);
    }
    
    if (dto.bookingTime) {
      this.validateBookingTime(dto.bookingTime);
    }
    
    if (dto.players) {
      this.validatePlayers(dto.players);
    }
    
    if (dto.status) {
      this.validateStatus(dto.status);
    }
    
    if (dto.paymentStatus) {
      this.validatePaymentStatus(dto.paymentStatus);
    }

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
    };
  }

  /**
   * Validate organization ID
   */
  private validateOrganizationId(organizationId: string): void {
    if (!organizationId || organizationId.trim() === '') {
      this.addError('organizationId', 'Organization ID is required', 'REQUIRED');
    }
    
    if (!this.isValidUUID(organizationId)) {
      this.addError('organizationId', 'Invalid organization ID format', 'INVALID_FORMAT');
    }
  }

  /**
   * Validate venue ID
   */
  private validateVenueId(venueId: string): void {
    if (!venueId || venueId.trim() === '') {
      this.addError('venueId', 'Venue ID is required', 'REQUIRED');
    }
    
    if (!this.isValidUUID(venueId)) {
      this.addError('venueId', 'Invalid venue ID format', 'INVALID_FORMAT');
    }
  }

  /**
   * Validate game ID
   */
  private validateGameId(gameId: string): void {
    if (!gameId || gameId.trim() === '') {
      this.addError('gameId', 'Game ID is required', 'REQUIRED');
    }
    
    if (!this.isValidUUID(gameId)) {
      this.addError('gameId', 'Invalid game ID format', 'INVALID_FORMAT');
    }
  }

  /**
   * Validate customer ID
   */
  private validateCustomerId(customerId: string): void {
    if (!customerId || customerId.trim() === '') {
      this.addError('customerId', 'Customer ID is required', 'REQUIRED');
    }
    
    if (!this.isValidUUID(customerId)) {
      this.addError('customerId', 'Invalid customer ID format', 'INVALID_FORMAT');
    }
  }

  /**
   * Validate booking date
   */
  private validateBookingDate(bookingDate: Date): void {
    if (!bookingDate) {
      this.addError('bookingDate', 'Booking date is required', 'REQUIRED');
      return;
    }
    
    const date = new Date(bookingDate);
    
    if (isNaN(date.getTime())) {
      this.addError('bookingDate', 'Invalid booking date', 'INVALID_FORMAT');
      return;
    }
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      this.addError('bookingDate', 'Booking date cannot be in the past', 'PAST_DATE');
    }
    
    // Check if date is too far in the future (e.g., more than 1 year)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    
    if (date > maxDate) {
      this.addWarning('bookingDate', 'Booking date is more than 1 year in the future', 'FAR_FUTURE');
    }
  }

  /**
   * Validate booking time
   */
  private validateBookingTime(bookingTime: string): void {
    if (!bookingTime || bookingTime.trim() === '') {
      this.addError('bookingTime', 'Booking time is required', 'REQUIRED');
      return;
    }
    
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    
    if (!timeRegex.test(bookingTime)) {
      this.addError('bookingTime', 'Invalid time format. Use HH:MM (24-hour)', 'INVALID_FORMAT');
      return;
    }
    
    // Check if time is within business hours (e.g., 8:00 - 23:00)
    const [hours] = bookingTime.split(':').map(Number);
    
    if (hours < 8 || hours > 23) {
      this.addWarning('bookingTime', 'Booking time is outside typical business hours', 'OUTSIDE_HOURS');
    }
  }

  /**
   * Validate number of players
   */
  private validatePlayers(players: number): void {
    if (!players || players <= 0) {
      this.addError('players', 'Number of players must be greater than 0', 'INVALID_VALUE');
    }
    
    if (players > 20) {
      this.addWarning('players', 'Large party size may require special arrangements', 'LARGE_PARTY');
    }
    
    if (!Number.isInteger(players)) {
      this.addError('players', 'Number of players must be a whole number', 'INVALID_TYPE');
    }
  }

  /**
   * Validate amount
   */
  private validateAmount(amount: number): void {
    if (amount === undefined || amount === null) {
      this.addError('totalAmount', 'Total amount is required', 'REQUIRED');
      return;
    }
    
    if (amount < 0) {
      this.addError('totalAmount', 'Total amount cannot be negative', 'INVALID_VALUE');
    }
    
    if (amount === 0) {
      this.addWarning('totalAmount', 'Total amount is zero', 'ZERO_AMOUNT');
    }
    
    // Check for reasonable amount (e.g., not more than $10,000)
    if (amount > 10000) {
      this.addWarning('totalAmount', 'Unusually high booking amount', 'HIGH_AMOUNT');
    }
  }

  /**
   * Validate deposit amount
   */
  private validateDepositAmount(depositAmount: number, totalAmount: number): void {
    if (depositAmount < 0) {
      this.addError('depositAmount', 'Deposit amount cannot be negative', 'INVALID_VALUE');
    }
    
    if (depositAmount > totalAmount) {
      this.addError('depositAmount', 'Deposit amount cannot exceed total amount', 'EXCEEDS_TOTAL');
    }
  }

  /**
   * Validate promo code
   */
  private validatePromoCode(promoCode: string): void {
    if (promoCode.length < 3 || promoCode.length > 20) {
      this.addError('promoCode', 'Promo code must be between 3 and 20 characters', 'INVALID_LENGTH');
    }
    
    // Check for valid characters (alphanumeric and hyphens)
    const promoCodeRegex = /^[A-Z0-9-]+$/;
    
    if (!promoCodeRegex.test(promoCode.toUpperCase())) {
      this.addError('promoCode', 'Promo code can only contain letters, numbers, and hyphens', 'INVALID_FORMAT');
    }
  }

  /**
   * Validate booking status
   */
  private validateStatus(status: BookingStatus): void {
    const validStatuses = Object.values(BookingStatus);
    
    if (!validStatuses.includes(status)) {
      this.addError('status', 'Invalid booking status', 'INVALID_VALUE');
    }
  }

  /**
   * Validate payment status
   */
  private validatePaymentStatus(paymentStatus: PaymentStatus): void {
    const validStatuses = Object.values(PaymentStatus);
    
    if (!validStatuses.includes(paymentStatus)) {
      this.addError('paymentStatus', 'Invalid payment status', 'INVALID_VALUE');
    }
  }

  /**
   * Check if string is a valid UUID
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Add validation error
   */
  private addError(field: string, message: string, code: string): void {
    this.errors.push({ field, message, code });
  }

  /**
   * Add validation warning
   */
  private addWarning(field: string, message: string, code: string): void {
    this.warnings.push({ field, message, code });
  }
}

/**
 * Singleton instance of BookingValidator
 */
export const bookingValidator = new BookingValidator();
