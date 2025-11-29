/**
 * OrganizationsHeader Component
 * 
 * Header section with title, description, and action buttons.
 */

import React from 'react';
import { Button } from '../../../components/ui/button';
import { Building2, Download, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface OrganizationsHeaderProps {
  onAdd: () => void;
}

export function OrganizationsHeader({ onAdd }: OrganizationsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Building2 className="h-7 w-7 text-indigo-600" />
          Organizations
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage all organizations, their settings, and subscriptions
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => toast.info('Export feature coming soon')}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button onClick={onAdd} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </Button>
      </div>
    </div>
  );
}
