/**
 * API Keys Management Page
 * 
 * Allows organizations to manage API keys with scoping support.
 * Features: Create, view, revoke keys with usage statistics.
 * 
 * @module pages/APIKeys
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  Clock,
  Activity,
  Settings2,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/AuthContext';
import apiKeyService, {
  ApiKey,
  ApiKeyScope,
  ApiKeyEnvironment,
  API_KEY_SCOPES,
  SCOPE_PRESETS,
  CreateApiKeyRequest,
} from '@/services/apiKey.service';

// ============================================================================
// Types
// ============================================================================

interface NewKeyModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (apiKey: string, keyId: string) => void;
  organizationId: string;
}

interface KeyDetailsModalProps {
  open: boolean;
  onClose: () => void;
  apiKey: ApiKey | null;
  onRevoke: (keyId: string) => void;
}

// ============================================================================
// Components
// ============================================================================

const NewKeyModal: React.FC<NewKeyModalProps> = ({ open, onClose, onCreated, organizationId }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState<ApiKeyEnvironment>('production');
  const [selectedScopes, setSelectedScopes] = useState<ApiKeyScope[]>([]);
  const [expiresInDays, setExpiresInDays] = useState<string>('');
  const [rateLimit, setRateLimit] = useState<string>('1000');
  const [isCreating, setIsCreating] = useState(false);

  const handleScopeToggle = (scope: ApiKeyScope) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const handlePresetSelect = (preset: keyof typeof SCOPE_PRESETS) => {
    setSelectedScopes([...SCOPE_PRESETS[preset]]);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }
    if (selectedScopes.length === 0) {
      toast.error('Please select at least one scope');
      return;
    }

    setIsCreating(true);
    try {
      const request: CreateApiKeyRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        scopes: selectedScopes,
        environment,
        rate_limit_per_minute: parseInt(rateLimit) || 1000,
        expires_in_days: expiresInDays ? parseInt(expiresInDays) : undefined,
      };

      const result = await apiKeyService.createKey(organizationId, request);
      onCreated(result.api_key, result.key_id);
      
      // Reset form
      setName('');
      setDescription('');
      setSelectedScopes([]);
      setExpiresInDays('');
      setRateLimit('1000');
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const scopeCategories = apiKeyService.getScopesByCategory();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Create New API Key
          </DialogTitle>
          <DialogDescription>
            Generate a new API key with specific permissions for integrations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Website Integration"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this key used for?"
                rows={2}
              />
            </div>
          </div>

          {/* Environment */}
          <div>
            <Label>Environment</Label>
            <Select value={environment} onValueChange={(v) => setEnvironment(v as ApiKeyEnvironment)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="test">Test</SelectItem>
                <SelectItem value="development">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scope Presets */}
          <div>
            <Label>Quick Presets</Label>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect('readonly')}
              >
                Read Only
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect('booking_management')}
              >
                Booking Management
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePresetSelect('full_access')}
              >
                Full Access
              </Button>
            </div>
          </div>

          {/* Scopes */}
          <div>
            <Label>Permissions *</Label>
            <div className="mt-2 space-y-4">
              {Object.entries(scopeCategories).map(([category, scopes]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {scopes.map(({ scope, label, description }) => (
                      <label
                        key={scope}
                        className="flex items-start gap-2 p-2 rounded-md border cursor-pointer hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedScopes.includes(scope)}
                          onCheckedChange={() => handleScopeToggle(scope)}
                        />
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rate Limit & Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rateLimit">Rate Limit (per minute)</Label>
              <Input
                id="rateLimit"
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                min="1"
                max="10000"
              />
            </div>
            <div>
              <Label htmlFor="expiresInDays">Expires In (days)</Label>
              <Input
                id="expiresInDays"
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder="Never"
                min="1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create API Key'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const KeyDetailsModal: React.FC<KeyDetailsModalProps> = ({ open, onClose, apiKey, onRevoke }) => {
  const [stats, setStats] = useState<{
    total_requests: number;
    successful_requests: number;
    failed_requests: number;
    avg_response_time_ms: number;
  } | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    if (apiKey && open) {
      apiKeyService.getKeyStats(apiKey.id).then(setStats).catch(console.error);
    }
  }, [apiKey, open]);

  if (!apiKey) return null;

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }
    setIsRevoking(true);
    try {
      await apiKeyService.revokeKey(apiKey.id, 'Manually revoked');
      onRevoke(apiKey.id);
      onClose();
      toast.success('API key revoked');
    } catch (error) {
      toast.error('Failed to revoke API key');
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{apiKey.name}</DialogTitle>
          <DialogDescription>{apiKey.description || 'No description'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Key Info */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Key Prefix</span>
            <code className="bg-muted px-2 py-1 rounded">{apiKey.key_prefix}...</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Environment</span>
            <Badge variant={apiKey.environment === 'production' ? 'default' : 'secondary'}>
              {apiKey.environment}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant={apiKey.revoked_at ? 'destructive' : 'default'}>
              {apiKey.revoked_at ? 'Revoked' : 'Active'}
            </Badge>
          </div>

          {/* Scopes */}
          <div>
            <span className="text-sm text-muted-foreground">Scopes</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {apiKey.scopes.map((scope) => (
                <Badge key={scope} variant="outline" className="text-xs">
                  {scope}
                </Badge>
              ))}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-2xl font-bold">{stats.total_requests.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Requests</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.avg_response_time_ms.toFixed(0)}ms</p>
                <p className="text-xs text-muted-foreground">Avg Response Time</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p>Created: {new Date(apiKey.created_at).toLocaleString()}</p>
            {apiKey.last_used_at && (
              <p>Last used: {new Date(apiKey.last_used_at).toLocaleString()}</p>
            )}
            {apiKey.expires_at && (
              <p>Expires: {new Date(apiKey.expires_at).toLocaleString()}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!apiKey.revoked_at && (
            <Button variant="destructive" onClick={handleRevoke} disabled={isRevoking}>
              {isRevoking ? 'Revoking...' : 'Revoke Key'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// Main Page
// ============================================================================

const APIKeysPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const organizationId = currentUser?.organizationId;

  const loadKeys = async () => {
    if (!organizationId) return;
    setIsLoading(true);
    try {
      const keys = await apiKeyService.listKeys(organizationId);
      setApiKeys(keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, [organizationId]);

  const handleKeyCreated = (apiKey: string, keyId: string) => {
    setNewApiKey(apiKey);
    setShowNewKeyModal(false);
    loadKeys();
  };

  const handleCopyKey = async () => {
    if (newApiKey) {
      await navigator.clipboard.writeText(newApiKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      toast.success('API key copied to clipboard');
    }
  };

  const handleCloseNewKeyDialog = () => {
    setNewApiKey(null);
    setCopiedKey(false);
  };

  const handleKeyRevoked = (keyId: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
  };

  if (!organizationId) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Organization Required</h2>
        <p className="text-muted-foreground">
          You need to be part of an organization to manage API keys.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Key className="h-6 w-6" />
            API Keys
          </h1>
          <p className="text-muted-foreground">
            Manage API keys for your integrations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadKeys} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowNewKeyModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{apiKeys.length}</p>
                <p className="text-sm text-muted-foreground">Total Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {apiKeys.filter((k) => !k.revoked_at).length}
                </p>
                <p className="text-sm text-muted-foreground">Active Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {apiKeys.filter((k) => k.expires_at && new Date(k.expires_at) > new Date()).length}
                </p>
                <p className="text-sm text-muted-foreground">Expiring Soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {apiKeys.reduce((sum, k) => sum + k.usage_count, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Click on a key to view details and usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading keys...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No API Keys</h3>
              <p className="text-muted-foreground mb-4">
                Create your first API key to start integrating with our API.
              </p>
              <Button onClick={() => setShowNewKeyModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {apiKeys.map((key) => (
                  <motion.div
                    key={key.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedKey(key)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        key.revoked_at
                          ? 'bg-red-100 dark:bg-red-900'
                          : 'bg-green-100 dark:bg-green-900'
                      }`}>
                        <Key className={`h-5 w-5 ${
                          key.revoked_at
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{key.name}</p>
                        <code className="text-xs text-muted-foreground">
                          {key.key_prefix}...
                        </code>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={key.environment === 'production' ? 'default' : 'secondary'}>
                        {key.environment}
                      </Badge>
                      <Badge variant={key.revoked_at ? 'destructive' : 'outline'}>
                        {key.revoked_at ? 'Revoked' : 'Active'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {key.usage_count.toLocaleString()} requests
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <NewKeyModal
        open={showNewKeyModal}
        onClose={() => setShowNewKeyModal(false)}
        onCreated={handleKeyCreated}
        organizationId={organizationId}
      />

      <KeyDetailsModal
        open={!!selectedKey}
        onClose={() => setSelectedKey(null)}
        apiKey={selectedKey}
        onRevoke={handleKeyRevoked}
      />

      {/* New Key Display Dialog */}
      <Dialog open={!!newApiKey} onOpenChange={handleCloseNewKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              API Key Created
            </DialogTitle>
            <DialogDescription>
              Copy your API key now. You won't be able to see it again!
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={newApiKey || ''}
                className="font-mono text-sm"
              />
              <Button variant="outline" size="icon" onClick={handleCopyKey}>
                {copiedKey ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Store this key securely. It won't be shown again.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleCloseNewKeyDialog}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default APIKeysPage;
