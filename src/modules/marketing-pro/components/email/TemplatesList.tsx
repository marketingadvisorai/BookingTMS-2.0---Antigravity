/**
 * MarketingPro 1.1 - Templates List Component
 * @description Email templates list with preview and actions
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, CheckCircle, Clock, MessageSquare, Gift, Star, XCircle, UserPlus, TrendingUp } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses } from '../../utils/theme';
import type { EmailTemplate } from '../../types';
import type { LucideIcon } from 'lucide-react';

interface TemplatesListProps {
  templates: EmailTemplate[];
  onPreview: (template: EmailTemplate) => void;
  onEdit: (template: EmailTemplate) => void;
  onUse: (template: EmailTemplate) => void;
}

// Icon mapping for template icons
const ICON_MAP: Record<string, LucideIcon> = {
  CheckCircle,
  Clock,
  MessageSquare,
  Gift,
  Star,
  XCircle,
  UserPlus,
  TrendingUp,
};

export function TemplatesList({ templates, onPreview, onEdit, onUse }: TemplatesListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);

  return (
    <Card className={`${classes.cardBg} border ${classes.border} shadow-sm`}>
      <CardHeader>
        <CardTitle className={classes.text}>Email Templates</CardTitle>
        <p className={`text-sm ${classes.textMuted}`}>Pre-built email templates ({templates.length} available)</p>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
        {templates.map((template) => {
          const Icon = ICON_MAP[template.icon] || CheckCircle;
          return (
            <div 
              key={template.id} 
              className={`flex items-center justify-between p-3 border rounded-lg ${classes.border} ${isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50'} transition-colors`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-100'} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${classes.text} truncate`}>{template.name}</span>
                    {template.isActive && (
                      <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-800">
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className={`text-xs ${classes.textMuted} truncate`}>{template.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onPreview(template)}
                  className="h-8 px-2"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onEdit(template)}
                  className="h-8 px-2"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onUse(template)}
                  disabled={template.isActive}
                  className={`h-8 ${classes.primaryBtn} ${template.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {template.isActive ? 'In Use' : 'Use'}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
