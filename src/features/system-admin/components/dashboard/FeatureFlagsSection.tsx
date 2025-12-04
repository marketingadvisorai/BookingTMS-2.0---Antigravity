/**
 * Feature Flags Section
 * Displays and manages platform feature flags
 * @module system-admin/components/dashboard/FeatureFlagsSection
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, XCircle } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';

interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
}

interface FeatureFlagsSectionProps {
  featureFlags: FeatureFlag[];
  selectedAccountName?: string | null;
  onToggleFeature: (featureId: string) => void;
  showToggle?: boolean;
}

export function FeatureFlagsSection({
  featureFlags,
  selectedAccountName,
  onToggleFeature,
  showToggle = true,
}: FeatureFlagsSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';

  // When account is selected, only show enabled features
  const displayFlags = selectedAccountName
    ? featureFlags.filter((f) => f.enabled)
    : featureFlags;

  const activeCount = featureFlags.filter((f) => f.enabled).length;

  return (
    <div className="pb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-medium ${textClass}`}>Feature Flags</h2>
      </div>

      <Card className={`${cardBgClass} border ${borderColor}`}>
        <CardHeader className="space-y-3 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className={`text-xl ${textClass}`}>
                {selectedAccountName
                  ? `Active Features - ${selectedAccountName}`
                  : 'Platform Features'}
              </CardTitle>
              <p className={`text-sm mt-2 ${mutedTextClass}`}>
                {selectedAccountName
                  ? 'Features enabled for this account'
                  : 'Enable or disable features across all organizations'}
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                isDark
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }
            >
              {selectedAccountName
                ? `${activeCount} Active Features`
                : `${activeCount} / ${featureFlags.length} Active`}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayFlags.map((feature) => (
              <div
                key={feature.id}
                className={`p-5 rounded-lg border ${borderColor} ${
                  isDark ? 'bg-[#0a0a0a] hover:bg-[#1a1a1a]' : 'bg-white hover:bg-gray-50'
                } transition-all duration-200 shadow-sm`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 pr-4">
                    <h4 className={`font-medium mb-1 ${textClass}`}>{feature.name}</h4>
                    {feature.description && (
                      <p className={`text-xs leading-relaxed ${mutedTextClass}`}>
                        {feature.description}
                      </p>
                    )}
                  </div>
                  {showToggle && !selectedAccountName && (
                    <Switch
                      checked={feature.enabled}
                      onCheckedChange={() => onToggleFeature(feature.id)}
                      className="flex-shrink-0"
                    />
                  )}
                </div>

                <div
                  className="flex items-center pt-3 border-t border-opacity-50"
                  style={{ borderColor: isDark ? '#333' : '#e5e7eb' }}
                >
                  <div className="flex items-center space-x-2">
                    {feature.enabled ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">
                          Active
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Inactive
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default FeatureFlagsSection;
