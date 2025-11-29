/**
 * Organizations Components - Barrel Export
 * 
 * This file exports all organization-related components for clean imports.
 * 
 * @example
 * // Instead of:
 * import { StatCard } from '../features/organizations/components/StatCard';
 * import { OrganizationCard } from '../features/organizations/components/OrganizationCard';
 * 
 * // Use:
 * import { StatCard, OrganizationCard } from '../features/organizations/components';
 */

// Page-level components
export { OrganizationsHeader } from './OrganizationsHeader';
export { OrganizationsFilters } from './OrganizationsFilters';
export { OrganizationsEmptyState } from './OrganizationsEmptyState';
export { OrganizationsErrorCard } from './OrganizationsErrorCard';

// Data display components
export { StatCard } from './StatCard';
export { OrganizationCard } from './OrganizationCard';
export { OrganizationsTable } from './OrganizationsTable';
export { OrganizationsLoadingSkeleton } from './OrganizationsLoadingSkeleton';

// Config
export { statusConfig } from './statusConfig';
