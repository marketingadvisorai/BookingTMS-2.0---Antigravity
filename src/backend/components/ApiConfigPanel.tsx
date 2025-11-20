/**
 * API Configuration Panel
 * Secure API configuration management interface
 * @module backend/components
 */

import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ApiConfig {
  stripe: {
    configured: boolean;
    testMode: boolean;
    accountId?: string;
    country?: string;
  };
  supabase: {
    configured: boolean;
    url?: string;
    projectId?: string;
  };
}

interface StripeFormData {
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

export const ApiConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<ApiConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [stripeForm, setStripeForm] = useState<StripeFormData>({
    STRIPE_SECRET_KEY: '',
    STRIPE_PUBLISHABLE_KEY: '',
    STRIPE_WEBHOOK_SECRET: '',
  });
  const [message, setMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const API_BASE_URL = 'http://localhost:3001'; // Backend API URL

  // Load configuration on component mount
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/config`);
      const result = await response.json();
      
      if (result.success) {
        setConfig(result.data);
      } else {
        setMessage({ type: 'error', text: 'Failed to load configuration' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to connect to backend API' });
    } finally {
      setLoading(false);
    }
  };

  const saveStripeConfig = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch(`${API_BASE_URL}/api/config/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: 'stripe',
          config: stripeForm,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Stripe configuration saved! ${result.test.message}` 
        });
        await loadConfig(); // Reload to get updated status
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to save configuration' 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const testStripeConnection = async () => {
    try {
      setTesting(true);
      setMessage(null);

      const response = await fetch(`${API_BASE_URL}/api/config/test/stripe`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Stripe connection successful! Account: ${result.test.details.accountId}` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.test.message || 'Stripe connection failed' 
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to test Stripe connection' });
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (field: keyof StripeFormData, value: string) => {
    setStripeForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid = () => {
    return stripeForm.STRIPE_SECRET_KEY.trim() !== '' &&
           stripeForm.STRIPE_PUBLISHABLE_KEY.trim() !== '' &&
           stripeForm.STRIPE_WEBHOOK_SECRET.trim() !== '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading configuration...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">API Configuration</h1>
      
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-blue-50 text-blue-700 border border-blue-200'
        }`}>
          {message.type === 'success' && <CheckCircle className="h-5 w-5" />}
          {message.type === 'error' && <XCircle className="h-5 w-5" />}
          {message.type === 'info' && <AlertCircle className="h-5 w-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Stripe Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 font-semibold">S</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Stripe</h2>
              <p className="text-sm text-gray-600">Stripe payment processing API keys</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {config?.stripe.configured ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Configured
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Not Configured
              </span>
            )}
            {config?.stripe.testMode && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Test Mode
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Secret Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secret Key <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Your Stripe secret key for server-side operations
            </p>
            <div className="relative">
              <input
                type={showSecrets ? 'text' : 'password'}
                value={stripeForm.STRIPE_SECRET_KEY}
                onChange={(e) => handleInputChange('STRIPE_SECRET_KEY', e.target.value)}
                placeholder="sk_test_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showSecrets ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Publishable Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Publishable Key <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Your Stripe publishable key for client-side operations
            </p>
            <input
              type="text"
              value={stripeForm.STRIPE_PUBLISHABLE_KEY}
              onChange={(e) => handleInputChange('STRIPE_PUBLISHABLE_KEY', e.target.value)}
              placeholder="pk_test_..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Webhook Secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Webhook Secret
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Secret for verifying Stripe webhook events
            </p>
            <div className="relative">
              <input
                type={showSecrets ? 'text' : 'password'}
                value={stripeForm.STRIPE_WEBHOOK_SECRET}
                onChange={(e) => handleInputChange('STRIPE_WEBHOOK_SECRET', e.target.value)}
                placeholder="whsec_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showSecrets ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={testStripeConnection}
            disabled={testing || !config?.stripe.configured}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </button>

          <button
            onClick={saveStripeConfig}
            disabled={saving || !isFormValid()}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </button>
        </div>

        {/* Account Info */}
        {config?.stripe.configured && config.stripe.accountId && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Account ID:</strong> {config.stripe.accountId}
            </p>
            {config.stripe.country && (
              <p className="text-sm text-gray-600">
                <strong>Country:</strong> {config.stripe.country}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Supabase Status (Read-only) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-semibold">S</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Supabase</h2>
              <p className="text-sm text-gray-600">Supabase database and authentication</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {config?.supabase.configured ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Configured
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Not Configured
              </span>
            )}
          </div>
        </div>

        {config?.supabase.configured && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Project ID:</strong> {config.supabase.projectId}
            </p>
            <p className="text-sm text-gray-600">
              <strong>URL:</strong> {config.supabase.url}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiConfigPanel;
