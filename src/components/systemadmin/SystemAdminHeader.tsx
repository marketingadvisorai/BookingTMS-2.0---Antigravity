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
}

export const SystemAdminHeader = ({
  selectedAccount,
  onAccountSelect,
  accounts,
  recentAccounts,
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
        </div>
      </div>
    </header>
  );
};
