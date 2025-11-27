/**
 * Embed Pro 1.1 - Main Dashboard Component
 * @module embed-pro/components/EmbedProDashboard
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter,
  LayoutGrid,
  List,
  Loader2,
  Code2,
  Sparkles,
  ArrowRight,
  Calendar,
  MousePointer2,
  Maximize2,
  BarChart3
} from 'lucide-react';
import { cn } from '../../../components/ui/utils';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useEmbedConfigs } from '../hooks';
import { EmbedConfigCard } from './EmbedConfigCard';
import { EmbedCodeDisplay } from './EmbedCodeDisplay';
import { EmbedPreviewPanel } from './EmbedPreviewPanel';
import { CreateEmbedModal } from './CreateEmbedModal';
import type { EmbedConfigWithRelations, EmbedType } from '../types';

interface EmbedProDashboardProps {
  organizationId: string;
  activities?: { id: string; name: string }[];
  venues?: { id: string; name: string }[];
  isLoading?: boolean;
}

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | EmbedType;

export const EmbedProDashboard: React.FC<EmbedProDashboardProps> = ({
  organizationId,
  activities = [],
  venues = [],
  isLoading: externalLoading = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedConfig, setSelectedConfig] = useState<EmbedConfigWithRelations | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    configs,
    loading,
    error,
    create,
    remove,
    duplicate,
    toggleActive,
  } = useEmbedConfigs({ organizationId });

  // Filter configs
  const filteredConfigs = useMemo(() => {
    return configs.filter((config) => {
      const matchesSearch = config.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || config.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [configs, searchQuery, filterType]);

  // Stats
  const stats = useMemo(() => ({
    total: configs.length,
    active: configs.filter(c => c.is_active).length,
    views: configs.reduce((sum, c) => sum + c.view_count, 0),
    bookings: configs.reduce((sum, c) => sum + c.booking_count, 0),
  }), [configs]);

  const handleDelete = async (config: EmbedConfigWithRelations) => {
    if (confirm(`Delete "${config.name}"? This cannot be undone.`)) {
      await remove(config.id);
      if (selectedConfig?.id === config.id) {
        setSelectedConfig(null);
      }
    }
  };

  // Loading state (include external loading for activities/venues)
  if ((loading || externalLoading) && configs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading your embeds...</p>
        </div>
      </div>
    );
  }

  // Welcome state when no embeds exist
  if (!loading && !externalLoading && configs.length === 0) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 mb-6"
          >
            <Code2 className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 dark:text-white mb-3"
          >
            Welcome to Embed Pro 1.1
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 dark:text-gray-400 text-lg max-w-lg mx-auto"
          >
            Create beautiful, customizable booking widgets and embed them anywhere on the web.
          </motion.p>
        </div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: Calendar, title: 'Booking Widget', desc: 'Full booking experience' },
            { icon: MousePointer2, title: 'Button Widget', desc: 'Book Now popup trigger' },
            { icon: Maximize2, title: 'Popup Widget', desc: 'Modal booking flow' },
            { icon: BarChart3, title: 'Analytics', desc: 'Track widget performance' },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
            >
              <feature.icon className="w-8 h-8 text-blue-500 mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{feature.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center pt-4"
        >
          <Button
            onClick={() => setShowCreateModal(true)}
            size="lg"
            className="gap-2 shadow-lg shadow-blue-500/25"
          >
            <Sparkles className="w-5 h-5" />
            Create Your First Embed
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Select from multiple widget types and customize to match your brand
          </p>
        </motion.div>

        {/* Create Modal */}
        <CreateEmbedModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={async (input) => {
            const newConfig = await create(input);
            setSelectedConfig(newConfig);
          }}
          organizationId={organizationId}
          activities={activities}
          venues={venues}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-7 h-7 text-blue-500" />
            Embed Pro 1.1
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Create and manage your booking widgets
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Embed
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Embeds', value: stats.total, color: 'blue' },
          { label: 'Active', value: stats.active, color: 'green' },
          { label: 'Total Views', value: stats.views.toLocaleString(), color: 'purple' },
          { label: 'Total Bookings', value: stats.bookings.toLocaleString(), color: 'orange' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search embeds..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="booking-widget">Booking</SelectItem>
              <SelectItem value="calendar-widget">Calendar</SelectItem>
              <SelectItem value="button-widget">Button</SelectItem>
              <SelectItem value="popup-widget">Popup</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'grid' 
                ? 'bg-white dark:bg-gray-600 shadow-sm' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-md transition-colors',
              viewMode === 'list' 
                ? 'bg-white dark:bg-gray-600 shadow-sm' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredConfigs.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <Code2 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery ? 'No embeds match your search' : 'No embeds yet'}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Your First Embed
                </Button>
              </div>
            ) : (
              <div className={cn(
                'gap-4',
                viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2' : 'space-y-3'
              )}>
                {filteredConfigs.map((config) => (
                  <EmbedConfigCard
                    key={config.id}
                    config={config}
                    isSelected={selectedConfig?.id === config.id}
                    onSelect={setSelectedConfig}
                    onDuplicate={() => duplicate(config.id)}
                    onDelete={() => handleDelete(config)}
                    onToggleActive={() => toggleActive(config.id, !config.is_active)}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview & Code Panel */}
        <div className="space-y-6">
          <EmbedPreviewPanel configId={selectedConfig?.id || null} />
          <EmbedCodeDisplay config={selectedConfig} />
        </div>
      </div>

      {/* Create Modal */}
      <CreateEmbedModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={async (input) => {
          const newConfig = await create(input);
          setSelectedConfig(newConfig);
        }}
        organizationId={organizationId}
        activities={activities}
        venues={venues}
      />
    </div>
  );
};

export default EmbedProDashboard;
