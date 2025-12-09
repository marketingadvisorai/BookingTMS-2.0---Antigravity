/**
 * Supabase Auth Configuration Section
 * @module components/backend/auth/SupabaseAuthSection
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Database,
  Copy,
  ExternalLink,
  RefreshCw,
  Loader2,
  Settings2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { AuthTheme, SupabaseAuthConfig, AuthStatus } from './types';

interface SupabaseAuthSectionProps {
  theme: AuthTheme;
  config: SupabaseAuthConfig;
  status: AuthStatus;
  isTesting: boolean;
  onConfigChange: (config: SupabaseAuthConfig) => void;
  onTest: () => void;
  onSave: () => void;
}

export function SupabaseAuthSection({
  theme,
  config,
  status,
  isTesting,
  onConfigChange,
  onTest,
  onSave,
}: SupabaseAuthSectionProps) {
  const { isDark, bgClass, textClass, mutedTextClass, borderClass } = theme;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusBadge = () => {
    const badges = {
      active: <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>,
      inactive: <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Inactive</Badge>,
      error: <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>,
    };
    return badges[status];
  };

  return (
    <Card className={`${bgClass} border ${borderClass}`}>
      <div className={`p-6 border-b ${borderClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
              <Database className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </div>
            <div>
              <h3 className={`text-lg ${textClass}`}>Supabase Auth</h3>
              <p className={`text-sm ${mutedTextClass}`}>Email/password authentication</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <Button variant="outline" size="sm" onClick={onTest} disabled={isTesting}>
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Connection Info */}
        <div className="space-y-4">
          <h4 className={`text-sm font-medium ${textClass}`}>Connection Details</h4>
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
              <div>
                <p className={`text-sm ${mutedTextClass}`}>Project ID</p>
                <code className={`text-sm ${textClass}`}>{projectId || 'Not configured'}</code>
              </div>
              {projectId && (
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(projectId, 'Project ID')}>
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
              <div>
                <p className={`text-sm ${mutedTextClass}`}>Anon Key</p>
                <code className={`text-sm ${textClass}`}>{publicAnonKey ? `${publicAnonKey.slice(0, 20)}...` : 'Not configured'}</code>
              </div>
              {publicAnonKey && (
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(publicAnonKey, 'Anon Key')}>
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator className={borderClass} />

        {/* Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings2 className={`h-4 w-4 ${mutedTextClass}`} />
            <h4 className={`text-sm font-medium ${textClass}`}>Configuration</h4>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className={textClass}>Email Confirmation</Label>
                <p className={`text-xs ${mutedTextClass}`}>Require users to confirm email</p>
              </div>
              <Switch
                checked={config.emailConfirmation}
                onCheckedChange={(checked) => onConfigChange({ ...config, emailConfirmation: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className={textClass}>Allow Sign-ups</Label>
                <p className={`text-xs ${mutedTextClass}`}>Allow new user registrations</p>
              </div>
              <Switch
                checked={config.allowSignups}
                onCheckedChange={(checked) => onConfigChange({ ...config, allowSignups: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label className={textClass}>Session Duration (hours)</Label>
              <Input
                type="number"
                value={config.sessionDuration}
                onChange={(e) => onConfigChange({ ...config, sessionDuration: parseInt(e.target.value) || 24 })}
                min={1}
                max={720}
                className={isDark ? 'bg-[#0a0a0a]' : ''}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Dashboard
            </a>
          </Button>
          <Button onClick={onSave} className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
            Save Configuration
          </Button>
        </div>
      </div>
    </Card>
  );
}
