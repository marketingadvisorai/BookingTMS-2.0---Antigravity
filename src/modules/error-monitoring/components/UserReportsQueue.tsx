/**
 * UserReportsQueue - Display user-submitted error reports
 * @module error-monitoring/components/UserReportsQueue
 */

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Bug,
  Lightbulb,
  Zap,
  Palette,
  Database,
  MoreHorizontal,
  User,
  Building2,
  Mail,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { UserErrorReport, ReportType, Priority } from '../types';

interface UserReportsQueueProps {
  reports: UserErrorReport[];
  loading?: boolean;
  onSelectReport?: (report: UserErrorReport) => void;
}

const REPORT_TYPE_ICONS: Record<ReportType, React.ReactNode> = {
  bug: <Bug className="h-4 w-4" />,
  feature_request: <Lightbulb className="h-4 w-4" />,
  performance: <Zap className="h-4 w-4" />,
  ui_issue: <Palette className="h-4 w-4" />,
  data_issue: <Database className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

function ReportCard({
  report,
  onClick,
}: {
  report: UserErrorReport;
  onClick?: () => void;
}) {
  return (
    <Card
      className="border-border/40 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-muted">
            {REPORT_TYPE_ICONS[report.reportType]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={PRIORITY_COLORS[report.priority]}>
                {report.priority}
              </Badge>
              <Badge variant="outline">{report.status}</Badge>
            </div>
            <p className="text-sm font-medium truncate">{report.title}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                {report.reporterType === 'customer' ? (
                  <User className="h-3 w-3" />
                ) : (
                  <Building2 className="h-3 w-3" />
                )}
                {report.reporterName || report.reporterEmail || 'Anonymous'}
              </span>
              <span>
                {formatDistanceToNow(new Date(report.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function UserReportsQueue({
  reports,
  loading,
  onSelectReport,
}: UserReportsQueueProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-border/40 animate-pulse">
            <CardContent className="p-4 h-20" />
          </Card>
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="p-8 text-center">
          <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No user reports</p>
          <p className="text-xs text-muted-foreground mt-1">
            Reports from users will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onClick={() => onSelectReport?.(report)}
        />
      ))}
    </div>
  );
}
