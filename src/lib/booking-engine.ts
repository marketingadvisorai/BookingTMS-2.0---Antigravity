import { supabase } from './supabase/client';
import { z } from 'zod';

// --- Types ---

interface GameRow {
    id: string;
    organization_id: string;
    duration_minutes: number;
    min_players: number;
    max_players: number;
    settings: any;
}

interface CustomerRow {
    id: string;
    organization_id: string;
    email: string;
    full_name: string;
    phone: string | null;
}

interface BookingRow {
    id: string;
    booking_number: string;
    status: string;
}

export interface TimeSlot {
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
    available: boolean;
    reason?: 'booked' | 'blocked' | 'closed' | 'past';
    capacity: number;
    remainingCapacity: number;
}

export interface ServiceItemSettings {
    operatingDays: string[];
    startTime: string;
    endTime: string;
    slotInterval: number;
    blockedDates: Array<string | { date: string; startTime?: string; endTime?: string }>;
    customHours?: Record<string, { startTime: string; endTime: string; enabled: boolean }>;
    minPlayers: number;
    maxPlayers: number;
}

// --- Zod Schemas ---

export const BookingSchema = z.object({
    serviceItemId: z.string().uuid(),
    venueId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
    customer: z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().min(10),
    }),
    partySize: z.number().min(1),
    totalPrice: z.number().min(0),
});

export type CreateBookingInput = z.infer<typeof BookingSchema>;

// --- Booking Engine ---

export class BookingEngine {

    /**
     * @deprecated Use BookingService.getAvailability instead. This method calculates availability on the fly and ignores database-managed time slots.
     */
    static async getAvailability(
        serviceItemId: string,
        date: string
    ): Promise<TimeSlot[]> {
        console.warn('BookingEngine.getAvailability is deprecated. Use BookingService.getAvailability instead.');
        console.log(`[BookingEngine] Checking availability for ${serviceItemId} on ${date}`);

        // 1. Fetch Service Item Details & Settings
        const { data: rawServiceItem, error: serviceError } = await supabase
            .from('games')
            .select('*')
            .eq('id', serviceItemId)
            .single();

        if (serviceError || !rawServiceItem) {
            console.error('[BookingEngine] Error fetching service item:', serviceError);
            throw new Error('Service item not found');
        }

        const serviceItem = rawServiceItem as unknown as GameRow;

        // Parse settings
        const settings = (serviceItem.settings || {}) as ServiceItemSettings;
        const duration = serviceItem.duration_minutes || 60;
        const minPlayers = serviceItem.min_players || 1;
        const maxPlayers = serviceItem.max_players || 10;

        // Defaults if settings are missing
        const operatingDays = settings.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const defaultStart = settings.startTime || '09:00';
        const defaultEnd = settings.endTime || '17:00';
        const slotInterval = settings.slotInterval || duration; // Default to duration if interval not set

        // 2. Check if open on this day
        const dateObj = new Date(date + 'T00:00:00');
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

        if (!operatingDays.includes(dayName)) {
            console.log(`[BookingEngine] Closed on ${dayName}`);
            return []; // Closed today
        }

        // 3. Determine Operating Hours for this specific date
        let openTime = defaultStart;
        let closeTime = defaultEnd;

        // Check for custom hours override
        if (settings.customHours && settings.customHours[dayName]) {
            const custom = settings.customHours[dayName];
            if (custom.enabled) {
                openTime = custom.startTime;
                closeTime = custom.endTime;
            } else {
                return []; // Explicitly closed
            }
        }

        // 4. Fetch Existing Bookings
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('start_time, end_time, party_size, status')
            .eq('game_id', serviceItemId)
            .eq('booking_date', date)
            .neq('status', 'cancelled'); // Ignore canceled bookings

        if (bookingsError) {
            console.error('[BookingEngine] Error fetching bookings:', bookingsError);
            throw new Error('Failed to fetch existing bookings');
        }

        // 5. Generate Slots
        const slots: TimeSlot[] = [];
        let currentMinutes = this.timeToMinutes(openTime);
        const closeMinutes = this.timeToMinutes(closeTime);

        while (currentMinutes + duration <= closeMinutes) {
            const startStr = this.minutesToTime(currentMinutes);
            const endMinutes = currentMinutes + duration;
            const endStr = this.minutesToTime(endMinutes);

            // Check availability
            const slotStatus = this.checkSlotAvailability(
                startStr,
                endStr,
                date,
                bookings || [],
                settings.blockedDates || [],
                maxPlayers
            );

            slots.push({
                startTime: startStr,
                endTime: endStr,
                available: slotStatus.available,
                reason: slotStatus.reason,
                capacity: maxPlayers,
                remainingCapacity: slotStatus.remainingCapacity
            });

            currentMinutes += slotInterval;
        }

        return slots;
    }

    /**
     * @deprecated Use BookingService.createBooking instead. This method does not handle Stripe payments or time slot reservations correctly.
     */
    static async createBooking(input: CreateBookingInput) {
        console.warn('BookingEngine.createBooking is deprecated. Use BookingService.createBooking instead.');
        // Validate input
        const validated = BookingSchema.parse(input);

        // 1. Final Availability Check (Race Condition Prevention)
        // We re-fetch availability for this specific slot
        const slots = await this.getAvailability(validated.serviceItemId, validated.date);
        const targetSlot = slots.find(s => s.startTime === validated.startTime);

        if (!targetSlot) {
            throw new Error('Invalid time slot');
        }

        if (!targetSlot.available) {
            throw new Error('Slot is no longer available');
        }

        if (targetSlot.remainingCapacity < validated.partySize) {
            throw new Error(`Not enough capacity. Remaining: ${targetSlot.remainingCapacity}`);
        }

        // 2. Create Customer (if needed) - simplified for now
        // In a real app, we'd lookup by email or auth ID
        const normalizedEmail = validated.customer.email.toLowerCase().trim();

        const { data: rawCustomer, error: customerError } = await supabase
            .from('customers')
            .select('id')
            .eq('email', normalizedEmail)
            .single();

        let customerId = (rawCustomer as any)?.id;

        // Fetch organization_id from service item
        const { data: rawServiceItem } = await supabase
            .from('games')
            .select('organization_id')
            .eq('id', validated.serviceItemId)
            .single();

        if (!rawServiceItem) throw new Error('Service item not found');
        const serviceItem = rawServiceItem as unknown as GameRow;
        const organizationId = serviceItem.organization_id;

        if (!customerId) {
            const { data: newCustomer, error: createError } = await supabase
                .from('customers')
                .insert({
                    organization_id: organizationId,
                    full_name: `${validated.customer.firstName} ${validated.customer.lastName}`,
                    email: normalizedEmail,
                    phone: validated.customer.phone,
                    total_bookings: 0,
                    total_spent: 0,
                    segment: 'new'
                } as any) // Cast to any to bypass strict type checks
                .select()
                .single();

            if (createError) {
                console.error('Customer creation error:', createError);
                throw new Error('Failed to create customer record');
            }
            customerId = (newCustomer as unknown as CustomerRow).id;
        }

        // 3. Insert Booking
        const bookingNumber = `BK-${Date.now().toString().slice(-6)}`;

        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                organization_id: organizationId,
                booking_number: bookingNumber,
                game_id: validated.serviceItemId,
                customer_id: customerId,
                booking_date: validated.date,
                start_time: validated.startTime,
                end_time: validated.endTime,
                party_size: validated.partySize,
                total_amount: validated.totalPrice,
                final_amount: validated.totalPrice,
                status: 'confirmed', // Default to confirmed for MVP
                payment_status: 'pending', // Handle payment later
                created_by: 'system' // or user id if available
            } as any) // Cast to any to bypass strict type checks
            .select()
            .single();

        if (bookingError) {
            console.error('[BookingEngine] Booking insertion failed:', bookingError);
            throw new Error('Failed to create booking record');
        }

        return booking as unknown as BookingRow;
    }

    // --- Helpers ---

    private static checkSlotAvailability(
        startTime: string,
        endTime: string,
        date: string,
        bookings: any[],
        blockedDates: any[],
        maxCapacity: number
    ): { available: boolean; reason?: TimeSlot['reason']; remainingCapacity: number } {

        // 1. Check Blocked Dates
        // Handle both full day strings "YYYY-MM-DD" and objects { date, startTime, endTime }
        const isBlocked = blockedDates.some(block => {
            if (typeof block === 'string') {
                return block === date; // Full day block
            } else {
                if (block.date !== date) return false;
                // Partial day block check
                // If block overlaps with slot
                return (
                    (block.startTime && block.startTime < endTime) &&
                    (block.endTime && block.endTime > startTime)
                );
            }
        });

        if (isBlocked) {
            return { available: false, reason: 'blocked', remainingCapacity: 0 };
        }

        // 2. Check Past Time
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        if (date < todayStr) {
            return { available: false, reason: 'past', remainingCapacity: 0 };
        }

        if (date === todayStr) {
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const slotStartMinutes = this.timeToMinutes(startTime);

            // Add a small buffer (e.g., 15 mins) to prevent booking immediately starting slots if desired
            // For now, strict check: if slot start time is less than current time, it's past.
            if (slotStartMinutes < currentMinutes) {
                return { available: false, reason: 'past', remainingCapacity: 0 };
            }
        }

        // 3. Check Capacity against Bookings
        // Find overlapping bookings
        const overlappingBookings = bookings.filter(b =>
            b.start_time < endTime && b.end_time > startTime
        );

        const bookedCount = overlappingBookings.reduce((sum, b) => sum + (b.party_size || 0), 0);
        const remaining = maxCapacity - bookedCount;

        if (remaining <= 0) {
            return { available: false, reason: 'booked', remainingCapacity: 0 };
        }

        return { available: true, remainingCapacity: remaining };
    }

    private static timeToMinutes(time: string): number {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    }

    private static minutesToTime(minutes: number): string {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }
}
