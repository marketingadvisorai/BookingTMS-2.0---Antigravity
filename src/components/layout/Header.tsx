import { Search, Bell, ChevronDown, Menu, LogOut, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { useAuth } from '../../lib/auth/AuthContext';
import { toast } from 'sonner';
import avatarImage from 'figma:asset/00e8f72492f468a73fc822a8f3b89537848df6aa.png';

interface HeaderProps {
  onNavigate: (page: string) => void;
  onMobileMenuToggle?: () => void;
}

export function Header({ onNavigate, onMobileMenuToggle }: HeaderProps) {
  const { currentUser, logout } = useAuth();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [desktopSearchQuery, setDesktopSearchQuery] = useState('');
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  // Handle mobile search toggle
  const handleMobileSearchToggle = () => {
    setShowMobileSearch(!showMobileSearch);
  };

  // Handle search functionality with comprehensive keyword matching
  const performSearch = (query: string) => {
    if (!query.trim()) return;
    
    const lowerQuery = query.toLowerCase().trim();
    
    // Define search mappings with keywords
    const searchMappings = [
      // Bookings
      {
        keywords: ['booking', 'reservation', 'appointment', 'schedule', 'calendar', 'book'],
        page: 'bookings',
        message: 'Navigating to Bookings...'
      },
      // Games
      {
        keywords: ['game', 'escape room', 'activity', 'experience', 'room', 'puzzle'],
        page: 'games',
        message: 'Navigating to Games...'
      },
      // Customers
      {
        keywords: ['customer', 'client', 'guest', 'visitor', 'player', 'participant'],
        page: 'customers',
        message: 'Navigating to Customers...'
      },
      // Staff
      {
        keywords: ['staff', 'employee', 'team', 'user', 'member', 'personnel', 'game master', 'gm'],
        page: 'staff',
        message: 'Navigating to Staff...'
      },
      // Venues
      {
        keywords: ['venue', 'location', 'branch', 'site', 'facility', 'place'],
        page: 'venues',
        message: 'Navigating to Venues...'
      },
      // Reports & Analytics
      {
        keywords: ['report', 'analytics', 'statistics', 'stats', 'insights', 'data', 'metrics', 'performance', 'revenue', 'sales'],
        page: 'reports',
        message: 'Navigating to Reports & Analytics...'
      },
      // Marketing
      {
        keywords: ['marketing', 'promotion', 'campaign', 'discount', 'coupon', 'promo', 'gift card', 'voucher', 'email'],
        page: 'marketing',
        message: 'Navigating to Marketing...'
      },
      // Settings
      {
        keywords: ['setting', 'settings', 'configuration', 'config', 'preference', 'option', 'setup', 'account', 'profile', 'password', 'security'],
        page: 'settings',
        message: 'Navigating to Settings...'
      },
      // Waivers
      {
        keywords: ['waiver', 'form', 'consent', 'agreement', 'liability', 'sign', 'signature'],
        page: 'waivers',
        message: 'Navigating to Waivers...'
      },
      // AI Agents
      {
        keywords: ['ai', 'agent', 'bot', 'chatbot', 'assistant', 'automation', 'artificial intelligence'],
        page: 'ai-agents',
        message: 'Navigating to AI Agents...'
      },
      // Widgets
      {
        keywords: ['widget', 'embed', 'integration', 'booking widget', 'calendar widget'],
        page: 'booking-widgets',
        message: 'Navigating to Booking Widgets...'
      },
      // Backend
      {
        keywords: ['backend', 'api', 'database', 'server', 'supabase', 'auth', 'authentication'],
        page: 'backend',
        message: 'Navigating to Backend...'
      },
      // Dashboard
      {
        keywords: ['dashboard', 'home', 'overview', 'summary', 'main'],
        page: 'dashboard',
        message: 'Navigating to Dashboard...'
      },
      // Help & Support
      {
        keywords: ['help', 'support', 'documentation', 'docs', 'guide', 'tutorial', 'faq', 'how to', 'manual'],
        page: 'settings', // Navigate to settings where help might be
        message: 'Opening Help & Support...'
      }
    ];

    // Search for matching keywords
    for (const mapping of searchMappings) {
      if (mapping.keywords.some(keyword => lowerQuery.includes(keyword))) {
        onNavigate(mapping.page);
        toast.success(mapping.message);
        return;
      }
    }

    // If no match found, default to bookings with search query
    onNavigate('bookings');
    toast.info(`Searching for "${query}" in Bookings...`);
  };

  // Handle Enter key press for desktop search
  const handleDesktopKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch(desktopSearchQuery);
      setDesktopSearchQuery('');
    }
  };

  // Auto-focus input when mobile search opens
  useEffect(() => {
    if (showMobileSearch && mobileSearchInputRef.current) {
      // Small delay to ensure the overlay is rendered
      setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 100);
    }
  }, [showMobileSearch]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
      setShowMobileSearch(false);
      setSearchQuery('');
    }
  };

  // Close mobile search on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showMobileSearch) {
        setShowMobileSearch(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showMobileSearch]);

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'manager':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'staff':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  // Format role name
  const formatRole = (role: string) => {
    return role
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  return (
    <header className="h-16 bg-white dark:bg-[#0a0a0a] border-b border-gray-200 dark:border-[#1e1e1e] fixed top-0 right-0 left-0 lg:left-64 z-30 transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-gray-100 dark:hover:bg-[#161616]"
          onClick={onMobileMenuToggle}
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-[#737373]" />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[#737373]" />
            <Input
              type="search"
              placeholder="Search bookings, games, staff..."
              value={desktopSearchQuery}
              onChange={(e) => setDesktopSearchQuery(e.target.value)}
              onKeyPress={handleDesktopKeyPress}
              className="h-10 pl-10 bg-gray-100 border-gray-300 placeholder:text-gray-500 dark:bg-[#161616] dark:border-[#2a2a2a] dark:text-white dark:placeholder:text-[#737373]"
            />
          </div>
        </div>

        {/* Mobile search button */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden hover:bg-gray-100 dark:hover:bg-[#161616]"
          onClick={handleMobileSearchToggle}
        >
          <Search className="w-5 h-5 text-gray-600 dark:text-[#737373]" />
        </Button>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationCenter onNavigate={onNavigate} />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2 sm:px-4 hover:bg-gray-100 dark:hover:bg-[#161616]">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUser?.avatar || avatarImage} />
                  <AvatarFallback className="bg-[#4f46e5] text-white">
                    {currentUser ? getInitials(currentUser.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700 dark:text-white hidden md:inline">
                  {currentUser?.name || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-[#737373] hidden sm:inline" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-white dark:bg-[#1e1e1e] border-gray-200 dark:border-[#2a2a2a]">
              <DropdownMenuLabel className="text-gray-900 dark:text-white">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-gray-600 dark:text-[#737373]">{currentUser?.email || ''}</p>
                  {currentUser?.role && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium w-fit ${getRoleBadgeColor(currentUser.role)}`}>
                      {formatRole(currentUser.role)}
                    </span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-[#2a2a2a]" />
              <DropdownMenuItem 
                onClick={() => onNavigate('myaccount')}
                className="text-gray-700 dark:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#252525] cursor-pointer focus:bg-gray-100 dark:focus:bg-[#252525]"
              >
                My Account
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-[#2a2a2a]" />
              <DropdownMenuItem 
                onClick={() => onNavigate('profile')}
                className="text-gray-700 dark:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#252525] cursor-pointer focus:bg-gray-100 dark:focus:bg-[#252525]"
              >
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onNavigate('billing')}
                className="text-gray-700 dark:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#252525] cursor-pointer focus:bg-gray-100 dark:focus:bg-[#252525]"
              >
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onNavigate('team')}
                className="text-gray-700 dark:text-[#d4d4d4] hover:bg-gray-100 dark:hover:bg-[#252525] cursor-pointer focus:bg-gray-100 dark:focus:bg-[#252525]"
              >
                Team
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200 dark:bg-[#2a2a2a]" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer focus:bg-red-50 dark:focus:bg-red-900/20 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search Overlay - Full Screen */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 sm:hidden bg-white dark:bg-[#0a0a0a] animate-in slide-in-from-top duration-200">
          {/* Search Header */}
          <div className="h-16 border-b border-gray-200 dark:border-[#1e1e1e] flex items-center px-4 gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowMobileSearch(false);
                setSearchQuery('');
              }}
              className="flex-shrink-0 hover:bg-gray-100 dark:hover:bg-[#161616]"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-[#737373]" />
            </Button>
            
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-[#737373]" />
                <Input
                  ref={mobileSearchInputRef}
                  type="search"
                  placeholder="Search bookings, games, staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 h-11 bg-gray-100 border-gray-300 placeholder:text-gray-500 dark:bg-[#161616] dark:border-[#2a2a2a] dark:text-white dark:placeholder:text-[#737373] text-base rounded-lg"
                  autoComplete="off"
                />
              </div>
            </form>
          </div>

          {/* Search Content Area */}
          <div className="p-4 space-y-4">
            {/* Recent Searches */}
            {searchQuery === '' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-[#737373] uppercase tracking-wide">Recent Searches</p>
                <div className="space-y-2">
                  {['Sarah Johnson', 'Mystery Manor', 'Today\'s bookings', 'Pending payments'].map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setSearchQuery(item)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-[#161616] transition-colors flex items-center gap-3"
                    >
                      <Search className="w-4 h-4 text-gray-400 dark:text-[#737373] flex-shrink-0" />
                      <span className="text-gray-900 dark:text-white">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {searchQuery === '' && (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-gray-500 dark:text-[#737373] uppercase tracking-wide">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-4 rounded-lg bg-gray-100 dark:bg-[#161616] text-left hover:bg-gray-200 dark:hover:bg-[#1e1e1e] transition-colors">
                    <div className="text-2xl mb-1">📅</div>
                    <p className="text-sm text-gray-900 dark:text-white">New Booking</p>
                  </button>
                  <button className="p-4 rounded-lg bg-gray-100 dark:bg-[#161616] text-left hover:bg-gray-200 dark:hover:bg-[#1e1e1e] transition-colors">
                    <div className="text-2xl mb-1">👥</div>
                    <p className="text-sm text-gray-900 dark:text-white">Customers</p>
                  </button>
                  <button className="p-4 rounded-lg bg-gray-100 dark:bg-[#161616] text-left hover:bg-gray-200 dark:hover:bg-[#1e1e1e] transition-colors">
                    <div className="text-2xl mb-1">🎮</div>
                    <p className="text-sm text-gray-900 dark:text-white">Games</p>
                  </button>
                  <button className="p-4 rounded-lg bg-gray-100 dark:bg-[#161616] text-left hover:bg-gray-200 dark:hover:bg-[#1e1e1e] transition-colors">
                    <div className="text-2xl mb-1">📊</div>
                    <p className="text-sm text-gray-900 dark:text-white">Reports</p>
                  </button>
                </div>
              </div>
            )}

            {/* Search Results (when typing) */}
            {searchQuery !== '' && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 dark:text-[#737373] uppercase tracking-wide">
                  Results for "{searchQuery}"
                </p>
                <div className="text-center py-12">
                  <Search className="w-12 h-12 mx-auto text-gray-300 dark:text-[#404040] mb-3" />
                  <p className="text-gray-500 dark:text-[#737373]">Press Enter to search</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
