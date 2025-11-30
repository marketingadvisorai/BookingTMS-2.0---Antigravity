/**
 * MarketingPro 1.1 - Workflows List Component
 * @description Email automation workflows list
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Mail, CheckCircle, Clock, MessageSquare, Gift, Star, XCircle, UserPlus, TrendingUp } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeContext';
import { getThemeClasses } from '../../utils/theme';
import { toast } from 'sonner';
import type { EmailTemplate } from '../../types';
import type { LucideIcon } from 'lucide-react';

interface WorkflowsListProps {
  templates: EmailTemplate[];
  workflowStates: Record<string, boolean>;
  onToggleWorkflow: (templateId: string, enabled: boolean) => void;
  onCreateTemplate: () => void;
  onCreateWorkflow: () => void;
}

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

export function WorkflowsList({ 
  templates, 
  workflowStates, 
  onToggleWorkflow,
  onCreateTemplate,
  onCreateWorkflow 
}: WorkflowsListProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const classes = getThemeClasses(isDark);

  const handleToggle = (templateId: string, enabled: boolean) => {
    onToggleWorkflow(templateId, enabled);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      toast.success(
        enabled 
          ? `"${template.name}" workflow activated!` 
          : `"${template.name}" workflow deactivated`
      );
    }
  };

  if (templates.length === 0) {
    return (
      <Card className={`${classes.cardBg} border ${classes.border} shadow-sm`}>
        <CardContent className="py-8">
          <div className={`text-center ${classes.textMuted}`}>
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No templates available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${classes.cardBg} border ${classes.border} shadow-sm`}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className={classes.text}>Automated Workflows</CardTitle>
            <p className={`text-sm ${classes.textMuted} mt-1`}>
              Enable/disable email automation ({templates.length} templates available)
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onCreateTemplate}
              className={isDark ? 'border-[#2a2a2a] text-white hover:bg-[#1e1e1e]' : ''}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Template
            </Button>
            <Button
              size="sm"
              onClick={onCreateWorkflow}
              className={classes.primaryBtn}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Workflow
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
        {templates.map((template) => {
          const Icon = ICON_MAP[template.icon] || CheckCircle;
          const isEnabled = workflowStates[template.id] || false;

          return (
            <div 
              key={template.id} 
              className={`flex items-center justify-between p-3 border rounded-lg ${classes.border} ${isDark ? 'hover:bg-[#1e1e1e]' : 'hover:bg-gray-50'} transition-colors`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-8 h-8 rounded-lg ${
                  isEnabled 
                    ? isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'
                    : isDark ? 'bg-[#2a2a2a]' : 'bg-gray-100'
                } flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${
                    isEnabled 
                      ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                      : isDark ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${classes.text} truncate block`}>{template.name}</span>
                  <p className={`text-xs ${classes.textMuted}`}>{template.category}</p>
                </div>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) => handleToggle(template.id, checked)}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
