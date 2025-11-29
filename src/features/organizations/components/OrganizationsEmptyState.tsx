/**
 * OrganizationsEmptyState Component
 * 
 * Displayed when no organizations match the current filters.
 */

import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Building2, Plus } from 'lucide-react';

interface OrganizationsEmptyStateProps {
  onAdd: () => void;
}

export function OrganizationsEmptyState({ onAdd }: OrganizationsEmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          No organizations found
        </h3>
        <p className="text-gray-500 mt-2">
          Get started by creating your first organization.
        </p>
        <Button onClick={onAdd} className="mt-4 bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </Button>
      </CardContent>
    </Card>
  );
}
