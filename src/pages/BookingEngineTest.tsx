import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BookingService } from '../services/booking.service';
import { SessionService, Session } from '../services/session.service';
import { supabase } from '../lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function BookingEngineTest() {
    const [serviceItems, setServiceItems] = useState<any[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);
    const [bookingResult, setBookingResult] = useState<any>(null);

    useEffect(() => {
        fetchServiceItems();
    }, []);

    const fetchServiceItems = async () => {
        const { data, error } = await supabase.from('activities').select('id, name, venue_id');
        if (data) setServiceItems(data);
    };

    const checkAvailability = async () => {
        if (!selectedServiceId) return;
        setLoading(true);
        try {
            const startDate = new Date(selectedDate);
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);

            const availableSessions = await SessionService.listAvailableSessions(selectedServiceId, startDate, endDate);
            setSessions(availableSessions);
            toast.success(`Found ${availableSessions.length} sessions`);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Realtime Subscription
    useEffect(() => {
        if (!selectedServiceId) return;

        const channel = supabase
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'activity_sessions',
                    filter: `activity_id=eq.${selectedServiceId}`
                },
                (payload) => {
                    console.log('Realtime update:', payload);
                    const updatedSession = payload.new as Session;
                    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
                    toast.info('Session capacity updated!');
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedServiceId]);

    const [useSecureFlow, setUseSecureFlow] = useState(false);

    const handleBook = async (session: Session) => {
        const startTimeStr = format(new Date(session.start_time), 'HH:mm');
        if (!confirm(`Book ${startTimeStr}?`)) return;

        const selectedItem = serviceItems.find(i => i.id === selectedServiceId);
        if (!selectedItem?.venue_id) {
            toast.error('Venue ID missing for this service item');
            return;
        }

        setLoading(true);
        try {
            let result;
            const customerDetails = {
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                phone: '1234567890'
            };

            if (useSecureFlow) {
                // Use Edge Function + Stripe
                const { clientSecret, bookingId } = await BookingService.initiateBooking({
                    sessionId: session.id,
                    activityId: selectedServiceId,
                    organizationId: selectedItem.organization_id || '64fa1946-3cdd-43af-b7de-cc4708cd4b80', // Fallback if not loaded
                    partySize: 2,
                    customerDetails: {
                        name: `${customerDetails.firstName} ${customerDetails.lastName}`,
                        email: customerDetails.email,
                        phone: customerDetails.phone
                    }
                });
                result = { success: true, bookingId, clientSecret, message: 'Payment Intent Created. Ready for Stripe Elements.' };
            } else {
                // Use Direct RPC (Internal/Admin)
                result = await BookingService.createBooking({
                    sessionId: session.id,
                    venueId: selectedItem.venue_id,
                    activityId: selectedServiceId,
                    partySize: 2,
                    customer: customerDetails
                });
            }

            setBookingResult(result);
            toast.success(useSecureFlow ? 'Payment Initiated!' : 'Booking confirmed!');

            if (!useSecureFlow) checkAvailability(); // Refresh sessions immediately for direct booking
        } catch (error: any) {
            console.error(error);
            toast.error(error.message);
            setBookingResult({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Booking Engine Verification (v3 - Sessions)</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Test Parameters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>Activity</Label>
                        <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Activity" />
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

            {sessions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Available Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            {sessions.map((session, i) => (
                                <div key={i} className={`p-4 border rounded flex flex-col gap-2 ${!session.is_closed && session.capacity_remaining > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 opacity-50'}`}>
                                    <div className="font-bold">
                                        {format(new Date(session.start_time), 'HH:mm')} - {format(new Date(session.end_time), 'HH:mm')}
                                    </div>
                                    <div className="text-sm">Capacity: {session.capacity_remaining} / {session.capacity_total}</div>
                                    <div className="text-sm font-semibold">${session.price_at_generation}</div>
                                    {!session.is_closed && session.capacity_remaining > 0 ? (
                                        <Button size="sm" onClick={() => handleBook(session)}>Book</Button>
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
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
