import {
  LayoutDashboard,
  Calendar,
  Gamepad2,
  Users,
  BarChart3,
  Image,
  FileText,
  Code,
  Code2,
  Settings,
  LogOut,
  Megaphone,
  Bot,
  X,
  Tag,
  Shield,
  UserCircle,
  CreditCard,
  Database,
  Server,
  Inbox,
  Building2,
  Crown,
  Layers,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../lib/auth/AuthContext';
import { Permission } from '../../types/auth';

interface SidebarProps {
  currentPage: string;
  onNavigate?: (page: string) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ currentPage, onNavigate = () => { }, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const { hasPermission, isRole, logout } = useAuth();

  // Check admin roles
  const isSystemAdmin = isRole('system-admin');
  const isSuperAdmin = isRole('super-admin');
  const isOrgAdmin = isRole('org-admin');
  const isBetaOwner = isRole('beta-owner');
  const canManageOrgs = isSystemAdmin || isSuperAdmin;
  const isOrgLevelUser = isOrgAdmin || isBetaOwner;

  // Navigation items with permission requirements
  // Items are filtered based on role and permission
  let navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.view' as Permission },
    { id: 'bookings', label: 'Bookings', icon: Calendar, permission: 'bookings.view' as Permission },
    { id: 'events', label: 'Activities', icon: Gamepad2, permission: 'games.view' as Permission },
    { id: 'venues', label: 'Venues', icon: Building2, permission: 'venues.view' as Permission },
    // Organizations - Only for System Admin & Super Admin
    ...(canManageOrgs ? [{
      id: 'organizations',
      label: 'Organizations',
      icon: Layers,
      permission: 'system.view' as Permission,
    }] : []),
    { id: 'widgets', label: 'Booking Widgets', icon: Code, permission: 'widgets.view' as Permission },
    { id: 'embed-pro', label: 'Embed Pro 1.1', icon: Code2, permission: 'widgets.view' as Permission },
    { id: 'customers', label: 'Customers / Guests', icon: UserCircle, permission: 'customers.view' as Permission },
    // System-level items - hide for org-level users
    ...(!isOrgLevelUser ? [
      { id: 'inbox', label: 'Inbox', icon: Inbox, permission: 'dashboard.view' as Permission },
      { id: 'campaigns', label: 'Campaigns', icon: Megaphone, permission: 'campaigns.view' as Permission },
      { id: 'marketing', label: 'Marketing', icon: Tag, permission: 'marketing.view' as Permission },
      { id: 'aiagents', label: 'AI Agents', icon: Bot, permission: 'ai-agents.view' as Permission },
      { id: 'media', label: 'Media / Photos', icon: Image, permission: 'media.view' as Permission },
    ] : []),
    // Show staff only for system/super admins (org admins manage through their org settings)
    ...(!isOrgLevelUser ? [
      { id: 'staff', label: 'Staff', icon: Users, permission: 'staff.view' as Permission },
    ] : []),
    { id: 'reports', label: 'Reports', icon: BarChart3, permission: 'reports.view' as Permission },
    { id: 'waivers', label: 'Waivers', icon: FileText, permission: 'waivers.view' as Permission },
    { id: 'payment-history', label: 'Payments & History', icon: CreditCard, permission: 'payments.view' as Permission },
    { id: 'settings', label: 'Settings', icon: Settings, permission: 'settings.view' as Permission },
  ];

  // Add System Admin Dashboard for system-admin only (Platform-level management)
  if (isSystemAdmin) {
    navItems = [
      {
        id: 'system-admin',
        label: 'System Admin',
        icon: Crown,
        permission: 'system.view' as Permission,
      },
      ...navItems,
    ];
  }

  // Add Backend Dashboard for system-admin and super-admin (includes Database management)
  if (isSystemAdmin || isSuperAdmin) {
    navItems.push({
      id: 'backend-dashboard',
      label: 'Backend Dashboard',
      icon: Server,
      permission: 'accounts.view' as Permission
    });
  }

  // Add Account Settings for super-admin only (org-level settings)
  if (isSuperAdmin) {
    navItems.push({
      id: 'account-settings',
      label: 'Account Settings',
      icon: Shield,
      permission: 'accounts.view' as Permission
    });
  }

  // Filter nav items based on permissions
  const visibleNavItems = navItems.filter(item => hasPermission(item.permission));

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-white dark:bg-[#0a0a0a] border-r border-gray-200 dark:border-[#1e1e1e] flex flex-col h-screen fixed left-0 top-0 z-50
        transform transition-all duration-300 ease-in-out
        lg:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-[#1e1e1e]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 dark:bg-[#4f46e5] rounded-lg flex items-center justify-center transition-colors shadow-lg shadow-blue-500/20 dark:shadow-[#4f46e5]/20">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-900 dark:text-white transition-colors">BookingTMS</span>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onMobileClose}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-[#161616] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-[#737373]" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                  ${isActive
                    ? 'bg-blue-600 dark:bg-[#4f46e5] text-white shadow-lg shadow-blue-500/20 dark:shadow-[#4f46e5]/20'
                    : 'text-gray-600 dark:text-[#737373] hover:bg-gray-100 dark:hover:bg-[#161616] hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-[#1e1e1e]">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-600 dark:text-[#737373] hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#161616] h-11"
            onClick={async () => {
              try {
                await logout();
                onNavigate('login');
              } catch (error) {
                console.error('Logout failed:', error);
              }
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
}
