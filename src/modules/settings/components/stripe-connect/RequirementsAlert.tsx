/**
 * Requirements Alert
 * Shows pending Stripe requirements
 * @module settings/components/stripe-connect/RequirementsAlert
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface RequirementsAlertProps {
  isDark: boolean;
  requirements: string[];
}

export const RequirementsAlert: React.FC<RequirementsAlertProps> = ({
  isDark,
  requirements,
}) => {
  if (!requirements?.length) return null;

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900';
  const mutedText = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <Card className={`${cardBg} border border-amber-500/50`}>
      <CardContent className="py-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
          <div>
            <p className={`font-medium ${textColor}`}>Action Required</p>
            <p className={`text-sm ${mutedText}`}>
              Complete the following to enable all features:
            </p>
            <ul className="mt-2 text-sm space-y-1">
              {requirements.map((req) => (
                <li key={req} className={mutedText}>
                  • {req.replace(/_/g, ' ')}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
