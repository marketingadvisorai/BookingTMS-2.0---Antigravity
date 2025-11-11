import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Eye,
  EyeOff,
  Save,
  Key,
  Lock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  RefreshCw,
  Shield,
  Database,
  CreditCard,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../layout/ThemeContext';

interface SecretField {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
  description?: string;
}

interface SecretCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  fields: SecretField[];
  color: string;
}

const SECRET_CATEGORIES: SecretCategory[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Stripe payment processing API keys',
    color: 'purple',
    fields: [
      {
        key: 'STRIPE_SECRET_KEY',
        label: 'Secret Key',
        placeholder: 'sk_test_...',
        required: true,
        description: 'Your Stripe secret key for server-side operations'
      },
      {
        key: 'STRIPE_PUBLISHABLE_KEY',
        label: 'Publishable Key',
        placeholder: 'pk_test_...',
        required: true,
        description: 'Your Stripe publishable key for client-side operations'
      },
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        label: 'Webhook Secret',
        placeholder: 'whsec_...',
        required: false,
        description: 'Secret for verifying Stripe webhook events'
      }
    ]
  },
  {
    id: 'supabase',
    name: 'Supabase',
    icon: <Database className="w-5 h-5" />,
    description: 'Supabase database and authentication',
    color: 'green',
    fields: [
      {
        key: 'SUPABASE_URL',
        label: 'Project URL',
        placeholder: 'https://xxxxx.supabase.co',
        required: true,
        description: 'Your Supabase project URL'
      },
      {
        key: 'SUPABASE_ANON_KEY',
        label: 'Anon/Public Key',
        placeholder: 'eyJhbG...',
        required: true,
        description: 'Public anon key for client-side operations'
      },
      {
        key: 'SUPABASE_SERVICE_ROLE_KEY',
        label: 'Service Role Key',
        placeholder: 'eyJhbG...',
        required: false,
        description: 'Service role key for server-side admin operations'
      }
    ]
  },
  {
    id: 'google',
    name: 'Google APIs',
    icon: <Globe className="w-5 h-5" />,
    description: 'Google Cloud Platform API credentials',
    color: 'blue',
    fields: [
      {
        key: 'GOOGLE_CLIENT_ID',
        label: 'OAuth Client ID',
        placeholder: 'xxxxx.apps.googleusercontent.com',
        required: false,
        description: 'Google OAuth 2.0 client ID'
      },
      {
        key: 'GOOGLE_CLIENT_SECRET',
        label: 'OAuth Client Secret',
        placeholder: 'GOCSPX-...',
        required: false,
        description: 'Google OAuth 2.0 client secret'
      },
      {
        key: 'GOOGLE_API_KEY',
        label: 'API Key',
        placeholder: 'AIza...',
        required: false,
        description: 'Google API key for services (Maps, etc.)'
      }
    ]
  }
];

export function SecretsTab() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const bgCard = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgElevated = isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';

  useEffect(() => {
    loadSecrets();
  }, []);

  const loadSecrets = () => {
    try {
      const stored = localStorage.getItem('booking-tms-secrets');
      if (stored) {
        setSecrets(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading secrets:', error);
      toast.error('Failed to load saved secrets');
    }
  };

  const handleSecretChange = (key: string, value: string) => {
    setSecrets(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const toggleShowSecret = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied to clipboard`);
  };

  const deleteSecret = (key: string, label: string) => {
    setSecrets(prev => {
      const newSecrets = { ...prev };
      delete newSecrets[key];
      return newSecrets;
    });
    setHasChanges(true);
    toast.success(`${label} deleted`);
  };

  const saveSecrets = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage (in production, this should go to a secure backend)
      localStorage.setItem('booking-tms-secrets', JSON.stringify(secrets));
      
      // Also save to environment variables if possible (requires backend endpoint)
      // await fetch('/api/secrets/update', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(secrets)
      // });
      
      toast.success('Secrets saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving secrets:', error);
      toast.error('Failed to save secrets');
    } finally {
      setIsSaving(false);
    }
  };

  const isFieldConfigured = (key: string): boolean => {
    return Boolean(secrets[key] && secrets[key].trim() !== '');
  };

  const getCategoryStatus = (category: SecretCategory): 'complete' | 'partial' | 'none' => {
    const configuredCount = category.fields.filter(field => isFieldConfigured(field.key)).length;
    const requiredCount = category.fields.filter(field => field.required && isFieldConfigured(field.key)).length;
    const totalRequired = category.fields.filter(field => field.required).length;

    if (configuredCount === category.fields.length) return 'complete';
    if (requiredCount === totalRequired && totalRequired > 0) return 'complete';
    if (configuredCount > 0) return 'partial';
    return 'none';
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; badge: string }> = {
      purple: {
        bg: isDark ? 'bg-purple-500/10' : 'bg-purple-50',
        border: 'border-purple-500/20',
        text: 'text-purple-400',
        badge: 'bg-purple-500'
      },
      green: {
        bg: isDark ? 'bg-green-500/10' : 'bg-green-50',
        border: 'border-green-500/20',
        text: 'text-green-400',
        badge: 'bg-green-500'
      },
      blue: {
        bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
        border: 'border-blue-500/20',
        text: 'text-blue-400',
        badge: 'bg-blue-500'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={`${bgCard} border ${borderColor}`}>
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <Lock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${textPrimary}`}>API Secrets & Keys</h3>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  Securely manage API keys and secrets for third-party integrations
                </p>
              </div>
            </div>
            <Button
              onClick={saveSecrets}
              disabled={!hasChanges || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          <Alert className={`${isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}>
            <Shield className="w-4 h-4 text-yellow-500" />
            <AlertDescription className={`${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
              <strong>Security Notice:</strong> API keys are stored locally in your browser. In production, these should be managed through secure environment variables and never committed to source control.
            </AlertDescription>
          </Alert>
        </div>
      </Card>

      {/* Secret Categories */}
      {SECRET_CATEGORIES.map((category) => {
        const status = getCategoryStatus(category);
        const colorClasses = getColorClasses(category.color);

        return (
          <Card key={category.id} className={`${bgCard} border ${borderColor}`}>
            <CardHeader className={`border-b ${borderColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClasses.bg}`}>
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className={textPrimary}>{category.name}</CardTitle>
                    <CardDescription className={textSecondary}>
                      {category.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={status === 'complete' ? 'default' : status === 'partial' ? 'secondary' : 'outline'}
                  className={
                    status === 'complete'
                      ? 'bg-green-500'
                      : status === 'partial'
                      ? 'bg-yellow-500'
                      : ''
                  }
                >
                  {status === 'complete' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                  {status === 'partial' && <AlertCircle className="w-3 h-3 mr-1" />}
                  {status === 'complete' ? 'Configured' : status === 'partial' ? 'Partial' : 'Not Configured'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {category.fields.map((field) => {
                const isConfigured = isFieldConfigured(field.key);
                const isVisible = showSecrets[field.key];

                return (
                  <div key={field.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={field.key} className={textPrimary}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {isConfigured && (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-500">Configured</span>
                        </div>
                      )}
                    </div>

                    {field.description && (
                      <p className={`text-xs ${textSecondary}`}>{field.description}</p>
                    )}

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={field.key}
                          type={isVisible ? 'text' : 'password'}
                          value={secrets[field.key] || ''}
                          onChange={(e) => handleSecretChange(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className={`pr-10 ${bgElevated} ${borderColor} ${textPrimary}`}
                        />
                        <button
                          onClick={() => toggleShowSecret(field.key)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 ${textSecondary} hover:${textPrimary}`}
                          type="button"
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {secrets[field.key] && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(secrets[field.key], field.label)}
                            className={borderColor}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteSecret(field.key, field.label)}
                            className={`${borderColor} text-red-500 hover:text-red-600`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* Environment Variables Info */}
      <Card className={`${bgCard} border ${borderColor}`}>
        <CardHeader>
          <CardTitle className={textPrimary}>Environment Variables</CardTitle>
          <CardDescription className={textSecondary}>
            How to use these secrets in your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg border ${borderColor} ${bgElevated}`}>
            <h4 className={`${textPrimary} font-medium mb-2`}>1. Local Development</h4>
            <p className={`text-sm ${textSecondary} mb-2`}>
              Create a <code className="px-1 py-0.5 bg-gray-800 rounded text-xs">.env.local</code> file in your project root:
            </p>
            <pre className={`p-3 rounded text-xs ${isDark ? 'bg-black' : 'bg-gray-900'} text-green-400 overflow-x-auto`}>
{`VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
VITE_SUPABASE_URL=https://...supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...`}
            </pre>
          </div>

          <div className={`p-4 rounded-lg border ${borderColor} ${bgElevated}`}>
            <h4 className={`${textPrimary} font-medium mb-2`}>2. Production Deployment</h4>
            <p className={`text-sm ${textSecondary}`}>
              Set environment variables in your hosting platform (Vercel, Netlify, etc.) or use Supabase Edge Functions secrets:
            </p>
            <pre className={`mt-2 p-3 rounded text-xs ${isDark ? 'bg-black' : 'bg-gray-900'} text-green-400`}>
{`supabase secrets set STRIPE_SECRET_KEY=sk_live_...`}
            </pre>
          </div>

          <div className={`p-4 rounded-lg border ${borderColor} ${bgElevated}`}>
            <h4 className={`${textPrimary} font-medium mb-2`}>3. Best Practices</h4>
            <ul className={`text-sm ${textSecondary} space-y-2 list-disc list-inside`}>
              <li>Never commit secrets to source control</li>
              <li>Use different keys for development and production</li>
              <li>Rotate keys regularly</li>
              <li>Use the principle of least privilege</li>
              <li>Monitor API usage and set up alerts</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
