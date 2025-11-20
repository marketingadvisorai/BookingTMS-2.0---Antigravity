/**
 * Payments Database Hook
 * Manages payment transactions with real-time sync
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export interface Payment {
  id: string;
  booking_id: string;
  customer_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'online' | 'bank_transfer' | 'other';
  transaction_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_date?: string;
  refund_amount: number;
  refund_date?: string;
  notes?: string;
  metadata: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function usePayments(bookingId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (bookingId) {
        query = query.eq('booking_id', bookingId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setPayments(data || []);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.message);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  // Create payment
  const createPayment = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'refund_amount'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: insertError } = await supabase
        .from('payments')
        .insert([{
          ...paymentData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success('Payment recorded successfully!');
      await fetchPayments(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error creating payment:', err);
      toast.error(err.message || 'Failed to record payment');
      throw err;
    }
  };

  // Update payment
  const updatePayment = async (id: string, updates: Partial<Payment>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      toast.success('Payment updated successfully!');
      await fetchPayments(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error updating payment:', err);
      toast.error(err.message || 'Failed to update payment');
      throw err;
    }
  };

  // Process refund
  const processRefund = async (id: string, refundAmount: number, reason?: string) => {
    try {
      const { data, error: refundError } = await supabase
        .from('payments')
        .update({
          status: 'refunded',
          refund_amount: refundAmount,
          refund_date: new Date().toISOString(),
          notes: reason || 'Refund processed',
        })
        .eq('id', id)
        .select()
        .single();

      if (refundError) throw refundError;

      toast.success('Refund processed successfully!');
      await fetchPayments(); // Refresh list
      return data;
    } catch (err: any) {
      console.error('Error processing refund:', err);
      toast.error(err.message || 'Failed to process refund');
      throw err;
    }
  };

  // Get payment by ID
  const getPaymentById = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return data;
    } catch (err: any) {
      console.error('Error fetching payment:', err);
      toast.error('Failed to load payment details');
      throw err;
    }
  };

  // Get payments by booking
  const getPaymentsByBooking = async (bookingId: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return data || [];
    } catch (err: any) {
      console.error('Error fetching payments by booking:', err);
      return [];
    }
  };

  // Real-time subscription
  useEffect(() => {
    fetchPayments();

    // Subscribe to payment changes
    const subscription = supabase
      .channel('payments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          console.log('Payment changed:', payload);
          fetchPayments(); // Refresh on any change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [bookingId]);

  return {
    payments,
    loading,
    error,
    createPayment,
    updatePayment,
    processRefund,
    getPaymentById,
    getPaymentsByBooking,
    refreshPayments: fetchPayments,
  };
}
