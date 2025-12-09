/**
 * Google OAuth Configuration Section
 * @module components/backend/auth/GoogleOAuthSection
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Chrome,
  Copy,
  ExternalLink,
  RefreshCw,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';
import { AuthTheme, GoogleAuthConfig, AuthStatus } from './types';

interface GoogleOAuthSectionProps {
  theme: AuthTheme;
  config: GoogleAuthConfig;
  status: AuthStatus;
  isTesting: boolean;
  onConfigChange: (config: GoogleAuthConfig) => void;
  onTest: () => void;
  onSave: () => void;
}

export function GoogleOAuthSection({
  theme,
  config,
  status,
  isTesting,
  onConfigChange,
  onTest,
  onSave,
}: GoogleOAuthSectionProps) {
  const { isDark, bgClass, textClass, mutedTextClass, borderClass } = theme;
  const [showSecret, setShowSecret] = useState(false);

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
            <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
              <Chrome className={`h-5 w-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <div>
              <h3 className={`text-lg ${textClass}`}>Google OAuth</h3>
              <p className={`text-sm ${mutedTextClass}`}>Sign in with Google</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <Button variant="outline" size="sm" onClick={onTest} disabled={isTesting || !config.configured}>
              {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Setup Notice */}
        {!config.configured && (
          <Alert className={isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className={isDark ? 'text-yellow-200' : 'text-yellow-800'}>
              Configure your Google OAuth credentials to enable Google Sign-in.
            </AlertDescription>
          </Alert>
        )}

        {/* Configuration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className={textClass}>Client ID</Label>
            <Input
              type="text"
              value={config.clientId}
              onChange={(e) => onConfigChange({ ...config, clientId: e.target.value })}
              placeholder="Your Google OAuth Client ID"
              className={isDark ? 'bg-[#0a0a0a]' : ''}
            />
          </div>

          <div className="space-y-2">
            <Label className={textClass}>Client Secret</Label>
            <div className="relative">
              <Input
                type={showSecret ? 'text' : 'password'}
                value={config.clientSecret}
                onChange={(e) => onConfigChange({ ...config, clientSecret: e.target.value })}
                placeholder="Your Google OAuth Client Secret"
                className={`${isDark ? 'bg-[#0a0a0a]' : ''} pr-10`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              >
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className={textClass}>Redirect URI</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={config.redirectUri}
                readOnly
                className={`${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'} flex-1`}
              />
              <Button variant="outline" onClick={() => copyToClipboard(config.redirectUri, 'Redirect URI')}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className={`text-xs ${mutedTextClass}`}>
              Add this URL to your Google OAuth authorized redirect URIs
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Google Console
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
