import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BookingEngine, TimeSlot } from '../lib/booking-engine';
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
        const { data, error } = await supabase.from('games').select('id, name');
        if (data) setServiceItems(data);
    };

    const checkAvailability = async () => {
        if (!selectedServiceId) return;
        setLoading(true);
        try {
            const availableSlots = await BookingEngine.getAvailability(selectedServiceId, selectedDate);
            setSlots(availableSlots);
            toast.success(`Found ${availableSlots.length} slots`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (slot: TimeSlot) => {
        if (!confirm(`Book ${slot.startTime}?`)) return;

        setLoading(true);
        try {
            const booking = await BookingEngine.createBooking({
                serviceItemId: selectedServiceId,
                venueId: '00000000-0000-0000-0000-000000000000', // Replace with actual venue ID if needed, or fetch from service item
                date: selectedDate,
                startTime: slot.startTime,
                endTime: slot.endTime,
                partySize: 2,
                totalPrice: 100,
                customer: {
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    phone: '1234567890'
                }
            });
            setBookingResult(booking);
            toast.success('Booking created!');
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
            <h1 className="text-2xl font-bold">Booking Engine Verification</h1>

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
                        <CardTitle>Available Slots</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            {slots.map((slot, i) => (
                                <div key={i} className={`p-4 border rounded flex flex-col gap-2 ${slot.available ? 'bg-green-50 border-green-200' : 'bg-gray-50 opacity-50'}`}>
                                    <div className="font-bold">{slot.startTime} - {slot.endTime}</div>
                                    <div className="text-sm">Capacity: {slot.remainingCapacity}</div>
                                    {slot.available ? (
                                        <Button size="sm" onClick={() => handleBook(slot)}>Book</Button>
                                    ) : (
                                        <span className="text-red-500 text-sm">{slot.reason}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {bookingResult && (
                <Card className="bg-green-50 border-green-200">
                    <CardHeader><CardTitle>Booking Success</CardTitle></CardHeader>
                    <CardContent>
                        <pre className="text-xs overflow-auto">{JSON.stringify(bookingResult, null, 2)}</pre>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
