/**
 * ErrorDetailPanel - Detailed view of a single error
 * @module error-monitoring/components/ErrorDetailPanel
 */

import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  X,
  Clock,
  Globe,
  Monitor,
  Code,
  Sparkles,
  CheckCircle,
  Eye,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { SystemError, ErrorStatus } from '../types';
import { SEVERITY_LEVELS, ERROR_CATEGORIES } from '../constants';

interface ErrorDetailPanelProps {
  error: SystemError | null;
  open: boolean;
  onClose: () => void;
  onUpdateStatus?: (id: string, status: ErrorStatus) => void;
  onRequestAnalysis?: (id: string) => void;
}

export function ErrorDetailPanel({
  error,
  open,
  onClose,
  onUpdateStatus,
  onRequestAnalysis,
}: ErrorDetailPanelProps) {
  if (!error) return null;

  const severity = SEVERITY_LEVELS[error.severity];
  const category = ERROR_CATEGORIES[error.errorType];

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">Error Details</SheetTitle>
            <Badge
              style={{
                backgroundColor: severity.bgColor,
                color: severity.color,
              }}
            >
              {error.severity}
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-6 pr-4">
            {/* Message */}
            <div>
              <h4 className="text-sm font-medium mb-2">Message</h4>
              <p className="text-sm bg-muted p-3 rounded-lg">{error.message}</p>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-muted-foreground">Type</h4>
                <Badge variant="outline" className="mt-1">{error.errorType}</Badge>
              </div>
              <div>
                <h4 className="text-xs text-muted-foreground">Status</h4>
                <Badge variant="outline" className="mt-1">{error.status}</Badge>
              </div>
              <div>
                <h4 className="text-xs text-muted-foreground">Occurrences</h4>
                <p className="text-sm font-medium">{error.occurrenceCount}</p>
              </div>
              <div>
                <h4 className="text-xs text-muted-foreground">First Seen</h4>
                <p className="text-sm">
                  {format(new Date(error.firstSeenAt), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>

            {/* Context */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Context</h4>
              {error.component && (
                <div className="flex items-center gap-2 text-sm">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <span>{error.component}</span>
                </div>
              )}
              {error.url && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{error.url}</span>
                </div>
              )}
              {error.browser && (
                <div className="flex items-center gap-2 text-sm">
                  <Monitor className="h-4 w-4 text-muted-foreground" />
                  <span>{error.browser} / {error.os}</span>
                </div>
              )}
            </div>

            {/* Stack Trace */}
            {error.stackTrace && (
              <div>
                <h4 className="text-sm font-medium mb-2">Stack Trace</h4>
                <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {error.stackTrace}
                </pre>
              </div>
            )}

            {/* AI Analysis */}
            {error.aiAnalysis && (
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    AI Analysis
                  </h4>
                </div>
                <p className="text-sm">{error.aiAnalysis.rootCause}</p>
                {error.aiSuggestion && (
                  <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-700">
                    <h5 className="text-xs font-medium mb-1">Suggested Fix</h5>
                    <p className="text-xs text-muted-foreground">{error.aiSuggestion}</p>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {error.status !== 'resolved' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onUpdateStatus?.(error.id, 'resolved')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Mark Resolved
                </Button>
              )}
              {!error.aiAnalyzedAt && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRequestAnalysis?.(error.id)}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Analyze with AI
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus?.(error.id, 'investigating')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Investigate
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
