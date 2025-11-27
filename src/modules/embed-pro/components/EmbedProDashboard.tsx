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
  BarChart3,
  X,
  TrendingUp,
  Eye,
  MousePointerClick
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { useEmbedConfigs } from '../hooks';
import { EmbedConfigCard } from './EmbedConfigCard';
import { EmbedCodeDisplay } from './EmbedCodeDisplay';
import { EmbedPreviewPanel } from './EmbedPreviewPanel';
import { CreateEmbedModal } from './CreateEmbedModal';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import type { EmbedConfigWithRelations, EmbedType } from '../types';
import { toast } from 'sonner';

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<EmbedConfigWithRelations | null>(null);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsConfig, setAnalyticsConfig] = useState<EmbedConfigWithRelations | null>(null);

  const {
    configs,
    loading,
    error,
    create,
    update,
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

  // Handle Edit
  const handleEdit = (config: EmbedConfigWithRelations) => {
    setEditingConfig(config);
    setShowEditModal(true);
  };

  // Handle Duplicate
  const handleDuplicate = async (config: EmbedConfigWithRelations) => {
    try {
      const newConfig = await duplicate(config.id);
      toast.success(`Duplicated "${config.name}" successfully!`);
      setSelectedConfig(newConfig);
    } catch (err) {
      toast.error('Failed to duplicate embed config');
    }
  };

  // Handle Analytics
  const handleViewAnalytics = (config: EmbedConfigWithRelations) => {
    setAnalyticsConfig(config);
    setShowAnalyticsModal(true);
  };

  // Handle Toggle Active
  const handleToggleActive = async (config: EmbedConfigWithRelations) => {
    try {
      await toggleActive(config.id, !config.is_active);
      toast.success(config.is_active ? 'Embed deactivated' : 'Embed activated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Handle Delete
  const handleDelete = async (config: EmbedConfigWithRelations) => {
    if (confirm(`Delete "${config.name}"? This cannot be undone.`)) {
      try {
        await remove(config.id);
        toast.success('Embed deleted successfully');
        if (selectedConfig?.id === config.id) {
          setSelectedConfig(null);
        }
      } catch (err) {
        toast.error('Failed to delete embed');
      }
    }
  };

  // Handle Update from Edit Modal
  const handleUpdate = async (id: string, name: string) => {
    try {
      await update(id, { name });
      toast.success('Embed updated successfully');
      setShowEditModal(false);
      setEditingConfig(null);
    } catch (err) {
      toast.error('Failed to update embed');
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
                    onEdit={() => handleEdit(config)}
                    onDuplicate={() => handleDuplicate(config)}
                    onDelete={() => handleDelete(config)}
                    onToggleActive={() => handleToggleActive(config)}
                    onViewAnalytics={() => handleViewAnalytics(config)}
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
          toast.success('Embed created successfully!');
        }}
        organizationId={organizationId}
        activities={activities}
        venues={venues}
      />

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Embed</DialogTitle>
          </DialogHeader>
          {editingConfig && (
            <EditEmbedForm
              config={editingConfig}
              onSave={handleUpdate}
              onCancel={() => {
                setShowEditModal(false);
                setEditingConfig(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Analytics Modal */}
      <Dialog open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Analytics: {analyticsConfig?.name}
            </DialogTitle>
          </DialogHeader>
          {analyticsConfig && (
            <AnalyticsDashboard config={analyticsConfig} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// =====================================================
// EDIT FORM COMPONENT
// =====================================================

interface EditEmbedFormProps {
  config: EmbedConfigWithRelations;
  onSave: (id: string, name: string) => void;
  onCancel: () => void;
}

const EditEmbedForm: React.FC<EditEmbedFormProps> = ({ config, onSave, onCancel }) => {
  const [name, setName] = useState(config.name);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave(config.id, name.trim());
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Embed Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter embed name"
          autoFocus
        />
      </div>
      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !name.trim()}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>
    </form>
  );
};

// =====================================================
// ANALYTICS SUMMARY COMPONENT
// =====================================================

interface AnalyticsSummaryProps {
  config: EmbedConfigWithRelations;
}

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ config }) => {
  // Calculate conversion rate
  const conversionRate = config.view_count > 0
    ? ((config.booking_count / config.view_count) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {config.view_count.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center gap-2 mb-2">
            <MousePointerClick className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Bookings</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {config.booking_count.toLocaleString()}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Conversion</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {conversionRate}%
          </p>
        </div>
      </div>

      {/* Embed Details */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Embed Details
        </h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <span className="ml-2 font-medium">{config.type}</span>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <span className={`ml-2 font-medium ${config.is_active ? 'text-green-600' : 'text-gray-500'}`}>
              {config.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Target:</span>
            <span className="ml-2 font-medium capitalize">{config.target_type}</span>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>
            <span className="ml-2 font-medium">
              {new Date(config.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Embed Key */}
      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 font-mono text-xs text-gray-500 break-all">
        {config.embed_key}
      </div>
    </div>
  );
};

export default EmbedProDashboard;
