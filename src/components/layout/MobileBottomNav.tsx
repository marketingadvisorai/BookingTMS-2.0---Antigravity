import { 
  LayoutDashboard, 
  Calendar, 
  Gamepad2, 
  BarChart3,
  Menu,
  Inbox
} from 'lucide-react';

interface MobileBottomNavProps {
  currentPage: string;
  onNavigate?: (page: string) => void;
  onMenuOpen: () => void;
}

export function MobileBottomNav({ currentPage, onNavigate = () => {}, onMenuOpen }: MobileBottomNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'inbox', label: 'Inbox', icon: Inbox },
    { id: 'games', label: 'Events', icon: Gamepad2 },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-[#1e1e1e] safe-area-bottom">
      <nav className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                if (onNavigate) {
                  onNavigate(item.id);
                }
              }}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[64px]
                ${isActive 
                  ? 'bg-blue-600 dark:bg-[#4f46e5] text-white shadow-md shadow-blue-500/20 dark:shadow-[#4f46e5]/20' 
                  : 'text-gray-600 dark:text-[#737373] hover:bg-gray-100 dark:hover:bg-[#161616]'
                }
              `}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
        
        {/* More Menu */}
        <button
          onClick={onMenuOpen}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[64px] text-gray-600 dark:text-[#737373] hover:bg-gray-100 dark:hover:bg-[#161616]"
        >
          <Menu className="w-6 h-6" />
          <span className="text-xs">More</span>
        </button>
      </nav>
    </div>
  );
}
