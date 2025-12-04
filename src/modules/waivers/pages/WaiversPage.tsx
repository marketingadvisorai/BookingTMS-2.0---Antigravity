/**
 * Waivers Page
 * Main page for managing waiver templates and signed waivers
 * @module waivers/pages/WaiversPage
 */

import { useState } from 'react';
import { useTheme } from '@/components/layout/ThemeContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { FileText, FilePlus, Plus, QrCode } from 'lucide-react';
import { toast } from 'sonner';

import { useWaivers } from '../hooks/useWaivers';
import {
  WaiverStatsCards,
  TemplateList,
  WaiverTable,
  TemplateEditorDialog,
} from '../components';
import { WaiverTemplate, WaiverRecord } from '../types';

// Import existing dialog components (to be migrated later)
import WaiverPreview from '@/components/waivers/WaiverPreview';
import ScanWaiverDialog from '@/components/waivers/ScanWaiverDialog';

export function WaiversPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    templates,
    waivers,
    templateStats,
    waiverStats,
    loadingTemplates,
    loadingWaivers,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    deleteWaiver,
    sendReminders,
    filters,
    setFilters,
  } = useWaivers();

  // Dialog states
  const [activeTab, setActiveTab] = useState<'records' | 'templates'>('records');
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showScanDialog, setShowScanDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WaiverTemplate | null>(null);
  const [selectedWaiver, setSelectedWaiver] = useState<WaiverRecord | null>(null);

  // Template handlers
  const handleCreateTemplate = () => {
    setSelectedTemplate(null);
    setShowTemplateEditor(true);
  };

  const handleEditTemplate = (template: WaiverTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateEditor(true);
  };

  const handlePreviewTemplate = (template: WaiverTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleDuplicateTemplate = async (template: WaiverTemplate) => {
    try {
      await duplicateTemplate(template.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to duplicate template');
    }
  };

  const handleDeleteTemplate = async (template: WaiverTemplate) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteTemplate(template.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete template');
    }
  };

  const handleCopyLink = async (template: WaiverTemplate) => {
    const url = `${window.location.origin}/waiver-form/${template.id}`;
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleShowQR = (template: WaiverTemplate) => {
    setSelectedTemplate(template);
    setShowScanDialog(true);
  };

  const handleSaveTemplate = async (data: Partial<WaiverTemplate>) => {
    if (selectedTemplate) {
      await updateTemplate(selectedTemplate.id, data);
    } else {
      await createTemplate(data);
    }
  };

  // Waiver handlers
  const handleViewWaiver = (waiver: WaiverRecord) => {
    setSelectedWaiver(waiver);
    setShowPreview(true);
  };

  const handleDownloadWaiver = (waiver: WaiverRecord) => {
    // TODO: Implement PDF download
    toast.info('PDF download coming soon');
  };

  const handleDeleteWaiver = async (waiver: WaiverRecord) => {
    if (!confirm('Are you sure you want to delete this waiver?')) return;
    try {
      await deleteWaiver(waiver.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete waiver');
    }
  };

  const handleSendReminders = async (selectedWaivers: WaiverRecord[]) => {
    const pendingWaivers = selectedWaivers.filter(w => w.status === 'pending');
    if (pendingWaivers.length === 0) {
      toast.info('No pending waivers to remind');
      return;
    }
    await sendReminders(pendingWaivers.map(w => w.id));
  };

  const handleBulkDelete = async (selectedWaivers: WaiverRecord[]) => {
    if (!confirm(`Delete ${selectedWaivers.length} waivers?`)) return;
    for (const waiver of selectedWaivers) {
      await deleteWaiver(waiver.id);
    }
    toast.success(`Deleted ${selectedWaivers.length} waivers`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Waivers"
        description="Manage liability waivers and customer agreements"
        sticky
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowScanDialog(true)}>
              <QrCode className="w-4 h-4 mr-2" />
              Scan Waiver
            </Button>
            <Button onClick={handleCreateTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        }
      />

      <WaiverStatsCards
        waiverStats={waiverStats}
        templateStats={templateStats}
        isDark={isDark}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="records" className="gap-2">
            <FileText className="w-4 h-4" />
            Waiver Records ({waivers.length})
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FilePlus className="w-4 h-4" />
            Templates ({templates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="mt-6">
          <WaiverTable
            waivers={waivers}
            loading={loadingWaivers}
            isDark={isDark}
            filters={filters}
            onFiltersChange={setFilters}
            onView={handleViewWaiver}
            onDownload={handleDownloadWaiver}
            onDelete={handleDeleteWaiver}
            onSendReminder={handleSendReminders}
            onBulkDelete={handleBulkDelete}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplateList
            templates={templates}
            isDark={isDark}
            onEdit={handleEditTemplate}
            onPreview={handlePreviewTemplate}
            onDuplicate={handleDuplicateTemplate}
            onDelete={handleDeleteTemplate}
            onCopyLink={handleCopyLink}
            onShowQR={handleShowQR}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <TemplateEditorDialog
        template={selectedTemplate}
        isOpen={showTemplateEditor}
        isDark={isDark}
        onClose={() => setShowTemplateEditor(false)}
        onSave={handleSaveTemplate}
      />

      {showPreview && (selectedTemplate || selectedWaiver) && (
        <WaiverPreview
          template={selectedTemplate}
          waiver={selectedWaiver as any}
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setSelectedTemplate(null);
            setSelectedWaiver(null);
          }}
        />
      )}

      {showScanDialog && (
        <ScanWaiverDialog
          isOpen={showScanDialog}
          onClose={() => setShowScanDialog(false)}
        />
      )}
    </div>
  );
}
