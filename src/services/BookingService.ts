import { supabase } from '../lib/supabase';
import { z } from 'zod';

// --- Types ---

export interface TimeSlot {
    id: string;
    slot_date: string;
    start_time: string;
    end_time: string;
    price: number;
    price_multiplier: number;
    final_price: number;
    is_available: boolean;
    current_bookings: number;
    max_bookings: number;
}

export interface BookingResponse {
    success: boolean;
    checkout_url?: string;
    session_id?: string;
    booking_id?: string;
    message?: string;
    error?: string;
}

// --- Zod Schemas ---

export const CreateBookingSchema = z.object({
    venueId: z.string().uuid(),
    gameId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'), // Start time
    partySize: z.number().min(1),
    customer: z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
    }),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

// --- Booking Service ---

export class BookingService {

    /**
     * Get available time slots for a specific game on a specific date.
     * Uses the database RPC 'get_available_time_slots' for accuracy.
     */
    static async getAvailability(
        gameId: string,
        date: string,
        days: number = 1
    ): Promise<TimeSlot[]> {
        try {
            const { data, error } = await supabase.rpc('get_available_time_slots', {
                p_game_id: gameId,
                p_date: date,
                p_days: days
            });

            if (error) {
                console.error('Error fetching availability:', error);
                throw new Error(error.message);
            }

            return data as TimeSlot[];
        } catch (error: any) {
            console.error('BookingService.getAvailability failed:', error);
            throw new Error(error.message || 'Failed to check availability');
        }
    }

    /**
     * Create a booking and initiate the checkout process.
     * Uses the 'create-booking-checkout' Edge Function.
     */
    static async createBooking(input: CreateBookingInput): Promise<BookingResponse> {
        try {
            // Validate input
            const validated = CreateBookingSchema.parse(input);

            const payload = {
                venue_id: validated.venueId,
                game_id: validated.gameId,
                booking_date: validated.date,
                booking_time: validated.time,
                num_players: validated.partySize,
                customer_email: validated.customer.email,
                customer_name: `${validated.customer.firstName} ${validated.customer.lastName}`.trim(),
                customer_phone: validated.customer.phone,
                success_url: validated.successUrl,
                cancel_url: validated.cancelUrl,
            };

            const { data, error } = await supabase.functions.invoke('create-booking-checkout', {
                body: payload,
            });

            if (error) {
                console.error('Edge Function error:', error);
                // Parse the error body if available
                let errorMessage = 'Failed to create booking';
                try {
                    if (error instanceof Error) errorMessage = error.message;
                    // Sometimes the error body is in the response
                } catch (e) { }
                throw new Error(errorMessage);
            }

            if (!data.success) {
                throw new Error(data.error || 'Booking creation failed');
            }

            return data as BookingResponse;

        } catch (error: any) {
            console.error('BookingService.createBooking failed:', error);
            return {
                success: false,
                error: error.message || 'An unexpected error occurred',
            };
        }
    }
}
