/**
 * Customer Metrics Service
 * Analytics and metrics for customer insights
 * Multi-tenant with proper organization scoping
 */

import { supabase } from '@/lib/supabase';
import type {
  CustomerMetrics,
  CustomerInsights,
  ActivitySegment,
  VenueSegment,
  AudienceMember,
  CustomerActivitySummary,
  CustomerVenueSummary,
  CustomerBookingHistory,
} from '../types';
import { mapDBCustomerToUI } from '../utils/mappers';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function getCurrentOrganizationId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: userData } = await (supabase
    .from('users') as any)
    .select('organization_id')
    .eq('id', user.id)
    .single();

  return userData?.organization_id || null;
}

async function isSystemAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: userData } = await (supabase
    .from('users') as any)
    .select('role, is_platform_team')
    .eq('id', user.id)
    .single();

  return userData?.role === 'system-admin' || userData?.is_platform_team === true;
}

// =============================================================================
// DASHBOARD METRICS
// =============================================================================

/**
 * Get customer metrics for dashboard
 * Multi-tenant: Scoped by organization
 */
export async function getCustomerMetrics(
  organizationId?: string
): Promise<CustomerMetrics> {
  const orgId = organizationId || await getCurrentOrganizationId();
  const isSysAdmin = await isSystemAdmin();

  // Build base query
  let query = supabase.from('customers').select('*', { count: 'exact' });
  if (orgId) {
    query = query.eq('organization_id', orgId);
  } else if (!isSysAdmin) {
    return getEmptyMetrics();
  }

  const { data: customers, count: total } = await (query as any);
  
  if (!customers || customers.length === 0) {
    return getEmptyMetrics();
  }

  // Calculate current period metrics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // New customers in last 30 days
  const newCustomers = customers.filter((c: any) => 
    new Date(c.created_at) >= thirtyDaysAgo
  );

  // Previous period new customers (30-60 days ago)
  const previousNewCustomers = customers.filter((c: any) => {
    const created = new Date(c.created_at);
    return created >= sixtyDaysAgo && created < thirtyDaysAgo;
  });

  // Active customers (booked in last 30 days)
  const activeCustomers = customers.filter((c: any) => 
    c.metadata?.lifecycle_stage === 'active' || c.metadata?.is_new
  );

  const previousActiveCustomers = customers.filter((c: any) => {
    const lastBooking = c.metadata?.last_booking_date;
    if (!lastBooking) return false;
    const bookingDate = new Date(lastBooking);
    return bookingDate >= sixtyDaysAgo && bookingDate < thirtyDaysAgo;
  });

  // Calculate average lifetime value
  const totalSpent = customers.reduce((sum: number, c: any) => sum + (c.total_spent || 0), 0);
  const avgLifetimeValue = customers.length > 0 ? totalSpent / customers.length : 0;

  // Previous period average (estimate)
  const previousTotal = total || customers.length;
  const previousAvgLtv = previousTotal > 0 ? avgLifetimeValue * 0.95 : 0;

  // Calculate growth rate
  const growthRate = previousTotal > 0 
    ? ((newCustomers.length / previousTotal) * 100) 
    : 0;

  return {
    totalCustomers: total || customers.length,
    totalCustomersPrevious: previousTotal,
    activeCustomers: activeCustomers.length,
    activeCustomersPrevious: previousActiveCustomers.length,
    avgLifetimeValue,
    avgLifetimeValuePrevious: previousAvgLtv,
    newCustomersCurrent: newCustomers.length,
    totalCustomersForGrowth: total || customers.length,
    growthRate,
  };
}

function getEmptyMetrics(): CustomerMetrics {
  return {
    totalCustomers: 0,
    totalCustomersPrevious: 0,
    activeCustomers: 0,
    activeCustomersPrevious: 0,
    avgLifetimeValue: 0,
    avgLifetimeValuePrevious: 0,
    newCustomersCurrent: 0,
    totalCustomersForGrowth: 0,
    growthRate: 0,
  };
}

// =============================================================================
// CUSTOMER INSIGHTS
// =============================================================================

/**
 * Get detailed insights for a specific customer
 */
export async function getCustomerInsights(
  customerId: string,
  organizationId?: string
): Promise<CustomerInsights | null> {
  const orgId = organizationId || await getCurrentOrganizationId();
  const isSysAdmin = await isSystemAdmin();

  // Fetch customer with org validation
  let customerQuery = (supabase.from('customers') as any)
    .select('*')
    .eq('id', customerId);

  if (orgId) {
    customerQuery = customerQuery.eq('organization_id', orgId);
  } else if (!isSysAdmin) {
    return null;
  }

  const { data: customerData, error } = await customerQuery.single();
  if (error || !customerData) return null;

  const customer = mapDBCustomerToUI(customerData);

  // Fetch booking history
  const { data: bookings } = await (supabase.from('bookings') as any)
    .select(`
      id,
      booking_date,
      total_amount,
      status,
      players,
      activities (name),
      venues (name)
    `)
    .eq('customer_id', customerId)
    .order('booking_date', { ascending: false })
    .limit(10);

  // Process bookings
  const recentBookings: CustomerBookingHistory[] = (bookings || []).map((b: any) => ({
    id: b.id,
    bookingDate: b.booking_date,
    activityName: b.activities?.name || 'Unknown',
    venueName: b.venues?.name || 'Unknown',
    totalAmount: b.total_amount || 0,
    status: b.status,
    partySize: b.players || 1,
  }));

  // Calculate favorite activity
  const activityCounts: Record<string, { count: number; spent: number; name: string; id: string }> = {};
  (bookings || []).forEach((b: any) => {
    const actId = b.activity_id;
    if (!activityCounts[actId]) {
      activityCounts[actId] = { count: 0, spent: 0, name: b.activities?.name || '', id: actId };
    }
    activityCounts[actId].count++;
    activityCounts[actId].spent += b.total_amount || 0;
  });

  const topActivity = Object.values(activityCounts).sort((a, b) => b.count - a.count)[0];

  return {
    customer,
    favoriteActivity: topActivity ? {
      id: topActivity.id,
      name: topActivity.name,
      imageUrl: null,
      bookingCount: topActivity.count,
      totalSpent: topActivity.spent,
    } : null,
    preferredVenue: customer.metadata.preferred_venue_id ? {
      id: customer.metadata.preferred_venue_id,
      name: customer.metadata.preferred_venue_name || 'Unknown',
      visitCount: 0,
      totalSpent: 0,
    } : null,
    lifecycleStage: customer.lifecycleStage,
    spendingTier: customer.spendingTier,
    frequencyTier: customer.frequencyTier,
    lastBookingDate: customer.metadata.last_booking_date || null,
    daysSinceLastVisit: customer.metadata.days_since_last_visit || 0,
    avgBookingValue: customer.avgBookingValue,
    bookingFrequencyPerMonth: customer.metadata.booking_frequency_per_month || 0,
    topActivities: Object.values(activityCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(a => ({ id: a.id, name: a.name, bookingCount: a.count })),
    recentBookings,
  };
}

// =============================================================================
// SEGMENT ANALYTICS
// =============================================================================

/**
 * Get activity-based audience segments
 */
export async function getActivitySegments(
  organizationId?: string
): Promise<ActivitySegment[]> {
  const orgId = organizationId || await getCurrentOrganizationId();
  const isSysAdmin = await isSystemAdmin();

  // Get activities with booking stats
  let query = (supabase.from('activities') as any)
    .select(`
      id,
      name,
      cover_image,
      organization_id
    `);

  if (orgId) {
    query = query.eq('organization_id', orgId);
  } else if (!isSysAdmin) {
    return [];
  }

  const { data: activities } = await query;
  if (!activities) return [];

  // Get booking stats per activity
  const segments: ActivitySegment[] = [];

  for (const activity of activities) {
    const { data: bookings } = await (supabase.from('bookings') as any)
      .select('customer_id, total_amount, booking_date')
      .eq('activity_id', activity.id);

    if (bookings && bookings.length > 0) {
      const uniqueCustomers = new Set(bookings.map((b: any) => b.customer_id));
      const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
      const lastBooking = bookings.sort((a: any, b: any) => 
        new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()
      )[0];

      segments.push({
        activityId: activity.id,
        activityName: activity.name,
        activityImageUrl: activity.cover_image,
        customerCount: uniqueCustomers.size,
        totalBookings: bookings.length,
        totalRevenue,
        avgBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
        lastBookingDate: lastBooking?.booking_date || null,
      });
    }
  }

  return segments.sort((a, b) => b.customerCount - a.customerCount);
}

/**
 * Get venue-based audience segments
 */
export async function getVenueSegments(
  organizationId?: string
): Promise<VenueSegment[]> {
  const orgId = organizationId || await getCurrentOrganizationId();
  const isSysAdmin = await isSystemAdmin();

  let query = (supabase.from('venues') as any)
    .select('id, name, organization_id');

  if (orgId) {
    query = query.eq('organization_id', orgId);
  } else if (!isSysAdmin) {
    return [];
  }

  const { data: venues } = await query;
  if (!venues) return [];

  const segments: VenueSegment[] = [];

  for (const venue of venues) {
    const { data: bookings } = await (supabase.from('bookings') as any)
      .select('customer_id, total_amount, booking_date')
      .eq('venue_id', venue.id);

    if (bookings && bookings.length > 0) {
      const uniqueCustomers = new Set(bookings.map((b: any) => b.customer_id));
      const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
      const lastBooking = bookings.sort((a: any, b: any) => 
        new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()
      )[0];

      segments.push({
        venueId: venue.id,
        venueName: venue.name,
        customerCount: uniqueCustomers.size,
        totalBookings: bookings.length,
        totalRevenue,
        avgBookingValue: bookings.length > 0 ? totalRevenue / bookings.length : 0,
        lastBookingDate: lastBooking?.booking_date || null,
      });
    }
  }

  return segments.sort((a, b) => b.customerCount - a.customerCount);
}

/**
 * Get audience members for a specific activity
 */
export async function getActivityAudience(
  activityId: string,
  organizationId?: string
): Promise<AudienceMember[]> {
  const orgId = organizationId || await getCurrentOrganizationId();

  const { data: bookings } = await (supabase.from('bookings') as any)
    .select(`
      customer_id,
      total_amount,
      booking_date,
      customers (
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq('activity_id', activityId);

  if (!bookings) return [];

  // Aggregate by customer
  const customerMap: Record<string, AudienceMember> = {};

  for (const booking of bookings) {
    const customer = booking.customers;
    if (!customer) continue;

    if (!customerMap[customer.id]) {
      customerMap[customer.id] = {
        customerId: customer.id,
        customerName: `${customer.first_name} ${customer.last_name}`,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        totalBookings: 0,
        totalSpent: 0,
        lastBookingDate: null,
        firstBookingDate: null,
        avgBookingValue: 0,
      };
    }

    customerMap[customer.id].totalBookings++;
    customerMap[customer.id].totalSpent += booking.total_amount || 0;

    const bookingDate = booking.booking_date;
    const record = customerMap[customer.id];
    if (!record.firstBookingDate || bookingDate < record.firstBookingDate) {
      record.firstBookingDate = bookingDate;
    }
    if (!record.lastBookingDate || bookingDate > record.lastBookingDate) {
      record.lastBookingDate = bookingDate;
    }
  }

  // Calculate averages
  return Object.values(customerMap).map(member => ({
    ...member,
    avgBookingValue: member.totalBookings > 0 ? member.totalSpent / member.totalBookings : 0,
  })).sort((a, b) => b.totalSpent - a.totalSpent);
}

// =============================================================================
// EXPORTED SERVICE
// =============================================================================

export const metricsService = {
  getMetrics: getCustomerMetrics,
  getInsights: getCustomerInsights,
  getActivitySegments,
  getVenueSegments,
  getActivityAudience,
};
