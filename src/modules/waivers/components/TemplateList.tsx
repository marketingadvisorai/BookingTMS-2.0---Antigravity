/**
 * Template List Component
 * Displays waiver templates in a card grid with actions
 * @module waivers/components/TemplateList
 */

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Edit2, Copy, Trash2, ExternalLink, QrCode } from 'lucide-react';
import { WaiverTemplate, TEMPLATE_TYPES } from '../types';
import { getStatusColor, formatDisplayDate } from '../utils/mappers';

interface TemplateListProps {
  templates: WaiverTemplate[];
  isDark: boolean;
  onEdit: (template: WaiverTemplate) => void;
  onPreview: (template: WaiverTemplate) => void;
  onDuplicate: (template: WaiverTemplate) => void;
  onDelete: (template: WaiverTemplate) => void;
  onCopyLink: (template: WaiverTemplate) => void;
  onShowQR: (template: WaiverTemplate) => void;
}

export function TemplateList({
  templates,
  isDark,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onCopyLink,
  onShowQR,
}: TemplateListProps) {
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';

  const getTypeIcon = (type: string) => {
    return TEMPLATE_TYPES.find(t => t.value === type)?.icon || '📄';
  };

  if (templates.length === 0) {
    return (
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardContent className="p-12 text-center">
          <p className={textMutedClass}>No templates found. Create your first waiver template.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card 
          key={template.id} 
          className={`${cardBgClass} border ${borderClass} hover:shadow-md transition-shadow`}
        >
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl
                  ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-100'}`}>
                  {getTypeIcon(template.type)}
                </div>
                <div>
                  <h3 className={`font-medium ${textClass}`}>{template.name}</h3>
                  <p className={`text-sm ${textMutedClass}`}>
                    {TEMPLATE_TYPES.find(t => t.value === template.type)?.label || template.type}
                  </p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={isDark ? 'bg-[#161616] border-[#2a2a2a]' : ''}>
                  <DropdownMenuItem onClick={() => onPreview(template)}>
                    <Eye className="w-4 h-4 mr-2" /> Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(template)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(template)}>
                    <Copy className="w-4 h-4 mr-2" /> Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onCopyLink(template)}>
                    <ExternalLink className="w-4 h-4 mr-2" /> Copy Link
                  </DropdownMenuItem>
                  {template.qrCodeEnabled && (
                    <DropdownMenuItem onClick={() => onShowQR(template)}>
                      <QrCode className="w-4 h-4 mr-2" /> Show QR Code
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(template)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className={`text-sm ${textMutedClass} mb-4 line-clamp-2`}>
              {template.description || 'No description'}
            </p>

            <div className="flex items-center gap-2 mb-4">
              <Badge className={getStatusColor(template.status, isDark)}>
                {template.status}
              </Badge>
              {template.qrCodeEnabled && (
                <Badge variant="outline" className={isDark ? 'border-[#3a3a3a]' : ''}>
                  <QrCode className="w-3 h-3 mr-1" /> QR
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className={textMutedClass}>
                {template.usageCount} signatures
              </span>
              <span className={textMutedClass}>
                Updated {formatDisplayDate(template.updatedAt)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
