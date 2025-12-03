/**
 * Guest/Customer Services
 * Barrel export for all customer-related services
 */

export { customerService } from './customer.service';
export { metricsService } from './metrics.service';

// Re-export individual functions for convenience
export {
  listCustomers,
  getCustomerById,
  searchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from './customer.service';

export {
  getCustomerMetrics,
  getCustomerInsights,
  getActivitySegments,
  getVenueSegments,
  getActivityAudience,
} from './metrics.service';
