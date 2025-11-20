import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BookingService, TimeSlot } from '../services/BookingService';
import { supabase } from '../lib/supabase/client';
import { toast } from 'sonner';

export default function BookingEngineTest() {
    const [serviceItems, setServiceItems] = useState<any[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState<TimeSlot[]>([]);
    const [loading, setLoading] = useState(false);
    const [bookingResult, setBookingResult] = useState<any>(null);

    useEffect(() => {
        fetchServiceItems();
    }, []);

    const fetchServiceItems = async () => {
        const { data, error } = await supabase.from('games').select('id, name, venue_id');
        if (data) setServiceItems(data);
    };

    const checkAvailability = async () => {
        if (!selectedServiceId) return;
        setLoading(true);
        try {
            const availableSlots = await BookingService.getAvailability(selectedServiceId, selectedDate);
            setSlots(availableSlots);
            toast.success(`Found ${availableSlots.length} slots`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (slot: TimeSlot) => {
        if (!confirm(`Book ${slot.start_time}?`)) return;

        const selectedItem = serviceItems.find(i => i.id === selectedServiceId);
        if (!selectedItem?.venue_id) {
            toast.error('Venue ID missing for this service item');
            return;
        }

        setLoading(true);
        try {
            const result = await BookingService.createBooking({
                venueId: selectedItem.venue_id,
                gameId: selectedServiceId,
                date: selectedDate,
                time: slot.start_time.substring(0, 5), // Ensure HH:MM format
                partySize: 2,
                customer: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    phone: '1234567890'
                },
                successUrl: window.location.origin + '/booking/success',
                cancelUrl: window.location.origin + '/booking/cancel',
            });

            setBookingResult(result);

            if (result.success && result.checkout_url) {
                toast.success('Booking initialized! Redirecting to payment...');
                // In a real app, we would redirect here:
                // window.location.href = result.checkout_url;
            } else {
                toast.error('Booking failed: ' + result.message);
            }

            checkAvailability(); // Refresh slots
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Booking Engine Verification (v2)</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Test Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Service Item</Label>
                        <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Service Item" />
                            </SelectTrigger>
                            <SelectContent>
                                {serviceItems.map(item => (
                                    <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Date</Label>
                        <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                    </div>

                    <Button onClick={checkAvailability} disabled={loading || !selectedServiceId}>
                        {loading ? 'Checking...' : 'Check Availability'}
                    </Button>
                </CardContent>
            </Card>

            {slots.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Available Slots (Database)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            {slots.map((slot, i) => (
                                <div key={i} className={`p-4 border rounded flex flex-col gap-2 ${slot.is_available ? 'bg-green-50 border-green-200' : 'bg-gray-50 opacity-50'}`}>
                                    <div className="font-bold">{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</div>
                                    <div className="text-sm">Bookings: {slot.current_bookings} / {slot.max_bookings}</div>
                                    <div className="text-sm font-semibold">${slot.final_price}</div>
                                    {slot.is_available ? (
                                        <Button size="sm" onClick={() => handleBook(slot)}>Book</Button>
                                    ) : (
                                        <span className="text-red-500 text-sm">Unavailable</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {bookingResult && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader><CardTitle>Booking Result</CardTitle></CardHeader>
                    <CardContent>
                        <pre className="text-xs overflow-auto">{JSON.stringify(bookingResult, null, 2)}</pre>
                        {bookingResult.checkout_url && (
                            <div className="mt-4">
                                <a
                                    href={bookingResult.checkout_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                >
                                    Proceed to Payment (Stripe)
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
