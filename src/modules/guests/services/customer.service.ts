/**
 * Customer Service
 * Multi-tenant customer CRUD operations
 * Follows enterprise patterns with proper organization scoping
 */

import { supabase } from '@/lib/supabase';
import type {
  DBCustomer,
  Customer,
  CustomerCreateInput,
  CustomerUpdateInput,
  CustomerFilters,
  PaginatedResponse,
  ServiceResponse,
} from '../types';
import { 
  mapDBCustomerToUI, 
  mapDBCustomersToUI, 
  mapCreateInputToDB,
  mapUpdateInputToDB,
} from '../utils/mappers';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get current user's organization ID
 */
async function getCurrentOrganizationId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: userData } = await (supabase
    .from('users') as any)
    .select('organization_id, role')
    .eq('id', user.id)
    .single();

  // System admins might not have an org_id - they can access all
  return userData?.organization_id || null;
}

/**
 * Check if current user is system admin
 */
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
// READ OPERATIONS
// =============================================================================

/**
 * List customers with filters and pagination
 * Multi-tenant: Filters by organization_id unless system admin
 */
export async function listCustomers(
  filters: CustomerFilters = {},
  organizationId?: string
): Promise<PaginatedResponse<Customer>> {
  const {
    search,
    status,
    lifecycleStage,
    spendingTier,
    page = 1,
    limit = 25,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  // Determine organization scope
  const orgId = organizationId || await getCurrentOrganizationId();
  const isSysAdmin = await isSystemAdmin();

  // Build query
  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' });

  // Multi-tenant: Always filter by org unless system admin with no org specified
  if (orgId) {
    query = query.eq('organization_id', orgId);
  } else if (!isSysAdmin) {
    // Non-system admin without org = no access
    return { data: [], total: 0, page, limit, hasMore: false };
  }

  // Apply search filter
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  // Apply status filter
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  // Apply lifecycle stage filter via metadata
  if (lifecycleStage && lifecycleStage !== 'all') {
    query = query.contains('metadata', { lifecycle_stage: lifecycleStage });
  }

  // Apply spending tier filter via metadata
  if (spendingTier && spendingTier !== 'all') {
    query = query.contains('metadata', { spending_tier: spendingTier });
  }

  // Sorting
  const sortColumn = sortBy === 'name' ? 'first_name' : 
                     sortBy === 'lastBooking' ? 'updated_at' : 
                     sortBy === 'createdAt' ? 'created_at' :
                     sortBy === 'totalSpent' ? 'total_spent' :
                     sortBy === 'totalBookings' ? 'total_bookings' : 'created_at';
  
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching customers:', error);
    return { data: [], total: 0, page, limit, hasMore: false };
  }

  const customers = mapDBCustomersToUI((data || []) as DBCustomer[]);
  const total = count || 0;

  return {
    data: customers,
    total,
    page,
    limit,
    hasMore: from + customers.length < total,
  };
}

/**
 * Get customer by ID
 * Multi-tenant: Validates organization access
 */
export async function getCustomerById(
  customerId: string,
  organizationId?: string
): Promise<ServiceResponse<Customer>> {
  const orgId = organizationId || await getCurrentOrganizationId();
  const isSysAdmin = await isSystemAdmin();

  let query = supabase
    .from('customers')
    .select('*')
    .eq('id', customerId);

  // Multi-tenant: Filter by org unless system admin
  if (orgId) {
    query = query.eq('organization_id', orgId);
  } else if (!isSysAdmin) {
    return { success: false, error: 'Unauthorized access' };
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return { success: false, error: 'Customer not found' };
  }

  return { 
    success: true, 
    data: mapDBCustomerToUI(data as DBCustomer) 
  };
}

/**
 * Search customers by email, name, or phone
 */
export async function searchCustomers(
  searchTerm: string,
  organizationId?: string,
  limit = 10
): Promise<Customer[]> {
  const orgId = organizationId || await getCurrentOrganizationId();
  const isSysAdmin = await isSystemAdmin();

  let query = supabase
    .from('customers')
    .select('*')
    .or(
      `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
    )
    .limit(limit);

  if (orgId) {
    query = query.eq('organization_id', orgId);
  } else if (!isSysAdmin) {
    return [];
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error searching customers:', error);
    return [];
  }

  return mapDBCustomersToUI((data || []) as DBCustomer[]);
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

/**
 * Create a new customer
 * Multi-tenant: Associates with current user's organization
 */
export async function createCustomer(
  input: CustomerCreateInput,
  organizationId?: string
): Promise<ServiceResponse<Customer>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  const orgId = organizationId || await getCurrentOrganizationId();
  if (!orgId) {
    return { success: false, error: 'Organization not found' };
  }

  // Check for duplicate email within organization
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('organization_id', orgId)
    .eq('email', input.email.toLowerCase().trim())
    .single();

  if (existing) {
    return { success: false, error: 'Customer with this email already exists' };
  }

  const dbData = mapCreateInputToDB(input, orgId, user.id);

  const { data, error } = await (supabase
    .from('customers') as any)
    .insert([dbData] as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating customer:', error);
    return { success: false, error: error.message };
  }

  return { 
    success: true, 
    data: mapDBCustomerToUI(data as DBCustomer),
    message: 'Customer created successfully'
  };
}

/**
 * Update customer
 * Multi-tenant: Validates organization access before update
 */
export async function updateCustomer(
  input: CustomerUpdateInput,
  organizationId?: string
): Promise<ServiceResponse<Customer>> {
  const orgId = organizationId || await getCurrentOrganizationId();
  const isSysAdmin = await isSystemAdmin();

  // Verify ownership
  const { data: existing } = await (supabase
    .from('customers') as any)
    .select('organization_id')
    .eq('id', input.id)
    .single();

  if (!existing) {
    return { success: false, error: 'Customer not found' };
  }

  if (orgId && existing.organization_id !== orgId && !isSysAdmin) {
    return { success: false, error: 'Unauthorized access' };
  }

  const updates = mapUpdateInputToDB(input);

  const { data, error } = await (supabase
    .from('customers') as any)
    .update(updates as any)
    .eq('id', input.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    return { success: false, error: error.message };
  }

  return { 
    success: true, 
    data: mapDBCustomerToUI(data as DBCustomer),
    message: 'Customer updated successfully'
  };
}

/**
 * Delete customer (soft delete by setting status to blocked)
 */
export async function deleteCustomer(
  customerId: string,
  organizationId?: string
): Promise<ServiceResponse<void>> {
  const orgId = organizationId || await getCurrentOrganizationId();
  const isSysAdmin = await isSystemAdmin();

  // Verify ownership
  const { data: existing } = await (supabase
    .from('customers') as any)
    .select('organization_id')
    .eq('id', customerId)
    .single();

  if (!existing) {
    return { success: false, error: 'Customer not found' };
  }

  if (orgId && existing.organization_id !== orgId && !isSysAdmin) {
    return { success: false, error: 'Unauthorized access' };
  }

  const { error } = await (supabase
    .from('customers') as any)
    .update({ status: 'blocked' } as any)
    .eq('id', customerId);

  if (error) {
    console.error('Error deleting customer:', error);
    return { success: false, error: error.message };
  }

  return { success: true, message: 'Customer deleted successfully' };
}

// =============================================================================
// EXPORTED SERVICE OBJECT
// =============================================================================

export const customerService = {
  list: listCustomers,
  getById: getCustomerById,
  search: searchCustomers,
  create: createCustomer,
  update: updateCustomer,
  delete: deleteCustomer,
};
