/**
 * OrganizationsErrorCard Component
 * 
 * Displayed when there's an error loading organizations.
 */

import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface OrganizationsErrorCardProps {
  error: Error | unknown;
  onRetry: () => void;
}

export function OrganizationsErrorCard({ error, onRetry }: OrganizationsErrorCardProps) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
      <CardContent className="py-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span>Error: {errorMessage}</span>
          <Button variant="outline" size="sm" onClick={onRetry} className="ml-auto">
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
