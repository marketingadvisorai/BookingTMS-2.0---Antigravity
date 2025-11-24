import { useTheme } from '../layout/ThemeContext';
import { AccountSelector } from './AccountSelector';

interface Account {
  id: string;
  name: string;
  company: string;
  phone: string;
  status: 'active' | 'inactive';
  isRecent?: boolean;
}

interface SystemAdminHeaderProps {
  selectedAccount: Account | null;
  onAccountSelect: (account: Account | null) => void;
  accounts: Account[];
  recentAccounts: Account[];
  onAddOrganization?: () => void;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  notificationCount?: number;
}

export const SystemAdminHeader = ({
  selectedAccount,
  onAccountSelect,
  accounts,
  recentAccounts,
  onAddOrganization,
}: SystemAdminHeaderProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Theme classes
  const bgClass = isDark ? 'bg-[#0a0a0a]' : 'bg-white';
  const borderColor = isDark ? 'border-[#1e1e1e]' : 'border-gray-200';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <header className={`${bgClass} border ${borderColor} rounded-xl sticky top-0 z-40`}>
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Account Selector */}
        <div className="flex items-center gap-4">
          <AccountSelector
            selectedAccount={selectedAccount}
            onAccountSelect={onAccountSelect}
            accounts={accounts}
            recentAccounts={recentAccounts}
          />
          <button
            onClick={onAddOrganization}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
            Create Organization
          </button>
        </div>
      </div>
    </header>
  );
};
