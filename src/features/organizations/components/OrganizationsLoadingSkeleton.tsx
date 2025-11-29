/**
 * OrganizationsLoadingSkeleton Component
 * 
 * Loading skeleton for organizations list in both table and grid view.
 * Shows animated placeholders while data is being fetched.
 * 
 * @example
 * <OrganizationsLoadingSkeleton viewMode="table" />
 * <OrganizationsLoadingSkeleton viewMode="grid" />
 */

import React from 'react';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';

interface OrganizationsLoadingSkeletonProps {
  viewMode?: 'grid' | 'table';
}

export function OrganizationsLoadingSkeleton({ 
  viewMode = 'table' 
}: OrganizationsLoadingSkeletonProps) {
  if (viewMode === 'table') {
    return <TableSkeleton />;
  }
  
  return <GridSkeleton />;
}

function TableSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
