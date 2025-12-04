/**
 * Organizations Table View
 * Table view for organization list
 * @module organizations/components/OrganizationsTableView
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building2,
  CheckCircle,
  Clock,
  Edit,
  KeyRound,
  Mail,
  MoreHorizontal,
  Settings,
  Trash2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { formatDate } from '@/features/system-admin/utils';
import type { Organization } from '../types';

// Status configuration
const statusConfig: Record<string, { variant: any; icon: React.ReactNode; className: string }> = {
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

interface OrganizationsTableViewProps {
  organizations: Organization[];
  onEdit: (org: Organization) => void;
  onSettings: (org: Organization) => void;
  onDelete: (org: Organization) => void;
  onResetPassword: (org: Organization) => void;
  onResendEmail: (org: Organization) => void;
}

export function OrganizationsTableView({
  organizations,
  onEdit,
  onSettings,
  onDelete,
  onResetPassword,
  onResendEmail,
}: OrganizationsTableViewProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900/50">
              <TableHead className="font-semibold">Organization</TableHead>
              <TableHead className="font-semibold">Owner</TableHead>
              <TableHead className="font-semibold">Plan</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Stripe</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => {
              const statusInfo = statusConfig[org.status] || statusConfig.pending;
              return (
                <TableRow key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{org.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{org.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">{org.owner_name || '-'}</p>
                      {org.owner_email && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {org.owner_email}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {typeof org.plan === 'object' ? org.plan?.name : 'No Plan'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant} className={`${statusInfo.className} flex items-center gap-1 w-fit`}>
                      {statusInfo.icon}
                      {org.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {org.stripe_charges_enabled ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Setup Required
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">{formatDate(org.created_at)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onSettings(org)} title="Settings">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(org)} title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onSettings(org)}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(org)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onResendEmail(org)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Resend Welcome Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onResetPassword(org)}>
                            <KeyRound className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(org)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default OrganizationsTableView;
