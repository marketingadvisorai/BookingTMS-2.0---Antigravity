/**
 * Embed Pro 2.0 - Venue Layout Panel
 * @module embed-pro/components/VenueLayoutPanel
 * 
 * Configuration panel for venue embed layouts.
 * Allows customization of activity display: grid/list/carousel,
 * card styles, visibility toggles, and sorting options.
 */

import React from 'react';
import {
  LayoutGrid,
  List,
  Play,
  Image,
  DollarSign,
  Clock,
  Users,
  ArrowUpDown,
  Search,
  Filter,
  Smartphone,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { VenueLayoutConfig } from '../types/embed-config.types';

// =====================================================
// PROPS INTERFACE
// =====================================================

interface VenueLayoutPanelProps {
  config: VenueLayoutConfig;
  onChange: (updates: Partial<VenueLayoutConfig>) => void;
  disabled?: boolean;
}

// =====================================================
// COMPONENT
// =====================================================

export const VenueLayoutPanel: React.FC<VenueLayoutPanelProps> = ({
  config,
  onChange,
  disabled = false,
}) => {
  const displayModes = [
    { value: 'grid', label: 'Grid', icon: LayoutGrid },
    { value: 'list', label: 'List', icon: List },
    { value: 'carousel', label: 'Carousel', icon: Play },
  ];

  const cardStyles = [
    { value: 'default', label: 'Default' },
    { value: 'compact', label: 'Compact' },
    { value: 'detailed', label: 'Detailed' },
    { value: 'horizontal', label: 'Horizontal' },
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'duration', label: 'Duration' },
    { value: 'popularity', label: 'Popularity' },
  ];

  return (
    <div className="space-y-6">
      {/* Display Mode */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Display Mode</Label>
        <div className="grid grid-cols-3 gap-2">
          {displayModes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              disabled={disabled}
              onClick={() => onChange({ displayMode: value as VenueLayoutConfig['displayMode'] })}
              className={`
                flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border transition-all
                ${config.displayMode === value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Columns (only for grid mode) */}
      {config.displayMode === 'grid' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Grid Columns</Label>
            <span className="text-sm text-gray-500">{config.gridColumns || 2}</span>
          </div>
          <Slider
            value={[config.gridColumns || 2]}
            min={1}
            max={4}
            step={1}
            disabled={disabled}
            onValueChange={([value]) => onChange({ gridColumns: value as 1 | 2 | 3 | 4 })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
          </div>
        </div>
      )}

      {/* Card Style */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Card Style</Label>
        <Select
          value={config.cardStyle || 'default'}
          onValueChange={(value) => onChange({ cardStyle: value as VenueLayoutConfig['cardStyle'] })}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select card style" />
          </SelectTrigger>
          <SelectContent>
            {cardStyles.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Visibility Toggles */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Show on Cards</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Activity Image</span>
            </div>
            <Switch
              checked={config.showActivityImage !== false}
              onCheckedChange={(checked) => onChange({ showActivityImage: checked })}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Price</span>
            </div>
            <Switch
              checked={config.showActivityPrice !== false}
              onCheckedChange={(checked) => onChange({ showActivityPrice: checked })}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Duration</span>
            </div>
            <Switch
              checked={config.showActivityDuration !== false}
              onCheckedChange={(checked) => onChange({ showActivityDuration: checked })}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Capacity</span>
            </div>
            <Switch
              checked={config.showActivityCapacity !== false}
              onCheckedChange={(checked) => onChange({ showActivityCapacity: checked })}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Sorting */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Sorting</Label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-gray-500 mb-1">Sort By</Label>
            <Select
              value={config.sortBy || 'name'}
              onValueChange={(value) => onChange({ sortBy: value as VenueLayoutConfig['sortBy'] })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1">Order</Label>
            <Select
              value={config.sortOrder || 'asc'}
              onValueChange={(value) => onChange({ sortOrder: value as 'asc' | 'desc' })}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">Features</Label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Enable Search</span>
            </div>
            <Switch
              checked={config.enableSearch === true}
              onCheckedChange={(checked) => onChange({ enableSearch: checked })}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Enable Filters</span>
            </div>
            <Switch
              checked={config.enableFilters === true}
              onCheckedChange={(checked) => onChange({ enableFilters: checked })}
              disabled={disabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Compact on Mobile</span>
            </div>
            <Switch
              checked={config.compactOnMobile !== false}
              onCheckedChange={(checked) => onChange({ compactOnMobile: checked })}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* Max Activities Limit */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-gray-700">Max Activities</Label>
          <span className="text-sm text-gray-500">
            {config.maxActivities === 0 ? 'All' : config.maxActivities}
          </span>
        </div>
        <Slider
          value={[config.maxActivities || 0]}
          min={0}
          max={12}
          step={1}
          disabled={disabled}
          onValueChange={([value]) => onChange({ maxActivities: value })}
          className="w-full"
        />
        <p className="text-xs text-gray-400">Set to 0 to show all activities</p>
      </div>
    </div>
  );
};

export default VenueLayoutPanel;
