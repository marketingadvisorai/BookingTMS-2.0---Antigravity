import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { ThemeProvider } from './components/layout/ThemeContext';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { AuthProvider, useAuth } from './lib/auth/AuthContext';
import { NotificationProvider } from './lib/notifications/NotificationContext';
import { Dashboard } from './pages/Dashboard';
import Inbox from './pages/Inbox';
import { Bookings } from './pages/Bookings';
import { Events } from './pages/Events';
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
import { Organizations } from './pages/Organizations';
import { Settings } from './pages/Settings';
import { MyAccount } from './pages/MyAccount';
import { ProfileSettings } from './pages/ProfileSettings';
import { Account } from './pages/Account';
import { Billing } from './pages/Billing';
import { Team } from './pages/Team';
import { Embed } from './pages/Embed';
import EmbedProPage from './pages/EmbedPro';
import { EmbedProPage as EmbedProWidgetPage } from './modules/embed-pro';
import { CustomerPortalPage } from './modules/customer-portal';
import { AccountSettings } from './pages/AccountSettings';
import { PaymentHistory } from './pages/PaymentHistory';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import BetaLogin from './pages/BetaLogin';
import OrgLogin from './pages/OrgLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BackendDashboard from './pages/BackendDashboard';
import GiftVouchers from './pages/GiftVouchers';
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import { ViewAllOrganizations } from './pages/ViewAllOrganizations';
import UserStripeAccounts from './pages/UserStripeAccounts';
import StripeOAuthCallback from './pages/StripeOAuthCallback';
import { Toaster } from './components/ui/sonner';
import { FeatureFlagProvider } from './lib/featureflags/FeatureFlagContext';
import BookingEngineTest from './pages/BookingEngineTest';

// ============================================================================
// DEVELOPMENT MODE CONFIGURATION
// ============================================================================
// Set DEV_MODE to true to bypass login (auto-login as Super Admin)
// Set DEV_MODE to false to require authentication (production-like behavior)
const DEV_MODE = false; // Changed to false for testing

// Protected App Content Component
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
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

  // Derive current page from URL path
  const getPageFromPath = (path: string) => {
    // Remove trailing slash
    const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

    if (cleanPath === '/' || cleanPath === '/dashboard') return 'dashboard';
    if (cleanPath.startsWith('/system-admin')) return 'system-admin';

    // Handle specific mappings if needed, otherwise use path segment
    const segment = cleanPath.split('/')[1];
    return segment || 'dashboard';
  };

  const currentPage = getPageFromPath(location.pathname);

  const handleNavigate = (page: string) => {
    if (page === 'dashboard') navigate('/dashboard');
    else if (page === 'system-admin') navigate('/system-admin');
    else if (page.startsWith('/')) navigate(page);
    else navigate(`/${page}`);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'inbox':
        return <Inbox />;
      case 'bookings':
        return <Bookings />;
      case 'events':
      case 'service-items': // Alias for events
        return <Events />;
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
      case 'organizations':
        return <Organizations />;
      case 'widgets':
        return <BookingWidgets />;
      case 'embed-pro':
        return <EmbedProPage />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      case 'myaccount':
        return <MyAccount onNavigate={handleNavigate} />;
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
        return <SystemAdminDashboard onNavigate={handleNavigate} />;
      case 'view-all-organizations':
        return <ViewAllOrganizations onBack={() => handleNavigate('system-admin')} />;
      case 'user-stripe-accounts':
        return <UserStripeAccounts />;
      case 'stripe-oauth-callback':
        return <StripeOAuthCallback />;
      case 'gift-vouchers':
        return <GiftVouchers />;
      case 'booking-test':
        return <BookingEngineTest />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
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
      <AdminLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {renderPage()}
      </AdminLayout>
    </NotificationProvider>
  );
}

export default function App() {
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  // Compute mode from current URL - this runs on every render to handle route changes
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname;

  // Check if we're in beta-login mode
  const isBetaLogin = params.has('beta') || path === '/beta-login' || path === '/beta-login/' || params.get('login') === 'beta';

  // Check if we're in org-login mode
  const isOrgLogin = path === '/org-login' || path === '/org-login/';

  // Check if we're in forgot-password mode
  const isForgotPassword = path === '/forgot-password' || path === '/forgot-password/';

  // Check if we're in reset-password mode
  const isResetPassword = path === '/reset-password' || path === '/reset-password/';

  // Check if we're in legacy embed mode
  // Embed mode is ONLY for: /embed with widget params, or /embed?key=xxx for venue widgets
  const isLegacyEmbedMode = (params.has('widget') || params.has('widgetId') || params.has('key')) && 
                            path === '/embed';

  // Check if we're in Embed Pro 2.0 widget mode (customer-facing)
  // /embed-pro?key=xxx bypasses auth and shows the booking widget
  const isEmbedProWidgetMode = path.startsWith('/embed-pro') && params.has('key');

  // Check if we're in customer portal mode (customer-facing, no admin auth)
  const isCustomerPortalMode = path === '/my-bookings' || path === '/my-bookings/' || path === '/customer-portal' || path === '/customer-portal/';

  // Combined embed mode check
  const isEmbedMode = isLegacyEmbedMode || isEmbedProWidgetMode;

  // Skip loading screen for special modes
  useEffect(() => {
    if (isEmbedMode || isBetaLogin || isOrgLogin || isForgotPassword || isResetPassword || isCustomerPortalMode) {
      setShowLoadingScreen(false);
    }
  }, [isEmbedMode, isBetaLogin, isOrgLogin, isForgotPassword, isResetPassword, isCustomerPortalMode]);

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

  // Render org login page
  if (isOrgLogin) {
    return (
      <ThemeProvider>
        <AuthProvider>
          <OrgLogin />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    );
  }

  // Render forgot password page
  if (isForgotPassword) {
    return (
      <ThemeProvider>
        <ForgotPassword />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Render reset password page
  if (isResetPassword) {
    return (
      <ThemeProvider>
        <ResetPassword />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Render Embed Pro 2.0 widget (customer-facing booking widget)
  if (isEmbedProWidgetMode) {
    return (
      <ThemeProvider>
        <EmbedProWidgetPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Render Customer Portal (customer-facing booking management)
  if (isCustomerPortalMode) {
    return (
      <ThemeProvider>
        <CustomerPortalPage />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Render legacy embed mode without admin layout
  if (isLegacyEmbedMode) {
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
