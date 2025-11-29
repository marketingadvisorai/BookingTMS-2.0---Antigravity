/**
 * QR Check-in Edge Function
 * 
 * Processes QR code scans for booking check-in/check-out.
 * Validates signature and updates booking status.
 * 
 * @param bookingId - The booking ID from QR code
 * @param signature - HMAC signature for validation
 * @param action - 'check_in' or 'check_out'
 * @param scannedBy - User ID who performed the scan (optional)
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const QR_SECRET = Deno.env.get('QR_SECRET') || 'booking-tms-qr-secret-key-2025'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CheckInRequest {
  bookingId: string
  signature: string
  action: 'check_in' | 'check_out'
  scannedBy?: string
}

// Generate HMAC signature for verification
async function generateSignature(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(QR_SECRET)
  const messageData = encoder.encode(data)
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { bookingId, signature, action, scannedBy }: CheckInRequest = await req.json()

    // Validate required fields
    if (!bookingId || !signature || !action) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: bookingId, signature, action' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!['check_in', 'check_out'].includes(action)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid action. Must be check_in or check_out' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch booking with related data
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(`
        id,
        confirmation_code,
        booking_date,
        start_time,
        group_size,
        status,
        check_in_time,
        check_out_time,
        customer:customers(id, email, first_name, last_name),
        activity:activities(name),
        venue:venues(name)
      `)
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) {
      console.error('Booking not found:', fetchError)
      return new Response(
        JSON.stringify({ success: false, error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify signature
    const customerEmail = (booking.customer as any)?.email || ''
    const dataToVerify = `${bookingId}:${booking.confirmation_code}:${customerEmail}:${booking.booking_date}`
    const expectedSignature = await generateSignature(dataToVerify)
    
    if (signature !== expectedSignature) {
      console.error('Invalid signature')
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid QR code signature' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check booking status
    if (booking.status === 'cancelled') {
      return new Response(
        JSON.stringify({ success: false, error: 'This booking has been cancelled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date().toISOString()
    let updateData: Record<string, any> = {}
    let message = ''

    if (action === 'check_in') {
      // Check if already checked in
      if (booking.check_in_time) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Already checked in',
            alreadyCheckedIn: true,
            booking: {
              id: booking.id,
              confirmationCode: booking.confirmation_code,
              customer: `${(booking.customer as any)?.first_name || ''} ${(booking.customer as any)?.last_name || ''}`.trim(),
              activityName: (booking.activity as any)?.name || 'Activity',
              date: booking.booking_date,
              time: booking.start_time,
              groupSize: booking.group_size,
              checkInTime: booking.check_in_time,
              status: booking.status
            }
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      updateData = {
        check_in_time: now,
        status: 'checked_in',
        metadata: {
          ...(booking as any).metadata,
          checked_in_by: scannedBy || 'qr_scan',
          check_in_method: 'qr_code'
        }
      }
      message = 'Check-in successful!'

    } else if (action === 'check_out') {
      // Check if checked in first
      if (!booking.check_in_time) {
        return new Response(
          JSON.stringify({ success: false, error: 'Must check in before checking out' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if already checked out
      if (booking.check_out_time) {
        return new Response(
          JSON.stringify({ success: false, error: 'Already checked out' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      updateData = {
        check_out_time: now,
        status: 'completed',
        metadata: {
          ...(booking as any).metadata,
          checked_out_by: scannedBy || 'qr_scan',
          check_out_method: 'qr_code'
        }
      }
      message = 'Check-out successful!'
    }

    // Update booking
    const { error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)

    if (updateError) {
      console.error('Update error:', updateError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to update booking' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`${action} successful for booking ${bookingId}`)

    return new Response(
      JSON.stringify({
        success: true,
        message,
        booking: {
          id: booking.id,
          confirmationCode: booking.confirmation_code,
          customer: `${(booking.customer as any)?.first_name || ''} ${(booking.customer as any)?.last_name || ''}`.trim(),
          activityName: (booking.activity as any)?.name || 'Activity',
          venueName: (booking.venue as any)?.name || 'Venue',
          date: booking.booking_date,
          time: booking.start_time,
          groupSize: booking.group_size,
          checkInTime: action === 'check_in' ? now : booking.check_in_time,
          checkOutTime: action === 'check_out' ? now : booking.check_out_time,
          status: action === 'check_in' ? 'checked_in' : 'completed'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('QR check-in error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
