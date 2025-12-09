/**
 * ErrorList - Display list of errors with filtering
 * @module error-monitoring/components/ErrorList
 */

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Bug,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SystemError, Severity } from '../types';
import { SEVERITY_LEVELS } from '../constants';
import { ERROR_CATEGORIES } from '../constants';

interface ErrorListProps {
  errors: SystemError[];
  loading?: boolean;
  onSelectError?: (error: SystemError) => void;
}

const SEVERITY_ICONS: Record<Severity, React.ReactNode> = {
  critical: <AlertTriangle className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
  warning: <Info className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
  debug: <Bug className="h-4 w-4" />,
};

function ErrorRow({
  error,
  onClick,
}: {
  error: SystemError;
  onClick?: () => void;
}) {
  const severity = SEVERITY_LEVELS[error.severity];
  const category = ERROR_CATEGORIES[error.errorType];

  return (
    <Card
      className="border-border/40 hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="p-2 rounded-full"
            style={{ backgroundColor: severity.bgColor }}
          >
            <span style={{ color: severity.color }}>
              {SEVERITY_ICONS[error.severity]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                style={{
                  backgroundColor: `${category?.color}20`,
                  color: category?.color,
                  borderColor: category?.color,
                }}
              >
                {error.errorType}
              </Badge>
              <Badge variant="outline">{error.status}</Badge>
              {error.occurrenceCount > 1 && (
                <Badge variant="secondary">
                  ×{error.occurrenceCount}
                </Badge>
              )}
            </div>
            <p className="text-sm font-medium truncate">{error.message}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              {error.component && <span>{error.component}</span>}
              <span>
                {formatDistanceToNow(new Date(error.lastSeenAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ErrorList({ errors, loading, onSelectError }: ErrorListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-border/40 animate-pulse">
            <CardContent className="p-4 h-20" />
          </Card>
        ))}
      </div>
    );
  }

  if (errors.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="p-8 text-center">
          <Bug className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No errors found</p>
          <p className="text-xs text-muted-foreground mt-1">
            That's great! Your system is running smoothly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {errors.map((error) => (
        <ErrorRow
          key={error.id}
          error={error}
          onClick={() => onSelectError?.(error)}
        />
      ))}
    </div>
  );
}
