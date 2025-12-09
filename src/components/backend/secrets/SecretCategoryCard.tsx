/**
 * Secret Category Card Component
 * Displays a category of secrets with inputs for each field
 * @module components/backend/secrets/SecretCategoryCard
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Brain,
  Mail,
  MessageSquare,
  Eye,
  EyeOff,
  Save,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { type SecretCategory, type CategoryStatus } from './types';
import { type SecretInfo } from '@/services/secrets.service';

// ============================================================================
// Types
// ============================================================================

interface SecretCategoryCardProps {
  category: SecretCategory;
  secrets: Record<string, SecretInfo>;
  categoryStatus: CategoryStatus;
  saving: string | null;
  validating: string | null;
  onSave: (key: string, value: string, category: string) => Promise<boolean>;
  onClear: (key: string) => Promise<boolean>;
  onValidate: (key: string) => Promise<boolean>;
  isDark: boolean;
}

// ============================================================================
// Icon Map
// ============================================================================

const iconMap: Record<string, React.ComponentType<any>> = {
  CreditCard,
  Brain,
  Mail,
  MessageSquare,
};

// ============================================================================
// Color Map
// ============================================================================

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  green: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
  red: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
};

// ============================================================================
// Component
// ============================================================================

export function SecretCategoryCard({
  category,
  secrets,
  categoryStatus,
  saving,
  validating,
  onSave,
  onClear,
  onValidate,
  isDark,
}: SecretCategoryCardProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const IconComponent = iconMap[category.icon] || CreditCard;
  const colors = colorMap[category.color] || colorMap.blue;

  const bgCard = isDark ? 'bg-[#161616]' : 'bg-white';
  const bgInput = isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';

  const handleInputChange = (key: string, value: string) => {
    setInputValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    const value = inputValues[key];
    if (!value?.trim()) return;

    const success = await onSave(key, value, category.id);
    if (success) {
      setInputValues(prev => ({ ...prev, [key]: '' }));
    }
  };

  const toggleShow = (key: string) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getStatusBadge = () => {
    switch (categoryStatus.validationStatus) {
      case 'valid':
        return <Badge className="bg-green-500/10 text-green-500 border-0">Valid</Badge>;
      case 'invalid':
        return <Badge className="bg-red-500/10 text-red-500 border-0">Invalid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-0">Partial</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 border-0">Not Tested</Badge>;
    }
  };

  return (
    <Card className={`${bgCard} border ${borderColor}`}>
      {/* Header */}
      <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.bg}`}>
            <IconComponent className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div>
            <h3 className={`font-medium ${textPrimary}`}>{category.name}</h3>
            <p className={`text-sm ${textSecondary}`}>{category.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${textSecondary}`}>
            {categoryStatus.configuredCount}/{categoryStatus.totalCount}
          </span>
          {getStatusBadge()}
        </div>
      </div>

      {/* Fields */}
      <div className="p-4 space-y-4">
        {category.fields.map((field) => {
          const secret = secrets[field.key];
          const isConfigured = secret?.is_configured;
          const isSaving = saving === field.key;
          const isValidating = validating === field.key;
          const showValue = showValues[field.key];

          return (
            <div key={field.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className={`text-sm ${textPrimary}`}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <div className="flex items-center gap-2">
                  {isConfigured && (
                    <>
                      {secret.validation_status === 'valid' && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {secret.validation_status === 'invalid' && (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      {secret.validation_status === 'unknown' && (
                        <AlertCircle className="w-4 h-4 text-gray-500" />
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showValue ? 'text' : 'password'}
                    value={inputValues[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    placeholder={isConfigured ? secret.masked_value || '••••••••' : field.placeholder}
                    className={`${bgInput} border ${borderColor} pr-10`}
                    disabled={isSaving}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShow(field.key)}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 ${textSecondary} hover:${textPrimary}`}
                  >
                    {showValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave(field.key)}
                  disabled={!inputValues[field.key]?.trim() || isSaving}
                  className={`border ${borderColor}`}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                </Button>

                {isConfigured && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onValidate(field.key)}
                      disabled={isValidating}
                      className={`border ${borderColor}`}
                    >
                      {isValidating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onClear(field.key)}
                      disabled={isSaving}
                      className={`border ${borderColor} text-red-500 hover:text-red-600`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
