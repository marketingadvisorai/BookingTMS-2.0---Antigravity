/**
 * System Admin Context
 * 
 * Provides global state and React Query setup for System Admin Dashboard
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { OrganizationFilters, OrganizationSortOptions } from '../types';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// System Admin Context State
interface SystemAdminState {
  // Filters
  organizationFilters: OrganizationFilters;
  setOrganizationFilters: (filters: OrganizationFilters) => void;
  
  // Sorting
  organizationSort: OrganizationSortOptions;
  setOrganizationSort: (sort: OrganizationSortOptions) => void;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  
  // UI State
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (id: string | null) => void;
  
  // View Mode
  viewMode: 'table' | 'grid';
  setViewMode: (mode: 'table' | 'grid') => void;
}

// Create Context
const SystemAdminContext = createContext<SystemAdminState | undefined>(undefined);

// Provider Props
interface SystemAdminProviderProps {
  children: ReactNode;
}

/**
 * System Admin Provider
 * 
 * Wraps the System Admin Dashboard with React Query and global state
 */
export const SystemAdminProvider: React.FC<SystemAdminProviderProps> = ({ children }) => {
  // Filters State
  const [organizationFilters, setOrganizationFilters] = useState<OrganizationFilters>({});
  
  // Sorting State
  const [organizationSort, setOrganizationSort] = useState<OrganizationSortOptions>({
    field: 'created_at',
    direction: 'desc',
  });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // UI State
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const value: SystemAdminState = {
    organizationFilters,
    setOrganizationFilters,
    organizationSort,
    setOrganizationSort,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    selectedOrganizationId,
    setSelectedOrganizationId,
    viewMode,
    setViewMode,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SystemAdminContext.Provider value={value}>
        {children}
      </SystemAdminContext.Provider>
    </QueryClientProvider>
  );
};

/**
 * useSystemAdmin Hook
 * 
 * Access System Admin global state
 */
export const useSystemAdmin = (): SystemAdminState => {
  const context = useContext(SystemAdminContext);
  
  if (context === undefined) {
    throw new Error('useSystemAdmin must be used within SystemAdminProvider');
  }
  
  return context;
};

/**
 * Get Query Client
 * 
 * Access the QueryClient instance directly
 */
export const getQueryClient = () => queryClient;
