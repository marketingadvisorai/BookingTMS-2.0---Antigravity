import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Loader2, Calendar, User, Mail, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

interface BookingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    serviceItemId: string | null;
    serviceItemName: string;
}

interface Booking {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
    total_amount: number;
    participants_count: number;
}

export default function BookingsDialog({ isOpen, onClose, serviceItemId, serviceItemName }: BookingsDialogProps) {
    const { data: bookings, isLoading, error } = useQuery({
        queryKey: ['bookings', serviceItemId],
        queryFn: async () => {
            if (!serviceItemId) return [];

            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .eq('game_id', serviceItemId) // Assuming 'game_id' is the foreign key for service items
                .order('booking_date', { ascending: false });

            if (error) throw error;
            return data as Booking[];
        },
        enabled: !!serviceItemId && isOpen,
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Confirmed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" /> Cancelled</Badge>;
            case 'completed':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Bookings for {serviceItemName}</DialogTitle>
                    <DialogDescription>
                        View all bookings associated with this service item.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden mt-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 p-4">
                            Failed to load bookings. Please try again.
                        </div>
                    ) : bookings && bookings.length > 0 ? (
                        <ScrollArea className="h-[50vh]">
                            <div className="space-y-4 pr-4">
                                {bookings.map((booking) => (
                                    <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-500" />
                                                <span className="font-medium">{booking.customer_name || 'Guest'}</span>
                                            </div>
                                            {getStatusBadge(booking.status)}
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mt-3">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span>{format(new Date(booking.booking_date), 'MMM d, yyyy')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span>{booking.start_time} - {booking.end_time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <span>{booking.customer_email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <span>{booking.customer_phone || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Participants: {booking.participants_count}</span>
                                            <span className="font-semibold">${booking.total_amount}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No bookings found for this service item.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
