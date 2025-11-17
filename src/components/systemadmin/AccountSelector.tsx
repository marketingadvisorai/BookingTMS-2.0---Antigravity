import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Building2 } from 'lucide-react';
import { useTheme } from '../layout/ThemeContext';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

interface Account {
  id: string;
  name: string;
  company: string;
  phone: string;
  status: 'active' | 'inactive';
  isRecent?: boolean;
  identifier?: string;
  ownerName?: string;
}

interface AccountSelectorProps {
  selectedAccount: Account | null;
  onAccountSelect: (account: Account | null) => void;
  accounts: Account[];
  recentAccounts: Account[];
}

export const AccountSelector = ({ 
  selectedAccount, 
  onAccountSelect, 
  accounts,
  recentAccounts 
}: AccountSelectorProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Theme classes
  const bgClass = isDark ? 'bg-[#161616]' : 'bg-white';
  const hoverBgClass = isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-50';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-[#333]' : 'border-gray-200';
  const activeBg = isDark ? 'bg-[#1a1a1a]' : 'bg-blue-50';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter accounts based on search
  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.phone.includes(searchQuery)
  );

  const handleAccountSelect = (account: Account | null) => {
    onAccountSelect(account);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Account Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-4 py-2.5 rounded-lg border ${borderColor}
          ${bgClass} ${textClass} ${hoverBgClass}
          transition-all duration-200
        `}
      >
        <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">
            {selectedAccount ? selectedAccount.name : 'All Accounts'}
          </span>
          {selectedAccount && (
            <span className={`text-xs ${mutedTextClass}`}>
              {selectedAccount.phone}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`
            absolute top-full left-0 mt-2 w-[1280px] max-h-[520px] overflow-hidden
            ${bgClass} border ${borderColor} rounded-2xl shadow-2xl z-50
          `}
        >
          {/* Search Bar */}
          <div className={`p-4 border-b ${borderColor}`}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
              <Input
                type="text"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`
                  pl-10 h-10 ${bgClass} border ${borderColor} 
                  ${textClass} placeholder:${mutedTextClass}
                `}
              />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="max-h-[480px] overflow-y-auto">
            {/* All Accounts Option */}
            <div className={`p-3 border-b ${borderColor}`}>
              <button
                onClick={() => handleAccountSelect(null)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg
                  ${!selectedAccount ? activeBg : ''}
                  ${hoverBgClass} transition-colors
                `}
              >
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div className="flex-1 flex items-center justify-between gap-4">
                  <div className="text-left">
                    <div className={`text-base font-semibold ${textClass}`}>
                      All Accounts
                    </div>
                    <div className={`text-xs ${mutedTextClass}`}>
                      View all platform data
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${mutedTextClass}`}>
                    PLATFORM
                  </span>
                </div>
              </button>
            </div>

            {/* Recent Accounts */}
            {recentAccounts.length > 0 && !searchQuery && (
              <div className={`p-3 border-b ${borderColor}`}>
                <div className={`text-xs uppercase tracking-wide mb-2 px-3 ${mutedTextClass}`}>
                  Recent
                </div>
                <div className="space-y-1">
                  {recentAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => handleAccountSelect(account)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-lg
                        ${selectedAccount?.id === account.id ? activeBg : ''}
                        ${hoverBgClass} transition-colors
                      `}
                    >
                      <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <div
                        className={`
                          w-2 h-2 rounded-full
                          ${account.status === 'active' ? 'bg-green-500' : 'bg-red-500'}
                        `}
                      />
                      <div className="flex-1 flex items-center justify-between gap-4">
                        <div className="text-left">
                          <div className={`text-sm font-semibold ${textClass} truncate max-w-[420px]`}>
                            {account.name}
                          </div>
                          <div className={`text-xs ${mutedTextClass}`}>
                            {account.ownerName || account.company}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-medium">
                          <span className={`${mutedTextClass}`}>{account.identifier || account.phone}</span>
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 uppercase tracking-wide">
                            {account.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All Accounts List */}
            <div className="p-3">
              <div className={`text-xs uppercase tracking-wide mb-2 px-3 ${mutedTextClass}`}>
                {searchQuery ? 'Search Results' : 'Accounts'}
              </div>
              {filteredAccounts.length > 0 ? (
                <div className="space-y-1">
                  {filteredAccounts.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => handleAccountSelect(account)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-lg
                        ${selectedAccount?.id === account.id ? activeBg : ''}
                        ${hoverBgClass} transition-colors
                      `}
                    >
                      <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <div
                        className={`
                          w-2 h-2 rounded-full
                          ${account.status === 'active' ? 'bg-green-500' : 'bg-red-500'}
                        `}
                      />
                      <div className="flex-1 flex items-center justify-between gap-4">
                        <div className="text-left">
                          <div className={`text-sm font-semibold ${textClass} truncate max-w-[540px]`}>
                            {account.name}
                          </div>
                          <div className={`text-xs ${mutedTextClass}`}>
                            {account.ownerName || account.company}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-medium">
                          <span className={`${mutedTextClass}`}>{account.identifier || account.phone}</span>
                          <Badge variant="outline" className="text-[10px] px-2 py-0.5 uppercase tracking-wide">
                            {account.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 ${mutedTextClass}`}>
                  <Building2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No accounts found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
