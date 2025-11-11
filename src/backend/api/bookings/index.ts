/**
 * Bookings API Routes
 * 
 * Handles all booking-related API endpoints
 */

import { Request, Response } from 'express';
import { BookingService } from '../../services/BookingService';
import { supabase } from '../../config/supabase';
import { asyncHandler } from '../../middleware/errorHandler';
import { ValidationError, NotFoundError } from '../../middleware/errorHandler';
import { AuthenticatedRequest } from '../../middleware/auth';
import type { CreateBookingDTO, UpdateBookingDTO, BookingFilters } from '../../models/Booking';

const bookingService = new BookingService(supabase);

/**
 * GET /api/bookings
 * List all bookings with optional filters
 */
export const listBookings = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const filters: BookingFilters = {
      status: req.query.status as string | undefined,
      payment_status: req.query.payment_status as any,
      date: req.query.date as string | undefined,
      date_from: req.query.date_from as string | undefined,
      date_to: req.query.date_to as string | undefined,
      game_id: req.query.game_id as string | undefined,
      customer_id: req.query.customer_id as string | undefined,
      search: req.query.search as string | undefined,
    };

    const bookings = await bookingService.listBookings(
      req.user.organizationId,
      filters
    );

    res.json({
      success: true,
      data: bookings,
      count: bookings.length,
    });
  }
);

/**
 * GET /api/bookings/:id
 * Get booking by ID
 */
export const getBooking = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const { id } = req.params;

    if (!id) {
      throw new ValidationError('Booking ID is required');
    }

    const booking = await bookingService.getBooking(
      id,
      req.user.organizationId
    );

    if (!booking) {
      throw new NotFoundError('Booking');
    }

    res.json({
      success: true,
      data: booking,
    });
  }
);

/**
 * POST /api/bookings
 * Create a new booking
 */
export const createBooking = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const bookingData: CreateBookingDTO = req.body;

    // Validate required fields
    if (!bookingData.customer_id) {
      throw new ValidationError('Customer ID is required');
    }

    if (!bookingData.game_id) {
      throw new ValidationError('Game ID is required');
    }

    if (!bookingData.booking_date) {
      throw new ValidationError('Booking date is required');
    }

    if (!bookingData.start_time) {
      throw new ValidationError('Start time is required');
    }

    if (!bookingData.party_size || bookingData.party_size < 1) {
      throw new ValidationError('Party size must be at least 1');
    }

    const booking = await bookingService.createBooking(
      bookingData,
      req.user.organizationId,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  }
);

/**
 * PUT /api/bookings/:id
 * Update a booking
 */
export const updateBooking = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const { id } = req.params;
    const updates: UpdateBookingDTO = req.body;

    if (!id) {
      throw new ValidationError('Booking ID is required');
    }

    const booking = await bookingService.updateBooking(
      id,
      updates,
      req.user.organizationId
    );

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking,
    });
  }
);

/**
 * DELETE /api/bookings/:id
 * Cancel a booking
 */
export const cancelBooking = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const { id } = req.params;
    const { reason } = req.body;

    if (!id) {
      throw new ValidationError('Booking ID is required');
    }

    const booking = await bookingService.cancelBooking(
      id,
      req.user.organizationId,
      reason
    );

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  }
);

/**
 * POST /api/bookings/:id/checkin
 * Check-in a customer for their booking
 */
export const checkIn = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const { id } = req.params;

    if (!id) {
      throw new ValidationError('Booking ID is required');
    }

    const booking = await bookingService.checkIn(
      id,
      req.user.organizationId
    );

    res.json({
      success: true,
      message: 'Customer checked in successfully',
      data: booking,
    });
  }
);

/**
 * GET /api/bookings/availability
 * Check availability for a time slot
 */
export const checkAvailability = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    const { game_id, date, start_time } = req.query;

    if (!game_id) {
      throw new ValidationError('Game ID is required');
    }

    if (!date) {
      throw new ValidationError('Date is required');
    }

    if (!start_time) {
      throw new ValidationError('Start time is required');
    }

    // TODO: Implement availability check
    const isAvailable = true;

    res.json({
      success: true,
      data: {
        available: isAvailable,
        game_id,
        date,
        start_time,
      },
    });
  }
);

/**
 * GET /api/bookings/stats
 * Get booking statistics
 */
export const getBookingStats = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new ValidationError('User not authenticated');
    }

    // TODO: Implement stats calculation
    const stats = {
      total_bookings: 0,
      confirmed_bookings: 0,
      pending_bookings: 0,
      cancelled_bookings: 0,
      total_revenue: 0,
      average_party_size: 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  }
);
