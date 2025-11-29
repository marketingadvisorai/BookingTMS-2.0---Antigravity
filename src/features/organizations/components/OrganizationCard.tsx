/**
 * OrganizationCard Component
 * Card view for a single organization in grid layout
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../../../components/ui/dropdown-menu';
import {
  Building2,
  CreditCard,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  KeyRound,
} from 'lucide-react';
import { formatDate } from '../../system-admin/utils';
import type { Organization } from '../../system-admin/types';
import { statusConfig } from './statusConfig';

interface OrganizationCardProps {
  organization: Organization;
  onEdit: (org: Organization) => void;
  onSettings: (org: Organization) => void;
  onDelete: (org: Organization) => void;
  onResetPassword: (org: Organization) => void;
}

export function OrganizationCard({ 
  organization, 
  onEdit, 
  onSettings, 
  onDelete,
  onResetPassword 
}: OrganizationCardProps) {
  const statusInfo = statusConfig[organization.status] || statusConfig.pending;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-base">{organization.name}</CardTitle>
              {organization.owner_email && (
                <CardDescription className="text-xs">
                  {organization.owner_email}
                </CardDescription>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSettings(organization)}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(organization)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onResetPassword(organization)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Reset Password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(organization)}
                className="text-red-600 dark:text-red-500"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status & Plan */}
        <div className="flex items-center justify-between">
          <Badge variant={statusInfo.variant} className={`${statusInfo.className} flex items-center gap-1`}>
            {statusInfo.icon}
            {organization.status}
          </Badge>
          <span className="text-sm text-gray-500">
            {typeof organization.plan === 'object' ? organization.plan?.name : 'No Plan'}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {(organization as any).venues?.[0]?.count || 0}
            </p>
            <p className="text-xs text-gray-500">Venues</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {(organization as any).activities?.[0]?.count || 0}
            </p>
            <p className="text-xs text-gray-500">Activities</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {organization.application_fee_percentage || 0}%
            </p>
            <p className="text-xs text-gray-500">Fee</p>
          </div>
        </div>

        {/* Stripe Status */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          <CreditCard className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-500">
            {organization.stripe_charges_enabled ? (
              <span className="text-emerald-600 dark:text-emerald-400">Payments Enabled</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">Setup Required</span>
            )}
          </span>
        </div>

        {/* Created Date */}
        <div className="text-xs text-gray-400 pt-2">
          Created {formatDate(organization.created_at)}
        </div>
      </CardContent>
    </Card>
  );
}
