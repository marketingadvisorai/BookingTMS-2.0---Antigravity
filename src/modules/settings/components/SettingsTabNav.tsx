/**
 * Settings Tab Navigation
 * @module settings/components/SettingsTabNav
 */

import { Building2, CreditCard, Bell, Shield, Palette } from 'lucide-react';
import { SettingsTab } from '../types';

interface SettingsTabNavProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  isDark: boolean;
}

export function SettingsTabNav({ activeTab, onTabChange, isDark }: SettingsTabNavProps) {
  const tabs = [
    { id: 'business' as SettingsTab, label: 'Business Info', icon: Building2 },
    { id: 'payments' as SettingsTab, label: 'Payments', icon: CreditCard },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'appearance' as SettingsTab, label: 'Appearance', icon: Palette },
  ];

  const cardBgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const borderClass = isDark ? 'border-[#2a2a2a]' : 'border-gray-200';

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 ${cardBgClass} border ${borderClass} rounded-lg p-3 sm:p-4`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex flex-col items-center justify-center gap-2 p-4 sm:p-6 rounded-lg border-2 transition-all min-h-[100px]
            ${activeTab === tab.id
              ? isDark
                ? 'bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg'
                : 'bg-blue-600 border-blue-600 text-white shadow-lg'
              : isDark
                ? 'bg-[#1e1e1e] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#4f46e5] hover:text-white'
                : 'bg-white border-gray-300 text-gray-600 hover:border-blue-600 hover:text-gray-900'
            }
          `}
        >
          <tab.icon className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-center whitespace-nowrap">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
