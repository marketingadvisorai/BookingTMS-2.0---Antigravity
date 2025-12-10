/**
 * Organization Selector Component
 * Dropdown for system admins to select organization when creating staff
 * @module staff/components/OrganizationSelector
 */

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface Organization {
  id: string;
  name: string;
  status: string;
}

interface OrganizationSelectorProps {
  value: string;
  onChange: (orgId: string) => void;
  isDark: boolean;
  disabled?: boolean;
}

export function OrganizationSelector({ value, onChange, isDark, disabled }: OrganizationSelectorProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name, status')
          .eq('status', 'active')
          .order('name');

        if (error) throw error;
        setOrganizations(data || []);
      } catch (err) {
        console.error('Error fetching organizations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const textClass = isDark ? 'text-white' : 'text-gray-900';

  return (
    <div className="space-y-2">
      <Label className={textClass}>
        <Building2 className="w-4 h-4 inline mr-2" />
        Organization *
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
        <SelectTrigger className={isDark ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white' : ''}>
          <SelectValue placeholder={loading ? 'Loading...' : 'Select organization'} />
        </SelectTrigger>
        <SelectContent className={isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : ''}>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id} className={isDark ? 'text-white hover:bg-[#2a2a2a]' : ''}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
