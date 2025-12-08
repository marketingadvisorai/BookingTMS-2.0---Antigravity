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
import { GuestsPage } from './modules/guests';
import { Campaigns } from './pages/Campaigns';
import { Marketing } from './pages/Marketing';
import { MarketingProPage } from './modules/marketing-pro';
import { AIAgentsWrapper as AIAgents } from './pages/AIAgentsWrapper';
import { StaffPage } from './modules/staff';
import { Reports } from './pages/Reports';
import MediaPage from './pages/MediaPage';
import { WaiversPage } from './modules/waivers';
import { BookingWidgets } from './pages/BookingWidgets';
import Venues from './pages/Venues';
import { Organizations } from './pages/Organizations';
import { SettingsPage } from './modules/settings';
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
import { PaymentHistoryPage } from './modules/payment-history';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import DemoLogin from './pages/DemoLogin';
import BetaLogin from './pages/BetaLogin';
import OrgLogin from './pages/OrgLogin';
import SystemAdminLogin from './pages/SystemAdminLogin';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { supabase } from './lib/supabase/client';
import BackendDashboard from './pages/BackendDashboard';
import GiftVouchers from './pages/GiftVouchers';
import SystemAdminDashboard from './pages/SystemAdminDashboard';
import { ViewAllOrganizations } from './pages/ViewAllOrganizations';
import UserStripeAccounts from './pages/UserStripeAccounts';
import StripeOAuthCallback from './pages/StripeOAuthCallback';
import { Toaster } from './components/ui/sonner';
import { FeatureFlagProvider } from './lib/featureflags/FeatureFlagContext';
import BookingEngineTest from './pages/BookingEngineTest';
import APIKeysPage from './pages/APIKeys';

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
  const authContext = useAuth();
  const { currentUser, isLoading, login } = authContext;
  // Access profileError with type assertion since we added it to the context
  const profileError = (authContext as any).profileError as string | null;
  const [checkingSupabaseSession, setCheckingSupabaseSession] = useState(true);
  const [hasSupabaseSession, setHasSupabaseSession] = useState(false);
  const [profileLoadFailed, setProfileLoadFailed] = useState(false);

  // Check for existing Supabase session on mount and keep it in sync
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setHasSupabaseSession(!!session);
      } catch (err) {
        console.error('Session check error:', err);
      }
      setCheckingSupabaseSession(false);
    };

    checkSession();

    // Keep hasSupabaseSession in sync with auth state (handles logout correctly)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSupabaseSession(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auto-login in DEV_MODE
  useEffect(() => {
    const autoLogin = async () => {
      if (DEV_MODE && !currentUser && !isLoading && !hasSupabaseSession) {
        try {
          console.log('🔧 DEV MODE: Auto-logging in as Super Admin');
          await login('superadmin', 'demo123', 'super-admin');
        } catch (error) {
          console.error('Auto-login failed:', error);
        }
      }
    };
    autoLogin();
  }, [currentUser, isLoading, login, hasSupabaseSession]);

  // Route system-admin to appropriate dashboard
  useEffect(() => {
    if (currentUser && !isLoading) {
      const currentPath = location.pathname;
      
      // System admin should be redirected to /system-admin dashboard if on root/dashboard
      if (currentUser.role === 'system-admin') {
        if (currentPath === '/' || currentPath === '/dashboard') {
          console.log('🔄 Redirecting system-admin to /system-admin dashboard');
          navigate('/system-admin');
        }
      }
      // Super-admin with no org should also go to system-admin
      else if (currentUser.role === 'super-admin' && !currentUser.organizationId) {
        if (currentPath === '/' || currentPath === '/dashboard') {
          console.log('🔄 Redirecting super-admin (no org) to /system-admin');
          navigate('/system-admin');
        }
      }
    }
  }, [currentUser, isLoading, location.pathname, navigate]);

  // Derive current page from URL path
  const getPageFromPath = (path: string) => {
    // Remove trailing slash
    const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;

    if (cleanPath === '/' || cleanPath === '/dashboard') return 'dashboard';
    if (cleanPath.startsWith('/system-admin')) return 'system-admin';
    if (cleanPath.startsWith('/stripe/oauth/callback')) return 'stripe-oauth-callback';

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
      case 'guests':
        return <GuestsPage />;
      case 'payment-history':
        return <PaymentHistoryPage />;
      case 'campaigns':
        return <Campaigns />;
      case 'marketing':
        return <Marketing />;
      case 'marketing-pro':
        return <MarketingProPage />;
      case 'aiagents':
        return <AIAgents />;
      case 'staff':
        return <StaffPage />;
      case 'reports':
        return <Reports />;
      case 'media':
        return <MediaPage />;
      case 'waivers':
        return <WaiversPage />;
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
        return <SettingsPage />;
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
      case 'api-keys':
        return <APIKeysPage />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  // Show loading screen while checking authentication
  if (isLoading || checkingSupabaseSession) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading BookingTMS...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated AND no Supabase session
  // If there's a Supabase session, wait for AuthContext to load the user
  if (!currentUser && !hasSupabaseSession) {
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
    // Redirect to system-admin-login instead of showing demo login modal
    window.location.href = '/system-admin-login';
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If Supabase session exists but currentUser not loaded yet
  if (!currentUser && hasSupabaseSession) {
    // Check if profile loading failed
    if (profileError) {
      const handleLogout = async () => {
        try {
          await supabase.auth.signOut();
          window.location.href = '/system-admin-login';
        } catch (err) {
          console.error('Logout error:', err);
          window.location.href = '/system-admin-login';
        }
      };

      const handleRetry = () => {
        window.location.reload();
      };

      return (
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
          <div className="max-w-md mx-auto p-6 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Profile Loading Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {profileError}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              If you're a system admin, please ensure migration 053 has been applied to the database.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition-colors"
              >
                Retry
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Still loading (no error yet)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#4f46e5] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
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

  // Check if we're in system-admin-login mode
  const isSystemAdminLogin = path === '/system-admin-login' || path === '/system-admin-login/' || path === '/admin-login' || path === '/admin-login/';

  // Check if we're in demo-login mode
  const isDemoLogin = path === '/demo-login' || path === '/demo-login/';

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
    if (isEmbedMode || isBetaLogin || isOrgLogin || isSystemAdminLogin || isDemoLogin || isForgotPassword || isResetPassword || isCustomerPortalMode) {
      setShowLoadingScreen(false);
    }
  }, [isEmbedMode, isBetaLogin, isOrgLogin, isSystemAdminLogin, isDemoLogin, isForgotPassword, isResetPassword, isCustomerPortalMode]);

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

  // Render system admin login page
  if (isSystemAdminLogin) {
    return (
      <ThemeProvider>
        <AuthProvider>
          <SystemAdminLogin />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    );
  }

  // Render demo login page (for testing different roles)
  if (isDemoLogin) {
    return (
      <ThemeProvider>
        <AuthProvider>
          <DemoLogin />
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
