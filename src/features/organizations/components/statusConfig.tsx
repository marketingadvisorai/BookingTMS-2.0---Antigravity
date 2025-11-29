/**
 * Status Configuration
 * 
 * Shared status badge configuration for organization status display.
 * Used by OrganizationCard, OrganizationsTable, and other components.
 */

import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export const statusConfig: Record<string, { 
  variant: 'default' | 'secondary' | 'outline' | 'destructive'; 
  icon: React.ReactNode; 
  className: string;
}> = {
  active: { 
    variant: 'default', 
    icon: <CheckCircle className="h-3 w-3" />,
    className: 'bg-emerald-600 hover:bg-emerald-700' 
  },
  inactive: { 
    variant: 'secondary', 
    icon: <XCircle className="h-3 w-3" />,
    className: 'bg-gray-500 hover:bg-gray-600' 
  },
  pending: { 
    variant: 'outline', 
    icon: <Clock className="h-3 w-3" />,
    className: 'border-orange-500 text-orange-600' 
  },
  suspended: { 
    variant: 'destructive', 
    icon: <AlertTriangle className="h-3 w-3" />,
    className: 'bg-red-600 hover:bg-red-700' 
  },
};
