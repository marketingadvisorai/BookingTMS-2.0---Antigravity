import { supabase } from '../lib/supabase';
import { SessionService } from './session.service';
import { z } from 'zod';

export interface Booking {
    id: string;
    booking_number: string;
    activity_id: string;
    session_id: string;
    customer_id: string;
    organization_id: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    party_size: number;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    payment_status: 'paid' | 'pending' | 'failed' | 'refunded';
    total_price: number;
    created_at: string;
}

export const CreateBookingSchema = z.object({
    sessionId: z.string().uuid(),
    activityId: z.string().uuid(),
    venueId: z.string().uuid(),
    customer: z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
    }),
    partySize: z.number().min(1),
});

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export class BookingService {

    /**
     * Initiates a booking via the secure Edge Function.
     * This creates a Stripe Payment Intent and a pending booking.
     */
    static async initiateBooking(params: {
        sessionId: string;
        activityId: string;
        organizationId: string;
        partySize: number;
        customerDetails: {
            email: string;
            name: string;
            phone?: string;
        };
        customerId?: string;
    }): Promise<{ clientSecret: string; bookingId: string }> {
        const { data, error } = await supabase.functions.invoke('create-booking', {
            body: {
                session_id: params.sessionId,
                activity_id: params.activityId,
                organization_id: params.organizationId,
                party_size: params.partySize,
                customer_id: params.customerId,
                customer_details: params.customerDetails
            }
        });

        if (error) {
            console.error('Edge Function Error:', error);
            throw new Error(`Booking initiation failed: ${error.message}`);
        }

        if (data.error) {
            throw new Error(data.error);
        }

        return {
            clientSecret: data.clientSecret,
            bookingId: data.bookingId
        };
    }

    /**
     * Create a new booking using the atomic transaction RPC.
     * Handles customer creation/lookup automatically.
     * @deprecated Use initiateBooking for public widgets to ensure payment security.
     */
    static async createBooking(input: CreateBookingInput): Promise<Booking> {
        try {
            // 1. Validate Input
            const validated = CreateBookingSchema.parse(input);

            // 2. Get Session to verify Organization ID
            const { data: sessionData, error: sessionError } = await supabase
                .from('activity_sessions')
                .select('organization_id, price_at_generation')
                .eq('id', validated.sessionId)
                .single();

            if (sessionError || !sessionData) {
                throw new Error('Session not found');
            }

            const organizationId = sessionData.organization_id;

            // 3. Find or Create Customer
            const customerId = await this.findOrCreateCustomer(
                organizationId,
                validated.customer
            );

            // 4. Call RPC for Atomic Booking
            const { data: bookingId, error: rpcError } = await supabase
                .rpc('create_booking_transaction', {
                    p_session_id: validated.sessionId,
                    p_customer_id: customerId,
                    p_organization_id: organizationId,
                    p_party_size: validated.partySize
                });

            if (rpcError) {
                console.error('Booking RPC failed:', rpcError);
                if (rpcError.message.includes('Insufficient capacity')) {
                    throw new Error('This session is fully booked.');
                }
                throw new Error('Failed to create booking transaction.');
            }

            // 5. Fetch and Return the Created Booking
            const { data: booking, error: fetchError } = await supabase
                .from('bookings')
                .select('*')
                .eq('id', bookingId)
                .single();

            if (fetchError) {
                console.error('Error fetching created booking:', fetchError);
                throw new Error('Booking created but failed to retrieve details.');
            }

            return booking as Booking;

        } catch (error: any) {
            console.error('Booking creation error:', error);
            throw error;
        }
    }

    /**
     * Helper to find or create a customer based on email and organization.
     */
    private static async findOrCreateCustomer(
        organizationId: string,
        customerData: { firstName: string; lastName: string; email: string; phone?: string }
    ): Promise<string> {
        const email = customerData.email.toLowerCase().trim();
        const fullName = `${customerData.firstName} ${customerData.lastName}`.trim();

        // 1. Try to find existing customer
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('organization_id', organizationId)
            .eq('email', email)
            .single();

        if (existingCustomer) {
            return existingCustomer.id;
        }

        // 2. Create new customer
        const { data: newCustomer, error } = await supabase
            .from('customers')
            .insert({
                organization_id: organizationId,
                full_name: fullName,
                email: email,
                phone: customerData.phone,
                total_bookings: 0,
                total_spent: 0,
                segment: 'new'
            })
            .select('id')
            .single();

        if (error) {
            console.error('Error creating customer:', error);
            throw new Error('Failed to create customer record.');
        }

        return newCustomer.id;
    }

    /**
     * Get a booking by ID
     */
    static async getBooking(id: string): Promise<Booking | null> {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data as Booking;
    }
}
