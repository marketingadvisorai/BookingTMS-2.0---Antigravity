/**
 * Organizations Module Types
 * @module organizations/types
 */

// Re-export from system-admin types
export type { Organization, CreateOrganizationDTO, UpdateOrganizationDTO } from '@/features/system-admin/types';

// Stats type
export interface OrganizationStats {
  total: number;
  active: number;
  pending: number;
  suspended: number;
}

// Status configuration type
export interface StatusConfig {
  variant: 'default' | 'secondary' | 'outline' | 'destructive';
  icon: React.ReactNode;
  className: string;
}

// View mode type
export type ViewMode = 'grid' | 'table';

// Filter state type
export interface OrganizationFilters {
  searchQuery: string;
  statusFilter: string;
  viewMode: ViewMode;
}
