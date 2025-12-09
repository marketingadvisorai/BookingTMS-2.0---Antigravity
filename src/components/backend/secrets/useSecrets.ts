/**
 * Secrets Management Hook
 * SECURITY: Uses secure Edge Function for all operations
 * @module components/backend/secrets/useSecrets
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  listSecrets,
  setSecret,
  deleteSecret,
  validateSecret,
  type SecretInfo,
} from '@/services/secrets.service';
import { SECRET_CATEGORIES, type SecretCategory, type CategoryStatus } from './types';

interface UseSecretsReturn {
  // State
  secrets: Record<string, SecretInfo>;
  loading: boolean;
  saving: string | null;
  validating: string | null;
  
  // Actions
  loadSecrets: () => Promise<void>;
  saveSecret: (key: string, value: string, category?: string) => Promise<boolean>;
  clearSecret: (key: string) => Promise<boolean>;
  validateSecretKey: (key: string) => Promise<boolean>;
  
  // Computed
  getCategoryStatus: (categoryId: string) => CategoryStatus;
  isAllConfigured: boolean;
}

export function useSecrets(): UseSecretsReturn {
  const [secrets, setSecrets] = useState<Record<string, SecretInfo>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [validating, setValidating] = useState<string | null>(null);

  // Load all secrets from secure backend
  const loadSecrets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listSecrets();
      
      if (response.success && response.data) {
        const secretsMap: Record<string, SecretInfo> = {};
        response.data.forEach((secret) => {
          secretsMap[secret.secret_key] = secret;
        });
        setSecrets(secretsMap);
      } else {
        toast.error(response.error || 'Failed to load secrets');
      }
    } catch (error: any) {
      toast.error('Failed to load secrets: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save a secret
  const saveSecret = useCallback(async (
    key: string,
    value: string,
    category?: string
  ): Promise<boolean> => {
    setSaving(key);
    try {
      const response = await setSecret(key, value, category);
      
      if (response.success) {
        toast.success(`${key} saved securely`);
        // Reload to get updated status
        await loadSecrets();
        return true;
      } else {
        toast.error(response.error || 'Failed to save secret');
        return false;
      }
    } catch (error: any) {
      toast.error('Failed to save secret: ' + error.message);
      return false;
    } finally {
      setSaving(null);
    }
  }, [loadSecrets]);

  // Clear a secret
  const clearSecret = useCallback(async (key: string): Promise<boolean> => {
    setSaving(key);
    try {
      const response = await deleteSecret(key);
      
      if (response.success) {
        toast.success(`${key} cleared`);
        await loadSecrets();
        return true;
      } else {
        toast.error(response.error || 'Failed to clear secret');
        return false;
      }
    } catch (error: any) {
      toast.error('Failed to clear secret: ' + error.message);
      return false;
    } finally {
      setSaving(null);
    }
  }, [loadSecrets]);

  // Validate a secret
  const validateSecretKey = useCallback(async (key: string): Promise<boolean> => {
    setValidating(key);
    try {
      const response = await validateSecret(key);
      
      if (response.success && response.data) {
        if (response.data.valid) {
          toast.success(`${key} is valid`);
        } else {
          toast.error(`${key} validation failed: ${response.data.message}`);
        }
        await loadSecrets();
        return response.data.valid;
      } else {
        toast.error(response.error || 'Validation failed');
        return false;
      }
    } catch (error: any) {
      toast.error('Validation error: ' + error.message);
      return false;
    } finally {
      setValidating(null);
    }
  }, [loadSecrets]);

  // Get category status
  const getCategoryStatus = useCallback((categoryId: string): CategoryStatus => {
    const category = SECRET_CATEGORIES.find(c => c.id === categoryId);
    if (!category) {
      return { isConfigured: false, validationStatus: 'unknown', configuredCount: 0, totalCount: 0 };
    }

    let configuredCount = 0;
    let validCount = 0;
    let invalidCount = 0;

    category.fields.forEach(field => {
      const secret = secrets[field.key];
      if (secret?.is_configured) {
        configuredCount++;
        if (secret.validation_status === 'valid') validCount++;
        if (secret.validation_status === 'invalid') invalidCount++;
      }
    });

    const totalCount = category.fields.length;
    const isConfigured = configuredCount === totalCount;
    
    let validationStatus: CategoryStatus['validationStatus'] = 'unknown';
    if (invalidCount > 0) validationStatus = 'invalid';
    else if (validCount === configuredCount && configuredCount > 0) validationStatus = 'valid';
    else if (configuredCount > 0) validationStatus = 'partial';

    return { isConfigured, validationStatus, configuredCount, totalCount };
  }, [secrets]);

  // Check if all required secrets are configured
  const isAllConfigured = Object.keys(secrets).length > 0 && 
    SECRET_CATEGORIES.every(cat => 
      cat.fields.filter(f => f.required).every(f => secrets[f.key]?.is_configured)
    );

  // Load on mount
  useEffect(() => {
    loadSecrets();
  }, [loadSecrets]);

  return {
    secrets,
    loading,
    saving,
    validating,
    loadSecrets,
    saveSecret,
    clearSecret,
    validateSecretKey,
    getCategoryStatus,
    isAllConfigured,
  };
}
