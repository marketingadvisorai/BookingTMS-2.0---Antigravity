/**
 * MarketingPro 1.1 - Section Header Component
 * @description Mobile-friendly section header with icon and description
 */

import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses, getStatCardColors } from '../../utils/theme';
import type { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'yellow' | 'red';
}

export function SectionHeader({ 
  title, 
  description, 
  icon: Icon, 
  color 
}: SectionHeaderProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);
  const colors = getStatCardColors(color, isDark);

  return (
    <div className={`sm:hidden ${classes.cardBg} border ${classes.border} rounded-lg p-4 shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.bg}`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        <div className="flex-1">
          <h2 className={`text-base font-semibold ${classes.text}`}>{title}</h2>
          <p className={`text-xs ${classes.textMuted}`}>{description}</p>
        </div>
      </div>
    </div>
  );
}
