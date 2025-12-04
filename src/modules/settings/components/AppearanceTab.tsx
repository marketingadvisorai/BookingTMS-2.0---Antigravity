/**
 * Appearance Settings Tab
 * @module settings/components/AppearanceTab
 */

import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/components/layout/ThemeContext';

interface AppearanceTabProps {
  isDark: boolean;
}

export function AppearanceTab({ isDark }: AppearanceTabProps) {
  const { theme, setTheme } = useTheme();

  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const hoverBgClass = isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50';

  const themes = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <Card className={`${cardBgClass} border ${borderClass} shadow-sm`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className={`w-5 h-5 ${isDark ? 'text-[#6366f1]' : 'text-blue-600'}`} />
          <CardTitle className={textClass}>Appearance Settings</CardTitle>
        </div>
        <CardDescription className={textMutedClass}>
          Customize how the dashboard looks and feels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className={textClass}>
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme Mode
            </div>
          </Label>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as 'light' | 'dark' | 'system')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  theme === t.id
                    ? isDark
                      ? 'border-[#4f46e5] bg-[#4f46e5]/10'
                      : 'border-blue-600 bg-blue-50'
                    : isDark
                      ? `border-[#2a2a2a] ${hoverBgClass}`
                      : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <t.icon
                  className={`w-6 h-6 mx-auto mb-2 ${
                    theme === t.id
                      ? isDark
                        ? 'text-[#6366f1]'
                        : 'text-blue-600'
                      : textMutedClass
                  }`}
                />
                <p className={`text-sm ${textClass}`}>{t.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}>
          <p className={`text-sm ${textMutedClass}`}>
            Your theme preference is automatically saved and synced across devices.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
