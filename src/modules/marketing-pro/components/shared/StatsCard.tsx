/**
 * MarketingPro 1.1 - Stats Card Component
 * @description Reusable stats card for all marketing tabs
 */

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses, getStatCardColors } from '../../utils/theme';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'yellow' | 'red';
}

export function StatsCard({ 
  title, 
  value, 
  trend, 
  subtitle, 
  icon: Icon, 
  color 
}: StatsCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);
  const colors = getStatCardColors(color, isDark);

  return (
    <Card className={`${classes.cardBg} border ${classes.border} shadow-sm`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm mb-1 ${classes.textMuted}`}>{title}</p>
            <h3 className={`text-2xl ${classes.text}`}>{value}</h3>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend.isPositive ? (
                  <TrendingUp className={`w-4 h-4 ${classes.success}`} />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm ${trend.isPositive ? classes.success : 'text-red-500'}`}>
                  {trend.value}
                </span>
              </div>
            )}
            {subtitle && !trend && (
              <div className="flex items-center gap-1 mt-2">
                <span className={`text-sm ${classes.textMuted}`}>{subtitle}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
