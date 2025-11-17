import { Search, Bell, Settings, Menu } from 'lucide-react';
import { useTheme } from '../layout/ThemeContext';
import { ThemeToggle } from '../layout/ThemeToggle';
import { AccountSelector } from './AccountSelector';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

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
  onMobileMenuToggle?: () => void;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  notificationCount?: number;
}

export const SystemAdminHeader = ({
  selectedAccount,
  onAccountSelect,
  accounts,
  recentAccounts,
  onMobileMenuToggle,
  onNotificationsClick,
  onSettingsClick,
  notificationCount = 0,
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
        {/* Left Section - Mobile Menu + Account Selector */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuToggle}
            className={`lg:hidden p-2 rounded-lg ${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-100'}`}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Account Selector */}
          <AccountSelector
            selectedAccount={selectedAccount}
            onAccountSelect={onAccountSelect}
            accounts={accounts}
            recentAccounts={recentAccounts}
          />
        </div>

        {/* Center Section - Search Bar (hidden on mobile) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-6">
          <div className="relative w-full">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
            <Input
              type="text"
              placeholder="Search owners, venues, plans..."
              className={`
                pl-10 h-10 border rounded-xl
                ${isDark ? 'bg-[#161616] border-[#333]' : 'bg-gray-100 border-gray-300'}
                ${textClass} placeholder:${mutedTextClass}
              `}
            />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={onNotificationsClick}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${mutedTextClass}`} />
          <Input
            type="text"
            placeholder="Search..."
            className={`
              pl-10 h-10 border rounded-xl
              ${isDark ? 'bg-[#161616] border-[#333]' : 'bg-gray-100 border-gray-300'}
              ${textClass} placeholder:${mutedTextClass}
            `}
          />
        </div>
      </div>
    </header>
  );
};
