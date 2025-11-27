/**
 * Embed Pro 1.1 - Embed Config Card Component
 * @module embed-pro/components/EmbedConfigCard
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Eye, 
  Code, 
  MoreVertical, 
  Copy, 
  Trash2, 
  Edit,
  ToggleLeft,
  ToggleRight,
  BarChart3
} from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { Button } from '../../../components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { EMBED_TYPES, type EmbedConfigWithRelations } from '../types';

interface EmbedConfigCardProps {
  config: EmbedConfigWithRelations;
  onSelect?: (config: EmbedConfigWithRelations) => void;
  onEdit?: (config: EmbedConfigWithRelations) => void;
  onDuplicate?: (config: EmbedConfigWithRelations) => void;
  onDelete?: (config: EmbedConfigWithRelations) => void;
  onToggleActive?: (config: EmbedConfigWithRelations) => void;
  onViewAnalytics?: (config: EmbedConfigWithRelations) => void;
  isSelected?: boolean;
}

export const EmbedConfigCard: React.FC<EmbedConfigCardProps> = ({
  config,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onToggleActive,
  onViewAnalytics,
  isSelected = false,
}) => {
  const typeInfo = EMBED_TYPES.find(t => t.value === config.type);
  const targetLabel = config.target_type === 'activity' 
    ? 'Activity' 
    : config.target_type === 'venue' 
      ? 'Venue' 
      : 'Multi-Activity';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className={cn(
        'p-4 rounded-xl border-2 cursor-pointer transition-all',
        isSelected
          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
      )}
      onClick={() => onSelect?.(config)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            config.is_active 
              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
          )}>
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
              {config.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {typeInfo?.label || config.type}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(config)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(config)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewAnalytics?.(config)}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onToggleActive?.(config)}>
              {config.is_active ? (
                <>
                  <ToggleLeft className="w-4 h-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <ToggleRight className="w-4 h-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete?.(config)}
              className="text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Eye className="w-4 h-4" />
          <span>{config.view_count.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{config.booking_count.toLocaleString()}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <span className={cn(
          'text-xs px-2 py-1 rounded-full',
          config.is_active
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        )}>
          {config.is_active ? 'Active' : 'Inactive'}
        </span>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {targetLabel}
        </span>
      </div>

      {/* Embed Key */}
      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-mono">
          <Code className="w-3 h-3" />
          <span className="truncate">{config.embed_key}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default EmbedConfigCard;
