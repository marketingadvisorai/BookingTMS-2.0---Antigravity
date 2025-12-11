/**
 * KnowledgeBaseManager
 * System admin component for managing AI knowledge base entries
 */

import React, { useState } from 'react';
import { Plus, Search, FileText, Trash2, Edit2, BookOpen, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KnowledgeEntry {
  id: string;
  type: 'faq' | 'business_info' | 'pricing' | 'policy' | 'activity' | 'custom';
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

interface KnowledgeBaseManagerProps {
  organizationId: string;
  isDark: boolean;
}

const MOCK_ENTRIES: KnowledgeEntry[] = [
  { id: '1', type: 'faq', title: 'What are your business hours?', content: 'We are open daily from 10 AM to 10 PM.', isActive: true, createdAt: '2025-12-01' },
  { id: '2', type: 'pricing', title: 'Group discount policy', content: 'Groups of 6+ receive 15% discount.', isActive: true, createdAt: '2025-12-01' },
  { id: '3', type: 'policy', title: 'Cancellation policy', content: '24 hours notice required for full refund.', isActive: true, createdAt: '2025-12-01' },
];

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  faq: { label: 'FAQ', color: 'bg-blue-500/20 text-blue-400' },
  business_info: { label: 'Business', color: 'bg-green-500/20 text-green-400' },
  pricing: { label: 'Pricing', color: 'bg-purple-500/20 text-purple-400' },
  policy: { label: 'Policy', color: 'bg-orange-500/20 text-orange-400' },
  activity: { label: 'Activity', color: 'bg-cyan-500/20 text-cyan-400' },
  custom: { label: 'Custom', color: 'bg-gray-500/20 text-gray-400' },
};

export function KnowledgeBaseManager({ organizationId, isDark }: KnowledgeBaseManagerProps) {
  const [entries, setEntries] = useState<KnowledgeEntry[]>(MOCK_ENTRIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMutedClass = isDark ? 'text-[#a3a3a3]' : 'text-gray-600';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const inputClass = isDark ? 'bg-[#0a0a0a] border-[#2a2a2a]' : '';

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || entry.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleDelete = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className={`text-xl font-semibold ${textClass}`}>Knowledge Base</h2>
          <p className={`text-sm ${textMutedClass}`}>
            Train your AI agents with FAQs, policies, and business information
          </p>
        </div>
        <Button className={isDark ? 'bg-[#4f46e5] hover:bg-[#4338ca]' : ''}>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMutedClass}`} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className={`pl-10 ${inputClass}`}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className={`w-[150px] ${inputClass}`}>
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="faq">FAQ</SelectItem>
            <SelectItem value="business_info">Business Info</SelectItem>
            <SelectItem value="pricing">Pricing</SelectItem>
            <SelectItem value="policy">Policy</SelectItem>
            <SelectItem value="activity">Activity</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={handleRefresh}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(TYPE_LABELS).slice(0, 4).map(([type, { label, color }]) => {
          const count = entries.filter((e) => e.type === type).length;
          return (
            <Card key={type} className={`${cardBgClass} border ${borderClass}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <span className={`text-sm ${textMutedClass}`}>{label}</span>
                <Badge className={`${isDark ? color : ''} border-0`}>{count}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Entries List */}
      <Card className={`${cardBgClass} border ${borderClass}`}>
        <CardHeader className="p-4 pb-2">
          <CardTitle className={`text-sm ${textClass}`}>
            {filteredEntries.length} {filteredEntries.length === 1 ? 'Entry' : 'Entries'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {filteredEntries.length === 0 ? (
            <div className={`text-center py-8 ${textMutedClass}`}>
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No entries found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-start justify-between p-4 rounded-lg border ${borderClass} ${isDark ? 'bg-[#1e1e1e]' : 'bg-gray-50'}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <FileText className={`w-5 h-5 mt-0.5 ${textMutedClass}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${textClass}`}>{entry.title}</span>
                        <Badge className={`${isDark ? TYPE_LABELS[entry.type].color : ''} border-0 text-xs`}>
                          {TYPE_LABELS[entry.type].label}
                        </Badge>
                      </div>
                      <p className={`text-sm ${textMutedClass} line-clamp-2`}>{entry.content}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(entry.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
