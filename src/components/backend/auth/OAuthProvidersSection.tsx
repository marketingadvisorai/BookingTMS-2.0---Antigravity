/**
 * OAuth Providers Section
 * @module components/backend/auth/OAuthProvidersSection
 */

'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { AuthTheme, OAuthProvider } from './types';

interface OAuthProvidersSectionProps {
  theme: AuthTheme;
  providers: OAuthProvider[];
  onToggle: (providerId: string) => void;
}

export function OAuthProvidersSection({
  theme,
  providers,
  onToggle,
}: OAuthProvidersSectionProps) {
  const { isDark, bgClass, textClass, mutedTextClass, borderClass } = theme;

  return (
    <Card className={`${bgClass} border ${borderClass}`}>
      <div className={`p-6 border-b ${borderClass}`}>
        <h3 className={`text-lg ${textClass}`}>Other OAuth Providers</h3>
        <p className={`text-sm ${mutedTextClass}`}>
          Additional social login options
        </p>
      </div>

      <div className="p-6 space-y-4">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className={`flex items-center justify-between p-4 rounded-lg border ${borderClass} ${
              isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                {provider.icon}
              </div>
              <div>
                <p className={textClass}>{provider.name}</p>
                <div className="flex items-center gap-2">
                  {provider.configured ? (
                    <Badge className="bg-green-500/10 text-green-500 border-0 text-xs">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Configured
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-500/10 text-gray-500 border-0 text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Configured
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a href={provider.setupUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Setup
                </a>
              </Button>
              <Switch
                checked={provider.enabled}
                onCheckedChange={() => {
                  if (!provider.configured) {
                    toast.error(`Please configure ${provider.name} OAuth first`);
                    return;
                  }
                  onToggle(provider.id);
                }}
                disabled={!provider.configured}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
