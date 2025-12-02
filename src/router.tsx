import { createBrowserRouter, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import VenueProfile from './pages/VenueProfile';
import OwnerAdminLogin from './pages/OwnerAdminLogin';
import OwnerForgotPassword from './pages/OwnerForgotPassword';
import WaiverForm from './pages/WaiverForm';
import { Embed } from './pages/Embed';
import EmbedProWidgetPage from './pages/EmbedProWidgetPage';
import { ThemeProvider } from './components/layout/ThemeContext';
import { WidgetThemeProvider } from './components/widgets/WidgetThemeContext';
import { Toaster } from 'sonner';

// Main router configuration
export const router = createBrowserRouter([
  // System Admin & Main App Routes
  {
    path: '/admin/*',
    element: <App />, // Your existing admin app
  },
  {
    path: '/system-admin/*',
    element: <App />, // System admin routes
  },
  {
    path: '/waiver-form/:id',
    element: (
      <ThemeProvider>
        <WaiverForm />
      </ThemeProvider>
    ),
  },

  // Embed Widget Route (MUST be before /:slug to avoid being caught)
  {
    path: '/embed',
    element: (
      <ThemeProvider>
        <Embed />
        <Toaster />
      </ThemeProvider>
    ),
  },

  // Explicit Admin Routes (to avoid being caught by /:slug)
  {
    path: '/dashboard',
    element: <App />,
  },
  {
    path: '/bookings',
    element: <App />,
  },
  {
    path: '/events',
    element: <App />,
  },
  {
    path: '/service-items',
    element: <App />,
  },
  {
    path: '/payment-history',
    element: <App />,
  },
  {
    path: '/stripe-oauth-callback',
    element: <App />,
  },
  {
    path: '/customers',
    element: <App />,
  },
  {
    path: '/staff',
    element: <App />,
  },
  {
    path: '/reports',
    element: <App />,
  },
  {
    path: '/settings',
    element: <App />,
  },
  {
    path: '/venues',
    element: <App />,
  },
  {
    path: '/inbox',
    element: <App />,
  },
  {
    path: '/campaigns',
    element: <App />,
  },
  {
    path: '/marketing',
    element: <App />,
  },
  // MarketingPro 1.1 - Advanced marketing features
  {
    path: '/marketing-pro',
    element: <App />,
  },
  {
    path: '/aiagents',
    element: <App />,
  },
  {
    path: '/media',
    element: <App />,
  },
  {
    path: '/waivers',
    element: <App />,
  },
  {
    path: '/widgets',
    element: <App />,
  },
  {
    path: '/notifications',
    element: <App />,
  },
  {
    path: '/myaccount',
    element: <App />,
  },
  {
    path: '/account',
    element: <App />,
  },
  {
    path: '/profile',
    element: <App />,
  },
  {
    path: '/billing',
    element: <App />,
  },
  {
    path: '/team',
    element: <App />,
  },
  {
    path: '/account-settings',
    element: <App />,
  },
  {
    path: '/backend-dashboard',
    element: <App />,
  },
  {
    path: '/view-all-organizations',
    element: <App />,
  },
  {
    path: '/user-stripe-accounts',
    element: <App />,
  },
  {
    path: '/gift-vouchers',
    element: <App />,
  },
  {
    path: '/booking-test',
    element: <App />,
  },
  // Organizations route (must be before /:slug to avoid being caught)
  {
    path: '/organizations',
    element: <App />,
  },
  // Embed Pro 1.1 - Admin embed management (must be before /:slug)
  {
    path: '/embed-pro',
    element: <App />,
  },
  // Embed Pro Widget - Public customer-facing booking widget (must be before /:slug)
  {
    path: '/embed-pro-widget',
    element: (
      <ThemeProvider>
        <WidgetThemeProvider>
          <EmbedProWidgetPage />
        </WidgetThemeProvider>
        <Toaster />
      </ThemeProvider>
    ),
  },

  // ============================================================================
  // PUBLIC ROUTES (must be before /:slug to avoid being caught as venue slugs)
  // ============================================================================
  // 
  // ⚠️ IMPORTANT: All new routes MUST be added ABOVE the /:slug route!
  // The /:slug route is a catch-all for venue public pages.
  // If you add a new route AFTER /:slug, it will be treated as a venue slug
  // and show "Venue Not Found" error.
  //
  // When adding new pages, add them here in this section.
  // ============================================================================
  
  // Customer Portal - Public booking management (no admin auth required)
  {
    path: '/my-bookings',
    element: <App />,
  },
  {
    path: '/customer-portal',
    element: <App />,
  },
  
  // Beta Login Route
  {
    path: '/beta-login',
    element: <App />,
  },
  
  // Org Login Route
  {
    path: '/org-login',
    element: <App />,
  },
  
  // Password Reset Routes
  {
    path: '/forgot-password',
    element: <App />,
  },
  {
    path: '/reset-password',
    element: <App />,
  },
  
  // System Admin Login Routes (MUST be before /:slug)
  {
    path: '/system-admin-login',
    element: <App />,
  },
  {
    path: '/admin-login',
    element: <App />,
  },
  
  // Demo Login Route (for testing different roles)
  {
    path: '/demo-login',
    element: <App />,
  },
  
  // API Keys Management (enterprise feature)
  {
    path: '/api-keys',
    element: <App />,
  },

  // Slug-based Public Venue Profile Routes
  {
    path: '/:slug',
    element: (
      <HelmetProvider>
        <ThemeProvider>
          <VenueProfile />
        </ThemeProvider>
      </HelmetProvider>
    ),
  },

  // Slug-based Owner Admin Login
  {
    path: '/:slug/admin',
    element: (
      <HelmetProvider>
        <ThemeProvider>
          <OwnerAdminLogin />
        </ThemeProvider>
      </HelmetProvider>
    ),
  },
  
  // Alternative Owner Admin Login Route
  {
    path: '/:slug/admin/login',
    element: (
      <HelmetProvider>
        <ThemeProvider>
          <OwnerAdminLogin />
        </ThemeProvider>
      </HelmetProvider>
    ),
  },
  
  // Owner Forgot Password (validates email belongs to organization)
  {
    path: '/owner/:slug/forgot-password',
    element: (
      <HelmetProvider>
        <ThemeProvider>
          <OwnerForgotPassword />
        </ThemeProvider>
      </HelmetProvider>
    ),
  },

  // Slug-based Owner Admin Dashboard (after login)
  {
    path: '/:slug/admin/dashboard',
    element: <App />, // Reuse existing app with owner context
  },

  // Fallback to main app
  {
    path: '/',
    element: <App />,
  },

  // 404 catch-all
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    ),
  },
]);
