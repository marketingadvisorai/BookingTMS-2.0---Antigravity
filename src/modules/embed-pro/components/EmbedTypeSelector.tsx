/**
 * Embed Pro 1.1 - Embed Type Selector Component
 * @module embed-pro/components/EmbedTypeSelector
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CalendarDays, 
  MousePointerClick, 
  LayoutTemplate, 
  Maximize2,
  Check
} from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { EMBED_TYPES, type EmbedType } from '../types';

interface EmbedTypeSelectorProps {
  value: EmbedType;
  onChange: (type: EmbedType) => void;
  disabled?: boolean;
}

const iconMap = {
  Calendar,
  CalendarDays,
  MousePointerClick,
  LayoutTemplate,
  Maximize2,
};

export const EmbedTypeSelector: React.FC<EmbedTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {EMBED_TYPES.map((type) => {
        const Icon = iconMap[type.icon as keyof typeof iconMap] || Calendar;
        const isSelected = value === type.value;

        return (
          <motion.button
            key={type.value}
            type="button"
            onClick={() => !disabled && onChange(type.value)}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={cn(
              'relative p-4 rounded-xl border-2 text-left transition-all',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {/* Selected indicator */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center"
              >
                <Check className="w-3 h-3 text-white" />
              </motion.div>
            )}

            {/* Icon */}
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center mb-3',
              isSelected 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            )}>
              <Icon className="w-5 h-5" />
            </div>

            {/* Label */}
            <h3 className={cn(
              'font-semibold mb-1',
              isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
            )}>
              {type.label}
            </h3>

            {/* Description */}
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
              {type.description}
            </p>

            {/* Best for tags */}
            <div className="flex flex-wrap gap-1 mt-3">
              {type.bestFor.slice(0, 2).map((use) => (
                <span
                  key={use}
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    isSelected
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  )}
                >
                  {use}
                </span>
              ))}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default EmbedTypeSelector;
