import { useState, useEffect } from 'react';
import { AdminLayout } from './components/layout/AdminLayout';
import { ThemeProvider } from './components/layout/ThemeContext';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { AuthProvider, useAuth } from './lib/auth/AuthContext';
import { NotificationProvider } from './lib/notifications/NotificationContext';
import { Dashboard } from './pages/Dashboard';
import Inbox from './pages/Inbox';
import { Bookings } from './pages/Bookings';
import { Games } from './pages/Games';
import Customers from './pages/Customers';
import { Campaigns } from './pages/Campaigns';
import { Marketing } from './pages/Marketing';
import { AIAgents } from './pages/AIAgents';
import { Staff } from './pages/Staff';
import { Reports } from './pages/Reports';
import { Media } from './pages/Media';
import { Waivers } from './pages/Waivers';
import { BookingWidgets } from './pages/BookingWidgets';
import Venues from './pages/Venues';
import { Settings } from './pages/Settings';
import { MyAccount } from './pages/MyAccount';
import { ProfileSettings } from './pages/ProfileSettings';
import { Account } from './pages/Account';
import { Billing } from './pages/Billing';
import { Team } from './pages/Team';
import { Embed } from './pages/Embed';
import { AccountSettings } from './pages/AccountSettings';
import { PaymentHistory } from './pages/PaymentHistory';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import BetaLogin from './pages/BetaLogin';
import BackendDashboard from './pages/BackendDashboard';
import GiftVouchers from './pages/GiftVouchers';
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import { ViewAllOrganizations } from './pages/ViewAllOrganizations';
import { Toaster } from './components/ui/sonner';
import { FeatureFlagProvider } from './lib/featureflags/FeatureFlagContext';

// ============================================================================
// DEVELOPMENT MODE CONFIGURATION
// ============================================================================
// Set DEV_MODE to true to bypass login (auto-login as Super Admin)
// Set DEV_MODE to false to require authentication (production-like behavior)
const DEV_MODE = false; // Changed to false to test beta login

// Protected App Content Component
function AppContent() {
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const { currentUser, isLoading, login } = useAuth();

  // Auto-login in DEV_MODE
  useEffect(() => {
    const autoLogin = async () => {
      if (DEV_MODE && !currentUser && !isLoading) {
        try {
          console.log('🔧 DEV MODE: Auto-logging in as Super Admin');
          await login('superadmin', 'demo123', 'super-admin');
        } catch (error) {
          console.error('Auto-login failed:', error);
        }
      }
    };
    autoLogin();
  }, [currentUser, isLoading, login]);

  const effectivePage = currentPage ?? (currentUser?.role === 'system-admin' ? 'system-admin' : 'dashboard');

  const renderPage = () => {
    switch (effectivePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'inbox':
        return <Inbox />;
      case 'bookings':
        return <Bookings />;
      case 'games':
        return <Games onNavigate={setCurrentPage} />;
      case 'customers':
        return <Customers />;
      case 'payment-history':
        return <PaymentHistory />;
      case 'campaigns':
        return <Campaigns />;
      case 'marketing':
        return <Marketing />;
      case 'aiagents':
        return <AIAgents />;
      case 'staff':
        return <Staff />;
      case 'reports':
        return <Reports />;
      case 'media':
        return <Media />;
      case 'waivers':
        return <Waivers />;
      case 'venues':
        return <Venues />;
      case 'widgets':
        return <BookingWidgets />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      case 'myaccount':
        return <MyAccount onNavigate={setCurrentPage} />;
      case 'account':
        return <Account />;
      case 'profile':
        return <ProfileSettings />;
      case 'billing':
        return <Billing />;
      case 'team':
        return <Team />;
      case 'account-settings':
        return <AccountSettings />;
      case 'backend-dashboard':
        return <BackendDashboard />;
      case 'system-admin':
        return <SystemAdminDashboard onNavigate={setCurrentPage} />;
      case 'view-all-organizations':
        return <ViewAllOrganizations onBack={() => setCurrentPage('system-admin')} />;
      case 'gift-vouchers':
        return <GiftVouchers />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading BookingTMS...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated (unless DEV_MODE is enabled)
  if (!currentUser) {
    // In DEV_MODE, show loading screen while auto-login is in progress
    if (DEV_MODE) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Dev Mode: Auto-logging in...</p>
          </div>
        </div>
      );
    }
    return <Login />;
  }

  // Show protected content
  return (
    <NotificationProvider>
      <AdminLayout currentPage={effectivePage} onNavigate={setCurrentPage}>
        {renderPage()}
      </AdminLayout>
    </NotificationProvider>
  );
}

export default function App() {
  const [isEmbedMode, setIsEmbedMode] = useState(false);
  const [isBetaLogin, setIsBetaLogin] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    
    // Check if we're in beta-login mode
    if (params.has('beta') || path === '/beta-login' || path === '/beta-login/' || params.get('login') === 'beta') {
      setIsBetaLogin(true);
      setShowLoadingScreen(false);
      return;
    }

    // Check if we're in embed mode
    if (params.has('widget') || params.has('widgetId') || path.startsWith('/embed')) {
      setIsEmbedMode(true);
      // Skip loading screen for embed mode
      setShowLoadingScreen(false);
      return;
    }
    
    // For normal admin panel, loading screen is shown initially
    // It will be hidden by LoadingScreen component after animation completes
  }, []);

  // Show loading screen on initial load
  if (showLoadingScreen && !isEmbedMode && !isBetaLogin) {
    return (
      <LoadingScreen onLoadingComplete={() => setShowLoadingScreen(false)} />
    );
  }

  // Render beta login page
  if (isBetaLogin) {
    return (
      <ThemeProvider>
        <AuthProvider>
          <BetaLogin />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    );
  }

  // Render embed mode without admin layout
  if (isEmbedMode) {
    return (
      <ThemeProvider>
        <Embed />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Render main app with authentication
  return (
    <ThemeProvider>
      <AuthProvider>
        <FeatureFlagProvider>
          <AppContent />
          <Toaster />
        </FeatureFlagProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
