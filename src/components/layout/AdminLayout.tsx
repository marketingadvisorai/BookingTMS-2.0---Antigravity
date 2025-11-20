import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';

interface AdminLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function AdminLayout({ children, currentPage, onNavigate }: AdminLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#161616] transition-colors">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={onNavigate}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <Header 
        onNavigate={onNavigate}
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      <main className="lg:ml-64 pt-16 pb-20 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto">
          {children}
        </div>
      </main>
      <MobileBottomNav 
        currentPage={currentPage}
        onNavigate={onNavigate}
        onMenuOpen={() => setIsMobileSidebarOpen(true)}
      />
    </div>
  );
}
