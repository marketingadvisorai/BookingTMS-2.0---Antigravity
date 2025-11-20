/**
 * Upgrade Prompt Component
 * Displayed when users try to access premium features or hit limits
 */

import React from 'react';
import { ArrowUpCircle, Lock, Zap, Crown } from 'lucide-react';
import { Button } from '../ui/button';

interface UpgradePromptProps {
  type?: 'feature' | 'limit';
  featureName?: string;
  requiredPlan?: string;
  currentUsage?: number;
  limit?: number;
  resource?: string;
  onNavigate?: (page: string) => void;
}

export function UpgradePrompt({ 
  type = 'feature',
  featureName,
  requiredPlan = 'Growth',
  currentUsage,
  limit,
  resource,
  onNavigate
}: UpgradePromptProps) {
  const handleUpgrade = () => {
    if (onNavigate) {
      onNavigate('billing');
    }
  };
  
  if (type === 'limit') {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Limit Reached
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You've reached your {resource} limit of {limit}. 
              {currentUsage !== undefined && ` Current usage: ${currentUsage}/${limit}`}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Upgrade to {requiredPlan} plan to increase your limits.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={handleUpgrade}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Feature locked prompt
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Crown className="w-8 h-8 text-white" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Premium Feature
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {featureName || 'This feature'} is available on the {requiredPlan} plan and above.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Unlock powerful features to grow your business.
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-[#161616] rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Advanced automation & AI</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Priority support</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Unlimited resources</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleUpgrade}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <ArrowUpCircle className="w-4 h-4 mr-2" />
            Upgrade to {requiredPlan}
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline upgrade banner for smaller contexts
 */
export function UpgradeBanner({ 
  featureName,
  requiredPlan = 'Growth',
  onNavigate,
}: Pick<UpgradePromptProps, 'featureName' | 'requiredPlan' | 'onNavigate'>) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Upgrade to unlock {featureName}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Available on {requiredPlan} plan and above
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => onNavigate?.('billing')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            View Plans
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Limit warning badge for buttons
 */
export function LimitBadge({ 
  current,
  limit,
  resource
}: { 
  current: number; 
  limit: number; 
  resource: string; 
}) {
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;
  
  if (!isNearLimit) return null;
  
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
      isAtLimit 
        ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    }`}>
      {current}/{limit}
      {isAtLimit && <Lock className="w-3 h-3" />}
    </div>
  );
}
